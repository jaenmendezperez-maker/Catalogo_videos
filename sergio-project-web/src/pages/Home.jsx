import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

// ── Datos mock de muestra ──────────────────────────────────
const FEATURED_COURSES = [
  {
    id: 1,
    nombre: 'Cardiología Clínica Avanzada',
    categoria: 'Cardiología',
    descripcion: 'Domina el diagnóstico y tratamiento de las principales patologías cardíacas.',
    instructor: 'Dr. Alejandro Vega',
    duracion: '24h',
    alumnos: 1840,
    nivel: 'Avanzado',
    esPremium: true,
    color: 'from-rose-500/20 to-rose-600/5',
    acento: 'text-rose-400',
    icono: '🫀',
  },
  {
    id: 2,
    nombre: 'Neurología para Residentes',
    categoria: 'Neurología',
    descripcion: 'Fundamentos prácticos para el abordaje neurológico en urgencias y consulta.',
    instructor: 'Dra. Sofía Mendoza',
    duracion: '18h',
    alumnos: 2310,
    nivel: 'Intermedio',
    esPremium: false,
    color: 'from-violet-500/20 to-violet-600/5',
    acento: 'text-violet-400',
    icono: '🧠',
  },
  {
    id: 3,
    nombre: 'Pediatría Esencial',
    categoria: 'Pediatría',
    descripcion: 'Evaluación clínica, vacunación y emergencias pediátricas actualizadas.',
    instructor: 'Dr. Carlos Ríos',
    duracion: '15h',
    alumnos: 3120,
    nivel: 'Básico',
    esPremium: false,
    color: 'from-emerald-500/20 to-emerald-600/5',
    acento: 'text-emerald-400',
    icono: '👶',
  },
];

const SPECIALTIES = [
  { nombre: 'Cardiología', icono: '🫀', cursos: 14 },
  { nombre: 'Neurología', icono: '🧠', cursos: 11 },
  { nombre: 'Pediatría', icono: '👶', cursos: 9 },
  { nombre: 'Cirugía', icono: '🔬', cursos: 16 },
  { nombre: 'Urgencias', icono: '🚑', cursos: 8 },
  { nombre: 'Oncología', icono: '🧬', cursos: 7 },
  { nombre: 'Psiquiatría', icono: '🧘', cursos: 6 },
  { nombre: 'Ginecología', icono: '⚕️', cursos: 10 },
];

const STATS = [
  { value: '200+', label: 'Cursos disponibles' },
  { value: '18K', label: 'Profesionales activos' },
  { value: '95%', label: 'Tasa de satisfacción' },
  { value: '80+', label: 'Especialistas docentes' },
];

const TESTIMONIALS = [
  {
    nombre: 'Dra. Valentina Cruz',
    rol: 'Residente de Medicina Interna',
    texto: 'La calidad del contenido es excepcional. Me ha ayudado enormemente durante mi residencia.',
    avatar: 'VC',
  },
  {
    nombre: 'Dr. Marco Herrera',
    rol: 'Médico General',
    texto: 'Finalmente una plataforma pensada para médicos. El nivel académico es muy alto.',
    avatar: 'MH',
  },
  {
    nombre: 'Dra. Paola Ramos',
    rol: 'Especialista en Urgencias',
    texto: 'Los cursos de urgencias me mantienen actualizada con los protocolos más recientes.',
    avatar: 'PR',
  },
];

// ── Componentes pequeños ───────────────────────────────────

function BadgeNivel({ nivel }) {
  const colors = {
    Básico: 'bg-emerald-400/10 text-emerald-400',
    Intermedio: 'bg-amber-400/10 text-amber-400',
    Avanzado: 'bg-rose-400/10 text-rose-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[nivel] || 'bg-slate-700 text-slate-300'}`}>
      {nivel}
    </span>
  );
}

