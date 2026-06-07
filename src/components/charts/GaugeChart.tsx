interface GaugeChartProps {
  label: string
  value: number
  formattedValue: string
  min: number
  max: number
  natAvg: number
  zone: string
  zoneColor: string
}

const zones = [
  ['#FCA5A5', 180, 135],
  ['#FCD34D', 135, 90],
  ['#86EFAC', 90, 45],
  ['#34D399', 45, 0],
] as const

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function arcPath(start: number, end: number) {
  const s = polar(90, 92, 68, start)
  const e = polar(90, 92, 68, end)
  return `M ${s.x} ${s.y} A 68 68 0 0 1 ${e.x} ${e.y}`
}

function clampPct(value: number, min: number, max: number) {
  if (max === min) return 0.5
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

export function GaugeChart({ label, formattedValue, min, max, value, zone }: GaugeChartProps) {
  const pct = clampPct(value, min, max)
  const needleAngle = 180 - pct * 180
  const needle = polar(90, 92, 54, needleAngle)

  return (
    <div className="flex flex-col items-center gap-2 rounded-[14px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-5 py-6">
      <svg viewBox="0 0 180 116" className="h-[130px] w-full max-w-[220px] overflow-visible">
        <defs>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g fill="none" strokeLinecap="round" strokeWidth="12">
          {zones.map(([color, start, end]) => <path key={color} d={arcPath(start, end)} stroke={color} />)}
        </g>
        <line x1="90" y1="92" x2={needle.x} y2={needle.y} stroke="var(--ss-primary)" strokeWidth="3" strokeLinecap="round" filter="url(#gaugeGlow)" />
        <circle cx="90" cy="92" r="6" fill="var(--ss-primary)" filter="url(#gaugeGlow)" />
        <circle cx="90" cy="92" r="2.5" fill="white" />
      </svg>
      <div className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--ss-muted)]">{label}</div>
      <div className="font-mono text-[36px] font-black leading-none tracking-[-2px] text-[var(--ss-fg)]">{formattedValue}</div>
      <div className="flex w-full max-w-[200px] justify-between px-1 font-mono text-[10px] text-[var(--ss-muted-2)]">
        <span>{min}</span><span>{max}</span>
      </div>
      <span className="rounded-[20px] bg-[var(--ss-primary-soft)] px-3 py-1 text-[10px] font-bold text-[var(--ss-primary)]">{zone}</span>
    </div>
  )
}
