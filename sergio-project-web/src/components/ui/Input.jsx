// src/components/ui/Input.jsx
// Uso: <Input label="Correo" name="correo" type="email" value={v} onChange={fn} error="msg" />

function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  hint,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-slate-400 mb-2">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-slate-800/60 border text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm outline-none transition-all
          ${disabled ? 'border-white/5 text-slate-500 cursor-not-allowed' : error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            : 'border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10'
          }`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

export default Input;