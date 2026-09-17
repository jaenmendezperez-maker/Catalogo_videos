// src/pages/cursos/CursoDetalle.tsx
import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { useCurso } from '../../api/cursosApi'
import { useReproducirVideo } from '../../api/videosApi'
import type { VideoVistasPreviaDto } from '../../types'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import UpgradeModal from '../../components/ui/UpgradeModal'
import VideoPlayer from '../../components/videos/VideoPlayer'
import VideoList from '../../components/videos/VideoList'
import { formatDuration } from '../../utils/formatDate'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function CursoDetalle() {
  const { id } = useParams<{ id: string }>()
  const cursoId = Number(id)
  const { isAuthenticated, user } = useAuthStore()

  const { data: curso, isLoading, isError } = useCurso(cursoId)

  const [videoActivoId, setVideoActivoId] = useState<number | null>(null)
  const [videoActivoMeta, setVideoActivoMeta] = useState<VideoVistasPreviaDto | null>(null)
  const [moduloAbierto, setModuloAbierto] = useState<string | null>(null)
  const [tabActiva, setTabActiva] = useState<'contenido' | 'objetivos'>('contenido')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [videoUpgrade, setVideoUpgrade] = useState('')

  const {
    data: reproduccion,
    isLoading: cargandoReproduccion,
    isError: errorReproduccion,
    error: errorReproduccionObj,
  } = useReproducirVideo(videoActivoId)

  const errorCode = errorReproduccion
    ? (errorReproduccionObj as any)?.response?.status
    : undefined

  // ── Backend NO tiene "módulos": se agrupan videos por su campo `categoria` ──
  const grupos = useMemo(() => {
    if (!curso) return []
    const mapa = new Map<string, VideoVistasPreviaDto[]>()
    for (const v of curso.videos) {
      const clave = v.categoria?.trim() || 'General'
      if (!mapa.has(clave)) mapa.set(clave, [])
      mapa.get(clave)!.push(v)
    }
    return Array.from(mapa.entries()).map(([nombre, videos]) => ({ nombre, videos }))
  }, [curso])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#45464d]">Cargando curso…</div>
  }

  if (isError || !curso) {
    // El backend responde 404 tanto si no existe como si es borrador y no eres Admin
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-[#45464d]">
        <p>Este curso no existe o no está disponible.</p>
        <Link to="/cursos" className="text-[#006398] font-medium">Volver al catálogo</Link>
      </div>
    )
  }

  const totalVideos = curso.videos.length
  // "completado" no existe en el backend — no hay progreso real por usuario todavía
  const puedeVerVideo = (video: VideoVistasPreviaDto) => {
    if (!video.esPremium) return true
    if (!isAuthenticated) return false
    return !!user?.esPremium
  }

  const handleVideoClick = (video: VideoVistasPreviaDto) => {
    if (puedeVerVideo(video)) {
      setVideoActivoId(video.id)
      setVideoActivoMeta(video)
    } else {
      setVideoUpgrade(video.titulo)
      setShowUpgrade(true)
    }
  }

  const tabs = [
    { key: 'contenido', label: 'Contenido' },
    { key: 'objetivos', label: 'Lo que aprenderás' },
  ] as const

  return (
    <div className="bg-[#f8f9ff] min-h-screen relative">
      <div className="relative z-10">
        {/* Breadcrumb */}
        <div className="border-b border-[#c6c6cd] bg-[#eff4ff]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-2 text-xs text-[#45464d]">
            <Link to="/" className="hover:text-[#0b1c30] transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/cursos" className="hover:text-[#0b1c30] transition-colors">Cursos</Link>
            <span>/</span>
            <span className="text-[#0b1c30] truncate max-w-xs">{curso.nombre}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* ── Columna izquierda ── */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {curso.esPremium && <Badge variant="premium">Premium</Badge>}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0b1c30] leading-tight mb-3">{curso.nombre}</h1>
                {/* curso.descripcion no existe en el backend — se quitó */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-[#45464d]">
                  <span className="flex items-center gap-1.5">
                    <Icon name="play_circle" className="text-[18px]" />
                    {totalVideos} videos
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <VideoPlayer
                  video={videoActivoMeta ? { id: videoActivoMeta.id, titulo: videoActivoMeta.titulo, duracion: formatDuration(videoActivoMeta.duracionSegundos), esPremium: videoActivoMeta.esPremium } : null}
                  reproduccion={reproduccion}
                  isLoading={cargandoReproduccion}
                  errorCode={errorCode}
                />
              </div>

              {/* Tabs */}
              <div className="border-b border-[#c6c6cd] mb-6">
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setTabActiva(tab.key)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                        tabActiva === tab.key ? 'text-[#006398] border-[#006398]' : 'text-[#45464d] border-transparent hover:text-[#0b1c30]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab: Contenido — agrupado por categoria, no por módulos reales */}
              {tabActiva === 'contenido' && (
                <div className="space-y-3">
                  {grupos.map((grupo) => {
                    // Mapeo VideoVistasPreviaDto → VideoItem liviano, una sola vez por grupo
                    const items = grupo.videos.map((v) => ({
                      id: v.id,
                      titulo: v.titulo,
                      duracion: formatDuration(v.duracionSegundos),
                      esPremium: v.esPremium,
                    }))

                    const videoActivoEnGrupo = items.find((it) => it.id === videoActivoId) ?? null

                    return (
                      <div key={grupo.nombre} className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setModuloAbierto(moduloAbierto === grupo.nombre ? null : grupo.nombre)}
                          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#dce9ff] transition-all cursor-pointer"
                        >
                          <span className="text-[#0b1c30] text-sm font-medium text-left">{grupo.nombre}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#45464d] text-xs">{grupo.videos.length} videos</span>
                            <Icon name="expand_more" className={`text-[18px] text-[#45464d] transition-transform ${moduloAbierto === grupo.nombre ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {moduloAbierto === grupo.nombre && (
                          <div className="border-t border-[#c6c6cd]">
                            <VideoList
                              videos={items}
                              videoActivo={videoActivoEnGrupo}
                              puedeVerVideo={(item) => puedeVerVideo(grupo.videos.find((gv) => gv.id === item.id)!)}
                              onVideoClick={(item) => handleVideoClick(grupo.videos.find((gv) => gv.id === item.id)!)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tab: Objetivos — no existe este campo en el backend, placeholder editorial */}
              {tabActiva === 'objetivos' && (
                <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl p-6">
                  <p className="text-[#45464d] text-sm">
                    Este curso todavía no tiene objetivos de aprendizaje configurados.
                  </p>
                </div>
              )}
            </div>

            {/* ── Columna derecha ── */}
            <div className="xl:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl p-5">
                  {curso.esPremium ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[#0b1c30] font-bold text-2xl">Premium</p>
                        <Badge variant="premium">Premium</Badge>
                      </div>
                      {!isAuthenticated ? (
                        <div className="space-y-3">
                          <Link to="/registro" className="block w-full text-center bg-[#006398] hover:bg-[#00476e] text-white font-semibold py-3 rounded-full text-sm transition-all">
                            Crear cuenta gratis
                          </Link>
                          <Link to="/login" className="block w-full text-center border border-[#c6c6cd] bg-[#dce9ff] text-[#45464d] py-2.5 rounded-full text-sm transition-all hover:bg-[#d3e4fe]">
                            Ya tengo cuenta
                          </Link>
                        </div>
                      ) : !user?.esPremium ? (
                        <div className="space-y-2">
                          <Link to="/precios"><Button variant="premium" className="w-full">Ver planes Premium</Button></Link>
                          <p className="text-[#45464d] text-xs text-center">Desbloquea todos los videos</p>
                        </div>
                      ) : (
                        <p className="text-[#006398] text-sm text-center py-2">Tienes acceso completo</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[#006398] font-bold text-xl">Gratuito</span>
                        <Badge variant="free">Acceso libre</Badge>
                      </div>
                      {!isAuthenticated && (
                        <div className="space-y-3">
                          <Link to="/registro" className="block w-full text-center bg-[#006398] hover:bg-[#00476e] text-white font-semibold py-3 rounded-full text-sm transition-all">
                            Crear cuenta para empezar
                          </Link>
                          <Link to="/login" className="block w-full text-center border border-[#c6c6cd] bg-[#dce9ff] text-[#45464d] py-2.5 rounded-full text-sm transition-all hover:bg-[#d3e4fe]">
                            Ya tengo cuenta
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} videoTitulo={videoUpgrade} />
    </div>
  )
}

export default CursoDetalle