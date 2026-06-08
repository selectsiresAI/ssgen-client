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
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="50" x2="695" y1={45 + i * 40} y2={45 + i * 40} stroke="#e2e8f0" strokeWidth="0.8" />)}
        {herdData.map((v, i) => {
          const x = 80 + i * step
          const y = scale(v, min, max)
          const isLast = i === herdData.length - 1
          return (
            <g key={years[i]}>
              <rect x={x - 29} y={y} width="58" height={220 - y} rx="4" fill={`url(#barGrad-${trait})`} />
              <text x={x} y={y - 7} textAnchor="middle" fontSize={isLast ? 12 : 10} fontWeight="700" fontFamily="var(--ss-mono)" fill={isLast ? '#0f2942' : '#334155'}>{formatter(trait, v)}</text>
              <text x={x} y="238" textAnchor="middle" fontSize={isLast ? 11 : 10} fontWeight={isLast ? 700 : 500} fill={isLast ? '#0f2942' : '#94a3b8'}>{years[i]}</text>
            </g>
          )
        })}
        <polyline points={points(nationalData, min, max, step)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
        <polyline points={points(top25Data, min, max, step)} fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <circle cx={80 + (years.length - 1) * step} cy={scale(nationalData.at(-1) ?? 0, min, max)} r="3.5" fill="#94a3b8" />
        <circle cx={80 + (years.length - 1) * step} cy={scale(top25Data.at(-1) ?? 0, min, max)} r="3.5" fill="#475569" />
        <text x="676" y={scale(nationalData.at(-1) ?? 0, min, max) - 8} fontSize="9" fontWeight="600" fill="#94a3b8">Nacional {formatter(trait, nationalData.at(-1) ?? 0)}</text>
        <text x="676" y={scale(top25Data.at(-1) ?? 0, min, max) - 8} fontSize="9" fontWeight="600" fill="#475569">Top 25% {formatter(trait, top25Data.at(-1) ?? 0)}</text>
      </svg>
      <div className="mt-2.5 flex justify-center gap-5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ss-muted)]"><i className="h-3 w-3 rounded" style={{ background: '#1e3a5f' }} />Meu Rebanho</span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ss-muted)]"><i className="w-5 border-t-2 border-dashed" style={{ borderColor: '#94a3b8' }} />Média Nacional</span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ss-muted)]"><i className="h-0.5 w-5 rounded" style={{ background: '#475569' }} />Top 25%</span>
      </div>
    </div>
  )
}
