// src/components/admin/NewCourseModal.tsx
import { useState } from 'react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import Alert from '../ui/Alert'
import { useCreateCurso } from '../../api/cursosApi'
import type { AlertState } from '../../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const CATEGORIAS = [
  'Cardiología', 'Neurología', 'Pediatría', 'Cirugía', 'Urgencias',
  'Farmacología', 'Radiología', 'Ginecología', 'Psiquiatría', 'Otra',
]
const NIVELES = ['Básico', 'Intermedio', 'Avanzado']

const FORM_INICIAL = {
  nombre: '', categoria: '', nivel: 'Básico', instructor: '', descripcion: '',
  esPremium: false, publicado: false, portada: null as File | null,
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

function NewCourseModal({ isOpen, onClose, onCreated }: Props) {
  const { mutate: createCurso, isPending } = useCreateCurso()
  const [step, setStep]   = useState<1 | 2>(1)
  const [form, setForm]   = useState(FORM_INICIAL)
  const [alert, setAlert] = useState<AlertState | null>(null)

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  const inputCls = "w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/10 transition-all"

  const reset = () => { setForm(FORM_INICIAL); setStep(1); setAlert(null) }
  const handleClose = () => { reset(); onClose() }

  const irAPaso2 = () => {
    if (!form.nombre || !form.categoria || !form.instructor) {
      setAlert({ type: 'warning', message: 'Completa nombre, categoría e instructor antes de continuar.' })
      return
    }
    setAlert(null)
    setStep(2)
  }

  const handleSubmit = () => {
    const payload = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null) payload.append(k, v instanceof File ? v : String(v))
    })
    createCurso(payload, {
      onSuccess: () => { onCreated?.(); handleClose() },
      onError:   () => setAlert({ type: 'error', message: 'Error al crear el curso. Intenta de nuevo.' }),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo curso" size="md">


      {alert && <div className="mb-5"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

      {/* ── Paso 1: Información ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">
              Nombre del curso <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text" placeholder="Ej. Cardiología Clínica Avanzada"
              value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#45464d] mb-2">
                Categoría <span className="text-[#ba1a1a]">*</span>
              </label>
              <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className={inputCls}>
                <option value="">Selecciona</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#45464d] mb-2">Nivel</label>
              <select value={form.nivel} onChange={(e) => set('nivel', e.target.value)} className={inputCls}>
                {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">
              Instructor <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text" placeholder="Ej. Dr. Alejandro Vega"
              value={form.instructor} onChange={(e) => set('instructor', e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">Descripción</label>
            <textarea
              rows={3} placeholder="Describe el contenido y objetivos del curso..."
              value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleClose} className="border border-[#c6c6cd] text-[#45464d] hover:bg-[#eff4ff] px-5 py-2.5 rounded-full text-sm transition-all">
              Cancelar
            </button>
            <button onClick={irAPaso2} className="flex items-center gap-1.5 bg-[#006398] hover:bg-[#00476e] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ── Paso 2: Portada y opciones ── */}
      {step === 2 && (
        <div className="space-y-5">
          <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 cursor-pointer transition-all ${
            form.portada ? 'border-[#006398] bg-[#cce5ff]/30' : 'border-[#c6c6cd] hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5'
          }`}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => set('portada', e.target.files?.[0] ?? null)} />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${form.portada ? 'bg-[#006398]' : 'bg-[#dce9ff]'}`}>
              <Icon name={form.portada ? 'check' : 'add_photo_alternate'} className={`text-[22px] ${form.portada ? 'text-white' : 'text-[#006398]'}`} />
            </div>
            {form.portada ? (
              <p className="text-sm text-[#0b1c30] font-medium">{form.portada.name}</p>
            ) : (
              <p className="text-sm text-[#45464d]">Arrastra la imagen o <span className="text-[#006398] font-medium">selecciona un archivo</span></p>
            )}
          </label>

          <div className="space-y-3">
            {[
              { key: 'esPremium', icon: 'workspace_premium', label: 'Curso Premium', desc: 'Solo con suscripción de pago', color: '#8b5cf6' },
              { key: 'publicado', icon: 'visibility',        label: 'Publicar ahora', desc: 'Visible en el catálogo al guardar', color: '#069669' },
            ].map(({ key, icon, label, desc, color }) => (
              <div key={key} className="flex items-center justify-between bg-[#f8f9ff] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon name={icon} className="text-[18px]" style={{ color } as React.CSSProperties} />
                  <div>
                    <p className="text-sm text-[#0b1c30] font-medium">{label}</p>
                    <p className="text-xs text-[#45464d]">{desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set(key, !form[key as keyof typeof form])}
                  className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${form[key as keyof typeof form] ? 'bg-[#069669]' : 'bg-[#c6c6cd]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key as keyof typeof form] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[#45464d] hover:text-[#0b1c30] text-sm transition-all">
              <Icon name="arrow_back" className="text-[16px]" /> Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 bg-[#006398] hover:bg-[#00476e] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all"
            >
              {isPending ? <Spinner size="sm" /> : <Icon name="save" className="text-[18px]" />}
              {isPending ? 'Guardando...' : 'Crear curso'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default NewCourseModal