// src/pages/Contacto.tsx
import { useState } from 'react'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

interface FormState { nombre: string; correo: string; asunto: string; mensaje: string }

const CANALES = [
  { icon: 'mail',          titulo: 'Email',        desc: 'hola@medicuslearn.com',     sub: 'Respuesta en menos de 24h' },
  { icon: 'support_agent', titulo: 'Soporte',      desc: 'soporte@medicuslearn.com',  sub: 'Para problemas técnicos'   },
  { icon: 'groups',        titulo: 'Instructores', desc: 'docentes@medicuslearn.com', sub: 'Para ser parte del equipo' },
]

function Contacto() {
  const [form, setForm]       = useState<FormState>({ nombre: '', correo: '', asunto: '', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000)) // TODO: api.post('/contacto', form)
    setLoading(false)
    setSuccess(true)
  }

  const inputCls = "w-full bg-[#eff4ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/60 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#006398] focus:bg-[#ffffff] focus:ring-2 focus:ring-[#006398]/15 transition-all"

  return (
    <div className="bg-[#f8f9ff]">

      {/* ── Header: asimétrico, sin badge, alineado a la izquierda ── */}
      <div className="border-b border-[#c6c6cd]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7">
            <p className="text-[#006398] text-sm font-semibold mb-3">Estamos aquí para ayudarte</p>
            <h1 className="text-4xl font-bold text-[#0b1c30]">Contáctanos</h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-[#45464d] text-base leading-relaxed">
              ¿Tienes preguntas sobre los cursos, tu cuenta o quieres ser instructor? Escríbenos.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info de contacto — lista, no cards con emoji flotando */}
          <div className="space-y-6">
            {CANALES.map(({ icon, titulo, desc, sub }, i) => (
              <div key={titulo} className={`flex items-start gap-3 ${i > 0 ? 'pt-6 border-t border-[#c6c6cd]' : ''}`}>
                <Icon name={icon} className="text-[20px] text-[#006398] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#0b1c30] text-sm font-semibold">{titulo}</p>
                  <p className="text-[#006398] text-xs mt-0.5">{desc}</p>
                  <p className="text-[#45464d] text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 bg-[#e5eeff] border border-[#c6c6cd] rounded-2xl p-6">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-14 h-14 bg-[#85f8c4]/40 rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="check_circle" className="text-[28px] text-[#069669]" />
                </div>
                <h3 className="text-[#0b1c30] font-bold text-lg mb-2">¡Mensaje enviado!</h3>
                <p className="text-[#45464d] text-sm max-w-xs">
                  Gracias por escribirnos. Te responderemos en las próximas 24 horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[#45464d] mb-2">Nombre completo</label>
                    <input
                      name="nombre" value={form.nombre} onChange={handleChange} required
                      placeholder="Dr. Juan Pérez"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#45464d] mb-2">Correo electrónico</label>
                    <input
                      name="correo" type="email" value={form.correo} onChange={handleChange} required
                      placeholder="tu@correo.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#45464d] mb-2">Asunto</label>
                  <select name="asunto" value={form.asunto} onChange={handleChange} required className={inputCls}>
                    <option value="">Selecciona un asunto</option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="cursos">Pregunta sobre cursos</option>
                    <option value="instructor">Quiero ser instructor</option>
                    <option value="facturacion">Facturación y pagos</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#45464d] mb-2">Mensaje</label>
                  <textarea
                    name="mensaje" value={form.mensaje} onChange={handleChange} required
                    rows={5} placeholder="Cuéntanos en qué podemos ayudarte..."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#006398] hover:bg-[#00476e] disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </>
                  ) : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacto