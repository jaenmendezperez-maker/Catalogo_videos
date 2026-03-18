import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ── Mock data ──────────────────────────────────────────────
const CURSOS = [
  { id: 1, nombre: 'Cardiología Clínica Avanzada', categoria: 'Cardiología', descripcion: 'Domina el diagnóstico y tratamiento de las principales patologías cardíacas con enfoque práctico.', instructor: 'Dr. Alejandro Vega', duracion: '24h', videos: 48, alumnos: 1840, nivel: 'Avanzado', esPremium: true, icono: '🫀', acento: 'text-rose-400', color: 'from-rose-500/20 to-rose-600/5' },
  { id: 2, nombre: 'Neurología para Residentes', categoria: 'Neurología', descripcion: 'Fundamentos prácticos para el abordaje neurológico en urgencias y consulta externa.', instructor: 'Dra. Sofía Mendoza', duracion: '18h', videos: 36, alumnos: 2310, nivel: 'Intermedio', esPremium: false, icono: '🧠', acento: 'text-violet-400', color: 'from-violet-500/20 to-violet-600/5' },
  { id: 3, nombre: 'Pediatría Esencial', categoria: 'Pediatría', descripcion: 'Evaluación clínica, vacunación y emergencias pediátricas con protocolos actualizados.', instructor: 'Dr. Carlos Ríos', duracion: '15h', videos: 30, alumnos: 3120, nivel: 'Básico', esPremium: false, icono: '👶', acento: 'text-emerald-400', color: 'from-emerald-500/20 to-emerald-600/5' },
  { id: 4, nombre: 'Urgencias y Trauma', categoria: 'Urgencias', descripcion: 'Protocolos ATLS, manejo del paciente crítico y toma de decisiones en urgencias.', instructor: 'Dra. Paola Ramos', duracion: '20h', videos: 40, alumnos: 2780, nivel: 'Avanzado', esPremium: true, icono: '🚑', acento: 'text-orange-400', color: 'from-orange-500/20 to-orange-600/5' },
  { id: 5, nombre: 'Cirugía General — Técnicas Básicas', categoria: 'Cirugía', descripcion: 'Técnicas quirúrgicas fundamentales, suturas y manejo perioperatorio del paciente.', instructor: 'Dr. Roberto Salinas', duracion: '28h', videos: 56, alumnos: 1560, nivel: 'Intermedio', esPremium: true, icono: '🔬', acento: 'text-blue-400', color: 'from-blue-500/20 to-blue-600/5' },
  { id: 6, nombre: 'Oncología Clínica Básica', categoria: 'Oncología', descripcion: 'Fundamentos de diagnóstico, estadificación y tratamiento oncológico de los tumores más frecuentes.', instructor: 'Dra. Ana Lechuga', duracion: '22h', videos: 44, alumnos: 980, nivel: 'Intermedio', esPremium: true, icono: '🧬', acento: 'text-pink-400', color: 'from-pink-500/20 to-pink-600/5' },
  { id: 7, nombre: 'Psiquiatría en Atención Primaria', categoria: 'Psiquiatría', descripcion: 'Identificación y manejo inicial de trastornos mentales frecuentes en la consulta general.', instructor: 'Dr. Luis Paredes', duracion: '12h', videos: 24, alumnos: 1430, nivel: 'Básico', esPremium: false, icono: '🧘', acento: 'text-indigo-400', color: 'from-indigo-500/20 to-indigo-600/5' },
  { id: 8, nombre: 'Ginecología y Obstetricia', categoria: 'Ginecología', descripcion: 'Control prenatal, parto normal, complicaciones obstétricas y ginecología general.', instructor: 'Dra. Mariana Torres', duracion: '26h', videos: 52, alumnos: 2100, nivel: 'Intermedio', esPremium: false, icono: '⚕️', acento: 'text-teal-400', color: 'from-teal-500/20 to-teal-600/5' },
  { id: 9, nombre: 'ECG e Interpretación Avanzada', categoria: 'Cardiología', descripcion: 'Lectura sistemática del electrocardiograma, arritmias y correlación clínica.', instructor: 'Dr. Alejandro Vega', duracion: '10h', videos: 20, alumnos: 4200, nivel: 'Básico', esPremium: false, icono: '📈', acento: 'text-rose-400', color: 'from-rose-500/20 to-rose-600/5' },
  { id: 10, nombre: 'Radiología para Clínicos', categoria: 'Urgencias', descripcion: 'Interpretación de radiografías de tórax, abdomen y huesos en el contexto clínico urgente.', instructor: 'Dra. Camila Vargas', duracion: '14h', videos: 28, alumnos: 3560, nivel: 'Básico', esPremium: false, icono: '🩻', acento: 'text-orange-400', color: 'from-orange-500/20 to-orange-600/5' },
  { id: 11, nombre: 'Farmacología Clínica Actualizada', categoria: 'Neurología', descripcion: 'Mecanismos de acción, interacciones y uso racional de los fármacos más prescritos.', instructor: 'Dr. Hugo Navarro', duracion: '16h', videos: 32, alumnos: 2890, nivel: 'Intermedio', esPremium: true, icono: '💊', acento: 'text-violet-400', color: 'from-violet-500/20 to-violet-600/5' },
  { id: 12, nombre: 'Pediatría Crítica y Neonatología', categoria: 'Pediatría', descripcion: 'Manejo del neonato y del niño grave. Ventilación, accesos vasculares y reanimación.', instructor: 'Dr. Carlos Ríos', duracion: '18h', videos: 36, alumnos: 870, nivel: 'Avanzado', esPremium: true, icono: '🍼', acento: 'text-emerald-400', color: 'from-emerald-500/20 to-emerald-600/5' },
];

