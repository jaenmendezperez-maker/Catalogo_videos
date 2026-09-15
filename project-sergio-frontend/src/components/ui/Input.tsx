interface Props {
  label?: string
  name: string
  type?: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  className?: string
}

function Input({ label, name, type = 'text', value, onChange, placeholder, disabled = false, error, hint, className = '' }: Props) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
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
        className={`w-full bg-surface-container-lowest border text-on-surface placeholder-on-surface-variant/60 rounded-lg px-4 py-2.5 font-body text-body-sm outline-none transition-all
          ${disabled
            ? 'bg-surface-container-low border-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed'
            : error
            ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/10'
            : 'border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/15'}`}
      />
      {error && <p className="font-body text-body-sm text-error mt-1">{error}</p>}
      {hint && !error && <p className="font-body text-body-sm text-on-surface-variant/70 mt-1">{hint}</p>}
    </div>
  )
}

export default Input