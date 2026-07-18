import { fmt, traitLabel } from '@/lib/traits'
import { useBreed } from '@/lib/breed'

interface EvoChartProps {
  data: number[]
  years: string[]
  trait: string
  width?: number
  height?: number
}

export function EvoChart({ data, years, trait, width = 540, height = 220 }: EvoChartProps) {
  const { traitLabels } = useBreed()
  const pl = 46
  const pr = 18
  const pt = 18
  const pb = 30
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = Math.max(max - min, 1)
  const lo = min - span * 0.25
  const hi = max + span * 0.15
  const x = (i: number) => pl + (i * (width - pl - pr)) / (years.length - 1)
  const y = (v: number) => pt + (1 - (v - lo) / (hi - lo)) * (height - pt - pb)
  const points = data.map((v, i) => `${x(i)},${y(v)}`)
  const area = `${pl},${height - pb} ${points.join(' ')} ${x(data.length - 1)},${height - pb}`

  const gradId = `evo-grad-${trait}`
  const lineColor = '#1e3a5f'
  const dotFill = '#1e3a5f'
  const areaFrom = '#1e3a5f'
  const areaTo = '#e2e8f0'
  const labelColor = '#0f2942'
  const trendColor = '#94a3b8'

  const trendY1 = y(data[0])
  const trendY2 = y(data[data.length - 1])

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaFrom} stopOpacity="0.12" />
          <stop offset="100%" stopColor={areaTo} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map((k) => {
        const gv = lo + ((hi - lo) * k) / 4
        const gy = y(gv)
        return (
          <g key={k}>
            <line x1={pl} y1={gy} x2={width - pr} y2={gy} stroke="#e2e8f0" strokeWidth="0.8" />
            <text x={pl - 8} y={gy + 3} fontFamily="var(--ss-mono)" fontSize="9" fill="#94a3b8" textAnchor="end">
              {Math.round(gv)}
            </text>
          </g>
        )
      })}

      {/* Year labels */}
      {years.map((yr, i) => (
        <text key={yr} x={x(i)} y={height - 9} fontFamily="var(--ss-mono)" fontSize="9" fill="#94a3b8" textAnchor="middle">
          {yr}
        </text>
      ))}

      {/* Trend line (dashed) */}
      <line x1={x(0)} y1={trendY1} x2={x(data.length - 1)} y2={trendY2} stroke={trendColor} strokeWidth="1" strokeDasharray="5 3" opacity="0.5" />

      {/* Area fill */}
      <polygon points={area} fill={`url(#${gradId})`} />

      {/* Main line */}
      <polyline points={points.join(' ')} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {data.map((v, i) => (
        <g key={`${v}-${i}`}>
          <circle cx={x(i)} cy={y(v)} r="3" fill="#fff" stroke={dotFill} strokeWidth="1.5" />
        </g>
      ))}

      {/* Last value label */}
      <text x={width - pr - 6} y={y(data[data.length - 1]) - 10} fontFamily="var(--ss-mono)" fontSize="11" fontWeight="700" fill={labelColor} textAnchor="end">
        {traitLabels[trait] ?? traitLabel[trait] ?? trait.toUpperCase()} {fmt(trait, data[data.length - 1])}
      </text>
    </svg>
  )
}

