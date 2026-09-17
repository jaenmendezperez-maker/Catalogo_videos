using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Videos;
using SergioApi.Models.Entities.Videos;
using SergioApi.Exceptions;
using SergioApi.Repositories;
using SergioApi.Repositories.Videos;
using SergioApi.Services.Interfaces.Videos;
using SergioApi.Utils;

namespace SergioApi.Services.Implementations.Videos
{
    public class VideoService : IVideoService
    {
        private readonly IVideoRepository _videoRepository;
        private readonly IVideoCursoRepository _cursoRepository;
        private readonly IBunnyService    _bunnyService;
        private readonly IUsuarioRepository _usuarioRepository;

        public VideoService(
            IVideoRepository videoRepository,
            IVideoCursoRepository cursoRepository,
            IUsuarioRepository usuarioRepository,
            IBunnyService bunnyService)
        {
            _videoRepository   = videoRepository;
            _cursoRepository   = cursoRepository;
            _usuarioRepository = usuarioRepository;
            _bunnyService      = bunnyService;
        }

        public async Task<VideoDetalleDto> CrearVideoAsync(CrearVideoDto dto, Stream archivo)
        {
            // 1. Resolver el GUID de la coleccion en Bunny (no nuestro PK) y validar
            //    que existe: antes un VideoCursoId inexistente salia como 500 por FK.
            var coleccionGuid = await ResolverColeccionGuidAsync(dto.VideoCursoId);

            // 2. Crear objeto video en Bunny — obtenemos el GUID
            var bunnyVideoId = await _bunnyService.CrearVideoAsync(dto.Titulo, coleccionGuid);

            // 2. Subir el archivo binario a Bunny
            await _bunnyService.SubirArchivoBinarioAsync(bunnyVideoId, archivo);

            // 3. Guardar en nuestra DB con los datos que ya tenemos
            var video = new Video
            {
                BunnyVideoId  = bunnyVideoId,
                // Es [Required] en el modelo y antes nunca se asignaba: se guardaba 0.
                BunnyLibreriaId = _bunnyService.LibraryId,
                Titulo        = dto.Titulo,
                Descripcion   = dto.Descripcion,
                EsPremium     = dto.EsPremium,
                EsPublico     = dto.EsPublico,
                VideoCursoId  = dto.VideoCursoId,
                Categoria     = dto.Categoria,
                FechaSubida   = DateTimeOffset.UtcNow,
                Status        = 0   // Bunny inicia en estado Created
            };

            await _videoRepository.AddAsync(video);

            // 4. Retornar el detalle del video recién creado
            return MapToDetalleDto(video);
        }

        public async Task<VideoDetalleDto> ActualizarVideoAsync(int id, ActualizarVideoDto dto)
        {
            var video = await _videoRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Video con id {id} no encontrado");

            // Resolver la coleccion antes de tocar nada, para fallar pronto si no existe.
            var coleccionGuid = dto.VideoCursoId != null
                ? await ResolverColeccionGuidAsync(dto.VideoCursoId)
                : null;

            // 1. Actualizar en Bunny solo si hay algo que actualizar.
            //    Antes se llamaba siempre, incluso con un body vacio.
            if (dto.Titulo != null || dto.Descripcion != null || coleccionGuid != null)
            {
                await _bunnyService.ActualizarVideoAsync(
                    video.BunnyVideoId,
                    dto.Titulo,
                    dto.Descripcion,
                    coleccionGuid);
            }

            // 2. Actualizar en nuestra DB solo los campos que vienen con valor
            if (dto.Titulo       != null) video.Titulo      = dto.Titulo;
            if (dto.Descripcion  != null) video.Descripcion = dto.Descripcion;
            if (dto.EsPremium    != null) video.EsPremium   = dto.EsPremium.Value;
            if (dto.EsPublico    != null) video.EsPublico   = dto.EsPublico.Value;
            if (dto.VideoCursoId != null) video.VideoCursoId = dto.VideoCursoId;
            if (dto.Categoria    != null) video.Categoria   = dto.Categoria;

            await _videoRepository.UpdateAsync(video);

            return MapToDetalleDto(video);
        }

        public async Task EliminarVideoAsync(int id)
        {
            var video = await _videoRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Video con id {id} no encontrado");

            // 1. Eliminar en Bunny primero
            await _bunnyService.EliminarVideoAsync(video.BunnyVideoId);

            // 2. Eliminar en nuestra DB
            // Los subtítulos se eliminan automáticamente por el Cascade definido en AppDbContext
            await _videoRepository.DeleteAsync(id);
        }

