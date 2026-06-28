// Crypto: CoinGecko public API — free, no API key, generous rate limit.
// Stocks/ETF: Twelve Data — free tier needs a signup key (no card). If no key is
// configured, callers should fall back to manual price entry; the UI handles that.

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'
const TWELVEDATA_BASE = 'https://api.twelvedata.com'

let coinListCache = null

/** Resolve a free-text symbol like "BTC" to a CoinGecko id like "bitcoin". */
export async function resolveCoinId(symbolOrName) {
  if (!coinListCache) {
    const res = await fetch(`${COINGECKO_BASE}/coins/list`)
    if (!res.ok) throw new Error('Failed to load coin list')
    coinListCache = await res.json()
  }
  const query = symbolOrName.trim().toLowerCase()
  const bySymbol = coinListCache.filter((c) => c.symbol === query)
  if (bySymbol.length === 1) return bySymbol[0].id
  if (bySymbol.length > 1) {
    const exact = bySymbol.find((c) => c.id === query)
    return (exact || bySymbol[0]).id
  }
  const byName = coinListCache.find((c) => c.name.toLowerCase() === query)
  if (byName) return byName.id
  return null
}

export async function getCryptoPrices(symbols, vsCurrency = 'usd') {
  const ids = []
  const idToSymbol = {}
  for (const sym of symbols) {
    const id = await resolveCoinId(sym)
    if (id) {
      ids.push(id)
      idToSymbol[id] = sym
    }
  }
  if (ids.length === 0) return {}

  const res = await fetch(
    `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=${vsCurrency}`
  )
  if (!res.ok) throw new Error('Failed to fetch crypto prices')
  const data = await res.json()

  const out = {}
  for (const [id, priceObj] of Object.entries(data)) {
    const sym = idToSymbol[id]
    out[sym] = priceObj[vsCurrency]
  }
  return out
}

export async function getStockPrice(symbol) {
  const apiKey = import.meta.env.VITE_TWELVEDATA_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(
      `${TWELVEDATA_BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const price = parseFloat(data.price)
    return isNaN(price) ? null : price
  } catch {
    return null
  }
}

export async function getStockPrices(symbols) {
  const out = {}
  await Promise.all(
    symbols.map(async (sym) => {
      const price = await getStockPrice(sym)
      if (price != null) out[sym] = price
    })
  )
  return out
}

export function hasStockApiKey() {
  return Boolean(import.meta.env.VITE_TWELVEDATA_API_KEY)
}

/** Logo for a stock/crypto symbol — best-effort, free, no key. */
export function getLogoUrl(assetType, symbol) {
  if (!symbol) return null
  const clean = symbol.trim().toUpperCase()
  if (assetType === 'crypto') {
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/32/color/${clean.toLowerCase()}.png`
  }
  return `https://img.logo.dev/ticker/${clean}?size=64`
}
