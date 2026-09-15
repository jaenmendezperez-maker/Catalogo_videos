// src/components/layout/Navbar.tsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

function LogoIcon() {
  return <img src="/assets/icons/herbal.png" alt="Logo de la plataforma" className="w-8 h-8 object-contain" />
}

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

const PUBLIC_NAV_LINKS = [
  { to: '/cursos',         label: 'Cursos'         },
  { to: '/especialidades', label: 'Especialidades' },
  { to: '/instructores',   label: 'Instructores'   },
  { to: '/undefined',      label: 'Recursos'       },
]

const ADMIN_NAV_LINKS = [
  { to: '/admin',           label: 'Dashboard'    },
  { to: '/admin/cursos',    label: 'Cursos'       },
  { to: '/admin/usuarios',  label: 'Usuarios'     },
  { to: '/admin/undefined', label: 'Actividades'  },
]

const USER_DROPDOWN_LINKS = [
  { to: '/dashboard',  label: 'Mi dashboard', icon: 'dashboard' },
  { to: '/mis-cursos', label: 'Mis cursos',   icon: 'menu_book' },
  { to: '/perfil',     label: 'Mi perfil',    icon: 'person'    },
]

const ADMIN_DROPDOWN_LINKS = [
  { to: '/admin',              label: 'Dashboard admin',    icon: 'dashboard'      },
  { to: '/admin/cursos',       label: 'Gestionar cursos',   icon: 'menu_book'      },
  { to: '/admin/usuarios',     label: 'Gestionar usuarios', icon: 'group'          },
]

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isAdmin   = user?.rol === 'Admin'
  const navLinks  = isAdmin && isAuthenticated ? ADMIN_NAV_LINKS      : PUBLIC_NAV_LINKS
  const dropLinks = isAdmin                    ? ADMIN_DROPDOWN_LINKS : USER_DROPDOWN_LINKS

  // ── Logout: limpia el store y fuerza recarga en home ──────
  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMenuOpen(false)
    window.location.href = '/'
  }

  const activeClass   = 'text-on-surface font-bold'
  const inactiveClass = 'text-on-surface-variant hover:text-on-surface transition-colors'

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-sm border border-b border-outline-variant">
      <nav className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-8">

        {/* Logo — admin va a /admin, resto a / */}
        <Link to={isAdmin && isAuthenticated ? '/admin' : '/'} className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-3xl bg-primary-container flex items-center justify-center">
            <LogoIcon />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-headline text-headline-sm tracking-tight text-on-surface">
              Medicus<span className="text-secondary">Learn</span>
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant -mt-0.5">
              CME Precision
            </span>
          </div>
        </Link>

        {/* Links centro — desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `font-label-lg text-label-lg transition-colors ${isActive ? activeClass : inactiveClass}`}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Acciones derecha — desktop */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
                <Icon name="notifications" className="text-[20px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-container transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.nombre ? user.nombre[0].toUpperCase() : <Icon name="person" className="text-[18px]" />
                    )}
                  </div>
                  <span className="font-body text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {user?.nombre?.split(' ')[0]}
                  </span>
                  {isAdmin && (
                    <span className="text-[9px] bg-tertiary-container/40 text-on-tertiary-container border border-on-tertiary-container/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                  <Icon name="expand_more" className={`text-[18px] text-on-surface-variant transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-outline-variant">
                      <p className="font-body text-body-sm font-semibold text-on-surface">{user?.nombre}</p>
                      <p className="text-body-sm text-on-surface-variant">{user?.correo}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {isAdmin ? (
                          <span className="text-label-sm bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded">Administrador</span>
                        ) : user?.esPremium ? (
                          <span className="text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded">Premium</span>
                        ) : (
                          <span className="text-label-sm bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">Plan gratuito</span>
                        )}
                      </div>
                    </div>
                    <div className="py-1">
                      {dropLinks.map(({ to, label, icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
                        >
                          <Icon name={icon} className="text-[18px] text-on-surface-variant" />
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-outline-variant py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-error hover:bg-error-container/40 transition-all"
                      >
                        <Icon name="logout" className="text-[18px]" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2">
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="px-5 py-2.5 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg shadow-md hover:bg-on-secondary-container transition-all flex items-center gap-2"
              >
                <span>Comenzar gratis</span>
              </Link>
            </>
          )}
        </div>

        {/* Hamburguesa mobile */}
        <button
          className="lg:hidden w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} className="text-[22px]" />
        </button>
      </nav>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-surface border-t border-outline-variant px-4 pb-4 pt-2 space-y-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl font-body text-body-sm transition-all ${
                  isActive ? 'text-on-surface font-bold bg-surface-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-outline-variant flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {dropLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="font-body text-body-sm text-on-surface-variant px-3 py-2.5 rounded-xl hover:bg-surface-container hover:text-on-surface transition-all"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="font-body text-body-sm text-error text-left px-3 py-2.5 rounded-xl hover:bg-error-container/40 transition-all mt-1"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="font-body text-body-sm text-on-surface-variant px-3 py-2.5 rounded-xl hover:bg-surface-container">
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="font-label-lg text-label-lg text-on-secondary bg-secondary px-3 py-2.5 rounded-full text-center"
                >
                  Comenzar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar