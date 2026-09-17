using System.ComponentModel.DataAnnotations;

namespace SergioApi.Configuration
{
    /// <summary>
    /// Configuracion de emision y validacion de tokens JWT (seccion "Jwt").
    /// Se valida al arrancar: si falta algo, la API no levanta y dice exactamente que falta,
    /// en vez de responder 500 en la primera peticion autenticada.
    /// </summary>
    public class JwtOptions
    {
        public const string SectionName = "Jwt";

        /// <summary>Clave simetrica para HMAC-SHA256. Minimo 32 caracteres (256 bits).</summary>
        [Required(ErrorMessage = "Jwt:SecretKey es obligatoria. Configurala con User Secrets o la variable de entorno Jwt__SecretKey.")]
        [MinLength(32, ErrorMessage = "Jwt:SecretKey debe tener al menos 32 caracteres (256 bits) para HMAC-SHA256.")]
        public string SecretKey { get; set; } = string.Empty;

        [Required(ErrorMessage = "Jwt:Issuer es obligatorio.")]
        public string Issuer { get; set; } = string.Empty;

        [Required(ErrorMessage = "Jwt:Audience es obligatorio.")]
        public string Audience { get; set; } = string.Empty;

        [Range(1, 1440, ErrorMessage = "Jwt:AccessTokenMinutos debe estar entre 1 y 1440.")]
        public int AccessTokenMinutos { get; set; } = 60;

        [Range(1, 365, ErrorMessage = "Jwt:RefreshTokenDias debe estar entre 1 y 365.")]
        public int RefreshTokenDias { get; set; } = 7;
    }
}
