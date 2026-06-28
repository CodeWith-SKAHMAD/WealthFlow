import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import GlassCard from '../ui/GlassCard'

const PALETTE = ['#5b9bea', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#f43f5e', '#84cc16', '#ec4899']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="glass !rounded-lg px-3 py-2 text-xs">
      <div className="font-semibold">{p.name}</div>
      <div className="numeric opacity-70">
        {Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  )
}

export default function PieChartCard({ title, data, height = 220, emptyMessage = 'No data yet' }) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0)

  return (
    <GlassCard className="flex flex-col">
      <h3 className="font-display font-semibold text-sm opacity-80 mb-2">{title}</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, opacity: 0.7 }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center opacity-40 text-sm" style={{ height }}>
          {emptyMessage}
        </div>
      )}
    </GlassCard>
  )
}
