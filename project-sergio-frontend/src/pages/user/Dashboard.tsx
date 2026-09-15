// src/pages/user/Dashboard.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import UpgradeBanner from '../../components/ui/UpgradeBanner'
import CursoCard from '@/components/cursos/CursoCard'
import type { Curso, CategoriaCurso, NivelCurso } from '../../types'

type MiCursoDashboard = Curso & {
  progreso?: number
  videosVistos?: number
  totalVideos?: number
  ultimoVideo?: string
}

const MIS_CURSOS: MiCursoDashboard[] = [
  {
    id: 1,
    nombre: 'Cardiología Clínica Avanzada',
    categoria: 'Cardiología' as CategoriaCurso,
    instructor: 'Dr. Alejandro Vega',
    progreso: 35,
    totalVideos: 48,
    videosVistos: 17,
    ultimoVideo: 'Arritmias supraventriculares',
    portadaURL: '/assets/images/heart.png',
    esPremium: true,
    descripcion: 'Manejo integral de patologías cardiovasculares complejas.',
    nivel: 'Avanzado' as NivelCurso,
    videos: 48,
    duracion: '12h',
    alumnos: 1250
  } as MiCursoDashboard,
  {
    id: 2,
    nombre: 'Neurología para Residentes',
    categoria: 'Neurología' as CategoriaCurso,
    instructor: 'Dra. Sofía Mendoza',
    progreso: 72,
    totalVideos: 36,
    videosVistos: 26,
    ultimoVideo: 'ACV isquémico — código ictus',
    portadaURL: '/assets/images/heart.png',
    esPremium: false,
    descripcion: 'Abordaje diagnóstico y terapéutico en urgencias neurológicas.',
    nivel: 'Intermedio' as NivelCurso,
    videos: 36,
    duracion: '8h',
    alumnos: 3420
  } as MiCursoDashboard,
]

const CURSOS_SUGERIDOS: MiCursoDashboard[] = [
  {
    id: 4,
    nombre: 'Urgencias y Trauma Pediátrico',
    categoria: 'Urgencias' as CategoriaCurso,
    esPremium: true,
    portadaURL: '/assets/images/heart.png',
    instructor: 'Dr. Carlos Ruiz',
    descripcion: 'Manejo inicial del trauma pediátrico en el servicio de urgencias.',
    nivel: 'Avanzado' as NivelCurso,
    videos: 25,
    duracion: '5h',
    alumnos: 890
  } as MiCursoDashboard,
  {
    id: 3,
    nombre: 'Pediatría Esencial y Manejo',
    categoria: 'Pediatría' as CategoriaCurso,
    esPremium: false,
    portadaURL: '/assets/images/heart.png',
    instructor: 'Dra. Elena Torres',
    descripcion: 'Conceptos fundamentales para la práctica pediátrica diaria.',
    nivel: 'Básico' as NivelCurso,
    videos: 40,
    duracion: '9h',
    alumnos: 2100
  } as MiCursoDashboard,
  {
    id: 10,
    nombre: 'Radiología Torácica',
    categoria: 'Urgencias' as CategoriaCurso,
    esPremium: false,
    portadaURL: '/assets/images/heart.png',
    instructor: 'Dr. Fernando Macías',
    descripcion: 'Interpretación sistemática de radiografías de tórax.',
    nivel: 'Intermedio' as NivelCurso,
    videos: 15,
    duracion: '3h',
    alumnos: 4500
  } as MiCursoDashboard,
]

interface ActividadItem { tipo: 'video' | 'completado' | 'inicio'; texto: string; curso: string; hace: string }

const ACTIVIDAD_RECIENTE: ActividadItem[] = [
  { tipo: 'video',      texto: 'Reprodujo: Arritmias supraventriculares',  curso: 'Cardiología Clínica',  hace: 'Hace 2 horas' },
  { tipo: 'video',      texto: 'Reprodujo: ACV isquémico — código ictus',  curso: 'Neurología',            hace: 'Ayer'         },
  { tipo: 'completado', texto: 'Completaste el curso completo',            curso: 'ECG e Interpretación',  hace: 'Hace 3 días'  },
  { tipo: 'video',      texto: 'Reprodujo: Crisis epilépticas',            curso: 'Neurología',            hace: 'Hace 4 días'  },
]

