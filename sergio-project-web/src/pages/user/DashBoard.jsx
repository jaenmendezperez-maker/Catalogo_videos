import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

// ── Mock data ──────────────────────────────────────────────
const MIS_CURSOS = [
  {
    id: 1,
    nombre: 'Cardiología Clínica Avanzada',
    categoria: 'Cardiología',
    instructor: 'Dr. Alejandro Vega',
    progreso: 35,
    totalVideos: 48,
    videosVistos: 17,
    ultimoVideo: 'Arritmias supraventriculares',
    icono: '🫀',
    acento: 'text-rose-400',
    color: 'from-rose-500/20 to-rose-600/5',
    esPremium: true,
  },
  {
    id: 2,
    nombre: 'Neurología para Residentes',
    categoria: 'Neurología',
    instructor: 'Dra. Sofía Mendoza',
    progreso: 72,
    totalVideos: 36,
    videosVistos: 26,
    ultimoVideo: 'ACV isquémico — código ictus',
    icono: '🧠',
    acento: 'text-violet-400',
    color: 'from-violet-500/20 to-violet-600/5',
    esPremium: false,
  },
  {
    id: 9,
    nombre: 'ECG e Interpretación Avanzada',
    categoria: 'Cardiología',
    instructor: 'Dr. Alejandro Vega',
    progreso: 100,
    totalVideos: 20,
    videosVistos: 20,
    ultimoVideo: 'Completado',
    icono: '📈',
    acento: 'text-rose-400',
    color: 'from-rose-500/20 to-rose-600/5',
    esPremium: false,
  },
];

const ACTIVIDAD_RECIENTE = [
  { tipo: 'video',      texto: 'Viste "Arritmias supraventriculares"',     curso: 'Cardiología Clínica Avanzada', hace: 'Hace 2 horas' },
  { tipo: 'video',      texto: 'Viste "ACV isquémico — código ictus"',      curso: 'Neurología para Residentes',   hace: 'Ayer' },
  { tipo: 'completado', texto: 'Completaste el curso',                       curso: 'ECG e Interpretación Avanzada', hace: 'Hace 3 días' },
  { tipo: 'video',      texto: 'Viste "Crisis epilépticas y status"',        curso: 'Neurología para Residentes',   hace: 'Hace 4 días' },
  { tipo: 'inicio',     texto: 'Comenzaste el curso',                        curso: 'Cardiología Clínica Avanzada', hace: 'Hace 1 semana' },
];

const CURSOS_SUGERIDOS = [
  { id: 4,  nombre: 'Urgencias y Trauma',         icono: '🚑', categoria: 'Urgencias',   esPremium: true  },
  { id: 3,  nombre: 'Pediatría Esencial',          icono: '👶', categoria: 'Pediatría',   esPremium: false },
  { id: 10, nombre: 'Radiología para Clínicos',    icono: '🩻', categoria: 'Urgencias',   esPremium: false },
];

// ── Sub-componentes ────────────────────────────────────────

function StatCard({ valor, label, icono, color }) {
  return (
    <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <span className="text-xl">{icono}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none mb-1">{valor}</p>
        <p className="text-slate-500 text-xs">{label}</p>
      </div>
    </div>
  );
}

function BarraProgreso({ progreso, colorClass = 'from-cyan-500 to-blue-500' }) {
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5">
      <div
        className={`bg-gradient-to-r ${colorClass} h-1.5 rounded-full transition-all`}
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
}

