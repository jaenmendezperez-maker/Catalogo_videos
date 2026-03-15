import { Link } from 'react-router-dom';

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#06B6D4" />
      <path d="M16 6v20M11 9l10 14M21 9L11 23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
    </svg>
  );
}

const footerLinks = {
  Plataforma: [
    { label: 'Cursos', to: '/cursos' },
    { label: 'Especialidades', to: '/especialidades' },
    { label: 'Instructores', to: '/instructores' },
    { label: 'Precios', to: '/precios' },
  ],
  Aprende: [
    { label: 'Cardiología', to: '/cursos?cat=cardiologia' },
    { label: 'Neurología', to: '/cursos?cat=neurologia' },
    { label: 'Pediatría', to: '/cursos?cat=pediatria' },
    { label: 'Cirugía', to: '/cursos?cat=cirugia' },
  ],
  Empresa: [
    { label: 'Acerca de', to: '/acerca' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contacto', to: '/contacto' },
    { label: 'Trabaja con nosotros', to: '/empleos' },
  ],
  Legal: [
    { label: 'Privacidad', to: '/privacidad' },
    { label: 'Términos de uso', to: '/terminos' },
    { label: 'Cookies', to: '/cookies' },
  ],
};

function Footer() {
  return (
    <footer className="bg-[#040C18] border-t border-white/5">

      {/* CTA strip */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold text-lg">¿Listo para avanzar en tu carrera médica?</h3>
            <p className="text-slate-500 text-sm mt-1">Accede a contenido clínico de alto nivel, en cualquier momento.</p>
          </div>
          <Link
            to="/registro"
            className="flex-shrink-0 bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <LogoIcon />
              <div className="leading-none">
                <span className="text-white font-bold text-base">Medicus</span>
                <span className="text-cyan-400 font-bold text-base">Learn</span>
              </div>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed">
              Educación médica continua para profesionales de la salud.
            </p>

            {/* Redes */}
            <div className="flex gap-2 mt-5">
              {[
                { label: 'Twitter/X', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                { label: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
              ].map(({ label, path }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Columnas de links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} MedicusLearn. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-600 text-xs">Todos los sistemas operativos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;