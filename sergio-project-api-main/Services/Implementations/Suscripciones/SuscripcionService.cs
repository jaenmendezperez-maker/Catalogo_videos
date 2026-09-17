using System.Globalization;
using Microsoft.Extensions.Options;
using SergioApi.Configuration;
using SergioApi.Enums;
using SergioApi.Exceptions;
using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Suscripciones;
using SergioApi.Models.Entities.Suscripciones;
using SergioApi.Models.MercadoPago;
using SergioApi.Repositories;
using SergioApi.Repositories.Suscripciones;
using SergioApi.Services.Interfaces.Suscripciones;
using SergioApi.Utils;

namespace SergioApi.Services.Implementations.Suscripciones
{
    public class SuscripcionService : ISuscripcionService
    {
        // Estados en los que Mercado Pago todavia podria cobrar, y por tanto cancelables.
        private static readonly EstadoSuscripcion[] EstadosCancelables =
        [
            EstadoSuscripcion.PendientePago,
            EstadoSuscripcion.Activa,
            EstadoSuscripcion.Pausada,
            EstadoSuscripcion.Suspendida,
        ];

        private readonly ISuscripcionRepository _repo;
        private readonly IUsuarioRepository _usuarioRepo;
        private readonly ISincronizadorSuscripciones _sincronizador;
        private readonly IMercadoPagoClient _mp;
        private readonly IOptions<MercadoPagoOptions> _opciones;
        private readonly ILogger<SuscripcionService> _logger;

        public SuscripcionService(
            ISuscripcionRepository repo,
            IUsuarioRepository usuarioRepo,
            ISincronizadorSuscripciones sincronizador,
            IMercadoPagoClient mp,
            IOptions<MercadoPagoOptions> opciones,
            ILogger<SuscripcionService> logger)
        {
            _repo          = repo;
            _usuarioRepo   = usuarioRepo;
            _sincronizador = sincronizador;
            _mp            = mp;
            _opciones      = opciones;
            _logger        = logger;
        }

        // ─────────────────────────────────────────
        // ALTA
        // ─────────────────────────────────────────

