import { useState, useEffect, useCallback } from 'react'
import { fetchLedgerTransactions } from '../lib/db'

export function useLedger(currency) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLedgerTransactions(currency)
      setTransactions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currency])

  useEffect(() => {
    load()
  }, [load])

  const balance = transactions.reduce(
    (sum, t) => sum + (t.direction === 'in' ? Number(t.amount) : -Number(t.amount)),
    0
  )

  let running = 0
  const chartData = transactions.map((t) => {
    running += t.direction === 'in' ? Number(t.amount) : -Number(t.amount)
    return {
      label: new Date(t.txn_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: running,
    }
  })

  return { transactions, balance, chartData, loading, error, reload: load }
}
