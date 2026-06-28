// Core portfolio math. Average-cost method throughout (matches user's chosen accounting method).

/**
 * Given a chronological list of buy/sell transactions for ONE symbol,
 * compute running average cost, remaining quantity, realized PnL, and
 * total invested (cost basis of what's currently held).
 *
 * transaction shape: { txn_type: 'buy'|'sell', quantity: number, price: number, date: string }
 */
export function computePosition(transactions) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))

  let quantity = 0
  let avgCost = 0
  let realizedPnl = 0
  let totalBought = 0
  let totalSold = 0

  for (const t of sorted) {
    const qty = Number(t.quantity) || 0
    const price = Number(t.price) || 0

    if (t.txn_type === 'buy') {
      const newTotalCost = avgCost * quantity + price * qty
      quantity += qty
      avgCost = quantity > 0 ? newTotalCost / quantity : 0
      totalBought += qty
    } else if (t.txn_type === 'sell') {
      const sellQty = Math.min(qty, quantity)
      realizedPnl += (price - avgCost) * sellQty
      quantity -= sellQty
      totalSold += qty
      // avgCost of remaining shares is unchanged under average-cost method
      if (quantity <= 0) {
        quantity = 0
        avgCost = 0
      }
    }
  }

  return {
    quantity,
    avgCost,
    costBasis: quantity * avgCost,
    realizedPnl,
    totalBought,
    totalSold,
  }
}

/**
 * Group raw transactions by symbol and compute a position summary for each,
 * then attach unrealized PnL using a currentPrice lookup map { SYMBOL: price }.
 */
export function buildHoldings(transactions, currentPrices = {}) {
  const bySymbol = {}
  for (const t of transactions) {
    if (!bySymbol[t.symbol]) bySymbol[t.symbol] = []
    bySymbol[t.symbol].push(t)
  }

  const holdings = Object.entries(bySymbol).map(([symbol, txns]) => {
    const pos = computePosition(txns)
    const currentPrice = currentPrices[symbol] ?? null
    const marketValue = currentPrice != null ? pos.quantity * currentPrice : null
    const unrealizedPnl =
      currentPrice != null ? (currentPrice - pos.avgCost) * pos.quantity : null
    const unrealizedPct =
      pos.costBasis > 0 && unrealizedPnl != null ? (unrealizedPnl / pos.costBasis) * 100 : null

    const meta = txns[txns.length - 1]

    return {
      symbol,
      name: meta.name || symbol,
      logo_url: meta.logo_url || null,
      currency: meta.currency || 'USD',
      asset_type: meta.asset_type,
      quantity: pos.quantity,
      avgCost: pos.avgCost,
      costBasis: pos.costBasis,
      realizedPnl: pos.realizedPnl,
      currentPrice,
      marketValue,
      unrealizedPnl,
      unrealizedPct,
    }
  })

  return holdings.filter((h) => h.quantity > 0 || h.realizedPnl !== 0)
}

/** Sum of cost basis across holdings still open (quantity > 0). */
export function totalInvested(holdings) {
  return holdings.reduce((sum, h) => sum + (h.quantity > 0 ? h.costBasis : 0), 0)
}

export function totalMarketValue(holdings) {
  return holdings.reduce((sum, h) => sum + (h.marketValue ?? h.costBasis), 0)
}

export function totalUnrealizedPnl(holdings) {
  return holdings.reduce((sum, h) => sum + (h.unrealizedPnl ?? 0), 0)
}

export function totalRealizedPnl(holdings) {
  return holdings.reduce((sum, h) => sum + (h.realizedPnl ?? 0), 0)
}

/**
 * The 3-field auto-calculation rule for the add-transaction form:
 * quantity * price = total. Given any two known fields, derive the third.
 * `changed` is which field the user just edited: 'quantity' | 'price' | 'total'
 */
export function autoCalcThirdField({ quantity, price, total }, changed) {
  const q = parseFloat(quantity)
  const p = parseFloat(price)
  const t = parseFloat(total)

  if (changed === 'quantity' || changed === 'price') {
    if (!isNaN(q) && !isNaN(p)) {
      return { ...{ quantity, price, total }, total: (q * p).toFixed(8).replace(/\.?0+$/, '') || '0' }
    }
  }
  if (changed === 'total') {
    if (!isNaN(t) && !isNaN(p) && p !== 0) {
      return { quantity: (t / p).toFixed(8).replace(/\.?0+$/, '') || '0', price, total }
    }
    if (!isNaN(t) && !isNaN(q) && q !== 0) {
      return { quantity, price: (t / q).toFixed(8).replace(/\.?0+$/, '') || '0', total }
    }
  }
  return { quantity, price, total }
}

export function formatMoney(value, currency = 'USD', opts = {}) {
  if (value == null || isNaN(value)) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: opts.decimals ?? 2,
      minimumFractionDigits: opts.decimals ?? 2,
    }).format(value)
  } catch {
    return `${value.toFixed(opts.decimals ?? 2)} ${currency}`
  }
}

export function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatPct(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}