        public async Task<SuscripcionCreadaDto> CrearAsync(
            int usuarioId, CrearSuscripcionDto? dto, CancellationToken ct = default)
        {
            var opciones = _opciones.Value;
            if (!opciones.EstaConfigurado)
                throw new ServicioExternoException("Los pagos no están configurados en este servidor.");

            var usuario = await _usuarioRepo.GetByIdAsync(usuarioId)
                ?? throw new UnauthorizedAccessException("Usuario no encontrado.");

            var correoPagador = NormalizadorCorreo.Normalizar(dto?.CorreoMercadoPago ?? usuario.Correo);
            var ahora = DateTimeOffset.UtcNow;

            // 1. Bajo candado: decidir si se reutiliza, se rechaza o se crea una fila nueva.
            Suscripcion fila;
            await using (var transaccion = await _repo.BloquearUsuarioAsync(usuarioId, ct))
            {
                var existentes = await _repo.ListarDeUsuarioAsync(usuarioId, soloLectura: false, ct);

                // Antes de decidir se refrescan las pendientes: el usuario pudo pagar un
                // enlace anterior hace un momento y ya estar autorizado.
                foreach (var pendiente in existentes.Where(s => s.Estado == EstadoSuscripcion.PendientePago))
                    await _sincronizador.SincronizarFilaBloqueadaAsync(pendiente, ct);

                if (existentes.Any(s => s.Estado == EstadoSuscripcion.Activa))
                {
                    await transaccion.CommitAsync(ct);
                    throw new ConflictoException("Ya tienes una suscripción activa.");
                }

                var reutilizable = existentes.FirstOrDefault(s =>
                    s.Estado == EstadoSuscripcion.PendientePago
                    && s.CorreoPagador == correoPagador
                    && s.FechaCreacion > ahora.AddHours(-opciones.HorasCaducidadPendiente));

                if (reutilizable?.InitPoint is not null)
                {
                    await transaccion.CommitAsync(ct);
                    return Creada(reutilizable);
                }

                // Cualquier otra que Mercado Pago aun pueda cobrar se cancela ANTES de crear
                // una nueva: un enlace de pago viejo sigue siendo pagable y el usuario
                // podria acabar autorizando dos suscripciones (cobro doble).
                foreach (var anterior in existentes.Where(s => s != reutilizable && EstadosCancelables.Contains(s.Estado)))
                {
                    var estadoFinal = anterior.Estado == EstadoSuscripcion.PendientePago
                        ? EstadoSuscripcion.Abandonada
                        : EstadoSuscripcion.Cancelada;

                    if (!await _sincronizador.CancelarEnMercadoPagoBloqueadaAsync(anterior, estadoFinal, "Sistema", ct))
                        throw new ServicioExternoException(
                            "No se pudo cancelar una suscripción anterior en Mercado Pago. Intenta de nuevo en unos minutos.");
                }

                // Una pendiente sin enlace es un alta cuya respuesta se perdio: se reintenta
                // sobre la MISMA fila, con la misma clave de idempotencia.
                fila = reutilizable ?? new Suscripcion
                {
                    UsuarioId           = usuarioId,
                    CorreoPagador       = correoPagador,
                    Estado              = EstadoSuscripcion.PendientePago,
                    Monto               = opciones.PrecioMensual,
                    Moneda              = opciones.Moneda,
                    FrecuenciaCobro     = opciones.PeriodoFrecuencia,
                    TipoFrecuenciaCobro = opciones.TipoFrecuencia,
                    FechaCreacion       = ahora,
                };

                if (reutilizable is null) _repo.Agregar(fila);

                // Se confirma ANTES de llamar a Mercado Pago: el Id de la fila viaja como
                // external_reference, asi que la fila tiene que existir aunque la llamada
                // se corte a medias.
                await _repo.GuardarAsync(ct);
                await transaccion.CommitAsync(ct);
            }

            // 2. Fuera del candado: crear el preapproval en Mercado Pago.
            var creado = await _mp.CrearPreapprovalAsync(
                await ConstruirSolicitudAsync(fila, usuarioId, opciones, ahora, ct),
                claveIdempotencia: $"suscripcion-{fila.Id}",
                ct);

            // 3. Bajo candado otra vez: guardar el id y el enlace.
            await using (var transaccion = await _repo.BloquearUsuarioAsync(usuarioId, ct))
            {
                var actual = await _repo.ObtenerConPagosAsync(fila.Id, ct)
                    ?? throw new KeyNotFoundException("La suscripción desapareció durante el alta.");

                // Si un webhook muy rapido ya relleno otro id, hay dos preapprovals para una
                // misma fila. No deberia pasar gracias a la clave de idempotencia.
                if (actual.MercadoPagoPreapprovalId is not null && actual.MercadoPagoPreapprovalId != creado.Id)
                    _logger.LogCritical(
                        "Suscripcion {Id}: Mercado Pago devolvio el preapproval {Nuevo} pero ya tenia {Anterior}.",
                        actual.Id, creado.Id, actual.MercadoPagoPreapprovalId);

                actual.MercadoPagoPreapprovalId ??= creado.Id;
                actual.InitPoint                  = creado.InitPoint ?? actual.InitPoint;
                actual.EstadoMercadoPago          = creado.Status ?? actual.EstadoMercadoPago;
                if (creado.JsonCrudo is not null) actual.UltimoPayloadMp = creado.JsonCrudo;

                await _repo.GuardarAsync(ct);
                await transaccion.CommitAsync(ct);

                if (actual.InitPoint is null)
                    throw new ServicioExternoException("Mercado Pago no devolvió el enlace de pago.");

                return Creada(actual);
            }
        }

        private async Task<CrearPreapprovalMp> ConstruirSolicitudAsync(
            Suscripcion fila, int usuarioId, MercadoPagoOptions opciones, DateTimeOffset ahora, CancellationToken ct)
        {
            // Si aun tiene tiempo pagado (se resuscribe tras cancelar), el primer cobro se
            // programa al terminar ese periodo, para no cobrar dias que ya pago. Sin tiempo
            // pagado no se envia start_date y Mercado Pago cobra en el momento. Asi el cuerpo
            // es identico en cada reintento, como exige la clave de idempotencia.
            // Pendiente de confirmar en la Fase 0 que acepta un start_date futuro.
            var pagadoHasta = await _repo.MaxPeriodoPagadoAsync(usuarioId, ct);
            var inicioDiferido = pagadoHasta is { } fin && fin > ahora.AddMinutes(5) ? fin : (DateTimeOffset?)null;

            return new CrearPreapprovalMp
            {
                Reason            = opciones.Razon,
                ExternalReference = fila.Id.ToString(CultureInfo.InvariantCulture),
                PayerEmail        = fila.CorreoPagador,
                BackUrl           = opciones.BackUrl,
                AutoRecurring     = new AutoRecurringMp
                {
                    Frequency         = fila.FrecuenciaCobro,
                    FrequencyType     = fila.TipoFrecuenciaCobro,
                    StartDate         = inicioDiferido is null ? null : FechasMp.Formatear(inicioDiferido.Value),
                    TransactionAmount = fila.Monto,
                    CurrencyId        = fila.Moneda,
                },
            };
        }

