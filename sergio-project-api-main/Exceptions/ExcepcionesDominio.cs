namespace SergioApi.Exceptions
{
    /// <summary>
    /// Violacion de una regla de negocio, atribuible al cliente. Se traduce a 400
    /// y su mensaje SI se muestra al usuario.
    /// Existe para no seguir usando InvalidOperationException, que .NET y EF lanzan
    /// internamente: mapearla a 400 con su mensaje filtraba detalles del motor
    /// (por ejemplo, el texto completo de una expresion LINQ no traducible).
    /// </summary>
    public class ReglaNegocioException : Exception
    {
        public ReglaNegocioException(string mensaje) : base(mensaje) { }
    }

    /// <summary>
    /// El usuario esta autenticado pero no tiene permiso sobre el recurso. Se traduce a 403.
    /// Distinta de UnauthorizedAccessException (401), que significa "no se quien eres".
    /// La diferencia importa al cliente: ante un 401 conviene refrescar el token,
    /// ante un 403 refrescar no arregla nada.
    /// </summary>
    public class AccesoProhibidoException : Exception
    {
        public AccesoProhibidoException(string mensaje) : base(mensaje) { }
    }

    /// <summary>Conflicto con el estado actual del recurso. Se traduce a 409.</summary>
    public class ConflictoException : Exception
    {
        public ConflictoException(string mensaje) : base(mensaje) { }
    }
}
