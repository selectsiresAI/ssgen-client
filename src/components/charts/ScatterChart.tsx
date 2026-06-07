import type { DemoAnimal } from '@/data/demoData'
import { traitLabel } from '@/data/demoData'

interface ScatterChartProps {
  animals: DemoAnimal[]
  xTrait: string
  yTrait: string
  colorTrait: string
  herdAvg: Record<string, number>
}

const colors = [
  { label: 'Elite', color: '#166534', r: 8 },
  { label: 'Top 25%', color: '#16A34A', r: 7 },
  { label: 'Médio', color: '#D97706', r: 6 },
  { label: 'Abaixo', color: '#C0633A', r: 5.5 },
] as const

function scale(v: number, min: number, max: number, a: number, b: number) {
  return max === min ? (a + b) / 2 : a + ((v - min) / (max - min)) * (b - a)
}

export function ScatterChart({ animals, xTrait, yTrait, colorTrait, herdAvg }: ScatterChartProps) {
  const xs = animals.map((a) => Number(a[xTrait]))
  const ys = animals.map((a) => Number(a[yTrait]))
  const xMin = Math.min(...xs, Number(herdAvg[xTrait])) * 0.96
  const xMax = Math.max(...xs, Number(herdAvg[xTrait])) * 1.04
  const yMin = Math.min(...ys, Number(herdAvg[yTrait])) * 0.96
  const yMax = Math.max(...ys, Number(herdAvg[yTrait])) * 1.04
  const ranked = animals.slice().sort((a, b) => Number(b[colorTrait]) - Number(a[colorTrait]))
  const quartile = new Map(ranked.map((a, i) => [a.id, Math.min(3, Math.floor((i / animals.length) * 4))]))
  const counts = colors.map((_, i) => ranked.filter((a) => quartile.get(a.id) === i).length)
  const meanX = scale(Number(herdAvg[xTrait]), xMin, xMax, 58, 690)
  const meanY = scale(Number(herdAvg[yTrait]), yMin, yMax, 330, 35)

  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--ss-border-2)] bg-[linear-gradient(180deg,#FAFAFA,#F0F0F2)]">
      <svg viewBox="0 0 720 400" className="block w-full">
        <defs>
          <linearGradient id="scatterBg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="white" /><stop offset="100%" stopColor="var(--ss-wash)" />
          </linearGradient>
        </defs>
        <rect x="45" y="24" width="650" height="318" rx="8" fill="url(#scatterBg)" />
        {[0, 1, 2, 3, 4].map((i) => <line key={`h${i}`} x1="58" x2="690" y1={45 + i * 70} y2={45 + i * 70} stroke="var(--ss-border-2)" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={`v${i}`} y1="35" y2="330" x1={70 + i * 120} x2={70 + i * 120} stroke="var(--ss-border-2)" />)}
        <line x1={meanX} x2={meanX} y1="35" y2="330" stroke="var(--ss-primary)" strokeDasharray="6 4" opacity=".3" />
        <line x1="58" x2="690" y1={meanY} y2={meanY} stroke="var(--ss-primary)" strokeDasharray="6 4" opacity=".3" />
        <line x1="58" y1="330" x2="690" y2="330" stroke="var(--ss-muted-2)" />
        <line x1="58" y1="35" x2="58" y2="330" stroke="var(--ss-muted-2)" />
        {animals.map((animal) => {
          const q = quartile.get(animal.id) ?? 3
          const style = colors[q]
          return (
            <circle
              key={animal.id}
              className="cursor-pointer opacity-90 transition-opacity hover:opacity-100"
              cx={scale(Number(animal[xTrait]), xMin, xMax, 58, 690)}
              cy={scale(Number(animal[yTrait]), yMin, yMax, 330, 35)}
              r={style.r}
              fill={style.color}
              stroke={q === 0 ? 'white' : 'rgba(255,255,255,.8)'}
              strokeWidth="2"
            >
              <title>{animal.name}</title>
            </circle>
          )
        })}
        {[0, 1, 2, 3, 4].map((i) => <text key={`xl${i}`} x={58 + i * 158} y="356" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ss-muted)" fontFamily="var(--ss-mono)">{Math.round(scale(i, 0, 4, xMin, xMax))}</text>)}
        {[0, 1, 2, 3, 4].map((i) => <text key={`yl${i}`} x="48" y={333 - i * 74} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--ss-muted)" fontFamily="var(--ss-mono)">{Math.round(scale(i, 0, 4, yMin, yMax))}</text>)}
        <text x="374" y="386" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ss-fg)">{traitLabel[xTrait] ?? xTrait}</text>
        <text x="17" y="185" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ss-fg)" transform="rotate(-90 17 185)">{traitLabel[yTrait] ?? yTrait}</text>
      </svg>
      <div className="flex flex-wrap gap-4 border-t border-[var(--ss-border-2)] bg-white px-4 py-3">
        {colors.map((item, i) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ss-muted)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.label} ({counts[i]})
          </div>
        ))}
      </div>
    </div>
  )
}
