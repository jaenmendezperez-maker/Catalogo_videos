// src/pages/admin/ManageUsers.tsx
import { useState, useMemo } from 'react'
import { useUsuarios, useUpdateUsuario, useDeleteUsuario } from '../../api/usuariosApi'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import type { UsuarioListadoDto, ActualizarUsuarioDto, AlertState, Rol } from '../../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

// El backend espera rolId numérico, la UI trabaja con el nombre — este es el único lugar que traduce
const ROL_A_ID: Record<Rol, 1 | 2 | 3> = { Admin: 1, Usuario: 2, Educador: 3 }

function ManageUsers() {
  const { data, isLoading, error } = useUsuarios()
  const usuarios = data?.datos ?? []

  const { mutate: updateUsuario, isPending: updatingUser } = useUpdateUsuario()
  const { mutate: deleteUsuario, isPending: deletingUser } = useDeleteUsuario()

  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('Todos')
  const [modalUser, setModalUser] = useState<UsuarioListadoDto | null>(null)
  const [modalEliminar, setModalEliminar] = useState<UsuarioListadoDto | null>(null)
  const [editForm, setEditForm] = useState<{ nombre?: string; correo?: string; telefono?: string; rol?: Rol }>({})
  const [alert, setAlert] = useState<AlertState | null>(null)

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchBusqueda =
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase())
      const matchRol = filtroRol === 'Todos' || u.rol === filtroRol
      return matchBusqueda && matchRol
    })
  }, [usuarios, busqueda, filtroRol])

  const abrirEditar = (u: UsuarioListadoDto) => {
    setEditForm({ nombre: u.nombre, correo: u.correo, telefono: u.telefono ?? '', rol: u.rol })
    setModalUser(u)
  }

  const guardarEdicion = () => {
    if (!modalUser) return
    const payload: ActualizarUsuarioDto = {
      nombre: editForm.nombre,
      correo: editForm.correo,
      telefono: editForm.telefono,
      rolId: editForm.rol ? ROL_A_ID[editForm.rol] : undefined,
    }
    updateUsuario(
      { id: modalUser.id, data: payload },
      {
        onSuccess: () => { setModalUser(null); setAlert({ type: 'success', message: 'Usuario actualizado.' }) },
        onError: (err: any) => {
          const mensaje = err?.response?.data?.mensaje ?? 'Error al actualizar el usuario.'
          setAlert({ type: 'error', message: mensaje })
        },
      }
    )
  }

  const confirmarEliminar = () => {
    if (!modalEliminar) return
    deleteUsuario(modalEliminar.id, {
      onSuccess: () => { setModalEliminar(null); setAlert({ type: 'success', message: 'Usuario eliminado.' }) },
      onError: (err: any) => {
        // 400: es tu propia cuenta o tiene rol Admin. 409: tiene suscripción viva o cobros registrados.
        const mensaje = err?.response?.data?.mensaje ?? 'Error al eliminar el usuario.'
        setModalEliminar(null)
        setAlert({ type: 'error', message: mensaje })
      },
    })
  }

  if (isLoading) return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (error) return (
    <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
      <p className="text-[#ba1a1a]">Error al cargar usuarios. Intenta recargar.</p>
    </div>
  )

  return (
    <div className="bg-[#f8f9ff] min-h-screen">
      <div className="border-b border-[#c6c6cd] bg-[#eff4ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-[#006398] text-sm font-medium mb-1">Administración</p>
          <h1 className="text-3xl font-bold text-[#0b1c30]">Gestión de usuarios</h1>
          <p className="text-[#45464d] text-sm mt-1">{usuarios.length} usuarios en esta página</p>
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
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#e5eeff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/60 rounded pl-11 pr-4 py-3 text-sm outline-none focus:border-[#006398] transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['Todos', 'Admin', 'Usuario', 'Educador'].map((rol) => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                className={`px-4 py-3 rounded text-sm font-medium transition-all inline-block w-20 ${
                  filtroRol === rol
                    ? 'bg-[#cce5ff] text-[#004b73] border border-[#006398]/30'
                    : 'bg-[#e5eeff] text-[#45464d] border border-[#c6c6cd] hover:text-[#0b1c30]'
                }`}
              >
                {rol}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla — sin columna "Estado" */}
        <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c6c6cd]">
                  {['Usuario', 'Rol', 'Plan', 'Acciones'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#45464d] uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-[#dce9ff]/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#006398] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#0b1c30] text-sm font-medium truncate">{u.nombre}</p>
                          <p className="text-[#45464d] text-xs truncate">{u.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded font-medium inline-block w-20 text-center ${
                        u.rol === 'Admin' ? 'bg-[#8b5cf6]/15 text-[#7c4feb]' : 'bg-[#dce9ff] text-[#45464d]'
                      }`}>{u.rol}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded font-medium inline-block w-20 text-center ${
                        u.esPremium ? 'bg-[#85f8c4]/40 text-[#005137]' : 'bg-[#eff4ff] text-[#45464d]'
                      }`}>{u.esPremium ? 'Premium' : 'Gratuito'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirEditar(u)}
                          className="text-xs text-[#45464d] hover:text-[#006398] bg-[#dce9ff] hover:bg-[#cce5ff] px-3 py-1.5 rounded transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setModalEliminar(u)}
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
            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#45464d] text-sm">No se encontraron usuarios.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal editar */}
      <Modal isOpen={!!modalUser} onClose={() => setModalUser(null)} title="Editar usuario">
        {modalUser && (
          <div className="space-y-4">
            {([
              { label: 'Nombre', name: 'nombre', type: 'text' },
              { label: 'Correo', name: 'correo', type: 'email' },
              { label: 'Teléfono', name: 'telefono', type: 'tel' },
            ] as const).map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-[#45464d] mb-2">{label}</label>
                <input
                  type={type}
                  value={(editForm as Record<string, string>)[name] ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, [name]: e.target.value })}
                  className="w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] rounded px-4 py-2.5 text-sm outline-none focus:border-[#006398] transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-[#45464d] mb-2">Rol</label>
              <select
                value={editForm.rol ?? 'Usuario'}
                onChange={(e) => setEditForm({ ...editForm, rol: e.target.value as Rol })}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] rounded px-4 py-2.5 text-sm outline-none focus:border-[#006398] transition-all"
              >
                <option value="Usuario">Usuario</option>
                <option value="Admin">Admin</option>
                <option value="Educador">Educador</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModalUser(null)}
                className="border border-[#c6c6cd] text-[#45464d] hover:text-[#0b1c30] px-5 py-2.5 rounded text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={updatingUser}
                className="bg-[#006398] hover:bg-[#00476e] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded text-sm transition-all flex items-center gap-2"
              >
                {updatingUser && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Guardar cambios
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar usuario" size="sm">
        {modalEliminar && (
          <div>
            <p className="text-[#45464d] text-sm mb-6">
              ¿Eliminar a <span className="text-[#0b1c30] font-semibold">{modalEliminar.nombre}</span>? Esta acción no se puede deshacer.
            </p>
            <p className="text-[#76777d] text-xs mb-6">
              No se puede eliminar si es tu propia cuenta, tiene rol Admin, o tiene una suscripción con cobros registrados.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                className="border border-[#c6c6cd] text-[#45464d] hover:text-[#0b1c30] px-5 py-2.5 rounded text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={deletingUser}
                className="bg-[#ffdad6] hover:bg-[#ffc7c2] text-[#93000a] border border-[#ba1a1a]/30 font-semibold px-5 py-2.5 rounded text-sm transition-all"
              >
                {deletingUser ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManageUsers