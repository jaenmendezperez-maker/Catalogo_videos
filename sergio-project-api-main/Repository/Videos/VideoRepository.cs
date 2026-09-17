using Microsoft.EntityFrameworkCore;
using SergioApi.Data;
using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Videos;

namespace SergioApi.Repositories.Videos
{
    public class VideoRepository : Repository<Video>, IVideoRepository
    {
        public VideoRepository(AppDbContext context) : base(context) { }

        public async Task<PaginadoDto<Video>> GetPaginadoAsync(PaginacionParametrosDto parametros)
        {
            // Include para poder rellenar NombreColeccion, que antes salia siempre null.
            var query = _dbSet.Include(v => v.VideoCurso).AsQueryable();

            // Los borradores (EsPublico = false) solo son visibles para Admin.
            // El flag lo pone el controller, nunca el query string (ver [BindNever]).
            if (!parametros.IncluirNoPublicados)
                query = query.Where(v => v.EsPublico);

            // Filtro por búsqueda si viene del front
            if (!string.IsNullOrWhiteSpace(parametros.Busqueda))
                query = query.Where(v => v.Titulo.Contains(parametros.Busqueda));

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(v => v.FechaSubida)     // más recientes primero
                .Skip(parametros.Salto)
                .Take(parametros.PorPagina)
                .ToListAsync();

            return new PaginadoDto<Video>
            {
                Datos      = items,
                Total      = total,
                Pagina     = parametros.Pagina,
                PorPagina  = parametros.PorPagina
            };
        }

        public async Task<PaginadoDto<Video>> GetPorColeccionAsync(int videoCursoId, PaginacionParametrosDto parametros)
        {
            var query = _dbSet
                .Include(v => v.VideoCurso)
                .Where(v => v.VideoCursoId == videoCursoId)
                .AsQueryable();

            if (!parametros.IncluirNoPublicados)
                query = query.Where(v => v.EsPublico);

            if (!string.IsNullOrWhiteSpace(parametros.Busqueda))
                query = query.Where(v => v.Titulo.Contains(parametros.Busqueda));

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(v => v.FechaSubida)
                .Skip(parametros.Salto)
                .Take(parametros.PorPagina)
                .ToListAsync();

            return new PaginadoDto<Video>
            {
                Datos      = items,
                Total      = total,
                Pagina     = parametros.Pagina,
                PorPagina  = parametros.PorPagina
            };
        }

        public async Task<Video?> GetConSubtitulosAsync(int id) =>
            await _dbSet
                .Include(v => v.Subtitulos)     // carga los subtítulos en la misma consulta
                .Include(v => v.VideoCurso)     // para NombreColeccion
                .FirstOrDefaultAsync(v => v.Id == id);

        public async Task<Video?> GetPorBunnyVideoIdAsync(string bunnyVideoId) =>
            await _dbSet
                .FirstOrDefaultAsync(v => v.BunnyVideoId == bunnyVideoId);
    }
}