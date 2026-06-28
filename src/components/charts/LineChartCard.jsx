import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import GlassCard from '../ui/GlassCard'

function CustomTooltip({ active, payload, label, valuePrefix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass !rounded-lg px-3 py-2 text-xs">
      <div className="opacity-60 mb-0.5">{label}</div>
      <div className="font-semibold numeric">
        {valuePrefix}
        {Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  )
}

export default function LineChartCard({
  title,
  data,
  dataKey = 'value',
  xKey = 'label',
  color = '#5b9bea',
  valuePrefix = '',
  height = 220,
  emptyMessage = 'No data yet',
  action,
}) {
  const hasData = data && data.length > 0

  return (
    <GlassCard className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-semibold text-sm opacity-80">{title}</h3>
        {action}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, opacity: 0.5 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#grad-${dataKey}-${color.replace('#', '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="flex items-center justify-center opacity-40 text-sm"
          style={{ height }}
        >
          {emptyMessage}
        </div>
      )}
    </GlassCard>
  )
}
