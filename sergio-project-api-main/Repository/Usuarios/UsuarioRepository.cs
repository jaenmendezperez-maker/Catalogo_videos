using Microsoft.EntityFrameworkCore;
using SergioApi.Data;
using SergioApi.Enums;
using SergioApi.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SergioApi.Repositories
{
    public class UsuarioRepository : Repository<Usuario>, IUsuarioRepository
    {
        // Estados en los que Mercado Pago todavia podria cobrar. Suspendida y Pausada
        // cuentan: el pagador puede reanudarlas desde su app de Mercado Pago.
        private static readonly EstadoSuscripcion[] EstadosVivos =
        [
            EstadoSuscripcion.PendientePago,
            EstadoSuscripcion.Activa,
            EstadoSuscripcion.Pausada,
            EstadoSuscripcion.Suspendida,
        ];

        public UsuarioRepository(AppDbContext context) : base(context) { }

        public async Task<Usuario?> GetByCorreoAsync(string correo) =>
            await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo == correo);

        public async Task<Usuario?> GetConRolAsync(int usuarioId) =>
            await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == usuarioId);

        // public async Task<Usuario?> GetConSuscripcionesAsync(int usuarioId) =>
        //     await _context.Usuarios
        //         .Include(u => u.Rol)
        //         .Include(u => u.Suscripciones)
        //         .FirstOrDefaultAsync(u => u.Id == usuarioId);

        public async Task<bool> CorreoExisteAsync(string correo) =>
            await _context.Usuarios.AnyAsync(u => u.Correo == correo);

        public async Task<bool> RolExisteAsync(int rolId) =>
            await _context.Roles.AnyAsync(r => r.Id == rolId);

        public async Task<bool> TieneSuscripcionVivaAsync(int usuarioId) =>
            await _context.Suscripciones
                .AnyAsync(s => s.UsuarioId == usuarioId && EstadosVivos.Contains(s.Estado));

        public async Task<bool> TieneCobrosRegistradosAsync(int usuarioId) =>
            await _context.PagosSuscripcion
                .AnyAsync(p => p.Suscripcion.UsuarioId == usuarioId);

        public async Task EliminarSuscripcionesSinCobrosAsync(int usuarioId) =>
            await _context.Suscripciones
                .Where(s => s.UsuarioId == usuarioId && !s.Pagos.Any())
                .ExecuteDeleteAsync();

        public async Task<List<SergioApi.Models.Entities.Suscripciones.Suscripcion>> ObtenerHistorialSuscripcionesAsync(int usuarioId) =>
            await _context.Suscripciones
                .AsNoTracking()
                .Include(s => s.Pagos)
                .Where(s => s.UsuarioId == usuarioId)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

        public async Task<IEnumerable<Usuario>> GetTodosConRolAsync() =>
            await _context.Usuarios
                .Include(u => u.Rol)
                .OrderBy(u => u.Nombre)
                .ToListAsync();

        public async Task<(IEnumerable<Usuario> Usuarios, int Total)> GetPaginadoAsync(int pagina, int porPagina)
        {
            var query = _context.Usuarios.Include(u => u.Rol);

            var total = await query.CountAsync();
            var usuarios = await query
                .OrderBy(u => u.Nombre)
                .Skip((pagina - 1) * porPagina)
                .Take(porPagina)
                .ToListAsync();

            return (usuarios, total);
        }
    }
}
