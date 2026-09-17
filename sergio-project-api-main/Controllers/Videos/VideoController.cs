using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using SergioApi.Filters;
using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Videos;
using SergioApi.Services.Interfaces.Videos;

namespace SergioApi.Controllers
{
    [ApiController]
    [Route("api/videos")]
    public class VideosController : ControllerBase
    {
        private readonly IVideoService _videoService;

        public VideosController(IVideoService videoService)
        {
            _videoService = videoService;
        }

        // ─────────────────────────────────────────
        // GET /api/videos
        // ─────────────────────────────────────────
        /// <summary>Listado paginado de videos — público, todos pueden verlos</summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginadoDto<VideoVistasPreviaDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ObtenerTodos(
            [FromQuery] PaginacionParametrosDto parametros,
            [FromQuery] bool incluirNoPublicados = false)
        {
            parametros.IncluirNoPublicados = EsAdmin() && incluirNoPublicados;
            var resultado = await _videoService.ObtenerVideosPaginadosAsync(parametros);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // GET /api/videos/{id}
        // ─────────────────────────────────────────
        /// <summary>Detalle de un video con su URL de reproducción</summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(VideoDetalleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerPorId([FromRoute] int id)
        {
            var video = await _videoService.ObtenerVideoAsync(id, EsAdmin());
            if (video == null) return NotFound();
            return Ok(video);
        }

        // ─────────────────────────────────────────
        // GET /api/videos/coleccion/{videoCursoId}
        // ─────────────────────────────────────────
        /// <summary>Videos paginados dentro de una colección — público</summary>
        [HttpGet("coleccion/{videoCursoId:int}")]
        [ProducesResponseType(typeof(PaginadoDto<VideoVistasPreviaDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerPorColeccion(
            [FromRoute] int videoCursoId,
            [FromQuery] PaginacionParametrosDto parametros,
            [FromQuery] bool incluirNoPublicados = false)
        {
            parametros.IncluirNoPublicados = EsAdmin() && incluirNoPublicados;
            var resultado = await _videoService.ObtenerVideosPorColeccionAsync(videoCursoId, parametros);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // GET /api/videos/{id}/estadisticas
        // ─────────────────────────────────────────
        /// <summary>Estadísticas de un video — solo Admin</summary>
        [HttpGet("{id:int}/estadisticas")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(VideoEstadisticasDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerEstadisticas([FromRoute] int id)
        {
            var estadisticas = await _videoService.ObtenerEstadisticasAsync(id);
            if (estadisticas == null) return NotFound();
            return Ok(estadisticas);
        }

        // ─────────────────────────────────────────
        // POST /api/videos
        // ─────────────────────────────────────────
        /// <summary>Crea un video en Bunny y lo registra en DB — solo Admin</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        // Sin esto rige el limite global (1 MB) y un video real se rechazaria con 413.
        // El tope sale de Uploads:MaxVideoBytes; antes esa clave estaba en appsettings
        // pero no la leia nadie, y ademas contradecia al atributo de 5 GB.
        [LimiteSubida]
        [RequestFormLimits(MultipartBodyLengthLimit = LimiteSubidaAttribute.PorDefecto)]
        [ProducesResponseType(typeof(VideoDetalleDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Crear(
            [FromForm] CrearVideoDto dto,       // FromForm porque viene con un archivo
            IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return BadRequest("El archivo de video es obligatorio.");

            using var stream = archivo.OpenReadStream();
            var resultado = await _videoService.CrearVideoAsync(dto, stream);

            return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id }, resultado);
        }

        // ─────────────────────────────────────────
        // PUT /api/videos/{id}
        // ─────────────────────────────────────────
        /// <summary>Actualiza datos del video en Bunny y DB — solo Admin</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(typeof(VideoDetalleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Actualizar(
            [FromRoute] int id,
            [FromBody] ActualizarVideoDto dto)
        {
            var resultado = await _videoService.ActualizarVideoAsync(id, dto);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // GET /api/videos/{id}/reproducir
        // ─────────────────────────────────────────
        /// <summary>
        /// Devuelve una URL de reproducción firmada y temporal.
        /// Es el único camino legítimo para acceder al contenido: los identificadores
        /// de Bunny ya no viajan en los DTOs públicos.
        /// </summary>
        /// <response code="200">URL firmada, válida durante 2 horas</response>
        /// <response code="401">Sin sesión</response>
        /// <response code="403">Autenticado pero sin suscripción premium</response>
        /// <response code="404">El video no existe o aún no está publicado</response>
        [HttpGet("{id:int}/reproducir")]
        [Authorize]
        [ProducesResponseType(typeof(VideoReproduccionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Reproducir([FromRoute] int id)
        {
            var resultado = await _videoService.ObtenerUrlReproduccionAsync(
                id, ObtenerUsuarioId(), EsAdmin());

            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // DELETE /api/videos/{id}
        // ─────────────────────────────────────────
        /// <summary>Elimina el video en Bunny y en DB — solo Admin</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Eliminar([FromRoute] int id)
        {
            await _videoService.EliminarVideoAsync(id);
            return NoContent();
        }

        // ─────────────────────────────────────────
        // HELPERS
        // ─────────────────────────────────────────
        private bool EsAdmin() => User.IsInRole("Admin");

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