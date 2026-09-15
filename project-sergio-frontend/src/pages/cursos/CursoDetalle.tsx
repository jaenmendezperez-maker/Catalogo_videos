// src/pages/cursos/CursoDetalle.tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import UpgradeModal from '../../components/ui/UpgradeModal'
import VideoPlayer from '../../components/videos/VideoPlayer'
import VideoList   from '../../components/videos/VideoList'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

interface VideoItem { id: number; titulo: string; duracion: string; esPremium: boolean; completado: boolean }
interface Modulo    { id: number; titulo: string; videos: VideoItem[] }
interface CursoData {
  id: number; nombre: string; categoria: string; descripcion: string
  instructor: string; instructorRol: string; instructorAvatar: string
  duracion: string; alumnos: number; nivel: string; esPremium: boolean
  portadaURL: string; acento: string; color: string
  objetivos: string[]; modulos: Modulo[]
}

const CURSOS_DETALLE: Record<number, CursoData> = {
  1: {
    id: 1, nombre: 'Cardiología Clínica Avanzada', categoria: 'Cardiología',
    descripcion: 'Un recorrido completo por las principales patologías cardíacas: desde la fisiopatología hasta el manejo clínico actual.',
    instructor: 'Dr. Alejandro Vega', instructorRol: 'Cardiólogo Intervencionista · Hospital Universitario', instructorAvatar: 'AV',
    duracion: '24h', alumnos: 1840, nivel: 'Avanzado', esPremium: true, portadaURL: '/assets/images/heart.png', acento: 'text-[#ba1a1a]', color: 'from-[#ffdad6] to-[#ffdad6]/20',
    objetivos: ['Interpretar el ECG con enfoque clínico práctico', 'Diagnosticar y manejar la insuficiencia cardíaca', 'Comprender el síndrome coronario agudo y su tratamiento', 'Identificar arritmias y conocer su manejo inicial'],
    modulos: [
      { id: 1, titulo: 'Fundamentos de Cardiología', videos: [
        { id: 1, titulo: 'Anatomía cardíaca funcional',   duracion: '18:42', esPremium: false, completado: true  },
        { id: 2, titulo: 'Fisiología del ciclo cardíaco', duracion: '22:15', esPremium: false, completado: true  },
        { id: 3, titulo: 'Semiología cardiovascular',     duracion: '31:08', esPremium: true,  completado: false },
      ]},
      { id: 2, titulo: 'Electrocardiografía', videos: [
        { id: 4, titulo: 'Lectura sistemática del ECG',     duracion: '25:30', esPremium: false, completado: false },
        { id: 5, titulo: 'Arritmias supraventriculares',    duracion: '28:44', esPremium: true,  completado: false },
        { id: 6, titulo: 'Arritmias ventriculares',         duracion: '24:12', esPremium: true,  completado: false },
        { id: 7, titulo: 'Bloqueos de rama y fasciculares', duracion: '19:55', esPremium: true,  completado: false },
      ]},
      { id: 3, titulo: 'Síndrome Coronario Agudo', videos: [
        { id: 8,  titulo: 'Fisiopatología de la placa aterosclerótica', duracion: '20:10', esPremium: true, completado: false },
        { id: 9,  titulo: 'IAMCEST: diagnóstico y manejo inicial',       duracion: '35:22', esPremium: true, completado: false },
        { id: 10, titulo: 'IAMSEST y angina inestable',                   duracion: '29:48', esPremium: true, completado: false },
      ]},
      { id: 4, titulo: 'Insuficiencia Cardíaca', videos: [
        { id: 11, titulo: 'Clasificación y diagnóstico de IC',    duracion: '23:05', esPremium: true, completado: false },
        { id: 12, titulo: 'Tratamiento farmacológico actualizado', duracion: '32:17', esPremium: true, completado: false },
        { id: 13, titulo: 'Manejo de la IC aguda descompensada',   duracion: '27:40', esPremium: true, completado: false },
      ]},
    ],
  },
  2: {
    id: 2, nombre: 'Neurología para Residentes', categoria: 'Neurología',
    descripcion: 'Fundamentos prácticos del abordaje neurológico para residentes de medicina interna, medicina familiar y urgencias.',
    instructor: 'Dra. Sofía Mendoza', instructorRol: 'Neuróloga · Instituto Nacional de Neurología', instructorAvatar: 'SM',
    duracion: '18h', alumnos: 2310, nivel: 'Intermedio', esPremium: false, portadaURL: '/assets/images/brain.png', acento: 'text-[#8b5cf6]', color: 'from-[#8b5cf6]/15 to-[#8b5cf6]/5',
    objetivos: ['Realizar un examen neurológico completo', 'Interpretar estudios de neuroimagen básicos', 'Manejar cefalea, vértigo y síncope', 'Reconocer el ACV y actuar en tiempo'],
    modulos: [
      { id: 1, titulo: 'Exploración Neurológica', videos: [
        { id: 1, titulo: 'Evaluación del nivel de conciencia',     duracion: '20:10', esPremium: false, completado: false },
        { id: 2, titulo: 'Pares craneales — exploración práctica', duracion: '24:35', esPremium: false, completado: false },
        { id: 3, titulo: 'Sistema motor y reflejo',                duracion: '18:50', esPremium: false, completado: false },
      ]},
      { id: 2, titulo: 'Urgencias Neurológicas', videos: [
        { id: 4, titulo: 'ACV isquémico — código ictus', duracion: '32:20', esPremium: false, completado: false },
        { id: 5, titulo: 'Crisis epilépticas y status',   duracion: '28:15', esPremium: false, completado: false },
      ]},
    ],
  },
}

