using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SergioApi.Exceptions;
using SergioApi.Models.DTOs;

namespace SergioApi.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next   = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex) when (EsCancelacionDelCliente(context, ex))
            {
                // El cliente cerro la conexion. No es un error del servidor y no hay
                // a quien responder. Se registra en Debug: tratarlo como error llenaba
                // el log de entradas falsas en cuanto habia carga o alguien cancelaba.
                _logger.LogDebug(
                    "Peticion cancelada por el cliente: {Metodo} {Ruta}",
                    context.Request.Method, context.Request.Path);
            }
            catch (Exception ex)
            {
                // Los fallos atribuibles al cliente (cuerpo demasiado grande, peticion
                // malformada) se registran como Warning. Si fueran Error, cualquiera
                // podria llenar el disco de logs mandando cuerpos enormes.
                var nivel = EsCulpaDelCliente(ex) ? LogLevel.Warning : LogLevel.Error;

                _logger.Log(nivel, ex,
                    "Excepcion no controlada en {Metodo} {Ruta}. TraceId={TraceId}",
                    context.Request.Method, context.Request.Path, context.TraceIdentifier);

                // Si la respuesta ya empezo a escribirse no se puede cambiar el status:
                // intentarlo lanza una segunda excepcion que enmascara la original.
                if (context.Response.HasStarted)
                {
                    _logger.LogWarning(
                        "La respuesta ya habia comenzado; no se puede enviar el cuerpo de error. TraceId={TraceId}",
                        context.TraceIdentifier);
                    throw;
                }

                await ManejarExcepcionAsync(context, ex);
            }
        }

        private static async Task ManejarExcepcionAsync(HttpContext context, Exception ex)
        {
            // Regla: solo se devuelve ex.Message cuando la excepcion es NUESTRA y
            // describe algo que el cliente puede corregir. Todo lo demas es generico.
            var (statusCode, mensaje) = ex switch
            {
                ReglaNegocioException       => (HttpStatusCode.BadRequest,   ex.Message),
                ArgumentException           => (HttpStatusCode.BadRequest,   ex.Message),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ex.Message),
                AccesoProhibidoException    => (HttpStatusCode.Forbidden,    ex.Message),
                KeyNotFoundException        => (HttpStatusCode.NotFound,     ex.Message),
                ConflictoException          => (HttpStatusCode.Conflict,     ex.Message),

                // Violacion de unicidad en PostgreSQL (23505). Mensaje generico a proposito:
                // decir que columna colisiono permitiria enumerar correos registrados.
                DbUpdateException dbEx when EsViolacionUnicidad(dbEx)
                    => (HttpStatusCode.Conflict, "El recurso ya existe."),

                // Cuerpo por encima del limite de Kestrel. Antes caia en el caso por
                // defecto y salia como 500, culpando al servidor de un error del cliente.
                BadHttpRequestException { StatusCode: StatusCodes.Status413PayloadTooLarge }
                    => (HttpStatusCode.RequestEntityTooLarge, "El contenido enviado es demasiado grande."),

                // Resto de peticiones malformadas (linea de peticion invalida, cabeceras
                // corruptas, JSON cortado a medio cuerpo).
                BadHttpRequestException
                    => (HttpStatusCode.BadRequest, "La petición está malformada."),

                // Fallos de servicios externos (Mercado Pago, Bunny). Se distinguen de un
                // bug propio: 504 si no respondio a tiempo, 502 si respondio con error.
                ServicioExternoException { EsTimeout: true }
                    => (HttpStatusCode.GatewayTimeout, "Un servicio externo tardó demasiado en responder."),

                ServicioExternoException
                    => (HttpStatusCode.BadGateway, "Un servicio externo no está disponible. Intenta más tarde."),

                // Un servicio externo (Bunny) no respondio a tiempo.
                TimeoutException
                    => (HttpStatusCode.GatewayTimeout, "El servicio tardó demasiado en responder."),

                // InvalidOperationException YA NO se mapea a 400 con su mensaje:
                // EF y el propio .NET la lanzan internamente y filtraba detalles del motor.
                _ => (HttpStatusCode.InternalServerError, "Ocurrió un error interno. Intenta más tarde.")
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode  = (int)statusCode;

            // Mismo tipo que usan los errores de validacion y el rate limiter,
            // para que la API devuelva una sola forma de error.
            var respuesta = new RespuestaErrorDto
            {
                Mensaje = mensaje,
                Codigo  = (int)statusCode,
                // Permite correlacionar con los logs del servidor sin filtrar nada del error.
                TraceId = context.TraceIdentifier,
            };

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(respuesta, new JsonSerializerOptions
                {
                    PropertyNamingPolicy   = JsonNamingPolicy.CamelCase,
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
                })
            );
        }

        private static bool EsViolacionUnicidad(DbUpdateException ex) =>
            ex.InnerException is PostgresException { SqlState: "23505" };

        /// <summary>El cliente abandono la peticion; no queda nadie a quien responder.</summary>
        private static bool EsCancelacionDelCliente(HttpContext context, Exception ex) =>
            ex is OperationCanceledException && context.RequestAborted.IsCancellationRequested;

        /// <summary>
        /// Errores provocados por lo que envio el cliente. Se registran como Warning
        /// para que no se puedan usar como amplificador de escritura en disco.
        /// </summary>
        private static bool EsCulpaDelCliente(Exception ex) =>
            ex is BadHttpRequestException or ReglaNegocioException or ArgumentException
               or UnauthorizedAccessException or AccesoProhibidoException
               or KeyNotFoundException or ConflictoException;
    }

    // Extension para registrar limpio en Program.cs
    public static class GlobalExceptionMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
            => app.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
