using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Videos.Cursos;
using SergioApi.Services.Interfaces.Videos.Cursos;

namespace SergioApi.Controllers
{
    [ApiController]
    [Route("api/cursos")]
    public class VideoCursosController : ControllerBase
    {
        private readonly IVideoCursoService _videoCursoService;

        public VideoCursosController(IVideoCursoService videoCursoService)
        {
            _videoCursoService = videoCursoService;
        }

        // ─────────────────────────────────────────
        // GET /api/cursos
        // ─────────────────────────────────────────
        /// <summary>Listado paginado de colecciones — público</summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginadoDto<VideoCursoVistasPreviaDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ObtenerTodos([FromQuery] PaginacionParametrosDto parametros)
        {
            var resultado = await _videoCursoService.ObtenerColeccionesPaginadasAsync(parametros);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // GET /api/cursos/{id}
        // ─────────────────────────────────────────
        /// <summary>Detalle de una colección con todos sus videos</summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(VideoCursoDetalleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerPorId([FromRoute] int id)
        {
            var curso = await _videoCursoService.ObtenerColeccionAsync(id, User.IsInRole("Admin"));
            if (curso == null) return NotFound();
            return Ok(curso);
        }

        // ─────────────────────────────────────────
        // POST /api/cursos
        // ─────────────────────────────────────────
        /// <summary>Crea una colección en Bunny y la registra en DB — solo Admin</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(typeof(VideoCursoDetalleDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Crear([FromBody] CrearVideoCursoDto dto)
        {
            var resultado = await _videoCursoService.CrearColeccionAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = resultado.Id }, resultado);
        }

        // ─────────────────────────────────────────
        // PUT /api/cursos/{id}
        // ─────────────────────────────────────────
        /// <summary>Actualiza la colección en Bunny y DB — solo Admin</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(typeof(VideoCursoDetalleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Actualizar(
            [FromRoute] int id,
            [FromBody] ActualizarVideoCursoDto dto)
        {
            var resultado = await _videoCursoService.ActualizarColeccionAsync(id, dto);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // DELETE /api/cursos/{id}
        // ─────────────────────────────────────────
        /// <summary>Elimina la colección en Bunny y DB — solo Admin</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Eliminar([FromRoute] int id)
        {
            await _videoCursoService.EliminarColeccionAsync(id);
            return NoContent();
        }
    }
}