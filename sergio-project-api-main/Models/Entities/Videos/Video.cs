using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SergioApi.Enums;
using SergioApi.Models.Entities.Videos.Cursos;

namespace SergioApi.Models.Entities.Videos
{
    public class Video
    {

// ================== Claves principales y conexiones entre tablas ==================
        [Key]                                               // Clave primaria declarada por nosotros
        public int Id { get; set; }
        [Required]                                          //Clave foranea de bunny    
        public string BunnyVideoId { get; set; }   // Esta la da bunny, no es una fk en ningun lado, es la guid
// ================= Es la Id que conecta con bunny y la libreria, todos los videos tienen libreria ================
        [Required]
        public long BunnyLibreriaId { get; set; }
        // [ForeignKey("BunnyLibreriaId")]                      // POR AHORA SOLO DEFINIR DE ESTA MANERA, SI ESCALA LO AGREGAREMOS CON BUNNYLIBRARY
        // public BunnyLibrary BunnyLibrary { get; set; }
// ================= Es la Id que conecta con el curso, no todos los videos tienen curso, por eso es nullable ================
        public int? VideoCursoId { get; set; }
        [ForeignKey("VideoCursoId")]
        public VideoCurso? VideoCurso { get; set; }


// ================== Datos del video que se pueden mostrar en la app ==================
        [Required]              //Titulo del video
        [MaxLength(200)]     //Limite de caracteres para el titulo
        public required string Titulo { get; set; }

        public string? Descripcion { get; set; }       //descripcion del video, no es requerida, por eso es nullable
        [Required]
        public DateTimeOffset FechaSubida { get; set; } = DateTimeOffset.UtcNow;
        [Required]                                      // Encontre que se manejan 10 status, no se si eran esos pero ahora se encuentran en un enum
        public StatusVideo Status { get; set; }         //no especifica en la documentacion, pero hay opciones desde 0 hasta 8
        [Required]
        public bool EsPublico { get; set; }     //indica si el video es publico o privado
        [Required]                              // Duracion del video en segundos, en bunny se llama length
        public int DuracionSegundos { get; set; }   
// ================== Especificaciones del video ===================
        [Required]                          
        public int Ancho { get; set; }          // Ancho del video en pixeles
        [Required]
        public int Alto { get; set; }           // Alto del video en pixeles
        [Required]
        public double Framerate { get; set; }   // Framerate del video en bunny 
        
        public int? Rotacion { get; set; }      // Rotacion del video en grados, puede ser null si no se especifica
        [Required]
        public long AlmacenamientoTamano { get; set; }  // Tamano del video en bytes, en bunny se llama StorageSize


        [Required]
        public int ProgresoEncoding { get; set; }       // encodeProgress: 0-100%
        [Required]
        public bool TieneMP4Fallback { get; set; }      // hasMP4Fallback
        [MaxLength(500)]
        public string? NombreArchivoThumbnail { get; set; }  // thumbnailFileName, nullable si aun no se genera
        [Required]
        public int CantidadThumbnails { get; set; }     // thumbnailCount
        [MaxLength(100)]
        public string? ThumbnailBlurhash { get; set; }  // thumbnailBlurhash, nullable igual
        // Sin [Required]: la propiedad es string? y el comentario ya decia que es nullable
        // hasta que Bunny procese, pero el atributo hacia la columna NOT NULL.
        // Como CrearVideoAsync nunca la asigna, TODO POST /api/videos fallaba con
        // una violacion de NOT NULL que salia como 500.
        [MaxLength(200)]
        public string? CodecsOutput { get; set; }       // outputCodecs, nullable hasta que Bunny procese
        [MaxLength(500)]
        public string? ResolucionesDisponibles { get; set; }  // availableResolutions, llega como string CSV "720p,1080p"
        [MaxLength(100)]
        public string? Categoria { get; set; }          // category, opcional

        public bool? JitEncodingHabilitado { get; set; } // jitEncodingEnabled
// AGREGAR EL ENUM, AUN NO ENCUENTRO LOS DIFERENTES VALORES, PARECE IR DE 0 A 4
        public int EstadoSmartGenerate { get; set; }    // smartGenerateStatus              

        public bool? TieneOriginal { get; set; }         // hasOriginal //revisa si el video tiene el archivo original disponible en el almacenamiento

        public string? HashOriginal { get; set; }       // originalHash, nullable

        public bool? TienePreviewAltaCalidad { get; set; } // hasHighQualityPreview
        [Required]
        public long Vistas { get; set; }                // views
        [Required]
        public long TiempoPromedioVista { get; set; }   // averageWatchTime en segundos
        [Required]
        public long TiempoTotalVista { get; set; }      // totalWatchTime en segundos

        [Required]
        public bool EsPremium { get; set; }

        // Al final de Video.cs, junto con las demás propiedades de navegación
        public ICollection<VideoSubtitulo> Subtitulos { get; set; } = new List<VideoSubtitulo>();
    }
}