function CursoCard({ curso }) {
  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="group bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300"
    >
      {/* Header con gradiente */}
      <div className={`h-32 bg-gradient-to-br ${curso.color} flex items-center justify-center text-5xl relative overflow-hidden`}>
        <span className="relative z-10">{curso.icono}</span>
        {curso.esPremium && (
          <span className="absolute top-3 right-3 text-xs bg-amber-400/20 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">
            Premium
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${curso.acento}`}>{curso.categoria}</span>
          <BadgeNivel nivel={curso.nivel} />
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-cyan-400 transition-colors">
          {curso.nombre}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {curso.descripcion}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-slate-500 text-xs">{curso.instructor}</span>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {curso.duracion}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {curso.alumnos.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Página principal ───────────────────────────────────────
function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-[#070F1C] text-white">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Fondo animado */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
          {/* Grid sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#06B6D4 1px, transparent 1px), linear-gradient(90deg, #06B6D4 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <div className="max-w-3xl">

            {/* Chip */}
            <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Plataforma de educación médica continua
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Aprende medicina
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                al siguiente nivel
              </span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Cursos clínicos de alta calidad para médicos, residentes y estudiantes de salud. Actualízate con los expertos.
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/cursos"
                  className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold px-7 py-3.5 rounded-xl transition-all text-sm"
                >
                  Explorar cursos
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/registro"
                    className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold px-7 py-3.5 rounded-xl transition-all text-sm"
                  >
                    Comenzar gratis
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/cursos"
                    className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all text-sm"
                  >
                    Ver cursos
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {['VC', 'MH', 'PR', 'AL'].map((ini, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#070F1C] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    {ini}
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-sm">
                <span className="text-white font-semibold">+18,000</span> profesionales ya aprendiendo
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs">Descubre más</span>
          <div className="w-5 h-8 border border-slate-700 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-[#0D1B2E]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1">
                {value}
              </div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ ESPECIALIDADES ════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-cyan-400 text-sm font-medium mb-2">Áreas clínicas</p>
            <h2 className="text-3xl font-bold text-white">Explora por especialidad</h2>
          </div>
          <Link to="/cursos" className="hidden sm:flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            Ver todas
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {SPECIALTIES.map(({ nombre, icono, cursos }) => (
            <Link
              key={nombre}
              to={`/cursos?cat=${nombre.toLowerCase()}`}
              className="group bg-[#0D1B2E] border border-white/5 rounded-2xl p-4 text-center hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <div className="text-3xl mb-3">{icono}</div>
              <div className="text-white text-xs font-medium mb-1 group-hover:text-cyan-400 transition-colors">
                {nombre}
              </div>
              <div className="text-slate-600 text-xs">{cursos} cursos</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ CURSOS DESTACADOS ═════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-white/5">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-cyan-400 text-sm font-medium mb-2">Los más populares</p>
            <h2 className="text-3xl font-bold text-white">Cursos destacados</h2>
          </div>
          <Link to="/cursos" className="hidden sm:flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            Ver catálogo completo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_COURSES.map((curso) => (
            <CursoCard key={curso.id} curso={curso} />
          ))}
        </div>
      </section>

      {/* ══ BANNER PREMIUM ════════════════════════════════════ */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0D2137] to-[#0D1B2E] border border-cyan-500/20 p-10 sm:p-14">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div>
                <span className="inline-block text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-3 py-1 rounded-full mb-4">
                  Sin costo inicial
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                  Empieza a aprender hoy.<br />
                  <span className="text-cyan-400">Es completamente gratis.</span>
                </h2>
                <p className="text-slate-400 text-sm max-w-md">
                  Crea tu cuenta y accede a decenas de cursos gratuitos. Actualiza a Premium para desbloquear todo el contenido.
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link
                  to="/registro"
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold px-8 py-3.5 rounded-xl transition-all text-sm text-center whitespace-nowrap"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  to="/login"
                  className="border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium px-8 py-3 rounded-xl transition-all text-sm text-center"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ TESTIMONIOS ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-sm font-medium mb-2">Lo que dicen nuestros alumnos</p>
          <h2 className="text-3xl font-bold text-white">Profesionales que confían en nosotros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ nombre, rol, texto, avatar }) => (
            <div key={nombre} className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6">
              {/* Estrellas */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-5">"{texto}"</p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{nombre}</p>
                  <p className="text-slate-500 text-xs">{rol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;