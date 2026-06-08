import { traitLabel } from '@/data/demoData'

interface DistChartProps {
  trait: string
  trendData?: number[]
  bins?: { label: string; count: number }[]
  height?: number
}

// Vibrant palette for distribution bars
const BAR_COLORS = [
  { from: '#f59e0b', to: '#fbbf24' },  // amber
  { from: '#10b981', to: '#34d399' },  // emerald
  { from: '#3b82f6', to: '#60a5fa' },  // blue
  { from: '#8b5cf6', to: '#a78bfa' },  // violet
  { from: '#ef4444', to: '#f87171' },  // red
]

export function DistChart({ trait, trendData, bins: propBins, height }: DistChartProps) {
  const bins = propBins ?? (() => {
    const data = trendData ?? []
    if (data.length === 0) return []
    const min = Math.min(...data)
    const max = Math.max(...data)
    const span = Math.max(max - min, 1)
    return Array.from({ length: 5 }, (_, i) => {
      const label = String(Math.round(min + span * (i / 4)))
      const count = [12, 26, 42, 31, 17][i]
      return { label, count }
    })
  })()
  if (bins.length === 0) return null
  const maxCount = Math.max(...bins.map((b) => b.count))
  const total = bins.reduce((s, b) => s + b.count, 0)

  return (
    <div>
      <div className="flex items-end gap-3 px-2 pb-8 pt-[22px]" style={{ height: height ? `${height}px` : '180px' }}>
        {bins.map((bin, i) => {
          const pct = Math.round((bin.count / total) * 100)
          const colors = BAR_COLORS[i % BAR_COLORS.length]
          return (
            <div
              key={bin.label}
              className="relative min-h-1 flex-1 rounded-t-lg shadow-sm transition-all hover:scale-[1.03] hover:shadow-md"
              style={{
                height: `${Math.max(6, (bin.count / maxCount) * 100)}%`,
                background: `linear-gradient(180deg, ${colors.from}, ${colors.to})`,
              }}
            >
              <span className="absolute -top-[24px] left-0 right-0 text-center">
                <span className="font-mono text-[14px] font-extrabold" style={{ color: colors.from }}>{bin.count}</span>
                <span className="ml-0.5 font-mono text-[10px] text-[var(--ss-muted)]">{pct}%</span>
              </span>
              <i className="absolute -bottom-7 left-0 right-0 text-center font-mono text-[12px] font-semibold not-italic text-[var(--ss-muted)]">{String(bin.label)}</i>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-center font-mono text-[11px] font-medium text-[var(--ss-muted)]">
        Distribuição simulada · {traitLabel[trait] ?? trait} · {total} animais
      </div>
    </div>
  )
}
