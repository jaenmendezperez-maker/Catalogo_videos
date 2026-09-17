using SergioApi.Models.Entities;

namespace SergioApi.Services.Interfaces
{
    public interface IJwtService
    {
        /// <summary>Genera un access token JWT para el usuario</summary>
        string GenerarAccessToken(Usuario usuario);

        /// <summary>Genera un refresh token seguro y lo persiste en DB</summary>
        Task<RefreshToken> GenerarRefreshTokenAsync(int usuarioId, string? dispositivo = null);

        /// <summary>Valida y retorna el refresh token si es válido</summary>
        Task<RefreshToken?> ValidarRefreshTokenAsync(string token);

        /// <summary>
        /// Revoca un refresh token (logout). Si se pasa <paramref name="usuarioId"/>,
        /// solo lo revoca cuando el token pertenece a ese usuario: evita que un usuario
        /// autenticado cierre la sesion de otro.
        /// </summary>
        Task RevocarRefreshTokenAsync(string token, int? usuarioId = null);

        /// <summary>
        /// Revoca TODOS los refresh tokens activos de un usuario.
        /// Se usa al cambiar contrasena o correo: sin esto, una sesion robada sobrevivia
        /// al cambio de contrasena hasta que caducaba el refresh (7 dias).
        /// </summary>
        /// <returns>Cuantos tokens se revocaron.</returns>
        Task<int> RevocarTodosDelUsuarioAsync(int usuarioId, string? exceptoToken = null);

        /// <summary>Extrae el userId del access token (incluso expirado)</summary>
        int? ObtenerUsuarioIdDesdeToken(string accessToken);
    }
}