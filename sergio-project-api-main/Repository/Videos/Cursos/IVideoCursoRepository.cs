using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Videos.Cursos;

namespace SergioApi.Repositories.Videos
{
    public interface IVideoCursoRepository : IRepository<VideoCurso>
    {
        // Listado paginado con búsqueda por nombre
        Task<PaginadoDto<VideoCurso>> GetPaginadoAsync(PaginacionParametrosDto parametros);

        // Obtener colección con todos sus videos incluidos
        Task<VideoCurso?> GetConVideosAsync(int id, bool incluirNoPublicados = false);

        // Obtener colección por el GUID que maneja Bunny
        Task<VideoCurso?> GetPorBunnyCollectionIdAsync(string bunnyCollectionId);
    }
}