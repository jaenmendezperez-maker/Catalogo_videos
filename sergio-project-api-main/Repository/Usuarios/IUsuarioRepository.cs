using SergioApi.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SergioApi.Repositories
{
    public interface IUsuarioRepository : IRepository<Usuario>
    {
        /// Buscar usuario por correo (para login y validaciones)
        Task<Usuario?> GetByCorreoAsync(string correo);

        /// Usuario con su rol incluido
        Task<Usuario?> GetConRolAsync(int usuarioId);

        /// Usuario con suscripciones activas incluidas (para verificar premium)
        // Task<Usuario?> GetConSuscripcionesAsync(int usuarioId);

        /// Verificar si ya existe un correo registrado
        Task<bool> CorreoExisteAsync(string correo);

        /// Verificar que un rol existe antes de asignarlo (evita violacion de FK -> 500)
        Task<bool> RolExisteAsync(int rolId);

        /// Tiene alguna suscripcion que Mercado Pago aun podria cobrar
        /// (pendiente, activa, pausada o suspendida).
        Task<bool> TieneSuscripcionVivaAsync(int usuarioId);

        /// Tiene cobros registrados: ese historial de pagos debe conservarse.
        Task<bool> TieneCobrosRegistradosAsync(int usuarioId);

        /// Borra sus suscripciones sin ningun cobro (altas abandonadas o fallidas),
        /// para que la FK Restrict no impida eliminar al usuario.
        Task EliminarSuscripcionesSinCobrosAsync(int usuarioId);

        /// Suscripciones del usuario con sus cobros, mas recientes primero (detalle admin).
        Task<List<SergioApi.Models.Entities.Suscripciones.Suscripcion>> ObtenerHistorialSuscripcionesAsync(int usuarioId);

        /// Todos los usuarios con su rol (para listado admin)
        Task<IEnumerable<Usuario>> GetTodosConRolAsync();

        /// Usuarios paginados (para listado admin)
        Task<(IEnumerable<Usuario> Usuarios, int Total)> GetPaginadoAsync(int pagina, int porPagina);
    }
}