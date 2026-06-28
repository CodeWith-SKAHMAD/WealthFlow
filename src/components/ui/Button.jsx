import clsx from 'clsx'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  ...rest
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  const variants = {
    primary: 'btn-3d text-white font-semibold',
    ghost:
      'glass-inset hover:bg-white/5 text-current font-medium border border-white/5',
    danger:
      'bg-gradient-to-b from-loss-400 to-loss-500 text-white font-semibold shadow-[0_10px_20px_-8px_rgba(244,63,94,0.5)] hover:brightness-110',
    outline:
      'border border-brand-400/40 text-brand-400 hover:bg-brand-400/10 font-medium',
  }

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        sizes[size],
        variants[variant],
        className
      )}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.25} />}
      {children}
    </button>
  )
}
