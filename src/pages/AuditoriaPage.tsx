import { AlertTriangle, Check, Download, FileText, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart } from '@/components/charts/RadarChart'
import { ComboChart } from '@/components/charts/ComboChart'
import { EvoChart } from '@/components/charts/EvoChart'
import { DistChart } from '@/components/charts/DistChart'
import { ScatterChart } from '@/components/charts/ScatterChart'
import { SegmentedControl } from '@/components/SegmentedControl'
import { TraitSelect } from '@/components/TraitSelect'
import { agSteps, benchmarks, demoHerd, fmt, HAVG, initials, radarGroups, trend, traitLabel } from '@/data/demoData'
import { useAuditoria } from '@/hooks/useApi'

function PStat({ label, pct, count, tone }: { label: string; pct: number; count: number; tone: 'amber' | 'green' }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-[9px] border border-[var(--ss-border)] px-[13px] py-[11px]">
      <div className={`flex items-center gap-2 text-[13px] font-medium ${tone === 'green' ? 'text-[var(--ss-green)]' : 'text-[var(--ss-amber)]'}`}>{tone === 'green' ? <Check className="h-[15px] w-[15px]" /> : <AlertTriangle className="h-[15px] w-[15px]" />}{label}</div>
      <div><div className="text-right text-[17px] font-bold text-[var(--ss-fg)]">{pct}%</div><div className="text-right font-mono text-[11px] text-[var(--ss-muted)]">{count} animais</div></div>
    </div>
  )
}

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
              <div className="mb-2 font-mono text-[11px] font-semibold text-[var(--ss-primary)]">
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

function EvolucaoNacionalStep() {
  const [comboTrait, setComboTrait] = useState('hhp')
  const trendRecord = trend as Record<string, number[] | string[]>
  const comboBench = benchmarks.find(([key]) => key === comboTrait) ?? benchmarks[0]
  const comboHerd = trendRecord[comboTrait] as number[]
  const comboNational = comboHerd.map((_, i) => comboBench[2] * 0.92 + ((comboBench[2] - comboBench[2] * 0.92) / (comboHerd.length - 1)) * i)
  const comboTop25 = comboHerd.map((_, i) => comboBench[3] * 0.92 + ((comboBench[3] - comboBench[3] * 0.92) / (comboHerd.length - 1)) * i)

  return (
    <div className="ss-card">
      <div className="ss-card-header">
        <h3 className="ss-card-title">Evolução {traitLabel[comboTrait]} — Rebanho vs Nacional vs Top 25%</h3>
        <TraitSelect value={comboTrait} onChange={setComboTrait} />
      </div>
      <div className="ss-card-body pb-3">
        <ComboChart years={trend.years} herdData={comboHerd} nationalData={comboNational} top25Data={comboTop25} trait={comboTrait} formatter={fmt} />
      </div>
    </div>
  )
}

function ScatterPlotStep() {
  const [scatterX, setScatterX] = useState('gtpi')
  const [scatterY, setScatterY] = useState('milk')
  const [scatterColor, setScatterColor] = useState('hhp')

  return (
    <div className="ss-card">
      <div className="ss-card-header">
        <h3 className="ss-card-title">Scatter Plot Individual</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11.5px] font-semibold text-[var(--ss-muted)]">X</label><TraitSelect value={scatterX} onChange={setScatterX} />
          <label className="text-[11.5px] font-semibold text-[var(--ss-muted)]">Y</label><TraitSelect value={scatterY} onChange={setScatterY} />
          <label className="text-[11.5px] font-semibold text-[var(--ss-muted)]">Cor</label><TraitSelect value={scatterColor} onChange={setScatterColor} />
        </div>
      </div>
      <div className="ss-card-body">
        <ScatterChart animals={demoHerd} xTrait={scatterX} yTrait={scatterY} colorTrait={scatterColor} herdAvg={HAVG} />
      </div>
    </div>
  )
}

