import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Euro,
  DollarSign,
  Plus,
  Wallet,
  LineChart as LineChartIcon,
  Layers,
  Bitcoin,
  Scale,
} from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StatBox from '../components/ui/StatBox'
import AssetLogo from '../components/ui/AssetLogo'
import LineChartCard from '../components/charts/LineChartCard'
import PieChartCard from '../components/charts/PieChartCard'
import CashInOutModal from '../components/shared/CashInOutModal'
import { useLedger } from '../hooks/useLedger'
import { usePortfolio } from '../hooks/usePortfolio'
import {
  totalInvested,
  totalUnrealizedPnl,
  formatMoney,
  formatPct,
} from '../lib/calculations'

export default function Home() {
  const [modalCurrency, setModalCurrency] = useState(null)

  const eur = useLedger('EUR')
  const usdt = useLedger('USDT')

  const stocks = usePortfolio('stock')
  const etfs = usePortfolio('etf')
  const crypto = usePortfolio('crypto')

  const allHoldings = useMemo(
    () => [...stocks.holdings, ...etfs.holdings, ...crypto.holdings],
    [stocks.holdings, etfs.holdings, crypto.holdings]
  )

  const investedTotal = totalInvested(allHoldings)
  const unrealizedTotal = totalUnrealizedPnl(allHoldings)
  const stockInvested = totalInvested(stocks.holdings)
  const etfInvested = totalInvested(etfs.holdings)
  const cryptoInvested = totalInvested(crypto.holdings)

  const investmentTrendData = useMemo(() => {
    const sorted = [...stocks.transactions, ...etfs.transactions, ...crypto.transactions].sort(
      (a, b) => new Date(a.txn_date) - new Date(b.txn_date)
    )
    let running = 0
    return sorted.map((t) => {
      const delta = t.txn_type === 'buy' ? Number(t.total_cost) : -Number(t.total_cost)
      running += delta
      return {
        label: new Date(t.txn_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: running,
      }
    })
  }, [stocks.transactions, etfs.transactions, crypto.transactions])

  const pieData = [
    { name: 'Stock', value: stockInvested },
    { name: 'ETF', value: etfInvested },
    { name: 'Crypto', value: cryptoInvested },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LedgerBox
          currency="EUR"
          icon={Euro}
          balance={eur.balance}
          loading={eur.loading}
          onAdd={() => setModalCurrency('EUR')}
        />
        <LedgerBox
          currency="USDT"
          icon={DollarSign}
          balance={usdt.balance}
          loading={usdt.loading}
          onAdd={() => setModalCurrency('USDT')}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatBox
          label="Total Investment"
          value={formatMoney(investedTotal, 'USD')}
          icon={Wallet}
          accent="brand"
          loading={stocks.loading || etfs.loading || crypto.loading}
        />
        <StatBox
          label="Stock Investment"
          value={formatMoney(stockInvested, 'USD')}
          icon={LineChartIcon}
          accent="brand"
          loading={stocks.loading}
        />
        <StatBox
          label="ETF Investment"
          value={formatMoney(etfInvested, 'USD')}
          icon={Layers}
          accent="brand"
          loading={etfs.loading}
        />
        <StatBox
          label="Crypto Investment"
          value={formatMoney(cryptoInvested, 'USD')}
          icon={Bitcoin}
          accent="brand"
          loading={crypto.loading}
        />
        <StatBox
          label="Unrealized P&L"
          value={formatMoney(unrealizedTotal, 'USD')}
          icon={Scale}
          accent={unrealizedTotal >= 0 ? 'profit' : 'loss'}
          loading={stocks.priceLoading || crypto.priceLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LineChartCard
          title="Ledger Balance (EUR + USDT)"
          data={mergeLedgerCharts(eur.chartData, usdt.chartData)}
          color="#5b9bea"
          valuePrefix="$"
        />
        <LineChartCard
          title="Investment Over Time"
          data={investmentTrendData}
          color="#22c55e"
          valuePrefix="$"
        />
        <PieChartCard title="Investment Allocation" data={pieData} />
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Holdings</h3>
          <Link to="/pnl" className="text-xs text-brand-400 font-medium hover:underline">
            View full PnL →
          </Link>
        </div>
        {allHoldings.length === 0 ? (
          <p className="text-sm opacity-40 py-8 text-center">
            No holdings yet. Add a buy transaction from the Stock, ETF, or Crypto tab.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {allHoldings.map((h) => (
              <div key={h.asset_type + h.symbol} className="flex items-center gap-3 py-3">
                <AssetLogo symbol={h.symbol} logoUrl={h.logo_url} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{h.symbol}</div>
                  <div className="text-xs opacity-45 truncate">
                    {Number(h.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })} units · avg{' '}
                    {formatMoney(h.avgCost, h.currency)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs opacity-45 uppercase tracking-wide mb-0.5">
                    Unrealized PnL
                  </div>
                  <div
                    className={`numeric font-semibold text-sm px-2 py-0.5 rounded-lg inline-block ${
                      h.unrealizedPnl == null
                        ? 'opacity-40'
                        : h.unrealizedPnl >= 0
                        ? 'text-profit-400 bg-profit-500/10'
                        : 'text-loss-400 bg-loss-500/10'
                    }`}
                  >
                    {h.unrealizedPnl == null ? 'No price' : formatMoney(h.unrealizedPnl, h.currency)}
                    {h.unrealizedPct != null && (
                      <span className="ml-1 opacity-70">({formatPct(h.unrealizedPct)})</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <CashInOutModal
        open={Boolean(modalCurrency)}
        currency={modalCurrency}
        onClose={() => setModalCurrency(null)}
        onSaved={() => (modalCurrency === 'EUR' ? eur.reload() : usdt.reload())}
      />
    </div>
  )
}

function LedgerBox({ currency, icon: Icon, balance, loading, onAdd }) {
  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-brand-500/10 blur-2xl" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 opacity-60 text-sm font-medium mb-2">
            <Icon size={15} /> {currency} Ledger
          </div>
          {loading ? (
            <div className="h-9 w-32 rounded bg-white/10 animate-pulse" />
          ) : (
            <div className="font-display font-bold text-3xl numeric">
              {currency === 'USDT' ? '₮' : '€'}
              {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <Button onClick={onAdd} icon={Plus} size="sm">
          Cash In/Out
        </Button>
      </div>
    </GlassCard>
  )
}

function mergeLedgerCharts(eurData, usdtData) {
  const map = new Map()
  for (const d of eurData) map.set(d.label, (map.get(d.label) || 0) + d.value)
  for (const d of usdtData) map.set(d.label, (map.get(d.label) || 0) + d.value)
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}
