using System.Globalization;
using Microsoft.Extensions.Options;
using SergioApi.Configuration;
using SergioApi.Enums;
using SergioApi.Models.Entities.Suscripciones;
using SergioApi.Models.MercadoPago;
using SergioApi.Repositories.Suscripciones;
using SergioApi.Services.Interfaces.Suscripciones;

namespace SergioApi.Services.Implementations.Suscripciones
{
    public class SincronizadorSuscripciones : ISincronizadorSuscripciones
    {
        /// <summary>
        /// Estado que se envia a Mercado Pago para cancelar. La guia escribe "canceled" y
        /// la referencia "cancelled": pendiente de confirmar en la Fase 0 del plan.
        /// Al LEER se aceptan los dos (ver MapeoEstadoMercadoPago).
        /// </summary>
        public const string EstadoCancelacionMp = "cancelled";

        // Tras este margen, un alta que Mercado Pago no conoce se da por fallida.
        private static readonly TimeSpan MargenRecuperacionAlta = TimeSpan.FromMinutes(30);

        // Un pago aprobado se sigue revisando este tiempo para detectar reembolsos y
        // contracargos, que pueden llegar meses despues.
        private const int DiasRevisionPago = 180;

        // Estados de pago que ya no cambian: no hace falta volver a consultarlos.
        private static readonly string[] EstadosPagoDefinitivos = ["refunded", "charged_back", "rejected", "cancelled"];

        private readonly ISuscripcionRepository _repo;
        private readonly IMercadoPagoClient _mp;
        private readonly IOptions<MercadoPagoOptions> _opciones;
        private readonly ILogger<SincronizadorSuscripciones> _logger;

        public SincronizadorSuscripciones(
            ISuscripcionRepository repo,
            IMercadoPagoClient mp,
            IOptions<MercadoPagoOptions> opciones,
            ILogger<SincronizadorSuscripciones> logger)
        {
            _repo     = repo;
            _mp       = mp;
            _opciones = opciones;
            _logger   = logger;
        }

        // ── Puntos de entrada ─────────────────────────────────────

        public async Task<ResultadoSincronizacion> SincronizarAsync(int suscripcionId, CancellationToken ct = default)
        {
            var usuarioId = await _repo.ObtenerUsuarioIdAsync(suscripcionId, ct);
            if (usuarioId is null) return ResultadoSincronizacion.NoEncontrada;

            await using var transaccion = await _repo.BloquearUsuarioAsync(usuarioId.Value, ct);

            var fila = await _repo.ObtenerConPagosAsync(suscripcionId, ct);
            if (fila is null) return ResultadoSincronizacion.NoEncontrada;

            await SincronizarFilaBloqueadaAsync(fila, ct);
            await transaccion.CommitAsync(ct);
            return ResultadoSincronizacion.Sincronizada;
        }

        public async Task<ResultadoSincronizacion> SincronizarPorPreapprovalAsync(
            string preapprovalId, CancellationToken ct = default)
        {
            var suscripcionId = await _repo.BuscarIdPorPreapprovalAsync(preapprovalId, ct);

            if (suscripcionId is null)
            {
                // Puede llegar antes de que el alta guarde el id del preapproval: se
                // resuelve por external_reference, que es el Id de nuestra fila.
                var preapproval = await _mp.ObtenerPreapprovalAsync(preapprovalId, ct);
                if (int.TryParse(preapproval?.ExternalReference, NumberStyles.None, CultureInfo.InvariantCulture, out var referencia)
                    && await _repo.ExisteAsync(referencia, ct))
                {
                    _logger.LogInformation(
                        "Preapproval {PreapprovalId} resuelto por external_reference hacia la suscripcion {Id}.",
                        preapprovalId, referencia);
                    suscripcionId = referencia;
                }
            }

            return suscripcionId is null
                ? ResultadoSincronizacion.NoEncontrada
                : await SincronizarAsync(suscripcionId.Value, ct);
        }

        public async Task<ResultadoSincronizacion> SincronizarPorCobroAsync(
            long authorizedPaymentId, CancellationToken ct = default)
        {
            var suscripcionId = await _repo.BuscarIdPorCobroAsync(authorizedPaymentId, ct);
            if (suscripcionId is not null)
                return await SincronizarAsync(suscripcionId.Value, ct);

            // Cobro aun no registrado: se enlaza a traves de su preapproval.
            var cobro = await _mp.ObtenerCobroAsync(authorizedPaymentId, ct);

            if (cobro?.PreapprovalId is { Length: > 0 } preapprovalId)
                return await SincronizarPorPreapprovalAsync(preapprovalId, ct);

            if (int.TryParse(cobro?.ExternalReference, NumberStyles.None, CultureInfo.InvariantCulture, out var referencia)
                && await _repo.ExisteAsync(referencia, ct))
                return await SincronizarAsync(referencia, ct);

            return ResultadoSincronizacion.NoEncontrada;
        }

