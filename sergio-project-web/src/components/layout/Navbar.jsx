import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#06B6D4" />
      <path d="M16 6v20M11 9l10 14M21 9L11 23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
    </svg>
  );
}

const navLinks = [
  { to: '/cursos', label: 'Cursos' },
  { to: '/especialidades', label: 'Especialidades' },
  { to: '/instructores', label: 'Instructores' },
];

// ── Links según rol ────────────────────────────────────────
const USER_MENU_LINKS = [
  { to: '/dashboard',  label: 'Mi dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/mis-cursos', label: 'Mis cursos',   icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/perfil',     label: 'Mi perfil',    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const ADMIN_MENU_LINKS = [
  { to: '/admin',           label: 'Dashboard admin',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/admin/cursos',    label: 'Gestionar cursos',    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/admin/usuarios',  label: 'Gestionar usuarios',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/admin/cursos/nuevo', label: 'Crear curso',      icon: 'M12 4v16m8-8H4' },
];

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isAdmin = user?.rol === 'Admin';
  const menuLinks = isAdmin ? ADMIN_MENU_LINKS : USER_MENU_LINKS;

  const activeClass = 'text-cyan-400';
  const inactiveClass = 'text-slate-400 hover:text-white transition-colors';

  return (
    <header className="sticky top-0 z-50 bg-[#070F1C]/95 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <LogoIcon />
          <div className="leading-none">
            <span className="text-white font-bold text-base tracking-tight">Medicus</span>
            <span className="text-cyan-400 font-bold text-base tracking-tight">Learn</span>
          </div>
        </Link>

        {/* Links centro — desktop */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `text-sm font-medium ${isActive ? activeClass : inactiveClass}`}
            >
              {label}
            </NavLink>
          ))}
          {/* Link extra para admin en la barra principal */}
          {isAdmin && isAuthenticated && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `text-sm font-medium ${isActive ? activeClass : inactiveClass}`}
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Acciones derecha — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Campana */}
              <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
              </button>

              {/* Avatar + menú */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${isAdmin ? 'from-violet-400 to-purple-600' : 'from-cyan-400 to-blue-600'}`}>
                    {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    {user?.nombre?.split(' ')[0]}
                  </span>
                  {/* Badge de rol en el avatar */}
                  {isAdmin && (
                    <span className="text-[10px] bg-violet-400/10 text-violet-400 border border-violet-400/20 px-1.5 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D1B2E] border border-white/8 rounded-2xl shadow-2xl overflow-hidden">

                    {/* Header del dropdown */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{user?.nombre}</p>
                      <p className="text-xs text-slate-500">{user?.correo}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {isAdmin ? (
                          <span className="text-xs bg-violet-400/10 text-violet-400 border border-violet-400/20 px-2 py-0.5 rounded-full">
                            🛡️ Administrador
                          </span>
                        ) : user?.esPremium ? (
                          <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            ⭐ Premium
                          </span>
                        ) : (
                          <span className="text-xs bg-white/5 text-slate-500 px-2 py-0.5 rounded-full">
                            Plan gratuito
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Links según rol */}
                    <div className="py-1">
                      {menuLinks.map(({ to, label, icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                          </svg>
                          {label}
                        </Link>
                      ))}
                    </div>

                    {/* Cerrar sesión */}
                    <div className="border-t border-white/5 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] px-4 py-2 rounded-xl transition-all">
                Comenzar gratis
              </Link>
            </>
          )}
        </div>

        {/* Hamburguesa mobile */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[#070F1C] border-t border-white/5 px-4 pb-4 pt-2 space-y-1">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {/* Links de menú según rol en mobile */}
                {menuLinks.map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                    className="text-sm text-slate-300 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all">
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="text-sm text-red-400 text-left px-3 py-2.5 rounded-xl hover:bg-red-500/5 transition-all mt-1">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="text-sm text-slate-300 px-3 py-2.5 rounded-xl hover:bg-white/5">
                  Iniciar sesión
                </Link>
                <Link to="/registro" onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold bg-cyan-500 text-[#070F1C] px-3 py-2.5 rounded-xl text-center">
                  Comenzar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;