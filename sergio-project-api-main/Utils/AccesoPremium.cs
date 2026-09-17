using SergioApi.Models.Entities;
using SergioApi.Models.Entities.Videos;

namespace SergioApi.Utils
{
    /// <summary>
    /// Unica forma valida de decidir si un usuario tiene premium y si un video lo exige.
    /// </summary>
    /// <remarks>
    /// El acceso se decide por FECHA (Usuario.FechaVencimientoPremium), no por el flag
    /// Usuario.EsPremium. Asi la caducidad no depende de que corra ningun proceso: en
    /// cuanto pasa la fecha, el acceso se acaba solo.
    ///
    /// Un curso premium hace premium a todos sus videos. Antes solo se miraba el flag del
    /// video, asi que un video no premium dentro de un curso premium se veia gratis.
    /// </remarks>
    public static class AccesoPremium
    {
        /// <summary>El acceso sigue vigente si la fecha de vencimiento es posterior a ahora.</summary>
        public static bool EstaVigente(DateTimeOffset? fechaVencimiento, DateTimeOffset ahora) =>
            fechaVencimiento is not null && fechaVencimiento.Value > ahora;

        public static bool EstaVigente(Usuario usuario) =>
            EstaVigente(usuario.FechaVencimientoPremium, DateTimeOffset.UtcNow);

        /// <summary>Un video exige premium si lo es el propio video o su curso.</summary>
        public static bool RequierePremium(bool videoEsPremium, bool? cursoEsPremium) =>
            videoEsPremium || cursoEsPremium == true;

        /// <summary>
        /// Requiere que <see cref="Video.VideoCurso"/> este cargado; si no lo esta, solo
        /// cuenta el flag del video. Los repositorios de lectura ya hacen el Include.
        /// </summary>
        public static bool RequierePremium(Video video) =>
            RequierePremium(video.EsPremium, video.VideoCurso?.EsPremium);
    }
}
