using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SergioApi.Models.Entities.Suscripciones
{
    /// <summary>
    /// Un cobro recurrente de una suscripcion ("authorized_payment" en Mercado Pago).
    /// </summary>
    /// <remarks>
    /// Se reescribe en cada sincronizacion con el estado ACTUAL del pago, no se fija una
    /// vez: un pago aprobado puede pasar despues a reembolsado o a contracargo, y eso tiene
    /// que recortar el acceso.
    ///
    /// Sustituye a la entidad anterior del mismo nombre, que exigia datos de tarjeta
    /// (CardId, PaymentMethodId...) que el flujo por redireccion nunca tiene.
    /// </remarks>
    public class PagoSuscripcion
    {
        [Key]
        public int Id { get; set; }

        public int SuscripcionId { get; set; }
        [ForeignKey(nameof(SuscripcionId))]
        public Suscripcion Suscripcion { get; set; } = null!;

        /// <summary>Id de la factura en Mercado Pago. Numero de 64 bits: nunca int.</summary>
        public long MercadoPagoAuthorizedPaymentId { get; set; }

        /// <summary>Id del pago asociado (GET /v1/payments/{id}). Nulo mientras no se intenta cobrar.</summary>
        public long? MercadoPagoPaymentId { get; set; }

        /// <summary>
        /// Estado de la factura: scheduled, processed, recycling... "processed" es ambiguo
        /// (pagada o rechazada definitiva), por eso el acceso se decide con EstadoPago.
        /// </summary>
        [MaxLength(30)]
        public string? EstadoFactura { get; set; }

        /// <summary>Estado actual del pago: approved, rejected, refunded, charged_back...</summary>
        [MaxLength(30)]
        public string? EstadoPago { get; set; }

        [Column(TypeName = "numeric(12,2)")]
        public decimal? Monto { get; set; }

        [MaxLength(3)]
        public string? Moneda { get; set; }

        /// <summary>date_approved del pago. Es la base del periodo pagado.</summary>
        public DateTimeOffset? FechaAprobacion { get; set; }

        /// <summary>debit_date de la factura: cuando estaba programado el cobro.</summary>
        public DateTimeOffset? FechaCobroProgramada { get; set; }

        /// <summary>Numero de reintento (retry_attempt).</summary>
        public int? Intento { get; set; }

        public DateTimeOffset FechaActualizacion { get; set; } = DateTimeOffset.UtcNow;
    }
}
