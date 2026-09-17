// ============================================================
// BunnyLibrary.cs
// ============================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SergioApi.Models.Entities.Videos.Cursos;

namespace SergioApi.Models.Entities.Videos
{
    public class BunnyLibrary
    {
        [Key]
        public int Id { get; set; }

        // ── Identificación en Bunny ──────────────────────────
        public long BunnyLibreriaId { get; set; }            // Id — path param en todas las peticiones

        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; }                  // Name

        // ── Credenciales ─────────────────────────────────────
        [Required]
        [MaxLength(100)]
        public string ApiKey { get; set; }                  // ApiKey — autenticación principal Stream API

        [MaxLength(100)]
        public string? ApiKeyLectura { get; set; }          // ReadOnlyApiKey

        
        // [MaxLength(100)]                                     //LA QUITE POR OBSOLENCIA
        // public string? ApiKeyAcceso { get; set; }           // ApiAccessKey — distinto al ApiKey

        // ── Configuración de seguridad ────────────────────────
        public bool TokenAuthHabilitado { get; set; }       // PlayerTokenAuthenticationEnabled
        public bool DRMHabilitado { get; set; }             // EnableDRM
        public int VersionDRM { get; set; }                 // DrmVersion — 0 = v1, 1 = v2

        // ── Webhook ───────────────────────────────────────────
        [MaxLength(500)]
        public string? WebhookUrl { get; set; }             // WebhookUrl — Bunny notifica a tu back

        // ── Configuración de encoding ─────────────────────────
        [MaxLength(200)]
        public string? ResolucionesHabilitadas { get; set; } // EnabledResolutions — "720p,1080p,1440p"

        public bool HabilitarMP4Fallback { get; set; }      // EnableMP4Fallback
        public bool MantieneArchivosOriginales { get; set; } // KeepOriginalFiles
        public bool PermiteReproduccionDirecta { get; set; } // AllowDirectPlay
        public bool JitEncodingHabilitado { get; set; }     // JitEncodingEnabled
        public int NivelEncoding { get; set; }              // EncodingTier

        [MaxLength(200)]
        public string? CodecsOutput { get; set; }           // OutputCodecs

        // ── Transcripción / Smart Actions ─────────────────────
        public bool TranscripcionHabilitada { get; set; }               // EnableTranscribing
        public bool GenerarTitulosAuto { get; set; }                    // EnableTranscribingTitleGeneration
        public bool GenerarDescripcionesAuto { get; set; }              // EnableTranscribingDescriptionGeneration
        public bool GenerarCapitulosAuto { get; set; }                  // EnableTranscribingChaptersGeneration
        public bool GenerarMomentosAuto { get; set; }                   // EnableTranscribingMomentsGeneration

        // ── Configuración del reproductor ─────────────────────
        [MaxLength(20)]
        public string? ColorPlayer { get; set; }            // PlayerKeyColor — hex color

        public string? HTMLPersonalizado { get; set; }      // CustomHTML — sin MaxLength, puede ser largo

        [MaxLength(200)]
        public string? Controles { get; set; }              // Controls

        [MaxLength(100)]
        public string? VelocidadesReproduccion { get; set; } // PlaybackSpeeds — "0.5,1,1.5,2"

        [MaxLength(100)]
        public string? FamiliaFuente { get; set; }          // FontFamily

        public bool MostrarHeatmap { get; set; }            // ShowHeatmap
        public bool PermitirReproduccionTemprana { get; set; } // AllowEarlyPlay
        public bool RecordarPosicion { get; set; }          // RememberPlayerPosition

        [MaxLength(10)]
        public string? IdiomaUI { get; set; }               // UILanguage — "es", "en"

        // ── Configuración de subtítulos ───────────────────────
        public int TamanoFuenteSubtitulos { get; set; }     // CaptionsFontSize

        [MaxLength(20)]
        public string? ColorFuenteSubtitulos { get; set; }  // CaptionsFontColor — hex color

        [MaxLength(20)]
        public string? FondoSubtitulos { get; set; }        // CaptionsBackground — hex color

        public bool SubtitulosEnPlaylist { get; set; }      // EnableCaptionsInPlaylist

        // ── Marca de agua ─────────────────────────────────────
        public bool TieneMarcaAgua { get; set; }            // HasWatermark
        public int MarcaAguaPosIzquierda { get; set; }      // WatermarkPositionLeft — en %
        public int MarcaAguaPosSuperior { get; set; }       // WatermarkPositionTop — en %
        public int MarcaAguaAncho { get; set; }             // WatermarkWidth — en %
        public int MarcaAguaAlto { get; set; }              // WatermarkHeight — en %

        // ── Métricas ──────────────────────────────────────────
        public long CantidadVideos { get; set; }            // VideoCount
        public long UsoTrafico { get; set; }                // TrafficUsage — en bytes
        public long UsoAlmacenamiento { get; set; }         // StorageUsage — en bytes

        // ── Auditoría ─────────────────────────────────────────
        public DateTime FechaCreacion { get; set; }         // DateCreated
        public DateTime FechaModificacion { get; set; }     // DateModified

        // ── Navegación ────────────────────────────────────────
        public ICollection<VideoCurso> Colecciones { get; set; } = new List<VideoCurso>();
        public ICollection<Video> Videos { get; set; } = new List<Video>();
    }
}