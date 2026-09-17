using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SergioApi.Models.Entities.Videos
{
    public class VideoSubtitulo
    {
        [Key]
        public int Id { get; set; }

        // ── Relación con video ────────────────────────────────
        public int VideoId { get; set; }                    // FK hacia Video

        [ForeignKey("VideoId")]
        public Video Video { get; set; }

        // ── Datos del subtítulo ───────────────────────────────
        [MaxLength(10)]
        public string? Srclang { get; set; }                 // srclang — "es", "en", "fr"
                                                            // es el código que usa Bunny
                                                            // también es el path param para Delete Caption

        [MaxLength(100)]
        public string? Label { get; set; }                   // label — "Español", "English"
                                                            // es el nombre visible en el reproductor

        public int Version { get; set; }                    // version — Bunny lo maneja internamente
                                                            // útil para saber si el subtítulo fue actualizado
    }
}