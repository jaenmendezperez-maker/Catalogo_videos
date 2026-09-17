using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SergioApi.Models.DTOs.Usuarios;
using SergioApi.Services.Interfaces;
using System.Security.Claims;

namespace SergioApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ─────────────────────────────────────────
        // POST /api/auth/registro
        // ─────────────────────────────────────────
        /// <summary>Registra un nuevo usuario con email y contraseña</summary>
        [HttpPost("registro")]
        [EnableRateLimiting("registro")]
        [ProducesResponseType(typeof(UsuarioAutenticadoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Registro([FromBody] UsuarioRegistroDto dto)
        {
            // ModelState se valida automáticamente con [ApiController]
            var resultado = await _authService.RegistrarAsync(dto);
            // Antes: CreatedAtAction(nameof(Registro), ...) generaba un Location que
            // apuntaba al propio POST. No hay recurso GET al que apuntar.
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // POST /api/auth/login
        // ─────────────────────────────────────────
        /// <summary>Login con email y contraseña, devuelve JWT + refresh token</summary>
        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        [ProducesResponseType(typeof(UsuarioAutenticadoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] UsuarioLoginDto dto)
        {
            var resultado = await _authService.LoginAsync(dto);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // POST /api/auth/login-google
        // ─────────────────────────────────────────
        /// <summary>Login o registro mediante Google OAuth (recibe el id_token de Google)</summary>
        [HttpPost("login-google")]
        [EnableRateLimiting("auth")]
        [ProducesResponseType(typeof(UsuarioAutenticadoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> LoginGoogle([FromBody] GoogleLoginDto dto)
        {
            var resultado = await _authService.LoginGoogleAsync(dto.IdToken);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // POST /api/auth/refresh
        // ─────────────────────────────────────────
        /// <summary>Renueva el access token usando un refresh token válido</summary>
        [HttpPost("refresh")]
        [EnableRateLimiting("auth")]
        [ProducesResponseType(typeof(TokenRefrescadoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            var resultado = await _authService.RefrescarTokenAsync(dto.RefreshToken);
            return Ok(resultado);
        }

        // ─────────────────────────────────────────
        // POST /api/auth/logout
        // ─────────────────────────────────────────
        /// <summary>Invalida el refresh token (logout)</summary>
        [HttpPost("logout")]
        [Authorize]
        // Sin politica propia: logout es barato (un SELECT y un UPDATE, sin BCrypt) y
        // es una operacion legitima frecuente. Le basta con el limitador global.
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
        {
            // Se pasa el usuario del access token: sin esto, cualquier usuario autenticado
            // podia revocar el refresh token de otro con solo conocer su valor.
            await _authService.RevocarTokenAsync(ObtenerUsuarioId(), dto.RefreshToken);
            return NoContent();
        }

        // ─────────────────────────────────────────
        // POST /api/auth/cambiar-password
        // ─────────────────────────────────────────
        /// <summary>Cambia la contraseña del usuario autenticado</summary>
        [HttpPost("cambiar-password")]
        [Authorize]
        // ~200 ms de BCrypt por llamada (verify + hash), y el verify corre ANTES de
        // rechazar: sin limite, un bucle con la contrasena equivocada quema CPU gratis.
        [EnableRateLimiting("sensible")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CambiarPassword([FromBody] UsuarioCambioPasswordDto dto)
        {
            var usuarioId = ObtenerUsuarioId();
            await _authService.CambiarPasswordAsync(usuarioId, dto);
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
    }

    // DTO auxiliar solo para recibir el token de Google
    public class GoogleLoginDto
    {
        public required string IdToken { get; set; }
    }
}