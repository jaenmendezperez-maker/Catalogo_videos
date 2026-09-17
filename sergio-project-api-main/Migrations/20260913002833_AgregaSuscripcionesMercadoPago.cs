using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SergioApi.Migrations
{
    /// <inheritdoc />
    public partial class AgregaSuscripcionesMercadoPago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notificaciones_mercadopago",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tipo = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    RecursoId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    RequestId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RecibidaEn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ProcesadaEn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Error = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificaciones_mercadopago", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "suscripciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    MercadoPagoPreapprovalId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    InitPoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CorreoPagador = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EstadoMercadoPago = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Monto = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    FrecuenciaCobro = table.Column<int>(type: "integer", nullable: false),
                    TipoFrecuenciaCobro = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaAutorizacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FechaProximoCobro = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FechaCancelacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CanceladaPor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PeriodoPagadoHasta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    AccesoHasta = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UltimaSincronizacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UltimoPayloadMp = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_suscripciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_suscripciones_usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "pagos_suscripcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SuscripcionId = table.Column<int>(type: "integer", nullable: false),
                    MercadoPagoAuthorizedPaymentId = table.Column<long>(type: "bigint", nullable: false),
                    MercadoPagoPaymentId = table.Column<long>(type: "bigint", nullable: true),
                    EstadoFactura = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    EstadoPago = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Monto = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    Moneda = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    FechaAprobacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FechaCobroProgramada = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Intento = table.Column<int>(type: "integer", nullable: true),
                    FechaActualizacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pagos_suscripcion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pagos_suscripcion_suscripciones_SuscripcionId",
                        column: x => x.SuscripcionId,
                        principalTable: "suscripciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_notificaciones_mercadopago_RecibidaEn",
                table: "notificaciones_mercadopago",
                column: "RecibidaEn");

            migrationBuilder.CreateIndex(
                name: "IX_pagos_suscripcion_MercadoPagoAuthorizedPaymentId",
                table: "pagos_suscripcion",
                column: "MercadoPagoAuthorizedPaymentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pagos_suscripcion_MercadoPagoPaymentId",
                table: "pagos_suscripcion",
                column: "MercadoPagoPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_pagos_suscripcion_SuscripcionId",
                table: "pagos_suscripcion",
                column: "SuscripcionId");

            migrationBuilder.CreateIndex(
                name: "IX_suscripciones_MercadoPagoPreapprovalId",
                table: "suscripciones",
                column: "MercadoPagoPreapprovalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_suscripciones_UsuarioId_Estado",
                table: "suscripciones",
                columns: new[] { "UsuarioId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_suscripciones_UsuarioId_PendientePago",
                table: "suscripciones",
                column: "UsuarioId",
                unique: true,
                filter: "\"Estado\" = 'PendientePago'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notificaciones_mercadopago");

            migrationBuilder.DropTable(
                name: "pagos_suscripcion");

            migrationBuilder.DropTable(
                name: "suscripciones");
        }
    }
}
