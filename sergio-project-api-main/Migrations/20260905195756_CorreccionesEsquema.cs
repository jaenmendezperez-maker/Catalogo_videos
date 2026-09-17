using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SergioApi.Migrations
{
    /// <inheritdoc />
    public partial class CorreccionesEsquema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Normaliza los correos ANTES de crear el indice unico.
            // El codigo guardaba en minusculas pero comparaba sin normalizar, asi que
            // podian existir filas con distinta capitalizacion que colisionarian entre si.
            migrationBuilder.Sql(@"UPDATE usuarios SET ""Correo"" = lower(trim(""Correo""));");

            // Sustituido por el indice compuesto (UsuarioId, EstaRevocado):
            // Postgres puede usar el prefijo izquierdo para las consultas por UsuarioId solo.
            migrationBuilder.DropIndex(
                name: "IX_refresh_tokens_UsuarioId",
                table: "refresh_tokens");

            migrationBuilder.RenameColumn(
                name: "EsPremiun",
                table: "videos",
                newName: "EsPremium");

            migrationBuilder.RenameColumn(
                name: "EsPremiun",
                table: "cursos",
                newName: "EsPremium");

            migrationBuilder.UpdateData(
                table: "roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "RolUsuario",
                value: 1);

            migrationBuilder.UpdateData(
                table: "roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "RolUsuario",
                value: 2);

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "Id", "Nombre", "RolUsuario" },
                values: new object[] { 3, "Educador", 3 });

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_Correo",
                table: "usuarios",
                column: "Correo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_FechaExpiracion",
                table: "refresh_tokens",
                column: "FechaExpiracion");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_UsuarioId_EstaRevocado",
                table: "refresh_tokens",
                columns: new[] { "UsuarioId", "EstaRevocado" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_usuarios_Correo",
                table: "usuarios");

            migrationBuilder.DropIndex(
                name: "IX_refresh_tokens_FechaExpiracion",
                table: "refresh_tokens");

            migrationBuilder.DropIndex(
                name: "IX_refresh_tokens_UsuarioId_EstaRevocado",
                table: "refresh_tokens");

            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.RenameColumn(
                name: "EsPremium",
                table: "videos",
                newName: "EsPremiun");

            migrationBuilder.RenameColumn(
                name: "EsPremium",
                table: "cursos",
                newName: "EsPremiun");

            migrationBuilder.UpdateData(
                table: "roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "RolUsuario",
                value: 0);

            migrationBuilder.UpdateData(
                table: "roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "RolUsuario",
                value: 0);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_UsuarioId",
                table: "refresh_tokens",
                column: "UsuarioId");
        }
    }
}