        public async Task<ResultadoSincronizacion> SincronizarPorPagoAsync(long paymentId, CancellationToken ct = default)
        {
            var suscripcionId = await _repo.BuscarIdPorPagoAsync(paymentId, ct);
            return suscripcionId is null
                ? ResultadoSincronizacion.NoEncontrada
                : await SincronizarAsync(suscripcionId.Value, ct);
        }

        // ── Nucleo ────────────────────────────────────────────────

        public async Task SincronizarFilaBloqueadaAsync(Suscripcion fila, CancellationToken ct = default)
        {
            var ahora    = DateTimeOffset.UtcNow;
            var opciones = _opciones.Value;

            var preapproval = await ObtenerPreapprovalDeFilaAsync(fila, ct);

            if (preapproval is null || preapproval.Id is null)
            {
                // Alta cuya respuesta nunca llego y que Mercado Pago tampoco conoce: pasado
                // un margen se da por fallida, para que no bloquee una nueva alta.
                if (fila.Estado == EstadoSuscripcion.PendientePago
                    && fila.MercadoPagoPreapprovalId is null
                    && fila.FechaCreacion < ahora - MargenRecuperacionAlta)
                {
                    _logger.LogWarning(
                        "Suscripcion {Id}: Mercado Pago no tiene ningun preapproval con esa referencia. Se marca como ErrorCreacion.",
                        fila.Id);
                    fila.Estado = EstadoSuscripcion.ErrorCreacion;
                }

                fila.UltimaSincronizacion = ahora;
                await _repo.GuardarAsync(ct);
                await _repo.ActualizarAccesoUsuarioAsync(fila.UsuarioId, ahora, ct);
                return;
            }

            AplicarPreapproval(fila, preapproval, ahora);
            await SincronizarCobrosAsync(fila, preapproval.Id, ahora, ct);
            RecalcularAcceso(fila, opciones);
            fila.UltimaSincronizacion = ahora;

            await _repo.GuardarAsync(ct);
            await ResolverAutorizadasDuplicadasAsync(fila.UsuarioId, ct);
            await _repo.ActualizarAccesoUsuarioAsync(fila.UsuarioId, ahora, ct);
        }

        public async Task<bool> CancelarEnMercadoPagoBloqueadaAsync(
            Suscripcion fila, EstadoSuscripcion estadoFinal, string canceladaPor, CancellationToken ct = default)
        {
            var ahora = DateTimeOffset.UtcNow;
            var preapproval = await ObtenerPreapprovalDeFilaAsync(fila, ct);

            if (preapproval?.Id is { } id)
            {
                // Abandonar solo tiene sentido si nadie pago. Si Mercado Pago ya la
                // autorizo, el usuario pago el enlace a ultima hora: cancelarla le
                // cobraria sin darle acceso.
                if (estadoFinal == EstadoSuscripcion.Abandonada && MapeoEstadoMercadoPago.EstaAutorizada(preapproval.Status))
                {
                    _logger.LogInformation(
                        "Suscripcion {Id}: se iba a abandonar pero Mercado Pago ya la autorizo. No se cancela.", fila.Id);
                    return false;
                }

                if (!MapeoEstadoMercadoPago.EstaCancelada(preapproval.Status))
                    await _mp.ActualizarEstadoPreapprovalAsync(id, EstadoCancelacionMp, ct);

                // Se confirma con una lectura. Marcarla como cancelada sin confirmarlo, si
                // Mercado Pago hubiera fallado, haria que la interfaz dijera "cancelada"
                // mientras se sigue cobrando.
                var confirmado = await _mp.ObtenerPreapprovalAsync(id, ct);
                if (confirmado is null || !MapeoEstadoMercadoPago.EstaCancelada(confirmado.Status))
                {
                    _logger.LogError(
                        "Suscripcion {Id}: Mercado Pago no confirmo la cancelacion del preapproval {PreapprovalId} (estado '{Estado}').",
                        fila.Id, id, confirmado?.Status);
                    return false;
                }

                fila.EstadoMercadoPago = confirmado.Status;
                if (confirmado.JsonCrudo is not null) fila.UltimoPayloadMp = confirmado.JsonCrudo;
            }
            else if (fila.Estado == EstadoSuscripcion.PendientePago)
            {
                // Mercado Pago no conoce esta alta: no hay nada que cancelar alli.
                estadoFinal = EstadoSuscripcion.ErrorCreacion;
            }

            fila.Estado             = estadoFinal;
            fila.FechaCancelacion ??= ahora;
            fila.CanceladaPor     ??= canceladaPor;

            // Ya no esta autorizada: se pierde la gracia, pero lo pagado se respeta.
            RecalcularAcceso(fila, _opciones.Value);
            fila.UltimaSincronizacion = ahora;

            await _repo.GuardarAsync(ct);
            await _repo.ActualizarAccesoUsuarioAsync(fila.UsuarioId, ahora, ct);
            return true;
        }

