// ============================================================
// src/components/ui/Button.jsx
// Uso: <Button variant="primary" size="md" loading={false}>Texto</Button>
// ============================================================
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const variants = {
    primary:   'bg-cyan-500 hover:bg-cyan-400 text-[#070F1C] font-semibold',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white font-semibold',
    outline:   'border border-white/10 hover:border-white/20 text-slate-300 hover:text-white',
    danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    ghost:     'text-slate-400 hover:text-white hover:bg-white/5',
    premium:   'bg-amber-500 hover:bg-amber-400 text-[#070F1C] font-semibold',
  };
  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all
        ${variants[variant]} ${sizes[size]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;