function CursoEnProgreso({ curso }) {
  const completado = curso.progreso === 100;

  return (
    <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all group">
      <div className={`h-20 bg-gradient-to-br ${curso.color} flex items-center justify-center text-4xl relative`}>
        <span>{curso.icono}</span>
        {completado && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
            <div className="bg-emerald-400/20 border border-emerald-400/30 rounded-full px-3 py-1 text-xs text-emerald-400 font-semibold backdrop-blur-sm">
              ✓ Completado
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <span className={`text-xs font-medium ${curso.acento}`}>{curso.categoria}</span>
        <h3 className="text-white text-sm font-semibold mt-1 mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">
          {curso.nombre}
        </h3>
        <p className="text-slate-500 text-xs mb-3 truncate">{curso.instructor}</p>

        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">{curso.videosVistos} / {curso.totalVideos} videos</span>
            <span className={completado ? 'text-emerald-400 font-semibold' : 'text-cyan-400 font-semibold'}>
              {curso.progreso}%
            </span>
          </div>
          <BarraProgreso
            progreso={curso.progreso}
            colorClass={completado ? 'from-emerald-500 to-emerald-400' : 'from-cyan-500 to-blue-500'}
          />
        </div>

        {!completado && (
          <p className="text-slate-600 text-xs mb-3 truncate">
            Último: <span className="text-slate-400">{curso.ultimoVideo}</span>
          </p>
        )}

        <Link
          to={`/cursos/${curso.id}`}
          className={`block w-full text-center text-xs font-semibold py-2.5 rounded-xl transition-all ${
            completado
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          {completado ? 'Ver curso' : 'Continuar →'}
        </Link>
      </div>
    </div>
  );
}

function ActividadItem({ item }) {
  const iconos = {
    video:      { bg: 'bg-blue-500/10',    icon: '▶', color: 'text-blue-400' },
    completado: { bg: 'bg-emerald-500/10', icon: '✓', color: 'text-emerald-400' },
    inicio:     { bg: 'bg-cyan-500/10',    icon: '🚀', color: 'text-cyan-400' },
  };
  const { bg, icon, color } = iconos[item.tipo] || iconos.video;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center text-sm flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm leading-snug">{item.texto}</p>
        <p className="text-slate-600 text-xs mt-0.5 truncate">{item.curso}</p>
      </div>
      <span className="text-slate-600 text-xs flex-shrink-0 mt-0.5">{item.hace}</span>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuthStore();
  const [tabCursos, setTabCursos] = useState('progreso'); // progreso | completados

  const cursosEnProgreso  = MIS_CURSOS.filter(c => c.progreso < 100);
  const cursosCompletados = MIS_CURSOS.filter(c => c.progreso === 100);
  const horasAprendidas   = MIS_CURSOS.reduce((acc, c) => acc + Math.round((c.progreso / 100) * parseInt(c.totalVideos) * 0.4), 0);
  const promedioProgreso  = Math.round(MIS_CURSOS.reduce((acc, c) => acc + c.progreso, 0) / MIS_CURSOS.length);

  const cursosTab = tabCursos === 'progreso' ? cursosEnProgreso : cursosCompletados;

  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* ── Header ── */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-slate-400 text-sm">Bienvenido de nuevo,</p>
                <h1 className="text-2xl font-bold text-white">{user?.nombre || 'Estudiante'}</h1>
                {user?.esPremium && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full mt-1">
                    ⭐ Premium
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/cursos"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Explorar más cursos
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ══ COLUMNA PRINCIPAL ══ */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard valor={MIS_CURSOS.length}       label="Cursos inscritos"   icono="📚" color="bg-cyan-500/10" />
              <StatCard valor={cursosCompletados.length} label="Completados"        icono="✅" color="bg-emerald-500/10" />
              <StatCard valor={`${horasAprendidas}h`}   label="Horas aprendidas"   icono="⏱️" color="bg-blue-500/10" />
              <StatCard valor={`${promedioProgreso}%`}  label="Progreso promedio"  icono="📈" color="bg-violet-500/10" />
            </div>

            {/* ── Mis cursos ── */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Mis cursos</h2>
                <div className="flex bg-[#0D1B2E] border border-white/5 rounded-xl p-1">
                  {[
                    { key: 'progreso',   label: 'En progreso', count: cursosEnProgreso.length },
                    { key: 'completados', label: 'Completados', count: cursosCompletados.length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setTabCursos(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        tabCursos === tab.key
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        tabCursos === tab.key ? 'bg-cyan-500/20' : 'bg-white/5'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {cursosTab.length === 0 ? (
                <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-3">🎓</p>
                  <p className="text-white font-medium mb-1">Aún no hay cursos aquí</p>
                  <p className="text-slate-500 text-sm mb-5">Explora el catálogo y empieza a aprender.</p>
                  <Link to="/cursos" className="inline-block bg-cyan-500/10 text-cyan-400 text-sm px-5 py-2.5 rounded-xl hover:bg-cyan-500/20 transition-all">
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cursosTab.map(curso => (
                    <CursoEnProgreso key={curso.id} curso={curso} />
                  ))}
                </div>
              )}
            </section>

            {/* ── Cursos sugeridos ── */}
            <section>
              <h2 className="text-white font-bold text-lg mb-5">Recomendados para ti</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CURSOS_SUGERIDOS.map(curso => (
                  <Link
                    key={curso.id}
                    to={`/cursos/${curso.id}`}
                    className="flex items-center gap-3 bg-[#0D1B2E] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-4 group transition-all"
                  >
                    <span className="text-3xl flex-shrink-0">{curso.icono}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {curso.nombre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 text-xs">{curso.categoria}</span>
                        {curso.esPremium && (
                          <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded-full">Premium</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* ══ COLUMNA LATERAL ══ */}
          <div className="xl:w-72 flex-shrink-0 space-y-5">

            {/* Perfil rápido */}
            <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Mi perfil</h3>
                <Link to="/perfil" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Editar
                </Link>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Nombre',  valor: user?.nombre  || '—' },
                  { label: 'Correo',  valor: user?.correo  || '—' },
                  { label: 'Rol',     valor: user?.rol     || '—' },
                  { label: 'Plan',    valor: user?.esPremium ? 'Premium ⭐' : 'Gratuito' },
                ].map(({ label, valor }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-500 text-xs">{label}</span>
                    <span className="text-slate-300 text-xs font-medium truncate max-w-32 text-right">{valor}</span>
                  </div>
                ))}
              </div>

              {!user?.esPremium && (
                <button className="w-full mt-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold py-2.5 rounded-xl transition-all border border-amber-400/10">
                  ⭐ Mejorar a Premium
                </button>
              )}
            </div>

            {/* Actividad reciente */}
            <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-1">Actividad reciente</h3>
              <div>
                {ACTIVIDAD_RECIENTE.map((item, i) => (
                  <ActividadItem key={i} item={item} />
                ))}
              </div>
            </div>

            {/* Racha */}
            <div className="bg-gradient-to-br from-[#0D2137] to-[#0D1B2E] border border-cyan-500/15 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Racha de estudio</h3>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1">
                7 días
              </p>
              <p className="text-slate-500 text-xs mb-4">¡Sigue así, llevas una semana seguida!</p>

              {/* Mini calendario semanal */}
              <div className="flex gap-1.5 justify-between">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, i) => (
                  <div key={dia} className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                      i < 7 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-600'
                    }`}>
                      {i < 7 ? '✓' : '·'}
                    </div>
                    <span className="text-slate-600 text-[10px]">{dia}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;