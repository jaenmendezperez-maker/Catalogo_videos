using SergioApi.Enums;
using SergioApi.Models.DTOs;
using SergioApi.Models.DTOs.Suscripciones;

namespace SergioApi.Services.Interfaces.Suscripciones
{
    public interface ISuscripcionService
    {
        /// <summary>
        /// Alta: crea (o reutiliza) una suscripcion pendiente y devuelve el enlace de pago.
        /// 409 si ya tiene una activa.
        /// </summary>
        Task<SuscripcionCreadaDto> CrearAsync(int usuarioId, CrearSuscripcionDto? dto, CancellationToken ct = default);

        Task<MiSuscripcionDto> ObtenerMiaAsync(int usuarioId, CancellationToken ct = default);

        /// <summary>
        /// Cancela en Mercado Pago. Conserva el acceso hasta el fin del periodo pagado,
        /// sin reembolso.
        /// </summary>
        Task<MiSuscripcionDto> CancelarMiaAsync(int usuarioId, CancellationToken ct = default);

        /// <summary>Relee de Mercado Pago. Lo llama el front al volver del pago.</summary>
        Task<MiSuscripcionDto> SincronizarMiaAsync(int usuarioId, CancellationToken ct = default);

        Task<PaginadoDto<SuscripcionAdminDto>> ListarAdminAsync(
            PaginacionParametrosDto parametros, EstadoSuscripcion? estado, CancellationToken ct = default);

        Task<SuscripcionAdminDto> SincronizarAdminAsync(int suscripcionId, CancellationToken ct = default);

        /// <summary>
        /// Cancela en Mercado Pago una pendiente que nadie pago a tiempo, para que su
        /// enlace de pago deje de funcionar. No hace nada si ya fue autorizada.
        /// </summary>
        Task<bool> AbandonarPendienteAsync(int suscripcionId, CancellationToken ct = default);
    }
}
