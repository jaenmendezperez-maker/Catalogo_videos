namespace SergioApi.Models.DTOs.Usuarios
{
    /// <summary>Solicitud para refrescar el access token</summary>
    public class RefreshTokenRequestDto
    {
        public required string RefreshToken { get; set; }
    }

    /// <summary>Respuesta al refrescar el token</summary>
    public class TokenRefrescadoDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public DateTimeOffset FechaExpiracion { get; set; }
    }
}