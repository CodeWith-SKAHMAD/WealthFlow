export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { icon: 28, title: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, title: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 64, title: 'text-3xl', sub: 'text-xs' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={`${import.meta.env.BASE_URL}logo-icon.png`}
        alt="WealthFlow"
        width={s.icon}
        height={s.icon}
        className="rounded-xl shrink-0 drop-shadow-[0_4px_12px_rgba(47,123,217,0.45)]"
      />
      {showText && (
        <div className="leading-tight">
          <div className={`font-display font-bold ${s.title}`}>
            <span className="text-brand-400">Wealth</span>
            <span className="opacity-90">Flow</span>
          </div>
          <div className={`${s.sub} uppercase tracking-[0.18em] opacity-50 font-medium -mt-0.5`}>
            Investment Tracker
          </div>
        </div>
      )}
    </div>
  )
}
