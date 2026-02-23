using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SergioApi.Models.Entities
{
    public class Video
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Titulo { get; set; }
        
        public string? Descripcion { get; set; }
        
        [Required]
        public DateTimeOffset FechaSubida { get; set; } = DateTimeOffset.UtcNow;
        [Required]
        public string LinkEnlace { get; set; }
        
        public bool VideoPremiun { get; set; }

        public bool Oculto { get; set; }

        public int OrdenEnsecuencia { get; set; }


        [Required]
        public int CursoId { get; set; }
        [ForeignKey("CursoId")]
        public Curso Curso { get; set; }
        

    }
}