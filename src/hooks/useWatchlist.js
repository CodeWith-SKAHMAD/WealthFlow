import { useState, useEffect, useCallback } from 'react'
import { fetchWatchlist } from '../lib/db'

export function useWatchlist(assetType) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWatchlist(assetType)
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [assetType])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, reload: load }
}
