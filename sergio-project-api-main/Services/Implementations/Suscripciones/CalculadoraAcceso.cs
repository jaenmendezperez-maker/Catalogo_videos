namespace SergioApi.Services.Implementations.Suscripciones
{
    /// <summary>Datos minimos de un cobro para calcular el acceso.</summary>
    /// <param name="FechaAprobacion">date_approved del pago en Mercado Pago.</param>
    /// <param name="EstadoPago">status ACTUAL del pago ("approved", "refunded", "charged_back"...).</param>
    public sealed record CobroParaAcceso(DateTimeOffset? FechaAprobacion, string? EstadoPago);

    /// <summary>
    /// Calculo puro, sin base de datos ni red, de hasta cuando tiene acceso un suscriptor.
    /// </summary>
    /// <remarks>
    /// Se recalcula desde cero en cada sincronizacion a partir del estado ACTUAL de los
    /// cobros, asi el resultado no depende del orden en que lleguen los webhooks, y un
    /// reembolso o contracargo recorta el acceso en cuanto se detecta.
    /// </remarks>
    public static class CalculadoraAcceso
    {
        public const string PagoAprobado = "approved";

        /// <summary>Unica comparacion valida del estado "aprobado" de un pago.</summary>
        public static bool EsPagoAprobado(string? estadoPago) =>
            string.Equals(estadoPago, PagoAprobado, StringComparison.OrdinalIgnoreCase);

        /// <summary>
        /// Maximo de (fecha de aprobacion + periodo) sobre los cobros cuyo pago sigue hoy
        /// aprobado. Nulo si no hay ninguno.
        /// </summary>
        public static DateTimeOffset? PeriodoPagadoHasta(
            IEnumerable<CobroParaAcceso> cobros, int frecuencia, string tipoFrecuencia)
        {
            DateTimeOffset? hasta = null;

            foreach (var cobro in cobros)
            {
                if (cobro.FechaAprobacion is null) continue;
                if (!string.Equals(cobro.EstadoPago, PagoAprobado, StringComparison.OrdinalIgnoreCase)) continue;

                var fin = SumarPeriodo(cobro.FechaAprobacion.Value.ToUniversalTime(), frecuencia, tipoFrecuencia);
                if (hasta is null || fin > hasta) hasta = fin;
            }

            return hasta;
        }

        /// <summary>
        /// Acceso = periodo pagado + gracia. La gracia SOLO cuenta si la suscripcion sigue
        /// autorizada: quien cancela conserva lo que pago, pero no se lleva dias extra.
        /// </summary>
        public static DateTimeOffset? AccesoHasta(
            DateTimeOffset? periodoPagadoHasta,
            bool autorizadaEnMercadoPago,
            int diasGracia,
            DateTimeOffset? fechaAutorizacion = null,
            int horasProvisional = 0)
        {
            var acceso = periodoPagadoHasta;

            if (acceso is not null && autorizadaEnMercadoPago && diasGracia > 0)
                acceso = acceso.Value.AddDays(diasGracia);

            // Acceso provisional antes del primer cobro. Desactivado por defecto (0 h):
            // la decision de negocio es dar acceso solo con un cobro aprobado.
            if (autorizadaEnMercadoPago && horasProvisional > 0 && fechaAutorizacion is not null)
            {
                var provisional = fechaAutorizacion.Value.ToUniversalTime().AddHours(horasProvisional);
                if (acceso is null || provisional > acceso) acceso = provisional;
            }

            return acceso;
        }

        /// <summary>
        /// Suma un periodo de cobro. Con meses se usa AddMonths, que ajusta al ultimo dia
        /// del mes: 31 de enero + 1 mes = 28 (o 29) de febrero.
        /// </summary>
        public static DateTimeOffset SumarPeriodo(DateTimeOffset desde, int frecuencia, string tipoFrecuencia) =>
            tipoFrecuencia switch
            {
                "days"   => desde.AddDays(frecuencia),
                "months" => desde.AddMonths(frecuencia),
                _ => throw new ArgumentOutOfRangeException(
                    nameof(tipoFrecuencia), tipoFrecuencia, "Tipo de frecuencia no soportado.")
            };
    }
}
