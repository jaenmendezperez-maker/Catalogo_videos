// src/pages/user/MyCourses.tsx
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import type { NivelCurso, CategoriaCurso } from '../../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const MIS_CURSOS = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada', categoria: 'Cardiología' as CategoriaCurso, instructor: 'Dr. Alejandro Vega',  progreso: 35,  totalVideos: 48, videosVistos: 17, ultimoVideo: 'Arritmias supraventriculares', nivel: 'Avanzado'   as NivelCurso, portadaURL: '/assets/images/area-cardio.jpg', esPremium: true  },
  { id: 2,  nombre: 'Neurología para Residentes',   categoria: 'Neurología'  as CategoriaCurso, instructor: 'Dra. Sofía Mendoza', progreso: 72,  totalVideos: 36, videosVistos: 26, ultimoVideo: 'ACV isquémico — código ictus', nivel: 'Intermedio' as NivelCurso, portadaURL: '/assets/images/area-neuro.jpg',  esPremium: false },
  { id: 9,  nombre: 'ECG e Interpretación Avanzada',categoria: 'Cardiología' as CategoriaCurso, instructor: 'Dr. Alejandro Vega',  progreso: 100, totalVideos: 20, videosVistos: 20, ultimoVideo: '',                             nivel: 'Básico'     as NivelCurso, portadaURL: '/assets/images/area-cardio.jpg', esPremium: false },
  { id: 10, nombre: 'Radiología para Clínicos',     categoria: 'Urgencias'   as CategoriaCurso, instructor: 'Dra. Camila Vargas', progreso: 0,   totalVideos: 28, videosVistos: 0,  ultimoVideo: '',                             nivel: 'Básico'     as NivelCurso, portadaURL: '/assets/images/area-urgen.jpg',  esPremium: false },
]

// Catálogo simplificado para armar recomendaciones — en producción vendría de la API,
// filtrando por categorías que el usuario ya cursa y excluyendo lo que ya tiene.
const CATALOGO_SUGERIDOS = [
  { id: 20, nombre: 'Arritmias Ventriculares Complejas', categoria: 'Cardiología' as CategoriaCurso, instructor: 'Dra. Elena Ramos',   nivel: 'Avanzado' as NivelCurso, esPremium: true  },
  { id: 21, nombre: 'Insuficiencia Cardíaca Aguda',       categoria: 'Cardiología' as CategoriaCurso, instructor: 'Dr. Marco Suárez',   nivel: 'Intermedio' as NivelCurso, esPremium: false },
  { id: 22, nombre: 'Crisis Epilépticas en Urgencias',    categoria: 'Neurología'  as CategoriaCurso, instructor: 'Dra. Sofía Mendoza', nivel: 'Intermedio' as NivelCurso, esPremium: false },
  { id: 23, nombre: 'Trauma Craneoencefálico',            categoria: 'Urgencias'   as CategoriaCurso, instructor: 'Dr. Iván Torres',    nivel: 'Avanzado' as NivelCurso, esPremium: true  },
]

