// src/pages/admin/CreateCourse.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/ui/Alert';

const CATEGORIAS = ['Cardiología', 'Neurología', 'Pediatría', 'Urgencias', 'Cirugía', 'Oncología', 'Psiquiatría', 'Ginecología'];
const NIVELES    = ['Básico', 'Intermedio', 'Avanzado'];

function CursoForm({ titulo, initialValues = {}, onSubmit, loading, submitLabel = 'Guardar' }) {
  const [form, setForm] = useState({
    nombre:      initialValues.nombre      || '',
    categoria:   initialValues.categoria   || '',
    nivel:       initialValues.nivel       || '',
    descripcion: initialValues.descripcion || '',
    portadaURL:  initialValues.portadaURL  || '',
    esPremium:   initialValues.esPremium   ?? false,
  });
  const [alert, setAlert] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (alert) setAlert(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.categoria || !form.nivel) {
      setAlert({ type: 'error', message: 'Nombre, categoría y nivel son obligatorios.' });
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Nombre */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Nombre del curso *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange}
            placeholder="Ej: Cardiología Clínica Avanzada"
            className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all" />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Categoría *</label>
          <select name="categoria" value={form.categoria} onChange={handleChange}
            className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all">
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Nivel */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Nivel *</label>
          <select name="nivel" value={form.nivel} onChange={handleChange}
            className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all">
            <option value="">Selecciona el nivel</option>
            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Descripción */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
            rows={4} placeholder="Describe el contenido y objetivos del curso..."
            className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none" />
        </div>

        {/* URL portada */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">URL de portada</label>
          <input name="portadaURL" value={form.portadaURL} onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all" />
          <p className="text-xs text-slate-600 mt-1">Cuando tengas tu API lista podrás subir imágenes directamente.</p>
        </div>
      </div>

      {/* Premium toggle */}
      <div className="flex items-center justify-between bg-slate-800/30 border border-white/5 rounded-xl px-5 py-4">
        <div>
          <p className="text-white text-sm font-medium">Contenido Premium</p>
          <p className="text-slate-500 text-xs mt-0.5">Solo los usuarios con suscripción Premium podrán acceder.</p>
        </div>
        <button type="button" onClick={() => setForm(p => ({ ...p, esPremium: !p.esPremium }))}
          className={`relative w-12 h-6 rounded-full transition-all ${form.esPremium ? 'bg-amber-500' : 'bg-slate-700'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.esPremium ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => window.history.back()}
          className="border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#070F1C] font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
          {loading && (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── CreateCourse ───────────────────────────────────────────
export function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900)); // TODO: api.post('/cursos', form)
      setSuccess(true);
      setTimeout(() => navigate('/admin/cursos'), 1500);
    } catch {
      // manejo de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-cyan-400 text-sm font-medium mb-1">Administración</p>
          <h1 className="text-3xl font-bold text-white">Crear nuevo curso</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {success && (
          <Alert type="success" message="¡Curso creado correctamente! Redirigiendo..." />
        )}
        <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6">
          <CursoForm
            titulo="Información del curso"
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Crear curso"
          />
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;