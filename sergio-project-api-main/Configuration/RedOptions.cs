using System.Net;

namespace SergioApi.Configuration
{
    /// <summary>
    /// Configuracion de confianza en cabeceras reenviadas (seccion "Red").
    /// </summary>
    /// <remarks>
    /// Determina si la API cree o no la cabecera X-Forwarded-For.
    ///
    /// Importa mas de lo que parece: el rate limiter particiona por IP del cliente.
    /// Si se confia en X-Forwarded-For de cualquiera, basta con enviar una IP distinta
    /// en cada peticion para obtener una cuota nueva cada vez, lo que anula el limite
    /// por completo. Verificado: 15 intentos de login rotando la cabecera pasaban todos
    /// con la particion de la IP real ya agotada.
    ///
    /// Por eso el comportamiento por defecto (ambas listas vacias) es NO confiar en la
    /// cabecera y usar la IP real de la conexion, que el cliente no puede falsificar.
    /// </remarks>
    public class RedOptions
    {
        public const string SectionName = "Red";

        /// <summary>
        /// IPs concretas de los proxies de confianza (por ejemplo "10.0.0.5").
        /// Solo se acepta X-Forwarded-For si la conexion viene de una de ellas.
        /// </summary>
        public string[] ProxiesDeConfianza { get; set; } = [];

        /// <summary>
        /// Redes de confianza en notacion CIDR (por ejemplo "10.0.0.0/8").
        /// Util cuando el proxy no tiene IP fija, como en una red de contenedores.
        /// </summary>
        public string[] RedesDeConfianza { get; set; } = [];

        /// <summary>
        /// Solo se procesan cabeceras reenviadas si hay algun proxy o red declarados.
        /// Sin esto, cualquier cliente podria suplantar su IP.
        /// </summary>
        /// <remarks>
        /// Se ignoran las entradas en blanco: una variable de entorno vacia como
        /// Red__ProxiesDeConfianza__0= produce un array de un elemento vacio, que sin
        /// este filtro activaria el modo proxy sin que nadie lo hubiera pedido.
        /// </remarks>
        public bool HayProxiesDeConfianza =>
            EntradasValidas(ProxiesDeConfianza).Any() || EntradasValidas(RedesDeConfianza).Any();

        private static IEnumerable<string> EntradasValidas(string[] valores) =>
            valores.Where(v => !string.IsNullOrWhiteSpace(v)).Select(v => v.Trim());

        /// <summary>Parsea las IPs de proxy, descartando en silencio las mal formadas.</summary>
        public IEnumerable<IPAddress> ParsearProxies() =>
            EntradasValidas(ProxiesDeConfianza)
                .Select(ip => IPAddress.TryParse(ip, out var dir) ? dir : null)
                .Where(dir => dir is not null)!;

        /// <summary>Parsea las redes CIDR ("10.0.0.0/8"), descartando las mal formadas.</summary>
        public IEnumerable<(IPAddress Prefijo, int Longitud)> ParsearRedes()
        {
            foreach (var cidr in EntradasValidas(RedesDeConfianza))
            {
                var partes = cidr.Split('/');
                if (partes.Length == 2
                    && IPAddress.TryParse(partes[0], out var prefijo)
                    && int.TryParse(partes[1], out var longitud))
                {
                    yield return (prefijo, longitud);
                }
            }
        }
    }
}
