using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Usuarios;
using SergioApi.Exceptions;
using SergioApi.Repositories;
using SergioApi.Services.Interfaces;
using SergioApi.Utils;

namespace SergioApi.Services.Implementations.Usuarios
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepo;
        private readonly IJwtService _jwtService;

        public UsuarioService(IUsuarioRepository usuarioRepo, IJwtService jwtService)
        {
            _usuarioRepo = usuarioRepo;
            _jwtService  = jwtService;
        }

        // ─────────────────────────────────────────
        // PERFIL PROPIO
        // ─────────────────────────────────────────
        public async Task<UsuarioPerfilDto> ObtenerPerfilAsync(int usuarioId)
        {
            var usuario = await _usuarioRepo.GetConRolAsync(usuarioId)
                ?? throw new KeyNotFoundException("Usuario no encontrado.");

            return new UsuarioPerfilDto
            {
                Id                      = usuario.Id,
                Nombre                  = usuario.Nombre,
                Correo                  = usuario.Correo,
                Telefono                = usuario.Telefono ?? string.Empty,
                FotoPerfil              = usuario.FotoPerfil,
                // Calculado por fecha, igual que el control de acceso a los videos.
                EsPremium               = AccesoPremium.EstaVigente(usuario),
                FechaVencimientoPremium = usuario.FechaVencimientoPremium,
                FechaRegistro           = usuario.FechaRegistro,
            };
        }

        // ─────────────────────────────────────────
        // ACTUALIZAR PERFIL PROPIO
        // ─────────────────────────────────────────
        public async Task<UsuarioPerfilDto> ActualizarPerfilAsync(int usuarioId, UsuarioPerfilActualizacionDto dto)
        {
            var usuario = await _usuarioRepo.GetConRolAsync(usuarioId)
                ?? throw new KeyNotFoundException("Usuario no encontrado.");

            if (dto.Nombre     is not null) usuario.Nombre     = dto.Nombre;
            if (dto.Telefono   is not null) usuario.Telefono   = dto.Telefono;
            if (dto.FotoPerfil is not null) usuario.FotoPerfil = dto.FotoPerfil;

            // Comparar YA normalizado en ambos lados. Antes se comparaba en crudo, asi que
            // reenviar el mismo correo con otra capitalizacion entraba en este bloque y
            // fallaba con "ese correo ya esta en uso" contra el propio usuario.
            var correoCambio = false;
            if (dto.Correo is not null)
            {
                var correoNuevo = NormalizadorCorreo.Normalizar(dto.Correo);
                if (correoNuevo != usuario.Correo)
                {
                    if (await _usuarioRepo.CorreoExisteAsync(correoNuevo))
                        throw new ReglaNegocioException("Ese correo ya está en uso.");

                    usuario.Correo = correoNuevo;
                    correoCambio   = true;
                }
            }

            await _usuarioRepo.UpdateAsync(usuario);

            // El correo es la identidad de login: si cambia, las sesiones vivas se cierran.
            if (correoCambio)
                await _jwtService.RevocarTodosDelUsuarioAsync(usuarioId);

            return await ObtenerPerfilAsync(usuarioId);
        }

        // ─────────────────────────────────────────
        // ADMIN — LISTADO PAGINADO
        // ─────────────────────────────────────────
        public async Task<PaginadoDto<UsuarioListadoDto>> ObtenerTodosAsync(int pagina, int porPagina)
        {
            var (usuarios, total) = await _usuarioRepo.GetPaginadoAsync(pagina, porPagina);
            var ahora = DateTimeOffset.UtcNow;

            return new PaginadoDto<UsuarioListadoDto>
            {
                Datos = usuarios.Select(u => new UsuarioListadoDto
                {
                    Id                = u.Id,
                    Nombre            = u.Nombre,
                    Correo            = u.Correo,
                    Telefono          = u.Telefono ?? string.Empty,
                    FotoPerfil        = u.FotoPerfil,
                    Rol               = u.Rol?.Nombre ?? "Usuario",
                    EsPremium         = AccesoPremium.EstaVigente(u.FechaVencimientoPremium, ahora),
                    FechaRegistro     = u.FechaRegistro,
                    TotalCursosVistos = 0,  // TODO: conectar con módulo de cursos
                }),
                Total     = total,
                Pagina    = pagina,
                PorPagina = porPagina,
            };
        }

        // ─────────────────────────────────────────
        // ADMIN — DETALLE COMPLETO
        // ─────────────────────────────────────────
        public async Task<UsuarioDetalleAdminDto> ObtenerDetalleAdminAsync(int usuarioId)
        {
            var usuario = await _usuarioRepo.GetConRolAsync(usuarioId)
                ?? throw new KeyNotFoundException("Usuario no encontrado.");

            var suscripciones = await _usuarioRepo.ObtenerHistorialSuscripcionesAsync(usuarioId);

            return new UsuarioDetalleAdminDto
            {
                Id            = usuario.Id,
                Nombre        = usuario.Nombre,
                Correo        = usuario.Correo,
                Telefono      = usuario.Telefono ?? string.Empty,
                FotoPerfil    = usuario.FotoPerfil,
                Rol           = usuario.Rol?.Nombre ?? "Usuario",
                FechaRegistro = usuario.FechaRegistro,
                EsPremium     = AccesoPremium.EstaVigente(usuario),
                HistorialSuscripciones = suscripciones.Select(s => new SuscripcionResumenDto
                {
                    Id                 = s.Id,
                    Estado             = s.Estado.ToString(),
                    Monto              = s.Monto,
                    Moneda             = s.Moneda,
                    FechaCreacion      = s.FechaCreacion,
                    FechaAutorizacion  = s.FechaAutorizacion,
                    FechaCancelacion   = s.FechaCancelacion,
                    PeriodoPagadoHasta = s.PeriodoPagadoHasta,
                    AccesoHasta        = s.AccesoHasta,
                    CobrosAprobados    = s.Pagos.Count(p =>
                        SergioApi.Services.Implementations.Suscripciones.CalculadoraAcceso.EsPagoAprobado(p.EstadoPago)),
                }).ToList(),
                TotalCursosIniciados     = 0,
                TotalCursosCompletados   = 0,
                TotalVideosVistos        = 0,
                TiempoTotalVisualizacion = TimeSpan.Zero,
            };
        }

        // ─────────────────────────────────────────
        // ADMIN — ACTUALIZAR USUARIO
        // ─────────────────────────────────────────
        public async Task<UsuarioPerfilDto> ActualizarAdminAsync(int usuarioId, UsuarioAdminActualizacionDto dto)
        {
            var usuario = await _usuarioRepo.GetConRolAsync(usuarioId)
                ?? throw new KeyNotFoundException("Usuario no encontrado.");

            if (dto.Nombre     is not null) usuario.Nombre     = dto.Nombre;
            if (dto.Telefono   is not null) usuario.Telefono   = dto.Telefono;
            if (dto.FotoPerfil is not null) usuario.FotoPerfil = dto.FotoPerfil;
            if (dto.RolId is not null)
            {
                // Sin esta comprobacion, un RolId inexistente provocaba una violacion
                // de clave foranea que salia como 500 en vez de 400.
                if (!await _usuarioRepo.RolExisteAsync(dto.RolId.Value))
                    throw new ReglaNegocioException($"El rol {dto.RolId.Value} no existe.");

                usuario.RolId = dto.RolId.Value;
            }

            // Comparar YA normalizado en ambos lados. Antes se comparaba en crudo, asi que
            // reenviar el mismo correo con otra capitalizacion entraba en este bloque y
            // fallaba con "ese correo ya esta en uso" contra el propio usuario.
            var correoCambio = false;
            if (dto.Correo is not null)
            {
                var correoNuevo = NormalizadorCorreo.Normalizar(dto.Correo);
                if (correoNuevo != usuario.Correo)
                {
                    if (await _usuarioRepo.CorreoExisteAsync(correoNuevo))
                        throw new ReglaNegocioException("Ese correo ya está en uso.");

                    usuario.Correo = correoNuevo;
                    correoCambio   = true;
                }
            }

            await _usuarioRepo.UpdateAsync(usuario);

            // El correo es la identidad de login: si cambia, las sesiones vivas se cierran.
            if (correoCambio)
                await _jwtService.RevocarTodosDelUsuarioAsync(usuarioId);

            return await ObtenerPerfilAsync(usuarioId);
        }

        // ─────────────────────────────────────────
        // ADMIN — ELIMINAR
        // ─────────────────────────────────────────
        public async Task EliminarAsync(int usuarioId)
        {
            var usuario = await _usuarioRepo.GetConRolAsync(usuarioId)
                ?? throw new KeyNotFoundException("Usuario no encontrado.");

            if (usuario.Rol?.Nombre == "Admin")
                throw new ReglaNegocioException("No se puede eliminar una cuenta de administrador.");

            // Borrar a alguien con una suscripcion viva dejaria a Mercado Pago cobrandole
            // cada mes a una persona que ya no tiene cuenta. Primero hay que cancelarla.
            if (await _usuarioRepo.TieneSuscripcionVivaAsync(usuarioId))
                throw new ConflictoException(
                    "El usuario tiene una suscripción activa o pendiente. Cancélala antes de eliminarlo.");

            // Aunque ya no este viva, un historial de COBROS tiene que conservarse: la FK
            // es Restrict y un borrado fallaria con un 500. Mejor un mensaje claro.
            if (await _usuarioRepo.TieneCobrosRegistradosAsync(usuarioId))
                throw new ConflictoException(
                    "El usuario tiene pagos registrados, que deben conservarse.");

            // Quedan, como mucho, altas abandonadas o fallidas sin ningun cobro. No
            // aportan nada y, por la FK Restrict, impedirian borrar a quien solo pulso
            // "suscribirme" y nunca pago.
            await _usuarioRepo.EliminarSuscripcionesSinCobrosAsync(usuarioId);

            await _usuarioRepo.DeleteAsync(usuarioId);
        }
    }
}
