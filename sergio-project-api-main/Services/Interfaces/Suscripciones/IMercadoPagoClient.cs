using SergioApi.Models.MercadoPago;

namespace SergioApi.Services.Interfaces.Suscripciones
{
    /// <summary>
    /// Acceso a la API REST de Mercado Pago para suscripciones.
    /// </summary>
    /// <remarks>
    /// Los metodos "Obtener" devuelven null ante un 404. Cualquier otro fallo (timeout,
    /// error de red, respuesta no 2xx) lanza ServicioExternoException.
    /// </remarks>
    public interface IMercadoPagoClient
    {
        /// <summary>
        /// POST /preapproval. La clave de idempotencia debe ser FIJA por fila local, para
        /// que un reintento tras un timeout no cree un segundo preapproval.
        /// </summary>
        Task<PreapprovalMp> CrearPreapprovalAsync(
            CrearPreapprovalMp solicitud, string claveIdempotencia, CancellationToken ct = default);

        Task<PreapprovalMp?> ObtenerPreapprovalAsync(string preapprovalId, CancellationToken ct = default);

        /// <summary>
        /// Busca por external_reference (el Id de nuestra fila). Sirve para recuperar un
        /// alta cuya respuesta se perdio.
        /// </summary>
        Task<PreapprovalMp?> BuscarPreapprovalPorReferenciaAsync(string externalReference, CancellationToken ct = default);

        /// <summary>PUT /preapproval/{id} cambiando solo el estado ("cancelled", "paused").</summary>
        Task<PreapprovalMp> ActualizarEstadoPreapprovalAsync(
            string preapprovalId, string estado, CancellationToken ct = default);

        /// <summary>Todas las facturas de un preapproval (recorre la paginacion).</summary>
        Task<IReadOnlyList<AuthorizedPaymentMp>> BuscarCobrosAsync(string preapprovalId, CancellationToken ct = default);

        Task<AuthorizedPaymentMp?> ObtenerCobroAsync(long authorizedPaymentId, CancellationToken ct = default);

        /// <summary>GET /v1/payments/{id}: estado actual y fecha de aprobacion del pago.</summary>
        Task<PagoMp?> ObtenerPagoAsync(long paymentId, CancellationToken ct = default);
    }
}