        public async Task<VideoDetalleDto?> ObtenerVideoAsync(int id, bool incluirNoPublicados = false)
        {
            // Carga el video con sus subtítulos incluidos
            var video = await _videoRepository.GetConSubtitulosAsync(id);
            if (video == null) return null;

            // Un borrador devuelve 404, no 403: no conviene revelar que existe.
            if (!video.EsPublico && !incluirNoPublicados) return null;

            return MapToDetalleDto(video);
        }

        public async Task<PaginadoDto<VideoVistasPreviaDto>> ObtenerVideosPaginadosAsync(
            PaginacionParametrosDto parametros)
        {
            var paginado = await _videoRepository.GetPaginadoAsync(parametros);

            return new PaginadoDto<VideoVistasPreviaDto>
            {
                Datos      = paginado.Datos.Select(MapToVistasPreviaDto),
                Total      = paginado.Total,
                Pagina     = paginado.Pagina,
                PorPagina  = paginado.PorPagina
            };
        }

        public async Task<PaginadoDto<VideoVistasPreviaDto>> ObtenerVideosPorColeccionAsync(
            int videoCursoId,
            PaginacionParametrosDto parametros)
        {
            var paginado = await _videoRepository.GetPorColeccionAsync(videoCursoId, parametros);

            return new PaginadoDto<VideoVistasPreviaDto>
            {
                Datos      = paginado.Datos.Select(MapToVistasPreviaDto),
                Total      = paginado.Total,
                Pagina     = paginado.Pagina,
                PorPagina  = paginado.PorPagina
            };
        }

        public async Task<VideoEstadisticasDto?> ObtenerEstadisticasAsync(int id)
        {
            var video = await _videoRepository.GetByIdAsync(id);
            if (video == null) return null;

            return new VideoEstadisticasDto
            {
                Id                   = video.Id,
                BunnyVideoId         = video.BunnyVideoId,
                Titulo               = video.Titulo,
                Vistas               = video.Vistas,
                TiempoPromedioVista  = video.TiempoPromedioVista,
                TiempoTotalVista     = video.TiempoTotalVista,
                AlmacenamientoTamano = video.AlmacenamientoTamano,
                Status               = video.Status,
                ProgresoEncoding     = video.ProgresoEncoding,
                FechaSubida          = video.FechaSubida
            };
        }

        public async Task<VideoReproduccionDto> ObtenerUrlReproduccionAsync(
            int videoId, int usuarioId, bool esAdmin = false)
        {
            // GetConSubtitulosAsync incluye VideoCurso: hace falta para la regla del curso.
            var video = await _videoRepository.GetConSubtitulosAsync(videoId)
                ?? throw new KeyNotFoundException($"Video con id {videoId} no encontrado");

            // Borrador: 404 para todo el que no sea admin.
            if (!video.EsPublico && !esAdmin)
                throw new KeyNotFoundException($"Video con id {videoId} no encontrado");

            // Un curso premium hace premium a todos sus videos. Antes solo se miraba el
            // flag del video, asi que un video no premium de un curso premium se veia gratis.
            if (AccesoPremium.RequierePremium(video) && !esAdmin)
            {
                var usuario = await _usuarioRepository.GetByIdAsync(usuarioId)
                    ?? throw new UnauthorizedAccessException("Usuario no encontrado");

                // Se decide por la FECHA de vencimiento, no por el flag EsPremium: asi el
                // acceso caduca solo, sin depender de que corra ningun proceso.
                // 403 y no 401: el usuario esta correctamente identificado, lo que le falta
                // es la suscripcion. Ante un 401 el cliente reintentaria refrescar el
                // token, que aqui no arregla nada.
                if (!AccesoPremium.EstaVigente(usuario))
                    throw new AccesoProhibidoException(
                        "Necesitas una suscripción premium para ver este video.");
            }

            // NOTA: deliberadamente NO se comprueba video.Status. Sin el webhook de Bunny
            // el Status se queda en 0 para siempre, asi que filtrar por el dejaria el
            // endpoint inservible. Ver docs/04-decisiones-de-diseno.md.
            const int minutosVigencia = 120;

            return new VideoReproduccionDto
            {
                Id       = video.Id,
                Titulo   = video.Titulo,
                Url      = _bunnyService.GenerarUrlFirmada(video.BunnyVideoId, minutosVigencia),
                ExpiraEn = DateTimeOffset.UtcNow.AddMinutes(minutosVigencia),
                DuracionSegundos        = video.DuracionSegundos,
                EsPremium               = AccesoPremium.RequierePremium(video),
                ResolucionesDisponibles = video.ResolucionesDisponibles,
                Subtitulos = video.Subtitulos?.Select(sb => new VideoSubtituloResponseDto
                {
                    Id      = sb.Id,
                    Srclang = sb.Srclang,
                    Label   = sb.Label,
                    Version = sb.Version
                }).ToList() ?? []
            };
        }

