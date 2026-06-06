import { traitLabel } from '@/data/demoData'

interface DistChartProps {
  trait: string
  trendData: number[]
  height?: number
}

export function DistChart({ trait, trendData, height }: DistChartProps) {
  const min = Math.min(...trendData)
  const max = Math.max(...trendData)
  const span = Math.max(max - min, 1)
  const bins = Array.from({ length: 5 }, (_, i) => {
    const label = Math.round(min + span * (i / 4))
    const count = [12, 26, 42, 31, 17][i]
    return { label, count }
  })
  const maxCount = Math.max(...bins.map((b) => b.count))

  return (
    <div>
      <div className="flex items-end gap-2.5 px-1 pb-5 pt-[18px]" style={{ height: height ? `${height}px` : '160px' }}>
        {bins.map((bin) => (
          <div
            key={bin.label}
            className="relative min-h-1 flex-1 rounded-t-[5px] border-t-2 border-[var(--ss-primary)] bg-[var(--ss-primary-soft)]"
            style={{ height: `${Math.max(4, (bin.count / maxCount) * 100)}%` }}
          >
            <span className="absolute -top-[19px] left-0 right-0 text-center font-mono text-[10px] text-[var(--ss-muted)]">{bin.count}</span>
            <i className="absolute -bottom-5 left-0 right-0 text-center font-mono text-[9px] not-italic text-[var(--ss-muted)]">{bin.label}</i>
          </div>
        ))}
      </div>
      <div className="text-center font-mono text-[10px] text-[var(--ss-muted)]">Distribuição simulada · {traitLabel[trait] ?? trait}</div>
    </div>
  )
}
