import { useMemo } from 'react'
import { Scale, TrendingUp, TrendingDown } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import StatBox from '../components/ui/StatBox'
import AssetLogo from '../components/ui/AssetLogo'
import PieChartCard from '../components/charts/PieChartCard'
import { usePortfolio } from '../hooks/usePortfolio'
import { totalUnrealizedPnl, totalRealizedPnl, formatMoney, formatPct } from '../lib/calculations'

export default function PnL() {
  const stocks = usePortfolio('stock')
  const etfs = usePortfolio('etf')
  const crypto = usePortfolio('crypto')

  const allHoldings = useMemo(
    () => [...stocks.holdings, ...etfs.holdings, ...crypto.holdings],
    [stocks.holdings, etfs.holdings, crypto.holdings]
  )

  const unrealized = totalUnrealizedPnl(allHoldings)
  const realized = totalRealizedPnl(allHoldings)

  const unrealizedPieData = allHoldings
    .filter((h) => h.unrealizedPnl != null && h.unrealizedPnl !== 0)
    .map((h) => ({ name: h.symbol, value: Math.abs(h.unrealizedPnl) }))

  const winners = allHoldings.filter((h) => (h.unrealizedPnl ?? 0) > 0).length
  const losers = allHoldings.filter((h) => (h.unrealizedPnl ?? 0) < 0).length

  const loading = stocks.loading || etfs.loading || crypto.loading

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display font-bold text-xl">Unrealized &amp; Realized PnL</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          label="Unrealized P&L"
          value={formatMoney(unrealized, 'USD')}
          icon={Scale}
          accent={unrealized >= 0 ? 'profit' : 'loss'}
          loading={loading}
        />
        <StatBox
          label="Realized P&L"
          value={formatMoney(realized, 'USD')}
          icon={Scale}
          accent={realized >= 0 ? 'profit' : 'loss'}
          loading={loading}
        />
        <StatBox label="Winning positions" value={String(winners)} icon={TrendingUp} accent="profit" loading={loading} />
        <StatBox label="Losing positions" value={String(losers)} icon={TrendingDown} accent="loss" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard title="Unrealized P&L by Asset (magnitude)" data={unrealizedPieData} />

        <GlassCard>
          <h3 className="font-display font-semibold text-sm opacity-80 mb-3">Per-asset breakdown</h3>
          {allHoldings.length === 0 ? (
            <p className="text-sm opacity-40 py-8 text-center">No holdings yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/5 max-h-[260px] overflow-y-auto">
              {allHoldings.map((h) => (
                <div key={h.asset_type + h.symbol} className="flex items-center gap-3 py-2.5">
                  <AssetLogo symbol={h.symbol} logoUrl={h.logo_url} size={26} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{h.symbol}</div>
                    <div className="text-[11px] opacity-40">
                      Realized: {formatMoney(h.realizedPnl, h.currency)}
                    </div>
                  </div>
                  <div
                    className={`numeric text-xs font-semibold shrink-0 ${
                      h.unrealizedPnl == null
                        ? 'opacity-40'
                        : h.unrealizedPnl >= 0
                        ? 'text-profit-400'
                        : 'text-loss-400'
                    }`}
                  >
                    {h.unrealizedPnl == null ? 'No price' : formatMoney(h.unrealizedPnl, h.currency)}
                    {h.unrealizedPct != null && <div className="text-right opacity-60">{formatPct(h.unrealizedPct)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
