import { useState } from 'react'

export default function AssetLogo({ symbol, logoUrl, size = 32 }) {
  const [failed, setFailed] = useState(false)
  const initials = (symbol || '?').slice(0, 3).toUpperCase()

  if (!logoUrl || failed) {
    return (
      <div
        className="rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.32 }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={symbol}
      width={size}
      height={size}
      className="rounded-full object-cover shrink-0 bg-white/5"
      onError={() => setFailed(true)}
    />
  )
}