const getCurso = (id: number): CursoData => CURSOS_DETALLE[id] ?? {
  id, nombre: 'Curso no encontrado', categoria: '—', descripcion: 'Este curso no tiene datos disponibles.',
  instructor: '—', instructorRol: '—', instructorAvatar: '?',
  duracion: '—', alumnos: 0, nivel: '—', esPremium: false,
  portadaURL: '/assets/images/medical-team.png', acento: 'text-[#45464d]', color: 'from-[#e5eeff] to-[#e5eeff]/20',
  objetivos: [], modulos: [],
}

function CursoDetalle() {
  const { id }                    = useParams<{ id: string }>()
  const { isAuthenticated, user } = useAuthStore()
  const curso                     = getCurso(Number(id))

  const [videoActivo,   setVideoActivo]   = useState<VideoItem | null>(null)
  const [moduloAbierto, setModuloAbierto] = useState<number | null>(1)
  const [tabActiva,     setTabActiva]     = useState<'contenido' | 'objetivos' | 'instructor'>('contenido')

  const [showUpgrade,  setShowUpgrade]  = useState(false)
  const [videoUpgrade, setVideoUpgrade] = useState('')

  const totalVideos       = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0)
  const videosCompletados = curso.modulos.reduce((acc, m) => acc + m.videos.filter((v) => v.completado).length, 0)
  const progreso          = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0

  const puedeVerVideo = (video: VideoItem) => {
    if (!video.esPremium) return true
    if (!isAuthenticated)  return false
    return !!user?.esPremium
  }

  const handleVideoClick = (video: VideoItem) => {
    if (puedeVerVideo(video)) {
      setVideoActivo(video)
    } else {
      setVideoUpgrade(video.titulo)
      setShowUpgrade(true)
    }
  }

  const tabs = [
    { key: 'contenido',  label: 'Contenido'         },
    { key: 'objetivos',  label: 'Lo que aprenderás' },
    { key: 'instructor', label: 'Instructor'        },
  ] as const

  return (
    <div className="bg-[#f8f9ff] min-h-screen relative">

      <div className="relative z-10">
        {/* Breadcrumb */}
        <div className="border-b border-[#c6c6cd] bg-[#eff4ff]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-2 text-xs text-[#45464d]">
            <Link to="/"       className="hover:text-[#0b1c30] transition-colors">Inicio</Link>
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
                  <span className={`text-sm font-medium ${curso.acento}`}>{curso.categoria}</span>
                  <span className="text-[#45464d]">·</span>
                  <Badge nivel={curso.nivel} />
                  {curso.esPremium && <Badge variant="premium">Premium</Badge>}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0b1c30] leading-tight mb-3">{curso.nombre}</h1>
                <p className="text-[#45464d] leading-relaxed mb-5">{curso.descripcion}</p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-[#45464d]">
                  {[
                    { icon: 'group',       label: `${curso.alumnos.toLocaleString()} alumnos` },
                    { icon: 'schedule',    label: `${curso.duracion} de contenido`             },
                    { icon: 'play_circle', label: `${totalVideos} videos`                      },
                  ].map(({ icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5">
                      <Icon name={icon} className="text-[18px]" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <VideoPlayer video={videoActivo} color={curso.color} thumbnailURL={curso.portadaURL} />
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

              {/* Tab: Contenido */}
              {tabActiva === 'contenido' && (
                <div className="space-y-3">
                  {curso.modulos.map((modulo) => (
                    <div key={modulo.id} className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setModuloAbierto(moduloAbierto === modulo.id ? null : modulo.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#dce9ff] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-[#cce5ff] flex items-center justify-center text-[#004b73] text-xs font-bold flex-shrink-0">
                            {modulo.id}
                          </div>
                          <span className="text-[#0b1c30] text-sm font-medium text-left">{modulo.titulo}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#45464d] text-xs">{modulo.videos.length} videos</span>
                          <Icon name="expand_more" className={`text-[18px] text-[#45464d] transition-transform ${moduloAbierto === modulo.id ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {moduloAbierto === modulo.id && (
                        <div className="border-t border-[#c6c6cd]">
                          <VideoList
                            videos={modulo.videos}
                            videoActivo={videoActivo}
                            puedeVerVideo={puedeVerVideo}
                            onVideoClick={handleVideoClick}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Objetivos */}
              {tabActiva === 'objetivos' && (
                <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl p-6">
                  <h3 className="text-[#0b1c30] font-semibold mb-5">Al finalizar este curso podrás:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {curso.objetivos.map((obj, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded bg-[#cce5ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon name="check" className="text-[14px] text-[#004b73]" />
                        </div>
                        <p className="text-[#45464d] text-sm leading-relaxed">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Instructor */}
              {tabActiva === 'instructor' && (
                <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#dce9ff] border border-[#c6c6cd] flex items-center justify-center text-[#0b1c30] text-lg font-bold flex-shrink-0">
                      {curso.instructorAvatar}
                    </div>
                    <div>
                      <h3 className="text-[#0b1c30] font-semibold">{curso.instructor}</h3>
                      <p className="text-[#45464d] text-sm">{curso.instructorRol}</p>
                    </div>
                  </div>
                  <p className="text-[#45464d] text-sm leading-relaxed">
                    Especialista con más de 15 años de experiencia clínica y docente. Ha formado a más de 5,000 médicos a través de cursos presenciales y en línea.
                  </p>
                </div>
              )}
            </div>

            {/* ── Columna derecha ── */}
            <div className="xl:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-4">

                {/* TARJETA */}
                <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl overflow-hidden">
                  <div className={`h-36 bg-gradient-to-br ${curso.color} flex items-center justify-center relative`}>
                    <img src={curso.portadaURL} alt={curso.nombre} className="w-20 h-20 object-contain drop-shadow-2xl" />
                  </div>
                  <div className="p-5">
                    {curso.esPremium ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-[#0b1c30] font-bold text-2xl">Premium</p>
                            <p className="text-[#45464d] text-xs">Acceso completo al curso</p>
                          </div>
                          <Badge variant="premium">Premium</Badge>
                        </div>
                        {!isAuthenticated ? (
                          <div className="space-y-3">
                            <Link to="/registro" className="block w-full text-center bg-[#006398] hover:bg-[#00476e] text-[#ffffff] font-semibold py-3 rounded-full text-sm transition-all duration-200 active:scale-95">
                              Crear cuenta gratis
                            </Link>
                            <Link to="/login" className="block w-full text-center border border-[#c6c6cd] bg-[#dce9ff] text-[#45464d] py-2.5 rounded-full text-sm transition-all hover:bg-[#d3e4fe] active:scale-95">
                              Ya tengo cuenta
                            </Link>
                          </div>
                        ) : !user?.esPremium ? (
                          <div className="space-y-2">
                            <Link to="/precios">
                              <Button variant="premium" className="w-full">Ver planes Premium</Button>
                            </Link>
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
                        {!isAuthenticated ? (
                          <div className="space-y-3">
                            <Link to="/registro" className="block w-full text-center bg-[#006398] hover:bg-[#00476e] text-[#ffffff] font-semibold py-3 rounded-full text-sm transition-all duration-200 active:scale-95">
                              Crear cuenta para empezar
                            </Link>
                            <Link to="/login" className="block w-full text-center border border-[#c6c6cd] bg-[#dce9ff] text-[#45464d] py-2.5 rounded-full text-sm transition-all hover:bg-[#d3e4fe] active:scale-95">
                              Ya tengo cuenta
                            </Link>
                          </div>
                        ) : (
                          <p className="text-[#006398] text-sm text-center py-2">Tienes acceso completo</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#c6c6cd] px-5 py-4 space-y-2.5">
                    <p className="text-[#0b1c30] text-xs font-semibold mb-3">Este curso incluye:</p>
                    {[
                      { icon: 'play_circle', label: `${totalVideos} videos`          },
                      { icon: 'schedule',    label: `${curso.duracion} de contenido` },
                      { icon: 'smartphone',  label: 'Acceso desde móvil'             },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-2.5 text-[#45464d] text-xs">
                        <Icon name={icon} className="text-[16px] text-[#006398] flex-shrink-0" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progreso */}
                {isAuthenticated && (
                  <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#0b1c30] text-sm font-semibold">Tu progreso</p>
                      <span className="text-[#006398] text-sm font-bold">{progreso}%</span>
                    </div>
                    <div className="w-full bg-[#eff4ff] rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-[#006398] h-full transition-all" style={{ width: `${progreso}%` }} />
                    </div>
                    <p className="text-[#45464d] text-xs">{videosCompletados} de {totalVideos} videos completados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de upgrade ── */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        videoTitulo={videoUpgrade}
      />
    </div>
  )
}

export default CursoDetalle