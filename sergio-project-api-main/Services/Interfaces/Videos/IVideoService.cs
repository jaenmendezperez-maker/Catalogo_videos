using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Videos;

namespace SergioApi.Services.Interfaces.Videos
{
    public interface IVideoService
    {
        // Crea el objeto en Bunny, sube el archivo y guarda en DB
        Task<VideoDetalleDto> CrearVideoAsync(CrearVideoDto dto, Stream archivo);

        // Actualiza en Bunny y en DB de forma sincrónica
        Task<VideoDetalleDto> ActualizarVideoAsync(int id, ActualizarVideoDto dto);

        // Elimina en Bunny y en DB de forma sincrónica
        Task EliminarVideoAsync(int id);

        // Obtiene el video con sus subtítulos incluidos
        Task<VideoDetalleDto?> ObtenerVideoAsync(int id, bool incluirNoPublicados = false);

        // Listado paginado con búsqueda opcional por título
        Task<PaginadoDto<VideoVistasPreviaDto>> ObtenerVideosPaginadosAsync(PaginacionParametrosDto parametros);

        // Listado paginado de videos dentro de una colección
        Task<PaginadoDto<VideoVistasPreviaDto>> ObtenerVideosPorColeccionAsync(int videoCursoId, PaginacionParametrosDto parametros);

        // Estadísticas del video — solo para administradores
        Task<VideoEstadisticasDto?> ObtenerEstadisticasAsync(int id);

        Task<VideoReproduccionDto> ObtenerUrlReproduccionAsync(int videoId, int usuarioId, bool esAdmin = false);

    }

}