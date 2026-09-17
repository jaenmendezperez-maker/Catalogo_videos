using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using SergioApi.Configuration;
using SergioApi.Exceptions;
using SergioApi.Models.MercadoPago;
using SergioApi.Services.Interfaces.Suscripciones;

namespace SergioApi.Services.Implementations.Suscripciones
{
    /// <summary>
    /// Cliente HTTP de Mercado Pago. Mismo patron que BunnyService.
    /// </summary>
    /// <remarks>
    /// No se usa el SDK oficial (mercadopago-sdk): se configura con un token estatico
    /// global, arrastra Newtonsoft.Json, y aqui solo hacen falta unas pocas llamadas.
    /// </remarks>
    public class MercadoPagoClient : IMercadoPagoClient
    {
        private const int TamanoPagina   = 50;
        private const int PaginasMaximas = 20;   // tope defensivo: 1.000 facturas por suscripcion

        private static readonly JsonSerializerOptions Json = new()
        {
            PropertyNamingPolicy   = JsonNamingPolicy.SnakeCaseLower,
            PropertyNameCaseInsensitive = true,
            // Algunos ids numericos llegan como texto segun el endpoint.
            NumberHandling         = JsonNumberHandling.AllowReadingFromString,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        private readonly HttpClient _http;
        private readonly ILogger<MercadoPagoClient> _logger;

        public MercadoPagoClient(
            HttpClient http,
            IOptions<MercadoPagoOptions> opciones,
            ILogger<MercadoPagoClient> logger)
        {
            _http   = http;
            _logger = logger;

            var config = opciones.Value;
            _http.BaseAddress = new Uri(config.ApiBaseUrl.TrimEnd('/') + "/");

            if (!string.IsNullOrWhiteSpace(config.AccessToken))
                _http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", config.AccessToken);

            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        // ── Preapproval ───────────────────────────────────────────

        public async Task<PreapprovalMp> CrearPreapprovalAsync(
            CrearPreapprovalMp solicitud, string claveIdempotencia, CancellationToken ct = default)
        {
            using var peticion = ConCuerpo(HttpMethod.Post, "preapproval", solicitud);
            peticion.Headers.Add("X-Idempotency-Key", claveIdempotencia);

            var (cuerpo, crudo) = await EnviarAsync<PreapprovalMp>(peticion, nuloSi404: false, ct);
            return ConCrudo(cuerpo, crudo)
                ?? throw new ServicioExternoException("Mercado Pago devolvió una respuesta vacía al crear la suscripción.");
        }

        public async Task<PreapprovalMp?> ObtenerPreapprovalAsync(string preapprovalId, CancellationToken ct = default)
        {
            using var peticion = new HttpRequestMessage(HttpMethod.Get, $"preapproval/{Uri.EscapeDataString(preapprovalId)}");
            var (cuerpo, crudo) = await EnviarAsync<PreapprovalMp>(peticion, nuloSi404: true, ct);
            return ConCrudo(cuerpo, crudo);
        }

        public async Task<PreapprovalMp?> BuscarPreapprovalPorReferenciaAsync(
            string externalReference, CancellationToken ct = default)
        {
            // Nombre del parametro pendiente de confirmar en la Fase 0 del plan.
            using var peticion = new HttpRequestMessage(HttpMethod.Get,
                $"preapproval/search?external_reference={Uri.EscapeDataString(externalReference)}");

            var (cuerpo, _) = await EnviarAsync<BusquedaMp<PreapprovalMp>>(peticion, nuloSi404: true, ct);

            // Si hubiera mas de uno (no deberia, gracias a la clave de idempotencia), el
            // sincronizador lo detecta y cancela el sobrante.
            return cuerpo?.Results?.FirstOrDefault();
        }

        public async Task<PreapprovalMp> ActualizarEstadoPreapprovalAsync(
            string preapprovalId, string estado, CancellationToken ct = default)
        {
            using var peticion = ConCuerpo(HttpMethod.Put,
                $"preapproval/{Uri.EscapeDataString(preapprovalId)}", new { status = estado });

            var (cuerpo, crudo) = await EnviarAsync<PreapprovalMp>(peticion, nuloSi404: false, ct);
            return ConCrudo(cuerpo, crudo)
                ?? throw new ServicioExternoException("Mercado Pago devolvió una respuesta vacía al actualizar la suscripción.");
        }

        // ── Cobros y pagos ────────────────────────────────────────

        public async Task<IReadOnlyList<AuthorizedPaymentMp>> BuscarCobrosAsync(
            string preapprovalId, CancellationToken ct = default)
        {
            var cobros = new List<AuthorizedPaymentMp>();

            for (var pagina = 0; pagina < PaginasMaximas; pagina++)
            {
                // Nombre del parametro pendiente de confirmar en la Fase 0 del plan.
                using var peticion = new HttpRequestMessage(HttpMethod.Get,
                    $"authorized_payments/search?preapproval_id={Uri.EscapeDataString(preapprovalId)}"
                  + $"&offset={pagina * TamanoPagina}&limit={TamanoPagina}");

                var (cuerpo, _) = await EnviarAsync<BusquedaMp<AuthorizedPaymentMp>>(peticion, nuloSi404: true, ct);
                var resultados = cuerpo?.Results ?? [];
                cobros.AddRange(resultados);

                var total = cuerpo?.Paging?.Total ?? 0;
                if (resultados.Count < TamanoPagina || cobros.Count >= total)
                    break;
            }

            return cobros;
        }

        public async Task<AuthorizedPaymentMp?> ObtenerCobroAsync(long authorizedPaymentId, CancellationToken ct = default)
        {
            using var peticion = new HttpRequestMessage(HttpMethod.Get, $"authorized_payments/{authorizedPaymentId}");
            var (cuerpo, _) = await EnviarAsync<AuthorizedPaymentMp>(peticion, nuloSi404: true, ct);
            return cuerpo;
        }

        public async Task<PagoMp?> ObtenerPagoAsync(long paymentId, CancellationToken ct = default)
        {
            using var peticion = new HttpRequestMessage(HttpMethod.Get, $"v1/payments/{paymentId}");
            var (cuerpo, _) = await EnviarAsync<PagoMp>(peticion, nuloSi404: true, ct);
            return cuerpo;
        }

        // ── Infraestructura ───────────────────────────────────────

        private static HttpRequestMessage ConCuerpo(HttpMethod metodo, string ruta, object cuerpo) =>
            new(metodo, ruta)
            {
                Content = new StringContent(JsonSerializer.Serialize(cuerpo, Json), Encoding.UTF8, "application/json")
            };

        private static PreapprovalMp? ConCrudo(PreapprovalMp? preapproval, string crudo)
        {
            if (preapproval is not null) preapproval.JsonCrudo = crudo;
            return preapproval;
        }

        /// <summary>
        /// Envia la peticion y traduce todos los fallos a ServicioExternoException.
        /// </summary>
        /// <remarks>
        /// Un timeout de HttpClient lanza TaskCanceledException, no TimeoutException; si
        /// no se traduce aqui, el middleware lo trataria como un 500 generico.
        /// </remarks>
        private async Task<(T? Cuerpo, string Crudo)> EnviarAsync<T>(
            HttpRequestMessage peticion, bool nuloSi404, CancellationToken ct)
        {
            HttpResponseMessage respuesta;
            try
            {
                respuesta = await _http.SendAsync(peticion, ct);
            }
            catch (TaskCanceledException ex) when (!ct.IsCancellationRequested)
            {
                throw new ServicioExternoException("Mercado Pago no respondió a tiempo.", esTimeout: true, interna: ex);
            }
            catch (HttpRequestException ex)
            {
                throw new ServicioExternoException("No se pudo conectar con Mercado Pago.", interna: ex);
            }

            using (respuesta)
            {
                var crudo = await respuesta.Content.ReadAsStringAsync(ct);

                if (respuesta.StatusCode == HttpStatusCode.NotFound && nuloSi404)
                    return (default, crudo);

                if (!respuesta.IsSuccessStatusCode)
                {
                    // Se registra el cuerpo recortado: Mercado Pago explica ahi el motivo
                    // (monto invalido, usuario de prueba mezclado con real...), y sin el
                    // solo quedaria un codigo HTTP.
                    _logger.LogWarning(
                        "Mercado Pago respondio {Codigo} a {Metodo} {Ruta}: {Cuerpo}",
                        (int)respuesta.StatusCode, peticion.Method, peticion.RequestUri?.OriginalString,
                        Recortar(crudo));

                    throw new ServicioExternoException(
                        $"Mercado Pago respondió {(int)respuesta.StatusCode}.", (int)respuesta.StatusCode);
                }

                try
                {
                    return (JsonSerializer.Deserialize<T>(crudo, Json), crudo);
                }
                catch (JsonException ex)
                {
                    throw new ServicioExternoException("Mercado Pago devolvió una respuesta que no se pudo interpretar.", interna: ex);
                }
            }
        }

        private static string Recortar(string texto) =>
            texto.Length <= 500 ? texto : texto[..500] + "…";
    }
}