        // ─────────────────────────────────────────
        // CONSULTA, CANCELACION Y SINCRONIZACION DEL USUARIO
        // ─────────────────────────────────────────

        public async Task<MiSuscripcionDto> ObtenerMiaAsync(int usuarioId, CancellationToken ct = default)
        {
            var ahora       = DateTimeOffset.UtcNow;
            var vencimiento = await _repo.ObtenerVencimientoPremiumAsync(usuarioId, ct);
            var filas       = await _repo.ListarDeUsuarioAsync(usuarioId, soloLectura: true, ct);
            var fila        = ElegirRelevante(filas, ahora);

            return new MiSuscripcionDto
            {
                SuscripcionId      = fila?.Id,
                Estado             = fila?.Estado.ToString() ?? "SinSuscripcion",
                TieneAcceso        = AccesoPremium.EstaVigente(vencimiento, ahora),
                AccesoHasta        = vencimiento,
                PeriodoPagadoHasta = fila?.PeriodoPagadoHasta,
                FechaProximoCobro  = fila?.FechaProximoCobro,
                Monto              = fila?.Monto,
                Moneda             = fila?.Moneda,

                // Autorizada pero sin ningun cobro aprobado: "procesando tu pago".
                PrimerCobroPendiente = fila is { Estado: EstadoSuscripcion.Activa }
                                       && !fila.Pagos.Any(p => CalculadoraAcceso.EsPagoAprobado(p.EstadoPago)),

                CanceladaConAccesoVigente = fila is { Estado: EstadoSuscripcion.Cancelada }
                                            && AccesoPremium.EstaVigente(fila.AccesoHasta, ahora),

                InitPoint = fila is { Estado: EstadoSuscripcion.PendientePago } ? fila.InitPoint : null,
            };
        }

        public async Task<MiSuscripcionDto> CancelarMiaAsync(int usuarioId, CancellationToken ct = default)
        {
            await using (var transaccion = await _repo.BloquearUsuarioAsync(usuarioId, ct))
            {
                var vivas = (await _repo.ListarDeUsuarioAsync(usuarioId, soloLectura: false, ct))
                    .Where(s => EstadosCancelables.Contains(s.Estado))
                    .ToList();

                if (vivas.Count == 0)
                    throw new KeyNotFoundException("No tienes ninguna suscripción que cancelar.");

                // Se cancelan TODAS las vivas (normalmente una). Dejar alguna viva seria
                // dejar a Mercado Pago cobrando.
                foreach (var viva in vivas)
                {
                    var estadoFinal = viva.Estado == EstadoSuscripcion.PendientePago
                        ? EstadoSuscripcion.Abandonada
                        : EstadoSuscripcion.Cancelada;

                    if (!await _sincronizador.CancelarEnMercadoPagoBloqueadaAsync(viva, estadoFinal, "Usuario", ct))
                        throw new ServicioExternoException(
                            "Mercado Pago no confirmó la cancelación. Intenta de nuevo en unos minutos.");
                }

                await transaccion.CommitAsync(ct);
            }

            return await ObtenerMiaAsync(usuarioId, ct);
        }

        public async Task<MiSuscripcionDto> SincronizarMiaAsync(int usuarioId, CancellationToken ct = default)
        {
            var ahora = DateTimeOffset.UtcNow;

            // Las vivas y las canceladas recientemente (un reembolso tardio puede cambiar
            // su periodo pagado).
            var ids = (await _repo.ListarDeUsuarioAsync(usuarioId, soloLectura: true, ct))
                .Where(s => EstadosCancelables.Contains(s.Estado)
                         || (s.Estado == EstadoSuscripcion.Cancelada && s.FechaCancelacion > ahora.AddDays(-7)))
                .Select(s => s.Id)
                .ToList();

            foreach (var id in ids)
                await _sincronizador.SincronizarAsync(id, ct);

            return await ObtenerMiaAsync(usuarioId, ct);
        }

        // ─────────────────────────────────────────
        // ADMIN
        // ─────────────────────────────────────────