function MyCourses() {
  const enProgreso  = MIS_CURSOS.filter((c) => c.progreso > 0 && c.progreso < 100)
  const completados = MIS_CURSOS.filter((c) => c.progreso === 100)
  const sinEmpezar  = MIS_CURSOS.filter((c) => c.progreso === 0)
  const vacio       = MIS_CURSOS.length === 0

  const promedioProgreso = Math.round(MIS_CURSOS.reduce((acc, c) => acc + c.progreso, 0) / (MIS_CURSOS.length || 1)) || 0
  const horasEstimadas   = MIS_CURSOS.reduce((acc, c) => acc + Math.round((c.progreso / 100) * c.totalVideos * 0.4), 0)

  const categoriasDelUsuario = new Set(MIS_CURSOS.map((c) => c.categoria))
  const idsExistentes        = new Set(MIS_CURSOS.map((c) => c.id))
  const recomendados = CATALOGO_SUGERIDOS.filter(
    (c) => categoriasDelUsuario.has(c.categoria) && !idsExistentes.has(c.id)
  )

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-16">

      {/* ── HEADER: tarjeta flotante ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-lg p-8 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#006398]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#006398] flex items-center justify-center flex-shrink-0">
              <Icon name="local_library" className="text-[24px] text-white" />
            </div>
            <div>
              <p className="text-[#006398] text-[10px] font-bold uppercase tracking-wider mb-1">Portal de Aprendizaje</p>
              <h1 className="text-3xl font-extrabold text-[#0b1c30]">Mi Biblioteca</h1>
            </div>
          </div>

          <div className="relative flex gap-8 pt-5 border-t border-[#c6c6cd]">
            <div>
              <p className="text-2xl font-extrabold text-[#0b1c30] leading-none">{enProgreso.length}</p>
              <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider mt-1">En progreso</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#069669] leading-none">{completados.length}</p>
              <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider mt-1">Completados</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#0b1c30] leading-none">{MIS_CURSOS.length}</p>
              <p className="text-[#45464d] text-[10px] font-bold uppercase tracking-wider mt-1">En total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ══ COLUMNA PRINCIPAL ══ */}
          <div className="flex-1 min-w-0 space-y-12">

            {vacio ? (
              <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded-2xl shadow-sm p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#dce9ff] flex items-center justify-center mx-auto mb-4">
                  <Icon name="inbox" className="text-[28px] text-[#45464d]" />
                </div>
                <p className="text-[#0b1c30] font-bold text-lg mb-2">Todavía no tienes cursos</p>
                <p className="text-[#45464d] text-sm mb-6">Explora el catálogo y empieza tu primer curso hoy mismo.</p>
                <Link to="/cursos">
                  <button className="bg-[#006398] hover:bg-[#00476e] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors">
                    Explorar Catálogo
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* ══ CONTINUAR VIENDO ══ */}
                {enProgreso.length > 0 && (
                  <section>
                    <h2 className="text-[#0b1c30] font-bold text-lg mb-4 flex items-center gap-2">
                      <Icon name="play_circle" className="text-[20px] text-[#006398]" />
                      Continuar viendo
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {enProgreso.map((curso) => (
                        <Link
                          key={curso.id}
                          to={`/cursos/${curso.id}`}
                          className="group bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm overflow-hidden hover:border-[#006398]/40 hover:shadow-md transition-all"
                        >
                          <div className="h-32 bg-[#dce9ff] relative overflow-hidden">
                            <img src={curso.portadaURL} alt={curso.categoria} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                              <div className="h-full bg-[#5bb8fe]" style={{ width: `${curso.progreso}%` }} />
                            </div>
                            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                              {curso.categoria}
                            </span>
                            {curso.esPremium && (
                              <span className="absolute top-3 right-3 bg-[#8b5cf6] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">PRO</span>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                <Icon name="play_arrow" className="text-[24px] text-[#006398]" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-[#0b1c30] font-bold text-sm truncate mb-0.5">{curso.nombre}</h3>
                            <p className="text-[#45464d] text-xs mb-3">{curso.instructor}</p>
                            <p className="text-[#006398] text-xs font-medium truncate mb-1">
                              Siguiente: {curso.ultimoVideo}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#45464d]">
                              <span>{curso.videosVistos} / {curso.totalVideos} temas</span>
                              <span className="text-[#0b1c30]">{curso.progreso}%</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* ══ COMPLETADOS ══ */}
                {completados.length > 0 && (
                  <section>
                    <h2 className="text-[#0b1c30] font-bold text-lg mb-4 flex items-center gap-2">
                      <Icon name="check_circle" className="text-[20px] text-[#069669]" />
                      Completados
                    </h2>
                    <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm divide-y divide-[#c6c6cd] overflow-hidden">
                      {completados.map((curso) => (
                        <Link
                          key={curso.id}
                          to={`/cursos/${curso.id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-[#dce9ff]/40 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
                            <Icon name="check" className="text-[16px] text-[#065f46]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#0b1c30] font-semibold text-sm truncate">{curso.nombre}</p>
                            <p className="text-[#45464d] text-xs">{curso.categoria} · {curso.instructor}</p>
                          </div>
                          <Badge nivel={curso.nivel} />
                          <span className="text-[#006398] text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            Repasar <Icon name="arrow_forward" className="text-[14px]" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* ══ SIN EMPEZAR ══ */}
                {sinEmpezar.length > 0 && (
                  <section>
                    <h2 className="text-[#0b1c30] font-bold text-lg mb-4 flex items-center gap-2">
                      <Icon name="schedule" className="text-[20px] text-[#45464d]" />
                      Por empezar
                    </h2>
                    <div className="space-y-3">
                      {sinEmpezar.map((curso) => (
                        <div
                          key={curso.id}
                          className="flex items-center gap-4 bg-[#e5eeff] border border-dashed border-[#c6c6cd] rounded p-4 hover:border-[#006398]/50 transition-colors shadow-sm"
                        >
                          <div className="w-14 h-14 rounded-xl bg-[#dce9ff] flex-shrink-0 overflow-hidden">
                            <img src={curso.portadaURL} alt={curso.categoria} className="w-full h-full object-cover opacity-80" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006398]">{curso.categoria}</span>
                              <Badge nivel={curso.nivel} />
                            </div>
                            <p className="text-[#0b1c30] font-semibold text-sm truncate">{curso.nombre}</p>
                            <p className="text-[#45464d] text-xs">{curso.totalVideos} temas · {curso.instructor}</p>
                          </div>
                          <Link
                            to={`/cursos/${curso.id}`}
                            className="flex-shrink-0 bg-[#006398] hover:bg-[#00476e] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-colors"
                          >
                            Iniciar
                          </Link>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ══ RECOMENDADO PARA TI ══ */}
                {recomendados.length > 0 && (
                  <section>
                    <h2 className="text-[#0b1c30] font-bold text-lg mb-1 flex items-center gap-2">
                      <Icon name="auto_awesome" className="text-[20px] text-[#8b5cf6]" />
                      Recomendado para ti
                    </h2>
                    <p className="text-[#45464d] text-xs mb-4">Basado en las especialidades que ya estás cursando</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recomendados.map((curso) => (
                        <Link
                          key={curso.id}
                          to={`/cursos/${curso.id}`}
                          className="flex items-center gap-4 bg-[#e5eeff] border border-[#c6c6cd] rounded p-4 hover:border-[#8b5cf6]/40 hover:shadow-md transition-all shadow-sm group"
                        >
                          <div className="w-11 h-11 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center flex-shrink-0">
                            <Icon name="auto_awesome" className="text-[18px] text-[#8b5cf6]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6]">{curso.categoria}</span>
                              {curso.esPremium && (
                                <span className="bg-[#8b5cf6] text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">PRO</span>
                              )}
                            </div>
                            <p className="text-[#0b1c30] font-semibold text-sm truncate">{curso.nombre}</p>
                            <p className="text-[#45464d] text-xs">{curso.instructor}</p>
                          </div>
                          <Icon name="arrow_forward" className="text-[16px] text-[#8b5cf6] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* ══ SIDEBAR: resumen ══ */}
          <div className="xl:w-72 flex-shrink-0 space-y-6">
            <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm p-6">
              <h3 className="text-[#0b1c30] font-bold text-sm uppercase tracking-wider mb-5">Tu resumen</h3>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#dce9ff" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" stroke="#006398" strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - promedioProgreso / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-[#0b1c30]">
                    {promedioProgreso}%
                  </span>
                </div>
                <div>
                  <p className="text-[#0b1c30] text-sm font-semibold">Progreso promedio</p>
                  <p className="text-[#45464d] text-xs mt-0.5">{horasEstimadas}h de estudio acumuladas</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#c6c6cd]">
                <Link to="/cursos" className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                  <Icon name="search" className="text-[16px]" /> Explorar catálogo
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                  <Icon name="dashboard" className="text-[16px]" /> Ir al dashboard
                </Link>
                <Link to="/perfil" className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                  <Icon name="person" className="text-[16px]" /> Editar mi perfil
                </Link>
              </div>
            </div>

            {/* Categorías que cursas */}
            {categoriasDelUsuario.size > 0 && (
              <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm p-6">
                <h3 className="text-[#0b1c30] font-bold text-sm uppercase tracking-wider mb-4">Tus especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {[...categoriasDelUsuario].map((cat) => (
                    <Link
                      key={cat}
                      to={`/cursos?categoria=${cat}`}
                      className="text-xs font-medium text-[#006398] bg-[#cce5ff]/50 hover:bg-[#cce5ff] px-3 py-1.5 rounded-full transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyCourses