import { useState } from 'react'
import { Plus, Pencil, Trash2, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StatBox from '../components/ui/StatBox'
import AssetLogo from '../components/ui/AssetLogo'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import TransactionFormModal from '../components/shared/TransactionFormModal'
import WatchlistSection from '../components/shared/WatchlistSection'
import { usePortfolio } from '../hooks/usePortfolio'
import { useWatchlist } from '../hooks/useWatchlist'
import { deleteHoldingsTransaction } from '../lib/db'
import {
  totalInvested,
  totalMarketValue,
  totalUnrealizedPnl,
  totalRealizedPnl,
  formatMoney,
  formatPct,
} from '../lib/calculations'
import { hasStockApiKey } from '../lib/prices'

const LABELS = { stock: 'Stock', etf: 'ETF', crypto: 'Crypto' }

export default function AssetTrackerPage({ assetType }) {
  const { transactions, holdings, loading, priceLoading, reload } = usePortfolio(assetType)
  const watchlist = useWatchlist(assetType)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const invested = totalInvested(holdings)
  const marketValue = totalMarketValue(holdings)
  const unrealized = totalUnrealizedPnl(holdings)
  const realized = totalRealizedPnl(holdings)

  const sortedDesc = [...transactions].sort((a, b) => new Date(b.txn_date) - new Date(a.txn_date))
  const showManualPriceNote = (assetType === 'stock' || assetType === 'etf') && !hasStockApiKey()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display font-bold text-xl">{LABELS[assetType]}</h2>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Invested" value={formatMoney(invested, 'USD')} loading={loading} />
        <StatBox label="Market Value" value={marketValue ? formatMoney(marketValue, 'USD') : '—'} loading={loading || priceLoading} />
        <StatBox
          label="Unrealized P&L"
          value={unrealized != null && holdings.some(h=>h.unrealizedPnl!=null) ? formatMoney(unrealized, 'USD') : '—'}
          accent={unrealized >= 0 ? 'profit' : 'loss'}
          loading={loading || priceLoading}
        />
        <StatBox
          label="Realized P&L"
          value={formatMoney(realized, 'USD')}
          accent={realized >= 0 ? 'profit' : 'loss'}
          loading={loading}
        />
      </div>

      {showManualPriceNote && (
        <p className="text-xs opacity-45 -mt-1">
          Live {LABELS[assetType].toLowerCase()} prices need a free Twelve Data API key (see README). Until then,
          unrealized P&L shows "—" — your cost basis and transaction history are tracked normally.
        </p>
      )}

      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-display font-semibold text-sm opacity-80">Holdings</h3>
        </div>
        {holdings.length === 0 ? (
          <p className="text-sm opacity-40 py-8 text-center">No holdings yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {holdings.map((h) => (
              <div key={h.symbol} className="flex items-center gap-3 px-4 py-3">
                <AssetLogo symbol={h.symbol} logoUrl={h.logo_url} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{h.symbol}</div>
                  <div className="text-xs opacity-45 truncate">
                    {Number(h.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })} qty · avg{' '}
                    {formatMoney(h.avgCost, h.currency)}
                  </div>
                </div>
                <div className="text-right shrink-0">
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
                    {h.unrealizedPct != null && <span className="ml-1 opacity-70">({formatPct(h.unrealizedPct)})</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-display font-semibold text-sm opacity-80">Transactions</h3>
          <button onClick={reload} className="p-1.5 rounded-lg hover:bg-white/10 opacity-50 hover:opacity-100">
            <RefreshCw size={14} />
          </button>
        </div>
        {sortedDesc.length === 0 ? (
          <p className="text-sm opacity-40 py-8 text-center">No transactions yet.</p>
        ) : (
          <div className="max-h-[340px] overflow-y-auto divide-y divide-white/5">
            {sortedDesc.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className={`p-1.5 rounded-lg shrink-0 ${
                    t.txn_type === 'buy' ? 'bg-profit-500/15 text-profit-400' : 'bg-loss-500/15 text-loss-400'
                  }`}
                >
                  {t.txn_type === 'buy' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {t.txn_type === 'buy' ? 'Bought' : 'Sold'} {t.symbol}
                  </div>
                  <div className="text-xs opacity-40 truncate">
                    {new Date(t.txn_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {t.note ? ` · ${t.note}` : ''}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="numeric text-sm font-semibold">{formatMoney(t.total_cost, t.currency)}</div>
                  <div className="numeric text-[11px] opacity-40">
                    {Number(t.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })} @ {formatMoney(t.price, t.currency)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditing(t)
                      setModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 opacity-50 hover:opacity-100"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleting(t)}
                    className="p-1.5 rounded-lg hover:bg-loss-500/15 opacity-50 hover:opacity-100 hover:text-loss-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <WatchlistSection assetType={assetType} items={watchlist.items} onChanged={watchlist.reload} />

      <TransactionFormModal
        open={modalOpen}
        assetType={assetType}
        editingTransaction={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSaved={reload}
      />
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemLabel="this transaction"
        onConfirm={async () => {
          await deleteHoldingsTransaction(deleting.id)
          reload()
        }}
      />
    </div>
  )
}
