using System;
using System.ComponentModel.DataAnnotations;

namespace SergioApi.Models.DTOs.Usuarios
{
    // FUTURO POST PARA EL REGISTRO DE LOS USUARIOS, VALIDACIONES DE LOS DATOS, ETC

    /// Para REGISTRO de nuevo usuario
    /// POST /api/usuarios/registro
    public class UsuarioRegistroDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        public required string Nombre { get; set; }

        [Required(ErrorMessage = "El correo es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
        [StringLength(100)]
        public required string Correo { get; set; }

        [Required(ErrorMessage = "La contraseña es obligatoria")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$", 
            ErrorMessage = "La contraseña debe tener al menos una mayúscula, una minúscula y un número")]
        public required string Contrasena { get; set; }

        [Required(ErrorMessage = "El teléfono es obligatorio")]
        [Phone(ErrorMessage = "El formato del teléfono no es válido")]
        public required string Telefono { get; set; }

        // [Url(ErrorMessage = "La URL de la foto no es válida")]       //FOTOGRAFIA NO OBLIGATORIA
        // public string? FotoPerfil { get; set; }
    }

    /// futuro post para LOGIN de usuario
    /// POST /api/usuarios/login
    public class UsuarioLoginDto
    {
        [Required(ErrorMessage = "El correo es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
        public required string Correo { get; set; }

        [Required(ErrorMessage = "La contraseña es obligatoria")]
        public required string Contrasena { get; set; }
    }

    /// Para ACTUALIZAR perfil de usuario
    /// 
    /// PUT /api/usuarios/perfil
    /// PATCH /api/usuarios/{id} 
    
    //ESTE ES UNICAMENTE PARA QUE EL USUARIO PUEDA MODIFICAR SU PROPIO PERFIL
    public class UsuarioPerfilActualizacionDto
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        public string? Nombre { get; set; }

        [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
        [StringLength(100)]
        public string? Correo { get; set; }

        [Phone(ErrorMessage = "El formato del teléfono no es válido")]
        public string? Telefono { get; set; }

        [Url(ErrorMessage = "La URL de la foto no es válida")]
        public string? FotoPerfil { get; set; }
        
   
    }
    // MODIFICACIONES REALIZADAS POR ADMINISTRADORES
    public class UsuarioAdminActualizacionDto: UsuarioPerfilActualizacionDto            // UTLIZA HERENCIA OARA NO TENER TANTOS DATOS REPEITODOS
    {
        // // Solo para administradores
        // public bool? Estado { get; set; }  // Para activar/desactivar usuario
        
        // Solo para administradores (cambio de rol)
        public int? RolId { get; set; }     // SOLO POR SI A FUTURO QUIEREN AGREGAR MÁS ADMINISTRADORES A SU PROYECTO
    }


    /// Para CAMBIAR CONTRASEÑA
    /// POST /api/usuarios/cambiar-contrasena
    public class UsuarioCambioPasswordDto
    {
        [Required(ErrorMessage = "La contraseña actual es obligatoria")]
        public required string ContrasenaActual { get; set; }

        [Required(ErrorMessage = "La nueva contraseña es obligatoria")]
        [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$", 
            ErrorMessage = "La contraseña debe tener al menos una mayúscula, una minúscula y un número")]
        public required string ContrasenaNueva { get; set; }

        [Required(ErrorMessage = "Debes confirmar la nueva contraseña")]
        [Compare("ContrasenaNueva", ErrorMessage = "Las contraseñas no coinciden")]
        public required string ConfirmarContrasena { get; set; }
    }

    // ========================================================
    // DTOs de SALIDA (lo que la API DEVUELVE al cliente)
    // ========================================================

    /// <summary>
    /// Para respuesta después de LOGIN/REGISTRO
    /// </summary>
    public class UsuarioAutenticadoDto
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Correo { get; set; }
        public required string Telefono { get; set; }
        public string? FotoPerfil { get; set; }
        public required string Rol { get; set; }  // "Admin" o "Usuario"
        public bool EsPremium { get; set; }
        public required string Token { get; set; }  // JWT Token (access token)

        /// <summary>Refresh token opaco. El cliente lo guarda y lo envia a POST /api/auth/refresh.</summary>
        public required string RefreshToken { get; set; }

        public DateTimeOffset FechaExpiracion { get; set; }  // Expiración del ACCESS token
    }

    /// <summary>
    /// Para PERFIL PÚBLICO (lo que ve un usuario sobre sí mismo o sobre otros)
    /// GET /api/usuarios/perfil
    /// GET /api/usuarios/{id}
    /// </summary>
    public class UsuarioPerfilDto
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Correo { get; set; }
        public required string Telefono { get; set; }
        public string? FotoPerfil { get; set; }
        public bool EsPremium { get; set; }
        public DateTimeOffset? FechaVencimientoPremium { get; set; }  // Si es premium, cuándo vence
        public DateTimeOffset FechaRegistro { get; set; }  // Fecha de registro en la plataforma
    }

    /// Para LISTADO de usuarios (solo admin)
    /// GET /api/usuarios
    public class UsuarioListadoDto
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Correo { get; set; }
        public required string Telefono { get; set; }
        public string? FotoPerfil { get; set; }
        public required string Rol { get; set; }  // "Admin" o "Usuario"
        // public bool Estado { get; set; }  // Activo/Inactivo
        public bool EsPremium { get; set; }
        public DateTimeOffset FechaRegistro { get; set; }
        public int TotalCursosVistos { get; set; }  // Estadística
    }

    /// Para DETALLE COMPLETO de usuario (solo admin)
    /// GET /api/usuarios/{id}/detalle
    public class UsuarioDetalleAdminDto
    {
        public int Id { get; set; }
        public required string Nombre { get; set; }
        public required string Correo { get; set; }
        public required string Telefono { get; set; }
        public string? FotoPerfil { get; set; }
        public required string Rol { get; set; }
        // public bool Estado { get; set; }
        public DateTimeOffset FechaRegistro { get; set; }
        
        // Información de suscripciones
        public bool EsPremium { get; set; }
        public required List<SuscripcionResumenDto> HistorialSuscripciones { get; set; }
        
        // Estadísticas
        public int TotalCursosIniciados { get; set; }
        public int TotalCursosCompletados { get; set; }
        public int TotalVideosVistos { get; set; }
        public TimeSpan TiempoTotalVisualizacion { get; set; }
    }

    /// DTO auxiliar para resumen de suscripción (para el detalle de admin)
    public class SuscripcionResumenDto
    {
        public int Id { get; set; }

        /// <summary>PendientePago, Activa, Pausada, Suspendida, Cancelada, Abandonada o ErrorCreacion.</summary>
        public required string Estado { get; set; }

        public decimal Monto { get; set; }
        public required string Moneda { get; set; }
        public DateTimeOffset FechaCreacion { get; set; }
        public DateTimeOffset? FechaAutorizacion { get; set; }
        public DateTimeOffset? FechaCancelacion { get; set; }

        /// <summary>Hasta cuando cubren los cobros aprobados (sin gracia).</summary>
        public DateTimeOffset? PeriodoPagadoHasta { get; set; }

        /// <summary>Hasta cuando tiene acceso por esta suscripcion.</summary>
        public DateTimeOffset? AccesoHasta { get; set; }

        public int CobrosAprobados { get; set; }
    }

    // /// Para respuesta genérica después de operaciones       // VER A FUTURO POSIBLE UTILIDAD
    // public class UsuarioRespuestaDto
    // {
    //     public bool Exito { get; set; }
    //     public string Mensaje { get; set; }
    //     public UsuarioPerfilDto? Datos { get; set; }
    // }
}