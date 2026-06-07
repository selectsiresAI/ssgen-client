import { Check, Info } from 'lucide-react'
import { useState } from 'react'
import { EvoChart } from '@/components/charts/EvoChart'
import { DistChart } from '@/components/charts/DistChart'
import { RadarChart } from '@/components/charts/RadarChart'
import { ParentescoGauge } from '@/components/charts/ParentescoGauge'
import { SegmentedControl } from '@/components/SegmentedControl'
import { TraitSelect } from '@/components/TraitSelect'
import { agSteps, demoHerd, fmt, HAVG, radarGroups, trend, traitLabel } from '@/data/demoData'
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

// Etapa 5 (índice 4) — Evolução HHP$: Rebanho vs Nacional vs Top 25%
const EVOL_NAT = [560, 575, 592, 608, 624, 640, 655]
const EVOL_TOP = [720, 752, 784, 812, 838, 860, 882]

function EvolucaoStep() {
  const herd = trend.hhp
  const years = trend.years
  const W = 920, H = 320, padL = 20, padR = 20, padT = 40, padB = 40
  const max = 950, plotH = H - padT - padB, plotW = W - padL - padR
  const n = years.length, stepX = plotW / n, bw = 40
  const y = (v: number) => padT + (1 - v / max) * plotH
  const x = (i: number) => padL + stepX * i + stepX / 2
  return (
    <div className="ss-card">
      <div className="ss-card-header">
        <h3 className="ss-card-title">Evolução HHP$ — Rebanho vs Nacional vs Top 25%</h3>
        <div className="flex gap-4">
          {[['Meu Rebanho', 'var(--ss-primary)'], ['Top 25%', 'var(--ss-green)'], ['Nacional', 'var(--ss-muted)']].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5 text-[11px] text-[var(--ss-muted)]"><span className="h-[3px] w-3 rounded-sm" style={{ background: c }} />{l}</span>
          ))}
        </div>
      </div>
      <div className="ss-card-body">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          {[0.25, 0.5, 0.75, 1].map((g, i) => <line key={i} x1={padL} x2={W - padR} y1={padT + plotH * (1 - g)} y2={padT + plotH * (1 - g)} stroke="var(--ss-border-2)" />)}
          {years.map((yr, i) => (
            <g key={yr}>
              <rect x={x(i) - bw / 2} y={y(herd[i])} width={bw} height={padT + plotH - y(herd[i])} rx={5} fill="var(--ss-primary)" opacity={i === n - 1 ? 1 : 0.82} />
              <text x={x(i)} y={y(herd[i]) - 9} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ss-fg)" fontFamily="Geist Mono">${herd[i]}</text>
              <text x={x(i)} y={H - 16} textAnchor="middle" fontSize="12" fontWeight={i === n - 1 ? 700 : 500} fill={i === n - 1 ? 'var(--ss-primary)' : 'var(--ss-muted)'}>{yr}</text>
            </g>
          ))}
          <polyline points={EVOL_TOP.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="var(--ss-green)" strokeWidth="2.5" />
          {EVOL_TOP.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--ss-green)" />)}
          <polyline points={EVOL_NAT.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="var(--ss-muted)" strokeWidth="2" strokeDasharray="5 5" />
        </svg>
      </div>
    </div>
  )
}

