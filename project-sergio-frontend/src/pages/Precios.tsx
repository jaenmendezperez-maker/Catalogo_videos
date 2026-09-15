// src/pages/Precios.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

// ── Datos de planes ────────────────────────────────────────

const FEATURES_FREE = [
  { texto: 'Acceso a cursos gratuitos',           incluido: true  },
  { texto: 'Videos de muestra de cursos Premium', incluido: true  },
  { texto: 'Progreso guardado automáticamente',   incluido: true  },
  { texto: 'Acceso desde cualquier dispositivo',  incluido: true  },
  { texto: 'Cursos Premium completos',            incluido: false },
  { texto: 'Nuevos cursos cada mes',               incluido: false },
  { texto: 'Descarga para ver sin internet',       incluido: false },
]

const FEATURES_PREMIUM = [
  { texto: 'Todo lo del plan gratuito',                   incluido: true },
  { texto: 'Acceso ilimitado a todos los cursos Premium', incluido: true },
  { texto: 'Nuevos cursos y actualizaciones cada mes',    incluido: true },
  { texto: 'Descarga para ver sin internet',              incluido: true },
  { texto: 'Soporte prioritario',                          incluido: true },
  { texto: 'Acceso anticipado a nuevos contenidos',        incluido: true },
]

const FAQ = [
  { pregunta: '¿Puedo cancelar cuando quiera?',
    respuesta: 'Sí. Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. No hay contratos ni penalizaciones.' },
  { pregunta: '¿Qué pasa con mi progreso si cancelo?',
    respuesta: 'Tu progreso en cursos gratuitos se mantiene siempre. Si cancelas Premium, mantienes el acceso hasta el final del período pagado.' },
  { pregunta: '¿Los precios incluyen impuestos?',
    respuesta: 'Los precios que se muestran no incluyen impuestos locales. El total final se mostrará antes de confirmar tu suscripción.' },
  { pregunta: '¿Hay descuento para instituciones de salud?',
    respuesta: 'Sí, ofrecemos planes especiales para hospitales, clínicas y universidades. Contáctanos para obtener una cotización personalizada.' },
  { pregunta: '¿Cómo puedo pagar?',
    respuesta: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, AmEx) y otros métodos de pago locales según tu país.' },
]

