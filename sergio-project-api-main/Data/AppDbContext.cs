using Microsoft.EntityFrameworkCore;
using SergioApi.Enums;
using SergioApi.Models.Entities;
using SergioApi.Models.Entities.Suscripciones;
using SergioApi.Models.Entities.Videos;
using SergioApi.Models.Entities.Videos.Cursos;

namespace SergioApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ── Negocio ───────────────────────────────────────────────
    public DbSet<VideoCurso> Cursos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    // ── Bunny ─────────────────────────────────────────────────
    public DbSet<BunnyLibrary> BunnyLibraries { get; set; }
    public DbSet<Video> Videos { get; set; }
    public DbSet<VideoSubtitulo> VideoSubtitulos { get; set; }

    // ── Suscripciones (Mercado Pago) ──────────────────────────
    public DbSet<Suscripcion> Suscripciones { get; set; }
    public DbSet<PagoSuscripcion> PagosSuscripcion { get; set; }
    public DbSet<NotificacionMercadoPago> NotificacionesMercadoPago { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ═════════════════════════════════════════════════════
        // ENTIDADES DE NEGOCIO — sin cambios
        // ═════════════════════════════════════════════════════

        // Usuario -> Rol
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");

            entity.HasOne(u => u.Rol)
                .WithMany()
                .HasForeignKey(u => u.RolId)
                .OnDelete(DeleteBehavior.Restrict);

            // El correo es la identidad de login: debe ser unico A NIVEL DE BASE DE DATOS.
            // Comprobarlo solo en codigo es una carrera (TOCTOU): dos registros simultaneos
            // con el mismo correo pasaban ambos la validacion y creaban cuentas duplicadas.
            // Los correos se guardan siempre normalizados a minusculas.
            entity.HasIndex(u => u.Correo)
                .IsUnique()
                .HasDatabaseName("IX_usuarios_Correo");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");

            entity.HasOne(r => r.Usuario)
                .WithMany()
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(r => r.Token).IsUnique();

            // Revocar todos los tokens de un usuario (cambio de contrasena / correo).
            entity.HasIndex(r => new { r.UsuarioId, r.EstaRevocado });

            // Purga programada de tokens caducados.
            entity.HasIndex(r => r.FechaExpiracion);
        });

        // Faltaba Educador: el enum lo define pero la tabla no lo tenia, asi que
        // asignar RolId = 3 provocaba una violacion de clave foranea (500).
        // Ademas RolUsuario no se seteaba y quedaba en 0 (= Admin) en todas las filas.
        modelBuilder.Entity<Rol>().HasData(
            new Rol { Id = (int)RolUsuario.Admin,    Nombre = nameof(RolUsuario.Admin),    RolUsuario = RolUsuario.Admin    },
            new Rol { Id = (int)RolUsuario.Usuario,  Nombre = nameof(RolUsuario.Usuario),  RolUsuario = RolUsuario.Usuario  },
            new Rol { Id = (int)RolUsuario.Educador, Nombre = nameof(RolUsuario.Educador), RolUsuario = RolUsuario.Educador }
        );

        // ═════════════════════════════════════════════════════
        // BUNNY — nuevas entidades
        // ═════════════════════════════════════════════════════

        // BunnyLibrary — tabla definida pero sin FKs activas por ahora (Opción A)
        modelBuilder.Entity<BunnyLibrary>(entity =>
        {
            entity.ToTable("bunny_libraries");

            // BunnyLibraryId debe ser único, no pueden existir dos registros
            // apuntando a la misma librería de Bunny
            entity.HasIndex(b => b.BunnyLibreriaId).IsUnique();
        });

        // VideoCurso — colecciones de Bunny
        modelBuilder.Entity<VideoCurso>(entity =>
        {
            entity.ToTable("video_cursos");

            // BunnyCollectionId único por la misma razón
            entity.HasIndex(c => c.BunnyColleccionId).IsUnique();

            // BunnyLibraryId es dato plano, sin FK activa (Opción A)
            entity.Property(c => c.BunnyLibreriaId)
                .IsRequired();
        });

        // Video
        modelBuilder.Entity<Video>(entity =>
        {
            entity.ToTable("videos");

            // BunnyVideoId único — no pueden existir dos videos con el mismo GUID de Bunny
            entity.HasIndex(v => v.BunnyVideoId).IsUnique();

            // BunnyLibraryId es dato plano, sin FK activa (Opción A)
            entity.Property(v => v.BunnyLibreriaId)
                .IsRequired();

            // Video -> VideoCurso (opcional, un video puede no tener colección)
            entity.HasOne(v => v.VideoCurso)
                .WithMany(c => c.Videos)
                .HasForeignKey(v => v.VideoCursoId)
                .OnDelete(DeleteBehavior.SetNull)   // si se borra la colección, el video queda sin colección
                .IsRequired(false);

            // Video -> VideoSubtitulo
            entity.HasMany(v => v.Subtitulos)
                .WithOne(s => s.Video)
                .HasForeignKey(s => s.VideoId)
                .OnDelete(DeleteBehavior.Cascade);  // si se borra el video, se borran sus subtítulos

            // Framerate como decimal en Postgres
            entity.Property(v => v.Framerate)
                .HasColumnType("decimal(5,2)");
        });

        // VideoSubtitulo
        modelBuilder.Entity<VideoSubtitulo>(entity =>
        {
            entity.ToTable("video_subtitulos");

            // Un video no puede tener dos subtítulos del mismo idioma
            entity.HasIndex(s => new { s.VideoId, s.Srclang }).IsUnique();
        });

        // ═════════════════════════════════════════════════════
        // SUSCRIPCIONES — Mercado Pago
        // ═════════════════════════════════════════════════════

        modelBuilder.Entity<Suscripcion>(entity =>
        {
            entity.ToTable("suscripciones");

            // Como TEXTO, no como int: el indice parcial de abajo filtra por estado y un
            // filtro sobre numeros se romperia en silencio si alguien reordena el enum.
            entity.Property(s => s.Estado)
                .HasConversion<string>()
                .HasMaxLength(20);

            // Restrict: borrar un usuario no puede llevarse por delante su historial de
            // cobros. UsuarioService.EliminarAsync lo comprueba antes con un 409 claro.
            entity.HasOne(s => s.Usuario)
                .WithMany()
                .HasForeignKey(s => s.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            // En Postgres un indice unico admite varios NULL: las filas aun sin id de
            // Mercado Pago no chocan entre si.
            entity.HasIndex(s => s.MercadoPagoPreapprovalId).IsUnique();

            // Como mucho UNA suscripcion pendiente de pago por usuario: reserva un alta a
            // la vez. Solo cubre PendientePago a proposito; si cubriera tambien Activa,
            // una autorizacion real de Mercado Pago podria chocar con el indice al
            // sincronizar y el cobro quedaria sin reflejarse (cobro sin acceso).
            entity.HasIndex(s => s.UsuarioId)
                .IsUnique()
                .HasFilter("\"Estado\" = 'PendientePago'")
                .HasDatabaseName("IX_suscripciones_UsuarioId_PendientePago");

            // Consultas "suscripciones vivas de este usuario".
            entity.HasIndex(s => new { s.UsuarioId, s.Estado });

            entity.HasMany(s => s.Pagos)
                .WithOne(p => p.Suscripcion)
                .HasForeignKey(p => p.SuscripcionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PagoSuscripcion>(entity =>
        {
            entity.ToTable("pagos_suscripcion");

            // Un cobro de Mercado Pago se registra una sola vez, lleguen los webhooks
            // duplicados que lleguen.
            entity.HasIndex(p => p.MercadoPagoAuthorizedPaymentId).IsUnique();

            // Para resolver notificaciones del topic "payment" (reembolsos, contracargos).
            entity.HasIndex(p => p.MercadoPagoPaymentId);
        });

        modelBuilder.Entity<NotificacionMercadoPago>(entity =>
        {
            entity.ToTable("notificaciones_mercadopago");

            // Purga de notificaciones antiguas.
            entity.HasIndex(n => n.RecibidaEn);
        });

        // ═════════════════════════════════════════════════════
        // NOMBRES DE TABLAS
        // ═════════════════════════════════════════════════════
        modelBuilder.Entity<VideoCurso>().ToTable("cursos");
        modelBuilder.Entity<Rol>().ToTable("roles");
    }
}