// Etapa 6 (índice 5) — Scatter Plot GTPI × HHP$
function ScatterStep() {
  const W = 920, H = 360, padL = 60, padR = 24, padT = 22, padB = 46
  const plotW = W - padL - padR, plotH = H - padT - padB
  const xMin = 2250, xMax = 2950, yMin = 620, yMax = 970
  const xThr = Math.round(HAVG.gtpi), yThr = Math.round(HAVG.hhp)
  const X = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * plotW
  const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH
  const xTicks = [2300, 2450, 2600, 2750, 2900]
  const yTicks = [650, 720, 790, 860, 930]
  const colorFor = (a: { gtpi: number; hhp: number }) => (a.gtpi >= xThr && a.hhp >= yThr) ? 'var(--ss-green)' : (a.gtpi >= xThr || a.hhp >= yThr) ? 'var(--ss-primary)' : 'var(--ss-muted-2)'
  const topA = demoHerd.reduce((a, b) => (a.hhp + a.gtpi > b.hhp + b.gtpi ? a : b))
  return (
    <div className="ss-card">
      <div className="ss-card-header">
        <h3 className="ss-card-title">Dispersão · GTPI × HHP$</h3>
        <div className="flex gap-4">
          {[['Elite (alto/alto)', 'var(--ss-green)'], ['Acima da média', 'var(--ss-primary)'], ['Abaixo da média', 'var(--ss-muted-2)']].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5 text-[11px] text-[var(--ss-muted)]"><span className="h-[9px] w-[9px] rounded-full" style={{ background: c }} />{l}</span>
          ))}
        </div>
      </div>
      <div className="ss-card-body">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          <rect x={X(xThr)} y={padT} width={padL + plotW - X(xThr)} height={Y(yThr) - padT} fill="var(--ss-green)" opacity="0.06" />
          {yTicks.map((t) => (
            <g key={'y' + t}>
              <line x1={padL} x2={W - padR} y1={Y(t)} y2={Y(t)} stroke="var(--ss-border-2)" />
              <text x={padL - 10} y={Y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="var(--ss-muted-2)" fontFamily="Geist Mono">${t}</text>
            </g>
          ))}
          {xTicks.map((t) => (
            <g key={'x' + t}>
              <line x1={X(t)} x2={X(t)} y1={padT} y2={padT + plotH} stroke="var(--ss-border-2)" />
              <text x={X(t)} y={padT + plotH + 22} textAnchor="middle" fontSize="11" fill="var(--ss-muted-2)" fontFamily="Geist Mono">+{t}</text>
            </g>
          ))}
          <line x1={X(xThr)} x2={X(xThr)} y1={padT} y2={padT + plotH} stroke="var(--ss-border)" strokeDasharray="5 5" />
          <line x1={padL} x2={W - padR} y1={Y(yThr)} y2={Y(yThr)} stroke="var(--ss-border)" strokeDasharray="5 5" />
          <text x={padL + plotW / 2} y={H - 8} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--ss-muted)">GTPI →</text>
          <text x={16} y={padT + plotH / 2} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--ss-muted)" transform={`rotate(-90 16 ${padT + plotH / 2})`}>HHP$ →</text>
          {demoHerd.map((a) => {
            const isTop = a === topA
            const near = X(a.gtpi) > padL + plotW * 0.72
            return (
              <g key={a.id}>
                <circle cx={X(a.gtpi)} cy={Y(a.hhp)} r={isTop ? 8 : 6} fill={colorFor(a)} fillOpacity={isTop ? 1 : 0.82} stroke="#fff" strokeWidth={isTop ? 2.5 : 1.5} />
                {isTop && <text x={X(a.gtpi) + (near ? -13 : 13)} y={Y(a.hhp) - 9} textAnchor={near ? 'end' : 'start'} fontSize="11.5" fontWeight="700" fill="var(--ss-fg)">{a.name}</text>}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// Etapa 7 (índice 6) — Análise de Forças: ranking + radar
function ForcasStep() {
  const top = [...demoHerd].sort((a, b) => b.hhp - a.hhp).slice(0, 9)
  const leader = top[0]
  const grp = radarGroups.indices
  const animal = grp.traits.reduce((o, t) => { o[t] = Number((leader as unknown as Record<string, number>)[t]); return o }, {} as Record<string, number>)
  const chips: [string, string][] = [['HHP$', fmt('hhp', leader.hhp)], ['GTPI', fmt('gtpi', leader.gtpi)], ['NM$', fmt('nm', leader.nm)], ['CM$', fmt('cm', (leader as unknown as Record<string, number>).cm)]]
  return (
    <div className="ss-grid-2">
      <div className="ss-card">
        <div className="ss-card-header"><h3 className="ss-card-title">Ranking do Rebanho · HHP$</h3></div>
        <div className="ss-card-body">
          {top.map((a, i) => (
            <div key={a.id} className="grid grid-cols-[20px_1fr_70px] items-center gap-2.5 border-b border-[var(--ss-border-2)] py-2 last:border-0">
              <span className={`font-mono text-[12px] font-bold ${i < 3 ? 'text-[var(--ss-primary)]' : 'text-[var(--ss-muted-2)]'}`}>{i + 1}</span>
              <div><div className="text-[12.5px] font-semibold text-[var(--ss-fg)]">{a.name}</div><div className="font-mono text-[10px] text-[var(--ss-muted-2)]">{a.sire} · {a.id}</div></div>
              <span className="text-right font-mono text-[13px] font-bold text-[var(--ss-fg)]">${a.hhp}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ss-card">
        <div className="ss-card-header"><h3 className="ss-card-title">Perfil · {leader.name}</h3></div>
        <div className="ss-card-body">
          <RadarChart animal={animal} avg={HAVG} group={grp} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {chips.map(([k, v]) => (
              <div key={k} className="rounded-[9px] bg-[var(--ss-wash)] px-[11px] py-2">
                <div className="text-[8.5px] font-semibold uppercase tracking-[1px] text-[var(--ss-muted-2)]">{k}</div>
                <div className="mt-0.5 font-mono text-[14px] font-bold text-[var(--ss-fg)]">{v}</div>
              </div>
            ))}
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
