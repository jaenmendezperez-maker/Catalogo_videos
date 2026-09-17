namespace SergioApi.Utils
{
    /// <summary>
    /// Unica forma valida de normalizar un correo en toda la API.
    /// Existe porque el codigo guardaba en minusculas pero comparaba sin normalizar,
    /// asi que "Sergio@x.com" pasaba el control de duplicados frente a "sergio@x.com".
    /// Toda comparacion y todo guardado deben pasar por aqui.
    /// </summary>
    public static class NormalizadorCorreo
    {
        public static string Normalizar(string correo) =>
            correo.Trim().ToLowerInvariant();
    }
}
