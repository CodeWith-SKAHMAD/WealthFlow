import { useState } from 'react'
import { Euro, DollarSign, Plus, Pencil, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import LineChartCard from '../components/charts/LineChartCard'
import CashInOutModal from '../components/shared/CashInOutModal'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import { useLedger } from '../hooks/useLedger'
import { deleteLedgerTransaction } from '../lib/db'
import { formatMoney } from '../lib/calculations'

const CURRENCY_SYMBOL = { EUR: '€', USDT: '₮' }

export default function Ledger() {
  return (
    <div className="flex flex-col gap-6">
      <LedgerSection currency="EUR" icon={Euro} />
      <LedgerSection currency="USDT" icon={DollarSign} />
    </div>
  )
}

function LedgerSection({ currency, icon: Icon }) {
  const { transactions, balance, chartData, loading, reload } = useLedger(currency)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const sortedDesc = [...transactions].sort((a, b) => new Date(b.txn_date) - new Date(a.txn_date))

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-brand-400" />
          <h2 className="font-display font-bold text-lg">{currency} Section</h2>
          {!loading && (
            <span className="numeric font-semibold text-sm opacity-60 ml-1">
              · Balance {CURRENCY_SYMBOL[currency]}
              {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <Button
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          Cash In/Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-1">
          <LineChartCard
            title={`${currency} Balance Trend`}
            data={chartData}
            color={currency === 'EUR' ? '#5b9bea' : '#22c55e'}
            height={180}
          />
        </div>

        <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="font-display font-semibold text-sm opacity-80">Transactions</h3>
          </div>
          {sortedDesc.length === 0 ? (
            <p className="text-sm opacity-40 py-8 text-center">No transactions yet.</p>
          ) : (
            <div className="max-h-[220px] overflow-y-auto divide-y divide-white/5">
              {sortedDesc.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={`p-1.5 rounded-lg shrink-0 ${
                      t.direction === 'in' ? 'bg-profit-500/15 text-profit-400' : 'bg-loss-500/15 text-loss-400'
                    }`}
                  >
                    {t.direction === 'in' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.note || 'No note'}</div>
                    <div className="text-xs opacity-40">
                      {new Date(t.txn_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div
                    className={`numeric font-semibold text-sm shrink-0 ${
                      t.direction === 'in' ? 'text-profit-400' : 'text-loss-400'
                    }`}
                  >
                    {t.direction === 'in' ? '+' : '-'}
                    {formatMoney(t.amount, currency === 'USDT' ? 'USD' : 'EUR').replace('$', '')}
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
      </div>

      <CashInOutModal
        open={modalOpen}
        currency={currency}
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
          await deleteLedgerTransaction(deleting.id)
          reload()
        }}
      />
    </div>
  )
}
