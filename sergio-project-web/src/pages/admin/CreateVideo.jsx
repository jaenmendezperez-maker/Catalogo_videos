import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../../components/ui/Alert';

const CURSOS_MOCK = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada' },
  { id: 2,  nombre: 'Neurología para Residentes'    },
  { id: 3,  nombre: 'Pediatría Esencial'            },
  { id: 4,  nombre: 'Urgencias y Trauma'            },
  { id: 5,  nombre: 'Cirugía General'               },
  { id: 6,  nombre: 'Oncología Clínica Básica'      },
  { id: 11, nombre: 'Farmacología Clínica'          },
];

function CreateVideo() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const cursoIdParam   = searchParams.get('cursoId');

  const [form, setForm] = useState({
    titulo:          '',
    descripcion:     '',
    linkEnlace:      '',
    cursoId:         cursoIdParam || '',
    ordenEnSecuencia: '',
    esPremium:       false,
    oculto:          false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (alert) setAlert(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.titulo || !form.linkEnlace || !form.cursoId) {
      setAlert({ type: 'error', message: 'Título, enlace y curso son obligatorios.' });
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900)); // TODO: api.post('/videos', form)
      setAlert({ type: 'success', message: '¡Video agregado correctamente! Redirigiendo...' });
      setTimeout(() => navigate('/admin/cursos'), 1500);
    } catch {
      setAlert({ type: 'error', message: 'Error al crear el video.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-cyan-400 text-sm font-medium mb-1">Administración</p>
          <h1 className="text-3xl font-bold text-white">Agregar video</h1>
          <p className="text-slate-400 text-sm mt-1">El video se añadirá al curso seleccionado.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6">
          {alert && <div className="mb-5"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Curso */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Curso *</label>
              <select name="cursoId" value={form.cursoId} onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all">
                <option value="">Selecciona un curso</option>
                {CURSOS_MOCK.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Título del video *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange}
                placeholder="Ej: Arritmias supraventriculares"
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all" />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                rows={3} placeholder="Descripción breve del contenido del video..."
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none" />
            </div>

            {/* Link */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Enlace del video *</label>
              <input name="linkEnlace" value={form.linkEnlace} onChange={handleChange}
                placeholder="https://youtube.com/watch?v=... o URL directa del video"
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all" />
              <p className="text-xs text-slate-600 mt-1">Puedes usar YouTube, Vimeo o un enlace directo al archivo de video.</p>
            </div>

            {/* Orden */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Orden en el curso</label>
              <input type="number" name="ordenEnSecuencia" value={form.ordenEnSecuencia} onChange={handleChange}
                placeholder="Ej: 1, 2, 3..."
                min="1"
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all" />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { name: 'esPremium', label: 'Contenido Premium', desc: 'Solo visible para suscriptores Premium.' },
                { name: 'oculto',    label: 'Ocultar video',     desc: 'El video no será visible para los alumnos.' },
              ].map(({ name, label, desc }) => (
                <div key={name} className="flex items-center justify-between bg-slate-800/30 border border-white/5 rounded-xl px-5 py-4">
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, [name]: !p[name] }))}
                    className={`relative w-12 h-6 rounded-full transition-all ${form[name] ? (name === 'esPremium' ? 'bg-amber-500' : 'bg-slate-500') : 'bg-slate-700'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[name] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Botones */}
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
                Guardar video
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateVideo;