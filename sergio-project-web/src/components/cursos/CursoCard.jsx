// src/components/ui/Card.jsx
// Uso:
// <Card>contenido</Card>
// <Card title="Título" subtitle="Subtítulo">contenido</Card>
// <Card hoverable>contenido con hover</Card>

function Card({ children, title, subtitle, hoverable = false, className = '' }) {
  return (
    <div
      className={`bg-[#0D1B2E] border border-white/5 rounded-2xl overflow-hidden
        ${hoverable ? 'hover:border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all' : ''}
        ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/5">
          {title    && <h3 className="text-white font-semibold text-sm">{title}</h3>}
          {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export default Card;