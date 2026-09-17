using Microsoft.EntityFrameworkCore.Storage;
using SergioApi.Enums;
using SergioApi.Models.DTOs;
using SergioApi.Models.Entities.Suscripciones;

namespace SergioApi.Repositories.Suscripciones
{
    /// <summary>Acceso a datos de suscripciones, cobros y notificaciones de Mercado Pago.</summary>
    public interface ISuscripcionRepository
    {
        /// <summary>
        /// Abre una transaccion y toma el candado consultivo del usuario
        /// (pg_advisory_xact_lock). Se libera solo al confirmar o descartar la transaccion.
        /// </summary>
        /// <remarks>
        /// Alta, cancelacion y sincronizacion lo toman. Sin el, una lectura antigua de
        /// Mercado Pago podia pisar a una reciente ("authorized" sobrescribiendo
        /// "cancelled") y dos procesos podian insertar el mismo cobro a la vez. Funciona
        /// aunque haya varias instancias de la API, porque el candado vive en PostgreSQL.
        /// </remarks>
        Task<IDbContextTransaction> BloquearUsuarioAsync(int usuarioId, CancellationToken ct = default);

        void Agregar(Suscripcion suscripcion);
        Task GuardarAsync(CancellationToken ct = default);

        Task<bool> ExisteAsync(int suscripcionId, CancellationToken ct = default);
        Task<int?> ObtenerUsuarioIdAsync(int suscripcionId, CancellationToken ct = default);
        Task<Suscripcion?> ObtenerConPagosAsync(int suscripcionId, CancellationToken ct = default);
        Task<Suscripcion?> ObtenerAdminAsync(int suscripcionId, CancellationToken ct = default);

        Task<int?> BuscarIdPorPreapprovalAsync(string preapprovalId, CancellationToken ct = default);
        Task<int?> BuscarIdPorCobroAsync(long authorizedPaymentId, CancellationToken ct = default);
        Task<int?> BuscarIdPorPagoAsync(long paymentId, CancellationToken ct = default);

        /// <summary>Todas las suscripciones del usuario con sus cobros, mas recientes primero.</summary>
        Task<List<Suscripcion>> ListarDeUsuarioAsync(int usuarioId, bool soloLectura, CancellationToken ct = default);

        Task<List<Suscripcion>> ListarActivasConPagosAsync(int usuarioId, CancellationToken ct = default);

        Task<DateTimeOffset?> MaxPeriodoPagadoAsync(int usuarioId, CancellationToken ct = default);
        Task<DateTimeOffset?> ObtenerVencimientoPremiumAsync(int usuarioId, CancellationToken ct = default);

        /// <summary>
        /// Usuario.FechaVencimientoPremium = maximo de AccesoHasta de sus suscripciones,
        /// y Usuario.EsPremium en consonancia.
        /// </summary>
        Task ActualizarAccesoUsuarioAsync(int usuarioId, DateTimeOffset ahora, CancellationToken ct = default);

        /// <summary>
        /// Suscripciones vivas que conviene reconciliar: nunca sincronizadas, sin
        /// sincronizar en 24 h, o con el cobro programado a menos de 2 dias.
        /// </summary>
        Task<List<int>> IdsParaConciliarAsync(DateTimeOffset ahora, int maximo, CancellationToken ct = default);

        Task<List<int>> PendientesCaducadasAsync(DateTimeOffset creadasAntesDe, CancellationToken ct = default);

        Task<(List<Suscripcion> Datos, int Total)> ListarPaginadoAsync(
            PaginacionParametrosDto parametros, EstadoSuscripcion? estado, CancellationToken ct = default);

        // ── Notificaciones ────────────────────────────────────────

        Task<long> RegistrarNotificacionAsync(NotificacionMercadoPago notificacion, CancellationToken ct = default);

        /// <summary>Marca la notificacion como procesada; con error si se indica.</summary>
        Task MarcarNotificacionAsync(long notificacionId, string? error, CancellationToken ct = default);

        /// <summary>
        /// La MISMA notificacion (tipo + recurso) ya se proceso con exito desde la fecha
        /// indicada. Sirve de antirrebote frente a los reintentos de Mercado Pago.
        /// </summary>
        Task<bool> NotificacionProcesadaRecienteAsync(
            string tipo, string? recursoId, DateTimeOffset desde, CancellationToken ct = default);

        Task<int> PurgarNotificacionesAsync(DateTimeOffset recibidasAntesDe, CancellationToken ct = default);

        /// <summary>
        /// Pone EsPremium = false a quien ya no tiene fecha vigente. Es cosmetico: el
        /// acceso ya se decide por la fecha.
        /// </summary>
        Task<int> LimpiarPremiumCaducadoAsync(DateTimeOffset ahora, CancellationToken ct = default);
    }
}
