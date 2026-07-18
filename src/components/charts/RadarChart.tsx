import type { RadarGroup } from '@/lib/traits'

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
          stroke="var(--ss-border)"
        />
      ))}
      {group.names.map((name, idx) => {
        const a = angle(idx)
        return (
          <g key={name}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(a) * radius} y2={cy + Math.sin(a) * radius} stroke="var(--ss-border-2)" />
            <text x={cx + Math.cos(a) * (radius + 15)} y={cy + Math.sin(a) * (radius + 15) + 3} fontFamily="var(--ss-mono)" fontSize="9" fill="var(--ss-muted)" textAnchor="middle">
              {name}
            </text>
          </g>
        )
      })}
      <polygon points={poly(avg)} fill="rgba(113,113,122,.07)" stroke="var(--ss-muted-2)" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points={poly(animal)} fill="rgba(185,28,28,.10)" stroke="var(--ss-primary)" strokeWidth="1.75" />
      {group.traits.map((trait, idx) => {
        const a = angle(idx)
        const n = normalize(animal[trait] ?? 0, idx)
        return <circle key={trait} cx={cx + Math.cos(a) * radius * n} cy={cy + Math.sin(a) * radius * n} r="2.6" fill="var(--ss-primary)" />
      })}
    </svg>
  )
}

