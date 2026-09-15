// src/pages/user/Profile.tsx
import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'
import Alert from '../../components/ui/Alert'
import { passwordStrength } from '../../utils/validators'
import type { AlertState } from '../../types'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

function SectionHeader({ icon, title, color = '#006398' }: { icon: string; title: string; color?: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#c6c6cd]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon name={icon} className="text-[16px]" style={{ color } as React.CSSProperties} />
      </div>
      <h3 className="text-[#0b1c30] font-bold text-sm">{title}</h3>
    </div>
  )
}

function Profile() {
  const { user, updateUser } = useAuthStore()

  const [infoForm, setInfoForm] = useState({
    nombre:   user?.nombre   ?? '',
    correo:   user?.correo   ?? '',
    telefono: user?.telefono ?? '',
  })
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [loadingInfo,   setLoadingInfo]   = useState(false)
  const [loadingPass,   setLoadingPass]   = useState(false)
  const [alertInfo,     setAlertInfo]     = useState<AlertState | null>(null)
  const [alertPass,     setAlertPass]     = useState<AlertState | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const strength = passwordStrength(passForm.nueva)

  const camposPerfil = [!!infoForm.nombre, !!infoForm.correo, !!infoForm.telefono, !!user?.avatar]
  const completitud  = Math.round((camposPerfil.filter(Boolean).length / camposPerfil.length) * 100)

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!infoForm.nombre.trim() || !infoForm.correo.trim()) {
      setAlertInfo({ type: 'error', message: 'Nombre y correo son obligatorios.' })
      return
    }
    setLoadingInfo(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      updateUser(infoForm)
      setAlertInfo({ type: 'success', message: 'Perfil actualizado correctamente.' })
    } catch {
      setAlertInfo({ type: 'error', message: 'Error al actualizar el perfil.' })
    } finally {
      setLoadingInfo(false)
    }
  }

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passForm.actual || !passForm.nueva || !passForm.confirmar) {
      setAlertPass({ type: 'error', message: 'Completa todos los campos.' })
      return
    }
    if (passForm.nueva.length < 6) {
      setAlertPass({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (passForm.nueva !== passForm.confirmar) {
      setAlertPass({ type: 'error', message: 'Las contraseñas no coinciden.' })
      return
    }
    setLoadingPass(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setPassForm({ actual: '', nueva: '', confirmar: '' })
      setAlertPass({ type: 'success', message: 'Contraseña cambiada correctamente.' })
    } catch {
      setAlertPass({ type: 'error', message: 'La contraseña actual es incorrecta.' })
    } finally {
      setLoadingPass(false)
    }
  }

  const inputCls = "w-full bg-[#f8f9ff] border border-[#c6c6cd] text-[#0b1c30] placeholder-[#45464d]/50 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/10 transition-all"

  return (
    <div className="bg-[#f8f9ff] min-h-screen pb-16">

      {/* ── HEADER: tarjeta flotante ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-lg p-8 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#006398]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-[#dce9ff] border-2 border-[#006398] flex items-center justify-center text-[#0b1c30] text-2xl font-extrabold">
                {user?.nombre?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#006398] hover:bg-[#00476e] rounded-full flex items-center justify-center transition-colors shadow-lg border-2 border-[#e5eeff]">
                <Icon name="edit" className="text-[13px] text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#006398] text-[10px] font-bold uppercase tracking-wider mb-1">Cuenta</p>
              <h1 className="text-2xl font-extrabold text-[#0b1c30] truncate">{user?.nombre ?? 'Usuario'}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="bg-[#dce9ff] text-[#45464d] text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  {user?.rol ?? 'Usuario'}
                </span>
                {user?.esPremium
                  ? <span className="bg-[#8b5cf6] text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Premium</span>
                  : <span className="bg-[#dce9ff] text-[#45464d] text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Plan gratuito</span>
                }
              </div>
            </div>
            {!user?.esPremium && (
              <button className="flex-shrink-0 flex items-center gap-1.5 bg-[#8b5cf6] hover:bg-[#7c4feb] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                <Icon name="bolt" className="text-[14px]" />
                Ajustes Avanzados
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ══ COLUMNA PRINCIPAL ══ */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Información personal ── */}
            <div id="info" className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm overflow-hidden">
              <SectionHeader icon="badge" title="Información personal" />
              <div className="p-6">
                {alertInfo && <div className="mb-5"><Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} /></div>}
                <form onSubmit={handleInfoSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    {[
                      { label: 'Nombre completo',    name: 'nombre',   type: 'text',  value: infoForm.nombre,   placeholder: 'Tu nombre'        },
                      { label: 'Correo electrónico', name: 'correo',   type: 'email', value: infoForm.correo,   placeholder: 'tu@correo.com'    },
                      { label: 'Teléfono',           name: 'telefono', type: 'tel',   value: infoForm.telefono, placeholder: '+52 555 123 4567' },
                    ].map(({ label, name, type, value, placeholder }) => (
                      <div key={name}>
                        <label className="block text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-2">{label}</label>
                        <input
                          type={type} value={value} placeholder={placeholder}
                          onChange={(e) => setInfoForm((p) => ({ ...p, [name]: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-2">Rol</label>
                      <input value={user?.rol ?? '—'} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingInfo}
                      className="flex items-center gap-2 bg-[#006398] hover:bg-[#00476e] disabled:opacity-60 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Icon name="save" className="text-[14px]" />
                      {loadingInfo ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── Cambiar contraseña ── */}
            <div id="seguridad" className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm overflow-hidden">
              <SectionHeader icon="lock" title="Seguridad — Cambiar contraseña" color="#8b5cf6" />
              <div className="p-6">
                {alertPass && <div className="mb-5"><Alert type={alertPass.type} message={alertPass.message} onClose={() => setAlertPass(null)} /></div>}
                <form onSubmit={handlePassSubmit}>
                  <div className="space-y-4 mb-6">

                    <div>
                      <label className="block text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-2">Contraseña actual</label>
                      <div className="relative">
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={passForm.actual}
                          onChange={(e) => setPassForm((p) => ({ ...p, actual: e.target.value }))}
                          placeholder="Tu contraseña actual"
                          autoComplete="current-password"
                          className={`${inputCls} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] hover:text-[#0b1c30] transition-colors"
                        >
                          <Icon name={showPasswords ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-2">Nueva contraseña</label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={passForm.nueva}
                          onChange={(e) => setPassForm((p) => ({ ...p, nueva: e.target.value }))}
                          placeholder="Mínimo 6 caracteres"
                          autoComplete="new-password"
                          className={inputCls}
                        />
                        {passForm.nueva && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-[#c6c6cd]'}`} />
                              ))}
                            </div>
                            <p className="text-[10px] text-[#45464d]">
                              Fortaleza:{' '}
                              <span className={strength.level === 1 ? 'text-[#ba1a1a]' : strength.level === 2 ? 'text-[#c9922f]' : 'text-[#006398]'}>
                                {strength.label}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[#45464d] text-[10px] font-bold uppercase tracking-wider mb-2">Confirmar nueva</label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={passForm.confirmar}
                          onChange={(e) => setPassForm((p) => ({ ...p, confirmar: e.target.value }))}
                          placeholder="Repite la contraseña"
                          autoComplete="new-password"
                          className={`${inputCls} ${passForm.confirmar && passForm.nueva !== passForm.confirmar ? 'border-[#ba1a1a]/60' : ''}`}
                        />
                        {passForm.confirmar && passForm.nueva !== passForm.confirmar && (
                          <p className="text-[10px] text-[#ba1a1a] mt-1">No coinciden</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingPass}
                      className="flex items-center gap-2 bg-[#006398] hover:bg-[#00476e] disabled:opacity-60 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Icon name="save" className="text-[14px]" />
                      {loadingPass ? 'Guardando…' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── Plan y suscripción ── */}
            <div id="plan" className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm overflow-hidden">
              <SectionHeader icon="workspace_premium" title="Plan y suscripción" color="#c9922f" />
              <div className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl border border-[#c6c6cd] flex items-center justify-center ${user?.esPremium ? 'bg-[#8b5cf6]/15' : 'bg-[#dce9ff]'}`}>
                      <Icon name={user?.esPremium ? 'star' : 'school'} className={`text-[22px] ${user?.esPremium ? 'text-[#8b5cf6]' : 'text-[#006398]'}`} />
                    </div>
                    <div>
                      <p className="text-[#0b1c30] font-bold text-sm">{user?.esPremium ? 'Plan Premium' : 'Plan Gratuito'}</p>
                      <p className="text-[#45464d] text-xs mt-0.5">
                        {user?.esPremium
                          ? 'Acceso completo a todos los cursos y contenido exclusivo.'
                          : 'Acceso a cursos gratuitos. Mejora para desbloquear todo el contenido.'}
                      </p>
                    </div>
                  </div>
                  {!user?.esPremium
                    ? <button className="bg-[#8b5cf6] hover:bg-[#7c4feb] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                        Desbloquear PRO
                      </button>
                    : <button className="bg-transparent border border-[#c6c6cd] hover:border-[#006398] text-[#0b1c30] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">
                        Gestionar suscripción
                      </button>
                  }
                </div>
              </div>
            </div>

            {/* ── Zona de peligro ── */}
            <div id="peligro" className="bg-[#e5eeff] border border-[#ba1a1a]/20 rounded shadow-sm overflow-hidden">
              <SectionHeader icon="warning" title="Zona de peligro" color="#ba1a1a" />
              <div className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-[#0b1c30] text-sm font-bold">Eliminar cuenta</p>
                    <p className="text-[#45464d] text-xs mt-0.5">Esta acción es permanente y no se puede deshacer.</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[#ba1a1a] hover:bg-[#ffdad6] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer px-4 py-2 rounded-full"
                  >
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ══ SIDEBAR: resumen ══ */}
          <div className="xl:w-72 flex-shrink-0 space-y-6">
            <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm p-6">
              <h3 className="text-[#0b1c30] font-bold text-sm uppercase tracking-wider mb-5">Tu perfil</h3>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#dce9ff" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" stroke="#006398" strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - completitud / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-[#0b1c30]">
                    {completitud}%
                  </span>
                </div>
                <div>
                  <p className="text-[#0b1c30] text-sm font-semibold">Perfil completo</p>
                  <p className="text-[#45464d] text-xs mt-0.5">
                    {completitud === 100 ? '¡Todo listo!' : 'Agrega tu foto de perfil para completarlo'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-[#c6c6cd]">
                {[
                  { href: '#info',      icon: 'badge',            label: 'Información personal' },
                  { href: '#seguridad', icon: 'lock',              label: 'Seguridad'            },
                  { href: '#plan',      icon: 'workspace_premium', label: 'Plan y suscripción'    },
                  { href: '#peligro',   icon: 'warning',           label: 'Zona de peligro'       },
                ].map(({ href, icon, label }) => (
                  <a key={href} href={href} className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                    <Icon name={icon} className="text-[16px]" /> {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-[#e5eeff] border border-[#c6c6cd] rounded shadow-sm p-6">
              <h3 className="text-[#0b1c30] font-bold text-sm uppercase tracking-wider mb-4">Accesos rápidos</h3>
              <div className="space-y-1">
                <a href="/mis-cursos" className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                  <Icon name="local_library" className="text-[16px]" /> Mi biblioteca
                </a>
                <a href="/dashboard" className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                  <Icon name="dashboard" className="text-[16px]" /> Dashboard
                </a>
                <a href="/cursos" className="flex items-center gap-2 text-sm text-[#45464d] hover:text-[#006398] transition-colors py-1.5">
                  <Icon name="search" className="text-[16px]" /> Explorar catálogo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de confirmación ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] flex items-center justify-center mb-4">
              <Icon name="warning" className="text-[22px] text-[#ba1a1a]" />
            </div>
            <h4 className="text-[#0b1c30] font-extrabold text-base mb-2">¿Eliminar tu cuenta?</h4>
            <p className="text-[#45464d] text-xs leading-relaxed mb-6">
              Se borrarán permanentemente tu perfil, progreso y acceso a todos los cursos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-[#f8f9ff] border border-[#c6c6cd] hover:border-[#006398] text-[#0b1c30] py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => { /* TODO: handleDelete */ }}
                className="flex-1 bg-[#ffdad6] border border-[#ba1a1a]/40 hover:bg-[#ffc7c2] text-[#93000a] py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile