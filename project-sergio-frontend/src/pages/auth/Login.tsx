// src/pages/auth/Login.tsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../../api/authApi'
import useAuthStore from '../../store/useAuthStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

function LogoIcon() {
  return <img src="/assets/icons/herbal.png" alt="Logo de la plataforma" className="w-8 h-8 object-contain" />
}

function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login: setAuth } = useAuthStore()

  const [form,         setForm]         = useState({ correo: '', contrasena: '' })
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.correo || !form.contrasena) { setError('Por favor completa todos los campos.'); return }
    setLoading(true)
    try {
      const { user, token, refreshToken } = await login({ correo: form.correo, contrasena: form.contrasena })
      setAuth(user, token, refreshToken)
      const destino = user.rol === 'Admin' ? '/admin' : '/dashboard'
      navigate(location.state?.from?.pathname || destino, { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // 1. CONTENEDOR PRINCIPAL
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">

      {/* 2. Fondo ambiental — mismas formas orgánicas de siempre, recoloreadas a la paleta */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Tertiary superior izquierda */}
        <div
          className="absolute -top-[5vw] -left-[5vw] w-[20vw] min-w-[200px] h-[20vw] min-h-[200px] bg-tertiary-fixed opacity-30"
          style={{ borderRadius: '48% 52% 68% 32% / 53% 43% 57% 47%' }}
        />
        {/* Secondary inferior izquierda */}
        <div
          className="absolute -bottom-[10vw] -left-[10vw] w-[45vw] min-w-[450px] h-[45vw] min-h-[450px] bg-secondary opacity-30"
          style={{ borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%' }}
        />
        {/* Secondary-container superior derecha */}
        <div
          className="absolute -top-[5vw] -right-[5vw] w-[35vw] min-w-[350px] h-[35vw] min-h-[350px] bg-secondary-container opacity-35"
          style={{ borderRadius: '33% 67% 32% 68% / 41% 52% 48% 59%' }}
        />
        {/* Tertiary inferior derecha */}
        <div
          className="absolute -bottom-[5vw] -right-[5vw] w-[15vw] min-w-[150px] h-[15vw] min-h-[150px] bg-tertiary-fixed opacity-35"
          style={{ borderRadius: '73% 27% 45% 55% / 36% 41% 59% 64%' }}
        />
      </div>

      {/* 3. CARD WRAPPER */}
      <div className="relative z-10 w-full max-w-4xl flex rounded-2xl overflow-hidden border border-outline-variant shadow-2xl">

        {/* Panel izquierdo — decorativo, oscuro para contraste con el formulario */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#082555] items-center justify-center p-12 border-r border-outline-variant">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-secondary/40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-secondary/40" />

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-12">
              <LogoIcon />
              <div className="leading-none">
                <span className="font-headline text-headline-md text-on-primary">Medicus</span>
                <span className="font-headline text-headline-md text-secondary-fixed">Learn</span>
              </div>
            </div>

            <h2 className="font-headline text-headline-lg text-on-primary mb-4">
              Aprende medicina<br />
              <span className="text-tertiary-fixed">al siguiente nivel</span>
            </h2>
            <p className="font-body text-body-sm text-primary-fixed-dim max-w-xs mx-auto">
              Accede a cientos de cursos clínicos, aprende de especialistas y avanza en tu carrera médica.
            </p>

            <div className="mt-10 border-t border-[#8695ac]">
              <div className="flex items-center mt-5">
                <div className="flex-1 border-[#8695ac] border-t" />
                <span className="px-3 font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">Continuar con</span>
                <div className="flex-1 border-[#8695ac] border-t" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-6 relative z-20">
                {[
                  { icon: '/assets/icons/facebook.png', label: 'Facebook' },
                  { icon: '/assets/icons/chrome.png',   label: 'Google'   },
                  { icon: '/assets/icons/twitter.png',  label: 'Twitter'  },
                ].map((social) => (
                  <a key={social.label} href="#" className="text-center group flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 rounded-3xl bg-surface-container-highest/10 flex items-center justify-center mb-2 transition-all border border-transparent group-hover:bg-secondary-fixed/20 group-hover:border-secondary-fixed/40">
                      <img src={social.icon} alt={`Perfil de ${social.label}`} className="w-10 h-10 object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="font-label-sm text-label-sm text-on-primary-container group-hover:text-on-primary transition-colors">
                      {social.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho — Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-[#f1f5fa]">
          <div className="w-full max-w-md">

            <div className="flex items-center gap-2 mb-10 lg:hidden">
              <LogoIcon />
              <div className="leading-none">
                <span className="font-headline text-headline-sm text-on-surface">Medicus</span>
                <span className="font-headline text-headline-sm text-secondary">Learn</span>
              </div>
            </div>

            <h1 className="font-headline text-headline-lg text-on-surface mb-1">Bienvenido</h1>
            <p className="font-body text-body-sm text-on-surface-variant mb-8">Inicia sesión para continuar aprendiendo</p>

            <div className="bg-secondary-fixed/30 border border-secondary/20 rounded-xl p-4 mb-6">
              <p className="font-label-sm text-label-sm text-on-secondary-container mb-2 uppercase tracking-wider">🧪 Credenciales de prueba</p>
              <div className="space-y-1 font-body text-body-sm text-on-surface-variant">
                <p><span className="text-on-surface-variant/70">Admin:</span> admin@test.com / 123456</p>
                <p><span className="text-on-surface-variant/70">Usuario:</span> usuario@test.com / 123456</p>
              </div>
            </div>

            {error && <div className="mb-5"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo electrónico"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                placeholder="sergiomichinreyez@correo.com"
              />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Contraseña</label>
                  <button type="button" className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-container transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
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
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full cursor-pointer" disabled={loading}>
                {loading ? 'Ingresando…' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant text-center">
              <p className="font-body text-body-sm text-on-surface-variant">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="text-secondary hover:text-on-secondary-container font-semibold transition-colors">
                  Regístrate gratis
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Login