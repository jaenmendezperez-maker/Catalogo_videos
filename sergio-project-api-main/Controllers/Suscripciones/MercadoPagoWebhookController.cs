using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using SergioApi.Configuration;
using SergioApi.Exceptions;
using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Suscripciones;
using SergioApi.Repositories.Suscripciones;
using SergioApi.Services.Implementations.Suscripciones;
using SergioApi.Services.Interfaces.Suscripciones;

namespace SergioApi.Controllers
{
    /// <summary>
    /// Receptor de notificaciones (webhooks) de Mercado Pago.
    /// </summary>
    /// <remarks>
    /// La URL se configura en el panel de Mercado Pago ("Tus integraciones > Webhooks"):
    /// el campo notification_url no esta disponible para suscripciones.
    ///
    /// Reglas:
    ///   - La firma se valida ANTES de cualquier acceso a base de datos o a la red.
    ///   - El cuerpo nunca se cree: solo aporta un id, y el estado se relee de Mercado Pago.
    ///   - 200 si se proceso o se ignora a proposito; 500 ante un fallo transitorio, para
    ///     que Mercado Pago reintente (cada 15 minutos).
    ///   - Mercado Pago espera respuesta en menos de 22 s: se trabaja con un presupuesto
    ///     de 15 s.
    /// </remarks>
    [ApiController]
    [Route("api/webhooks/mercadopago")]
    [AllowAnonymous]
    // Sin limite de peticiones: con un tunel o un proxy todas llegarian desde la misma IP y
    // compartirian cuota. La barrera es la firma. Program.cs lo excluye tambien del
    // limitador global por la ruta, sin depender de este atributo.
    [DisableRateLimiting]
    public class MercadoPagoWebhookController : ControllerBase
    {
        private static readonly TimeSpan Presupuesto        = TimeSpan.FromSeconds(15);
        private static readonly TimeSpan VentanaAntirrebote = TimeSpan.FromSeconds(30);

        private readonly ISincronizadorSuscripciones _sincronizador;
        private readonly ISuscripcionRepository _repo;
        private readonly IOptions<MercadoPagoOptions> _opciones;
        private readonly ILogger<MercadoPagoWebhookController> _logger;

        public MercadoPagoWebhookController(
            ISincronizadorSuscripciones sincronizador,
            ISuscripcionRepository repo,
            IOptions<MercadoPagoOptions> opciones,
            ILogger<MercadoPagoWebhookController> logger)
        {
            _sincronizador = sincronizador;
            _repo          = repo;
            _opciones      = opciones;
            _logger        = logger;
        }

