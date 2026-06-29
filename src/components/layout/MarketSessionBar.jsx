import { useEffect, useState } from 'react'
import {
  SESSIONS,
  getActiveSessions,
  isPeakVolume,
  getCurrentSessionLabel,
  nowPositionPct,
  sessionToLocalSpan,
  getTimezoneAbbrev,
} from '../../lib/marketSessions'

function formatClock(date) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return { h, m, s }
}

export default function MarketSessionBar() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { h, m, s } = formatClock(now)
  const tz = getTimezoneAbbrev(now)
  const active = getActiveSessions(now)
  const peak = isPeakVolume(now)
  const label = getCurrentSessionLabel(now)
  const nowPct = nowPositionPct(now)

  const hourMarks = ['12AM', '4AM', '8AM', '12PM', '4PM', '8PM', '11PM']

  return (
    <div className="glass !rounded-2xl px-4 py-3 mb-5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-baseline gap-1.5 numeric">
          <span className="font-display font-bold text-xl tracking-wide tabular-nums">
            {h}:{m}
          </span>
          <span className="font-display font-bold text-xl tracking-wide tabular-nums opacity-50">
            :{s}
          </span>
          {tz && (
            <span className="text-[10px] font-semibold uppercase opacity-40 ml-1">{tz}</span>
          )}
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            peak
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
              : active.length
              ? 'bg-profit-500/10 text-profit-400 border border-profit-500/25'
              : 'bg-white/5 text-current/50 border border-white/10'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${peak ? 'bg-amber-300' : 'bg-profit-400'} ${
              active.length ? 'session-dot' : ''
            }`}
          />
          {peak ? `PEAK VOLUME — ${label.toUpperCase()}` : `NOW: ${label.toUpperCase()}`}
        </div>
      </div>

      <div className="relative h-11 rounded-lg overflow-hidden bg-black/30 border border-white/5">
        {SESSIONS.map((session) => {
          const spans = sessionToLocalSpan(session, now)
          const isActive = active.some((a) => a.key === session.key)
          return spans.map((span, i) => (
            <div
              key={session.key + i}
              className="absolute top-0 h-full flex items-center justify-center transition-opacity"
              style={{
                left: `${span.startPct}%`,
                width: `${span.endPct - span.startPct}%`,
                backgroundColor: session.color,
                opacity: isActive ? 0.88 : 0.45,
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-wide truncate px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.92)' }}
              >
                {span.endPct - span.startPct > 7 ? session.label : ''}
              </span>
            </div>
          ))
        })}

        <div
          className="absolute top-0 h-full w-[2.5px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-10"
          style={{ left: `${nowPct}%` }}
        >
          <div className="absolute -top-1 -left-[3.5px] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
        </div>
      </div>

      <div className="flex justify-between text-[10px] opacity-55 font-semibold mt-1.5 px-0.5">
        {hourMarks.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
