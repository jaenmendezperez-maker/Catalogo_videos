// ============================================================
// VideoCurso.cs
// ============================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SergioApi.Models.Entities.Videos;

namespace SergioApi.Models.Entities.Videos.Cursos
{
    public class VideoCurso
    {
        [Key]
        public int Id { get; set; }

        // ── Identificación en Bunny ───────────────────────────
        [Required]
        [MaxLength(36)]
        public string BunnyColleccionId { get; set; }       // guid — path param en peticiones de colección

        // ── Relación con librería ─────────────────────────────
        public long BunnyLibreriaId { get; set; }            // videoLibraryId — FK hacia BunnyLibrary

        // [ForeignKey("BunnyLibreriaId")]                  // POR AHORA SOLO DEFINIR DE ESTA MANERA, SI ESCALA LO AGREGAREMOS CON BUNNYLIBRARY
        // public BunnyLibrary BunnyLibrary { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; }                  // No dice que sea requerido en la documentacion, pero ps es un nombre KJASKJSAK obvio que se requiere

        public long CantidadVideos { get; set; }             // videoCount

        public long TamanoTotal { get; set; }               // totalSize — en bytes

        [MaxLength(500)]
        public string? PreviewVideoIds { get; set; }        // previewVideoIds — string CSV de GUIDs
                                                            // previewImageUrls NO se guarda,
                                                            // se consulta con includeThumbnails=true

        [Required]
        public bool EsPremium { get; set; }

        // ── Navegación ────────────────────────────────────────
        public ICollection<Video> Videos { get; set; } = new List<Video>();
    }
}