// Free, no-API-key exchange rate service. Updates daily.
// https://www.exchangerate-api.com/docs/free (open.er-api.com mirror, no signup needed)
const BASE_URL = 'https://open.er-api.com/v6/latest'

let cache = { base: null, rates: null, fetchedAt: 0 }
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

export async function getRates(base = 'USD') {
  const now = Date.now()
  if (cache.base === base && cache.rates && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates
  }
  const res = await fetch(`${BASE_URL}/${base}`)
  if (!res.ok) throw new Error('Failed to fetch exchange rates')
  const data = await res.json()
  if (data.result !== 'success') throw new Error('Exchange rate API error')
  cache = { base, rates: data.rates, fetchedAt: now }
  return data.rates
}

export async function convertCurrency(amount, from, to) {
  if (from === to) return Number(amount)
  const rates = await getRates(from)
  const rate = rates[to]
  if (rate == null) throw new Error(`No rate available for ${to}`)
  return Number(amount) * rate
}

export async function getRate(from, to) {
  if (from === to) return 1
  const rates = await getRates(from)
  return rates[to] ?? null
}

export const COMMON_CURRENCIES = [
  'USD', 'EUR', 'BDT', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'AED', 'SAR',
]
