using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SergioApi.Migrations
{
    /// <inheritdoc />
    public partial class AgregaCamposPremiumUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PagoSuscripcion");

            migrationBuilder.DropTable(
                name: "HistorialSuscripcion");

            migrationBuilder.AddColumn<bool>(
                name: "EsPremiun",
                table: "videos",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EsPremium",
                table: "usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "FechaVencimientoPremium",
                table: "usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EsPremiun",
                table: "cursos",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsPremiun",
                table: "videos");

            migrationBuilder.DropColumn(
                name: "EsPremium",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "FechaVencimientoPremium",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "EsPremiun",
                table: "cursos");

            migrationBuilder.CreateTable(
                name: "HistorialSuscripcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdUsuario = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    FechaCancelacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaFinal = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaInicio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IdPasarelaPago = table.Column<int>(type: "integer", nullable: false),
                    Moneda = table.Column<string>(type: "text", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false),
                    MotivoCancelacion = table.Column<string>(type: "text", nullable: true),
                    ReferenciaPago = table.Column<string>(type: "text", nullable: false),
                    RenovacionAutomatica = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialSuscripcion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistorialSuscripcion_usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PagoSuscripcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApplicationId = table.Column<int>(type: "integer", nullable: false),
                    CardId = table.Column<string>(type: "text", nullable: false),
                    CollectorId = table.Column<int>(type: "integer", nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaFinal = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaInicial = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaProximoPago = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaUltimaModificacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Frecuencia = table.Column<int>(type: "integer", nullable: false),
                    FrecuenciaPruebaGratuita = table.Column<int>(type: "integer", nullable: true),
                    HistorialSuscripcionId = table.Column<int>(type: "integer", nullable: true),
                    IdSuscripcion = table.Column<int>(type: "integer", nullable: false),
                    InitPoint = table.Column<string>(type: "text", nullable: false),
                    MercadoPagoId = table.Column<string>(type: "text", nullable: false),
                    MetodoDePago = table.Column<string>(type: "text", nullable: false),
                    MonedaId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PayerId = table.Column<string>(type: "text", nullable: false),
                    PreapprovalPlanId = table.Column<string>(type: "text", nullable: false),
                    Razon = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ReferenciaExterna = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TipoFrecuenciaGratuita = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TipoFrecuencias = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TransaccionCantidad = table.Column<decimal>(type: "numeric", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagoSuscripcion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagoSuscripcion_HistorialSuscripcion_HistorialSuscripcionId",
                        column: x => x.HistorialSuscripcionId,
                        principalTable: "HistorialSuscripcion",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistorialSuscripcion_IdUsuario",
                table: "HistorialSuscripcion",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_PagoSuscripcion_HistorialSuscripcionId",
                table: "PagoSuscripcion",
                column: "HistorialSuscripcionId");
        }
    }
}
