import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../components/ui/Alert';

const CATEGORIAS = ['Cardiología', 'Neurología', 'Pediatría', 'Urgencias', 'Cirugía', 'Oncología', 'Psiquiatría', 'Ginecología'];
const NIVELES    = ['Básico', 'Intermedio', 'Avanzado'];

// Mock — cuando tengas API: const curso = await api.get(`/cursos/${id}`)
const CURSOS_MOCK = {
  1:  { nombre: 'Cardiología Clínica Avanzada',      categoria: 'Cardiología', nivel: 'Avanzado',   descripcion: 'Domina el diagnóstico y tratamiento de las principales patologías cardíacas.', portadaURL: '', esPremium: true  },
  2:  { nombre: 'Neurología para Residentes',         categoria: 'Neurología',  nivel: 'Intermedio', descripcion: 'Fundamentos prácticos del abordaje neurológico.',                              portadaURL: '', esPremium: false },
  5:  { nombre: 'Cirugía General — Técnicas Básicas', categoria: 'Cirugía',     nivel: 'Intermedio', descripcion: 'Técnicas quirúrgicas fundamentales y manejo perioperatorio.',                  portadaURL: '', esPremium: true  },
  11: { nombre: 'Farmacología Clínica Actualizada',   categoria: 'Neurología',  nivel: 'Intermedio', descripcion: 'Mecanismos de acción, interacciones y uso racional de fármacos.',              portadaURL: '', esPremium: true  },
};

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cursoInicial = CURSOS_MOCK[Number(id)];

  const [form, setForm] = useState(cursoInicial || {
    nombre: '', categoria: '', nivel: '', descripcion: '', portadaURL: '', esPremium: false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  if (!cursoInicial) {
    return (
      <div className="bg-[#070F1C] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white font-semibold mb-2">Curso no encontrado</p>
          <button onClick={() => navigate('/admin/cursos')}
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            ← Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (alert) setAlert(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.categoria || !form.nivel) {
      setAlert({ type: 'error', message: 'Nombre, categoría y nivel son obligatorios.' });
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900)); // TODO: api.put(`/cursos/${id}`, form)
      setAlert({ type: 'success', message: 'Curso actualizado correctamente.' });
    } catch {
      setAlert({ type: 'error', message: 'Error al actualizar el curso.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-cyan-400 text-sm font-medium mb-1">Administración · Cursos</p>
          <h1 className="text-3xl font-bold text-white">Editar curso</h1>
          <p className="text-slate-400 text-sm mt-1 truncate">{cursoInicial.nombre}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6">
          {alert && <div className="mb-5"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-2">Nombre del curso *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Categoría *</label>
                <select name="categoria" value={form.categoria} onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Nivel *</label>
                <select name="nivel" value={form.nivel} onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all">
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-2">Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                  rows={4}
                  className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-2">URL de portada</label>
                <input name="portadaURL" value={form.portadaURL} onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all" />
              </div>
            </div>

            {/* Premium toggle */}
            <div className="flex items-center justify-between bg-slate-800/30 border border-white/5 rounded-xl px-5 py-4">
              <div>
                <p className="text-white text-sm font-medium">Contenido Premium</p>
                <p className="text-slate-500 text-xs mt-0.5">Solo usuarios Premium podrán acceder.</p>
              </div>
              <button type="button" onClick={() => setForm(p => ({ ...p, esPremium: !p.esPremium }))}
                className={`relative w-12 h-6 rounded-full transition-all ${form.esPremium ? 'bg-amber-500' : 'bg-slate-700'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.esPremium ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => navigate('/admin/cursos')}
                className="border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-all">
                ← Volver
              </button>
              <button type="submit" disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#070F1C] font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditCourse;