import { useState } from 'react'
import { Delete } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { Input } from '../components/ui/Input'
import clsx from 'clsx'

export default function Calculator() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
      <NormalCalculator />
      <PercentCalculator />
    </div>
  )
}

function NormalCalculator() {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState(null)

  const press = (val) => {
    if (val === 'C') {
      setExpr('')
      setResult(null)
      return
    }
    if (val === '⌫') {
      setExpr((e) => e.slice(0, -1))
      return
    }
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const safe = expr.replace(/[^0-9+\-*/.()%\s]/g, '')
        const evalResult = Function(`"use strict";return (${safe.replace(/%/g, '/100')})`)()
        setResult(evalResult)
      } catch {
        setResult('Error')
      }
      return
    }
    setExpr((e) => e + val)
  }

  const buttons = [
    'C', '(', ')', '⌫',
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '%', '+',
  ]

  return (
    <GlassCard>
      <h3 className="font-display font-semibold mb-3">Calculator</h3>
      <div className="glass-inset rounded-xl p-4 mb-3 min-h-[70px] flex flex-col items-end justify-end">
        <div className="text-sm opacity-50 numeric truncate w-full text-right">{expr || '0'}</div>
        <div className="text-2xl font-bold numeric truncate w-full text-right">
          {result !== null ? result : ''}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((b) => (
          <button
            key={b}
            onClick={() => press(b)}
            className={clsx(
              'h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center',
              ['/', '*', '-', '+', '%'].includes(b)
                ? 'bg-brand-500/20 text-brand-300 hover:bg-brand-500/30'
                : ['C', '⌫'].includes(b)
                ? 'bg-loss-500/15 text-loss-400 hover:bg-loss-500/25'
                : 'glass-inset hover:bg-white/10'
            )}
          >
            {b === '⌫' ? <Delete size={16} /> : b}
          </button>
        ))}
        <button
          onClick={() => press('=')}
          className="col-span-4 h-12 rounded-xl btn-3d text-white font-bold"
        >
          =
        </button>
      </div>
    </GlassCard>
  )
}

function PercentCalculator() {
  const [amount, setAmount] = useState('')
  const [percent, setPercent] = useState('')

  const a = parseFloat(amount)
  const p = parseFloat(percent)
  const valid = !isNaN(a) && !isNaN(p)
  const result = valid ? (a * p) / 100 : null
  const resultTotal = valid ? a + result : null

  return (
    <GlassCard>
      <h3 className="font-display font-semibold mb-1">Percentage Calculator</h3>
      <p className="text-xs opacity-45 mb-4">Find out how much a percentage of an amount comes to.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Input
          label="Amount"
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
        />
        <Input
          label="Percentage (%)"
          type="number"
          step="any"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          placeholder="15"
        />
      </div>

      <div className="glass-inset rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-60">{percent || '0'}% of {amount || '0'} is</span>
          <span className="font-display font-bold numeric text-lg text-brand-400">
            {result !== null ? result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
          </span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-60">Amount + that {percent || '0'}%</span>
          <span className="font-display font-bold numeric text-lg text-profit-400">
            {resultTotal !== null ? resultTotal.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
