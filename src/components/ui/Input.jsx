import { useState, useRef, useEffect, Children } from 'react'
import { ChevronDown } from 'lucide-react'
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

/**
 * Fully custom dropdown — NOT a native <select>. Native <select> popups are
 * rendered by the OS/browser and often ignore our dark theme (showing a
 * washed-out white list), so we build our own glass-styled list instead.
 * Same external API as a native select: pass <option value="x">Label</option>
 * children, read/write via value + onChange(e) where e.target.value works.
 */
export function Select({ label, className = '', children, value, onChange, disabled, placeholder }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const options = Children.toArray(children).map((child) => ({
    value: child.props.value,
    label: child.props.children,
  }))

  const selected = options.find((o) => String(o.value) === String(value))

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const pick = (optValue) => {
    onChange?.({ target: { value: optValue } })
    setOpen(false)
  }

  return (
    <div className="block relative" ref={containerRef}>
      {label && <span className="block text-xs font-medium opacity-60 mb-1.5">{label}</span>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'w-full rounded-xl glass-inset px-3.5 py-2.5 text-sm outline-none transition-all',
          'focus:ring-2 focus:ring-brand-400/50 flex items-center justify-between gap-2 text-left',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span className={clsx('truncate', !selected && 'opacity-40')}>
          {selected ? selected.label : placeholder || 'Select…'}
        </span>
        <ChevronDown size={15} className={clsx('shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full glass !rounded-xl max-h-60 overflow-y-auto p-1.5">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                String(o.value) === String(value)
                  ? 'bg-brand-500/20 text-brand-300 font-medium'
                  : 'hover:bg-white/10'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