        /// <summary>Recibe una notificacion firmada de Mercado Pago.</summary>
        /// <response code="200">Procesada o ignorada a proposito</response>
        /// <response code="401">Firma ausente o invalida</response>
        /// <response code="500">Fallo transitorio; Mercado Pago reintentara</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Recibir(CancellationToken ct)
        {
            // 1. Firma, antes de nada. data.id se toma del QUERY, que es lo que se firma.
            var dataIdQuery = Request.Query["data.id"].FirstOrDefault();
            var requestId   = Request.Headers["x-request-id"].FirstOrDefault();

            if (!ValidadorFirmaMercadoPago.EsValida(
                    Request.Headers["x-signature"].FirstOrDefault(), requestId, dataIdQuery,
                    _opciones.Value.WebhookSecret))
            {
                _logger.LogWarning(
                    "Webhook de Mercado Pago con firma ausente o invalida desde {Ip}.",
                    HttpContext.Connection.RemoteIpAddress);

                return Unauthorized(Error("Firma inválida.", StatusCodes.Status401Unauthorized));
            }

            // 2. Que recurso cambio. Se aceptan los dos formatos: webhooks (?data.id=&type=)
            //    y el antiguo IPN (?id=&topic=).
            var (tipoCuerpo, idCuerpo) = await LeerCuerpoAsync(ct);
            var tipo    = Request.Query["type"].FirstOrDefault()
                       ?? Request.Query["topic"].FirstOrDefault()
                       ?? tipoCuerpo
                       ?? "desconocido";
            var recurso = dataIdQuery ?? idCuerpo ?? Request.Query["id"].FirstOrDefault();

            // 3. Antirrebote: la MISMA notificacion (tipo + id) ya procesada hace un momento.
            //    No se usa "esta suscripcion se sincronizo hace poco": se saltaria el aviso del
            //    cobro que llega justo despues del de la autorizacion.
            if (await _repo.NotificacionProcesadaRecienteAsync(tipo, recurso, DateTimeOffset.UtcNow - VentanaAntirrebote, ct))
                return Ok();

            var notificacionId = await _repo.RegistrarNotificacionAsync(new NotificacionMercadoPago
            {
                Tipo      = Recortar(tipo, 60)!,
                RecursoId = Recortar(recurso, 64),
                RequestId = Recortar(requestId, 100),
            }, ct);

            // 4. Sincronizar con presupuesto de tiempo.
            using var presupuesto = CancellationTokenSource.CreateLinkedTokenSource(ct);
            presupuesto.CancelAfter(Presupuesto);

            try
            {
                ResultadoSincronizacion? resultado = null;

                if (tipo == "subscription_preapproval" && !string.IsNullOrWhiteSpace(recurso))
                    resultado = await _sincronizador.SincronizarPorPreapprovalAsync(recurso, presupuesto.Token);
                else if (tipo == "subscription_authorized_payment" && long.TryParse(recurso, out var cobroId))
                    resultado = await _sincronizador.SincronizarPorCobroAsync(cobroId, presupuesto.Token);
                else if (tipo == "payment" && long.TryParse(recurso, out var pagoId))
                {
                    // Un pago que no es cobro de ninguna suscripcion no nos incumbe.
                    if (await _sincronizador.SincronizarPorPagoAsync(pagoId, presupuesto.Token) == ResultadoSincronizacion.NoEncontrada)
                    {
                        await _repo.MarcarNotificacionAsync(notificacionId, "Pago ajeno a suscripciones.", ct);
                        return Ok();
                    }
                    resultado = ResultadoSincronizacion.Sincronizada;
                }

                if (resultado is null)
                {
                    await _repo.MarcarNotificacionAsync(notificacionId, $"Topic ignorado: {tipo}.", ct);
                    return Ok();
                }

                if (resultado == ResultadoSincronizacion.NoEncontrada)
                {
                    // 500 a proposito: si llego antes de que la fila existiera, Mercado Pago
                    // reintentara. Si no es nuestra, los reintentos se agotan solos.
                    _logger.LogWarning("Webhook {Tipo} {Recurso}: no hay suscripcion local que corresponda.", tipo, recurso);
                    await _repo.MarcarNotificacionAsync(notificacionId, "Suscripcion no encontrada.", ct);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        Error("Suscripción no encontrada.", StatusCodes.Status500InternalServerError));
                }

                await _repo.MarcarNotificacionAsync(notificacionId, error: null, ct);
                return Ok();
            }
            catch (Exception ex) when (ex is ServicioExternoException
                                       || (ex is OperationCanceledException && !ct.IsCancellationRequested))
            {
                // Mercado Pago no respondio o se agoto el presupuesto: que reintente.
                _logger.LogWarning(ex, "Webhook {Tipo} {Recurso}: fallo transitorio.", tipo, recurso);
                await _repo.MarcarNotificacionAsync(notificacionId, ex.Message, CancellationToken.None);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    Error("Fallo transitorio. Reintenta.", StatusCodes.Status500InternalServerError));
            }
        }

        /// <summary>Extrae "type" y "data.id" del cuerpo, sin fallar si no es JSON.</summary>
        private async Task<(string? Tipo, string? Id)> LeerCuerpoAsync(CancellationToken ct)
        {
            try
            {
                using var documento = await JsonDocument.ParseAsync(Request.Body, cancellationToken: ct);
                var raiz = documento.RootElement;
                if (raiz.ValueKind != JsonValueKind.Object) return (null, null);

                string? tipo = null;
                if (raiz.TryGetProperty("type", out var type) && type.ValueKind == JsonValueKind.String)
                    tipo = type.GetString();
                else if (raiz.TryGetProperty("topic", out var topic) && topic.ValueKind == JsonValueKind.String)
                    tipo = topic.GetString();

                string? id = null;
                if (raiz.TryGetProperty("data", out var data)
                    && data.ValueKind == JsonValueKind.Object
                    && data.TryGetProperty("id", out var dataId))
                {
                    id = dataId.ValueKind == JsonValueKind.Number ? dataId.GetRawText() : dataId.GetString();
                }

                return (tipo, id);
            }
            catch (JsonException)
            {
                return (null, null);
            }
        }

        private RespuestaErrorDto Error(string mensaje, int codigo) => new()
        {
            Mensaje = mensaje,
            Codigo  = codigo,
            TraceId = HttpContext.TraceIdentifier,
        };

        private static string? Recortar(string? texto, int maximo) =>
            texto is null || texto.Length <= maximo ? texto : texto[..maximo];
    }
}
