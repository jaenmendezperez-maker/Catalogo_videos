using System.ComponentModel.DataAnnotations;
using SergioApi.Enums;

namespace SergioApi.Models.DTOs.Videos
{
    // ────────────────────────────────────────────────────────
    // ENTRADA — Crear video
    // ────────────────────────────────────────────────────────
    public class CrearVideoDto
    {
        [Required(ErrorMessage = "El título es obligatorio")]
        [MaxLength(200, ErrorMessage = "El título no puede tener más de 200 caracteres")]
        public required string Titulo { get; set; }
        
        [MaxLength(1000, ErrorMessage = "La descripción no puede tener más de 1000 caracteres")]
        public string? Descripcion { get; set; }
        [Required(ErrorMessage = "El video debe declararse como premium o no premium")]
        public required bool EsPremium { get; set; } = true;

        public required bool EsPublico { get; set; } = false;    // oculto por defecto hasta que el admin lo publique

        public int? VideoCursoId { get; set; }          // colección opcional

        [MaxLength(100, ErrorMessage = "La categoría no puede tener más de 100 caracteres")]
        public string? Categoria { get; set; }
    }

    // ────────────────────────────────────────────────────────
    // ENTRADA — Actualizar video
    // ────────────────────────────────────────────────────────
    public class ActualizarVideoDto
    {
        [MaxLength(200, ErrorMessage = "El título no puede tener más de 200 caracteres")]
        public string? Titulo { get; set; }

        [MaxLength(1000, ErrorMessage = "La descripción no puede tener más de 1000 caracteres")]
        public string? Descripcion { get; set; }

        // Sin [Required]: es bool? justamente para permitir updates parciales.
        // Con [Required] el PUT devolvia 400 si el cliente no mandaba siempre esPremium.
        public bool? EsPremium { get; set; }

        public bool? EsPublico { get; set; }

        public int? VideoCursoId { get; set; }

        [MaxLength(100, ErrorMessage = "La categoría no puede tener más de 100 caracteres")]
        public string? Categoria { get; set; }
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Vista previa (listados, cards en el front)
    // ────────────────────────────────────────────────────────
    public class VideoVistasPreviaDto
    {
        public int Id { get; set; }

        // BunnyVideoId ELIMINADO a proposito: con el GUID y el id de libreria se podia
        // armar la URL de embed y ver cualquier video premium sin cuenta.
        // El front recibe ThumbnailUrl ya construida y usa /api/videos/{id}/reproducir.

        public string Titulo { get; set; }
        public string? Descripcion { get; set; }

        /// <summary>URL lista para usar del thumbnail. Sustituye a ThumbnailFileName.</summary>
        public string? ThumbnailUrl { get; set; }
        public string? ThumbnailBlurhash { get; set; }  // para mostrar placeholder mientras carga
        public int DuracionSegundos { get; set; }
        public bool EsPremium { get; set; }
        public bool EsPublico { get; set; }
        public StatusVideo Status { get; set; }                 // para saber si ya está listo para reproducir
        public int ProgresoEncoding { get; set; }       // útil si el video sigue procesándose
        public long Vistas { get; set; }
        public string? Categoria { get; set; }
        public string? NombreColeccion { get; set; }    // nombre legible de la colección, no el ID
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Detalle completo (vista de administración)
    // ────────────────────────────────────────────────────────
    public class VideoDetalleDto
    {
        public int Id { get; set; }

        // BunnyVideoId y BunnyLibraryId ELIMINADOS: eran la llave del bypass del paywall.
        // Un administrador puede consultarlos en GET /api/videos/{id}/estadisticas.

        // Información general
        public string Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string? Categoria { get; set; }
        public bool EsPremium { get; set; }
        public bool EsPublico { get; set; }

        // Colección
        public int? VideoCursoId { get; set; }
        public string? NombreColeccion { get; set; }

        // Estado y encoding
        public StatusVideo Status { get; set; }
        public int ProgresoEncoding { get; set; }
        public string? ResolucionesDisponibles { get; set; }
        public string? CodecsOutput { get; set; }
        public bool? JitEncodingHabilitado { get; set; }
        public int EstadoSmartGenerate { get; set; }

        // Técnicos
        public int DuracionSegundos { get; set; }
        public int Ancho { get; set; }
        public int Alto { get; set; }
        public double Framerate { get; set; }
        public int? Rotacion { get; set; }
        public long AlmacenamientoTamano { get; set; }

        // Thumbnail
        /// <summary>URL lista para usar del thumbnail. Sustituye a ThumbnailFileName.</summary>
        public string? ThumbnailUrl { get; set; }
        public int CantidadThumbnails { get; set; }
        public string? ThumbnailBlurhash { get; set; }

        // Reproducción
        public bool TieneMP4Fallback { get; set; }
        public bool? TieneOriginal { get; set; }
        public string? HashOriginal { get; set; }
        public bool? TienePreviewAltaCalidad { get; set; }

        // Transcripción
        public bool TranscripcionHabilitada { get; set; }

        // Subtítulos
        public List<VideoSubtituloResponseDto> Subtitulos { get; set; } = new();

        // Fechas
        public DateTimeOffset FechaSubida { get; set; }
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Estadísticas (solo administradores)
    // ────────────────────────────────────────────────────────
    public class VideoEstadisticasDto
    {
        public int Id { get; set; }
        public string BunnyVideoId { get; set; }
        public string Titulo { get; set; }

        // Métricas disponibles en la entidad
        public long Vistas { get; set; }
        public long TiempoPromedioVista { get; set; }   // en segundos
        public long TiempoTotalVista { get; set; }      // en segundos
        public long AlmacenamientoTamano { get; set; }  // en bytes

        // Estado del video — útil para saber si las métricas son confiables
        public StatusVideo Status { get; set; }
        public int ProgresoEncoding { get; set; }

        // Fechas para contexto
        public DateTimeOffset FechaSubida { get; set; }
    }

    // ────────────────────────────────────────────────────────
    // SALIDA — Reproducción (URL firmada y temporal)
    // ────────────────────────────────────────────────────────
    /// <summary>
    /// Respuesta de GET /api/videos/{id}/reproducir. La URL va firmada y caduca:
    /// es el unico camino legitimo para obtener acceso al contenido.
    /// </summary>
    public class VideoReproduccionDto
    {
        public int Id { get; set; }
        public required string Titulo { get; set; }

        /// <summary>URL de embed de Bunny, firmada y con caducidad.</summary>
        public required string Url { get; set; }

        /// <summary>Momento en que la URL deja de ser valida.</summary>
        public DateTimeOffset ExpiraEn { get; set; }

        public int  DuracionSegundos { get; set; }
        public bool EsPremium { get; set; }
        public string? ResolucionesDisponibles { get; set; }
        public List<VideoSubtituloResponseDto> Subtitulos { get; set; } = [];
    }
}
