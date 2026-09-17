// ============================================================
// VideoSubtituloDtos.cs
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace SergioApi.Models.DTOs.Videos
{
    // ────────────────────────────────────────────────────────
    // ENTRADA — Subir subtítulo manualmente
    // ────────────────────────────────────────────────────────
    public class CrearVideoSubtituloDto
    {
        [Required]
        public int VideoId { get; set; }

        [Required]
        [MaxLength(10, ErrorMessage = "El código de idioma no puede exceder los 10 caracteres.")]
        public string Srclang { get; set; }             // "es", "en", "fr"

        [Required]
        [MaxLength(100, ErrorMessage = "El label no puede exceder los 100 caracteres.")]
        public string Label { get; set; }               // "Español", "English"
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Response de subtítulo
    // ────────────────────────────────────────────────────────
    public class VideoSubtituloResponseDto
    {
        public int Id { get; set; }
        public string Srclang { get; set; }
        public string Label { get; set; }
        public int Version { get; set; }
    }
}