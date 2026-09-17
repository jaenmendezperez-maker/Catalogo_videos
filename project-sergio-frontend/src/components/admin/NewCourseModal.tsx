// src/components/admin/NewCourseModal.tsx
import { useState } from 'react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import Alert from '../ui/Alert'
import { useCreateCurso } from '../../api/cursosApi'
import type { AlertState } from '../../types'

function Icon({ name, className = '', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
}

const FORM_INICIAL = {
  nombre: '',
  esPremium: false,
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

function NewCourseModal({ isOpen, onClose, onCreated }: Props) {
  const { mutate: createCurso, isPending } = useCreateCurso()
  const [form, setForm] = useState(FORM_INICIAL)
  const [alert, setAlert] = useState<AlertState | null>(null)

  const inputCls = "w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/10 transition-all"

  const reset = () => { setForm(FORM_INICIAL); setAlert(null) }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = () => {
    if (!form.nombre) {
      setAlert({ type: 'warning', message: 'El nombre del curso es obligatorio.' })
      return
    }
    createCurso(form, {
      onSuccess: () => { onCreated?.(); handleClose() },
      onError: () => setAlert({ type: 'error', message: 'Error al crear el curso. Intenta de nuevo.' }),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo curso" size="md">
      {alert && <div className="mb-5"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#45464d] mb-2">
            Nombre del curso <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            type="text" placeholder="Ej. Cardiología Clínica Avanzada"
            value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div className="flex items-center justify-between bg-[#f8f9ff] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon name="workspace_premium" className="text-[18px]" style={{ color: '#8b5cf6' } as React.CSSProperties} />
            <div>
              <p className="text-sm text-[#0b1c30] font-medium">Curso Premium</p>
              <p className="text-xs text-[#45464d]">Hace premium a todos sus videos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, esPremium: !p.esPremium }))}
            className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${form.esPremium ? 'bg-[#069669]' : 'bg-[#c6c6cd]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.esPremium ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={handleClose} className="border border-[#c6c6cd] text-[#45464d] hover:bg-[#eff4ff] px-5 py-2.5 rounded-full text-sm transition-all">
            Cancelar
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
    </Modal>
  )
}

export default NewCourseModal