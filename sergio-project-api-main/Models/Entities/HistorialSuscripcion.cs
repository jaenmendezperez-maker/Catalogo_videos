using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using SergioApi.Models.Entities;

namespace SergioApi.Models.Entities
{
    public class HistorialSuscripcion
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int IdUsuario { get; set; }
        [ForeignKey("IdUsuario")]
        public Usuario Usuario { get; set; }


        [Required]
        public DateTimeOffset FechaInicio { get; set; }
        [Required]
        public DateTimeOffset FechaFinal { get; set; }

        public bool Estado { get; set; }

        public int IdPasarelaPago { get; set; }

        public bool RenovacionAutomatica { get; set; }


        public enum EstadoSuscripcion
        {
            Activa,
            Vencida,
            Cancelada,
            PendientePago
        }









    }
}