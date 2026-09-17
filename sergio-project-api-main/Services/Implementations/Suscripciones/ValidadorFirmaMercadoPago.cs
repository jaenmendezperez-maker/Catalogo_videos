using System.Security.Cryptography;
using System.Text;

namespace SergioApi.Services.Implementations.Suscripciones
{
    /// <summary>
    /// Valida la firma de los webhooks de Mercado Pago (cabecera x-signature).
    /// </summary>
    /// <remarks>
    /// Formato de la cabecera: "ts=1704908010,v1=618c85...".
    /// Manifiesto firmado: "id:{data.id};request-id:{x-request-id};ts:{ts};"
    ///   - data.id sale del QUERY (?data.id=...), no del cuerpo.
    ///   - Si data.id es alfanumerico se pasa a minusculas.
    ///   - Si data.id o x-request-id faltan, su parte se OMITE del manifiesto.
    /// v1 = HMAC-SHA256 del manifiesto con la clave secreta, en hexadecimal.
    ///
    /// No se comprueba la antiguedad de ts: los reintentos de Mercado Pago pueden
    /// reutilizarlo. Reenviar un webhook valido es inocuo porque el handler nunca se fia
    /// del cuerpo y siempre relee el estado de Mercado Pago con nuestro token.
    /// </remarks>
    public static class ValidadorFirmaMercadoPago
    {
        public static bool EsValida(string? xSignature, string? xRequestId, string? dataId, string secreto)
        {
            if (string.IsNullOrWhiteSpace(xSignature) || string.IsNullOrEmpty(secreto))
                return false;

            var (ts, v1) = ParsearCabecera(xSignature);
            if (string.IsNullOrEmpty(ts) || string.IsNullOrEmpty(v1))
                return false;

            var manifiesto = ConstruirManifiesto(dataId, xRequestId, ts);
            var esperado   = CalcularFirma(manifiesto, secreto);

            // Comparacion en tiempo constante: una comparacion normal revelaria, midiendo
            // tiempos, cuantos caracteres iniciales coinciden.
            return CryptographicOperations.FixedTimeEquals(
                Encoding.ASCII.GetBytes(esperado),
                Encoding.ASCII.GetBytes(v1.ToLowerInvariant()));
        }

        public static (string? Ts, string? V1) ParsearCabecera(string xSignature)
        {
            string? ts = null, v1 = null;

            foreach (var parte in xSignature.Split(','))
            {
                var claveValor = parte.Split('=', 2);
                if (claveValor.Length != 2) continue;

                var clave = claveValor[0].Trim();
                var valor = claveValor[1].Trim();

                if (clave == "ts") ts = valor;
                else if (clave == "v1") v1 = valor;
            }

            return (ts, v1);
        }

        public static string ConstruirManifiesto(string? dataId, string? xRequestId, string ts)
        {
            var sb = new StringBuilder();

            if (!string.IsNullOrEmpty(dataId))
                sb.Append("id:").Append(NormalizarDataId(dataId)).Append(';');

            if (!string.IsNullOrEmpty(xRequestId))
                sb.Append("request-id:").Append(xRequestId).Append(';');

            sb.Append("ts:").Append(ts).Append(';');
            return sb.ToString();
        }

        /// <summary>Mercado Pago firma data.id en minusculas cuando es alfanumerico.</summary>
        public static string NormalizarDataId(string dataId) =>
            dataId.All(char.IsLetterOrDigit) ? dataId.ToLowerInvariant() : dataId;

        public static string CalcularFirma(string manifiesto, string secreto) =>
            Convert.ToHexString(
                HMACSHA256.HashData(Encoding.UTF8.GetBytes(secreto), Encoding.UTF8.GetBytes(manifiesto)))
            .ToLowerInvariant();
    }
}
