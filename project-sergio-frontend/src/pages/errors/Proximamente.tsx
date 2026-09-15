import { Link } from 'react-router-dom'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function Proximamente() {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-5">🚧</div>
        <h1 className="font-headline text-headline-lg text-on-surface mb-2">Próximamente</h1>
        <p className="font-body text-body-sm text-on-surface-variant mb-8 max-w-xs mx-auto">
          Esta sección está en construcción. Vuelve pronto para ver el contenido.
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

export default Proximamente