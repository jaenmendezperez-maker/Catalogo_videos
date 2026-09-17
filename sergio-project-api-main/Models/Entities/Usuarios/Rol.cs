using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using SergioApi.Enums;

namespace SergioApi.Models.Entities
{
    public class Rol
    {

        [Key]
        public int Id {get; set; }

        [Required]
        [StringLength(20)]
        public string Nombre { get; set; }
        
        public RolUsuario RolUsuario { get; set; }       
    }
}