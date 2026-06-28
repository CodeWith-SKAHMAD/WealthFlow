import { useState, useEffect } from 'react'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { addLedgerTransaction, updateLedgerTransaction } from '../../lib/db'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function CashInOutModal({ open, onClose, currency, onSaved, editingTransaction }) {
  const { user } = useAuth()
  const isEditing = Boolean(editingTransaction)
  const [direction, setDirection] = useState('in')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingTransaction) {
      setDirection(editingTransaction.direction)
      setAmount(String(editingTransaction.amount))
      setDate(editingTransaction.txn_date)
      setNote(editingTransaction.note || '')
    }
  }, [editingTransaction])

  const reset = () => {
    setDirection('in')
    setAmount('')
    setNote('')
    setError('')
    setDate(new Date().toISOString().slice(0, 10))
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    setLoading(true)
    try {
      if (isEditing) {
        await updateLedgerTransaction(editingTransaction.id, {
          direction,
          amount: Number(amount),
          note: note || null,
          txn_date: date,
        })
      } else {
        await addLedgerTransaction({
          user_id: user.id,
          currency,
          direction,
          amount: Number(amount),
          note: note || null,
          txn_date: date,
        })
      }
      reset()
      onClose()
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={`${currency} — ${isEditing ? 'Edit Entry' : 'Cash In / Out'}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection('in')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              direction === 'in'
                ? 'bg-profit-500/20 text-profit-400 border border-profit-500/40'
                : 'glass-inset opacity-60'
            )}
          >
            <ArrowDownCircle size={16} /> Cash In
          </button>
          <button
            type="button"
            onClick={() => setDirection('out')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              direction === 'out'
                ? 'bg-loss-500/20 text-loss-400 border border-loss-500/40'
                : 'glass-inset opacity-60'
            )}
          >
            <ArrowUpCircle size={16} /> Cash Out
          </button>
        </div>

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label={`Amount (${currency})`}
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
        <Textarea
          label="Short note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Salary, Withdrawal, Transfer…"
          rows={2}
        />

        {error && <p className="text-sm text-loss-400">{error}</p>}

        <div className="flex gap-2 mt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Saving…' : isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
