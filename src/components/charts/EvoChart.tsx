import { fmt, traitLabel } from '@/data/demoData'

interface EvoChartProps {
  data: number[]
  years: string[]
  trait: string
  width?: number
  height?: number
}

export function EvoChart({ data, years, trait, width = 540, height = 220 }: EvoChartProps) {
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

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      {[0, 1, 2, 3].map((k) => {
        const gv = lo + ((hi - lo) * k) / 3
        const gy = y(gv)
        return (
          <g key={k}>
            <line x1={pl} y1={gy} x2={width - pr} y2={gy} stroke="var(--ss-border-2)" />
            <text x={pl - 8} y={gy + 3} fontFamily="var(--ss-mono)" fontSize="10" fill="var(--ss-muted)" textAnchor="end">
              {Math.round(gv)}
            </text>
          </g>
        )
      })}
      {years.map((yr, i) => (
        <text key={yr} x={x(i)} y={height - 9} fontFamily="var(--ss-mono)" fontSize="10" fill="var(--ss-muted)" textAnchor="middle">
          {yr}
        </text>
      ))}
      <polygon points={area} fill="rgba(185,28,28,.06)" />
      <polyline points={points.join(' ')} fill="none" stroke="var(--ss-primary)" strokeWidth="2" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={`${v}-${i}`} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke="var(--ss-primary)" strokeWidth="1.8" />
      ))}
      <text x={width - pr - 6} y={y(data[data.length - 1]) - 9} fontFamily="var(--ss-mono)" fontSize="12" fontWeight="800" fill="var(--ss-primary)" textAnchor="end">
        {traitLabel[trait] ?? trait.toUpperCase()} {fmt(trait, data[data.length - 1])}
      </text>
    </svg>
  )
}
