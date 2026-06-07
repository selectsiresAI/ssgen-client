interface ComboChartProps {
  years: string[]
  herdData: number[]
  nationalData: number[]
  top25Data: number[]
  trait: string
  formatter: (trait: string, val: number) => string
}

function scale(v: number, min: number, max: number) {
  return max === min ? 130 : 220 - ((v - min) / (max - min)) * 175
}

function points(data: number[], min: number, max: number, step: number) {
  return data.map((v, i) => `${80 + i * step},${scale(v, min, max)}`).join(' ')
}

export function ComboChart({ years, herdData, nationalData, top25Data, trait, formatter }: ComboChartProps) {
  const all = [...herdData, ...nationalData, ...top25Data]
  const min = Math.min(...all) * 0.96
  const max = Math.max(...all) * 1.04
  const step = years.length > 1 ? 580 / (years.length - 1) : 0

  return (
    <div>
      <svg viewBox="0 0 720 280" className="w-full">
        <defs>
          <linearGradient id={`barGrad-${trait}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(185,28,28,.85)" />
            <stop offset="100%" stopColor="rgba(185,28,28,.4)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="50" x2="695" y1={45 + i * 40} y2={45 + i * 40} stroke="var(--ss-border-2)" />)}
        {herdData.map((v, i) => {
          const x = 80 + i * step
          const y = scale(v, min, max)
          const isLast = i === herdData.length - 1
          return (
            <g key={years[i]}>
              <rect x={x - 29} y={y} width="58" height={220 - y} rx="5" fill={`url(#barGrad-${trait})`} />
              <text x={x} y={y - 7} textAnchor="middle" fontSize={isLast ? 13 : 11} fontWeight="800" fontFamily="var(--ss-mono)" fill={isLast ? 'var(--ss-primary)' : 'var(--ss-fg)'}>{formatter(trait, v)}</text>
              <text x={x} y="238" textAnchor="middle" fontSize={isLast ? 12 : 11} fontWeight={isLast ? 800 : 600} fill={isLast ? 'var(--ss-primary)' : 'var(--ss-muted)'}>{years[i]}</text>
            </g>
          )
        })}
        <polyline points={points(nationalData, min, max, step)} fill="none" stroke="var(--ss-muted-2)" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />
        <polyline points={points(top25Data, min, max, step)} fill="none" stroke="var(--ss-green)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={80 + (years.length - 1) * step} cy={scale(nationalData.at(-1) ?? 0, min, max)} r="4.5" fill="var(--ss-muted-2)" />
        <circle cx={80 + (years.length - 1) * step} cy={scale(top25Data.at(-1) ?? 0, min, max)} r="4.5" fill="var(--ss-green)" />
        <text x="676" y={scale(nationalData.at(-1) ?? 0, min, max) - 8} fontSize="10" fontWeight="700" fill="var(--ss-muted)">Nacional {formatter(trait, nationalData.at(-1) ?? 0)}</text>
        <text x="676" y={scale(top25Data.at(-1) ?? 0, min, max) - 8} fontSize="10" fontWeight="700" fill="var(--ss-green)">Top 25% {formatter(trait, top25Data.at(-1) ?? 0)}</text>
      </svg>
      <div className="mt-2.5 flex justify-center gap-5">
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ss-muted)]"><i className="h-3 w-3 rounded bg-[var(--ss-primary)]" />Meu Rebanho</span>
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ss-muted)]"><i className="w-5 border-t-2 border-dashed border-[var(--ss-muted-2)]" />Média Nacional</span>
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ss-muted)]"><i className="h-0.5 w-5 rounded bg-[var(--ss-green)]" />Top 25%</span>
      </div>
    </div>
  )
}
