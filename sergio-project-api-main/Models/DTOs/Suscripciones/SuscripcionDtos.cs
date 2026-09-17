using System.ComponentModel.DataAnnotations;

namespace SergioApi.Models.DTOs.Suscripciones
{
    // ────────────────────────────────────────────────────────
    // ENTRADA
    // ────────────────────────────────────────────────────────

    /// <summary>POST /api/suscripciones</summary>
    public class CrearSuscripcionDto
    {
        /// <summary>
        /// Correo de la cuenta de Mercado Pago con la que se va a pagar. Opcional: si no
        /// se envia, se usa el correo de la cuenta. Existe porque Mercado Pago puede exigir
        /// que coincida con quien paga, y no tiene por que ser el mismo correo de la app.
        /// </summary>
        [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
        [StringLength(254)]
        public string? CorreoMercadoPago { get; set; }
    }

    // ────────────────────────────────────────────────────────
    // SALIDA
    // ────────────────────────────────────────────────────────

    /// <summary>Respuesta del alta: el cliente redirige al usuario a InitPoint.</summary>
    public class SuscripcionCreadaDto
    {
        public int SuscripcionId { get; set; }
        public required string InitPoint { get; set; }
        public required string Estado { get; set; }
    }

    /// <summary>GET /api/suscripciones/mia</summary>
    public class MiSuscripcionDto
    {
        /// <summary>Nulo si el usuario nunca se ha suscrito.</summary>
        public int? SuscripcionId { get; set; }

        /// <summary>PendientePago, Activa, Pausada, Suspendida, Cancelada... o "SinSuscripcion".</summary>
        public required string Estado { get; set; }

        /// <summary>Si ahora mismo puede ver videos premium.</summary>
        public bool TieneAcceso { get; set; }

        /// <summary>Hasta cuando conserva el acceso (incluye la gracia si aplica).</summary>
        public DateTimeOffset? AccesoHasta { get; set; }

        public DateTimeOffset? PeriodoPagadoHasta { get; set; }
        public DateTimeOffset? FechaProximoCobro { get; set; }
        public decimal? Monto { get; set; }
        public string? Moneda { get; set; }

        /// <summary>
        /// Autorizada en Mercado Pago pero sin ningun cobro aprobado todavia.
        /// La interfaz deberia mostrar "procesando tu pago".
        /// </summary>
        public bool PrimerCobroPendiente { get; set; }

        /// <summary>Cancelada pero con acceso aun vigente hasta AccesoHasta.</summary>
        public bool CanceladaConAccesoVigente { get; set; }

        /// <summary>Enlace para completar el pago si sigue pendiente.</summary>
        public string? InitPoint { get; set; }
    }

    /// <summary>Fila del listado de administracion.</summary>
    public class SuscripcionAdminDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public required string CorreoUsuario { get; set; }
        public required string CorreoPagador { get; set; }
        public required string Estado { get; set; }
        public string? EstadoMercadoPago { get; set; }
        public string? MercadoPagoPreapprovalId { get; set; }
        public decimal Monto { get; set; }
        public required string Moneda { get; set; }
        public DateTimeOffset FechaCreacion { get; set; }
        public DateTimeOffset? FechaProximoCobro { get; set; }
        public DateTimeOffset? PeriodoPagadoHasta { get; set; }
        public DateTimeOffset? AccesoHasta { get; set; }
        public DateTimeOffset? UltimaSincronizacion { get; set; }
        public int CobrosAprobados { get; set; }
    }
}
