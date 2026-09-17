using System.ComponentModel.DataAnnotations;

namespace SergioApi.Models.DTOs.Videos.Cursos
{
    // ────────────────────────────────────────────────────────
    // ENTRADA — Crear colección
    // ────────────────────────────────────────────────────────
    public class CrearVideoCursoDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres.")]
        public string Nombre { get; set; }
        [Required(ErrorMessage = "Se debe definir si la colección es premium o no.") ]
        public bool EsPremium { get; set; } = true;
    }

    // ────────────────────────────────────────────────────────
    // ENTRADA — Actualizar colección
    // ────────────────────────────────────────────────────────
    public class ActualizarVideoCursoDto
    {
        [MaxLength(200)]
        public string? Nombre { get; set; }

        public bool? EsPremium { get; set; }
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Vista previa (listados)
    // ────────────────────────────────────────────────────────
    public class VideoCursoVistasPreviaDto
    {
        public int Id { get; set; }
        // BunnyCollectionId ELIMINADO: identificador interno de Bunny.
        public string Nombre { get; set; }
        public bool EsPremium { get; set; }
        public long CantidadVideos { get; set; }
        public long TamanoTotal { get; set; }           // en bytes
        // PreviewVideoIds ELIMINADO: era un CSV de GUIDs de video, la misma llave del bypass.    // para mostrar thumbnails de preview
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Detalle completo con videos dentro
    // ────────────────────────────────────────────────────────
    public class VideoCursoDetalleDto
    {
        public int Id { get; set; }
        // BunnyCollectionId y BunnyLibraryId ELIMINADOS: identificadores internos de Bunny.
        public string Nombre { get; set; }
        public bool EsPremium { get; set; }
        public long CantidadVideos { get; set; }
        public long TamanoTotal { get; set; }
        // PreviewVideoIds ELIMINADO: era un CSV de GUIDs de video, la misma llave del bypass.

        // Videos dentro de la colección — vista previa, no detalle completo
        public List<VideoVistasPreviaDto> Videos { get; set; } = new();
    }
}