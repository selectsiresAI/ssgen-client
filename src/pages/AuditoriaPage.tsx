import { Check, Info } from 'lucide-react'
import { useState } from 'react'
import { ComboChart } from '@/components/charts/ComboChart'
import { EvoChart } from '@/components/charts/EvoChart'
import { DistChart } from '@/components/charts/DistChart'
import { RadarChart } from '@/components/charts/RadarChart'
import { ParentescoGauge } from '@/components/charts/ParentescoGauge'
import { SegmentedControl } from '@/components/SegmentedControl'
import { TraitSelect } from '@/components/TraitSelect'
import { agSteps, benchmarks, demoHerd, fmt, HAVG, radarGroups, trend, traitLabel } from '@/data/demoData'
import { useAuditoria } from '@/hooks/useApi'

const defaultTraits = ['hhp', 'gtpi', 'nm']

function ProgressaoStep() {
  const trendRecord = trend as Record<string, number[] | string[]>
  const [count, setCount] = useState(3)
  const [charts, setCharts] = useState<string[]>(defaultTraits)

  const handleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(10, n))
    setCount(clamped)
    if (clamped > charts.length) {
      const available = Object.keys(traitLabel).filter((k) => !charts.includes(k) && trendRecord[k])
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
        const data = trendRecord[trait] as number[] | undefined
        if (!data) return null
        const gain = Math.round((data[data.length - 1] - data[0]) / (data.length - 1))
        return (
          <div key={`${trait}-${idx}`} className="ss-card">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Progressão · {traitLabel[trait] ?? trait.toUpperCase()}</h3>
              <TraitSelect value={trait} onChange={(v) => changeChart(idx, v)} />
            </div>
            <div className="ss-card-body">
              <div className="mb-2 font-mono text-[11px] text-[var(--ss-green)]">
                Tendência R²=0.99 · {gain >= 0 ? '+' : ''}{gain}/ano · Último: {fmt(trait, data[data.length - 1])}
              </div>
              <EvoChart trait={trait} years={trend.years} data={data} height={160} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DistribuicaoStep() {
  const trendRecord = trend as Record<string, number[] | string[]>
  const [count, setCount] = useState(3)
  const [charts, setCharts] = useState<string[]>(['hhp', 'gtpi', 'nm'])

  const handleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(10, n))
    setCount(clamped)
    if (clamped > charts.length) {
      const available = Object.keys(traitLabel).filter((k) => !charts.includes(k) && trendRecord[k])
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
        const data = trendRecord[trait] as number[] | undefined
        if (!data) return null
        return (
          <div key={`${trait}-${idx}`} className="ss-card">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Distribuição · {traitLabel[trait] ?? trait.toUpperCase()}</h3>
              <TraitSelect value={trait} onChange={(v) => changeChart(idx, v)} />
            </div>
            <div className="ss-card-body">
              <DistChart trait={trait} trendData={data} height={360} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Etapa 5 (índice 4) — Evolução vs Nacional: múltiplos gráficos selecionáveis
function EvolucaoStep() {
  const trendRecord = trend as Record<string, number[] | string[]>
  const [count, setCount] = useState(3)
  const [charts, setCharts] = useState<string[]>(['hhp', 'gtpi', 'nm'])

  const handleCount = (n: number) => {
    const clamped = Math.max(1, Math.min(10, n))
    setCount(clamped)
    if (clamped > charts.length) {
      const available = Object.keys(traitLabel).filter((k) => !charts.includes(k) && trendRecord[k])
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
        const herdData = trendRecord[trait] as number[] | undefined
        if (!herdData) return null
        const bench = benchmarks.find(([key]) => key === trait)
        const natAvg = bench ? bench[2] : herdData[0] * 0.85
        const top25 = bench ? bench[3] : herdData[0] * 1.05
        const nationalData = herdData.map((_, i) => natAvg * 0.92 + ((natAvg - natAvg * 0.92) / (herdData.length - 1)) * i)
        const top25Data = herdData.map((_, i) => top25 * 0.92 + ((top25 - top25 * 0.92) / (herdData.length - 1)) * i)
        return (
          <div key={`${trait}-${idx}`} className="ss-card">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Evolução {traitLabel[trait] ?? trait.toUpperCase()} — Rebanho vs Nacional vs Top 25%</h3>
              <TraitSelect value={trait} onChange={(v) => changeChart(idx, v)} />
            </div>
            <div className="ss-card-body">
              <ComboChart years={trend.years} herdData={herdData} nationalData={nationalData} top25Data={top25Data} trait={trait} formatter={fmt} />
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

function ScatterStep() {
  const [xTrait, setXTrait] = useState('gtpi')
  const [yTrait, setYTrait] = useState('hhp')

  const W = 920, H = 400, padL = 60, padR = 24, padT = 22, padB = 56
  const plotW = W - padL - padR, plotH = H - padT - padB
  const xs = demoHerd.map((a) => Number((a as unknown as Record<string, number>)[xTrait]))
  const ys = demoHerd.map((a) => Number((a as unknown as Record<string, number>)[yTrait]))
  const xMin = Math.min(...xs) * 0.96
  const xMax = Math.max(...xs) * 1.04
  const yMin = Math.min(...ys) * 0.96
  const yMax = Math.max(...ys) * 1.04
  const xThr = (xMin + xMax) / 2
  const yThr = (yMin + yMax) / 2
  const X = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * plotW
  const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH

  const val = (a: typeof demoHerd[number], trait: string) => Number((a as unknown as Record<string, number>)[trait])
  const quadrant = (a: typeof demoHerd[number]) => {
    const xv = val(a, xTrait), yv = val(a, yTrait)
    if (xv >= xThr && yv >= yThr) return 0
    if (xv < xThr && yv >= yThr) return 1
    if (xv >= xThr && yv < yThr) return 2
    return 3
  }
  const counts = [0, 0, 0, 0]
  demoHerd.forEach((a) => counts[quadrant(a)]++)

  const xTickCount = 5, yTickCount = 5
  const topA = demoHerd.reduce((a, b) => (val(a, xTrait) + val(a, yTrait) > val(b, xTrait) + val(b, yTrait) ? a : b))
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
            {demoHerd.map((a) => {
              const q = quadrant(a)
              const isTop = a === topA
              const xv = val(a, xTrait), yv = val(a, yTrait)
              const near = X(xv) > padL + plotW * 0.72
              return (
                <g key={a.id}>
                  <circle cx={X(xv)} cy={Y(yv)} r={isTop ? 8 : 6} fill={Q_COLORS[q].color} fillOpacity={isTop ? 1 : 0.9} stroke={q === 0 ? 'white' : 'rgba(255,255,255,.8)'} strokeWidth={isTop ? 2.5 : 2} className="cursor-pointer">
                    <title>{a.name} · {traitLabel[xTrait]} {xv} · {traitLabel[yTrait]} {yv}</title>
                  </circle>
                  {isTop && <text x={X(xv) + (near ? -13 : 13)} y={Y(yv) - 9} textAnchor={near ? 'end' : 'start'} fontSize="11.5" fontWeight="700" fill="var(--ss-fg)">{a.name}</text>}
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

function ForcasStep() {
  const [trait, setTrait] = useState('hhp')
  const [selected, setSelected] = useState(0)
  const [radar, setRadar] = useState('indices')

  const inverse = ['scs', 'flc']
  const sorted = [...demoHerd].map((animal, idx) => ({ animal, idx })).sort((a, b) => inverse.includes(trait) ? Number((a.animal as unknown as Record<string, number>)[trait]) - Number((b.animal as unknown as Record<string, number>)[trait]) : Number((b.animal as unknown as Record<string, number>)[trait]) - Number((a.animal as unknown as Record<string, number>)[trait]))
  const animal = demoHerd[selected]
  const grp = radarGroups[radar]
  const animalData = grp.traits.reduce((o, t) => { o[t] = Number((animal as unknown as Record<string, number>)[t]); return o }, {} as Record<string, number>)

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
          {sorted.map(({ animal: row, idx }, i) => (
            <button key={row.id} type="button" onClick={() => setSelected(idx)} className={`ss-rrow w-full text-left ${idx === selected ? 'is-selected' : ''}`}>
              <div className="text-center font-mono text-xs text-[var(--ss-muted)]">{i + 1}</div>
              <div><div className="text-[13px] font-medium text-[var(--ss-fg)]">{row.name}</div><div className="font-mono text-[11px] text-[var(--ss-muted)]">{row.sire} · {row.id}</div></div>
              <div className="text-right"><b className="block font-mono text-[13px] font-medium text-[var(--ss-fg)]">{fmt(trait, Number((row as unknown as Record<string, number>)[trait]))}</b><small className="text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted-2)]">{traitLabel[trait]}</small></div>
              <div className="text-right"><b className="block font-mono text-[13px] font-medium text-[var(--ss-fg)]">${row.hhp}</b><small className="text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted-2)]">HHP$</small></div>
            </button>
          ))}
        </div>
      </div>
      <div className="ss-card">
        <div className="ss-card-header"><h3 className="ss-card-title">Perfil · {animal.name}</h3></div>
        <div className="ss-card-body">
          <SegmentedControl options={Object.entries(radarGroups).map(([value, g]) => ({ value, label: g.label }))} value={radar} onChange={setRadar} wrap size="sm" />
          <div className="mx-auto max-w-[320px]"><RadarChart animal={animalData} avg={HAVG} group={grp} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {grp.traits.map((t, i) => {
              const av = Number((animal as unknown as Record<string, number>)[t])
              const hv = HAVG[t]
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
  useAuditoria({ step: String(agSteps[step].n) })
  const sires = [['7HO15264', 'Stagger Baelum', 312], ['7HO14921', 'Delux Dominance', 244], ['7HO15102', 'Taos Hayk', 201], ['7HO15388', 'Gameday Soy', 176], ['250HO16021', 'Altahotrod', 132]]
  const mgs = [['7HO13988', 'Renegade', 288], ['7HO14102', 'Parfect', 233], ['7HO14500', 'Lionel', 190], ['7HO14760', 'Achiever', 155], ['7HO15001', 'Copyright', 121]]
  const block = (title: string, rows: (string | number)[][]) => {
    const max = Math.max(...rows.map((r) => Number(r[2]))); const total = rows.reduce((s, r) => s + Number(r[2]), 0)
    return <div className="ss-card"><div className="ss-card-header"><h3 className="ss-card-title">{title}</h3></div><div className="ss-card-body">{rows.map((r) => <div key={String(r[0])} className="grid grid-cols-[170px_1fr_44px_44px] items-center gap-2 py-[3px] text-xs"><div className="overflow-hidden text-ellipsis text-right font-mono text-[var(--ss-fg)]"><small className="text-[var(--ss-muted)]">{r[1]}</small> {r[0]}</div><div className="h-[18px] rounded-sm bg-[var(--ss-primary-soft)]" style={{ width: `${Number(r[2]) / max * 100}%` }} /><div className="text-right font-mono font-semibold">{r[2]}</div><div className="text-right font-mono text-[10px] text-[var(--ss-muted)]">{(Number(r[2]) / total * 100).toFixed(1)}%</div></div>)}</div></div>
  }

  // [label, % não informado, % informado] — base de 1974 animais
  const parentesco: [string, number, number][] = [['Pai (Sire)', 8, 92], ['Avô Materno (MGS)', 19, 81], ['Bisavô Materno (MMGS)', 34, 66]]
  const BASE = 1974

  return (
    <div>
      <div className="ss-preserved"><Check className="h-[15px] w-[15px]" />Auditoria genética preservada com fluxo sequencial e visualização por etapas.</div>
      <div className="mb-4 flex flex-wrap gap-[7px]">
        {agSteps.map((s, i) => <button key={s.n} onClick={() => setStep(i)} className={`inline-flex items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-[12.5px] font-medium transition ${i === step ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)] text-white' : 'border-[var(--ss-border)] bg-white text-[var(--ss-text)] hover:bg-[var(--ss-wash)]'}`}><span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full font-mono text-[10px] font-semibold ${i === step ? 'bg-white/25 text-white' : 'bg-[var(--ss-wash)] text-[var(--ss-muted)]'}`}>{i + 1}</span>{s.t}</button>)}
      </div>
      {step === 0 && <>
        <div className="mb-4 flex gap-3 rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 py-3.5 text-[12.5px] leading-6"><Info className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[var(--ss-primary)]" /><div><b>Como interpretar.</b> <span className="text-[var(--ss-primary)]">Não informado</span>: parentesco ausente no registro. <span className="text-[var(--ss-green)]">Informado</span>: pai/avô materno preenchidos.</div></div>
        <div className="ss-grid-3">
          {parentesco.map(([label, naoInf, inf]) => (
            <div key={label} className="ss-card">
              <div className="ss-card-header"><h3 className="ss-card-title">{label}</h3></div>
              <div className="ss-card-body">
                <ParentescoGauge pct={inf} />
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--ss-green)]"><span className="h-2 w-2 rounded-full bg-[var(--ss-green)]" />Informado</span>
                    <span className="ss-mono text-[13px] font-semibold text-[var(--ss-fg)]">{inf}% <span className="text-[11px] font-normal text-[var(--ss-muted)]">· {Math.round(BASE * inf / 100)}</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--ss-amber)]"><span className="h-2 w-2 rounded-full bg-[var(--ss-amber)]" />Não informado</span>
                    <span className="ss-mono text-[13px] font-semibold text-[var(--ss-amber)]">{naoInf}% <span className="text-[11px] font-normal text-[var(--ss-muted)]">· {Math.round(BASE * naoInf / 100)}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      {step === 1 && <><div className="mb-3.5 flex flex-wrap gap-2"><SegmentedControl options={['Todas', 'Novilha', 'Primípara', 'Multípara'].map((x) => ({ value: x, label: x }))} value="Todas" onChange={() => undefined} /><SegmentedControl options={['Superior', 'Intermediário', 'Inferior'].map((x) => ({ value: x, label: x }))} value="Superior" onChange={() => undefined} /><SegmentedControl options={['Top 20', '30', '50'].map((x) => ({ value: x, label: x }))} value="Top 20" onChange={() => undefined} /></div><div className="ss-grid-2b">{block('Top Sires', sires)}{block('Top Maternal Grandsires', mgs)}</div></>}
      {step === 2 && <ProgressaoStep />}
      {step === 3 && <DistribuicaoStep />}
      {step === 4 && <EvolucaoStep />}
      {step === 5 && <ScatterStep />}
      {step === 6 && <ForcasStep />}
    </div>
  )
}
