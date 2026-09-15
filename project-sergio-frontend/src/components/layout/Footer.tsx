// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom'

function LogoIcon() {
  return <img src="/assets/icons/herbal.png" alt="Logo de la plataforma" className="w-8 h-8 object-contain" />
}


// ── Links del footer ───────────────────────────────────────
// Los marcados con próximamente redirigen a una página placeholder
// hasta que las construyas. No dan 404.

const footerLinks = {
  Plataforma: [
    { label: 'Cursos',         to: '/cursos'         },
    { label: 'Especialidades', to: '/especialidades' },
    { label: 'Instructores',   to: '/instructores'   },
    { label: 'Precios',        to: '/precios'        }, // próximamente
  ],
  Aprende: [
    { label: 'Cardiología', to: '/cursos?categoria=Cardiología' },
    { label: 'Neurología',  to: '/cursos?categoria=Neurología'  },
    { label: 'Pediatría',   to: '/cursos?categoria=Pediatría'   },
    { label: 'Cirugía',     to: '/cursos?categoria=Cirugía'     },
  ],
  Empresa: [
    { label: 'Acerca de',            to: '/acerca'   },
    { label: 'Blog',                 to: '/proxim'   }, // próximamente
    { label: 'Contacto',             to: '/contacto' },
    { label: 'Trabaja con nosotros', to: '/proxim'   }, // próximamente
  ],
  Legal: [
    { label: 'Privacidad',      to: '/privacidad' },
    { label: 'Términos de uso', to: '/terminos'   },
    { label: 'Cookies',         to: '/proxim'     }, // próximamente
  ],
}

function Footer() {

  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant shadow-md mt-auto">


      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 pb-8">

          {/* Marca */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-3xl bg-primary-container flex items-center justify-center">
                <LogoIcon />
              </div>
              <span className="font-headline text-headline-sm tracking-tight text-on-surface">
                Medicus<span className="text-secondary">Learn</span>
              </span>
            </Link>
            <p className="font-body text-body-sm text-on-surface-variant max-w-sm">
              Educación médica continua para profesionales de la salud, con estándares de acreditación ECMEC® / ACCME.
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: '/assets/icons/facebook.png', label: 'Facebook'  },
                { icon: '/assets/icons/social.png',   label: 'Instagram' },
                { icon: '/assets/icons/twitter.png',  label: 'Twitter'   },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="group flex items-center justify-center w-10 h-10 rounded-3xl bg-surface-container border border-outline-variant hover:bg-secondary-fixed hover:border-secondary transition-all duration-300"
                >
                  <img src={social.icon} alt={social.label} className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Columnas de links */}
          {Object.entries(footerLinks).map(([titulo, links]) => (
            <div key={titulo} className="flex flex-col gap-3">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">{titulo}</span>
              {links.map(({ label, to }) => (
                <Link key={label} to={to} className="font-body text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4 font-label-sm text-label-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} MedicusLearn. Todos los derechos reservados. Formación acreditada para profesionales sanitarios.</p>
          <div className="flex items-center gap-1.5">
            <span>Todos los sistemas operativos</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer