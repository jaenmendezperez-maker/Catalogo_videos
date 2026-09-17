namespace SergioApi.Models.DTOs
{
    /// <summary>
    /// Forma unica de error en toda la API.
    /// </summary>
    /// <remarks>
    /// Existe para que el cliente no tenga que distinguir dos formatos. Antes, los
    /// errores de validacion salian como ProblemDetails de ASP.NET
    /// ({ type, title, status, errors }) mientras que los del middleware salian como
    /// { exito, mensaje, codigo }. Ahora ambos caminos construyen este mismo tipo.
    /// </remarks>
    public class RespuestaErrorDto
    {
        /// <summary>Siempre false. Permite al cliente ramificar sin mirar el codigo.</summary>
        public bool Exito => false;

        /// <summary>Mensaje legible. Generico en los 500, para no filtrar internos.</summary>
        public required string Mensaje { get; set; }

        /// <summary>Codigo HTTP, repetido en el cuerpo por comodidad del cliente.</summary>
        public int Codigo { get; set; }

        /// <summary>Identificador de la peticion, para correlacionar con los logs.</summary>
        public string? TraceId { get; set; }

        /// <summary>
        /// Errores por campo. Solo se rellena en los fallos de validacion;
        /// en el resto se omite del JSON.
        /// </summary>
        public IDictionary<string, string[]>? Errores { get; set; }
    }
}
