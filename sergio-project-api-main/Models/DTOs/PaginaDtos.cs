using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace SergioApi.Models.DTOs
{
    /// <summary>Wrapper genérico para respuestas paginadas</summary>
    public class PaginadoDto<T>
    {
        public IEnumerable<T> Datos { get; set; } = [];
        public int Total       { get; set; }
        public int Pagina      { get; set; }
        public int PorPagina   { get; set; }

        // Guarda contra division por cero: con PorPagina = 0 el calculo daba
        // Infinity y al castear a int se convertia en int.MinValue.
        public int TotalPaginas  => PorPagina <= 0 ? 0 : (int)Math.Ceiling((double)Total / PorPagina);
        public bool HaySiguiente => Pagina < TotalPaginas;
        public bool HayAnterior  => Pagina > 1;
    }

    public class PaginacionParametrosDto
    {
        private const int MaxPorPagina = 50;
        // Tope de pagina. Con (Pagina - 1) * PorPagina y Pagina cerca de int.MaxValue,
        // el calculo desbordaba en contexto unchecked y producia un Skip() negativo
        // que Postgres rechazaba: una peticion anonima y barata tumbaba la consulta.
        // 200.000 paginas de 50 son 10 millones de filas, de sobra para el catalogo.
        private const int MaxPagina = 200_000;
        private int _pagina    = 1;
        private int _porPagina = 20;

        /// <summary>Pagina solicitada, acotada a [1, 200000].</summary>
        public int Pagina
        {
            get => _pagina;
            set => _pagina = value switch
            {
                < 1        => 1,
                > MaxPagina => MaxPagina,
                _          => value
            };
        }

        /// <summary>Filas a saltar. Calculado aqui para que no se repita en cada repositorio.</summary>
        public int Salto => (Pagina - 1) * PorPagina;

        /// <summary>Elementos por pagina, acotado a [1, 50].</summary>
        public int PorPagina
        {
            get => _porPagina;
            // Solo se topaba el maximo; un 0 o un negativo llegaban a Take(-1).
            set => _porPagina = value switch
            {
                < 1            => 1,
                > MaxPorPagina => MaxPorPagina,
                _              => value
            };
        }

        public string? Busqueda { get; set; }   // para búsqueda por título

        /// <summary>
        /// Incluye recursos aun no publicados (EsPublico = false).
        /// NUNCA se enlaza desde el query string: lo establece el controller y solo
        /// cuando el llamante tiene rol Admin. Sin [BindNever], mandar
        /// ?incluirNoPublicados=true seria un nuevo bypass.
        /// </summary>
        [BindNever]
        [JsonIgnore]
        public bool IncluirNoPublicados { get; set; }
    }
}
