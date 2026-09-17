// src/pages/cursos/CursosCatalogo.tsx
import { useState } from 'react'
import { useCursosFiltrados } from '../../hooks/useCursos'
import Spinner from '../../components/ui/Spinner'
import CursoCard from '@/components/cursos/CursoCard'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const ORDEN_OPS = [
  { value: 'nombre', label: 'Nombre (A-Z)' },
  { value: 'videos', label: 'Más videos primero' },
] as const

function CursosCatalogo() {
  const {
    cursos, isLoading, error,
    filtros, setFiltro, resetFiltros, hayFiltrosActivos, total,
  } = useCursosFiltrados()

  const [verFiltrosMobile, setVerFiltrosMobile] = useState(false)
  const [menuOrdenAbierto, setMenuOrdenAbierto] = useState(false)

  if (error) {
    return (
      <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/images/exclamation.png" alt="Ícono de advertencia" className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <p className="text-[#0b1c30] font-semibold mb-2">Error al cargar los cursos</p>
          <p className="text-[#45464d] text-sm">Intenta recargar la página.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-[#eff8fa] min-h-screen"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23c6c6cd' stroke-width='1.5' opacity='0.3'%3E%3Cpath d='M20 15v10M15 20h10'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Header */}
      <div className="max-w-8xl mx-auto px-4 sm:px-3 pt-3">
        <div className="relative overflow-hidden border border-[#c6c6cd] bg-[#eff4ff]">
          <img
            src="/assets/images/fondo-header.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <p className="text-[#006398] text-sm font-semibold uppercase tracking-widest mb-2">Formación continua</p>
            <h1 className="font-headline text-4xl font-bold text-[#0b1c30] mb-3">Catálogo de cursos</h1>
            <p className="text-[#45464d] text-sm max-w-lg">
              Explora nuestra biblioteca de contenido clínico actualizado.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Barra de búsqueda + orden */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d]" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={filtros.busqueda}
              onChange={(e) => setFiltro('busqueda', e.target.value)}
              className="w-full bg-[#eff4ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/60 pl-11 pr-4 py-3 text-sm outline-none focus:border-[#006398] focus:bg-[#ffffff] focus:ring-2 focus:ring-[#006398]/15 transition-all rounded"
            />
            {filtros.busqueda && (
              <button
                onClick={() => setFiltro('busqueda', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] hover:text-[#0b1c30] transition-colors"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            )}
          </div>

          <div className="relative min-w-[200px]">
            <button
              onClick={() => setMenuOrdenAbierto(!menuOrdenAbierto)}
              className="w-full flex items-center justify-between bg-[#eff4ff] border border-[#c6c6cd] text-[#45464d] pl-3 pr-3 py-2.5 text-sm outline-none hover:border-[#006398]/50 transition-all cursor-pointer rounded"
            >
              <span>{ORDEN_OPS.find((op) => op.value === filtros.orden)?.label}</span>
              <Icon name="expand_more" className={`text-[18px] transition-transform duration-200 ${menuOrdenAbierto ? 'rotate-180' : ''}`} />
            </button>
            {menuOrdenAbierto && (
              <div className="absolute z-50 w-full mt-2 bg-[#ffffff] border border-[#c6c6cd] rounded-xl shadow-xl overflow-hidden">
                {ORDEN_OPS.map((op) => (
                  <button
                    key={op.value}
                    onClick={() => { setFiltro('orden', op.value); setMenuOrdenAbierto(false) }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer ${
                      filtros.orden === op.value ? 'bg-[#cce5ff]/60 text-[#004b73] font-medium' : 'text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setVerFiltrosMobile(!verFiltrosMobile)}
            className={`sm:hidden flex items-center justify-center gap-2 px-4 py-3 border text-sm font-medium transition-all rounded-full ${
              verFiltrosMobile ? 'bg-[#cce5ff]/60 border-[#006398]/30 text-[#004b73]' : 'bg-[#eff4ff] border-[#c6c6cd] text-[#45464d]'
            }`}
          >
            <Icon name="tune" className="text-[18px]" />
            Filtros {hayFiltrosActivos && <span className="w-2 h-2 bg-[#006398] rounded-full" />}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filtros — solo Acceso, sin Especialidad ni Nivel */}
          <aside className={`w-60 flex-shrink-0 space-y-6 ${verFiltrosMobile ? 'block' : 'hidden'} sm:block`}>
            <div>
              <h3 className="text-[#0b1c30] text-xs font-semibold uppercase tracking-wider mb-3">Acceso</h3>
              <div className="space-y-2">
                {([
                  { value: 'solo-gratis', label: 'Solo gratuitos' },
                  { value: 'solo-premium', label: 'Solo Premium' },
                ] as const).map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setFiltro('premium', filtros.premium === value ? 'todos' : value)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        filtros.premium === value ? 'bg-[#006398] border-[#006398]' : 'border-[#76777d] group-hover:border-[#45464d]'
                      }`}
                    >
                      {filtros.premium === value && <Icon name="check" className="text-[12px] text-[#ffffff]" />}
                    </div>
                    <span className="text-sm text-[#45464d] group-hover:text-[#0b1c30] transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {hayFiltrosActivos && (
              <button
                onClick={resetFiltros}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#45464d] bg-[#e5eeff] border border-[#c6c6cd] hover:border-[#006398]/40 hover:text-[#006398] hover:bg-[#006398]/10 rounded-full py-2.5 transition-all duration-300 cursor-pointer"
              >
                <Icon name="close" className="text-[16px]" />
                Limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid de cursos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[#45464d] text-sm">
                <span className="text-[#0b1c30] font-medium">{total}</span> cursos encontrados
              </p>
              {hayFiltrosActivos && (
                <button onClick={resetFiltros} className="text-xs text-[#006398] hover:text-[#004b73] transition-colors cursor-pointer">
                  Limpiar filtros
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Spinner size="lg" />
              </div>
            ) : cursos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <img src="/assets/images/exclamation.png" alt="Sin resultados" className="w-16 h-16 mb-4 opacity-80" />
                <h3 className="text-[#0b1c30] font-semibold mb-2">Sin resultados</h3>
                <p className="text-[#45464d] text-sm mb-6">
                  {hayFiltrosActivos ? 'No encontramos cursos con esos filtros.' : 'Todavía no hay cursos publicados.'}
                </p>
                {hayFiltrosActivos && (
                  <button
                    onClick={resetFiltros}
                    className="bg-[#cce5ff]/60 hover:bg-[#cce5ff] text-[#004b73] text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer"
                  >
                    Ver todos los cursos
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cursos.map((curso) => <CursoCard key={curso.id} curso={curso} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CursosCatalogo