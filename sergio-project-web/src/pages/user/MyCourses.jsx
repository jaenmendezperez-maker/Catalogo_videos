import { useState } from 'react';
import { Link } from 'react-router-dom';

const MIS_CURSOS = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada',  categoria: 'Cardiología', instructor: 'Dr. Alejandro Vega',    progreso: 35,  totalVideos: 48, videosVistos: 17, icono: '🫀', acento: 'text-rose-400',   color: 'from-rose-500/20 to-rose-600/5',   esPremium: true  },
  { id: 2,  nombre: 'Neurología para Residentes',     categoria: 'Neurología',  instructor: 'Dra. Sofía Mendoza',   progreso: 72,  totalVideos: 36, videosVistos: 26, icono: '🧠', acento: 'text-violet-400', color: 'from-violet-500/20 to-violet-600/5', esPremium: false },
  { id: 9,  nombre: 'ECG e Interpretación Avanzada',  categoria: 'Cardiología', instructor: 'Dr. Alejandro Vega',    progreso: 100, totalVideos: 20, videosVistos: 20, icono: '📈', acento: 'text-rose-400',   color: 'from-rose-500/20 to-rose-600/5',   esPremium: false },
  { id: 10, nombre: 'Radiología para Clínicos',       categoria: 'Urgencias',   instructor: 'Dra. Camila Vargas',   progreso: 0,   totalVideos: 28, videosVistos: 0,  icono: '🩻', acento: 'text-orange-400', color: 'from-orange-500/20 to-orange-600/5', esPremium: false },
];

const FILTROS = ['Todos', 'En progreso', 'Completados', 'Sin empezar'];

function CursoRow({ curso }) {
  const completado  = curso.progreso === 100;
  const sinEmpezar  = curso.progreso === 0;

  const estadoLabel = completado ? 'Completado' : sinEmpezar ? 'Sin empezar' : 'En progreso';
  const estadoColor = completado
    ? 'bg-emerald-400/10 text-emerald-400'
    : sinEmpezar
    ? 'bg-slate-700 text-slate-400'
    : 'bg-cyan-400/10 text-cyan-400';

  return (
    <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-cyan-500/20 transition-all group">

      {/* Ícono */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${curso.color} flex items-center justify-center text-2xl flex-shrink-0`}>
        {curso.icono}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-xs font-medium ${curso.acento}`}>{curso.categoria}</span>
          {curso.esPremium && (
            <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-400/20">Premium</span>
          )}
        </div>
        <h3 className="text-white text-sm font-semibold group-hover:text-cyan-400 transition-colors truncate">
          {curso.nombre}
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">{curso.instructor}</p>
      </div>

      {/* Progreso */}
      <div className="w-full sm:w-40 flex-shrink-0">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">{curso.videosVistos}/{curso.totalVideos} videos</span>
          <span className={completado ? 'text-emerald-400 font-semibold' : 'text-cyan-400 font-semibold'}>{curso.progreso}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r transition-all ${completado ? 'from-emerald-500 to-emerald-400' : 'from-cyan-500 to-blue-500'}`}
            style={{ width: `${curso.progreso}%` }}
          />
        </div>
      </div>

      {/* Estado */}
      <span className={`text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${estadoColor}`}>
        {estadoLabel}
      </span>

      {/* Acción */}
      <Link
        to={`/cursos/${curso.id}`}
        className="flex-shrink-0 text-xs font-semibold bg-[#070F1C] hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 border border-white/8 hover:border-cyan-500/30 px-4 py-2 rounded-xl transition-all"
      >
        {completado ? 'Ver' : sinEmpezar ? 'Empezar' : 'Continuar'} →
      </Link>
    </div>
  );
}

function MyCourses() {
  const [filtro, setFiltro] = useState('Todos');

  const cursosFiltrados = MIS_CURSOS.filter(c => {
    if (filtro === 'Completados')  return c.progreso === 100;
    if (filtro === 'En progreso')  return c.progreso > 0 && c.progreso < 100;
    if (filtro === 'Sin empezar')  return c.progreso === 0;
    return true;
  });

  return (
    <div className="bg-[#070F1C] min-h-screen">

      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-cyan-400 text-sm font-medium mb-1">Aprendizaje</p>
          <h1 className="text-3xl font-bold text-white">Mis cursos</h1>
          <p className="text-slate-400 text-sm mt-2">{MIS_CURSOS.length} cursos inscritos</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition-all ${
                filtro === f
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-[#0D1B2E] text-slate-400 border border-white/5 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
        {cursosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-white font-medium mb-2">No hay cursos en esta categoría</p>
            <Link to="/cursos" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
              Explorar catálogo →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cursosFiltrados.map(curso => (
              <CursoRow key={curso.id} curso={curso} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;