namespace SergioApi.Configuration
{
    /// <summary>Configuracion del login con Google (seccion "Google").</summary>
    public class GoogleOptions
    {
        public const string SectionName = "Google";

        /// <summary>
        /// ClientId de la app de Google. Si esta vacio, el login con Google se rechaza
        /// explicitamente en vez de validar el token contra una audiencia nula.
        /// </summary>
        public string? ClientId { get; set; }

        public bool EstaConfigurado => !string.IsNullOrWhiteSpace(ClientId);
    }
}