        // ── Pasos internos ────────────────────────────────────────

        private async Task<PreapprovalMp?> ObtenerPreapprovalDeFilaAsync(Suscripcion fila, CancellationToken ct)
        {
            if (fila.MercadoPagoPreapprovalId is not null)
            {
                var preapproval = await _mp.ObtenerPreapprovalAsync(fila.MercadoPagoPreapprovalId, ct);
                if (preapproval is null)
                    _logger.LogWarning(
                        "Suscripcion {Id}: Mercado Pago no encuentra el preapproval {PreapprovalId}.",
                        fila.Id, fila.MercadoPagoPreapprovalId);
                return preapproval;
            }

            // Alta cuya respuesta se perdio (timeout): se busca por external_reference.
            var encontrado = await _mp.BuscarPreapprovalPorReferenciaAsync(
                fila.Id.ToString(CultureInfo.InvariantCulture), ct);
            if (encontrado?.Id is not { } id) return null;

            _logger.LogInformation(
                "Suscripcion {Id}: recuperado el preapproval {PreapprovalId} por external_reference.", fila.Id, id);
            fila.MercadoPagoPreapprovalId = id;

            return await _mp.ObtenerPreapprovalAsync(id, ct) ?? encontrado;
        }

        private void AplicarPreapproval(Suscripcion fila, PreapprovalMp preapproval, DateTimeOffset ahora)
        {
            fila.EstadoMercadoPago = preapproval.Status;
            fila.InitPoint       ??= preapproval.InitPoint;
            fila.FechaProximoCobro = FechasMp.Parsear(preapproval.NextPaymentDate);
            if (preapproval.JsonCrudo is not null) fila.UltimoPayloadMp = preapproval.JsonCrudo;

            if (preapproval.AutoRecurring is { } recurrencia)
            {
                if (recurrencia.Frequency is > 0) fila.FrecuenciaCobro = recurrencia.Frequency.Value;
                if (recurrencia.FrequencyType is "days" or "months") fila.TipoFrecuenciaCobro = recurrencia.FrequencyType;

                if (recurrencia.TransactionAmount is { } monto && monto != fila.Monto)
                    _logger.LogWarning(
                        "Suscripcion {Id}: Mercado Pago tiene un monto de {MontoMp} y la fila {Monto}.",
                        fila.Id, monto, fila.Monto);

                if (recurrencia.CurrencyId is { } moneda && !string.Equals(moneda, fila.Moneda, StringComparison.OrdinalIgnoreCase))
                    _logger.LogWarning(
                        "Suscripcion {Id}: Mercado Pago cobra en {MonedaMp} y la fila dice {Moneda}.",
                        fila.Id, moneda, fila.Moneda);
            }

            var estado = MapeoEstadoMercadoPago.Mapear(preapproval.Status);
            if (estado is null)
            {
                _logger.LogWarning(
                    "Suscripcion {Id}: estado de Mercado Pago desconocido '{Estado}'. No se toca el estado local.",
                    fila.Id, preapproval.Status);
                return;
            }

            // Nunca se vuelve a PendientePago desde aqui: ese estado solo lo crea el alta.
            // Si otra fila del usuario estuviera pendiente, el indice unico parcial
            // rechazaria el cambio y la sincronizacion fallaria en bucle.
            if (estado == EstadoSuscripcion.PendientePago) return;

            // Una pendiente que cancelamos nosotros por abandono sigue siendo "Abandonada".
            if (estado == EstadoSuscripcion.Cancelada && fila.Estado == EstadoSuscripcion.Abandonada) return;

            if (estado == EstadoSuscripcion.Activa)
                fila.FechaAutorizacion ??= ahora;

            if (estado == EstadoSuscripcion.Cancelada && fila.Estado != EstadoSuscripcion.Cancelada)
            {
                fila.FechaCancelacion ??= ahora;
                fila.CanceladaPor     ??= "MercadoPago";
            }

            fila.Estado = estado.Value;
        }

