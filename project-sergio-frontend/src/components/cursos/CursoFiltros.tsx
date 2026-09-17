// src/components/cursos/CursoFiltros.tsx
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

interface Props {
  busqueda: string
  onBusquedaChange: (val: string) => void
  onReset?: () => void
  hayFiltrosActivos?: boolean
}

function CursoFiltros({ busqueda, onBusquedaChange, onReset, hayFiltrosActivos = false }: Props) {
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