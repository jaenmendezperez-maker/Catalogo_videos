// src/pages/admin/AdminDashboard.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import NewCourseModal from '../../components/admin/NewCourseModal'
import NewVideoModal from '../../components/admin/NewVideoModal'

const STATS = [
  {
    valor: 12, label: 'Cursos publicados', link: '/admin/cursos', linkLabel: 'Ver cursos',
    bg: 'bg-[#006398] text-white',
    bar: "bg-[#00507a] hover:bg-[#00405f] transition-colors",
    icon: <svg className="w-14 h-14 text-[#00507a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    valor: 247, label: 'Usuarios activos', link: '/admin/usuarios', linkLabel: 'Ver usuarios',
    bg: 'bg-[#069669] text-white',
    bar: "bg-[#057a55] hover:bg-[#046043] transition-colors",
    icon: <svg className="w-14 h-14 text-[#057a55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    valor: 134, label: 'Videos subidos', link: '/admin/cursos', linkLabel: 'Ver videos',
    bg: 'bg-[#1D5FAD] text-white',
    bar: "bg-[#164A87] hover:bg-[#103868] transition-colors",
    icon: <svg className="w-14 h-14 text-[#164A87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  },
]

const ACCESOS = [
  { label: 'Nuevo curso',        action: 'curso' as const, desc: 'Publicar un curso nuevo'    },
  { label: 'Subir video',        action: 'video' as const, desc: 'Agregar video a un curso'   },
  { label: 'Gestionar usuarios', to: '/admin/usuarios',    desc: 'Ver y editar cuentas'       },
  { label: 'Ver catálogo',       to: '/cursos',             desc: 'Vista pública del catálogo' },
]

const USUARIOS = [
  { id: 1, nombre: 'Valentina Cruz', correo: 'v.cruz@mail.com',    rol: 'Usuario', estado: true,  avatar: 'VC' },
  { id: 2, nombre: 'Marco Herrera',  correo: 'm.herrera@mail.com', rol: 'Usuario', estado: true,  avatar: 'MH' },
  { id: 3, nombre: 'Paola Ramos',    correo: 'p.ramos@mail.com',   rol: 'Admin',   estado: true,  avatar: 'PR' },
  { id: 4, nombre: 'Luis Paredes',   correo: 'l.paredes@mail.com', rol: 'Usuario', estado: false, avatar: 'LP' },
]

const CURSOS = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada', categoria: 'Cardiología', alumnos: 1840, esPremium: true  },
  { id: 2,  nombre: 'Neurología para Residentes',   categoria: 'Neurología',  alumnos: 2310, esPremium: false },
  { id: 11, nombre: 'Farmacología Clínica',         categoria: 'Neurología',  alumnos: 2890, esPremium: true  },
]

const AVATAR_COLORS: Record<string, string> = {
  VC: 'bg-[#069669] text-white',
  MH: 'bg-[#8b5cf6] text-white',
  PR: 'bg-[#006398] text-white',
  LP: 'bg-[#dce9ff] text-[#45464d]',
}

