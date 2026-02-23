using Microsoft.EntityFrameworkCore;
using SergioApi.Models.Entities;

namespace SergioApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Curso> Cursos { get; set; }
    public DbSet<Video> Videos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<HistorialSuscripcion> HistorialSuscripciones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Usuario -> Rol
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Rol)
            .WithMany()
            .HasForeignKey(u => u.RolId)
            .OnDelete(DeleteBehavior.Restrict);

        // HistorialSuscripcion -> Usuario
        modelBuilder.Entity<HistorialSuscripcion>()
            .HasOne(h => h.Usuario)
            .WithMany(u => u.Suscripciones)
            .HasForeignKey(h => h.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);


            
        //NOMBRES DE LA TABLAS EN LA BASE DE DATOS
        modelBuilder.Entity<Curso>().ToTable("cursos");
        modelBuilder.Entity<Video>().ToTable("videos");
        modelBuilder.Entity<Usuario>().ToTable("usuarios");
        modelBuilder.Entity<Rol>().ToTable("roles");
        modelBuilder.Entity<HistorialSuscripcion>().ToTable("historial_suscripciones");
    }
}