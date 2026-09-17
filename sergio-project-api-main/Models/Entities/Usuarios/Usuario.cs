using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SergioApi.Enums;
using SergioApi.Models.Entities;

namespace SergioApi.Models.Entities
{
    public class Usuario
    {

        [Key]
        public int Id {get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre {get; set; }

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Correo {get; set; }

        [Required]
        public string ContrasenaHash { get; set; }

        // [Required]
        [Phone]
        public string? Telefono { get; set; }


        // public bool Estado { get; set; }    // OLVIDE PARA QUE ERA JAJAJA

        //LLAVE FORANEO CON TABLA DE ROL
        public int RolId {get; set; }       //ASIGNA UN ROL DE ADMINISTRADOR O DE USUARIO COMUN
        [ForeignKey("RolId")]
        public Rol Rol { get; set; }

        public string? FotoPerfil {get; set; }

        [Required]                          //ESTABLECE LA FECHA EN QUE SE CREO LA CUENTA
        //REVISAR PARAMETROS DE FECHA PARA PODER ESTABLECER
        public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;
    
        public bool EsPremium { get; set; } = false;
        public DateTimeOffset? FechaVencimientoPremium { get; set; } = null; // NO SIRVE PARA NI MADRES NO USAR XDDDDD TOP ESTUPIDOS



    }
}