        public async Task<PaginadoDto<SuscripcionAdminDto>> ListarAdminAsync(
            PaginacionParametrosDto parametros, EstadoSuscripcion? estado, CancellationToken ct = default)
        {
            var (datos, total) = await _repo.ListarPaginadoAsync(parametros, estado, ct);

            return new PaginadoDto<SuscripcionAdminDto>
            {
                Datos     = datos.Select(MapearAdmin).ToList(),
                Total     = total,
                Pagina    = parametros.Pagina,
                PorPagina = parametros.PorPagina,
            };
        }

        public async Task<SuscripcionAdminDto> SincronizarAdminAsync(int suscripcionId, CancellationToken ct = default)
        {
            if (await _sincronizador.SincronizarAsync(suscripcionId, ct) == ResultadoSincronizacion.NoEncontrada)
                throw new KeyNotFoundException($"Suscripción {suscripcionId} no encontrada.");

            var fila = await _repo.ObtenerAdminAsync(suscripcionId, ct)
                ?? throw new KeyNotFoundException($"Suscripción {suscripcionId} no encontrada.");

            return MapearAdmin(fila);
        }

        // ─────────────────────────────────────────
        // MANTENIMIENTO
        // ─────────────────────────────────────────

        public async Task<bool> AbandonarPendienteAsync(int suscripcionId, CancellationToken ct = default)
        {
            var usuarioId = await _repo.ObtenerUsuarioIdAsync(suscripcionId, ct);
            if (usuarioId is null) return false;

            await using var transaccion = await _repo.BloquearUsuarioAsync(usuarioId.Value, ct);

            var fila = await _repo.ObtenerConPagosAsync(suscripcionId, ct);
            if (fila is null || fila.Estado != EstadoSuscripcion.PendientePago) return false;

            // Primero se refresca: si la pagaron a ultima hora ya estara autorizada y no se
            // toca. Cancelarla le cobraria al usuario sin darle acceso.
            await _sincronizador.SincronizarFilaBloqueadaAsync(fila, ct);

            var abandonada = fila.Estado == EstadoSuscripcion.PendientePago
                && await _sincronizador.CancelarEnMercadoPagoBloqueadaAsync(
                    fila, EstadoSuscripcion.Abandonada, "Sistema", ct);

            await transaccion.CommitAsync(ct);
            return abandonada;
        }

        // ─────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────

        private static SuscripcionCreadaDto Creada(Suscripcion fila) => new()
        {
            SuscripcionId = fila.Id,
            InitPoint     = fila.InitPoint!,
            Estado        = fila.Estado.ToString(),
        };

        /// <summary>La suscripcion que describe la situacion actual del usuario.</summary>
        private static Suscripcion? ElegirRelevante(IReadOnlyCollection<Suscripcion> filas, DateTimeOffset ahora) =>
            filas.Where(s => s.Estado == EstadoSuscripcion.Activa).MaxBy(s => s.FechaCreacion)
         ?? filas.Where(s => s.Estado == EstadoSuscripcion.PendientePago).MaxBy(s => s.FechaCreacion)
         ?? filas.Where(s => s.Estado is EstadoSuscripcion.Pausada or EstadoSuscripcion.Suspendida).MaxBy(s => s.FechaCreacion)
         ?? filas.Where(s => AccesoPremium.EstaVigente(s.AccesoHasta, ahora)).MaxBy(s => s.AccesoHasta)
         ?? filas.MaxBy(s => s.FechaCreacion);

        private static SuscripcionAdminDto MapearAdmin(Suscripcion s) => new()
        {
            Id                       = s.Id,
            UsuarioId                = s.UsuarioId,
            CorreoUsuario            = s.Usuario?.Correo ?? string.Empty,
            CorreoPagador            = s.CorreoPagador,
            Estado                   = s.Estado.ToString(),
            EstadoMercadoPago        = s.EstadoMercadoPago,
            MercadoPagoPreapprovalId = s.MercadoPagoPreapprovalId,
            Monto                    = s.Monto,
            Moneda                   = s.Moneda,
            FechaCreacion            = s.FechaCreacion,
            FechaProximoCobro        = s.FechaProximoCobro,
            PeriodoPagadoHasta       = s.PeriodoPagadoHasta,
            AccesoHasta              = s.AccesoHasta,
            UltimaSincronizacion     = s.UltimaSincronizacion,
            CobrosAprobados          = s.Pagos.Count(p => CalculadoraAcceso.EsPagoAprobado(p.EstadoPago)),
        };
    }
}
