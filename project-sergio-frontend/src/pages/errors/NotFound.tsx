import { Link } from 'react-router-dom'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function NotFound() {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-headline text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-container mb-4">
          404
        </p>
        <h1 className="font-headline text-headline-lg text-on-surface mb-2">Página no encontrada</h1>
        <p className="font-body text-body-sm text-on-surface-variant mb-8 max-w-sm mx-auto">
          La página que buscas no existe o fue movida a otra dirección.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-secondary hover:bg-on-secondary-container text-on-secondary font-semibold px-6 py-3 rounded-full font-body text-body-sm transition-all"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound