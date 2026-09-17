using SergioApi.Enums;
using SergioApi.Services.Implementations.Suscripciones;
using Xunit;

namespace SergioApi.Tests;

public class MapeoEstadoMercadoPagoTests
{
    [Theory]
    [InlineData("pending", EstadoSuscripcion.PendientePago)]
    [InlineData("authorized", EstadoSuscripcion.Activa)]
    [InlineData("paused", EstadoSuscripcion.Pausada)]
    [InlineData("suspended", EstadoSuscripcion.Suspendida)]
    [InlineData("cancelled", EstadoSuscripcion.Cancelada)]
    [InlineData("canceled", EstadoSuscripcion.Cancelada)]      // la guia de Mercado Pago lo escribe asi
    [InlineData("  AUTHORIZED ", EstadoSuscripcion.Activa)]
    public void Mapea_los_estados_conocidos(string estadoMp, EstadoSuscripcion esperado) =>
        Assert.Equal(esperado, MapeoEstadoMercadoPago.Mapear(estadoMp));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("expired")]
    public void Un_estado_desconocido_no_se_adivina(string? estadoMp) =>
        Assert.Null(MapeoEstadoMercadoPago.Mapear(estadoMp));

    [Theory]
    [InlineData("authorized", true)]
    [InlineData("Authorized", true)]
    [InlineData("pending", false)]
    [InlineData("paused", false)]
    [InlineData("cancelled", false)]
    [InlineData(null, false)]
    public void Solo_authorized_da_derecho_a_la_gracia(string? estadoMp, bool esperado) =>
        Assert.Equal(esperado, MapeoEstadoMercadoPago.EstaAutorizada(estadoMp));
}
