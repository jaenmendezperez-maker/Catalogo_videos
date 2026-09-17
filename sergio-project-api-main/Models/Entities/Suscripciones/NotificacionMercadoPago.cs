using System.ComponentModel.DataAnnotations;

namespace SergioApi.Models.Entities.Suscripciones
{
    /// <summary>
    /// Registro de cada webhook recibido de Mercado Pago con firma valida.
    /// </summary>
    /// <remarks>
    /// Es auditoria, no la fuente de verdad: el estado siempre se relee de Mercado Pago.
    /// Sirve para depurar el orden y los duplicados de las notificaciones. Se purga a los
    /// 30 dias.
    /// </remarks>
    public class NotificacionMercadoPago
    {
        [Key]
        public long Id { get; set; }

        /// <summary>Topic: subscription_preapproval, subscription_authorized_payment, payment...</summary>
        [Required]
        [MaxLength(60)]
        public string Tipo { get; set; } = string.Empty;

        /// <summary>data.id de la notificacion.</summary>
        [MaxLength(64)]
        public string? RecursoId { get; set; }

        /// <summary>Cabecera x-request-id.</summary>
        [MaxLength(100)]
        public string? RequestId { get; set; }

        public DateTimeOffset RecibidaEn { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? ProcesadaEn { get; set; }

        [MaxLength(1000)]
        public string? Error { get; set; }
    }
}
