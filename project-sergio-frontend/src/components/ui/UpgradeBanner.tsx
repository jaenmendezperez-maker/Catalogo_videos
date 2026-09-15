// src/components/ui/UpgradeBanner.tsx
// Banner de upgrade para usuarios gratuitos.
// Uso: <UpgradeBanner /> — lo pones en el Dashboard o donde quieras

import { useState } from 'react'
import { Link } from 'react-router-dom'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative overflow-hidden bg-[#fff3d6] border border-[#c9922f]/30 rounded-2xl p-5">
      {/* Glow decorativo */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c9922f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#c9922f]/15 border border-[#c9922f]/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="workspace_premium" className="text-[20px] text-[#c9922f]" />
          </div>
          <div>
            <p className="text-[#0b1c30] font-semibold text-sm mb-1">
              Desbloquea todo el contenido con Premium
            </p>
            <p className="text-[#45464d] text-xs leading-relaxed">
              Tienes acceso a los primeros videos de cada curso. Actualiza para ver el contenido completo de más de 150 cursos clínicos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/precios"
            className="bg-[#c9922f] hover:bg-[#b17f24] text-white font-semibold text-xs px-4 py-2.5 rounded-full transition-all whitespace-nowrap"
          >
            Ver planes
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#76777d] hover:text-[#45464d] transition-colors"
            aria-label="Cerrar"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpgradeBanner