using System.ComponentModel.DataAnnotations;

namespace SergioApi.Configuration
{
    /// <summary>
    /// Configuracion de Bunny Stream (seccion "Bunny").
    /// Se valida al arrancar. Antes, un LibraryId ausente producia un
    /// ArgumentNullException dentro de long.Parse en la primera peticion de video.
    /// </summary>
    public class BunnyOptions
    {
        public const string SectionName = "Bunny";

        [Required(ErrorMessage = "Bunny:ApiKey es obligatoria.")]
        public string ApiKey { get; set; } = string.Empty;

        [Required(ErrorMessage = "Bunny:LibraryId es obligatorio.")]
        [RegularExpression(@"^\d+$", ErrorMessage = "Bunny:LibraryId debe ser numerico.")]
        public string LibraryId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Bunny:CDNHostname es obligatorio.")]
        public string CDNHostname { get; set; } = string.Empty;

        public string ApiBaseUrl { get; set; } = "https://video.bunnycdn.com";

        /// <summary>
        /// Clave de Token Authentication de la libreria. Sin ella no se pueden firmar
        /// las URLs de reproduccion y cualquiera con el GUID del video podria verlo.
        /// Opcional solo en Development.
        /// </summary>
        public string? TokenAuthKey { get; set; }

        /// <summary>LibraryId ya parseado. Seguro tras la validacion de arranque.</summary>
        public long LibraryIdNumerico => long.Parse(LibraryId);
    }
}
