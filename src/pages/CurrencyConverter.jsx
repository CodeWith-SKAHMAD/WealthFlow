import { useState, useEffect, useCallback } from 'react'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { Input, Select } from '../components/ui/Input'
import { convertCurrency, getRate, COMMON_CURRENCIES } from '../lib/currency'

const DEFAULT_QUICK = ['USD', 'EUR', 'BDT']

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [result, setResult] = useState(null)
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [quickValues, setQuickValues] = useState({})
  const [quickLoading, setQuickLoading] = useState(false)

  const runConversion = useCallback(async () => {
    if (!amount || isNaN(Number(amount))) return
    setLoading(true)
    setError('')
    try {
      const [converted, r] = await Promise.all([
        convertCurrency(amount, from, to),
        getRate(from, to),
      ])
      setResult(converted)
      setRate(r)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Could not fetch exchange rate.')
    } finally {
      setLoading(false)
    }
  }, [amount, from, to])

  const runQuickConversion = useCallback(async () => {
    if (!amount || isNaN(Number(amount))) return
    setQuickLoading(true)
    try {
      const entries = await Promise.all(
        DEFAULT_QUICK.map(async (cur) => [cur, await convertCurrency(amount, from, cur)])
      )
      setQuickValues(Object.fromEntries(entries))
    } catch {
      /* ignore — quick view is best-effort */
    } finally {
      setQuickLoading(false)
    }
  }, [amount, from])

  useEffect(() => {
    runConversion()
  }, [runConversion])

  useEffect(() => {
    runQuickConversion()
  }, [runQuickConversion])

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <GlassCard>
        <h2 className="font-display font-bold text-xl mb-1">Currency Converter</h2>
        <p className="text-xs opacity-45 mb-4">Live exchange rates, updated daily.</p>

        <Input
          label="Amount"
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mb-4"
        />

        <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)} className="mb-4">
          {COMMON_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-3 gap-3">
          {DEFAULT_QUICK.map((cur) => (
            <div key={cur} className="glass-inset rounded-xl p-3 text-center">
              <div className="text-[11px] opacity-45 font-semibold mb-1">{cur}</div>
              {quickLoading ? (
                <div className="h-6 w-16 mx-auto rounded bg-white/10 animate-pulse" />
              ) : (
                <div className="font-display font-bold numeric text-base truncate">
                  {quickValues[cur] != null
                    ? quickValues[cur].toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : '—'}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm opacity-80">
            Convert to any currency you like
          </h3>
          <button
            onClick={runConversion}
            className="p-2 rounded-lg hover:bg-white/10 opacity-50 hover:opacity-100"
            title="Refresh rate"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-end gap-2 mb-5">
          <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1">
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <button
            onClick={swap}
            className="p-2.5 rounded-xl glass-inset hover:bg-white/10 mb-0.5 shrink-0"
            title="Swap currencies"
          >
            <ArrowLeftRight size={16} />
          </button>
          <Select label="To" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1">
            {COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        {error ? (
          <p className="text-sm text-loss-400">{error}</p>
        ) : (
          <div className="glass-inset rounded-xl p-5 text-center">
            <div className="text-sm opacity-50 mb-1 numeric">
              {amount || 0} {from} =
            </div>
            <div className="font-display font-bold text-3xl numeric text-gradient-brand">
              {result != null ? result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '…'} {to}
            </div>
            {rate != null && (
              <div className="text-xs opacity-40 mt-2 numeric">
                1 {from} = {rate.toFixed(6)} {to}
              </div>
            )}
            {lastUpdated && (
              <div className="text-[10px] opacity-30 mt-1">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