const CATEGORIAS = ['Todas', 'Cardiología', 'Neurología', 'Pediatría', 'Urgencias', 'Cirugía', 'Oncología', 'Psiquiatría', 'Ginecología'];
const NIVELES   = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];
const ORDEN_OPS = [
  { value: 'popular',  label: 'Más populares' },
  { value: 'reciente', label: 'Más recientes' },
  { value: 'duracion', label: 'Más cortos primero' },
];

// ── Sub-componentes ────────────────────────────────────────

function BadgeNivel({ nivel }) {
  const map = {
    Básico:      'bg-emerald-400/10 text-emerald-400',
    Intermedio:  'bg-amber-400/10  text-amber-400',
    Avanzado:    'bg-rose-400/10   text-rose-400',
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${map[nivel] || 'bg-slate-700 text-slate-300'}`}>
      {nivel}
    </span>
  );
}

function CursoCard({ curso }) {
  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="group flex flex-col bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300"
    >
      {/* Cabecera */}
      <div className={`h-28 bg-gradient-to-br ${curso.color} flex items-center justify-center text-5xl relative flex-shrink-0`}>
        <span>{curso.icono}</span>
        {curso.esPremium && (
          <span className="absolute top-3 right-3 text-[11px] bg-amber-400/15 text-amber-400 border border-amber-400/25 px-2 py-0.5 rounded-full font-medium">
            Premium
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${curso.acento}`}>{curso.categoria}</span>
          <BadgeNivel nivel={curso.nivel} />
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
          {curso.nombre}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
          {curso.descripcion}
        </p>

        {/* Footer de la card */}
        <div className="border-t border-white/5 pt-3 space-y-2">
          <p className="text-slate-500 text-xs truncate">{curso.instructor}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {curso.videos} videos
            </span>
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
function CursosCatalogo() {
  const [busqueda,  setBusqueda]  = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [nivel,     setNivel]     = useState('Todos');
  const [soloPremium, setSoloPremium] = useState(false);
  const [soloGratis,  setSoloGratis]  = useState(false);
  const [orden,     setOrden]     = useState('popular');
  const [verFiltros, setVerFiltros] = useState(false);

  // Filtrado + ordenamiento con useMemo para no recalcular en cada render
  const cursosFiltrados = useMemo(() => {
    let resultado = [...CURSOS];

    if (busqueda.trim())
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.instructor.toLowerCase().includes(busqueda.toLowerCase())
      );

    if (categoria !== 'Todas')
      resultado = resultado.filter(c => c.categoria === categoria);

    if (nivel !== 'Todos')
      resultado = resultado.filter(c => c.nivel === nivel);

    if (soloPremium) resultado = resultado.filter(c => c.esPremium);
    if (soloGratis)  resultado = resultado.filter(c => !c.esPremium);

    if (orden === 'popular')  resultado.sort((a, b) => b.alumnos - a.alumnos);
    if (orden === 'duracion') resultado.sort((a, b) => parseInt(a.duracion) - parseInt(b.duracion));

    return resultado;
  }, [busqueda, categoria, nivel, soloPremium, soloGratis, orden]);

  const resetFiltros = () => {
    setBusqueda('');
    setCategoria('Todas');
    setNivel('Todos');
    setSoloPremium(false);
    setSoloGratis(false);
    setOrden('popular');
  };

  const hayFiltrosActivos = categoria !== 'Todas' || nivel !== 'Todos' || soloPremium || soloGratis || busqueda.trim();

  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* ── Header de sección ── */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-cyan-400 text-sm font-medium mb-2">Formación continua</p>
          <h1 className="text-4xl font-bold text-white mb-3">Catálogo de cursos</h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Explora nuestra biblioteca de contenido clínico actualizado, impartido por especialistas de referencia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Barra de búsqueda + controles ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar cursos, especialidades, instructores..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-[#0D1B2E] border border-white/8 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Ordenar */}
          <select
            value={orden}
            onChange={e => setOrden(e.target.value)}
            className="bg-[#0D1B2E] border border-white/8 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
          >
            {ORDEN_OPS.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>

          {/* Toggle filtros mobile */}
          <button
            onClick={() => setVerFiltros(!verFiltros)}
            className={`sm:hidden flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              verFiltros ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#0D1B2E] border-white/8 text-slate-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros {hayFiltrosActivos && <span className="w-2 h-2 bg-cyan-400 rounded-full" />}
          </button>
        </div>

        <div className="flex gap-8">

          {/* ── Sidebar de filtros — desktop siempre visible, mobile toggle ── */}
          <aside className={`w-60 flex-shrink-0 space-y-6 ${verFiltros ? 'block' : 'hidden'} sm:block`}>

            {/* Categorías */}
            <div>
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Especialidad</h3>
              <div className="space-y-1">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                      categoria === cat
                        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Nivel */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Nivel</h3>
              <div className="space-y-1">
                {NIVELES.map(niv => (
                  <button
                    key={niv}
                    onClick={() => setNivel(niv)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all ${
                      nivel === niv
                        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {niv}
                  </button>
                ))}
              </div>
            </div>

            {/* Acceso */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Acceso</h3>
              <div className="space-y-2">
                {[
                  { label: 'Solo gratuitos', value: soloGratis,  setter: (v) => { setSoloGratis(v); if (v) setSoloPremium(false); } },
                  { label: 'Solo Premium',   value: soloPremium, setter: (v) => { setSoloPremium(v); if (v) setSoloGratis(false); } },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setter(!value)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                        value ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 group-hover:border-slate-400'
                      }`}
                    >
                      {value && (
                        <svg className="w-2.5 h-2.5 text-[#070F1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            {hayFiltrosActivos && (
              <button
                onClick={resetFiltros}
                className="w-full text-sm text-slate-500 hover:text-white border border-white/8 hover:border-white/20 rounded-xl py-2.5 transition-all"
              >
                Limpiar filtros
              </button>
            )}
          </aside>

          {/* ── Grid de cursos ── */}
          <div className="flex-1 min-w-0">

            {/* Contador */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-slate-500 text-sm">
                <span className="text-white font-medium">{cursosFiltrados.length}</span> cursos encontrados
              </p>
              {hayFiltrosActivos && (
                <button onClick={resetFiltros} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Sin resultados */}
            {cursosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-white font-semibold mb-2">Sin resultados</h3>
                <p className="text-slate-500 text-sm mb-6">No encontramos cursos con esos filtros.</p>
                <button
                  onClick={resetFiltros}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  Ver todos los cursos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cursosFiltrados.map(curso => (
                  <CursoCard key={curso.id} curso={curso} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CursosCatalogo;