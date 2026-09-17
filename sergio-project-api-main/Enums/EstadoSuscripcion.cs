namespace SergioApi.Enums
{
    /// <summary>
    /// Estado local de una suscripcion.
    /// </summary>
    /// <remarks>
    /// Se guarda como TEXTO en la base de datos (ver AppDbContext), asi que el orden de los
    /// valores no importa y se pueden anadir nuevos sin migrar datos.
    ///
    /// No existe "Vencida": que el acceso haya caducado se deduce de las fechas, no es un
    /// estado de Mercado Pago. Una suscripcion Activa puede estar sin acceso (cobro
    /// rechazado) y una Cancelada puede conservarlo (periodo ya pagado).
    /// </remarks>
    public enum EstadoSuscripcion
    {
        /// <summary>Creada; el usuario aun no ha pagado en Mercado Pago ("pending").</summary>
        PendientePago,

        /// <summary>Autorizada en Mercado Pago ("authorized"); cobra cada periodo.</summary>
        Activa,

        /// <summary>Pausada ("paused"). Se puede reanudar desde Mercado Pago.</summary>
        Pausada,

        /// <summary>Suspendida por Mercado Pago ("suspended").</summary>
        Suspendida,

        /// <summary>Cancelada ("cancelled"). Conserva el acceso hasta el fin del periodo pagado.</summary>
        Cancelada,

        /// <summary>Pendiente que nadie pago a tiempo; se cancelo en Mercado Pago.</summary>
        Abandonada,

        /// <summary>No se pudo crear en Mercado Pago ni recuperar despues.</summary>
        ErrorCreacion
    }
}