function StatCard({ valor, label, acento }: { valor: string | number; label: string; acento: string }) {
  return (
    <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded p-5 flex flex-col justify-center">
      <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-mediumbold leading-none ${acento}`} style={{ fontFamily: 'var(--font-headline)' }}>
        {valor}
      </p>
    </div>
  )
}

function ActividadItemComp({ item }: { item: ActividadItem }) {
  const typeColors = {
    video:      'text-[#45464d]',
    completado: 'text-[#006398]',
    inicio:     'text-[#0b1c30]',
  }
  return (
    <div className="py-3 border-b border-[#c6c6cd] last:border-0 group">
      <p className={`text-xs font-semibold mb-1 leading-snug ${typeColors[item.tipo]}`}>{item.texto}</p>
      <div className="flex justify-between items-center">
        <span className="text-[#0b1c30] text-[10px]">{item.curso}</span>
        <span className="text-[#45464d] text-[10px] uppercase tracking-wider">{item.hace}</span>
      </div>
    </div>
  )
}

// ── COMPONENTE: Tarjeta Tipográfica para Recomendaciones ──
function RecomendacionCard({ curso }: { curso: MiCursoDashboard }) {
  return (
    <Link to={`/cursos/${curso.id}`} className="block h-full">
      <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded p-5 h-full flex flex-col hover:border-[#006398]/40 transition-all duration-300 group relative overflow-hidden">
        <div className="flex justify-between items-start mb-3 pl-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${curso.esPremium ? 'text-[#8b5cf6]' : 'text-[#069669]'}`}>
            {curso.categoria}
          </span>
          {curso.esPremium && (
            <span className="bg-[#8b5cf6] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              PRO
            </span>
          )}
        </div>

        <h3 className="text-[#0b1c30] font-bold text-sm leading-snug mb-2 pl-2 transition-colors">
          {curso.nombre}
        </h3>

        <p className="text-[#45464d] text-xs leading-relaxed mb-4 line-clamp-2 pl-2 flex-1">
          {curso.descripcion}
        </p>

        <div className="mt-auto pl-2 pt-4 border-t border-[#c6c6cd] flex items-center justify-between">
          <span className="text-[#45464d] text-xs font-medium">{curso.instructor}</span>
          <span className="text-[#006398] text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            Explorar
          </span>
        </div>
      </div>
    </Link>
  )
}

