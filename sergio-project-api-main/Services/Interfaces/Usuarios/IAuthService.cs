using SergioApi.Models.DTOs.Usuarios;

namespace SergioApi.Services.Interfaces
{
    public interface IAuthService
    {
        /// <summary>Registra un nuevo usuario con email y contraseña</summary>
        Task<UsuarioAutenticadoDto> RegistrarAsync(UsuarioRegistroDto dto);

        /// <summary>Login con email y contraseña</summary>
        Task<UsuarioAutenticadoDto> LoginAsync(UsuarioLoginDto dto);

        /// <summary>Login o registro mediante Google OAuth</summary>
        Task<UsuarioAutenticadoDto> LoginGoogleAsync(string googleToken);

        /// <summary>Renueva el access token usando un refresh token válido</summary>
        Task<TokenRefrescadoDto> RefrescarTokenAsync(string refreshToken);

        /// <summary>
        /// Invalida el refresh token (logout). Solo surte efecto si el token pertenece
        /// al usuario indicado.
        /// </summary>
        Task RevocarTokenAsync(int usuarioId, string refreshToken);

        /// <summary>Cambia la contraseña del usuario autenticado</summary>
        Task CambiarPasswordAsync(int usuarioId, UsuarioCambioPasswordDto dto);
    }
}