import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';

// ── Sub-componentes ────────────────────────────────────────

function SectionCard({ titulo, children }) {
  return (
    <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-white font-semibold text-sm">{titulo}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({ label, name, type = 'text', value, onChange, placeholder, disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-slate-800/60 border text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
          disabled
            ? 'border-white/5 text-slate-500 cursor-not-allowed'
            : 'border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10'
        }`}
      />
    </div>
  );
}

function Alert({ type, message, onClose }) {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    error:   'bg-red-500/10 border-red-500/20 text-red-400',
  };
  return (
    <div className={`flex items-center justify-between gap-3 border px-4 py-3 rounded-xl text-sm mb-5 ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────
function Profile() {
  const { user, updateUser } = useAuthStore();

  // ── Estado del formulario de info personal
  const [infoForm, setInfoForm] = useState({
    nombre:   user?.nombre   || '',
    correo:   user?.correo   || '',
    telefono: user?.telefono || '',
  });

  // ── Estado del formulario de contraseña
  const [passForm, setPassForm] = useState({
    actual:    '',
    nueva:     '',
    confirmar: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [loadingInfo,   setLoadingInfo]   = useState(false);
  const [loadingPass,   setLoadingPass]   = useState(false);
  const [alertInfo,     setAlertInfo]     = useState(null); // { type, message }
  const [alertPass,     setAlertPass]     = useState(null);

  // Fortaleza de contraseña
  const getStrength = (p) => {
    if (!p) return { level: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 6)          s++;
    if (p.length >= 10)         s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { level: 1, label: 'Débil',  color: 'bg-red-500' };
    if (s <= 3) return { level: 2, label: 'Media',  color: 'bg-amber-500' };
    return              { level: 3, label: 'Fuerte', color: 'bg-emerald-500' };
  };
  const strength = getStrength(passForm.nueva);

  // ── Handlers info personal
  const handleInfoChange = (e) => setInfoForm({ ...infoForm, [e.target.name]: e.target.value });

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!infoForm.nombre.trim() || !infoForm.correo.trim()) {
      setAlertInfo({ type: 'error', message: 'Nombre y correo son obligatorios.' });
      return;
    }
    setLoadingInfo(true);
    try {
      // TODO: await api.put('/usuarios/me', infoForm);
      await new Promise(r => setTimeout(r, 800)); // simula llamada API
      updateUser(infoForm);
      setAlertInfo({ type: 'success', message: 'Perfil actualizado correctamente.' });
    } catch {
      setAlertInfo({ type: 'error', message: 'Error al actualizar el perfil.' });
    } finally {
      setLoadingInfo(false);
    }
  };

  // ── Handlers contraseña
  const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (!passForm.actual || !passForm.nueva || !passForm.confirmar) {
      setAlertPass({ type: 'error', message: 'Completa todos los campos.' });
      return;
    }
    if (passForm.nueva.length < 6) {
      setAlertPass({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (passForm.nueva !== passForm.confirmar) {
      setAlertPass({ type: 'error', message: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    setLoadingPass(true);
    try {
      // TODO: await api.put('/auth/cambiar-contrasena', { actual: passForm.actual, nueva: passForm.nueva });
      await new Promise(r => setTimeout(r, 800));
      setPassForm({ actual: '', nueva: '', confirmar: '' });
      setAlertPass({ type: 'success', message: 'Contraseña cambiada correctamente.' });
    } catch {
      setAlertPass({ type: 'error', message: 'La contraseña actual es incorrecta.' });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="bg-[#070F1C] min-h-screen">

      {/* ── Header ── */}
      <div className="border-b border-white/5 bg-[#0D1B2E]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-cyan-400 text-sm font-medium mb-1">Cuenta</p>
          <h1 className="text-3xl font-bold text-white">Mi perfil</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Card de identidad ── */}
        <div className="bg-[#0D1B2E] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 hover:bg-cyan-400 rounded-lg flex items-center justify-center transition-colors shadow-lg">
              <svg className="w-3.5 h-3.5 text-[#070F1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-white">{user?.nombre || 'Usuario'}</h2>
            <p className="text-slate-400 text-sm">{user?.correo || '—'}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
              <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
                {user?.rol || 'Usuario'}
              </span>
              {user?.esPremium ? (
                <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full">
                  ⭐ Premium
                </span>
              ) : (
                <span className="text-xs bg-white/5 text-slate-400 px-2.5 py-1 rounded-full">
                  Plan gratuito
                </span>
              )}
            </div>
          </div>

          {/* Botón upgrade */}
          {!user?.esPremium && (
            <button className="flex-shrink-0 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-400/15 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
              ⭐ Mejorar a Premium
            </button>
          )}
        </div>

        {/* ── Información personal ── */}
        <SectionCard titulo="Información personal">
          {alertInfo && (
            <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />
          )}
          <form onSubmit={handleInfoSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <InputField
                label="Nombre completo"
                name="nombre"
                value={infoForm.nombre}
                onChange={handleInfoChange}
                placeholder="Tu nombre"
              />
              <InputField
                label="Correo electrónico"
                name="correo"
                type="email"
                value={infoForm.correo}
                onChange={handleInfoChange}
                placeholder="tu@correo.com"
              />
              <InputField
                label="Teléfono"
                name="telefono"
                type="tel"
                value={infoForm.telefono}
                onChange={handleInfoChange}
                placeholder="+52 555 123 4567"
              />
              <InputField
                label="Rol"
                name="rol"
                value={user?.rol || '—'}
                disabled
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingInfo}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-[#070F1C] font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
              >
                {loadingInfo ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── Cambiar contraseña ── */}
        <SectionCard titulo="Seguridad — Cambiar contraseña">
          {alertPass && (
            <Alert type={alertPass.type} message={alertPass.message} onClose={() => setAlertPass(null)} />
          )}
          <form onSubmit={handlePassSubmit}>
            <div className="space-y-4 mb-6">

              {/* Contraseña actual */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="actual"
                    value={passForm.actual}
                    onChange={handlePassChange}
                    placeholder="Tu contraseña actual"
                    className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 pr-11 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={showPasswords
                          ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Nueva contraseña</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="nueva"
                    value={passForm.nueva}
                    onChange={handlePassChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  />
                  {passForm.nueva && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">
                        Fortaleza: <span className={strength.level === 1 ? 'text-red-400' : strength.level === 2 ? 'text-amber-400' : 'text-emerald-400'}>{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Confirmar nueva</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="confirmar"
                    value={passForm.confirmar}
                    onChange={handlePassChange}
                    placeholder="Repite la contraseña"
                    className={`w-full bg-slate-800/60 border text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
                      passForm.confirmar && passForm.nueva !== passForm.confirmar
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/10'
                    }`}
                  />
                  {passForm.confirmar && passForm.nueva !== passForm.confirmar && (
                    <p className="text-xs text-red-400 mt-1">No coinciden</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingPass}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
              >
                {loadingPass ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── Plan ── */}
        <SectionCard titulo="Plan y suscripción">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                user?.esPremium ? 'bg-amber-400/10' : 'bg-slate-700/50'
              }`}>
                {user?.esPremium ? '⭐' : '🎓'}
              </div>
              <div>
                <p className="text-white font-semibold">{user?.esPremium ? 'Plan Premium' : 'Plan Gratuito'}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {user?.esPremium
                    ? 'Acceso completo a todos los cursos y contenido exclusivo.'
                    : 'Acceso a cursos gratuitos. Mejora para desbloquear todo el contenido.'}
                </p>
              </div>
            </div>
            {!user?.esPremium && (
              <button className="bg-amber-500 hover:bg-amber-400 text-[#070F1C] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
                ⭐ Mejorar a Premium
              </button>
            )}
            {user?.esPremium && (
              <button className="border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-sm px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
                Gestionar suscripción
              </button>
            )}
          </div>
        </SectionCard>

        {/* ── Zona de peligro ── */}
        <SectionCard titulo="Zona de peligro">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white text-sm font-medium">Eliminar cuenta</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Esta acción es permanente y no se puede deshacer.
              </p>
            </div>
            <button className="border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-all flex-shrink-0">
              Eliminar mi cuenta
            </button>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}

export default Profile;