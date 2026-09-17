using SergioApi.Enums;

namespace SergioApi.Services.Implementations.Suscripciones
{
    /// <summary>Traduce los estados de un preapproval de Mercado Pago a los locales.</summary>
    public static class MapeoEstadoMercadoPago
    {
        /// <summary>
        /// Nulo si el estado es desconocido: quien llama registra un Warning y NO toca el
        /// acceso, en vez de adivinar.
        /// </summary>
        /// <remarks>
        /// La guia de Mercado Pago escribe "canceled" y la referencia "cancelled"; se
        /// aceptan los dos al leer.
        /// </remarks>
        public static EstadoSuscripcion? Mapear(string? estadoMercadoPago) =>
            estadoMercadoPago?.Trim().ToLowerInvariant() switch
            {
                "pending"                 => EstadoSuscripcion.PendientePago,
                "authorized"              => EstadoSuscripcion.Activa,
                "paused"                  => EstadoSuscripcion.Pausada,
                "suspended"               => EstadoSuscripcion.Suspendida,
                "cancelled" or "canceled" => EstadoSuscripcion.Cancelada,
                _                         => null
            };

        /// <summary>Solo una suscripcion autorizada da derecho a la gracia.</summary>
        public static bool EstaAutorizada(string? estadoMercadoPago) =>
            string.Equals(estadoMercadoPago?.Trim(), "authorized", StringComparison.OrdinalIgnoreCase);

        public static bool EstaCancelada(string? estadoMercadoPago) =>
            Mapear(estadoMercadoPago) == EstadoSuscripcion.Cancelada;
    }
}