function AdminDashboard() {
  const [modalCurso, setModalCurso] = useState(false)
  const [modalVideo, setModalVideo] = useState(false)

  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#45464d]">

      {/* Header */}
      <div className="border-b border-[#c6c6cd] bg-[#eff4ff]">
        <div className="max-w-7xl mx-auto px-6 py-7 flex items-center justify-between">
          <div>
            <p className="text-[#006398] text-xs font-semibold tracking-widest uppercase mb-1">
              Panel de administración
            </p>
            <h1 className="text-2xl font-semibold text-[#0b1c30]">Dashboard</h1>
          </div>
          <button
            onClick={() => setModalCurso(true)}
            className="flex items-center gap-2 bg-[#006398] hover:bg-[#00476e] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo curso
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ valor, label, link, linkLabel, bg, bar, icon }) => (
            <div key={label} className={`${bg} rounded overflow-hidden shadow-lg`}>
              <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-3xl font-bold text-white leading-none mb-1.5 tabular-nums">{valor}</p>
                  <p className="text-white/80 text-xs font-medium">{label}</p>
                </div>
                <div className="flex-shrink-0 self-end -mb-1">{icon}</div>
              </div>
              <Link to={link} className={`${bar} transition-colors flex items-center justify-between px-5 py-2 text-white hover:text-white text-xs font-medium`}>
                <span>{linkLabel}</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <section>
          <h2 className="text-xs font-semibold text-[#45464d] tracking-widest uppercase mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ACCESOS.map((acceso) =>
              'action' in acceso ? (
                <button
                  key={acceso.label}
                  onClick={() => (acceso.action === 'curso' ? setModalCurso(true) : setModalVideo(true))}
                  className="text-left bg-[#e5eeff] border border-[#c6c6cd] hover:border-[#006398] rounded p-5 group transition-colors"
                >
                  <p className="text-[#0b1c30] text-sm font-semibold group-hover:text-[#006398] transition-colors mb-1">
                    {acceso.label}
                  </p>
                  <p className="text-[#45464d] text-xs">{acceso.desc}</p>
                </button>
              ) : (
                <Link
                  key={acceso.label}
                  to={acceso.to}
                  className="bg-[#e5eeff] border border-[#c6c6cd] hover:border-[#006398] rounded p-5 group transition-colors"
                >
                  <p className="text-[#0b1c30] text-sm font-semibold group-hover:text-[#006398] transition-colors mb-1">
                    {acceso.label}
                  </p>
                  <p className="text-[#45464d] text-xs">{acceso.desc}</p>
                </Link>
              )
            )}
          </div>
        </section>

        {/* Tablas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Últimos usuarios */}
          <section className="bg-[#e5eeff] border border-[#c6c6cd] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#c6c6cd] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0b1c30]">Últimos usuarios</h2>
              <Link to="/admin/usuarios" className="text-xs text-[#006398] hover:text-[#00476e] transition-colors">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-[#c6c6cd]">
              {USUARIOS.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded ${AVATAR_COLORS[u.avatar]} flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${u.estado ? 'text-[#0b1c30]' : 'text-[#45464d]'}`}>
                      {u.nombre}
                    </p>
                    <p className="text-[#45464d] text-xs truncate">{u.correo}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`w-16 text-center text-[10px] font-semibold px-2 py-1 rounded border ${
                      u.rol === 'Admin'
                        ? 'bg-[#8b5cf6] text-white border-[#7c4feb]'
                        : 'bg-[#dce9ff] text-[#0b1c30] border-[#c6c6cd]'
                    }`}>
                      {u.rol}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.estado ? 'bg-[#069669]' : 'bg-[#c6c6cd]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cursos recientes */}
          <section className="bg-[#e5eeff] border border-[#c6c6cd] rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-[#c6c6cd] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0b1c30]">Cursos recientes</h2>
              <Link to="/admin/cursos" className="text-xs text-[#006398] hover:text-[#00476e] transition-colors">
                Ver todos
              </Link>
            </div>
            <div className="divide-y divide-[#c6c6cd]">
              {CURSOS.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0b1c30] truncate">{c.nombre}</p>
                    <p className="text-xs text-[#45464d]">
                      {c.categoria}
                      <span className="mx-1.5 text-[#c6c6cd]">·</span>
                      {c.alumnos.toLocaleString()} alumnos
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.esPremium && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded bg-[#8b5cf6] text-white">
                        PRO
                      </span>
                    )}
                    <Link
                      to={`/admin/cursos/${c.id}/editar`}
                      className="text-xs text-[#45464d] hover:text-[#006398] transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <NewCourseModal isOpen={modalCurso} onClose={() => setModalCurso(false)} />
      <NewVideoModal isOpen={modalVideo} onClose={() => setModalVideo(false)} />
    </div>
  )
}

export default AdminDashboard