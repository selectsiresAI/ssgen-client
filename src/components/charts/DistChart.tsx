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
      <div className="flex items-end gap-2.5 px-1 pb-6 pt-[18px]" style={{ height: height ? `${height}px` : '160px' }}>
        {bins.map((bin) => (
          <div
            key={bin.label}
            className="relative min-h-1 flex-1 rounded-t-[5px] bg-[linear-gradient(180deg,rgba(185,28,28,.85),rgba(185,28,28,.4))]"
            style={{ height: `${Math.max(4, (bin.count / maxCount) * 100)}%` }}
          >
            <span className="absolute -top-[22px] left-0 right-0 text-center font-mono text-[13px] font-extrabold text-[var(--ss-fg)]">{bin.count}</span>
            <i className="absolute -bottom-6 left-0 right-0 text-center font-mono text-[12px] font-semibold not-italic text-[var(--ss-muted)]">{bin.label}</i>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center font-mono text-[11px] font-medium text-[var(--ss-muted)]">Distribuição simulada · {traitLabel[trait] ?? trait}</div>
    </div>
  )
}
