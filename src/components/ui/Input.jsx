import clsx from 'clsx'

export function Input({ label, hint, error, className = '', ...rest }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium opacity-60 mb-1.5">{label}</span>
      )}
      <input
        className={clsx(
          'w-full rounded-xl glass-inset px-3.5 py-2.5 text-sm outline-none transition-all',
          'focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400/40',
          'placeholder:opacity-40',
          error && 'ring-2 ring-loss-500/60',
          className
        )}
        {...rest}
      />
      {hint && <span className="block text-[11px] opacity-40 mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-loss-400 mt-1">{error}</span>}
    </label>
  )
}

export function Select({ label, className = '', children, ...rest }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium opacity-60 mb-1.5">{label}</span>
      )}
      <select
        className={clsx(
          'w-full rounded-xl glass-inset px-3.5 py-2.5 text-sm outline-none transition-all appearance-none',
          'focus:ring-2 focus:ring-brand-400/50',
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

export function Textarea({ label, className = '', ...rest }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium opacity-60 mb-1.5">{label}</span>
      )}
      <textarea
        className={clsx(
          'w-full rounded-xl glass-inset px-3.5 py-2.5 text-sm outline-none transition-all resize-none',
          'focus:ring-2 focus:ring-brand-400/50 placeholder:opacity-40',
          className
        )}
        {...rest}
      />
    </label>
  )
}
