// src/components/ui/UpgradeModal.tsx

import { Link } from 'react-router-dom'
import Modal from './Modal'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

interface UpgradeModalProps {
  isOpen:       boolean
  onClose:      () => void
  videoTitulo?: string
}

const PREMIUM_FEATURES = [
  { icon: 'play_circle',      texto: 'Acceso ilimitado a todos los videos Premium'  },
  { icon: 'menu_book',        texto: 'Más de 150 cursos clínicos de especialidades' },
  { icon: 'download',         texto: 'Descarga para ver sin conexión a internet'    },
  { icon: 'update',           texto: 'Nuevos cursos y actualizaciones cada mes'     },
  { icon: 'stethoscope',      texto: 'Contenido impartido por especialistas activos' },
]

function UpgradeModal({ isOpen, onClose, videoTitulo }: UpgradeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="-mt-4">

        {/* Header visual */}
        <div className="relative bg-[#fff3d6] rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#c9922f]/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#cce5ff]/60 rounded-full blur-2xl" />

          <div className="relative z-10 text-center">
            <div className="w-14 h-14 bg-[#c9922f]/15 border border-[#c9922f]/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Icon name="lock" className="text-[28px] text-[#c9922f]" />
            </div>
            <h3 className="text-[#0b1c30] font-bold text-lg mb-1">Contenido Premium</h3>
            {videoTitulo && (
              <p className="text-[#45464d] text-sm">
                <span className="text-[#c9922f] font-medium">"{videoTitulo}"</span>
                {' '}requiere suscripción Premium
              </p>
            )}
          </div>
        </div>

        {/* Beneficios */}
        <div className="mb-6">
          <p className="text-[#0b1c30] text-sm font-semibold mb-4">Con Premium desbloqueas:</p>
          <div className="space-y-3">
            {PREMIUM_FEATURES.map(({ icon, texto }) => (
              <div key={texto} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#c9922f]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={icon} className="text-[16px] text-[#c9922f]" />
                </div>
                <span className="text-[#45464d] text-sm">{texto}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          <Link
            to="/precios"
            onClick={onClose}
            className="block w-full text-center bg-[#c9922f] hover:bg-[#b17f24] text-white font-semibold py-3 rounded-full text-sm transition-all"
          >
            Ver planes Premium
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-center text-[#76777d] hover:text-[#45464d] py-2.5 text-sm transition-colors cursor-pointer"
          >
            Continuar con plan gratuito
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default UpgradeModal