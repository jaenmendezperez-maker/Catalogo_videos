import { Link } from 'react-router-dom';

const STATS = [
  { valor: 12,    label: 'Cursos publicados',  icono: '📚', color: 'bg-cyan-500/10',    acento: 'text-cyan-400',    link: '/admin/cursos'   },
  { valor: 247,   label: 'Usuarios activos',   icono: '👥', color: 'bg-violet-500/10',  acento: 'text-violet-400',  link: '/admin/usuarios' },
  { valor: 134,   label: 'Videos subidos',     icono: '🎬', color: 'bg-blue-500/10',    acento: 'text-blue-400',    link: '/admin/cursos'   },
  { valor: '94%', label: 'Satisfacción',       icono: '⭐', color: 'bg-amber-500/10',   acento: 'text-amber-400',   link: null              },
];

const ACCESOS_RAPIDOS = [
  { label: 'Nuevo curso',    to: '/admin/cursos/nuevo',  icono: '📖', desc: 'Publicar un curso nuevo'       },
  { label: 'Subir video',    to: '/admin/videos/nuevo',  icono: '🎬', desc: 'Agregar video a un curso'      },
  { label: 'Gestionar usuarios', to: '/admin/usuarios',  icono: '👥', desc: 'Ver y editar cuentas'          },
  { label: 'Ver catálogo',   to: '/cursos',              icono: '🔍', desc: 'Vista pública del catálogo'    },
];

const ULTIMOS_USUARIOS = [
  { id: 1, nombre: 'Valentina Cruz',  correo: 'v.cruz@mail.com',    rol: 'Usuario',  estado: true,  avatar: 'VC' },
  { id: 2, nombre: 'Marco Herrera',   correo: 'm.herrera@mail.com', rol: 'Usuario',  estado: true,  avatar: 'MH' },
  { id: 3, nombre: 'Paola Ramos',     correo: 'p.ramos@mail.com',   rol: 'Admin',    estado: true,  avatar: 'PR' },
  { id: 4, nombre: 'Luis Paredes',    correo: 'l.paredes@mail.com', rol: 'Usuario',  estado: false, avatar: 'LP' },
];

const ULTIMOS_CURSOS = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada', categoria: 'Cardiología', alumnos: 1840, icono: '🫀', esPremium: true  },
  { id: 2,  nombre: 'Neurología para Residentes',    categoria: 'Neurología',  alumnos: 2310, icono: '🧠', esPremium: false },
  { id: 11, nombre: 'Farmacología Clínica',          categoria: 'Neurología',  alumnos: 2890, icono: '💊', esPremium: true  },
];

function AdminDashboard() {
  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cyan-400 text-sm font-medium mb-1">Panel de administración</p>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/cursos/nuevo"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo curso
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ valor, label, icono, color, acento, link }) => {
            const content = (
              <div className={`bg-[#0D1B2E] border border-white/5 rounded-2xl p-5 flex items-center gap-4 ${link ? 'hover:border-cyan-500/20 transition-all' : ''}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
                  {icono}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${acento} leading-none mb-1`}>{valor}</p>
                  <p className="text-slate-500 text-xs">{label}</p>
                </div>
              </div>
            );
            return link
              ? <Link key={label} to={link}>{content}</Link>
              : <div key={label}>{content}</div>;
          })}
        </div>

        {/* Accesos rápidos */}
        <section>
          <h2 className="text-white font-bold text-base mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ACCESOS_RAPIDOS.map(({ label, to, icono, desc }) => (
              <Link key={label} to={to}
                className="bg-[#0D1B2E] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-5 group transition-all">
                <div className="text-3xl mb-3">{icono}</div>
                <p className="text-white text-sm font-semibold group-hover:text-cyan-400 transition-colors mb-1">{label}</p>
                <p className="text-slate-500 text-xs">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Últimos usuarios */}
          <section className="bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Últimos usuarios</h2>
              <Link to="/admin/usuarios" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Ver todos</Link>
            </div>
            <div className="divide-y divide-white/5">
              {ULTIMOS_USUARIOS.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{u.nombre}</p>
                    <p className="text-slate-500 text-xs truncate">{u.correo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.rol === 'Admin' ? 'bg-violet-400/10 text-violet-400' : 'bg-slate-700 text-slate-400'}`}>
                      {u.rol}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${u.estado ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cursos recientes */}
          <section className="bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Cursos recientes</h2>
              <Link to="/admin/cursos" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Ver todos</Link>
            </div>
            <div className="divide-y divide-white/5">
              {ULTIMOS_CURSOS.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#070F1C] flex items-center justify-center text-xl flex-shrink-0">
                    {c.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{c.nombre}</p>
                    <p className="text-slate-500 text-xs">{c.categoria} · {c.alumnos.toLocaleString()} alumnos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.esPremium && (
                      <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">Premium</span>
                    )}
                    <Link to={`/admin/cursos/${c.id}/editar`}
                      className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;