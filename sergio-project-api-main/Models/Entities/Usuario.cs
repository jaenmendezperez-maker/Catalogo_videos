using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
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
        public string Correo {get; set; }

        [Required]
        public string ContrasenaHash { get; set; }

        [Required]
        public string Telefono { get; set; }


        public bool Estado { get; set; }

        //LLAVE FORANEO CON TABLA DE ROL
        public int RolId {get; set; }
        [ForeignKey("RolId")]
        public Rol Rol { get; set; }

        public string? FotoPerfil {get; set; }

        [Required]
        //REVISAR PARAMETROS DE FECHA PARA PODER ESTABLECER
        public DateTimeOffset FechaRegistro { get; set; } = DateTimeOffset.UtcNow;

        [NotMapped]
        public bool EsPremiun => 
            Suscripciones != null && 
            Suscripciones.Any(s => s.Estado && s.FechaFinal > DateTimeOffset.UtcNow);

        // Agrega la navegación inversa
        public ICollection<HistorialSuscripcion> Suscripciones { get; set; }









    }
}