        /// <summary>
        /// Traduce nuestro VideoCursoId (PK int) al GUID de coleccion que espera Bunny,
        /// validando de paso que la coleccion existe.
        /// </summary>
        private async Task<string?> ResolverColeccionGuidAsync(int? videoCursoId)
        {
            if (videoCursoId is null) return null;

            var curso = await _cursoRepository.GetByIdAsync(videoCursoId.Value)
                ?? throw new ReglaNegocioException($"La colección {videoCursoId} no existe.");

            return curso.BunnyColleccionId;
        }

        // ── Mappers privados ──────────────────────────────────────
        // Temporales hasta que implementes AutoMapper o Mapster
        //
        // EsPremium expone el valor EFECTIVO (video o su curso), para que el catalogo
        // muestre el candado en los mismos videos que luego exigen suscripcion.

        private VideoDetalleDto MapToDetalleDto(Video v) => new()
        {
            Id                      = v.Id,
            Titulo                  = v.Titulo,
            Descripcion             = v.Descripcion,
            Categoria               = v.Categoria,
            EsPremium               = AccesoPremium.RequierePremium(v),
            EsPublico               = v.EsPublico,
            VideoCursoId            = v.VideoCursoId,
            NombreColeccion         = v.VideoCurso?.Nombre,
            Status                  = v.Status,
            ProgresoEncoding        = v.ProgresoEncoding,
            ResolucionesDisponibles = v.ResolucionesDisponibles,
            CodecsOutput            = v.CodecsOutput,
            JitEncodingHabilitado   = v.JitEncodingHabilitado,
            EstadoSmartGenerate     = v.EstadoSmartGenerate,
            DuracionSegundos        = v.DuracionSegundos,
            Ancho                   = v.Ancho,
            Alto                    = v.Alto,
            Framerate               = v.Framerate,
            Rotacion                = v.Rotacion,
            AlmacenamientoTamano    = v.AlmacenamientoTamano,
            ThumbnailUrl            = _bunnyService.ConstruirUrlThumbnail(v.BunnyVideoId, v.NombreArchivoThumbnail),
            CantidadThumbnails      = v.CantidadThumbnails,
            ThumbnailBlurhash       = v.ThumbnailBlurhash,
            TieneMP4Fallback        = v.TieneMP4Fallback,
            TieneOriginal           = v.TieneOriginal,
            HashOriginal            = v.HashOriginal,
            TienePreviewAltaCalidad = v.TienePreviewAltaCalidad,
            FechaSubida             = v.FechaSubida,
            Subtitulos              = v.Subtitulos?
                .Select(s => new VideoSubtituloResponseDto
                {
                    Id       = s.Id,
                    Srclang  = s.Srclang,
                    Label    = s.Label,
                    Version  = s.Version
                }).ToList() ?? []
        };

        private VideoVistasPreviaDto MapToVistasPreviaDto(Video v) => new()
        {
            Id                = v.Id,
            Titulo            = v.Titulo,
            Descripcion       = v.Descripcion,
            ThumbnailUrl      = _bunnyService.ConstruirUrlThumbnail(v.BunnyVideoId, v.NombreArchivoThumbnail),
            ThumbnailBlurhash = v.ThumbnailBlurhash,
            DuracionSegundos  = v.DuracionSegundos,
            EsPremium         = AccesoPremium.RequierePremium(v),
            EsPublico         = v.EsPublico,
            Status            = v.Status,
            ProgresoEncoding  = v.ProgresoEncoding,
            Vistas            = v.Vistas,
            Categoria         = v.Categoria,
            NombreColeccion   = v.VideoCurso?.Nombre
        };
    }
}
