import { AlertTriangle, Check, Download, Info } from 'lucide-react'
import { useState } from 'react'
import { EvoChart } from '@/components/charts/EvoChart'
import { DistChart } from '@/components/charts/DistChart'
import { SegmentedControl } from '@/components/SegmentedControl'
import { agSteps, trend } from '@/data/demoData'
import { useAuditoria } from '@/hooks/useApi'

function PStat({ label, pct, count, tone }: { label: string; pct: number; count: number; tone: 'amber' | 'green' }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-[9px] border border-[var(--ss-border)] px-[13px] py-[11px]">
      <div className={`flex items-center gap-2 text-[13px] font-medium ${tone === 'green' ? 'text-[var(--ss-green)]' : 'text-[var(--ss-amber)]'}`}>{tone === 'green' ? <Check className="h-[15px] w-[15px]" /> : <AlertTriangle className="h-[15px] w-[15px]" />}{label}</div>
      <div><div className="text-right text-[17px] font-bold text-[var(--ss-fg)]">{pct}%</div><div className="text-right font-mono text-[11px] text-[var(--ss-muted)]">{count} animais</div></div>
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
      <div className="mb-4 flex flex-wrap gap-[7px]">
        {agSteps.map((s, i) => <button key={s.n} onClick={() => setStep(i)} className={`inline-flex items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-[12.5px] font-medium transition ${i === step ? 'border-[var(--ss-primary)] bg-[var(--ss-primary)] text-white' : 'border-[var(--ss-border)] bg-white text-[var(--ss-text)] hover:bg-[var(--ss-wash)]'}`}><span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full font-mono text-[10px] font-semibold ${i === step ? 'bg-white/25 text-white' : 'bg-[var(--ss-wash)] text-[var(--ss-muted)]'}`}>{i + 1}</span>{s.t}</button>)}
      </div>
      {step === 0 && <>
        <div className="mb-4 flex gap-3 rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 py-3.5 text-[12.5px] leading-6"><Info className="mt-0.5 h-[17px] w-[17px] shrink-0 text-[var(--ss-primary)]" /><div><b>Como interpretar.</b> <span className="text-[var(--ss-primary)]">Não informado</span>: parentesco ausente no registro. <span className="text-[var(--ss-green)]">Informado</span>: pai/avô materno preenchidos.</div></div>
        <div className="ss-grid-3">{[['Pai (Sire)', 8, 92], ['Avô Materno (MGS)', 19, 81], ['Bisavô Materno (MMGS)', 34, 66]].map((row) => <div key={row[0]} className="ss-card"><div className="ss-card-header"><h3 className="ss-card-title">{row[0]}</h3></div><div className="ss-card-body"><PStat label="Não informado" pct={Number(row[1])} count={Math.round(1974 * Number(row[1]) / 100)} tone="amber" /><PStat label="Informado" pct={Number(row[2])} count={Math.round(1974 * Number(row[2]) / 100)} tone="green" /></div></div>)}</div>
      </>}
      {step === 1 && <><div className="mb-3.5 flex flex-wrap gap-2"><SegmentedControl options={['Todas', 'Novilha', 'Primípara', 'Multípara'].map((x) => ({ value: x, label: x }))} value="Todas" onChange={() => undefined} /><SegmentedControl options={['Superior', 'Intermediário', 'Inferior'].map((x) => ({ value: x, label: x }))} value="Superior" onChange={() => undefined} /><SegmentedControl options={['Top 20', '30', '50'].map((x) => ({ value: x, label: x }))} value="Top 20" onChange={() => undefined} /></div><div className="ss-grid-2b">{block('Top Sires', sires)}{block('Top Maternal Grandsires', mgs)}</div></>}
      {step === 2 && <><div className="mb-3.5 flex flex-wrap gap-1.5">{['HHP$', 'TPI', 'NM$', 'PTAM', 'PL', 'DPR', 'SCS'].map((p, i) => <span key={p} className={`ss-chip ${i < 3 ? 'ss-chip-free' : 'opacity-50'}`}>{p}</span>)}</div><div className="ss-grid-3">{[['HHP$', [612, 668, 712, 758, 801, 852, 884]], ['TPI', [2433, 2511, 2588, 2655, 2712, 2780, 2841]], ['NM$', [612, 652, 701, 742, 789, 841, 884]]].map((c) => <div key={c[0] as string} className="ss-card"><div className="ss-card-header"><h3 className="ss-card-title">Progressão · {c[0]}</h3></div><div className="ss-card-body"><div className="mb-1.5 font-mono text-[11px] text-[var(--ss-green)]">Tendência R²=0.99 · +{Math.round(((c[1] as number[])[6] - (c[1] as number[])[0]) / 6)}/ano</div><EvoChart trait="hhp" years={trend.years} data={c[1] as number[]} width={520} height={200} /></div></div>)}</div></>}
      {step === 3 && <><div className="mb-3.5 flex flex-wrap items-center gap-2"><button className="ss-button ss-button-ghost ss-button-sm">Selecionar PTAs ▾</button><span className="ss-chip ss-chip-free">HHP$</span><span className="ss-chip ss-chip-free">TPI</span></div><div className="ss-grid-2b">{[['HHP$', 612, 180, 150, 1050], ['TPI', 2588, 210, 1980, 3120]].map((d) => <div key={String(d[0])} className="ss-card"><div className="ss-card-header"><h3 className="ss-card-title">Distribuição · {d[0]}</h3><button className="ss-button ss-button-ghost ss-button-sm"><Download />PDF</button></div><div className="ss-card-body"><div className="mb-3.5 grid grid-cols-3 gap-2 lg:grid-cols-6">{['Média', 'Mediana', 'Desv. Pad.', 'CV%', 'Mín-Máx', 'Q1-Q3'].map((s) => <div key={s} className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-wash)] px-2.5 py-2"><small className="block text-[9px] uppercase tracking-[.5px] text-[var(--ss-muted)]">{s}</small><b className="font-mono text-[13px] text-[var(--ss-fg)]">{s === 'Média' || s === 'Mediana' ? d[1] : s === 'Desv. Pad.' ? d[2] : s === 'CV%' ? `${(Number(d[2]) / Number(d[1]) * 100).toFixed(1)}%` : s === 'Mín-Máx' ? `${d[3]}-${d[4]}` : `${Math.round(Number(d[1]) - Number(d[2]) * .6)}-${Math.round(Number(d[1]) + Number(d[2]) * .6)}`}</b></div>)}</div><DistChart trait={String(d[0]).toLowerCase().replace('$', '')} trendData={String(d[0]) === 'HHP$' ? trend.hhp : trend.gtpi} /></div></div>)}</div></>}
    </div>
  )
}
