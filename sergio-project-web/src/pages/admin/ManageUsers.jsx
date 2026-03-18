import { useState, useMemo } from 'react';
import Modal from '../../components/ui/Modal';

const USUARIOS_MOCK = [
  { id: 1, nombre: 'Valentina Cruz',   correo: 'v.cruz@mail.com',      telefono: '+52 555 111 2233', rol: 'Usuario', estado: true,  esPremium: true,  avatar: 'VC', fechaRegistro: '2024-11-10' },
  { id: 2, nombre: 'Marco Herrera',    correo: 'm.herrera@mail.com',    telefono: '+52 555 222 3344', rol: 'Usuario', estado: true,  esPremium: false, avatar: 'MH', fechaRegistro: '2024-12-02' },
  { id: 3, nombre: 'Paola Ramos',      correo: 'p.ramos@mail.com',      telefono: '+52 555 333 4455', rol: 'Admin',   estado: true,  esPremium: true,  avatar: 'PR', fechaRegistro: '2024-09-15' },
  { id: 4, nombre: 'Luis Paredes',     correo: 'l.paredes@mail.com',    telefono: '+52 555 444 5566', rol: 'Usuario', estado: false, esPremium: false, avatar: 'LP', fechaRegistro: '2025-01-08' },
  { id: 5, nombre: 'Ana Lechuga',      correo: 'a.lechuga@mail.com',    telefono: '+52 555 555 6677', rol: 'Usuario', estado: true,  esPremium: true,  avatar: 'AL', fechaRegistro: '2025-01-20' },
  { id: 6, nombre: 'Hugo Navarro',     correo: 'h.navarro@mail.com',    telefono: '+52 555 666 7788', rol: 'Usuario', estado: true,  esPremium: false, avatar: 'HN', fechaRegistro: '2025-02-01' },
  { id: 7, nombre: 'Admin Test',       correo: 'admin@test.com',        telefono: '+52 555 000 0001', rol: 'Admin',   estado: true,  esPremium: true,  avatar: 'AT', fechaRegistro: '2024-08-01' },
  { id: 8, nombre: 'Usuario Test',     correo: 'usuario@test.com',      telefono: '+52 555 000 0002', rol: 'Usuario', estado: true,  esPremium: false, avatar: 'UT', fechaRegistro: '2024-08-01' },
];

function ManageUsers() {
  const [usuarios, setUsuarios]     = useState(USUARIOS_MOCK);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroRol, setFiltroRol]   = useState('Todos');
  const [modalUser, setModalUser]   = useState(null);   // usuario seleccionado para editar
  const [modalEliminar, setModalEliminar] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [editForm, setEditForm]     = useState({});

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            u.correo.toLowerCase().includes(busqueda.toLowerCase());
      const matchRol = filtroRol === 'Todos' || u.rol === filtroRol;
      return matchBusqueda && matchRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const abrirEditar = (u) => {
    setEditForm({ nombre: u.nombre, correo: u.correo, telefono: u.telefono, rol: u.rol, estado: u.estado });
    setModalUser(u);
  };

  const guardarEdicion = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700)); // TODO: api.put(`/usuarios/${modalUser.id}`, editForm)
    setUsuarios(prev => prev.map(u => u.id === modalUser.id ? { ...u, ...editForm } : u));
    setModalUser(null);
    setLoading(false);
  };

  const toggleEstado = (id) => {
    // TODO: api.patch(`/usuarios/${id}/estado`)
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, estado: !u.estado } : u));
  };

  const eliminarUsuario = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // TODO: api.delete(`/usuarios/${modalEliminar.id}`)
    setUsuarios(prev => prev.filter(u => u.id !== modalEliminar.id));
    setModalEliminar(null);
    setLoading(false);
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-cyan-400 text-sm font-medium mb-1">Administración</p>
          <h1 className="text-3xl font-bold text-white">Gestión de usuarios</h1>
          <p className="text-slate-400 text-sm mt-1">{usuarios.length} usuarios registrados</p>
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
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-[#0D1B2E] border border-white/8 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['Todos', 'Admin', 'Usuario'].map(rol => (
              <button key={rol} onClick={() => setFiltroRol(rol)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  filtroRol === rol
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-[#0D1B2E] text-slate-400 border border-white/5 hover:text-white'
                }`}>
                {rol}
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
                  {['Usuario', 'Rol', 'Plan', 'Estado', 'Registro', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuariosFiltrados.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">

                    {/* Usuario */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{u.nombre}</p>
                          <p className="text-slate-500 text-xs truncate">{u.correo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.rol === 'Admin'
                          ? 'bg-violet-400/10 text-violet-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {u.rol}
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.esPremium
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-white/5 text-slate-500'
                      }`}>
                        {u.esPremium ? '⭐ Premium' : 'Gratuito'}
                      </span>
                    </td>

                    {/* Estado toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleEstado(u.id)}
                        className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
                          u.estado ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          u.estado ? 'left-5' : 'left-0.5'
                        }`} />
                      </button>
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-4">
                      <span className="text-slate-500 text-xs">
                        {new Date(u.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirEditar(u)}
                          className="text-xs text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setModalEliminar(u)}
                          className="text-xs text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
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
                <p className="text-slate-500 text-sm">No se encontraron usuarios.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal editar usuario */}
      <Modal isOpen={!!modalUser} onClose={() => setModalUser(null)} title="Editar usuario">
        {modalUser && (
          <div className="space-y-4">
            {[
              { label: 'Nombre',   name: 'nombre',   type: 'text'  },
              { label: 'Correo',   name: 'correo',   type: 'email' },
              { label: 'Teléfono', name: 'telefono', type: 'tel'   },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-slate-400 mb-2">{label}</label>
                <input
                  type={type}
                  value={editForm[name] || ''}
                  onChange={e => setEditForm({ ...editForm, [name]: e.target.value })}
                  className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Rol</label>
              <select
                value={editForm.rol || 'Usuario'}
                onChange={e => setEditForm({ ...editForm, rol: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-all"
              >
                <option value="Usuario">Usuario</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalUser(null)}
                className="border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-all">
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#070F1C] font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                {loading && (
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

      {/* Modal confirmar eliminar */}
      <Modal isOpen={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar usuario" size="sm">
        {modalEliminar && (
          <div>
            <p className="text-slate-300 text-sm mb-6">
              ¿Estás seguro de que quieres eliminar a <span className="text-white font-semibold">{modalEliminar.nombre}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModalEliminar(null)}
                className="border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm transition-all">
                Cancelar
              </button>
              <button onClick={eliminarUsuario} disabled={loading}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Sí, eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageUsers;