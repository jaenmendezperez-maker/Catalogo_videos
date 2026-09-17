using Microsoft.EntityFrameworkCore;
using SergioApi.Data;
using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Videos.Cursos;

namespace SergioApi.Repositories.Videos
{
    public class VideoCursoRepository : Repository<VideoCurso>, IVideoCursoRepository
    {
        public VideoCursoRepository(AppDbContext context) : base(context) { }

        public async Task<PaginadoDto<VideoCurso>> GetPaginadoAsync(PaginacionParametrosDto parametros)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(parametros.Busqueda))
                query = query.Where(c => c.Nombre.Contains(parametros.Busqueda));

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(c => c.Nombre)                     // colecciones ordenadas alfabéticamente
                .Skip(parametros.Salto)
                .Take(parametros.PorPagina)
                .ToListAsync();

            return new PaginadoDto<VideoCurso>
            {
                Datos      = items,
                Total      = total,
                Pagina     = parametros.Pagina,
                PorPagina  = parametros.PorPagina
            };
        }

        /// <summary>Maximo de videos que se devuelven anidados en el detalle de una coleccion.</summary>
        /// <remarks>
        /// Sin este tope, el Include cargaba TODOS los videos del curso: el coste de una
        /// peticion anonima lo elegia el atacante escogiendo la coleccion mas poblada.
        /// El listado completo esta paginado en GET /api/videos/coleccion/{id}.
        /// </remarks>
        public const int MaxVideosAnidados = 50;

        public async Task<VideoCurso?> GetConVideosAsync(int id, bool incluirNoPublicados = false) =>
            await _dbSet
                .Include(c => c.Videos
                    .Where(v => incluirNoPublicados || v.EsPublico)
                    .OrderByDescending(v => v.FechaSubida)
                    .Take(MaxVideosAnidados))                     // carga los videos de la colección, acotados
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<VideoCurso?> GetPorBunnyCollectionIdAsync(string bunnyCollectionId) =>
            await _dbSet
                .FirstOrDefaultAsync(c => c.BunnyColleccionId == bunnyCollectionId);
    }
}