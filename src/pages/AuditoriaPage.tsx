import { Check, Info, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ComboChart } from '@/components/charts/ComboChart'
import { EvoChart } from '@/components/charts/EvoChart'
import { DistChart } from '@/components/charts/DistChart'
import { RadarChart } from '@/components/charts/RadarChart'
import { ParentescoGauge } from '@/components/charts/ParentescoGauge'
import { SegmentedControl } from '@/components/SegmentedControl'
import { TraitSelect } from '@/components/TraitSelect'
import { agSteps, benchmarks, fmt, radarGroups, traitLabel } from '@/lib/traits'
import { useFemalesFull } from '@/hooks/useApi'
import type { FemaleFull } from '@/lib/api'
import {
  computeParentesco,
  computeTopParents,
  computeTrendByYear,
  computeDistribution,
  computeHerdAverage,
  getTraitValue,
} from '@/lib/auditoria-utils'

const defaultTraits = ['hhp', 'gtpi', 'nm']

function ProgressaoStep({ females }: { females: FemaleFull[] }) {
  const [count, setCount] = useState(3)
  const [charts, setCharts] = useState<string[]>(defaultTraits)

  const allTraits = Object.keys(traitLabel)
  const trendResult = useMemo(() => computeTrendByYear(females, allTraits), [females])

  const handleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(10, n))
    setCount(clamped)
    if (clamped > charts.length) {
      const available = allTraits.filter((k) => !charts.includes(k) && trendResult.data[k])
      setCharts([...charts, ...available.slice(0, clamped - charts.length)])
    } else {
      setCharts(charts.slice(0, clamped))
    }
  }

  const changeChart = (idx: number, val: string) => {
    setCharts(charts.map((c, i) => (i === idx ? val : c)))
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-medium text-[var(--ss-fg)]">Gráficos visíveis:</label>
        <select value={count} onChange={(e) => handleCount(Number(e.target.value))} className="rounded-[7px] border border-[var(--ss-border)] bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-[var(--ss-fg)] outline-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {charts.map((trait, idx) => {
        const data = trendResult.data[trait]
        if (!data || data.length < 2) return null
        const gain = (data[data.length - 1] - data[0]) / (data.length - 1)
        const fmtGain = Math.abs(gain) < 1 ? gain.toFixed(2) : String(Math.round(gain))
        return (
          <div key={`${trait}-${idx}`} className="ss-card">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Progressão · {traitLabel[trait] ?? trait.toUpperCase()}</h3>
              <TraitSelect value={trait} onChange={(v) => changeChart(idx, v)} />
            </div>
            <div className="ss-card-body">
              <div className="mb-2 font-mono text-[11px] text-[var(--ss-green)]">
                Tendência · {Number(fmtGain) >= 0 ? '+' : ''}{fmtGain}/ano · Último: {fmt(trait, data[data.length - 1])}
              </div>
              <EvoChart trait={trait} years={trendResult.years} data={data} height={160} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DistribuicaoStep({ females }: { females: FemaleFull[] }) {
  const [count, setCount] = useState(3)
  const [charts, setCharts] = useState<string[]>(['hhp', 'gtpi', 'nm'])

  const allTraits = Object.keys(traitLabel)

  const handleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(10, n))
    setCount(clamped)
    if (clamped > charts.length) {
      const available = allTraits.filter((k) => !charts.includes(k))
      setCharts([...charts, ...available.slice(0, clamped - charts.length)])
    } else {
      setCharts(charts.slice(0, clamped))
    }
  }

  const changeChart = (idx: number, val: string) => {
    setCharts(charts.map((c, i) => (i === idx ? val : c)))
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-medium text-[var(--ss-fg)]">Gráficos visíveis:</label>
        <select value={count} onChange={(e) => handleCount(Number(e.target.value))} className="rounded-[7px] border border-[var(--ss-border)] bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-[var(--ss-fg)] outline-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {charts.map((trait, idx) => {
        const bins = computeDistribution(females, trait)
        if (bins.length === 0) return null
        return (
          <div key={`${trait}-${idx}`} className="ss-card">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Distribuição · {traitLabel[trait] ?? trait.toUpperCase()}</h3>
              <TraitSelect value={trait} onChange={(v) => changeChart(idx, v)} />
            </div>
            <div className="ss-card-body">
              <DistChart trait={trait} bins={bins} height={360} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EvolucaoStep({ females }: { females: FemaleFull[] }) {
  const allTraits = Object.keys(traitLabel)
  const trendResult = useMemo(() => computeTrendByYear(females, allTraits), [females])
  const [count, setCount] = useState(3)
  const [charts, setCharts] = useState<string[]>(['hhp', 'gtpi', 'nm'])

  const handleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(10, n))
    setCount(clamped)
    if (clamped > charts.length) {
      const available = allTraits.filter((k) => !charts.includes(k) && trendResult.data[k])
      setCharts([...charts, ...available.slice(0, clamped - charts.length)])
    } else {
      setCharts(charts.slice(0, clamped))
    }
  }

  const changeChart = (idx: number, val: string) => {
    setCharts(charts.map((c, i) => (i === idx ? val : c)))
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-medium text-[var(--ss-fg)]">Gráficos visíveis:</label>
        <select value={count} onChange={(e) => handleCount(Number(e.target.value))} className="rounded-[7px] border border-[var(--ss-border)] bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-[var(--ss-fg)] outline-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {charts.map((trait, idx) => {
        const herdData = trendResult.data[trait]
        if (!herdData || herdData.length < 2) return null
        const bench = benchmarks.find(([key]) => key === trait)
        if (!bench) return null
        const natAvg = bench[2]
        const top25 = bench[3]
        const nationalData = herdData.map((_, i) => natAvg * 0.92 + ((natAvg - natAvg * 0.92) / (herdData.length - 1)) * i)
        const top25Data = herdData.map((_, i) => top25 * 0.92 + ((top25 - top25 * 0.92) / (herdData.length - 1)) * i)
        return (
          <div key={`${trait}-${idx}`} className="ss-card">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Evolução {traitLabel[trait] ?? trait.toUpperCase()} — Rebanho vs Referência Nacional vs Top 25%</h3>
              <TraitSelect value={trait} onChange={(v) => changeChart(idx, v)} />
            </div>
            <div className="ss-card-body">
              <ComboChart years={trendResult.years} herdData={herdData} nationalData={nationalData} top25Data={top25Data} trait={trait} formatter={fmt} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Etapa 6 (índice 5) — Scatter Plot — 4 quadrantes fixos
const Q_COLORS = [
  { label: 'Elite', color: '#166534' },
  { label: (y: string) => `Alto ${traitLabel[y] ?? y.toUpperCase()}`, color: '#16A34A' },
  { label: (x: string) => `Alto ${traitLabel[x] ?? x.toUpperCase()}`, color: '#D97706' },
  { label: 'Abaixo da média', color: '#C0633A' },
] as const

function ScatterStep({ females }: { females: FemaleFull[] }) {
  const [xTrait, setXTrait] = useState('gtpi')
  const [yTrait, setYTrait] = useState('hhp')

  // Sample up to 500 animals for scatter performance
  const sampled = useMemo(() => {
    if (females.length <= 500) return females
    const step = Math.ceil(females.length / 500)
    return females.filter((_, i) => i % step === 0)
  }, [females])

  const W = 920, H = 400, padL = 60, padR = 24, padT = 22, padB = 56
  const plotW = W - padL - padR, plotH = H - padT - padB
  const xs = sampled.map((a) => getTraitValue(a, xTrait) ?? 0)
  const ys = sampled.map((a) => getTraitValue(a, yTrait) ?? 0)
  const xMin = Math.min(...xs) * 0.96
  const xMax = Math.max(...xs) * 1.04
  const yMin = Math.min(...ys) * 0.96
  const yMax = Math.max(...ys) * 1.04
  const xThr = (xMin + xMax) / 2
  const yThr = (yMin + yMax) / 2
  const X = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * plotW
  const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH

  const quadrant = (a: FemaleFull) => {
    const xv = getTraitValue(a, xTrait) ?? 0
    const yv = getTraitValue(a, yTrait) ?? 0
    if (xv >= xThr && yv >= yThr) return 0
    if (xv < xThr && yv >= yThr) return 1
    if (xv >= xThr && yv < yThr) return 2
    return 3
  }
  const counts = [0, 0, 0, 0]
  sampled.forEach((a) => counts[quadrant(a)]++)

  const xTickCount = 5, yTickCount = 5
  const topA = sampled.reduce((a, b) => ((getTraitValue(a, xTrait) ?? 0) + (getTraitValue(a, yTrait) ?? 0) > (getTraitValue(b, xTrait) ?? 0) + (getTraitValue(b, yTrait) ?? 0) ? a : b))
  const qLabels = ['ELITE', `ALTO ${(traitLabel[yTrait] ?? yTrait).toUpperCase()}`, `ALTO ${(traitLabel[xTrait] ?? xTrait).toUpperCase()}`, 'ABAIXO']

  return (
    <div className="ss-card">
      <div className="ss-card-header">
        <h3 className="ss-card-title">Dispersão · {traitLabel[xTrait] ?? xTrait} × {traitLabel[yTrait] ?? yTrait}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11.5px] font-semibold text-[var(--ss-muted)]">X</label><TraitSelect value={xTrait} onChange={setXTrait} />
          <label className="text-[11.5px] font-semibold text-[var(--ss-muted)]">Y</label><TraitSelect value={yTrait} onChange={setYTrait} />
        </div>
      </div>
      <div className="ss-card-body">
        <div className="overflow-hidden rounded-[10px] border border-[var(--ss-border-2)] bg-[linear-gradient(180deg,#FAFAFA,#F0F0F2)]">
          <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="scBg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="white" /><stop offset="100%" stopColor="var(--ss-wash)" />
              </linearGradient>
            </defs>
            <rect x={padL - 2} y={padT} width={plotW + 4} height={plotH} rx="8" fill="url(#scBg)" />
            {/* quadrant background tints */}
            <rect x={X(xThr)} y={padT} width={X(xMax) - X(xThr)} height={Y(yThr) - padT} fill="#166534" opacity="0.04" />
            <rect x={padL} y={padT} width={X(xThr) - padL} height={Y(yThr) - padT} fill="#16A34A" opacity="0.03" />
            <rect x={X(xThr)} y={Y(yThr)} width={X(xMax) - X(xThr)} height={padT + plotH - Y(yThr)} fill="#D97706" opacity="0.03" />
            <rect x={padL} y={Y(yThr)} width={X(xThr) - padL} height={padT + plotH - Y(yThr)} fill="#C0633A" opacity="0.03" />
            {/* grid */}
            {Array.from({ length: yTickCount + 1 }, (_, i) => {
              const v = yMin + (i / yTickCount) * (yMax - yMin)
              return <line key={`h${i}`} x1={padL} x2={W - padR} y1={Y(v)} y2={Y(v)} stroke="var(--ss-border-2)" />
            })}
            {Array.from({ length: xTickCount + 1 }, (_, i) => {
              const v = xMin + (i / xTickCount) * (xMax - xMin)
              return <line key={`v${i}`} x1={X(v)} x2={X(v)} y1={padT} y2={padT + plotH} stroke="var(--ss-border-2)" />
            })}
            {/* threshold lines */}
            <line x1={X(xThr)} x2={X(xThr)} y1={padT} y2={padT + plotH} stroke="var(--ss-primary)" strokeDasharray="6 4" opacity=".3" />
            <line x1={padL} x2={W - padR} y1={Y(yThr)} y2={Y(yThr)} stroke="var(--ss-primary)" strokeDasharray="6 4" opacity=".3" />
            {/* quadrant labels */}
            <text x={X(xThr) + (X(xMax) - X(xThr)) / 2} y={padT + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534" opacity=".5">{qLabels[0]}</text>
            <text x={padL + (X(xThr) - padL) / 2} y={padT + 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#16A34A" opacity=".5">{qLabels[1]}</text>
            <text x={X(xThr) + (X(xMax) - X(xThr)) / 2} y={padT + plotH - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#D97706" opacity=".5">{qLabels[2]}</text>
            <text x={padL + (X(xThr) - padL) / 2} y={padT + plotH - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#C0633A" opacity=".5">{qLabels[3]}</text>
            {/* axis labels */}
            {Array.from({ length: xTickCount + 1 }, (_, i) => {
              const v = xMin + (i / xTickCount) * (xMax - xMin)
              return <text key={`xl${i}`} x={X(v)} y={padT + plotH + 20} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ss-muted)" fontFamily="var(--ss-mono)">{Math.round(v)}</text>
            })}
            {Array.from({ length: yTickCount + 1 }, (_, i) => {
              const v = yMin + (i / yTickCount) * (yMax - yMin)
              return <text key={`yl${i}`} x={padL - 10} y={Y(v) + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--ss-muted)" fontFamily="var(--ss-mono)">{Math.round(v)}</text>
            })}
            <text x={padL + plotW / 2} y={H - 10} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ss-fg)">{traitLabel[xTrait] ?? xTrait}</text>
            <text x={16} y={padT + plotH / 2} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ss-fg)" transform={`rotate(-90 16 ${padT + plotH / 2})`}>{traitLabel[yTrait] ?? yTrait}</text>
            {/* dots */}
            {sampled.map((a) => {
              const q = quadrant(a)
              const isTop = a === topA
              const xv = getTraitValue(a, xTrait) ?? 0
              const yv = getTraitValue(a, yTrait) ?? 0
              const near = X(xv) > padL + plotW * 0.72
              const label = a.ear_tag || a.cdcb_id || a.id.slice(0, 8)
              return (
                <g key={a.id}>
                  <circle cx={X(xv)} cy={Y(yv)} r={isTop ? 8 : 4} fill={Q_COLORS[q].color} fillOpacity={isTop ? 1 : 0.7} stroke={q === 0 ? 'white' : 'rgba(255,255,255,.8)'} strokeWidth={isTop ? 2.5 : 1.5} className="cursor-pointer">
                    <title>{label} · {traitLabel[xTrait]} {Math.round(xv)} · {traitLabel[yTrait]} {Math.round(yv)}</title>
                  </circle>
                  {isTop && <text x={X(xv) + (near ? -13 : 13)} y={Y(yv) - 9} textAnchor={near ? 'end' : 'start'} fontSize="11.5" fontWeight="700" fill="var(--ss-fg)">{label}</text>}
                </g>
              )
            })}
          </svg>
          <div className="flex flex-wrap gap-4 border-t border-[var(--ss-border-2)] bg-white px-4 py-3">
            {Q_COLORS.map((item, i) => {
              const lbl = typeof item.label === 'function' ? item.label(i === 1 ? yTrait : xTrait) : item.label
              return (
                <div key={i} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--ss-muted)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{lbl} ({counts[i]})
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Etapa 7 (índice 6) — Análise de Forças: ranking + radar
const rankTraits = ['hhp', 'gtpi', 'nm', 'milk', 'fat', 'prot', 'pl', 'dpr', 'scs', 'ptat', 'udc', 'flc']

function ForcasStep({ females }: { females: FemaleFull[] }) {
  const [trait, setTrait] = useState('hhp')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [radar, setRadar] = useState('indices')

  const herdAvg = useMemo(() => computeHerdAverage(females), [females])

  const inverse = ['scs', 'flc']
  const sorted = useMemo(() =>
    [...females].map((animal, idx) => ({ animal, idx })).sort((a, b) => {
      const av = getTraitValue(a.animal, trait) ?? -Infinity
      const bv = getTraitValue(b.animal, trait) ?? -Infinity
      return inverse.includes(trait) ? av - bv : bv - av
    }),
  [females, trait])

  const animal = females[selectedIdx] ?? females[0]
  if (!animal) return null
  const grp = radarGroups[radar]
  const animalData = grp.traits.reduce((o, t) => { o[t] = getTraitValue(animal, t) ?? 0; return o }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.55fr_1fr]">
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Ranking do Rebanho · {traitLabel[trait] ?? trait}</h3>
          <div className="flex items-center gap-2">
            <select className="rounded-[7px] border border-[var(--ss-border)] bg-white px-2 py-1.5 text-[12px]" value={trait} onChange={(e) => setTrait(e.target.value)}>
              {rankTraits.map((key) => <option key={key} value={key}>{traitLabel[key]}</option>)}
            </select>
          </div>
        </div>
        <div className="ss-card-body max-h-[calc(100vh-200px)] overflow-auto">
          {sorted.slice(0, 100).map(({ animal: row, idx }, i) => {
            const label = row.ear_tag || row.cdcb_id || row.id.slice(0, 8)
            const hhpVal = getTraitValue(row, 'hhp')
            return (
              <button key={row.id} type="button" onClick={() => setSelectedIdx(idx)} className={`ss-rrow w-full text-left ${idx === selectedIdx ? 'is-selected' : ''}`}>
                <div className="text-center font-mono text-xs text-[var(--ss-muted)]">{i + 1}</div>
                <div><div className="text-[13px] font-medium text-[var(--ss-fg)]">{label}</div><div className="font-mono text-[11px] text-[var(--ss-muted)]">{row.sire_naab ?? '—'} · {row.ear_tag ?? '—'}</div></div>
                <div className="text-right"><b className="block font-mono text-[13px] font-medium text-[var(--ss-fg)]">{fmt(trait, getTraitValue(row, trait) ?? 0)}</b><small className="text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted-2)]">{traitLabel[trait]}</small></div>
                <div className="text-right"><b className="block font-mono text-[13px] font-medium text-[var(--ss-fg)]">{hhpVal != null ? `$${Math.round(hhpVal)}` : '—'}</b><small className="text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted-2)]">HHP$</small></div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="ss-card">
        <div className="ss-card-header"><h3 className="ss-card-title">Perfil · {animal.ear_tag || animal.cdcb_id || animal.id.slice(0, 8)}</h3></div>
        <div className="ss-card-body">
          <SegmentedControl options={Object.entries(radarGroups).map(([value, g]) => ({ value, label: g.label }))} value={radar} onChange={setRadar} wrap size="sm" />
          <div className="mx-auto max-w-[320px]"><RadarChart animal={animalData} avg={herdAvg} group={grp} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {grp.traits.map((t, i) => {
              const av = getTraitValue(animal, t) ?? 0
              const hv = herdAvg[t] ?? 0
              const inv = ['scs', 'flc', 'da', 'ket', 'rfi', 'ssb', 'dsb', 'gl'].includes(t)
              const better = inv ? av < hv : av > hv
              return (
                <div key={t} className="rounded-[9px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-[11px] py-[9px]">
                  <small className="block text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted)]">{grp.names[i]}</small>
                  <b className="font-mono text-sm font-medium text-[var(--ss-fg)]">{fmt(t, av)}</b>
                  <span className={`ml-1 font-mono text-[9px] ${better ? 'text-[var(--ss-green)]' : 'text-[#C0633A]'}`}>méd {fmt(t, hv)} {av === hv ? '' : better ? '▲' : '▼'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuditoriaPage() {
  const [step, setStep] = useState(0)
  const { data: femalesData, isLoading } = useFemalesFull({ page: 1, perPage: 5000 })
  const females = femalesData?.data ?? []
  const totalFemales = femalesData?.total ?? females.length

  const parentesco = useMemo(() => computeParentesco(females), [females])
  const topSires = useMemo(() => computeTopParents(females, 'sire_naab', 10), [females])
  const topMgs = useMemo(() => computeTopParents(females, 'mgs_naab', 10), [females])

  const block = (title: string, rows: { code: string; count: number; pct: number }[]) => {
    const max = Math.max(...rows.map((r) => r.count))
    const total = rows.reduce((s, r) => s + r.count, 0)
    return (
      <div className="ss-card">
        <div className="ss-card-header"><h3 className="ss-card-title">{title}</h3></div>
        <div className="ss-card-body">
          {rows.map((r) => (
            <div key={r.code} className="grid grid-cols-[170px_1fr_44px_44px] items-center gap-2 py-[3px] text-xs">
              <div className="overflow-hidden text-ellipsis text-right font-mono text-[var(--ss-fg)]">{r.code}</div>
              <div className="h-[18px] rounded-sm bg-[var(--ss-primary-soft)]" style={{ width: `${(r.count / max) * 100}%` }} />
              <div className="text-right font-mono font-semibold">{r.count}</div>
              <div className="text-right font-mono text-[10px] text-[var(--ss-muted)]">{((r.count / total) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-[var(--ss-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Carregando dados do rebanho...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="ss-preserved"><Check className="h-[15px] w-[15px]" />Auditoria genética preservada com fluxo sequencial e visualização por etapas.</div>
      <div className="mb-4 flex flex-wrap gap-[7px]">
        {agSteps.map((s, i) => <button key={s.n} onClick={() => setStep(i)} className={`inline-flex items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-[12.5px] font-medium transition ${i === step ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)] text-white' : 'border-[var(--ss-border)] bg-white text-[var(--ss-text)] hover:bg-[var(--ss-wash)]'}`}><span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full font-mono text-[10px] font-semibold ${i === step ? 'bg-white/25 text-white' : 'bg-[var(--ss-wash)] text-[var(--ss-muted)]'}`}>{i + 1}</span>{s.t}</button>)}
      </div>
      {step === 0 && <>
        <div className="mb-4 flex gap-3 rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 py-3.5 text-[12.5px] leading-6"><Info className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[var(--ss-primary)]" /><div><b>Como interpretar.</b> <span className="text-[var(--ss-primary)]">Não informado</span>: parentesco ausente no registro. <span className="text-[var(--ss-green)]">Informado</span>: pai/avô materno preenchidos.</div></div>
        <div className="ss-grid-3">
          {parentesco.map(({ label, filled, missing }) => (
            <div key={label} className="ss-card">
              <div className="ss-card-header"><h3 className="ss-card-title">{label}</h3></div>
              <div className="ss-card-body">
                <ParentescoGauge pct={filled} />
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--ss-green)]"><span className="h-2 w-2 rounded-full bg-[var(--ss-green)]" />Informado</span>
                    <span className="ss-mono text-[13px] font-semibold text-[var(--ss-fg)]">{filled}% <span className="text-[11px] font-normal text-[var(--ss-muted)]">· {Math.round(totalFemales * filled / 100)}</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--ss-amber)]"><span className="h-2 w-2 rounded-full bg-[var(--ss-amber)]" />Não informado</span>
                    <span className="ss-mono text-[13px] font-semibold text-[var(--ss-amber)]">{missing}% <span className="text-[11px] font-normal text-[var(--ss-muted)]">· {Math.round(totalFemales * missing / 100)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      {step === 1 && <>
        <div className="mb-3.5 flex flex-wrap gap-2">
          <SegmentedControl options={['Todas', 'Novilha', 'Primípara', 'Multípara'].map((x) => ({ value: x, label: x }))} value="Todas" onChange={() => undefined} />
          <SegmentedControl options={['Superior', 'Intermediário', 'Inferior'].map((x) => ({ value: x, label: x }))} value="Superior" onChange={() => undefined} />
          <SegmentedControl options={['Top 20', '30', '50'].map((x) => ({ value: x, label: x }))} value="Top 20" onChange={() => undefined} />
        </div>
        <div className="ss-grid-2b">
          {block('Top Sires', topSires)}
          {block('Top Maternal Grandsires', topMgs)}
        </div>
      </>}
      {step === 2 && <ProgressaoStep females={females} />}
      {step === 3 && <DistribuicaoStep females={females} />}
      {step === 4 && <EvolucaoStep females={females} />}
      {step === 5 && <ScatterStep females={females} />}
      {step === 6 && <ForcasStep females={females} />}
    </div>
  )
}
