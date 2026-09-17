using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SergioApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bunny_libraries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BunnyLibreriaId = table.Column<long>(type: "bigint", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ApiKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ApiKeyLectura = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TokenAuthHabilitado = table.Column<bool>(type: "boolean", nullable: false),
                    DRMHabilitado = table.Column<bool>(type: "boolean", nullable: false),
                    VersionDRM = table.Column<int>(type: "integer", nullable: false),
                    WebhookUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ResolucionesHabilitadas = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    HabilitarMP4Fallback = table.Column<bool>(type: "boolean", nullable: false),
                    MantieneArchivosOriginales = table.Column<bool>(type: "boolean", nullable: false),
                    PermiteReproduccionDirecta = table.Column<bool>(type: "boolean", nullable: false),
                    JitEncodingHabilitado = table.Column<bool>(type: "boolean", nullable: false),
                    NivelEncoding = table.Column<int>(type: "integer", nullable: false),
                    CodecsOutput = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    TranscripcionHabilitada = table.Column<bool>(type: "boolean", nullable: false),
                    GenerarTitulosAuto = table.Column<bool>(type: "boolean", nullable: false),
                    GenerarDescripcionesAuto = table.Column<bool>(type: "boolean", nullable: false),
                    GenerarCapitulosAuto = table.Column<bool>(type: "boolean", nullable: false),
                    GenerarMomentosAuto = table.Column<bool>(type: "boolean", nullable: false),
                    ColorPlayer = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    HTMLPersonalizado = table.Column<string>(type: "text", nullable: true),
                    Controles = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    VelocidadesReproduccion = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FamiliaFuente = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MostrarHeatmap = table.Column<bool>(type: "boolean", nullable: false),
                    PermitirReproduccionTemprana = table.Column<bool>(type: "boolean", nullable: false),
                    RecordarPosicion = table.Column<bool>(type: "boolean", nullable: false),
                    IdiomaUI = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TamanoFuenteSubtitulos = table.Column<int>(type: "integer", nullable: false),
                    ColorFuenteSubtitulos = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    FondoSubtitulos = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SubtitulosEnPlaylist = table.Column<bool>(type: "boolean", nullable: false),
                    TieneMarcaAgua = table.Column<bool>(type: "boolean", nullable: false),
                    MarcaAguaPosIzquierda = table.Column<int>(type: "integer", nullable: false),
                    MarcaAguaPosSuperior = table.Column<int>(type: "integer", nullable: false),
                    MarcaAguaAncho = table.Column<int>(type: "integer", nullable: false),
                    MarcaAguaAlto = table.Column<int>(type: "integer", nullable: false),
                    CantidadVideos = table.Column<long>(type: "bigint", nullable: false),
                    UsoTrafico = table.Column<long>(type: "bigint", nullable: false),
                    UsoAlmacenamiento = table.Column<long>(type: "bigint", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bunny_libraries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RolUsuario = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "cursos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BunnyColleccionId = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    BunnyLibreriaId = table.Column<long>(type: "bigint", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CantidadVideos = table.Column<long>(type: "bigint", nullable: false),
                    TamanoTotal = table.Column<long>(type: "bigint", nullable: false),
                    PreviewVideoIds = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BunnyLibraryId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cursos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cursos_bunny_libraries_BunnyLibraryId",
                        column: x => x.BunnyLibraryId,
                        principalTable: "bunny_libraries",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Correo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContrasenaHash = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    RolId = table.Column<int>(type: "integer", nullable: false),
                    FotoPerfil = table.Column<string>(type: "text", nullable: true),
                    FechaRegistro = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_usuarios_roles_RolId",
                        column: x => x.RolId,
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "videos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BunnyVideoId = table.Column<string>(type: "text", nullable: false),
                    BunnyLibreriaId = table.Column<long>(type: "bigint", nullable: false),
                    VideoCursoId = table.Column<int>(type: "integer", nullable: true),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    FechaSubida = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EsPublico = table.Column<bool>(type: "boolean", nullable: false),
                    DuracionSegundos = table.Column<int>(type: "integer", nullable: false),
                    Ancho = table.Column<int>(type: "integer", nullable: false),
                    Alto = table.Column<int>(type: "integer", nullable: false),
                    Framerate = table.Column<double>(type: "numeric(5,2)", nullable: false),
                    Rotacion = table.Column<int>(type: "integer", nullable: true),
                    AlmacenamientoTamano = table.Column<long>(type: "bigint", nullable: false),
                    ProgresoEncoding = table.Column<int>(type: "integer", nullable: false),
                    TieneMP4Fallback = table.Column<bool>(type: "boolean", nullable: false),
                    NombreArchivoThumbnail = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CantidadThumbnails = table.Column<int>(type: "integer", nullable: false),
                    ThumbnailBlurhash = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CodecsOutput = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ResolucionesDisponibles = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Categoria = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    JitEncodingHabilitado = table.Column<bool>(type: "boolean", nullable: true),
                    EstadoSmartGenerate = table.Column<int>(type: "integer", nullable: false),
                    TieneOriginal = table.Column<bool>(type: "boolean", nullable: true),
                    HashOriginal = table.Column<string>(type: "text", nullable: true),
                    TienePreviewAltaCalidad = table.Column<bool>(type: "boolean", nullable: true),
                    Vistas = table.Column<long>(type: "bigint", nullable: false),
                    TiempoPromedioVista = table.Column<long>(type: "bigint", nullable: false),
                    TiempoTotalVista = table.Column<long>(type: "bigint", nullable: false),
                    BunnyLibraryId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_videos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_videos_bunny_libraries_BunnyLibraryId",
                        column: x => x.BunnyLibraryId,
                        principalTable: "bunny_libraries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_videos_cursos_VideoCursoId",
                        column: x => x.VideoCursoId,
                        principalTable: "cursos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HistorialSuscripcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdUsuario = table.Column<int>(type: "integer", nullable: false),
                    FechaInicio = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaFinal = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaCancelacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    RenovacionAutomatica = table.Column<bool>(type: "boolean", nullable: false),
                    MotivoCancelacion = table.Column<string>(type: "text", nullable: true),
                    IdPasarelaPago = table.Column<int>(type: "integer", nullable: false),
                    ReferenciaPago = table.Column<string>(type: "text", nullable: false),
                    Monto = table.Column<decimal>(type: "numeric", nullable: false),
                    Moneda = table.Column<string>(type: "text", nullable: false)
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
                name: "refresh_tokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "text", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    FechaExpiracion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EstaRevocado = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DispositivoOrigen = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "video_subtitulos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VideoId = table.Column<int>(type: "integer", nullable: false),
                    Srclang = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_video_subtitulos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_video_subtitulos_videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PagoSuscripcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MercadoPagoId = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: true),
                    ApplicationId = table.Column<int>(type: "integer", nullable: false),
                    CollectorId = table.Column<int>(type: "integer", nullable: false),
                    PreapprovalPlanId = table.Column<string>(type: "text", nullable: false),
                    Razon = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ReferenciaExterna = table.Column<string>(type: "text", nullable: false),
                    InitPoint = table.Column<string>(type: "text", nullable: false),
                    PayerId = table.Column<string>(type: "text", nullable: false),
                    CardId = table.Column<string>(type: "text", nullable: false),
                    MetodoDePago = table.Column<string>(type: "text", nullable: false),
                    FechaProximoPago = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaCreacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaUltimaModificacion = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Frecuencia = table.Column<int>(type: "integer", nullable: false),
                    TipoFrecuencias = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    FechaInicial = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FechaFinal = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    MonedaId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TransaccionCantidad = table.Column<decimal>(type: "numeric", nullable: false),
                    FrecuenciaPruebaGratuita = table.Column<int>(type: "integer", nullable: true),
                    TipoFrecuenciaGratuita = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    IdSuscripcion = table.Column<int>(type: "integer", nullable: false),
                    HistorialSuscripcionId = table.Column<int>(type: "integer", nullable: true)
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

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "Id", "Nombre", "RolUsuario" },
                values: new object[,]
                {
                    { 1, "Admin", 0 },
                    { 2, "Usuario", 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_bunny_libraries_BunnyLibreriaId",
                table: "bunny_libraries",
                column: "BunnyLibreriaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_cursos_BunnyColleccionId",
                table: "cursos",
                column: "BunnyColleccionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_cursos_BunnyLibraryId",
                table: "cursos",
                column: "BunnyLibraryId");

            migrationBuilder.CreateIndex(
                name: "IX_HistorialSuscripcion_IdUsuario",
                table: "HistorialSuscripcion",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_PagoSuscripcion_HistorialSuscripcionId",
                table: "PagoSuscripcion",
                column: "HistorialSuscripcionId");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_Token",
                table: "refresh_tokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_UsuarioId",
                table: "refresh_tokens",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_RolId",
                table: "usuarios",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_video_subtitulos_VideoId_Srclang",
                table: "video_subtitulos",
                columns: new[] { "VideoId", "Srclang" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_videos_BunnyLibraryId",
                table: "videos",
                column: "BunnyLibraryId");

            migrationBuilder.CreateIndex(
                name: "IX_videos_BunnyVideoId",
                table: "videos",
                column: "BunnyVideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_videos_VideoCursoId",
                table: "videos",
                column: "VideoCursoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PagoSuscripcion");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "video_subtitulos");

            migrationBuilder.DropTable(
                name: "HistorialSuscripcion");

            migrationBuilder.DropTable(
                name: "videos");

            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "cursos");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "bunny_libraries");
        }
    }
}
