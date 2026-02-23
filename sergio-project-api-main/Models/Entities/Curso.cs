using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SergioApi.Models.Entities
{
    public class Curso
    {   
        [Key]
        public int Id { get; set; }
        
        
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Categoria { get; set; }
        
        [Required]                  //ALTERAR EN CASO DE NECESITARLO
        [StringLength(100)]
        public string PortadaURL { get; set; }
        
        public string? Descripcion { get; set; }

        public DateTimeOffset PublicacionCurso { get; set; } = DateTimeOffset.UtcNow;

        // public string MiniaturaCurso { get; set; } //REVISAR SI ES DIFERENTE A PORTADA URL
    
        public ICollection<Video> Videos { get; set; }
    
    }
}