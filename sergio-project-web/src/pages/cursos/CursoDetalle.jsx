import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

// ── Mock data ──────────────────────────────────────────────
const CURSOS_DETALLE = {
  1: {
    id: 1,
    nombre: 'Cardiología Clínica Avanzada',
    categoria: 'Cardiología',
    descripcion: 'Un recorrido completo por las principales patologías cardíacas: desde la fisiopatología hasta el manejo clínico actual. Ideal para médicos que buscan profundizar o actualizar sus conocimientos en cardiología.',
    instructor: 'Dr. Alejandro Vega',
    instructorRol: 'Cardiólogo Intervencionista · Hospital Universitario',
    instructorAvatar: 'AV',
    duracion: '24h',
    alumnos: 1840,
    nivel: 'Avanzado',
    esPremium: true,
    icono: '🫀',
    acento: 'text-rose-400',
    color: 'from-rose-500/20 to-rose-600/5',
    objetivos: [
      'Interpretar el ECG con enfoque clínico práctico',
      'Diagnosticar y manejar la insuficiencia cardíaca',
      'Comprender el síndrome coronario agudo y su tratamiento',
      'Identificar arritmias y conocer su manejo inicial',
      'Aplicar guías clínicas vigentes en la práctica diaria',
    ],
    modulos: [
      {
        id: 1,
        titulo: 'Fundamentos de Cardiología',
        videos: [
          { id: 1, titulo: 'Anatomía cardíaca funcional', duracion: '18:42', esPremium: false, completado: true },
          { id: 2, titulo: 'Fisiología del ciclo cardíaco', duracion: '22:15', esPremium: false, completado: true },
          { id: 3, titulo: 'Semiología cardiovascular', duracion: '31:08', esPremium: true, completado: false },
        ],
      },
      {
        id: 2,
        titulo: 'Electrocardiografía',
        videos: [
          { id: 4, titulo: 'Lectura sistemática del ECG', duracion: '25:30', esPremium: false, completado: false },
          { id: 5, titulo: 'Arritmias supraventriculares', duracion: '28:44', esPremium: true, completado: false },
          { id: 6, titulo: 'Arritmias ventriculares', duracion: '24:12', esPremium: true, completado: false },
          { id: 7, titulo: 'Bloqueos de rama y fasciculares', duracion: '19:55', esPremium: true, completado: false },
        ],
      },
      {
        id: 3,
        titulo: 'Síndrome Coronario Agudo',
        videos: [
          { id: 8, titulo: 'Fisiopatología de la placa aterosclerótica', duracion: '20:10', esPremium: true, completado: false },
          { id: 9, titulo: 'IAMCEST: diagnóstico y manejo inicial', duracion: '35:22', esPremium: true, completado: false },
          { id: 10, titulo: 'IAMSEST y angina inestable', duracion: '29:48', esPremium: true, completado: false },
        ],
      },
      {
        id: 4,
        titulo: 'Insuficiencia Cardíaca',
        videos: [
          { id: 11, titulo: 'Clasificación y diagnóstico de IC', duracion: '23:05', esPremium: true, completado: false },
          { id: 12, titulo: 'Tratamiento farmacológico actualizado', duracion: '32:17', esPremium: true, completado: false },
          { id: 13, titulo: 'Manejo de la IC aguda descompensada', duracion: '27:40', esPremium: true, completado: false },
        ],
      },
    ],
  },
  2: {
    id: 2, nombre: 'Neurología para Residentes', categoria: 'Neurología',
    descripcion: 'Fundamentos prácticos del abordaje neurológico para residentes de medicina interna, medicina familiar y urgencias.',
    instructor: 'Dra. Sofía Mendoza', instructorRol: 'Neuróloga · Instituto Nacional de Neurología', instructorAvatar: 'SM',
    duracion: '18h', alumnos: 2310, nivel: 'Intermedio', esPremium: false, icono: '🧠',
    acento: 'text-violet-400', color: 'from-violet-500/20 to-violet-600/5',
    objetivos: ['Realizar un examen neurológico completo', 'Interpretar estudios de neuroimagen básicos', 'Manejar cefalea, vértigo y síncope', 'Reconocer el ACV y actuar en tiempo'],
    modulos: [
      { id: 1, titulo: 'Exploración Neurológica', videos: [
        { id: 1, titulo: 'Evaluación del nivel de conciencia', duracion: '20:10', esPremium: false, completado: false },
        { id: 2, titulo: 'Pares craneales — exploración práctica', duracion: '24:35', esPremium: false, completado: false },
        { id: 3, titulo: 'Sistema motor y reflejo', duracion: '18:50', esPremium: false, completado: false },
      ]},
      { id: 2, titulo: 'Urgencias Neurológicas', videos: [
        { id: 4, titulo: 'ACV isquémico — código ictus', duracion: '32:20', esPremium: false, completado: false },
        { id: 5, titulo: 'Crisis epilépticas y status', duracion: '28:15', esPremium: false, completado: false },
      ]},
    ],
  },
};

