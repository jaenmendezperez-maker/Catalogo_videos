using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SergioApi.Models.Entities
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Token { get; set; } = string.Empty;

        public int UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario Usuario { get; set; } = null!;

        public DateTimeOffset FechaExpiracion { get; set; }

        public bool EstaRevocado { get; set; } = false;

        public DateTimeOffset FechaCreacion { get; set; } = DateTimeOffset.UtcNow;

        // Para saber si vino de Google o de login normal
        public string? DispositivoOrigen { get; set; }

        [NotMapped]
        public bool EsValido => !EstaRevocado && FechaExpiracion > DateTimeOffset.UtcNow;
    }
}