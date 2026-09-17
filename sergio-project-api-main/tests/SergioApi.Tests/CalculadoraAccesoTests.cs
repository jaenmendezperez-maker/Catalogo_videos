using SergioApi.Services.Implementations.Suscripciones;
using Xunit;

namespace SergioApi.Tests;

/// <summary>
/// El calculo que decide si un suscriptor ve contenido premium. Un error aqui regala
/// acceso o se lo quita a quien pago.
/// </summary>
public class CalculadoraAccesoTests
{
    private static readonly DateTimeOffset Enero15 = new(2026, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Febrero15 = new(2026, 2, 15, 12, 0, 0, TimeSpan.Zero);

    private static DateTimeOffset? Periodo(params CobroParaAcceso[] cobros) =>
        CalculadoraAcceso.PeriodoPagadoHasta(cobros, 1, "months");

    // ── Periodo pagado ────────────────────────────────────────

    [Fact]
    public void Sin_cobros_no_hay_periodo_pagado() =>
        Assert.Null(Periodo());

    [Fact]
    public void Un_cobro_aprobado_cubre_un_mes() =>
        Assert.Equal(Febrero15, Periodo(new CobroParaAcceso(Enero15, "approved")));

    [Theory]
    [InlineData("rejected")]
    [InlineData("pending")]
    [InlineData("in_process")]
    [InlineData("refunded")]
    [InlineData("charged_back")]
    [InlineData(null)]
    public void Solo_cuenta_un_pago_que_sigue_aprobado(string? estado) =>
        Assert.Null(Periodo(new CobroParaAcceso(Enero15, estado)));

    [Fact]
    public void Un_contracargo_recorta_el_periodo()
    {
        // El cobro de febrero se aprobo y despues se revirtio: el acceso vuelve a
        // terminar donde cubria el de enero.
        var resultado = Periodo(
            new CobroParaAcceso(Enero15, "approved"),
            new CobroParaAcceso(Febrero15, "charged_back"));

        Assert.Equal(Febrero15, resultado);
    }

    [Fact]
    public void Un_reintento_aprobado_mas_tarde_desplaza_el_periodo()
    {
        // El cobro del 15 fallo y el reintento del 25 salio aprobado: el mes cuenta
        // desde la aprobacion, a favor del usuario.
        var reintento = new DateTimeOffset(2026, 1, 25, 9, 0, 0, TimeSpan.Zero);
        Assert.Equal(reintento.AddMonths(1), Periodo(new CobroParaAcceso(reintento, "approved")));
    }

    [Fact]
    public void Se_toma_el_maximo_no_se_acumula()
    {
        // Dos meses pagados llegan hasta el 15 de marzo, no hasta abril.
        var resultado = Periodo(
            new CobroParaAcceso(Enero15, "approved"),
            new CobroParaAcceso(Febrero15, "approved"));

        Assert.Equal(new DateTimeOffset(2026, 3, 15, 12, 0, 0, TimeSpan.Zero), resultado);
    }

    [Fact]
    public void Fechas_con_offset_se_normalizan_a_UTC()
    {
        // Mercado Pago manda fechas con -04:00 y Npgsql solo guarda offset cero.
        var conOffset = new DateTimeOffset(2026, 1, 15, 8, 0, 0, TimeSpan.FromHours(-4));
        var resultado = Periodo(new CobroParaAcceso(conOffset, "approved"));

        Assert.Equal(TimeSpan.Zero, resultado!.Value.Offset);
        Assert.Equal(Febrero15, resultado);
    }

    [Fact]
    public void Treinta_y_uno_de_enero_mas_un_mes_es_fin_de_febrero()
    {
        var enero31 = new DateTimeOffset(2026, 1, 31, 12, 0, 0, TimeSpan.Zero);
        Assert.Equal(
            new DateTimeOffset(2026, 2, 28, 12, 0, 0, TimeSpan.Zero),
            Periodo(new CobroParaAcceso(enero31, "approved")));
    }

    [Fact]
    public void La_frecuencia_en_dias_permite_probar_renovaciones() =>
        Assert.Equal(
            Enero15.AddDays(1),
            CalculadoraAcceso.PeriodoPagadoHasta([new CobroParaAcceso(Enero15, "approved")], 1, "days"));

    [Fact]
    public void Tipo_de_frecuencia_desconocido_falla_en_vez_de_adivinar() =>
        Assert.Throws<ArgumentOutOfRangeException>(() => CalculadoraAcceso.SumarPeriodo(Enero15, 1, "weeks"));

    [Fact]
    public void El_estado_aprobado_no_distingue_mayusculas()
    {
        Assert.True(CalculadoraAcceso.EsPagoAprobado("APPROVED"));
        Assert.False(CalculadoraAcceso.EsPagoAprobado(null));
    }

    // ── Acceso (periodo + gracia) ─────────────────────────────

    [Fact]
    public void La_gracia_se_suma_si_la_suscripcion_sigue_autorizada() =>
        Assert.Equal(Febrero15.AddDays(3), CalculadoraAcceso.AccesoHasta(Febrero15, autorizadaEnMercadoPago: true, diasGracia: 3));

    [Fact]
    public void Quien_cancela_conserva_lo_pagado_pero_no_la_gracia() =>
        Assert.Equal(Febrero15, CalculadoraAcceso.AccesoHasta(Febrero15, autorizadaEnMercadoPago: false, diasGracia: 3));

    [Fact]
    public void Sin_periodo_pagado_no_hay_acceso_aunque_este_autorizada() =>
        // Decision de negocio: nada de acceso hasta que haya un cobro aprobado.
        Assert.Null(CalculadoraAcceso.AccesoHasta(null, autorizadaEnMercadoPago: true, diasGracia: 3, Enero15, horasProvisional: 0));

    [Fact]
    public void El_acceso_provisional_solo_existe_si_se_configura() =>
        Assert.Equal(
            Enero15.AddHours(24),
            CalculadoraAcceso.AccesoHasta(null, autorizadaEnMercadoPago: true, diasGracia: 3, Enero15, horasProvisional: 24));

    [Fact]
    public void El_acceso_provisional_no_aplica_a_una_suscripcion_no_autorizada() =>
        Assert.Null(CalculadoraAcceso.AccesoHasta(null, autorizadaEnMercadoPago: false, diasGracia: 3, Enero15, horasProvisional: 24));
}
