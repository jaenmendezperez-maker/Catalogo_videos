using System.Globalization;
using System.Text.Json.Serialization;

namespace SergioApi.Models.MercadoPago
{
    // ════════════════════════════════════════════════════════════════
    // DTOs de la API REST de Mercado Pago (solo los campos que usamos).
    //
    // Todo es nullable a proposito: buena parte de la respuesta no esta documentada o
    // varia entre paises, y un campo ausente no debe tumbar la deserializacion.
    // Se serializan en snake_case (ver MercadoPagoClient). Las fechas se reciben como
    // texto y se interpretan con FechasMp, porque Mercado Pago las manda con offset
    // (-04:00) y Npgsql solo acepta DateTimeOffset en UTC.
    // ════════════════════════════════════════════════════════════════

    /// <summary>Cuerpo de POST /preapproval (suscripcion sin plan, pago pendiente).</summary>
    public class CrearPreapprovalMp
    {
        public required string Reason { get; set; }
        public required string ExternalReference { get; set; }
        public required string PayerEmail { get; set; }
        public required AutoRecurringMp AutoRecurring { get; set; }
        public required string BackUrl { get; set; }

        /// <summary>"pending": sin tarjeta; el usuario paga en el init_point.</summary>
        public string Status { get; set; } = "pending";
    }

    public class AutoRecurringMp
    {
        public int? Frequency { get; set; }
        public string? FrequencyType { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public decimal? TransactionAmount { get; set; }
        public string? CurrencyId { get; set; }
    }

    /// <summary>Respuesta de /preapproval.</summary>
    public class PreapprovalMp
    {
        public string? Id { get; set; }
        public string? Status { get; set; }
        public string? ExternalReference { get; set; }
        public long? PayerId { get; set; }
        public string? PayerEmail { get; set; }
        public string? InitPoint { get; set; }
        public string? Reason { get; set; }
        public string? DateCreated { get; set; }
        public string? LastModified { get; set; }
        public string? NextPaymentDate { get; set; }
        public AutoRecurringMp? AutoRecurring { get; set; }
        public SummarizedMp? Summarized { get; set; }

        /// <summary>JSON crudo de la respuesta, para guardarlo como auditoria.</summary>
        [JsonIgnore]
        public string? JsonCrudo { get; set; }
    }

    /// <summary>Resumen de cobros del preapproval. Solo para contrastar; nunca decide el acceso.</summary>
    public class SummarizedMp
    {
        public int? ChargedQuantity { get; set; }
        public int? PendingChargeQuantity { get; set; }
        public string? LastChargedDate { get; set; }
        public string? Semaphore { get; set; }
    }

    /// <summary>Una factura de la suscripcion (/authorized_payments).</summary>
    public class AuthorizedPaymentMp
    {
        public long? Id { get; set; }
        public string? PreapprovalId { get; set; }
        public string? ExternalReference { get; set; }

        /// <summary>scheduled, processed, recycling, cancelled... "processed" es ambiguo.</summary>
        public string? Status { get; set; }

        public decimal? TransactionAmount { get; set; }
        public string? CurrencyId { get; set; }
        public string? DebitDate { get; set; }
        public string? DateCreated { get; set; }
        public int? RetryAttempt { get; set; }
        public string? NextRetryDate { get; set; }
        public PagoResumenMp? Payment { get; set; }
    }

    public class PagoResumenMp
    {
        public long? Id { get; set; }
        public string? Status { get; set; }
        public string? StatusDetail { get; set; }
    }

    /// <summary>Un pago (GET /v1/payments/{id}). Es la fuente fiable de aprobacion.</summary>
    public class PagoMp
    {
        public long? Id { get; set; }

        /// <summary>approved, rejected, refunded, charged_back, in_process...</summary>
        public string? Status { get; set; }

        public string? StatusDetail { get; set; }
        public string? DateApproved { get; set; }
        public decimal? TransactionAmount { get; set; }
        public string? CurrencyId { get; set; }
    }

    /// <summary>Envoltorio de las busquedas (/search).</summary>
    public class BusquedaMp<T>
    {
        public PaginacionMp? Paging { get; set; }
        public List<T>? Results { get; set; }
    }

    public class PaginacionMp
    {
        public int? Total { get; set; }
        public int? Limit { get; set; }
        public int? Offset { get; set; }
    }

    /// <summary>Interpretacion tolerante de las fechas de Mercado Pago.</summary>
    public static class FechasMp
    {
        /// <summary>
        /// Nulo si viene vacia o no se entiende. Siempre devuelve UTC: Npgsql rechaza
        /// guardar un DateTimeOffset con offset distinto de cero.
        /// </summary>
        public static DateTimeOffset? Parsear(string? valor) =>
            !string.IsNullOrWhiteSpace(valor)
            && DateTimeOffset.TryParse(valor, CultureInfo.InvariantCulture,
                   DateTimeStyles.AssumeUniversal, out var fecha)
                ? fecha.ToUniversalTime()
                : null;

        /// <summary>Formato ISO 8601 en UTC que acepta Mercado Pago.</summary>
        public static string Formatear(DateTimeOffset fecha) =>
            fecha.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
    }
}
