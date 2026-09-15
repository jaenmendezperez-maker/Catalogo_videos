type AlertType = 'success' | 'error' | 'warning' | 'info'

interface Props {
  type?: AlertType
  message: string
  onClose?: () => void
}

const styles: Record<AlertType, string> = {
  success: 'bg-emerald-500 border-emerald-500/20 text-emerald-400',
  error:   'bg-red-700 border-red-500/20 text-white',
  warning: 'bg-amber-500 border-amber-500/20 text-black',
  info:    'bg-cyan-500 border-cyan-500/20 text-cyan-400',
}

const icons: Record<AlertType, React.ReactNode> = {
  success: <img src="/assets/icons/success.png" alt="Éxito"   className="w-5 h-5" />,
  error:   <img src="/assets/images/exclamation.png" alt="Error" className="w-5 h-5" />,
  warning: <img src="/assets/icons/warning.png" alt="Advertencia" className="w-5 h-5" />,
  info:    <img src="/assets/icons/info.png" alt="Información" className="w-5 h-5" />,
}

function Alert({ type = 'info', message, onClose }: Props) {
  return (
    <div className={`flex items-start gap-3 border px-4 py-3 rounded text-sm ${styles[type]}`}>
        {icons[type]}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Alert