function PrecioCard({
  plan, precio, periodo, descripcion, features, destacado, ctaLabel, ctaTo,
}: {
  plan: string; precio: string; periodo?: string; descripcion: string
  features: { texto: string; incluido: boolean }[]
  destacado?: boolean; ctaLabel: string; ctaTo: string
}) {
  return (
    <div className={`relative flex flex-col rounded overflow-hidden transition-all duration-300 ${
      destacado
        ? 'bg-[#e5eeff] border-2 border-[#006398]'
        : 'bg-[#eff4ff] border border-[#c6c6cd]'
    }`}>

      {destacado && (
        <div className="bg-[#006398] text-white text-xs font-bold text-center py-2 tracking-wider uppercase">
          Más popular
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6">
          <p className="text-[#45464d] text-sm font-medium mb-2">{plan}</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-black text-[#0b1c30]">{precio}</span>
            {periodo && <span className="text-[#45464d] text-sm mb-1">/ {periodo}</span>}
          </div>
          <p className="text-[#45464d] text-sm leading-relaxed">{descripcion}</p>
        </div>

        <div className="space-y-3 flex-1 mb-8">
          {features.map(({ texto, incluido }) => (
            <div key={texto} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                incluido ? 'bg-[#cce5ff]' : 'bg-[#dce9ff]'
              }`}>
                <Icon name={incluido ? 'check' : 'close'} className={`text-[12px] ${incluido ? 'text-[#006398]' : 'text-[#76777d]'}`} />
              </div>
              <span className={`text-sm ${incluido ? 'text-[#0b1c30]' : 'text-[#76777d]'}`}>{texto}</span>
            </div>
          ))}
        </div>

        <Link
          to={ctaTo}
          className={`block w-full text-center font-semibold py-3.5 rounded-full text-sm transition-all ${
            destacado
              ? 'bg-[#006398] hover:bg-[#00476e] text-white'
              : 'bg-[#ffffff] hover:bg-[#dce9ff] text-[#0b1c30] border border-[#c6c6cd]'
          }`}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}

// ── Página ─────────────────────────────────────────────────

function Precios() {
  const { isAuthenticated, user } = useAuthStore()
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  const yaPremium = isAuthenticated && user?.esPremium

  return (
    <div className="bg-[#f8f9ff]">

      {/* Header — asimétrico, sin badge con punto animado ni gradiente en texto */}
      <div className="border-b border-[#c6c6cd]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {yaPremium ? (
            <>
              <div className="md:col-span-7">
                <p className="text-[#8b5cf6] text-sm font-semibold mb-3">Tu plan actual</p>
                <h1 className="text-4xl font-bold text-[#0b1c30]">Ya tienes Premium</h1>
              </div>
              <div className="md:col-span-5">
                <p className="text-[#45464d] text-base leading-relaxed mb-4">
                  Tienes acceso completo a todo el contenido de MedicusLearn.
                </p>
                <Link to="/cursos" className="inline-flex items-center gap-1.5 text-[#006398] font-medium text-sm">
                  Explorar cursos <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-7">
                <p className="text-[#006398] text-sm font-semibold mb-3">Planes y precios</p>
                <h1 className="text-4xl font-bold text-[#0b1c30] leading-tight">El plan perfecto para tu carrera médica.</h1>
              </div>
              <div className="md:col-span-5">
                <p className="text-[#45464d] text-base leading-relaxed">
                  Empieza gratis y actualiza cuando quieras. Sin contratos, sin complicaciones.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* ── Cards de planes ── */}
        {!yaPremium && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 items-start">
            <PrecioCard
              plan="Gratuito"
              precio="$0"
              descripcion="Perfecto para comenzar. Accede a una muestra del contenido sin costo."
              features={FEATURES_FREE}
              ctaLabel={isAuthenticated ? 'Tu plan actual' : 'Crear cuenta gratis'}
              ctaTo={isAuthenticated ? '/cursos' : '/registro'}
            />
            <PrecioCard
              plan="Premium"
              precio="Próximamente"
              descripcion="Acceso ilimitado a toda la plataforma. La mejor inversión en tu desarrollo profesional."
              features={FEATURES_PREMIUM}
              destacado
              ctaLabel="Notificarme cuando esté disponible"
              ctaTo="/contacto"
            />
          </div>
        )}

        {/* ── Comparativa detallada ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#0b1c30] mb-8">Comparativa completa</h2>
          <div className="bg-[#eff4ff] border border-[#c6c6cd] rounded overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c6c6cd]">
                  <th className="text-left text-[#45464d] text-xs font-semibold uppercase tracking-wider px-6 py-4 w-1/2">Característica</th>
                  <th className="text-center text-[#45464d] text-xs font-semibold uppercase tracking-wider px-6 py-4">Gratuito</th>
                  <th className="text-center text-[#006398] text-xs font-semibold uppercase tracking-wider px-6 py-4">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]">
                {[
                  { feature: 'Cursos gratuitos completos',            free: true,  premium: true   },
                  { feature: 'Videos de muestra en cursos Premium',   free: true,  premium: true   },
                  { feature: 'Cursos Premium completos',              free: false, premium: true   },
                  { feature: 'Cantidad de cursos disponibles',        free: '~50', premium: '200+' },
                  { feature: 'Nuevos cursos mensuales',                free: false, premium: true   },
                  { feature: 'Descarga para ver sin internet',         free: false, premium: true   },
                  { feature: 'Acceso anticipado a nuevos contenidos',  free: false, premium: true   },
                  { feature: 'Planes para instituciones',              free: false, premium: true   },
                ].map(({ feature, free, premium }) => (
                  <tr key={feature} className="hover:bg-[#dce9ff]/40 transition-colors">
                    <td className="px-6 py-3.5 text-[#0b1c30] text-sm">{feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      {typeof free === 'string' ? (
                        <span className="text-[#45464d] text-sm">{free}</span>
                      ) : free ? (
                        <Icon name="check" className="text-[18px] text-[#069669]" />
                      ) : (
                        <Icon name="close" className="text-[18px] text-[#c6c6cd]" />
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {typeof premium === 'string' ? (
                        <span className="text-[#006398] text-sm font-medium">{premium}</span>
                      ) : premium ? (
                        <Icon name="check" className="text-[18px] text-[#006398]" />
                      ) : (
                        <Icon name="close" className="text-[18px] text-[#c6c6cd]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#0b1c30] mb-8">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-[#eff4ff] border border-[#c6c6cd] rounded overflow-hidden">
                <button
                  onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#dce9ff]/40 transition-all"
                >
                  <span className="text-[#0b1c30] text-sm font-medium">{item.pregunta}</span>
                  <Icon name="expand_more" className={`text-[18px] text-[#45464d] transition-transform flex-shrink-0 ml-4 ${faqAbierto === i ? 'rotate-180' : ''}`} />
                </button>
                {faqAbierto === i && (
                  <div className="px-6 pb-4 border-t border-[#c6c6cd] pt-3">
                    <p className="text-[#45464d] text-sm leading-relaxed">{item.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Nota para instituciones: en línea, no card centrada con emoji ── */}
        <div className="pt-8 border-t border-[#c6c6cd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Icon name="local_hospital" className="text-[20px] text-[#45464d] mt-0.5" />
            <div>
              <p className="text-[#0b1c30] text-sm font-semibold">¿Eres una institución de salud?</p>
              <p className="text-[#45464d] text-xs mt-0.5 max-w-md">
                Ofrecemos planes especiales para hospitales, clínicas y universidades.
              </p>
            </div>
          </div>
          <Link
            to="/contacto"
            className="flex-shrink-0 bg-[#ffffff] hover:bg-[#dce9ff] border border-[#c6c6cd] text-[#0b1c30] text-sm font-medium px-5 py-2.5 rounded-full transition-all"
          >
            Contactar para precio institucional
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Precios