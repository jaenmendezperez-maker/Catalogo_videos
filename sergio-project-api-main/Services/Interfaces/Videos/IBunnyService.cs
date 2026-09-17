using SergioApi.Models.Entities.Videos;
using SergioApi.Models.Entities.Videos.Cursos;

namespace SergioApi.Services.Interfaces.Videos
{
    public interface IBunnyService
    {
        // ── Videos ───────────────────────────────────────────

        // Crea el objeto video en Bunny y retorna el GUID asignado
        Task<string> CrearVideoAsync(string titulo, string? bunnyCollectionId);

        // Sube el archivo binario del video a Bunny
        Task SubirArchivoBinarioAsync(string bunnyVideoId, Stream archivo);

        // Actualiza título, descripción, collectionId, etc. en Bunny
        Task ActualizarVideoAsync(string bunnyVideoId, string? titulo, string? descripcion, string? bunnyCollectionId);

        // Elimina el video de Bunny permanentemente
        Task EliminarVideoAsync(string bunnyVideoId);

        // Obtiene los datos actuales del video desde Bunny
        Task<Video?> ObtenerVideoAsync(string bunnyVideoId);

        // ── Colecciones ───────────────────────────────────────

        // Crea una colección en Bunny y retorna el GUID asignado
        Task<string> CrearColeccionAsync(string nombre);

        // Actualiza el nombre u otros datos de la colección en Bunny
        Task ActualizarColeccionAsync(string bunnyCollectionId, string nombre);

        // Elimina la colección de Bunny
        Task EliminarColeccionAsync(string bunnyCollectionId);

        // ── Subtítulos ────────────────────────────────────────

        // Agrega un subtítulo a un video en Bunny
        Task AgregarSubtituloAsync(string bunnyVideoId, string srclang, string label, Stream archivo);

        // Elimina un subtítulo de un video en Bunny
        Task EliminarSubtituloAsync(string bunnyVideoId, string srclang);

        string GenerarUrlFirmada(string bunnyVideoId, int minutosExpiracion = 120);

        /// <summary>Id de la libreria de Bunny configurada.</summary>
        long LibraryId { get; }

        /// <summary>URL publica del thumbnail, o null si el video aun no tiene.</summary>
        string? ConstruirUrlThumbnail(string bunnyVideoId, string? nombreArchivo);
    }
}