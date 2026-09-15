// src/pages/admin/EditCourse.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUpdateCurso, useCurso } from '../../api/cursosApi'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'
import { CATEGORIAS, NIVELES } from '../../utils/constants'
import type { AlertState, Curso } from '../../types'

function EditCourse() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { data: curso, isLoading, error: fetchError } = useCurso(Number(id))
  const { mutate: updateCurso, isPending } = useUpdateCurso()

  const [form, setForm] = useState({
    nombre:      curso?.nombre      ?? '',
    categoria:   curso?.categoria   ?? '',
    nivel:       curso?.nivel       ?? '',
    descripcion: curso?.descripcion ?? '',
    portadaURL:  curso?.portadaURL  ?? '',
    esPremium:   curso?.esPremium   ?? false,
  })
  const [alert, setAlert] = useState<AlertState | null>(null)

  const [synced, setSynced] = useState(false)
  if (curso && !synced) {
    setForm({
      nombre:      curso.nombre      ?? '',
      categoria:   curso.categoria   ?? '',
      nivel:       curso.nivel       ?? '',
      descripcion: curso.descripcion ?? '',
      portadaURL:  curso.portadaURL  ?? '',
      esPremium:   curso.esPremium   ?? false,
    })
    setSynced(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (alert) setAlert(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.categoria || !form.nivel) {
      setAlert({ type: 'error', message: 'Nombre, categoría y nivel son obligatorios.' })
      return
    }
    updateCurso(
      { id: Number(id), data: form as Partial<Curso> },
      {
        onSuccess: () => setAlert({ type: 'success', message: 'Curso actualizado correctamente.' }),
        onError:   () => setAlert({ type: 'error',   message: 'Error al actualizar el curso.' }),
      }
    )
  }

  const selectCls = "w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#006398] transition-all"

  if (isLoading) return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (fetchError || !curso) return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-[40px] text-[#45464d] mb-3">search_off</span>
        <p className="text-[#0b1c30] font-semibold mb-2">Curso no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/admin/cursos')}>← Volver</Button>
      </div>
    </div>
  )

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <div className="border-b border-[#c6c6cd] bg-[#eff4ff]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-[#006398] text-sm font-medium mb-1">Administración · Cursos</p>
          <h1 className="text-3xl font-bold text-[#0b1c30]">Editar curso</h1>
          <p className="text-[#45464d] text-sm mt-1 truncate">{curso.nombre}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Card>
          {alert && <div className="mb-5"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <Input label="Nombre del curso *" name="nombre" value={form.nombre} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464d] mb-2">Categoría *</label>
                <select name="categoria" value={form.categoria} onChange={handleChange} className={selectCls}>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464d] mb-2">Nivel *</label>
                <select name="nivel" value={form.nivel} onChange={handleChange} className={selectCls}>
                  {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#45464d] mb-2">Descripción</label>
                <textarea
                  name="descripcion" value={form.descripcion} onChange={handleChange} rows={4}
                  className="w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/10 transition-all resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="URL de portada" name="portadaURL" value={form.portadaURL ?? ''}
                  onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            {/* Toggle Premium */}
            <div className="flex items-center justify-between bg-[#eff4ff] border border-[#c6c6cd] rounded-xl px-5 py-4">
              <div>
                <p className="text-[#0b1c30] text-sm font-medium">Contenido Premium</p>
                <p className="text-[#45464d] text-xs mt-0.5">Solo usuarios Premium podrán acceder.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, esPremium: !p.esPremium }))}
                className={`relative w-12 h-6 rounded-full transition-all ${form.esPremium ? 'bg-[#8b5cf6]' : 'bg-[#c6c6cd]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.esPremium ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={() => navigate('/admin/cursos')}>← Volver</Button>
              <Button type="submit" loading={isPending}>Guardar cambios</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default EditCourse