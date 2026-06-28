import { useState } from 'react'
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { Select, Input } from '../components/ui/Input'
import Button from '../components/ui/Button'
import { fetchLedgerTransactions, fetchAllHoldingsTransactions } from '../lib/db'
import { exportToExcel, exportToCSV, exportToPDF } from '../lib/reports'

const ASSET_OPTIONS = [
  { value: 'all', label: 'Everything (Ledger + Stock + ETF + Crypto)' },
  { value: 'ledger', label: 'Ledger only (EUR + USDT)' },
  { value: 'stock', label: 'Stock only' },
  { value: 'etf', label: 'ETF only' },
  { value: 'crypto', label: 'Crypto only' },
]

export default function Reports() {
  const [scope, setScope] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buildRows = async () => {
    const rows = []

    if (scope === 'all' || scope === 'ledger') {
      const ledger = await fetchLedgerTransactions()
      for (const t of ledger) {
        rows.push({
          Date: t.txn_date,
          Type: 'Ledger',
          Asset: t.currency,
          Action: t.direction === 'in' ? 'Cash In' : 'Cash Out',
          Quantity: '',
          Price: '',
          Amount: t.amount,
          Currency: t.currency === 'USDT' ? 'USD' : t.currency,
          Note: t.note || '',
        })
      }
    }

    if (scope === 'all' || ['stock', 'etf', 'crypto'].includes(scope)) {
      const holdings = await fetchAllHoldingsTransactions()
      const filtered = scope === 'all' ? holdings : holdings.filter((h) => h.asset_type === scope)
      for (const t of filtered) {
        rows.push({
          Date: t.txn_date,
          Type: t.asset_type.toUpperCase(),
          Asset: t.symbol,
          Action: t.txn_type === 'buy' ? 'Buy' : 'Sell',
          Quantity: t.quantity,
          Price: t.price,
          Amount: t.total_cost,
          Currency: t.currency,
          Note: t.note || '',
        })
      }
    }

    let result = rows.sort((a, b) => new Date(a.Date) - new Date(b.Date))
    if (from) result = result.filter((r) => r.Date >= from)
    if (to) result = result.filter((r) => r.Date <= to)
    return result
  }

  const handleExport = async (format) => {
    setError('')
    setLoading(true)
    try {
      const rows = await buildRows()
      if (rows.length === 0) {
        setError('No transactions match these filters.')
        return
      }
      const filename = `wealthflow-${scope}-${new Date().toISOString().slice(0, 10)}`
      if (format === 'excel') exportToExcel(rows, `${filename}.xlsx`)
      else if (format === 'csv') exportToCSV(rows, `${filename}.csv`)
      else exportToPDF(rows, { title: `WealthFlow Report — ${scope}`, filename: `${filename}.pdf` })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <GlassCard>
        <h2 className="font-display font-bold text-xl mb-1">Reports</h2>
        <p className="text-xs opacity-45 mb-5">
          Build a custom report and download it as PDF, Excel, or CSV.
        </p>

        <Select label="Include" value={scope} onChange={(e) => setScope(e.target.value)} className="mb-4">
          {ASSET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <Input label="From date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        {error && <p className="text-sm text-loss-400 mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" icon={FileText} disabled={loading} onClick={() => handleExport('pdf')}>
            PDF
          </Button>
          <Button variant="outline" icon={FileSpreadsheet} disabled={loading} onClick={() => handleExport('excel')}>
            Excel
          </Button>
          <Button variant="outline" icon={FileDown} disabled={loading} onClick={() => handleExport('csv')}>
            CSV
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
