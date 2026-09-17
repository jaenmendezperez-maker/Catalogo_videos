// src/components/admin/NewVideoModal.tsx
import { useState } from 'react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import Alert from '../ui/Alert'
import { useCursos } from '../../api/cursosApi'
import { useCreateVideo } from '../../api/videosApi'
import type { AlertState } from '../../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const FORM_INICIAL = {
  videoCursoId: '', titulo: '', descripcion: '', categoria: '',
  esPremium: true,   // CrearVideoDto lo exige; por defecto premium, admin decide
  esPublico: false,  // oculto hasta que el admin lo publique — coincide con el default del backend
  archivo: null as File | null,
}

interface Props {
  isOpen: boolean
  onClose: () => void
  cursoIdInicial?: string
  onCreated?: () => void
}

function NewVideoModal({ isOpen, onClose, cursoIdInicial = '', onCreated }: Props) {
  const { data: cursosData, isLoading: loadingCursos } = useCursos()
  const cursos = cursosData?.datos ?? [] // useCursos ahora devuelve PaginatedResponse, no un array directo

  const { mutate: createVideo, isPending } = useCreateVideo()

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({ ...FORM_INICIAL, videoCursoId: cursoIdInicial })
  const [alert, setAlert] = useState<AlertState | null>(null)

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))
  const inputCls = "w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/10 transition-all"

  const reset = () => { setForm({ ...FORM_INICIAL, videoCursoId: cursoIdInicial }); setStep(1); setAlert(null) }
  const handleClose = () => { reset(); onClose() }

  const handleArchivo = (file: File | null) => {
    set('archivo', file)
    if (file) setStep(2)
  }

  const handleSubmit = () => {
    if (!form.videoCursoId || !form.titulo || !form.archivo) {
      setAlert({ type: 'warning', message: 'Completa curso, título y archivo antes de subir.' })
      return
    }
    const payload = new FormData()
    payload.append('videoCursoId', form.videoCursoId)
    payload.append('titulo', form.titulo)
    payload.append('descripcion', form.descripcion)
    payload.append('categoria', form.categoria)
    payload.append('esPremium', String(form.esPremium))
    payload.append('esPublico', String(form.esPublico))
    payload.append('archivo', form.archivo as File)

    createVideo(payload, {
      onSuccess: () => { onCreated?.(); handleClose() },
      onError: () => setAlert({ type: 'error', message: 'Error al subir el video. Intenta de nuevo.' }),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Subir video" size="md">
      {alert && <div className="mb-5"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

      {step === 1 && (
        <label className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[#c6c6cd] hover:border-[#006398] hover:bg-[#006398]/5 rounded-2xl py-16 cursor-pointer transition-all">
          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)} />
          <div className="w-16 h-16 rounded-full bg-[#dce9ff] flex items-center justify-center">
            <Icon name="cloud_upload" className="text-[30px] text-[#006398]" />
          </div>
          <div className="text-center">
            <p className="text-sm text-[#0b1c30] font-medium">Arrastra el video aquí para subirlo</p>
            <p className="text-xs text-[#45464d] mt-1">o <span className="text-[#006398] font-medium">selecciona un archivo</span> de tu equipo</p>
          </div>
          <p className="text-xs text-[#76777d]">MP4, MOV, AVI · máx. 2 GB</p>
        </label>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#f8f9ff] rounded-xl px-4 py-3">
            <div className="w-10 h-10 rounded-lg bg-[#dce9ff] flex items-center justify-center flex-shrink-0">
              <Icon name="movie" className="text-[18px] text-[#006398]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#0b1c30] font-medium truncate">{form.archivo?.name}</p>
              <p className="text-xs text-[#45464d]">{form.archivo ? (form.archivo.size / 1024 / 1024).toFixed(1) : 0} MB</p>
            </div>
            <button onClick={() => handleArchivo(null)} className="text-xs text-[#006398] font-medium flex-shrink-0">
              Cambiar
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">
              Curso <span className="text-[#ba1a1a]">*</span>
            </label>
            {loadingCursos ? (
              <Spinner size="sm" />
            ) : (
              <select value={form.videoCursoId} onChange={(e) => set('videoCursoId', e.target.value)} className={inputCls}>
                <option value="">Selecciona un curso</option>
                {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">
              Título <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text" placeholder="Ej. Introducción a la cardiología"
              value={form.titulo} onChange={(e) => set('titulo', e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">Descripción</label>
            <textarea
              rows={2} placeholder="Breve descripción del contenido..."
              value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#45464d] mb-2">Categoría</label>
            <input
              type="text" placeholder="Ej. Cardiología"
              value={form.categoria} onChange={(e) => set('categoria', e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-[#f8f9ff] rounded-lg px-4 py-2.5">
              <span className="text-sm text-[#45464d]">Premium</span>
              <button
                type="button"
                onClick={() => set('esPremium', !form.esPremium)}
                className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${form.esPremium ? 'bg-[#c9922f]' : 'bg-[#c6c6cd]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.esPremium ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-[#f8f9ff] rounded-lg px-4 py-2.5">
              <span className="text-sm text-[#45464d]">Publicar ya</span>
              <button
                type="button"
                onClick={() => set('esPublico', !form.esPublico)}
                className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${form.esPublico ? 'bg-[#069669]' : 'bg-[#c6c6cd]'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.esPublico ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
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
              {isPending ? <Spinner size="sm" /> : <Icon name="cloud_upload" className="text-[18px]" />}
              {isPending ? 'Subiendo...' : 'Subir video'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default NewVideoModal