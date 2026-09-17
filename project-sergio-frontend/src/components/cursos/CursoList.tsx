// src/components/cursos/CursoList.tsx
import CursoCard from './CursoCard'
import type { CursoVistasPreviaDto } from '@/types'

interface Props {
  cursos: CursoVistasPreviaDto[]
  loading?: boolean
}

function CursoList({ cursos, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-surface-container-high" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-surface-container-high rounded w-1/3" />
              <div className="h-4 bg-surface-container-high rounded w-full" />
              <div className="h-3 bg-surface-container-high rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (cursos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-body-sm text-on-surface-variant">No se encontraron cursos.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cursos.map((curso) => <CursoCard key={curso.id} curso={curso} />)}
    </div>
  )
}

export default CursoList