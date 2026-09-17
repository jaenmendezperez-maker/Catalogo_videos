using SergioApi.Enums;
using SergioApi.Models.Entities.Suscripciones;

namespace SergioApi.Services.Interfaces.Suscripciones
{
    public enum ResultadoSincronizacion
    {
        Sincronizada,

        /// <summary>No hay ninguna suscripcion local que corresponda.</summary>
        NoEncontrada
    }

    /// <summary>
    /// Refleja en la base de datos el estado real de una suscripcion en Mercado Pago.
    /// </summary>
    /// <remarks>
    /// Nunca se fia de lo que diga un webhook: siempre relee de Mercado Pago con nuestro
    /// token y recalcula el acceso desde cero. Asi el resultado es el mismo lleguen las
    /// notificaciones en el orden que lleguen, duplicadas o falsificadas.
    /// </remarks>
    public interface ISincronizadorSuscripciones
    {
        /// <summary>Sincroniza una suscripcion local. Toma el candado del usuario.</summary>
        Task<ResultadoSincronizacion> SincronizarAsync(int suscripcionId, CancellationToken ct = default);

        Task<ResultadoSincronizacion> SincronizarPorPreapprovalAsync(string preapprovalId, CancellationToken ct = default);
        Task<ResultadoSincronizacion> SincronizarPorCobroAsync(long authorizedPaymentId, CancellationToken ct = default);

        /// <summary>
        /// Topic "payment": solo se resuelve si el pago ya esta registrado como cobro de
        /// una suscripcion (reembolsos, contracargos). Si no, NoEncontrada.
        /// </summary>
        Task<ResultadoSincronizacion> SincronizarPorPagoAsync(long paymentId, CancellationToken ct = default);

        /// <summary>
        /// Sincroniza una fila ya cargada con sus cobros. REQUIERE que quien llama tenga
        /// el candado del usuario (ISuscripcionRepository.BloquearUsuarioAsync).
        /// </summary>
        Task SincronizarFilaBloqueadaAsync(Suscripcion fila, CancellationToken ct = default);

        /// <summary>
        /// Cancela en Mercado Pago y marca la fila SOLO si una lectura posterior confirma
        /// la cancelacion. Devuelve false si no se pudo confirmar, o si se pidio
        /// "Abandonada" y Mercado Pago ya la habia autorizado. REQUIERE el candado.
        /// </summary>
        Task<bool> CancelarEnMercadoPagoBloqueadaAsync(
            Suscripcion fila, EstadoSuscripcion estadoFinal, string canceladaPor, CancellationToken ct = default);
    }
}
