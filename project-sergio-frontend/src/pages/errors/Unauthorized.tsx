import { Link, useNavigate } from 'react-router-dom'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-error-container rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon name="lock" className="text-[32px] text-error" />
        </div>
        <p className="font-headline text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-error to-error/70 mb-4">
          403
        </p>
        <h1 className="font-headline text-headline-lg text-on-surface mb-2">Acceso denegado</h1>
        <p className="font-body text-body-sm text-on-surface-variant mb-8 max-w-sm mx-auto">
          No tienes permisos para ver esta página. Necesitas una cuenta con rol de administrador.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="border border-outline-variant hover:border-outline text-on-surface-variant hover:text-on-surface font-medium px-5 py-2.5 rounded-full font-body text-body-sm transition-all"
          >
            Volver atrás
          </button>
          <Link
            to="/"
            className="bg-secondary hover:bg-on-secondary-container text-on-secondary font-semibold px-5 py-2.5 rounded-full font-body text-body-sm transition-all"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized