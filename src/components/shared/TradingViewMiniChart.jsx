import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

let scriptLoadPromise = null
function loadTradingViewScript() {
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve) => {
    if (window.TradingView) return resolve()
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = resolve
    document.body.appendChild(script)
  })
  return scriptLoadPromise
}

/**
 * Embeds a TradingView mini symbol-overview widget.
 * `symbol` should ideally be exchange-qualified, e.g. "NASDAQ:AAPL" or "BINANCE:BTCUSDT".
 * Falls back to the raw symbol if no exchange prefix is given.
 */
export default function TradingViewMiniChart({ symbol, height = 160 }) {
  const containerRef = useRef(null)
  const { theme } = useTheme()
  const widgetId = useRef(`tv-widget-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''
    const widgetContainer = document.createElement('div')
    widgetContainer.id = widgetId.current
    containerRef.current.appendChild(widgetContainer)

    loadTradingViewScript().then(() => {
      if (cancelled || !window.TradingView) return
      new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: theme === 'dark' ? 'dark' : 'light',
        style: '3',
        locale: 'en',
        toolbar_bg: 'rgba(0,0,0,0)',
        enable_publishing: false,
        hide_top_toolbar: true,
        hide_legend: true,
        save_image: false,
        container_id: widgetId.current,
      })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, theme])

  return <div ref={containerRef} style={{ height }} className="w-full rounded-xl overflow-hidden" />
}
