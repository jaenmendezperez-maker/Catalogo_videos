// src/components/cursos/CursoFiltros.jsx
// Barra de filtros reutilizable para el catálogo.
// Uso:
// <CursoFiltros
//   categoria={categoria} onCategoriaChange={setCategoria}
//   nivel={nivel}         onNivelChange={setNivel}
//   busqueda={busqueda}   onBusquedaChange={setBusqueda}
// />

const CATEGORIAS = ['Todas', 'Cardiología', 'Neurología', 'Pediatría', 'Urgencias', 'Cirugía', 'Oncología', 'Psiquiatría', 'Ginecología'];
const NIVELES    = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

function CursoFiltros({
  categoria, onCategoriaChange,
  nivel,     onNivelChange,
  busqueda,  onBusquedaChange,
  onReset,
  hayFiltrosActivos = false,
}) {
  return (
    <aside className="w-60 flex-shrink-0 space-y-6">

      {/* Búsqueda */}
      <div>
        <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Buscar</h3>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full bg-[#0D1B2E] border border-white/8 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Especialidad</h3>
        <div className="space-y-1">
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoriaChange(cat)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                categoria === cat
                  ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Nivel */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Nivel</h3>
        <div className="space-y-1">
          {NIVELES.map(niv => (
            <button
              key={niv}
              onClick={() => onNivelChange(niv)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                nivel === niv
                  ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {niv}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hayFiltrosActivos && (
        <button
          onClick={onReset}
          className="w-full text-sm text-slate-500 hover:text-white border border-white/8 hover:border-white/20 rounded-xl py-2.5 transition-all"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}

export default CursoFiltros;