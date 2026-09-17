using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Videos;

namespace SergioApi.Repositories.Videos
{
    public interface IVideoRepository : IRepository<Video>
    {
        // Listado paginado con búsqueda por título
        Task<PaginadoDto<Video>> GetPaginadoAsync(PaginacionParametrosDto parametros);

        // Listado paginado de videos dentro de una colección
        Task<PaginadoDto<Video>> GetPorColeccionAsync(int videoCursoId, PaginacionParametrosDto parametros);

        // Obtener video con sus subtítulos incluidos
        Task<Video?> GetConSubtitulosAsync(int id);

        // Obtener video por el GUID que maneja Bunny
        Task<Video?> GetPorBunnyVideoIdAsync(string bunnyVideoId);
    }
}
