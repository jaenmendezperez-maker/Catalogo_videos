// src/pages/auth/Registro.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/authApi'
import useAuthStore from '../../store/useAuthStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { passwordStrength } from '../../utils/validators'

function LogoIcon() {
  return <img src="/assets/icons/herbal.png" alt="Logo de la plataforma" className="w-8 h-8 object-contain" />
}

const BENEFICIOS = [
  'Acceso a más de 200 cursos',
  'Aprende de expertos clínicos',
  'Casos clínicos interactivos',
  'Aprende a tu propio ritmo',
]

function Registro() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()

  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', contrasena: '', confirmar: '' })
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const validate = () => {
    if (!form.nombre || !form.correo || !form.telefono || !form.contrasena || !form.confirmar)
      return 'Por favor completa todos los campos.'
    if (form.contrasena.length < 6)
      return 'La contraseña debe tener al menos 6 caracteres.'
    if (!/[A-Z]/.test(form.contrasena) || !/[a-z]/.test(form.contrasena) || !/[0-9]/.test(form.contrasena))
      return 'La contraseña debe incluir mayúscula, minúscula y número.'
    if (form.contrasena !== form.confirmar)
      return 'Las contraseñas no coinciden.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      const data = await register({
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        contrasena: form.contrasena,
      })
      setAuth(data)
      const destino = data.rol === 'Admin' ? '/admin' : '/dashboard'
      navigate(destino, { replace: true })
    } catch (err: unknown) {
      // 400: correo ya registrado / regla de validación. 409: colisión concurrente.
      const mensaje = (err as any)?.response?.data?.mensaje ?? 'Error al registrarse.'
      setError(mensaje)
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength(form.contrasena)

  return (
    // 1. CONTENEDOR PRINCIPAL
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">

      {/* 2. Fondo ambiental — mismas formas orgánicas de siempre, recoloreadas a la paleta */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-[5vw] -left-[5vw] w-[20vw] min-w-[200px] h-[20vw] min-h-[200px] bg-tertiary-fixed opacity-30"
          style={{ borderRadius: '48% 52% 68% 32% / 53% 43% 57% 47%' }}
        />
        <div
          className="absolute -bottom-[10vw] -left-[10vw] w-[45vw] min-w-[450px] h-[45vw] min-h-[450px] bg-secondary opacity-30"
          style={{ borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%' }}
        />
        <div
          className="absolute -top-[5vw] -right-[5vw] w-[35vw] min-w-[350px] h-[35vw] min-h-[350px] bg-secondary-container opacity-35"
          style={{ borderRadius: '33% 67% 32% 68% / 41% 52% 48% 59%' }}
        />
        <div
          className="absolute -bottom-[5vw] -right-[5vw] w-[15vw] min-w-[150px] h-[15vw] min-h-[150px] bg-tertiary-fixed opacity-25"
          style={{ borderRadius: '73% 27% 45% 55% / 36% 41% 59% 64%' }}
        />
      </div>

      {/* 3. CARD WRAPPER */}
      <div className="relative z-10 w-full max-w-4xl flex max-h-[95vh] rounded-2xl overflow-hidden border border-outline-variant shadow-2xl">

        {/* Panel izquierdo */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#082555] items-center justify-center p-12 border-r border-outline-variant">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-secondary/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-secondary/10" />

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-12">
              <LogoIcon />
              <div className="leading-none">
                <span className="font-headline text-headline-md text-on-primary">Medicus</span>
                <span className="font-headline text-headline-md text-secondary-fixed">Learn</span>
              </div>
            </div>

            <h2 className="font-headline text-headline-lg text-on-primary mb-4">
              Tu próximo nivel<br />
              <span className="text-tertiary-fixed">te espera</span>
            </h2>
            <p className="font-body text-body-sm text-primary-fixed-dim max-w-xs mx-auto">
              Únete a miles de profesionales de la salud que ya están aprendiendo.
            </p>

            <div className="mt-10 space-y-4 text-left max-w-xs mx-auto">
              {BENEFICIOS.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-secondary-fixed/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary-fixed text-[14px]">check</span>
                  </div>
                  <span className="font-body text-body-sm text-primary-fixed-dim">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-outline-variant max-w-xs mx-auto">
              <div className="flex items-center mb-6">
                <div className="flex-1 border-outline-variant border-t" />
                <span className="px-3 font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">O regístrate con</span>
                <div className="flex-1 border-outline-variant border-t" />
              </div>
              <div className="grid grid-cols-3 gap-4 relative z-20">
                {[
                  { icon: '/assets/icons/facebook.png', label: 'Facebook' },
                  { icon: '/assets/icons/chrome.png',   label: 'Google'   },
                  { icon: '/assets/icons/twitter.png',  label: 'Twitter'  },
                ].map((social) => (
                  <a key={social.label} href="#" className="text-center group flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 rounded-3xl bg-surface-container-highest/10 flex items-center justify-center mb-2 transition-all border border-transparent group-hover:bg-secondary-fixed/20 group-hover:border-secondary-fixed/40">
                      <img src={social.icon} alt={`Perfil de ${social.label}`} className="w-10 h-10 object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-on-primary-container group-hover:text-on-primary transition-colors">
                      {social.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho — Formulario con scrollbar oculta */}
        <div className="w-full lg:w-1/2 bg-[#f1f5fa] overflow-y-auto flex justify-center p-6 sm:p-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-md my-auto">

            {/* Logo mobile */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <LogoIcon />
              <div className="leading-none">
                <span className="font-headline text-headline-sm text-on-surface">Medicus</span>
                <span className="font-headline text-headline-sm text-secondary">Learn</span>
              </div>
            </div>

            <h1 className="font-headline text-headline-lg text-on-surface mb-1">Crear cuenta</h1>
            <p className="font-body text-body-sm text-on-surface-variant mb-8">Es gratis, tarda menos de un minuto</p>

            {error && <div className="mb-5"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              <Input label="Nombre completo"    name="nombre"   type="text"  value={form.nombre}   onChange={handleChange} placeholder="Dr. Juan Pérez"       />
              <Input label="Correo electrónico" name="correo"   type="email" value={form.correo}   onChange={handleChange} placeholder="tu@correo.com"        />
              <Input label="Teléfono"           name="telefono" type="tel"   value={form.telefono} onChange={handleChange} placeholder="+52 555 123 4567"     />

              {/* Contraseña con ojito */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="contrasena" value={form.contrasena} onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-surface-container border border-outline-variant text-on-surface placeholder-on-surface-variant/50 rounded-lg px-4 py-2.5 pr-11 font-body text-body-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Fortaleza */}
                {form.contrasena && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= strength.level ? strength.color : 'bg-outline-variant'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="font-body text-body-sm text-on-surface-variant">
                      Fortaleza:{' '}
                      <span
                        className={
                          strength.level === 1 ? 'text-error' :
                          strength.level === 2 ? 'text-[#c9922f]' : 'text-secondary'
                        }
                      >
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <Input
                label="Confirmar contraseña"
                name="confirmar"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmar}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                error={form.confirmar && form.contrasena !== form.confirmar ? 'Las contraseñas no coinciden' : undefined}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-4 cursor-pointer" disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant text-center">
              <p className="font-body text-body-sm text-on-surface-variant">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-secondary hover:text-on-secondary-container font-semibold transition-colors">
                  Iniciar sesión
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Registro