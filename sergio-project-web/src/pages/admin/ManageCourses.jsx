import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/ui/Modal';

const CURSOS_MOCK = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada',       categoria: 'Cardiología', instructor: 'Dr. Alejandro Vega',  alumnos: 1840, videos: 48, nivel: 'Avanzado',    esPremium: true,  icono: '🫀', publicado: true  },
  { id: 2,  nombre: 'Neurología para Residentes',          categoria: 'Neurología',  instructor: 'Dra. Sofía Mendoza',  alumnos: 2310, videos: 36, nivel: 'Intermedio',  esPremium: false, icono: '🧠', publicado: true  },
  { id: 3,  nombre: 'Pediatría Esencial',                  categoria: 'Pediatría',   instructor: 'Dr. Carlos Ríos',     alumnos: 3120, videos: 30, nivel: 'Básico',      esPremium: false, icono: '👶', publicado: true  },
  { id: 4,  nombre: 'Urgencias y Trauma',                  categoria: 'Urgencias',   instructor: 'Dra. Paola Ramos',    alumnos: 2780, videos: 40, nivel: 'Avanzado',    esPremium: true,  icono: '🚑', publicado: true  },
  { id: 5,  nombre: 'Cirugía General — Técnicas Básicas',  categoria: 'Cirugía',     instructor: 'Dr. Roberto Salinas', alumnos: 1560, videos: 56, nivel: 'Intermedio',  esPremium: true,  icono: '🔬', publicado: false },
  { id: 6,  nombre: 'Oncología Clínica Básica',            categoria: 'Oncología',   instructor: 'Dra. Ana Lechuga',    alumnos: 980,  videos: 44, nivel: 'Intermedio',  esPremium: true,  icono: '🧬', publicado: true  },
  { id: 9,  nombre: 'ECG e Interpretación Avanzada',       categoria: 'Cardiología', instructor: 'Dr. Alejandro Vega',  alumnos: 4200, videos: 20, nivel: 'Básico',      esPremium: false, icono: '📈', publicado: true  },
  { id: 11, nombre: 'Farmacología Clínica Actualizada',    categoria: 'Neurología',  instructor: 'Dr. Hugo Navarro',    alumnos: 2890, videos: 32, nivel: 'Intermedio',  esPremium: true,  icono: '💊', publicado: false },
];

function ManageCourses() {
  const [cursos, setCursos]       = useState(CURSOS_MOCK);
  const [busqueda, setBusqueda]   = useState('');
  const [filtro, setFiltro]       = useState('Todos');
  const [modalEliminar, setModalEliminar] = useState(null);
  const [loading, setLoading]     = useState(false);

  const cursosFiltrados = useMemo(() => {
    return cursos.filter(c => {
      const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            c.categoria.toLowerCase().includes(busqueda.toLowerCase());
      const matchFiltro =
        filtro === 'Todos'       ? true :
        filtro === 'Publicados'  ? c.publicado :
        filtro === 'Borradores'  ? !c.publicado :
        filtro === 'Premium'     ? c.esPremium : true;
      return matchBusqueda && matchFiltro;
    });
  }, [cursos, busqueda, filtro]);

  const togglePublicado = (id) => {
    // TODO: api.patch(`/cursos/${id}/publicado`)
    setCursos(prev => prev.map(c => c.id === id ? { ...c, publicado: !c.publicado } : c));
  };

  const eliminarCurso = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // TODO: api.delete(`/cursos/${modalEliminar.id}`)
    setCursos(prev => prev.filter(c => c.id !== modalEliminar.id));
    setModalEliminar(null);
    setLoading(false);
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cyan-400 text-sm font-medium mb-1">Administración</p>
            <h1 className="text-3xl font-bold text-white">Gestión de cursos</h1>
            <p className="text-slate-400 text-sm mt-1">{cursos.length} cursos en total</p>
          </div>
          <Link to="/admin/cursos/nuevo"
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo curso
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-[#0D1B2E] border border-white/8 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Todos', 'Publicados', 'Borradores', 'Premium'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  filtro === f
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-[#0D1B2E] text-slate-400 border border-white/5 hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Curso', 'Categoría', 'Alumnos', 'Videos', 'Plan', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cursosFiltrados.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">

                    {/* Curso */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.icono}</span>
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate max-w-48">{c.nombre}</p>
                          <p className="text-slate-500 text-xs truncate">{c.instructor}</p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-5 py-4">
                      <span className="text-slate-400 text-xs">{c.categoria}</span>
                    </td>

                    {/* Alumnos */}
                    <td className="px-5 py-4">
                      <span className="text-slate-300 text-sm">{c.alumnos.toLocaleString()}</span>
                    </td>

                    {/* Videos */}
                    <td className="px-5 py-4">
                      <span className="text-slate-300 text-sm">{c.videos}</span>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        c.esPremium
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-emerald-400/10 text-emerald-400'
                      }`}>
                        {c.esPremium ? '⭐ Premium' : 'Gratis'}
                      </span>
                    </td>

                    {/* Publicado toggle */}
                    <td className="px-5 py-4">
                      <button onClick={() => togglePublicado(c.id)}
                        className={`relative w-10 h-5 rounded-full transition-all ${
                          c.publicado ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          c.publicado ? 'left-5' : 'left-0.5'
                        }`} />
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/cursos/${c.id}/editar`}
                          className="text-xs text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all">
                          Editar
                        </Link>
                        <Link to={`/admin/videos/nuevo?cursoId=${c.id}`}
                          className="text-xs text-slate-400 hover:text-violet-400 bg-white/5 hover:bg-violet-500/10 px-3 py-1.5 rounded-lg transition-all">
                          + Video
                        </Link>
                        <button onClick={() => setModalEliminar(c)}
                          className="text-xs text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cursosFiltrados.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 text-sm">No se encontraron cursos con esos filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal confirmar eliminar */}
      <Modal isOpen={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar curso" size="sm">
        {modalEliminar && (
          <div>
            <p className="text-slate-300 text-sm mb-6">
              ¿Eliminar <span className="text-white font-semibold">{modalEliminar.nombre}</span>? Se perderán todos sus videos y el progreso de los alumnos.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalEliminar(null)}
                className="border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-all">
                Cancelar
              </button>
              <button onClick={eliminarCurso} disabled={loading}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageCourses;