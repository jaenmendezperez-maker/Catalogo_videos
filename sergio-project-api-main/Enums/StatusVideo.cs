namespace SergioApi.Enums
{
    public enum StatusVideo
    {
        EnCola = 0,                             // EL video esta en cola para encodificar, no ha comenzado el proceso
        Procesando = 1,                         //El video ha iniciado a procesar los detalles de la vista previa y el formato
        Codificando = 2,                        //El video esta siendo encodificado, el proceso de encoding ha comenzado pero no ha terminado
        Terminado = 3,                          // La codificacion del video ha ginalizados y esta complletamente disponible
        ResolucionFinalizada = 4,               // El codificador ha finalizado el procesamiento de una de las resoluciones. 
        Fallo = 5,                              //La codificacion del video falló. EL video ha finalizado su procesamiento
        PresignedUploadStarted = 6,             //Se ha iniciado una carga con firma previa.
        PresignedUploadFinished = 7,            // Se ha completado la carga con firma previa.
        PresignedUploadFailed = 8,              // Se ha producido un error al cargar un archivo pre-firmado.
        SubtitulosGenerados = 9,                // Los subtítulos del video han sido generados automáticamente por el sistema
        TituloODescripcionGenerados = 10        // El título o la descripción del video han sido generados automáticamente
    }
}