        private async Task SincronizarCobrosAsync(
            Suscripcion fila, string preapprovalId, DateTimeOffset ahora, CancellationToken ct)
        {
            var cobros = await _mp.BuscarCobrosAsync(preapprovalId, ct);

            foreach (var cobro in cobros)
            {
                if (cobro.Id is not { } cobroId) continue;

                var pago = fila.Pagos.FirstOrDefault(p => p.MercadoPagoAuthorizedPaymentId == cobroId);
                if (pago is null)
                {
                    pago = new PagoSuscripcion { MercadoPagoAuthorizedPaymentId = cobroId };
                    fila.Pagos.Add(pago);
                }

                pago.EstadoFactura        = cobro.Status ?? pago.EstadoFactura;
                pago.Monto                = cobro.TransactionAmount ?? pago.Monto;
                pago.Moneda               = cobro.CurrencyId ?? pago.Moneda;
                pago.FechaCobroProgramada = FechasMp.Parsear(cobro.DebitDate) ?? pago.FechaCobroProgramada;
                pago.Intento              = cobro.RetryAttempt ?? pago.Intento;
                pago.FechaActualizacion   = ahora;

                if (cobro.Payment?.Id is not { } paymentId)
                {
                    pago.EstadoPago ??= cobro.Payment?.Status;
                    continue;
                }

                pago.MercadoPagoPaymentId = paymentId;

                if (!DebeRevisarPago(pago, ahora)) continue;

                // El estado de la factura ("processed") es ambiguo; el del pago no.
                var detalle = await _mp.ObtenerPagoAsync(paymentId, ct);
                pago.EstadoPago      = detalle?.Status ?? cobro.Payment.Status ?? pago.EstadoPago;
                pago.FechaAprobacion = FechasMp.Parsear(detalle?.DateApproved) ?? pago.FechaAprobacion;

                if (detalle?.TransactionAmount is { } montoPago && montoPago != fila.Monto)
                    _logger.LogWarning(
                        "Suscripcion {Id}: el pago {PagoId} fue de {MontoPago} y la suscripcion es de {Monto}.",
                        fila.Id, paymentId, montoPago, fila.Monto);
            }
        }

        private static bool DebeRevisarPago(PagoSuscripcion pago, DateTimeOffset ahora)
        {
            if (pago.EstadoPago is null) return true;
            if (EstadosPagoDefinitivos.Contains(pago.EstadoPago, StringComparer.OrdinalIgnoreCase)) return false;

            if (CalculadoraAcceso.EsPagoAprobado(pago.EstadoPago))
                return pago.FechaAprobacion is null || pago.FechaAprobacion > ahora.AddDays(-DiasRevisionPago);

            return true;   // pending, in_process...: todavia puede cambiar
        }

        private static void RecalcularAcceso(Suscripcion fila, MercadoPagoOptions opciones)
        {
            fila.PeriodoPagadoHasta = CalculadoraAcceso.PeriodoPagadoHasta(
                fila.Pagos.Select(p => new CobroParaAcceso(p.FechaAprobacion, p.EstadoPago)),
                fila.FrecuenciaCobro,
                fila.TipoFrecuenciaCobro);

            fila.AccesoHasta = CalculadoraAcceso.AccesoHasta(
                fila.PeriodoPagadoHasta,
                MapeoEstadoMercadoPago.EstaAutorizada(fila.EstadoMercadoPago),
                opciones.DiasGracia,
                fila.FechaAutorizacion,
                opciones.AccesoProvisionalHoras);
        }

        /// <summary>
        /// Dos suscripciones autorizadas a la vez para un mismo usuario significan cobro
        /// doble. Se conserva la que tenga cobros aprobados (o la mas antigua) y se cancela
        /// cualquier otra que no tenga ninguno. Si varias tienen cobros, solo se avisa: esa
        /// decision la tiene que tomar una persona.
        /// </summary>
        private async Task ResolverAutorizadasDuplicadasAsync(int usuarioId, CancellationToken ct)
        {
            var activas = await _repo.ListarActivasConPagosAsync(usuarioId, ct);
            if (activas.Count <= 1) return;

            _logger.LogCritical(
                "El usuario {UsuarioId} tiene {Cantidad} suscripciones autorizadas a la vez: riesgo de cobro doble.",
                usuarioId, activas.Count);

            static int Aprobados(Suscripcion s) => s.Pagos.Count(p => CalculadoraAcceso.EsPagoAprobado(p.EstadoPago));

            var conservar = activas
                .OrderByDescending(Aprobados)
                .ThenBy(s => s.FechaCreacion)
                .First();

            foreach (var sobrante in activas.Where(s => s.Id != conservar.Id && Aprobados(s) == 0))
                await CancelarEnMercadoPagoBloqueadaAsync(sobrante, EstadoSuscripcion.Cancelada, "Sistema", ct);
        }
    }
}
