import type { RadarGroup } from '@/data/demoData'

interface RadarChartProps {
  animal: Record<string, number>
  avg: Record<string, number>
  group: RadarGroup
  width?: number
  height?: number
}

export function RadarChart({ animal, avg, group, width = 260, height = 220 }: RadarChartProps) {
  const cx = width / 2
  const cy = height / 2 - 2
  const radius = Math.min(width, height) * 0.35
  const count = group.names.length
  const angle = (idx: number) => -Math.PI / 2 + (idx * 2 * Math.PI) / count
  const normalize = (value: number, idx: number) => {
    const max = group.max[idx]
    const off = group.offset?.[idx] ?? 0
    const inv = group.inv?.[idx]
    let n = (value + off) / (max + off)
    if (inv) n = 1 - n
    return Math.max(0.05, Math.min(1, n))
  }
  const poly = (source: Record<string, number>) =>
    group.traits.map((trait, idx) => {
      const a = angle(idx)
      const n = normalize(source[trait] ?? 0, idx)
      return `${cx + Math.cos(a) * radius * n},${cy + Math.sin(a) * radius * n}`
    }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
      {[0.33, 0.66, 1].map((level) => (
        <polygon
          key={level}
          points={group.names.map((_, idx) => `${cx + Math.cos(angle(idx)) * radius * level},${cy + Math.sin(angle(idx)) * radius * level}`).join(' ')}
          fill="none"
          stroke="#EBE7E2"
        />
      ))}
      {group.names.map((name, idx) => {
        const a = angle(idx)
        return (
          <g key={name}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(a) * radius} y2={cy + Math.sin(a) * radius} stroke="#F3F0EC" />
            <text x={cx + Math.cos(a) * (radius + 15)} y={cy + Math.sin(a) * (radius + 15) + 3} fontFamily="Geist Mono" fontSize="9" fill="#78716C" textAnchor="middle">
              {name}
            </text>
          </g>
        )
      })}
      <polygon points={poly(avg)} fill="rgba(140,130,120,.07)" stroke="#CBC4BC" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points={poly(animal)} fill="rgba(206,14,45,.10)" stroke="#CE0E2D" strokeWidth="1.75" />
      {group.traits.map((trait, idx) => {
        const a = angle(idx)
        const n = normalize(animal[trait] ?? 0, idx)
        return <circle key={trait} cx={cx + Math.cos(a) * radius * n} cy={cy + Math.sin(a) * radius * n} r="2.6" fill="#CE0E2D" />
      })}
    </svg>
  )
}
