using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SergioApi.Enums;

namespace SergioApi.Models.Entities.Suscripciones
{
    /// <summary>
    /// Una suscripcion mensual de un usuario, reflejo local de un "preapproval" de
    /// Mercado Pago.
    /// </summary>
    /// <remarks>
    /// La fila se crea ANTES de llamar a Mercado Pago y su Id viaja como
    /// external_reference. Asi, aunque un webhook llegue antes de que se guarde el id
    /// del preapproval, o la llamada se corte por timeout, siempre se puede volver a
    /// enlazar. Por eso la fila nunca se borra.
    /// </remarks>
    public class Suscripcion
    {
        [Key]
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        [ForeignKey(nameof(UsuarioId))]
        public Usuario Usuario { get; set; } = null!;

        /// <summary>Id del preapproval en Mercado Pago. Nulo hasta que Mercado Pago responde.</summary>
        [MaxLength(64)]
        public string? MercadoPagoPreapprovalId { get; set; }

        /// <summary>Enlace de pago de Mercado Pago al que se redirige al usuario.</summary>
        [MaxLength(500)]
        public string? InitPoint { get; set; }

        /// <summary>Correo enviado como payer_email. Puede diferir del correo de la cuenta.</summary>
        [Required]
        [MaxLength(254)]
        public string CorreoPagador { get; set; } = string.Empty;

        /// <summary>Estado local. Se guarda como texto (ver AppDbContext).</summary>
        public EstadoSuscripcion Estado { get; set; } = EstadoSuscripcion.PendientePago;

        /// <summary>Estado tal cual lo devolvio Mercado Pago, para depurar y auditar.</summary>
        [MaxLength(30)]
        public string? EstadoMercadoPago { get; set; }

        [Column(TypeName = "numeric(12,2)")]
        public decimal Monto { get; set; }

        [Required]
        [MaxLength(3)]
        public string Moneda { get; set; } = "MXN";

        /// <summary>Periodicidad del cobro (auto_recurring.frequency). 1 = cada periodo.</summary>
        public int FrecuenciaCobro { get; set; } = 1;

        /// <summary>auto_recurring.frequency_type: "months" o "days".</summary>
        [Required]
        [MaxLength(10)]
        public string TipoFrecuenciaCobro { get; set; } = "months";

        public DateTimeOffset FechaCreacion { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? FechaAutorizacion { get; set; }
        public DateTimeOffset? FechaProximoCobro { get; set; }
        public DateTimeOffset? FechaCancelacion { get; set; }

        /// <summary>Quien la cancelo: "Usuario", "MercadoPago" o "Sistema".</summary>
        [MaxLength(20)]
        public string? CanceladaPor { get; set; }

        /// <summary>
        /// Hasta cuando cubren los cobros aprobados. No incluye la gracia y no se toca al
        /// cancelar: lo pagado se respeta hasta el final, sin reembolso.
        /// </summary>
        public DateTimeOffset? PeriodoPagadoHasta { get; set; }

        /// <summary>
        /// PeriodoPagadoHasta mas la gracia, que solo cuenta mientras la suscripcion siga
        /// autorizada en Mercado Pago. Es lo que determina el acceso.
        /// </summary>
        public DateTimeOffset? AccesoHasta { get; set; }

        public DateTimeOffset? UltimaSincronizacion { get; set; }

        /// <summary>Ultima respuesta cruda de Mercado Pago, para depurar.</summary>
        [Column(TypeName = "jsonb")]
        public string? UltimoPayloadMp { get; set; }

        public ICollection<PagoSuscripcion> Pagos { get; set; } = new List<PagoSuscripcion>();
    }
}