// Fallback para IDs sin datos detallados
const getCurso = (id) => CURSOS_DETALLE[id] || {
  id, nombre: 'Curso no encontrado', categoria: '—',
  descripcion: 'Este curso no tiene datos disponibles aún.',
  instructor: '—', instructorRol: '—', instructorAvatar: '?',
  duracion: '—', alumnos: 0, nivel: '—', esPremium: false,
  icono: '📚', acento: 'text-slate-400', color: 'from-slate-500/20 to-slate-600/5',
  objetivos: [], modulos: [],
};

// ── Sub-componentes ────────────────────────────────────────

function BadgeNivel({ nivel }) {
  const map = { Básico: 'bg-emerald-400/10 text-emerald-400', Intermedio: 'bg-amber-400/10 text-amber-400', Avanzado: 'bg-rose-400/10 text-rose-400' };
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${map[nivel] || 'bg-slate-700 text-slate-300'}`}>{nivel}</span>;
}

// Reproductor simulado (cuando tengas URLs reales de video, cambia el src)
function VideoPlayer({ video }) {
  if (!video) return (
    <div className="aspect-video bg-[#0D1B2E] rounded-2xl flex flex-col items-center justify-center border border-white/5">
      <div className="text-5xl mb-3">▶️</div>
      <p className="text-slate-400 text-sm">Selecciona un video para comenzar</p>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden bg-black border border-white/5">
      {/* Simulación del reproductor — reemplaza con tu URL real */}
      <div className="aspect-video bg-gradient-to-br from-slate-900 to-[#0D1B2E] flex flex-col items-center justify-center relative group">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <p className="absolute bottom-4 left-4 text-white text-sm font-medium">{video.titulo}</p>
        <span className="absolute bottom-4 right-4 text-slate-400 text-xs">{video.duracion}</span>
      </div>

      {/* Barra de controles */}
      <div className="bg-[#0D1B2E] px-4 py-3 flex items-center gap-3">
        <button className="text-white hover:text-cyan-400 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
        <div className="flex-1 bg-slate-700 rounded-full h-1.5 cursor-pointer">
          <div className="bg-cyan-500 h-1.5 rounded-full w-0" />
        </div>
        <span className="text-slate-400 text-xs">0:00 / {video.duracion}</span>
        <button className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 9v6m0 0l-3-3m3 3l3-3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────
function CursoDetalle() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const curso = getCurso(Number(id));

  const [videoActivo, setVideoActivo] = useState(null);
  const [moduloAbierto, setModuloAbierto] = useState(1);
  const [tabActiva, setTabActiva] = useState('contenido'); // contenido | objetivos | instructor

  const totalVideos = curso.modulos.reduce((acc, m) => acc + m.videos.length, 0);
  const videosCompletados = curso.modulos.reduce((acc, m) => acc + m.videos.filter(v => v.completado).length, 0);
  const progreso = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0;

  const puedeVerVideo = (video) => {
    if (!video.esPremium) return true;
    if (!isAuthenticated) return false;
    if (user?.esPremium) return true;
    return false;
  };

  const handleVideoClick = (video) => {
    if (!puedeVerVideo(video)) return;
    setVideoActivo(video);
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/cursos" className="hover:text-white transition-colors">Cursos</Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{curso.nombre}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ══ COLUMNA IZQUIERDA — info + reproductor ══ */}
          <div className="flex-1 min-w-0">

            {/* Header del curso */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-medium ${curso.acento}`}>{curso.categoria}</span>
                <span className="text-slate-600">·</span>
                <BadgeNivel nivel={curso.nivel} />
                {curso.esPremium && (
                  <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-0.5 rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
                {curso.nombre}
              </h1>
              <p className="text-slate-400 leading-relaxed mb-5">{curso.descripcion}</p>

              {/* Métricas */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {curso.alumnos.toLocaleString()} alumnos
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {curso.duracion} de contenido
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {totalVideos} videos
                </span>
              </div>
            </div>

            {/* Reproductor */}
            <div className="mb-8">
              <VideoPlayer video={videoActivo} />
            </div>

            {/* Tabs */}
            <div className="border-b border-white/5 mb-6">
              <div className="flex gap-1">
                {[
                  { key: 'contenido',   label: 'Contenido' },
                  { key: 'objetivos',   label: 'Lo que aprenderás' },
                  { key: 'instructor',  label: 'Instructor' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setTabActiva(tab.key)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      tabActiva === tab.key
                        ? 'text-cyan-400 border-cyan-400'
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab: Contenido (módulos) */}
            {tabActiva === 'contenido' && (
              <div className="space-y-3">
                {curso.modulos.map((modulo) => (
                  <div key={modulo.id} className="bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setModuloAbierto(moduloAbierto === modulo.id ? null : modulo.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0">
                          {modulo.id}
                        </div>
                        <span className="text-white text-sm font-medium text-left">{modulo.titulo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs">{modulo.videos.length} videos</span>
                        <svg
                          className={`w-4 h-4 text-slate-500 transition-transform ${moduloAbierto === modulo.id ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {moduloAbierto === modulo.id && (
                      <div className="border-t border-white/5">
                        {modulo.videos.map((video, idx) => {
                          const puede = puedeVerVideo(video);
                          const estaActivo = videoActivo?.id === video.id;
                          return (
                            <button
                              key={video.id}
                              onClick={() => handleVideoClick(video)}
                              disabled={!puede}
                              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all border-b border-white/5 last:border-0 ${
                                estaActivo
                                  ? 'bg-cyan-500/10'
                                  : puede
                                  ? 'hover:bg-white/5 cursor-pointer'
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              {/* Ícono estado */}
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5">
                                {video.completado ? (
                                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : !puede ? (
                                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                ) : estaActivo ? (
                                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                ) : (
                                  <span className="text-slate-500 text-xs font-medium">{idx + 1}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${estaActivo ? 'text-cyan-400 font-medium' : 'text-slate-300'}`}>
                                  {video.titulo}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {video.esPremium && (
                                  <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded-full">Premium</span>
                                )}
                                <span className="text-slate-500 text-xs">{video.duracion}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Lo que aprenderás */}
            {tabActiva === 'objetivos' && (
              <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-5">Al finalizar este curso podrás:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {curso.objetivos.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Instructor */}
            {tabActiva === 'instructor' && (
              <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {curso.instructorAvatar}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{curso.instructor}</h3>
                    <p className="text-slate-400 text-sm">{curso.instructorRol}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Especialista con más de 15 años de experiencia clínica y docente. Ha formado a más de 5,000 médicos a través de cursos presenciales y en línea, con enfoque en la aplicación práctica del conocimiento médico.
                </p>
              </div>
            )}
          </div>

          {/* ══ COLUMNA DERECHA — acceso + progreso ══ */}
          <div className="xl:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Card de acceso */}
              <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl overflow-hidden">
                {/* Preview del curso */}
                <div className={`h-36 bg-gradient-to-br ${curso.color} flex items-center justify-center text-6xl`}>
                  {curso.icono}
                </div>

                <div className="p-5">
                  {curso.esPremium ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white font-bold text-2xl">Premium</p>
                          <p className="text-slate-500 text-xs">Acceso completo al curso</p>
                        </div>
                        <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full">
                          ⭐ Premium
                        </span>
                      </div>
                      {!isAuthenticated ? (
                        <div className="space-y-2">
                          <Link to="/registro" className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold py-3 rounded-xl text-sm transition-all">
                            Crear cuenta gratis
                          </Link>
                          <Link to="/login" className="block w-full text-center border border-white/10 hover:border-white/20 text-slate-300 hover:text-white py-2.5 rounded-xl text-sm transition-all">
                            Ya tengo cuenta
                          </Link>
                        </div>
                      ) : !user?.esPremium ? (
                        <div className="space-y-2">
                          <button className="w-full bg-amber-500 hover:bg-amber-400 text-[#070F1C] font-semibold py-3 rounded-xl text-sm transition-all">
                            Mejorar a Premium
                          </button>
                          <p className="text-slate-500 text-xs text-center">Desbloquea todos los videos</p>
                        </div>
                      ) : (
                        <p className="text-emerald-400 text-sm text-center py-2">✓ Tienes acceso completo</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-emerald-400 font-bold text-xl">Gratuito</span>
                        <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">Acceso libre</span>
                      </div>
                      {!isAuthenticated ? (
                        <div className="space-y-2">
                          <Link to="/registro" className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold py-3 rounded-xl text-sm transition-all">
                            Crear cuenta para empezar
                          </Link>
                          <Link to="/login" className="block w-full text-center border border-white/10 hover:border-white/20 text-slate-300 py-2.5 rounded-xl text-sm transition-all">
                            Ya tengo cuenta
                          </Link>
                        </div>
                      ) : (
                        <p className="text-emerald-400 text-sm text-center py-2">✓ Tienes acceso completo</p>
                      )}
                    </>
                  )}
                </div>

                {/* Incluye */}
                <div className="border-t border-white/5 px-5 py-4 space-y-2.5">
                  <p className="text-white text-xs font-semibold mb-3">Este curso incluye:</p>
                  {[
                    { icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: `${totalVideos} videos` },
                    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: `${curso.duracion} de contenido` },
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Certificado al completar' },
                    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2v-1a1 1 0 00-1-1H6.5a1 1 0 00-1 1v1a2 2 0 002 2zM12 3v9m0 0l-3-3m3 3l3-3', label: 'Acceso desde móvil' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-slate-400 text-xs">
                      <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                      </svg>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progreso (solo si está logueado) */}
              {isAuthenticated && (
                <div className="bg-[#0D1B2E] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-semibold">Tu progreso</p>
                    <span className="text-cyan-400 text-sm font-bold">{progreso}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs">
                    {videosCompletados} de {totalVideos} videos completados
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CursoDetalle;