const rankTraits = ['hhp', 'gtpi', 'nm', 'milk', 'fat', 'prot', 'pl', 'dpr', 'scs', 'ptat', 'udc', 'flc']

function AnaliseForcasStep() {
  const navigate = useNavigate()
  const [trait, setTrait] = useState('hhp')
  const [selected, setSelected] = useState(0)
  const [radar, setRadar] = useState('indices')
  const sorted = useMemo(() => demoHerd.map((animal, idx) => ({ animal, idx })).sort((a, b) => (trait === 'scs' || trait === 'flc') ? Number(a.animal[trait]) - Number(b.animal[trait]) : Number(b.animal[trait]) - Number(a.animal[trait])), [trait])
  const animal = demoHerd[selected]
  const group = radarGroups[radar]

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.55fr_1fr]">
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Ranking do rebanho · {demoHerd.length} animais</h3>
          <div className="flex items-center gap-2">
            <select className="rounded-[7px] border border-[var(--ss-border)] bg-white px-2 py-1.5 text-[12px]" value={trait} onChange={(e) => setTrait(e.target.value)}>
              {rankTraits.map((key) => <option key={key} value={key}>{traitLabel[key]}</option>)}
            </select>
            <button className="ss-button ss-button-ghost ss-button-sm"><Download />Exportar</button>
          </div>
        </div>
        <div className="max-h-[calc(100vh-160px)] overflow-auto p-2.5">
          {sorted.map(({ animal: row, idx }, i) => (
            <button key={row.id} type="button" onClick={() => setSelected(idx)} className={`ss-rrow w-full text-left ${idx === selected ? 'is-selected' : ''}`}>
              <div className="text-center font-mono text-xs text-[var(--ss-muted)]">{i + 1}</div>
              <div><div className="text-[13.5px] font-medium text-[var(--ss-fg)]">{row.name}</div><div className="font-mono text-[11px] text-[var(--ss-muted)]">{row.sire} · {row.id}</div></div>
              <div className="text-right"><b className="block font-mono text-[13px] font-medium text-[var(--ss-fg)]">{fmt(trait, Number(row[trait]))}</b><small className="text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted-2)]">{traitLabel[trait]}</small></div>
              <div className="text-right"><b className="block font-mono text-[13px] font-medium text-[var(--ss-fg)]">${row.hhp}</b><small className="text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted-2)]">HHP$</small></div>
            </button>
          ))}
        </div>
      </div>
      <div className="ss-card">
        <div className="ss-card-header"><h3 className="ss-card-title">Perfil do animal</h3><button className="ss-button ss-button-ghost ss-button-sm" onClick={() => navigate('/provas')}><FileText />Ver prova</button></div>
        <div className="ss-card-body">
          <div className="mb-4 flex items-center gap-[13px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-[var(--ss-primary-soft)] text-[15px] font-bold text-[var(--ss-primary)]">{initials(animal.name)}</div>
            <div><b className="block text-base font-semibold text-[var(--ss-fg)]">{animal.name}</b><span className="font-mono text-xs text-[var(--ss-muted)]">{animal.sire} · Filha</span></div>
          </div>
          <SegmentedControl options={Object.entries(radarGroups).map(([value, g]) => ({ value, label: g.label }))} value={radar} onChange={setRadar} wrap size="sm" />
          <div className="mx-auto max-w-[320px]"><RadarChart animal={animal as unknown as Record<string, number>} avg={HAVG} group={group} /></div>
          <div className="mb-3 mt-1 flex justify-center gap-4 font-mono text-[10px] text-[var(--ss-muted)]"><span>Animal</span><span>Média</span></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {group.traits.map((t, i) => {
              const av = Number(animal[t]); const hv = HAVG[t]; const inv = ['scs', 'flc', 'da', 'ket', 'rfi', 'ssb', 'dsb', 'gl'].includes(t); const better = inv ? av < hv : av > hv
              return <div key={t} className="rounded-[9px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-[11px] py-[9px]"><small className="block text-[8.5px] uppercase tracking-[.6px] text-[var(--ss-muted)]">{group.names[i]}</small><b className="font-mono text-sm font-medium text-[var(--ss-fg)]">{fmt(t, av)}</b><span className={`ml-1 font-mono text-[9px] ${better ? 'text-[var(--ss-green)]' : 'text-[#C0633A]'}`}>méd {fmt(t, hv)} {av === hv ? '' : better ? '▲' : '▼'}</span></div>
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">{animal.haps.map((h) => <span key={h[0]} className={`ss-chip ${h[1] === 'free' ? 'ss-chip-free' : 'ss-chip-carr'}`}>{h[0]} · {h[1] === 'free' ? 'Livre' : 'Portador'}</span>)}</div>
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

  return (
    <div>
      <div className="ss-preserved"><Check className="h-[15px] w-[15px]" />Auditoria genética preservada com fluxo sequencial e visualização por etapas.</div>
      <div className="mb-4 flex flex-wrap gap-[6px]">
        {agSteps.map((s, i) => <button key={s.n} onClick={() => setStep(i)} className={`inline-flex items-center gap-2 rounded-[9px] border px-4 py-2 text-[12px] font-semibold transition ${i === step ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)] text-white shadow-[0_3px_10px_rgba(185,28,28,.2)]' : 'border-[var(--ss-border)] bg-white text-[var(--ss-muted)] hover:border-[#999] hover:text-[var(--ss-text)]'}`}><span className={`flex h-5 w-5 items-center justify-center rounded-[6px] font-mono text-[10px] font-bold ${i === step ? 'bg-white/20 text-white' : 'bg-[var(--ss-border-2)] text-[var(--ss-muted)]'}`}>{i + 1}</span>{s.t}</button>)}
      </div>
      {step === 0 && <>
        <div className="mb-4 flex gap-3 rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 py-3.5 text-[12.5px] leading-6"><Info className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[var(--ss-primary)]" /><div><b>Como interpretar.</b> <span className="text-[var(--ss-primary)]">Não informado</span>: parentesco ausente no registro. <span className="text-[var(--ss-green)]">Informado</span>: pai/avô materno preenchidos.</div></div>
        <div className="ss-grid-3">{[['Pai (Sire)', 8, 92], ['Avô Materno (MGS)', 19, 81], ['Bisavô Materno (MMGS)', 34, 66]].map((row) => <div key={row[0]} className="ss-card"><div className="ss-card-header"><h3 className="ss-card-title">{row[0]}</h3></div><div className="ss-card-body"><PStat label="Não informado" pct={Number(row[1])} count={Math.round(1974 * Number(row[1]) / 100)} tone="amber" /><PStat label="Informado" pct={Number(row[2])} count={Math.round(1974 * Number(row[2]) / 100)} tone="green" /></div></div>)}</div>
      </>}
      {step === 1 && <><div className="mb-3.5 flex flex-wrap gap-2"><SegmentedControl options={['Todas', 'Novilha', 'Primípara', 'Multípara'].map((x) => ({ value: x, label: x }))} value="Todas" onChange={() => undefined} /><SegmentedControl options={['Superior', 'Intermediário', 'Inferior'].map((x) => ({ value: x, label: x }))} value="Superior" onChange={() => undefined} /><SegmentedControl options={['Top 20', '30', '50'].map((x) => ({ value: x, label: x }))} value="Top 20" onChange={() => undefined} /></div><div className="ss-grid-2b">{block('Top Sires', sires)}{block('Top Maternal Grandsires', mgs)}</div></>}
      {step === 2 && <ProgressaoStep />}
      {step === 3 && <DistribuicaoStep />}
      {step === 4 && <EvolucaoNacionalStep />}
      {step === 5 && <ScatterPlotStep />}
      {step === 6 && <AnaliseForcasStep />}
    </div>
  )
}
