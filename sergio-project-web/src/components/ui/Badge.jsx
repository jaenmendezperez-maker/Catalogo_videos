// src/components/ui/Badge.jsx
// Uso: <Badge variant="premium">Premium</Badge>
//      <Badge variant="nivel" nivel="Avanzado">Avanzado</Badge>

function Badge({ children, variant = 'default', nivel }) {
  // Si se pasa nivel, el variant se infiere automáticamente
  if (nivel) {
    const nivelMap = {
      'Básico':      'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
      'Intermedio':  'bg-amber-400/10   text-amber-400   border-amber-400/20',
      'Avanzado':    'bg-rose-400/10    text-rose-400    border-rose-400/20',
    };
    return (
      <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${nivelMap[nivel] || 'bg-slate-700 text-slate-300 border-transparent'}`}>
        {nivel}
      </span>
    );
  }

  const variants = {
    default:  'bg-slate-700 text-slate-300 border-transparent',
    premium:  'bg-amber-400/10 text-amber-400 border-amber-400/20',
    free:     'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    admin:    'bg-violet-400/10 text-violet-400 border-violet-400/20',
    new:      'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  };

  return (
    <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${variants[variant]}`}>
      {children}
    </span>
  );
}

export default Badge;