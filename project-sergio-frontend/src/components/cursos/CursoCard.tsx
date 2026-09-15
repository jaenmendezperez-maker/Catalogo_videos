import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import type { Curso, CategoriaCurso } from '@/types'
import { CATEGORIA_ESTILOS } from '@/utils/constants'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

interface Props {
  curso: Curso & {
    progreso?: number
    videosVistos?: number
    totalVideos?: number
  }
}

export default function CursoCard({ curso }: Props) {
  const estilos = CATEGORIA_ESTILOS[curso.categoria as CategoriaCurso] ?? {
    acento: 'text-[#006398]',
    color: 'from-[#e5eeff] to-[#e5eeff]/40',
  }

  const isDashboard = curso.progreso !== undefined
  const completado = curso.progreso === 100

  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="group flex flex-col bg-[#eaf0fc] border border-[#c6c6cd] rounded overflow-hidden hover:border-[#006398]/30 hover:shadow-xl transition-all duration-300 h-full"
    >
      {/* ── 1. La cabecera ── */}
    <div className={`h-36 bg-gradient-to-br ${estilos.color} flex items-center justify-center relative flex-shrink-0 overflow-hidden`}>
      {/* Diamantes decorativos */}
      <div className="absolute top-3 left-3 w-6 h-6 rotate-45 bg-white/40 rounded" />
      <div className="absolute bottom-4 right-16 w-10 h-10 rotate-45 bg-white/35 rounded-lg" />

      {/* Círculo detrás del ícono/imagen */}
      <div className="absolute w-20 h-20 rounded-3xl bg-white/30" />

      {curso.portadaURL
        ? <img src={curso.portadaURL} alt={curso.nombre} className="relative z-10 w-14 h-14 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
        : <div className="relative z-10 text-5xl">🎓</div>
      }
    </div>

      {/* ── 2. El Cuerpo ── */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-5">
          <span className={`text-xs font-medium ${estilos.acento}`}>{curso.categoria}</span>
          <Badge nivel={curso.nivel} />
        </div>

        <h3 className="text-[#0b1c30] font-semibold text-sm leading-snug mb-2 group-hover:text-[#006398] transition-colors line-clamp-2">
          {curso.nombre}
        </h3>

        {!isDashboard && (
          <p className="text-[#45464d] text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
            {curso.descripcion}
          </p>
        )}

        {/* ── 3. El Footer ── */}
        <div className={`border-t border-[#c6c6cd] pt-3 mt-auto ${isDashboard ? 'space-y-3' : 'space-y-2'}`}>
          <p className="text-[#45464d] text-xs truncate">{curso.instructor}</p>

          {isDashboard ? (
            /* Vista Dashboard: Barra de progreso */
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#45464d]">
                <span>{curso.videosVistos} / {curso.totalVideos || curso.videos} videos</span>
                <span className={completado ? 'text-[#006398]' : 'text-[#0b1c30]'}>{curso.progreso}%</span>
              </div>
              <div className="w-full bg-[#eff4ff] rounded-full h-1.5 overflow-hidden">
                <div className={`h-full transition-all ${completado ? 'bg-[#006398]' : 'bg-[#68dba9]'}`} style={{ width: `${curso.progreso}%` }} />
              </div>
            </div>
          ) : (
            /* Vista Catálogo */
            <div className="flex items-center justify-between text-xs text-[#45464d]">
              <span className="flex items-center gap-1">
                <Icon name="play_circle" className="text-[16px]" />
                {curso.videos} videos
              </span>
              <span className="flex items-center gap-1">
                <Icon name="schedule" className="text-[16px]" />
                {curso.duracion}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="group" className="text-[16px]" />
                {curso.alumnos?.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}