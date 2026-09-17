using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SergioApi.Filters
{
    /// <summary>
    /// Aplica a un endpoint el tope de subida definido en <c>Uploads:MaxVideoBytes</c>.
    /// </summary>
    /// <remarks>
    /// Existe porque [RequestSizeLimit] necesita una constante en tiempo de compilacion,
    /// asi que el valor de configuracion quedaba muerto: appsettings.json declaraba
    /// 2 GB y el atributo imponia 5 GB, sin que nadie leyera el primero.
    ///
    /// Es un IResourceFilter a proposito: se ejecuta ANTES del enlace de modelo, que es
    /// cuando MVC consume el multipart. Hacerlo dentro de la accion seria tarde.
    /// </remarks>
    public sealed class LimiteSubidaAttribute : Attribute, IResourceFilter
    {
        /// <summary>Tope por defecto si no hay configuracion: 2 GB.</summary>
        public const long PorDefecto = 2L * 1024 * 1024 * 1024;

        public void OnResourceExecuting(ResourceExecutingContext context)
        {
            var caracteristica = context.HttpContext.Features.Get<IHttpMaxRequestBodySizeFeature>();

            // En algunos servidores es de solo lectura (por ejemplo si ya empezo a leerse
            // el cuerpo). En ese caso rige el limite global y no hay nada que hacer.
            if (caracteristica is null || caracteristica.IsReadOnly)
                return;

            var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var maximo = config.GetValue<long?>("Uploads:MaxVideoBytes") ?? PorDefecto;

            caracteristica.MaxRequestBodySize = maximo;
        }

        public void OnResourceExecuted(ResourceExecutedContext context) { }
    }
}
