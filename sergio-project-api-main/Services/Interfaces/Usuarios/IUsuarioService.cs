using SergioApi.Models.DTOs.Usuarios;
using SergioApi.Models.DTOs;


namespace SergioApi.Services.Interfaces
{
    public interface IUsuarioService
    {
        /// <summary>Obtiene el perfil del usuario autenticado</summary>
        Task<UsuarioPerfilDto> ObtenerPerfilAsync(int usuarioId);

        /// <summary>Actualiza el perfil del usuario autenticado</summary>
        Task<UsuarioPerfilDto> ActualizarPerfilAsync(int usuarioId, UsuarioPerfilActualizacionDto dto);

        // ── Admin ──────────────────────────────────────────────────────

        /// <summary>Listado paginado de todos los usuarios (solo admin)</summary>
        Task<PaginadoDto<UsuarioListadoDto>> ObtenerTodosAsync(int pagina, int porPagina);

        /// <summary>Detalle completo de un usuario (solo admin)</summary>
        Task<UsuarioDetalleAdminDto> ObtenerDetalleAdminAsync(int usuarioId);

        /// <summary>Actualiza datos de un usuario (solo admin, puede cambiar rol)</summary>
        Task<UsuarioPerfilDto> ActualizarAdminAsync(int usuarioId, UsuarioAdminActualizacionDto dto);

        /// <summary>Elimina un usuario (solo admin)</summary>
        Task EliminarAsync(int usuarioId);
    }
}