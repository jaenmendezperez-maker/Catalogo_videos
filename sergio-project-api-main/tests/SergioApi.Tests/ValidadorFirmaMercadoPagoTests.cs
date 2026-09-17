using System.Security.Cryptography;
using System.Text;
using SergioApi.Services.Implementations.Suscripciones;
using Xunit;

namespace SergioApi.Tests;

/// <summary>
/// La firma de los webhooks es la unica barrera del endpoint anonimo de Mercado Pago.
/// La firma esperada se calcula aqui con HMACSHA256 directamente, sin pasar por el
/// validador, para que un error en el validador no se "confirme" a si mismo.
/// </summary>
public class ValidadorFirmaMercadoPagoTests
{
    private const string Secreto   = "clave-secreta-de-prueba";
    private const string Ts        = "1704908010";
    private const string DataId    = "123456";
    private const string RequestId = "bb56a2f1-6aae-46ac-982e-9dcd3581d08e";

    private static string Hmac(string mensaje, string secreto = Secreto) =>
        Convert.ToHexString(
            HMACSHA256.HashData(Encoding.UTF8.GetBytes(secreto), Encoding.UTF8.GetBytes(mensaje)))
        .ToLowerInvariant();

    private static string FirmaValida() => Hmac($"id:{DataId};request-id:{RequestId};ts:{Ts};");

    // ── Manifiesto ────────────────────────────────────────────

    [Fact]
    public void Manifiesto_completo_sigue_el_formato_documentado() =>
        Assert.Equal(
            "id:123456;request-id:req-1;ts:1704908010;",
            ValidadorFirmaMercadoPago.ConstruirManifiesto("123456", "req-1", "1704908010"));

    [Fact]
    public void Manifiesto_omite_las_partes_ausentes()
    {
        Assert.Equal("ts:1;", ValidadorFirmaMercadoPago.ConstruirManifiesto(null, null, "1"));
        Assert.Equal("id:9;ts:1;", ValidadorFirmaMercadoPago.ConstruirManifiesto("9", null, "1"));
        Assert.Equal("request-id:r;ts:1;", ValidadorFirmaMercadoPago.ConstruirManifiesto("", "r", "1"));
    }

    [Fact]
    public void DataId_alfanumerico_se_pasa_a_minusculas() =>
        // Ejemplo de la documentacion: ORD01JQ4S4KY8HWQ6NA5PXB65B3D3 -> ord01jq4s4ky8hwq6na5pxb65b3d3
        Assert.Equal(
            "id:ord01jq4s4ky8hwq6na5pxb65b3d3;ts:1;",
            ValidadorFirmaMercadoPago.ConstruirManifiesto("ORD01JQ4S4KY8HWQ6NA5PXB65B3D3", null, "1"));

    [Fact]
    public void DataId_con_simbolos_no_se_modifica() =>
        Assert.Equal("ABC-123", ValidadorFirmaMercadoPago.NormalizarDataId("ABC-123"));

    // ── Aceptacion ────────────────────────────────────────────

    [Fact]
    public void Firma_valida_se_acepta() =>
        Assert.True(ValidadorFirmaMercadoPago.EsValida($"ts={Ts},v1={FirmaValida()}", RequestId, DataId, Secreto));

    [Fact]
    public void Firma_con_espacios_y_orden_invertido_se_acepta() =>
        Assert.True(ValidadorFirmaMercadoPago.EsValida($"v1={FirmaValida()}, ts={Ts}", RequestId, DataId, Secreto));

    [Fact]
    public void Firma_en_mayusculas_se_acepta() =>
        Assert.True(ValidadorFirmaMercadoPago.EsValida(
            $"ts={Ts},v1={FirmaValida().ToUpperInvariant()}", RequestId, DataId, Secreto));

    [Fact]
    public void Firma_sin_request_id_se_calcula_sin_esa_parte()
    {
        var v1 = Hmac($"id:{DataId};ts:{Ts};");
        Assert.True(ValidadorFirmaMercadoPago.EsValida($"ts={Ts},v1={v1}", null, DataId, Secreto));
    }

    // ── Rechazo ───────────────────────────────────────────────

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("ts=1704908010")]                 // sin v1
    [InlineData("v1=abcdef")]                     // sin ts
    [InlineData("basura sin formato")]
    public void Cabecera_ausente_o_mal_formada_se_rechaza(string? cabecera) =>
        Assert.False(ValidadorFirmaMercadoPago.EsValida(cabecera, RequestId, DataId, Secreto));

    [Fact]
    public void Secreto_distinto_se_rechaza() =>
        Assert.False(ValidadorFirmaMercadoPago.EsValida($"ts={Ts},v1={FirmaValida()}", RequestId, DataId, "otro-secreto"));

    [Fact]
    public void Secreto_vacio_se_rechaza_siempre()
    {
        // Sin secreto configurado el webhook tiene que rechazar todo, nunca aceptarlo todo.
        var v1 = Hmac($"id:{DataId};request-id:{RequestId};ts:{Ts};", secreto: "");
        Assert.False(ValidadorFirmaMercadoPago.EsValida($"ts={Ts},v1={v1}", RequestId, DataId, ""));
    }

    [Fact]
    public void DataId_alterado_se_rechaza() =>
        Assert.False(ValidadorFirmaMercadoPago.EsValida($"ts={Ts},v1={FirmaValida()}", RequestId, "999999", Secreto));

    [Fact]
    public void RequestId_alterado_se_rechaza() =>
        Assert.False(ValidadorFirmaMercadoPago.EsValida($"ts={Ts},v1={FirmaValida()}", "otro-request", DataId, Secreto));

    [Fact]
    public void Ts_alterado_se_rechaza() =>
        Assert.False(ValidadorFirmaMercadoPago.EsValida($"ts=1704908011,v1={FirmaValida()}", RequestId, DataId, Secreto));
}
