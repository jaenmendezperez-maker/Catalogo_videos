function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const CATEGORIAS = ['Todas', 'Cardiología', 'Neurología', 'Pediatría', 'Urgencias', 'Cirugía', 'Oncología', 'Psiquiatría', 'Ginecología']
const NIVELES = ['Todos', 'Básico', 'Intermedio', 'Avanzado']

interface Props {
  categoria: string
  onCategoriaChange: (cat: string) => void
  nivel: string
  onNivelChange: (niv: string) => void
  busqueda: string
  onBusquedaChange: (val: string) => void
  onReset?: () => void
  hayFiltrosActivos?: boolean
}

function CursoFiltros({ categoria, onCategoriaChange, nivel, onNivelChange, busqueda, onBusquedaChange, onReset, hayFiltrosActivos = false }: Props) {
  return (
    <aside className="w-60 shrink-0 space-y-6">
      <div>
        <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface mb-3">Buscar</h3>
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar cursos..."
            className="w-full bg-surface-container-low border border-outline-variant text-on-surface placeholder-on-surface-variant/60 rounded-xl pl-10 pr-4 py-2.5 font-body text-body-sm outline-none focus:border-secondary focus:bg-surface-container-lowest transition-all"
          />
        </div>
      </div>
      <div className="border-t border-outline-variant pt-6">
        <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface mb-3">Especialidad</h3>
        <div className="space-y-1">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoriaChange(cat)}
              className={`w-full text-left font-body text-body-sm px-3 py-2 rounded-xl transition-all ${
                categoria === cat ? 'bg-secondary-fixed/40 text-on-secondary-fixed-variant font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-outline-variant pt-6">
        <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface mb-3">Nivel</h3>
        <div className="space-y-1">
          {NIVELES.map((niv) => (
            <button
              key={niv}
              onClick={() => onNivelChange(niv)}
              className={`w-full text-left font-body text-body-sm px-3 py-2 rounded-xl transition-all ${
                nivel === niv ? 'bg-secondary-fixed/40 text-on-secondary-fixed-variant font-medium' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {niv}
            </button>
          ))}
        </div>
      </div>
      {hayFiltrosActivos && (
        <button
          onClick={onReset}
          className="w-full font-body text-body-sm text-on-surface-variant hover:text-on-surface border border-outline-variant hover:border-outline rounded-xl py-2.5 transition-all"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  )
}

export default CursoFiltros