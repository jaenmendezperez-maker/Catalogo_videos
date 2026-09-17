using SergioApi.Configuration;
using SergioApi.Repositories.Suscripciones;
using SergioApi.Services.Interfaces.Suscripciones;

namespace SergioApi.Services.Implementations.Suscripciones
{
    /// <summary>
    /// Proceso en segundo plano que mantiene las suscripciones al dia aunque se pierdan
    /// webhooks.
    /// </summary>
    /// <remarks>
    /// Cada hora:
    ///   1. Cancela en Mercado Pago las pendientes que nadie pago a tiempo, para que su
    ///      enlace de pago deje de funcionar (un enlace viejo pagado tarde = cobro doble).
    ///   2. Resincroniza las suscripciones vivas, con prioridad a las que estan cerca de
    ///      su fecha de cobro y a las que llevan mas tiempo sin sincronizar.
    ///   3. Pone EsPremium = false a quien ya caduco (cosmetico: el acceso va por fecha).
    ///   4. Purga notificaciones de mas de 30 dias.
    ///
    /// El acceso NO depende de este proceso: se decide por fecha en cada peticion. Si no
    /// corriera, lo unico que se perderia es la recuperacion de webhooks perdidos.
    /// </remarks>
    public sealed class ConciliacionSuscripcionesService : BackgroundService
    {
        private static readonly TimeSpan Intervalo      = TimeSpan.FromHours(1);
        private static readonly TimeSpan RetrasoInicial = TimeSpan.FromMinutes(1);
        private const int MaximoPorIteracion = 200;
        private const int DiasRetencionNotificaciones = 30;

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ConciliacionSuscripcionesService> _logger;

        public ConciliacionSuscripcionesService(
            IServiceScopeFactory scopeFactory,
            IConfiguration configuration,
            ILogger<ConciliacionSuscripcionesService> logger)
        {
            _scopeFactory  = scopeFactory;
            _configuration = configuration;
            _logger        = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                // No competir con el arranque (migraciones, primeras peticiones).
                await Task.Delay(RetrasoInicial, stoppingToken);

                using var temporizador = new PeriodicTimer(Intervalo);
                do
                {
                    try
                    {
                        await EjecutarIteracionAsync(stoppingToken);
                    }
                    catch (Exception ex) when (ex is not OperationCanceledException)
                    {
                        // Un fallo en una iteracion no puede tumbar el proceso para siempre.
                        _logger.LogError(ex, "Fallo la conciliacion de suscripciones.");
                    }
                }
                while (await temporizador.WaitForNextTickAsync(stoppingToken));
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Apagado normal de la aplicacion.
            }
        }

        private async Task EjecutarIteracionAsync(CancellationToken ct)
        {
            // Se lee de configuracion en crudo: en Development, sin credenciales, resolver
            // IOptions<MercadoPagoOptions> lanzaria la validacion en cada iteracion.
            var config = _configuration.GetSection(MercadoPagoOptions.SectionName).Get<MercadoPagoOptions>();
            if (config is null || !config.EstaConfigurado)
            {
                _logger.LogDebug("Mercado Pago no esta configurado; se omite la conciliacion.");
                return;
            }

            using var scope = _scopeFactory.CreateScope();
            var repo          = scope.ServiceProvider.GetRequiredService<ISuscripcionRepository>();
            var sincronizador = scope.ServiceProvider.GetRequiredService<ISincronizadorSuscripciones>();
            var servicio      = scope.ServiceProvider.GetRequiredService<ISuscripcionService>();

            var ahora = DateTimeOffset.UtcNow;
            int abandonadas = 0, sincronizadas = 0, fallidas = 0;

            // 1. Pendientes caducadas
            foreach (var id in await repo.PendientesCaducadasAsync(ahora.AddHours(-config.HorasCaducidadPendiente), ct))
            {
                try
                {
                    if (await servicio.AbandonarPendienteAsync(id, ct)) abandonadas++;
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    fallidas++;
                    _logger.LogWarning(ex, "No se pudo abandonar la suscripcion pendiente {Id}.", id);
                }
            }

            // 2. Reconciliacion
            foreach (var id in await repo.IdsParaConciliarAsync(ahora, MaximoPorIteracion, ct))
            {
                try
                {
                    await sincronizador.SincronizarAsync(id, ct);
                    sincronizadas++;
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    fallidas++;
                    _logger.LogWarning(ex, "No se pudo sincronizar la suscripcion {Id}.", id);
                }
            }

            // 3 y 4. Limpieza
            var premiumCaducados = await repo.LimpiarPremiumCaducadoAsync(ahora, ct);
            var purgadas = await repo.PurgarNotificacionesAsync(ahora.AddDays(-DiasRetencionNotificaciones), ct);

            _logger.LogInformation(
                "Conciliacion de suscripciones: {Sincronizadas} sincronizadas, {Abandonadas} pendientes abandonadas, "
              + "{Fallidas} fallos, {Premium} premium caducados, {Purgadas} notificaciones purgadas.",
                sincronizadas, abandonadas, fallidas, premiumCaducados, purgadas);
        }
    }
}
