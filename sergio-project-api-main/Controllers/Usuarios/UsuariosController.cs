using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Usuarios;
using SergioApi.Services.Interfaces;
using System.Security.Claims;

namespace SergioApi.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    [Authorize]                         // Todos los endpoints requieren JWT por defecto
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuariosController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        // ─────────────────────────────────────────
        // GET /api/usuarios/perfil
        // ─────────────────────────────────────────
        /// <summary>Obtiene el perfil del usuario autenticado</summary>
        [HttpGet("perfil")]
        [ProducesResponseType(typeof(UsuarioPerfilDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ObtenerPerfil()
        {
            var usuarioId = ObtenerUsuarioId();
            var perfil = await _usuarioService.ObtenerPerfilAsync(usuarioId);
            return Ok(perfil);
        }

        // ─────────────────────────────────────────
        // PUT /api/usuarios/perfil
        // ─────────────────────────────────────────
        /// <summary>Actualiza el perfil del usuario autenticado</summary>
        [HttpPut("perfil")]
        [ProducesResponseType(typeof(UsuarioPerfilDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ActualizarPerfil([FromBody] UsuarioPerfilActualizacionDto dto)
        {
            var usuarioId = ObtenerUsuarioId();
            var perfil = await _usuarioService.ActualizarPerfilAsync(usuarioId, dto);
            return Ok(perfil);
        }

        // ─────────────────────────────────────────
        // GET /api/usuarios?pagina=1&porPagina=10
        // ─────────────────────────────────────────
        /// <summary>Listado paginado de todos los usuarios (solo Admin)</summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(PaginadoDto<UsuarioListadoDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ObtenerTodos(
            [FromQuery] int pagina    = 1,
            [FromQuery] int porPagina = 10)
        {
            // Acotar por ambos extremos. Solo se topaba el maximo de porPagina, asi que
            // ?pagina=2147483647 desbordaba el calculo del Skip y rompia la consulta.
            pagina    = Math.Clamp(pagina, 1, 200_000);
            porPagina = Math.Clamp(porPagina, 1, 50);

            var resultado = await _usuarioService.ObtenerTodosAsync(pagina, porPagina);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // GET /api/usuarios/{id}/detalle
        // ─────────────────────────────────────────
        /// <summary>Detalle completo de un usuario (solo Admin)</summary>
        [HttpGet("{id:int}/detalle")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UsuarioDetalleAdminDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerDetalle([FromRoute] int id)
        {
            var detalle = await _usuarioService.ObtenerDetalleAdminAsync(id);
            return Ok(detalle);
        }

        // ─────────────────────────────────────────
        // PUT /api/usuarios/{id}
        // ─────────────────────────────────────────
        /// <summary>Actualiza datos de un usuario (solo Admin, puede cambiar rol)</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(typeof(UsuarioPerfilDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ActualizarAdmin(
            [FromRoute] int id,
            [FromBody] UsuarioAdminActualizacionDto dto)
        {
            var perfil = await _usuarioService.ActualizarAdminAsync(id, dto);
            return Ok(perfil);
        }

        // ─────────────────────────────────────────
        // DELETE /api/usuarios/{id}
        // ─────────────────────────────────────────
        /// <summary>Elimina un usuario (solo Admin)</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("escritura")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Eliminar([FromRoute] int id)
        {
            // Evitar que un admin se elimine a sí mismo
            if (ObtenerUsuarioId() == id)
                throw new InvalidOperationException("No puedes eliminar tu propia cuenta.");

            await _usuarioService.EliminarAsync(id);
            return NoContent();
        }

        // ─────────────────────────────────────────
        // HELPER
        // ─────────────────────────────────────────
        private int ObtenerUsuarioId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;

            if (!int.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Token inválido.");

            return id;
        }

        
        // ─────────────────────────────────────────
        // GET /api/usuarios/{id}
        // ─────────────────────────────────────────
        /// <summary>Obtiene un usuario por su ID — solo Admin</summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UsuarioPerfilDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObtenerPorId([FromRoute] int id)
        {
            var usuario = await _usuarioService.ObtenerPerfilAsync(id);
            if (usuario == null) return NotFound();
            return Ok(usuario);
        }
    }
}