interface Props {
  children: React.ReactNode
  title?: string
  subtitle?: string
  hoverable?: boolean
  className?: string
}

function Card({ children, title, subtitle, hoverable = false, className = '' }: Props) {
  return (
    <div className={`bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden
      ${hoverable ? 'hover:border-secondary/30 hover:shadow-lg transition-all' : ''}
      ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-outline-variant">
          {title    && <h3 className="font-headline text-headline-sm text-on-surface">{title}</h3>}
          {subtitle && <p className="font-body text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export default Card