// src/components/cursos/CursoCard.tsx
import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import type { CursoVistasPreviaDto } from '@/types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

interface Props {
  curso: CursoVistasPreviaDto & {
    // Progreso por usuario — no existe tracking real en el backend todavía.
    // Se deja el prop por si en algún momento se agrega, pero hoy nunca llega poblado.
    progreso?: number
    videosVistos?: number
  }
}

export default function CursoCard({ curso }: Props) {
  const isDashboard = curso.progreso !== undefined
  const completado = curso.progreso === 100

  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="group flex flex-col bg-[#eaf0fc] border border-[#c6c6cd] rounded overflow-hidden hover:border-[#006398]/30 hover:shadow-xl transition-all duration-300 h-full"
    >
      {/* ── 1. La cabecera — placeholder fijo, no hay portada por curso ── */}
      <div className="h-36 bg-gradient-to-br from-[#e5eeff] to-[#e5eeff]/40 flex items-center justify-center relative flex-shrink-0 overflow-hidden">
        <div className="absolute top-3 left-3 w-6 h-6 rotate-45 bg-white/40 rounded" />
        <div className="absolute bottom-4 right-16 w-10 h-10 rotate-45 bg-white/35 rounded-lg" />
        <div className="absolute w-20 h-20 rounded-3xl bg-white/30" />
        <div className="relative z-10 text-5xl">🎓</div>
      </div>

      {/* ── 2. El Cuerpo ── */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-5">
          {curso.esPremium && <Badge variant="premium">Premium</Badge>}
        </div>

        <h3 className="text-[#0b1c30] font-semibold text-sm leading-snug mb-2 group-hover:text-[#006398] transition-colors line-clamp-2">
          {curso.nombre}
        </h3>

        {/* ── 3. El Footer ── */}
        <div className={`border-t border-[#c6c6cd] pt-3 mt-auto ${isDashboard ? 'space-y-3' : 'space-y-2'}`}>
          {isDashboard ? (
            /* Vista Dashboard: Barra de progreso — inactiva hasta que exista tracking real */
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#45464d]">
                <span>{curso.videosVistos ?? 0} / {curso.cantidadVideos} videos</span>
                <span className={completado ? 'text-[#006398]' : 'text-[#0b1c30]'}>{curso.progreso ?? 0}%</span>
              </div>
              <div className="w-full bg-[#eff4ff] rounded-full h-1.5 overflow-hidden">
                <div className={`h-full transition-all ${completado ? 'bg-[#006398]' : 'bg-[#68dba9]'}`} style={{ width: `${curso.progreso ?? 0}%` }} />
              </div>
            </div>
          ) : (
            /* Vista Catálogo */
            <div className="flex items-center gap-1 text-xs text-[#45464d]">
              <Icon name="play_circle" className="text-[16px]" />
              {curso.cantidadVideos} videos
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}