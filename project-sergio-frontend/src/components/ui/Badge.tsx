type Variant = 'default' | 'premium' | 'free' | 'admin' | 'new'

interface Props {
  children?: React.ReactNode
  variant?: Variant
  nivel?: string
}

const nivelMap: Record<string, string> = {
  'Básico':     'bg-tertiary-fixed/20 text-on-tertiary-container border-tertiary-fixed/40',
  'Intermedio': 'bg-[#c9922f]/10 text-[#c9922f] border-[#c9922f]/20',
  'Avanzado':   'bg-error-container text-on-error-container border-error/20',
}

const variants: Record<Variant, string> = {
  default: 'bg-surface-container text-on-surface-variant border-transparent',
  premium: 'bg-tertiary-fixed/20 text-on-tertiary-container border-tertiary-fixed/40',
  free:    'bg-secondary-fixed/40 text-on-secondary-fixed-variant border-secondary-fixed',
  admin:   'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
  new:     'bg-secondary-container/30 text-on-secondary-container border-secondary-container/50',
}

function Badge({ children, variant = 'default', nivel }: Props) {
  const cls = nivel
    ? nivelMap[nivel] ?? 'bg-surface-container text-on-surface-variant border-transparent'
    : variants[variant]

  return (
    <span className={`inline-flex font-label-sm text-label-sm px-2.5 py-0.5 rounded-full border ${cls}`}>
      {nivel ?? children}
    </span>
  )
}

export default Badge