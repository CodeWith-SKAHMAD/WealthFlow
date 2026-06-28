import { useState, useEffect, useCallback } from 'react'
import { fetchHoldingsTransactions, fetchAllHoldingsTransactions } from '../lib/db'
import { getCryptoPrices, getStockPrices, hasStockApiKey } from '../lib/prices'
import { buildHoldings } from '../lib/calculations'

/**
 * Loads transactions for a given asset_type ('stock'|'etf'|'crypto'|null for all),
 * fetches live prices where possible, and returns computed holdings.
 */
export function usePortfolio(assetType) {
  const [transactions, setTransactions] = useState([])
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = assetType
        ? await fetchHoldingsTransactions(assetType)
        : await fetchAllHoldingsTransactions()
      setTransactions(data)

      const symbols = [...new Set(data.map((t) => t.symbol))]
      if (symbols.length > 0) {
        setPriceLoading(true)
        const cryptoSymbols = data.filter((t) => t.asset_type === 'crypto').map((t) => t.symbol)
        const stockSymbols = data
          .filter((t) => t.asset_type === 'stock' || t.asset_type === 'etf')
          .map((t) => t.symbol)
        const uniqueCrypto = [...new Set(cryptoSymbols)]
        const uniqueStock = [...new Set(stockSymbols)]

        const [cryptoPrices, stockPrices] = await Promise.all([
          uniqueCrypto.length ? getCryptoPrices(uniqueCrypto).catch(() => ({})) : {},
          uniqueStock.length && hasStockApiKey() ? getStockPrices(uniqueStock).catch(() => ({})) : {},
        ])
        setPrices({ ...cryptoPrices, ...stockPrices })
        setPriceLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }, [assetType])

  useEffect(() => {
    load()
  }, [load])

  const holdings = buildHoldings(transactions, prices)

  return { transactions, holdings, prices, loading, priceLoading, error, reload: load, setPrices }
}
