using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SergioApi.Data;
using SergioApi.Enums;
using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Suscripciones;

namespace SergioApi.Repositories.Suscripciones
{
    public class SuscripcionRepository : ISuscripcionRepository
    {
        // Primer entero de pg_advisory_xact_lock(int, int): separa estos candados de
        // cualquier otro que se use en el futuro con el mismo segundo entero.
        private const int EspacioCandado = 7301;

        // Estados en los que Mercado Pago todavia podria cobrar.
        private static readonly EstadoSuscripcion[] EstadosVivos =
        [
            EstadoSuscripcion.PendientePago,
            EstadoSuscripcion.Activa,
            EstadoSuscripcion.Pausada,
            EstadoSuscripcion.Suspendida,
        ];

        private readonly AppDbContext _context;

        public SuscripcionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IDbContextTransaction> BloquearUsuarioAsync(int usuarioId, CancellationToken ct = default)
        {
            // Dentro del candado se trabaja siempre con datos recien leidos: se descartan
            // las entidades en memoria, que otro proceso pudo cambiar mientras esperabamos.
            _context.ChangeTracker.Clear();

            var transaccion = await _context.Database.BeginTransactionAsync(ct);
            try
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"SELECT pg_advisory_xact_lock({EspacioCandado}, {usuarioId})", ct);
                return transaccion;
            }
            catch
            {
                await transaccion.DisposeAsync();
                throw;
            }
        }

        public void Agregar(Suscripcion suscripcion) => _context.Suscripciones.Add(suscripcion);

        public async Task GuardarAsync(CancellationToken ct = default) => await _context.SaveChangesAsync(ct);

        public async Task<bool> ExisteAsync(int suscripcionId, CancellationToken ct = default) =>
            await _context.Suscripciones.AnyAsync(s => s.Id == suscripcionId, ct);

        public async Task<int?> ObtenerUsuarioIdAsync(int suscripcionId, CancellationToken ct = default) =>
            await _context.Suscripciones
                .Where(s => s.Id == suscripcionId)
                .Select(s => (int?)s.UsuarioId)
                .FirstOrDefaultAsync(ct);

        public async Task<Suscripcion?> ObtenerConPagosAsync(int suscripcionId, CancellationToken ct = default) =>
            await _context.Suscripciones
                .Include(s => s.Pagos)
                .FirstOrDefaultAsync(s => s.Id == suscripcionId, ct);

        public async Task<Suscripcion?> ObtenerAdminAsync(int suscripcionId, CancellationToken ct = default) =>
            await _context.Suscripciones
                .AsNoTracking()
                .Include(s => s.Usuario)
                .Include(s => s.Pagos)
                .FirstOrDefaultAsync(s => s.Id == suscripcionId, ct);

        public async Task<int?> BuscarIdPorPreapprovalAsync(string preapprovalId, CancellationToken ct = default) =>
            await _context.Suscripciones
                .Where(s => s.MercadoPagoPreapprovalId == preapprovalId)
                .Select(s => (int?)s.Id)
                .FirstOrDefaultAsync(ct);

        public async Task<int?> BuscarIdPorCobroAsync(long authorizedPaymentId, CancellationToken ct = default) =>
            await _context.PagosSuscripcion
                .Where(p => p.MercadoPagoAuthorizedPaymentId == authorizedPaymentId)
                .Select(p => (int?)p.SuscripcionId)
                .FirstOrDefaultAsync(ct);

        public async Task<int?> BuscarIdPorPagoAsync(long paymentId, CancellationToken ct = default) =>
            await _context.PagosSuscripcion
                .Where(p => p.MercadoPagoPaymentId == paymentId)
                .Select(p => (int?)p.SuscripcionId)
                .FirstOrDefaultAsync(ct);

        public async Task<List<Suscripcion>> ListarDeUsuarioAsync(
            int usuarioId, bool soloLectura, CancellationToken ct = default)
        {
            var query = _context.Suscripciones.Include(s => s.Pagos).AsQueryable();
            if (soloLectura) query = query.AsNoTracking();

            return await query
                .Where(s => s.UsuarioId == usuarioId)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync(ct);
        }

        public async Task<List<Suscripcion>> ListarActivasConPagosAsync(int usuarioId, CancellationToken ct = default) =>
            await _context.Suscripciones
                .Include(s => s.Pagos)
                .Where(s => s.UsuarioId == usuarioId && s.Estado == EstadoSuscripcion.Activa)
                .ToListAsync(ct);

        public async Task<DateTimeOffset?> MaxPeriodoPagadoAsync(int usuarioId, CancellationToken ct = default) =>
            await _context.Suscripciones
                .Where(s => s.UsuarioId == usuarioId)
                .MaxAsync(s => s.PeriodoPagadoHasta, ct);

        public async Task<DateTimeOffset?> ObtenerVencimientoPremiumAsync(int usuarioId, CancellationToken ct = default) =>
            await _context.Usuarios
                .Where(u => u.Id == usuarioId)
                .Select(u => u.FechaVencimientoPremium)
                .FirstOrDefaultAsync(ct);

        public async Task ActualizarAccesoUsuarioAsync(int usuarioId, DateTimeOffset ahora, CancellationToken ct = default)
        {
            var accesoHasta = await _context.Suscripciones
                .Where(s => s.UsuarioId == usuarioId)
                .MaxAsync(s => s.AccesoHasta, ct);

            var vigente = accesoHasta is not null && accesoHasta.Value > ahora;

            await _context.Usuarios
                .Where(u => u.Id == usuarioId)
                .ExecuteUpdateAsync(set => set
                    .SetProperty(u => u.FechaVencimientoPremium, accesoHasta)
                    .SetProperty(u => u.EsPremium, vigente), ct);
        }

        public async Task<List<int>> IdsParaConciliarAsync(DateTimeOffset ahora, int maximo, CancellationToken ct = default)
        {
            var hace24h       = ahora.AddHours(-24);
            var ventanaInicio = ahora.AddDays(-2);
            var ventanaFin    = ahora.AddDays(2);

            return await _context.Suscripciones
                .Where(s => EstadosVivos.Contains(s.Estado)
                         && (s.UltimaSincronizacion == null
                             || s.UltimaSincronizacion < hace24h
                             || (s.FechaProximoCobro != null
                                 && s.FechaProximoCobro >= ventanaInicio
                                 && s.FechaProximoCobro <= ventanaFin)))
                // Las nunca sincronizadas primero; despues, las mas antiguas.
                .OrderBy(s => s.UltimaSincronizacion != null)
                .ThenBy(s => s.UltimaSincronizacion)
                .Select(s => s.Id)
                .Take(maximo)
                .ToListAsync(ct);
        }

        public async Task<List<int>> PendientesCaducadasAsync(DateTimeOffset creadasAntesDe, CancellationToken ct = default) =>
            await _context.Suscripciones
                .Where(s => s.Estado == EstadoSuscripcion.PendientePago && s.FechaCreacion < creadasAntesDe)
                .Select(s => s.Id)
                .ToListAsync(ct);

        public async Task<(List<Suscripcion> Datos, int Total)> ListarPaginadoAsync(
            PaginacionParametrosDto parametros, EstadoSuscripcion? estado, CancellationToken ct = default)
        {
            var query = _context.Suscripciones
                .AsNoTracking()
                .Include(s => s.Usuario)
                .Include(s => s.Pagos)
                .AsQueryable();

            if (estado is not null)
                query = query.Where(s => s.Estado == estado.Value);

            if (!string.IsNullOrWhiteSpace(parametros.Busqueda))
            {
                var texto = parametros.Busqueda.Trim().ToLowerInvariant();
                query = query.Where(s => s.Usuario.Correo.Contains(texto) || s.CorreoPagador.Contains(texto));
            }

            var total = await query.CountAsync(ct);
            var datos = await query
                .OrderByDescending(s => s.FechaCreacion)
                .Skip(parametros.Salto)
                .Take(parametros.PorPagina)
                .AsSplitQuery()
                .ToListAsync(ct);

            return (datos, total);
        }

        // ── Notificaciones ────────────────────────────────────────

        public async Task<long> RegistrarNotificacionAsync(NotificacionMercadoPago notificacion, CancellationToken ct = default)
        {
            _context.NotificacionesMercadoPago.Add(notificacion);
            await _context.SaveChangesAsync(ct);
            return notificacion.Id;
        }

        public async Task MarcarNotificacionAsync(long notificacionId, string? error, CancellationToken ct = default)
        {
            var ahora = DateTimeOffset.UtcNow;
            var texto = error is null ? null : (error.Length <= 1000 ? error : error[..1000]);

            // ExecuteUpdate y no el change tracker: la sincronizacion vacia el tracker al
            // tomar el candado y la entidad ya no estaria enlazada.
            await _context.NotificacionesMercadoPago
                .Where(n => n.Id == notificacionId)
                .ExecuteUpdateAsync(set => set
                    .SetProperty(n => n.ProcesadaEn, ahora)
                    .SetProperty(n => n.Error, texto), ct);
        }

        public async Task<bool> NotificacionProcesadaRecienteAsync(
            string tipo, string? recursoId, DateTimeOffset desde, CancellationToken ct = default) =>
            await _context.NotificacionesMercadoPago
                .AnyAsync(n => n.Tipo == tipo
                            && n.RecursoId == recursoId
                            && n.ProcesadaEn != null
                            && n.ProcesadaEn >= desde
                            && n.Error == null, ct);

        public async Task<int> PurgarNotificacionesAsync(DateTimeOffset recibidasAntesDe, CancellationToken ct = default) =>
            await _context.NotificacionesMercadoPago
                .Where(n => n.RecibidaEn < recibidasAntesDe)
                .ExecuteDeleteAsync(ct);

        public async Task<int> LimpiarPremiumCaducadoAsync(DateTimeOffset ahora, CancellationToken ct = default) =>
            await _context.Usuarios
                .Where(u => u.EsPremium && (u.FechaVencimientoPremium == null || u.FechaVencimientoPremium <= ahora))
                .ExecuteUpdateAsync(set => set.SetProperty(u => u.EsPremium, false), ct);
    }
}
