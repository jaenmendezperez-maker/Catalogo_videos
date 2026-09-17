using System.ComponentModel.DataAnnotations;

namespace SergioApi.Configuration
{
    /// <summary>
    /// Configuracion de Mercado Pago (seccion "MercadoPago").
    /// </summary>
    /// <remarks>
    /// Se valida al arrancar fuera de Development, igual que Bunny: en local se puede
    /// levantar la API sin credenciales, pero nunca desplegarla a medio configurar.
    /// Los secretos (AccessToken, WebhookSecret) van en User Secrets o en variables de
    /// entorno, nunca en appsettings.json.
    /// </remarks>
    public class MercadoPagoOptions
    {
        public const string SectionName = "MercadoPago";

        /// <summary>Access Token del VENDEDOR. En pruebas empieza por "TEST-".</summary>
        [Required(ErrorMessage = "MercadoPago:AccessToken es obligatorio.")]
        public string AccessToken { get; set; } = string.Empty;

        /// <summary>Clave secreta de webhooks ("Tus integraciones > Webhooks").</summary>
        [Required(ErrorMessage = "MercadoPago:WebhookSecret es obligatorio.")]
        public string WebhookSecret { get; set; } = string.Empty;

        /// <summary>
        /// Precio de la mensualidad. Cambiarlo NO afecta a los suscriptores existentes:
        /// cada suscripcion conserva el monto con el que se creo.
        /// </summary>
        [Range(typeof(decimal), "1", "100000", ErrorMessage = "MercadoPago:PrecioMensual fuera de rango.")]
        public decimal PrecioMensual { get; set; } = 99m;

        [Required]
        [RegularExpression("^[A-Z]{3}$", ErrorMessage = "MercadoPago:Moneda debe ser un codigo ISO 4217, p. ej. MXN.")]
        public string Moneda { get; set; } = "MXN";

        /// <summary>Texto que ve el pagador en Mercado Pago (reason).</summary>
        [Required]
        [MaxLength(255)]
        public string Razon { get; set; } = "Suscripción mensual";

        /// <summary>
        /// A donde vuelve el usuario tras pagar. Debe ser https: Mercado Pago rechaza
        /// localhost. Sus parametros de vuelta no estan documentados; el front se limita a
        /// llamar a POST /api/suscripciones/mia/sincronizar.
        /// </summary>
        [Required(ErrorMessage = "MercadoPago:BackUrl es obligatorio.")]
        [Url]
        public string BackUrl { get; set; } = string.Empty;

        /// <summary>
        /// Dias de acceso extra tras vencer el periodo pagado, SOLO mientras la suscripcion
        /// siga autorizada (Mercado Pago reintenta el cobro unos 10 dias).
        /// </summary>
        [Range(0, 30)]
        public int DiasGracia { get; set; } = 3;

        /// <summary>Periodicidad del cobro. Solo modificable en Development (para probar con dias).</summary>
        [Range(1, 365)]
        public int PeriodoFrecuencia { get; set; } = 1;

        /// <summary>"months" o "days". Solo modificable en Development.</summary>
        [RegularExpression("^(days|months)$", ErrorMessage = "MercadoPago:TipoFrecuencia debe ser days o months.")]
        public string TipoFrecuencia { get; set; } = "months";

        /// <summary>Horas tras las que una suscripcion pendiente sin pagar se cancela.</summary>
        [Range(1, 720)]
        public int HorasCaducidadPendiente { get; set; } = 24;

        /// <summary>
        /// Horas de acceso provisional al autorizar, antes de confirmar el primer cobro.
        /// 0 = solo se da acceso con un cobro aprobado (decision de negocio).
        /// </summary>
        [Range(0, 168)]
        public int AccesoProvisionalHoras { get; set; } = 0;

        public string ApiBaseUrl { get; set; } = "https://api.mercadopago.com";

        /// <summary>Las credenciales de prueba de Mercado Pago empiezan por "TEST-".</summary>
        public bool EsCredencialDePrueba =>
            AccessToken.StartsWith("TEST-", StringComparison.Ordinal);

        /// <summary>
        /// Hay lo minimo para operar. En Development las DataAnnotations no se validan,
        /// asi que el alta lo comprueba con esto antes de llamar a Mercado Pago.
        /// </summary>
        public bool EstaConfigurado =>
            !string.IsNullOrWhiteSpace(AccessToken)
            && !string.IsNullOrWhiteSpace(WebhookSecret)
            && !string.IsNullOrWhiteSpace(BackUrl);
    }
}