function Dashboard() {
  const { isAuthenticated } = useAuthStore()

  const user = {
    nombre: 'Usuario Test',
    correo: 'usuario@test.com',
    rol: 'Estudiante',
    esPremium: false,
    avatar: '/assets/images/sergio.png',
  }

  const [tabCursos, setTabCursos] = useState<'progreso' | 'completados'>('progreso')

  const cursosEnProgreso  = MIS_CURSOS.filter((c) => (c.progreso ?? 0) < 100)
  const cursosCompletados = MIS_CURSOS.filter((c) => c.progreso === 100)
  const horasAprendidas   = MIS_CURSOS.reduce((acc, c) => acc + Math.round(((c.progreso ?? 0) / 100) * (c.totalVideos ?? 0) * 0.4), 0)
  const promedioProgreso  = Math.round(MIS_CURSOS.reduce((acc, c) => acc + (c.progreso ?? 0), 0) / MIS_CURSOS.length) || 0
  const cursosTab = tabCursos === 'progreso' ? cursosEnProgreso : cursosCompletados

  const cursoDestacado = cursosEnProgreso[0]

  return (
    <div className="bg-[#f8fbff] min-h-screen pb-12">
      <div className="border-b border-[#c6c6cd] bg-[#e1eafd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 ">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-[#dce9ff] border-2 border-[#006398] flex items-center justify-center text-[#0b1c30] text-xl font-bold flex-shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.nombre?.charAt(0).toUpperCase() ?? 'U'
                )}
              </div>
              <div>
                <p className="text-[#45464d] text-xs font-bold uppercase tracking-wider mb-0.5">Portal de Aprendizaje</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#0b1c30]">{user?.nombre ?? 'Estudiante'}</h1>
                  {user?.esPremium && (
                    <span className="bg-[#8b5cf6] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link to="/cursos">
              <button className="bg-[#006398] border border-[#006398] text-white hover:bg-[#00476e] cursor-pointer rounded-2xl px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-colors">
                Explorar Catálogo
              </button>
            </Link>
          </div>
        </div>
      </div>

      {isAuthenticated && !user?.esPremium && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <UpgradeBanner />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-10">

            {cursoDestacado && (
              <section>
                <div className="bg-[#e5eeff] border border-[#c6c6cd] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-1">Continuar donde te quedaste</p>
                    <h2 className="text-[#0b1c30] text-xl font-bold mb-2">{cursoDestacado.nombre}</h2>
                    <p className="text-sm font-medium text-[#0b1c30]">
                      Tema pendiente: <span className="text-[#006398]">{cursoDestacado.ultimoVideo}</span>
                    </p>
                  </div>
                  <Link to={`/cursos/${cursoDestacado.id}`} className="w-full sm:w-auto">
                    <button className="w-full rounded-2xl bg-[#006398] hover:bg-[#00476e] cursor-pointer text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-wider transition-colors shadow-lg">
                      Reanudar Clase
                    </button>
                  </Link>
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard valor={MIS_CURSOS.length}        label="Cursos inscritos" acento="text-[#0b1c30]" />
              <StatCard valor={cursosCompletados.length} label="Completados"      acento="text-[#006398]" />
              <StatCard valor={`${horasAprendidas}h`}    label="Horas de estudio" acento="text-[#0b1c30]" />
              <StatCard valor={`${promedioProgreso}%`}   label="Progreso general" acento="text-[#0b1c30]" />
            </div>

            <section>
              <div className="flex items-center justify-between mb-6 border-b border-[#c6c6cd] pb-3">
                <h2 className="text-[#0b1c30] font-bold text-xl">Mis cursos</h2>
                <div className="flex bg-[#eff4ff] border border-[#c6c6cd] rounded">
                  {([['progreso', 'En progreso', cursosEnProgreso.length], ['completados', 'Finalizados', cursosCompletados.length]] as const).map(([key, label, count]) => (
                    <button
                      key={key}
                      onClick={() => setTabCursos(key)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                        tabCursos === key
                          ? 'bg-[#006398] text-white shadow-sm'
                          : 'text-[#45464d] hover:text-[#0b1c30] hover:bg-[#dce9ff]'
                      }`}
                    >
                      {label}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        tabCursos === key
                          ? 'bg-white/25 text-white'
                          : 'bg-[#dce9ff] text-[#45464d]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {cursosTab.length === 0 ? (
                <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded p-12 text-center">
                  <p className="text-[#0b1c30] font-bold text-lg mb-2">No hay cursos en esta sección</p>
                  <p className="text-[#45464d] text-sm mb-6">Explora el catálogo y añade más contenido a tu biblioteca.</p>
                  <Link to="/cursos">
                    <button className="bg-[#f8f9ff] border border-[#c6c6cd] hover:border-[#006398] hover:bg-[#eff4ff] cursor-pointer text-[#0b1c30] px-6 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors">
                      Ver Catálogo
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cursosTab.map((curso) => <CursoCard key={curso.id} curso={curso as any} />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-[#0b1c30] font-bold text-xl mb-4 border-b border-[#c6c6cd] pb-3">Recomendaciones Clínicas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CURSOS_SUGERIDOS.map((curso) => <RecomendacionCard key={curso.id} curso={curso} />)}
              </div>
            </section>

          </div>

          <div className="xl:w-72 flex-shrink-0 space-y-6">

            <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#0b1c30] font-bold text-sm uppercase tracking-wider">Mi Perfil</h3>
                <Link to="/perfil" className="text-[10px] font-bold text-[#006398] hover:underline uppercase tracking-wider">Editar</Link>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Nombre',      valor: user?.nombre ?? '—' },
                  { label: 'Correo',      valor: user?.correo ?? '—' },
                  { label: 'Suscripción', valor: user?.esPremium ? 'PREMIUM' : 'GRATUITA', highlight: user?.esPremium },
                ].map(({ label, valor, highlight }) => (
                  <div key={label} className="flex justify-between items-end border-b border-[#c6c6cd] pb-2 last:border-0 last:pb-0">
                    <span className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider">{label}</span>
                    <span className={`text-xs font-semibold truncate max-w-[140px] text-right ${highlight ? 'text-[#8b5cf6]' : 'text-[#0b1c30]'}`}>
                      {valor}
                    </span>
                  </div>
                ))}
              </div>
              {!user?.esPremium && (
                <div className="mt-6">
                  <Link to="/precios">
                    <button className="rounded-2xl w-full bg-[#8b5cf6] border-2 border-[#8b5cf6] text-white hover:bg-[#7c4feb] hover:border-[#7c4feb] cursor-pointer py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                      Desbloquear PRO
                    </button>
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded p-6">
              <h3 className="text-[#0b1c30] font-bold text-sm uppercase tracking-wider mb-4">Registro de Actividad</h3>
              <div>
                {ACTIVIDAD_RECIENTE.map((item, i) => <ActividadItemComp key={i} item={item} />)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard