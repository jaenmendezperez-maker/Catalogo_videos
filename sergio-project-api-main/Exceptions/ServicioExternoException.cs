namespace SergioApi.Exceptions
{
    /// <summary>
    /// Fallo al hablar con un servicio externo (Mercado Pago, Bunny).
    /// </summary>
    /// <remarks>
    /// El middleware la traduce a 504 si fue un timeout y a 502 en el resto de casos.
    /// Existe porque un timeout de HttpClient lanza TaskCanceledException, no
    /// TimeoutException, asi que el mapeo a 504 que ya habia nunca se activaba y los
    /// fallos externos salian como un 500 generico, indistinguibles de un bug propio.
    /// </remarks>
    public class ServicioExternoException : Exception
    {
        /// <summary>Codigo HTTP que devolvio el servicio remoto, si llego a responder.</summary>
        public int? CodigoRemoto { get; }

        /// <summary>El servicio no respondio a tiempo.</summary>
        public bool EsTimeout { get; }

        public ServicioExternoException(
            string mensaje,
            int? codigoRemoto = null,
            bool esTimeout = false,
            Exception? interna = null)
            : base(mensaje, interna)
        {
            CodigoRemoto = codigoRemoto;
            EsTimeout    = esTimeout;
        }
    }
}
