using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Videos.Cursos;

namespace SergioApi.Services.Interfaces.Videos.Cursos
{
    public interface IVideoCursoService
    {
        // Crea la colección en Bunny y guarda en DB
        Task<VideoCursoDetalleDto> CrearColeccionAsync(CrearVideoCursoDto dto);

        // Actualiza en Bunny y en DB de forma sincrónica
        Task<VideoCursoDetalleDto> ActualizarColeccionAsync(int id, ActualizarVideoCursoDto dto);

        // Elimina en Bunny y en DB de forma sincrónica
        Task EliminarColeccionAsync(int id);

        // Obtiene la colección con todos sus videos incluidos
        Task<VideoCursoDetalleDto?> ObtenerColeccionAsync(int id, bool incluirNoPublicados = false);

        // Listado paginado con búsqueda opcional por nombre
        Task<PaginadoDto<VideoCursoVistasPreviaDto>> ObtenerColeccionesPaginadasAsync(PaginacionParametrosDto parametros);
    }
}