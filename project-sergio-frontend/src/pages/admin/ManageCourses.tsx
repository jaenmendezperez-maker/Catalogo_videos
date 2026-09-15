// src/pages/admin/ManageCourses.tsx
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCursos, useDeleteCurso, useUpdateCurso } from '../../api/cursosApi'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import NewCourseModal from '../../components/admin/NewCourseModal'
import NewVideoModal from '../../components/admin/NewVideoModal'
import type { AlertState } from '../../types'
import type { Curso } from '../../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function ManageCourses() {
  const { data: cursos = [], isLoading, error } = useCursos()
  const { mutate: deleteCurso, isPending: deleting } = useDeleteCurso()
  const { mutate: updateCurso } = useUpdateCurso()

  const [busqueda,      setBusqueda]      = useState('')
  const [filtro,        setFiltro]        = useState('Todos')
  const [modalEliminar, setModalEliminar] = useState<Curso | null>(null)
  const [modalCurso,    setModalCurso]    = useState(false)
  const [videoCursoId,  setVideoCursoId]  = useState<string | null>(null)
  const [alert,         setAlert]         = useState<AlertState | null>(null)

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((c) => {
      const matchBusqueda =
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.categoria.toLowerCase().includes(busqueda.toLowerCase())
      const matchFiltro =
        filtro === 'Todos'      ? true :
        filtro === 'Publicados' ? c.publicado :
        filtro === 'Borradores' ? !c.publicado :
        filtro === 'Premium'    ? c.esPremium : true
      return matchBusqueda && matchFiltro
    })
  }, [cursos, busqueda, filtro])

  const togglePublicado = (c: Curso) => {
    updateCurso(
      { id: c.id, data: { publicado: !c.publicado } },
      { onError: () => setAlert({ type: 'error', message: 'Error al actualizar el curso.' }) }
    )
  }

  const confirmarEliminar = () => {
    if (!modalEliminar) return
    deleteCurso(modalEliminar.id, {
      onSuccess: () => { setModalEliminar(null); setAlert({ type: 'success', message: 'Curso eliminado.' }) },
      onError:   () => setAlert({ type: 'error', message: 'Error al eliminar el curso.' }),
    })
  }

  if (isLoading) return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (error) return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
      <p className="text-[#ba1a1a]">Error al cargar cursos. Intenta recargar.</p>
    </div>
  )

  return (
    <div className="bg-[#f8f9ff] min-h-screen">

      <div className="border-b border-[#c6c6cd] bg-[#eff4ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#006398] text-sm font-medium mb-1">Administración</p>
            <h1 className="text-3xl font-bold text-[#0b1c30]">Gestión de cursos</h1>
            <p className="text-[#45464d] text-sm mt-1">{cursos.length} cursos en total</p>
          </div>
          <button
            onClick={() => setModalCurso(true)}
            className="flex items-center gap-2 bg-[#006398] hover:bg-[#00476e] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <Icon name="add" className="text-[18px]" />
            Nuevo curso
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {alert && (
          <div className="mb-5">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#45464d]" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#e5eeff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/60 rounded pl-11 pr-4 py-3 text-sm outline-none focus:border-[#006398] transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Todos', 'Publicados', 'Borradores', 'Premium'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-3 rounded text-sm font-medium transition-all ${
                  filtro === f
                    ? 'bg-[#cce5ff] text-[#004b73] border border-[#006398]/30'
                    : 'bg-[#e5eeff] text-[#45464d] border border-[#c6c6cd] hover:text-[#0b1c30] cursor-pointer'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c6c6cd]">
                  {['Curso', 'Categoría', 'Alumnos', 'Videos', 'Plan', 'Publicado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#45464d] uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]">
                {cursosFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-[#dce9ff]/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-[#0b1c30] text-sm font-medium truncate max-w-48">{c.nombre}</p>
                        <p className="text-[#45464d] text-xs truncate">{c.instructor}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="text-[#45464d] text-xs">{c.categoria}</span></td>
                    <td className="px-5 py-4"><span className="text-[#0b1c30] text-sm">{c.alumnos?.toLocaleString()}</span></td>
                    <td className="px-5 py-4"><span className="text-[#0b1c30] text-sm">{c.videos}</span></td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded ${c.esPremium ? 'bg-[#8b5cf6]/15 text-[#7c4feb]' : 'bg-[#85f8c4]/40 text-[#005137]'}`}>
                        {c.esPremium ? 'Premium' : 'Gratis'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => togglePublicado(c)}
                        className={`relative w-10 h-5 rounded-full transition-all ${c.publicado ? 'bg-[#069669]' : 'bg-[#c6c6cd]'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${c.publicado ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/cursos/${c.id}/editar`}
                          className="text-xs text-[#45464d] hover:text-[#006398] bg-[#dce9ff] hover:bg-[#cce5ff] px-3 py-1.5 rounded transition-all"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setVideoCursoId(String(c.id))}
                          className="text-xs text-[#45464d] hover:text-[#8b5cf6] bg-[#dce9ff] hover:bg-[#8b5cf6]/10 px-3 py-1.5 rounded transition-all"
                        >
                          + Video
                        </button>
                        <button
                          onClick={() => setModalEliminar(c)}
                          className="text-xs text-[#45464d] hover:text-[#ba1a1a] bg-[#dce9ff] hover:bg-[#ffdad6] px-3 py-1.5 rounded transition-all"
                        >
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
                <p className="text-[#45464d] text-sm">No se encontraron cursos con esos filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal eliminar */}
      <Modal isOpen={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar curso" size="sm">
        {modalEliminar && (
          <div>
            <p className="text-[#45464d] text-sm mb-6">
              ¿Eliminar <span className="text-[#0b1c30] font-semibold">{modalEliminar.nombre}</span>? Se perderán todos sus videos y el progreso de los alumnos.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                className="border border-[#c6c6cd] text-[#45464d] hover:text-[#0b1c30] px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={deleting}
                className="bg-[#ffdad6] hover:bg-[#ffc7c2] text-[#93000a] border border-[#ba1a1a]/30 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <NewCourseModal isOpen={modalCurso} onClose={() => setModalCurso(false)} />
      <NewVideoModal
        isOpen={!!videoCursoId}
        onClose={() => setVideoCursoId(null)}
        cursoIdInicial={videoCursoId ?? ''}
      />
    </div>
  )
}

export default ManageCourses