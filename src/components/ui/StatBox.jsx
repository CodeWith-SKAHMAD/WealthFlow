import clsx from 'clsx'
import GlassCard from './GlassCard'

export default function StatBox({ label, value, icon: Icon, trend, accent = 'brand', loading }) {
  const accents = {
    brand: 'text-brand-400 bg-brand-400/10',
    profit: 'text-profit-400 bg-profit-400/10',
    loss: 'text-loss-400 bg-loss-400/10',
    neutral: 'text-current bg-white/5',
  }

  return (
    <GlassCard className="p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium opacity-55 truncate">{label}</span>
        {Icon && (
          <span className={clsx('p-1.5 rounded-lg', accents[accent])}>
            <Icon size={14} strokeWidth={2.25} />
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-6 w-20 rounded bg-white/10 animate-pulse" />
      ) : (
        <span className="numeric font-display font-bold text-xl truncate">{value}</span>
      )}
      {trend != null && !loading && (
        <span className={clsx('text-xs font-medium numeric', trend >= 0 ? 'text-profit-400' : 'text-loss-400')}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}%
        </span>
      )}
    </GlassCard>
  )
}
