using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using SergioApi.Enums;
using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Suscripciones;
using SergioApi.Services.Interfaces.Suscripciones;

namespace SergioApi.Controllers
{
    [ApiController]
    [Route("api/suscripciones")]
    [Authorize]
    public class SuscripcionesController : ControllerBase
    {
        private readonly ISuscripcionService _servicio;

        public SuscripcionesController(ISuscripcionService servicio)
        {
            _servicio = servicio;
        }

        // ─────────────────────────────────────────
        // POST /api/suscripciones
        // ─────────────────────────────────────────
        /// <summary>
        /// Inicia la suscripcion mensual y devuelve el enlace de pago de Mercado Pago.
        /// </summary>
        /// <remarks>
        /// El front redirige al usuario a <c>initPoint</c>. Si ya tenia una pendiente
        /// reciente, devuelve la misma. Al volver del pago, el front debe llamar a
        /// POST /api/suscripciones/mia/sincronizar.
        /// </remarks>
        /// <response code="200">Enlace de pago</response>
        /// <response code="409">Ya tiene una suscripcion activa</response>
        /// <response code="502">Mercado Pago no esta disponible</response>
        [HttpPost]
        [EnableRateLimiting("sensible")]
        [ProducesResponseType(typeof(SuscripcionCreadaDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> Crear(
            [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] CrearSuscripcionDto? dto,
            CancellationToken ct)
        {
            return Ok(await _servicio.CrearAsync(ObtenerUsuarioId(), dto, ct));
        }

        // ─────────────────────────────────────────
        // GET /api/suscripciones/mia
        // ─────────────────────────────────────────
        /// <summary>Estado de la suscripcion del usuario y hasta cuando tiene acceso.</summary>
        [HttpGet("mia")]
        [ProducesResponseType(typeof(MiSuscripcionDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> ObtenerMia(CancellationToken ct)
        {
            return Ok(await _servicio.ObtenerMiaAsync(ObtenerUsuarioId(), ct));
        }

        // ─────────────────────────────────────────
        // POST /api/suscripciones/mia/cancelar
        // ─────────────────────────────────────────
        /// <summary>
        /// Cancela la suscripcion. Conserva el acceso hasta el fin del periodo pagado,
        /// sin reembolso.
        /// </summary>
        /// <response code="200">Cancelada y confirmada por Mercado Pago</response>
        /// <response code="404">No tiene ninguna suscripcion que cancelar</response>
        /// <response code="502">Mercado Pago no confirmo la cancelacion; no se marco como cancelada</response>
        [HttpPost("mia/cancelar")]
        [EnableRateLimiting("sensible")]
        [ProducesResponseType(typeof(MiSuscripcionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> CancelarMia(CancellationToken ct)
        {
            return Ok(await _servicio.CancelarMiaAsync(ObtenerUsuarioId(), ct));
        }

        // ─────────────────────────────────────────
        // POST /api/suscripciones/mia/sincronizar
        // ─────────────────────────────────────────
        /// <summary>
        /// Relee el estado de Mercado Pago. Para llamarlo al volver del pago: los
        /// parametros que Mercado Pago anade al back_url no estan documentados y no se usan.
        /// </summary>
        [HttpPost("mia/sincronizar")]
        [EnableRateLimiting("sensible")]
        [ProducesResponseType(typeof(MiSuscripcionDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> SincronizarMia(CancellationToken ct)
        {
            return Ok(await _servicio.SincronizarMiaAsync(ObtenerUsuarioId(), ct));
        }

        // ─────────────────────────────────────────
        // GET /api/suscripciones/admin
        // ─────────────────────────────────────────
        /// <summary>Listado paginado de suscripciones — solo Admin.</summary>
        /// <param name="parametros">busqueda filtra por el correo del usuario o del pagador.</param>
        /// <param name="estado">PendientePago, Activa, Pausada, Suspendida, Cancelada, Abandonada o ErrorCreacion.</param>
        /// <param name="ct">Cancelacion.</param>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(PaginadoDto<SuscripcionAdminDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ListarAdmin(
            [FromQuery] PaginacionParametrosDto parametros,
            [FromQuery] EstadoSuscripcion? estado,
            CancellationToken ct)
        {
            return Ok(await _servicio.ListarAdminAsync(parametros, estado, ct));
        }

        // ─────────────────────────────────────────
        // POST /api/suscripciones/admin/{id}/sincronizar
        // ─────────────────────────────────────────
        /// <summary>Fuerza la sincronizacion de una suscripcion con Mercado Pago — solo Admin.</summary>
        [HttpPost("admin/{id:int}/sincronizar")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(typeof(SuscripcionAdminDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SincronizarAdmin([FromRoute] int id, CancellationToken ct)
        {
            return Ok(await _servicio.SincronizarAdminAsync(id, ct));
        }

        // ─────────────────────────────────────────
        // HELPER
        // ─────────────────────────────────────────
        private int ObtenerUsuarioId()
        {
            // El handler de JWT remapea "sub" a NameIdentifier; el segundo intento
            // cubre el caso en que ese remapeo este desactivado.
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (!int.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Token inválido.");

            return id;
        }
    }
}
