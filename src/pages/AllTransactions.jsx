import { useState, useEffect, useMemo } from 'react'
import { Pencil, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { Select } from '../components/ui/Input'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import CashInOutModal from '../components/shared/CashInOutModal'
import TransactionFormModal from '../components/shared/TransactionFormModal'
import { fetchLedgerTransactions, fetchAllHoldingsTransactions, deleteLedgerTransaction, deleteHoldingsTransaction } from '../lib/db'
import { formatMoney } from '../lib/calculations'

export default function AllTransactions() {
  const [ledger, setLedger] = useState([])
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editingLedger, setEditingLedger] = useState(null)
  const [editingHolding, setEditingHolding] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    const [l, h] = await Promise.all([fetchLedgerTransactions(), fetchAllHoldingsTransactions()])
    setLedger(l)
    setHoldings(h)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const combined = useMemo(() => {
    const ledgerRows = ledger.map((t) => ({
      kind: 'ledger',
      id: t.id,
      date: t.txn_date,
      label: `${t.currency} ${t.direction === 'in' ? 'Cash In' : 'Cash Out'}`,
      sub: t.note || '—',
      amount: t.amount,
      currency: t.currency === 'USDT' ? 'USD' : t.currency,
      positive: t.direction === 'in',
      raw: t,
    }))
    const holdingRows = holdings.map((t) => ({
      kind: 'holding',
      id: t.id,
      date: t.txn_date,
      label: `${t.txn_type === 'buy' ? 'Bought' : 'Sold'} ${t.symbol} (${t.asset_type.toUpperCase()})`,
      sub: t.note || `${t.quantity} @ ${formatMoney(t.price, t.currency)}`,
      amount: t.total_cost,
      currency: t.currency,
      positive: t.txn_type === 'buy',
      raw: t,
    }))
    let all = [...ledgerRows, ...holdingRows].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (filter !== 'all') all = all.filter((r) => (filter === 'ledger' ? r.kind === 'ledger' : r.raw.asset_type === filter))
    return all
  }, [ledger, holdings, filter])

  const handleDelete = async () => {
    if (deleting.kind === 'ledger') await deleteLedgerTransaction(deleting.id)
    else await deleteHoldingsTransaction(deleting.id)
    await load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display font-bold text-xl">All Transactions</h2>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-48">
          <option value="all">All types</option>
          <option value="ledger">Ledger only</option>
          <option value="stock">Stock only</option>
          <option value="etf">ETF only</option>
          <option value="crypto">Crypto only</option>
        </Select>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <p className="text-sm opacity-40 py-10 text-center">Loading…</p>
        ) : combined.length === 0 ? (
          <p className="text-sm opacity-40 py-10 text-center">No transactions found.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {combined.map((row) => (
              <div key={row.kind + row.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`p-1.5 rounded-lg shrink-0 ${
                    row.positive ? 'bg-profit-500/15 text-profit-400' : 'bg-loss-500/15 text-loss-400'
                  }`}
                >
                  {row.positive ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{row.label}</div>
                  <div className="text-xs opacity-40 truncate">
                    {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                    {row.sub}
                  </div>
                </div>
                <div
                  className={`numeric font-semibold text-sm shrink-0 ${
                    row.positive ? 'text-profit-400' : 'text-loss-400'
                  }`}
                >
                  {row.positive ? '+' : '-'}
                  {formatMoney(row.amount, row.currency)}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      row.kind === 'ledger' ? setEditingLedger(row.raw) : setEditingHolding(row.raw)
                    }
                    className="p-1.5 rounded-lg hover:bg-white/10 opacity-50 hover:opacity-100"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleting(row)}
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

      {editingLedger && (
        <CashInOutModal
          open
          currency={editingLedger.currency}
          editingTransaction={editingLedger}
          onClose={() => setEditingLedger(null)}
          onSaved={load}
        />
      )}
      {editingHolding && (
        <TransactionFormModal
          open
          assetType={editingHolding.asset_type}
          editingTransaction={editingHolding}
          onClose={() => setEditingHolding(null)}
          onSaved={load}
        />
      )}
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemLabel="this transaction"
        onConfirm={handleDelete}
      />
    </div>
  )
}
