using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Videos;
using SergioApi.Models.DTOs.Videos.Cursos;
using SergioApi.Models.Entities.Videos.Cursos;
using SergioApi.Repositories.Videos;
using SergioApi.Services.Interfaces.Videos;
using SergioApi.Services.Interfaces.Videos.Cursos;

namespace SergioApi.Services.Implementations.Videos.Cursos
{
    public class VideoCursoService : IVideoCursoService
    {
        private readonly IVideoCursoRepository _cursoRepository;
        private readonly IBunnyService         _bunnyService;

        public VideoCursoService(IVideoCursoRepository cursoRepository, IBunnyService bunnyService)
        {
            _cursoRepository = cursoRepository;
            _bunnyService    = bunnyService;
        }

        public async Task<VideoCursoDetalleDto> CrearColeccionAsync(CrearVideoCursoDto dto)
        {
            // 1. Crear colección en Bunny — obtenemos el GUID
            var bunnyCollectionId = await _bunnyService.CrearColeccionAsync(dto.Nombre);

            // 2. Guardar en nuestra DB
            var curso = new VideoCurso
            {
                BunnyColleccionId = bunnyCollectionId,
                // Es [Required] y antes nunca se asignaba: se guardaba 0.
                BunnyLibreriaId   = _bunnyService.LibraryId,
                Nombre            = dto.Nombre,
                EsPremium         = dto.EsPremium,
                CantidadVideos    = 0,
                TamanoTotal       = 0
            };

            await _cursoRepository.AddAsync(curso);

            return MapToDetalleDto(curso);
        }

        public async Task<VideoCursoDetalleDto> ActualizarColeccionAsync(int id, ActualizarVideoCursoDto dto)
        {
            var curso = await _cursoRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Colección con id {id} no encontrada");

            // 1. Actualizar en Bunny si viene un nombre nuevo
            if (dto.Nombre != null)
                await _bunnyService.ActualizarColeccionAsync(curso.BunnyColleccionId, dto.Nombre);

            // 2. Actualizar en nuestra DB
            if (dto.Nombre    != null) curso.Nombre    = dto.Nombre;
            if (dto.EsPremium != null) curso.EsPremium = dto.EsPremium.Value;

            await _cursoRepository.UpdateAsync(curso);

            return MapToDetalleDto(curso);
        }

        public async Task EliminarColeccionAsync(int id)
        {
            var curso = await _cursoRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Colección con id {id} no encontrada");

            // 1. Eliminar en Bunny primero
            await _bunnyService.EliminarColeccionAsync(curso.BunnyColleccionId);

            // 2. Eliminar en nuestra DB
            await _cursoRepository.DeleteAsync(id);
        }

        public async Task<VideoCursoDetalleDto?> ObtenerColeccionAsync(int id, bool incluirNoPublicados = false)
        {
            var curso = await _cursoRepository.GetConVideosAsync(id, incluirNoPublicados);
            if (curso == null) return null;

            return MapToDetalleDto(curso);
        }

        public async Task<PaginadoDto<VideoCursoVistasPreviaDto>> ObtenerColeccionesPaginadasAsync(
            PaginacionParametrosDto parametros)
        {
            var paginado = await _cursoRepository.GetPaginadoAsync(parametros);

            return new PaginadoDto<VideoCursoVistasPreviaDto>
            {
                Datos     = paginado.Datos.Select(MapToVistasPreviaDto),
                Total     = paginado.Total,
                Pagina    = paginado.Pagina,
                PorPagina = paginado.PorPagina
            };
        }

        // ── Mappers privados ──────────────────────────────────────
        // No pueden ser static: necesitan _bunnyService para construir las URLs
        // de thumbnail sin exponer el GUID del video.

        private VideoCursoDetalleDto MapToDetalleDto(VideoCurso c) => new()
        {
            Id                = c.Id,
            // BunnyCollectionId / BunnyLibraryId / PreviewVideoIds ya no se exponen:
            // PreviewVideoIds era un CSV de GUIDs de video, la misma llave del bypass.
            Nombre            = c.Nombre,
            EsPremium         = c.EsPremium,
            CantidadVideos    = c.CantidadVideos,
            TamanoTotal       = c.TamanoTotal,
            Videos            = c.Videos?
                .Select(v => new VideoVistasPreviaDto
                {
                    Id                = v.Id,
                    Titulo            = v.Titulo,
                    Descripcion       = v.Descripcion,
                    ThumbnailUrl      = _bunnyService.ConstruirUrlThumbnail(v.BunnyVideoId, v.NombreArchivoThumbnail),
                    ThumbnailBlurhash = v.ThumbnailBlurhash,
                    DuracionSegundos  = v.DuracionSegundos,
                    // Premium efectivo: un curso premium hace premium a todos sus videos.
                    EsPremium         = v.EsPremium || c.EsPremium,
                    EsPublico         = v.EsPublico,
                    Status            = v.Status,
                    ProgresoEncoding  = v.ProgresoEncoding,
                    Vistas            = v.Vistas,
                    Categoria         = v.Categoria,
                    NombreColeccion   = c.Nombre
                }).ToList() ?? []
        };

        private VideoCursoVistasPreviaDto MapToVistasPreviaDto(VideoCurso c) => new()
        {
            Id                = c.Id,
            Nombre            = c.Nombre,
            EsPremium         = c.EsPremium,
            CantidadVideos    = c.CantidadVideos,
            TamanoTotal       = c.TamanoTotal
        };
    }
}