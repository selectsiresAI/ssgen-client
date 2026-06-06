import { Activity, AlertTriangle, DollarSign, HeartPulse } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DistChart } from '@/components/charts/DistChart'
import { EvoChart } from '@/components/charts/EvoChart'
import { KpiCard } from '@/components/KpiCard'
import { TraitSelect } from '@/components/TraitSelect'
import { demoHerd, fmt, HAVG, traitLabel, trend } from '@/data/demoData'

const medalColor = ['#C99A4B', '#A9A9A9', '#B07A4B', '#CBC4BC', '#CBC4BC']

export function PainelGenomicoPage() {
  const [trait, setTrait] = useState('hhp')
  const [topTrait, setTopTrait] = useState('hhp')
  const trendRecord = trend as Record<string, number[] | string[]>
  const ranked = useMemo(() => demoHerd.slice().sort((a, b) => Number(b[topTrait]) - Number(a[topTrait])).slice(0, 5), [topTrait])

  // Herd stats for selected trait
  const herdStats = useMemo(() => {
    const vals = demoHerd.map((a) => Number(a[trait])).filter((v) => !isNaN(v))
    if (vals.length === 0) return null
    const sorted = [...vals].sort((a, b) => a - b)
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)]
    const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    return { mean, median, sd, cv: sd / Math.abs(mean) * 100, min, max, q1, q3, n: vals.length }
  }, [trait])

  const attention = [
    ['SCS', 'Células Somáticas', HAVG.scs, 2.50, '↓ menor é melhor'],
    ['FLC', 'Escore Pernas/Pés', HAVG.flc, 0.00, '↑ maior é melhor'],
    ['DPR', 'Taxa Prenhez Filhas', HAVG.dpr, 2.50, '↑ maior é melhor'],
    ['RFI', 'Feed Intake Residual', HAVG.rfi, -80, '↓ menor é melhor'],
    ['GL', 'Gestation Length', HAVG.gl, 0.00, '↓ menor é melhor'],
    ['DFM', 'Dairy Form', HAVG.dfm, 0.30, '↑ maior é melhor'],
  ] as const
  const maxGap = Math.max(...attention.map((d) => Math.abs(d[2] - d[3])))

  return (
    <div>
      <div className="ss-grid-kpis">
        <KpiCard icon={HeartPulse} label="HHP$ Médio" value="$874" delta="▲ +51" />
        <KpiCard icon={Activity} label="GTPI Médio" value="+2.687" delta="▲ +94 vs. base" />
        <KpiCard icon={DollarSign} label="NM$ Médio" value="$921" delta="▲ +38" />
        <KpiCard icon={AlertTriangle} label="Portadores HH" value="6,3%" delta="▼ monitorar" deltaType="down" />
      </div>
      <div className="ss-grid-2">
        <div className="ss-card">
          <div className="ss-card-header">
            <h3 className="ss-card-title">Evolução genética por geração</h3>
            <TraitSelect value={trait} onChange={setTrait} />
          </div>
          <div className="ss-card-body"><EvoChart trait={trait} years={trend.years} data={trendRecord[trait] as number[]} /></div>
        </div>
        <div>
          <div className="ss-card">
            <div className="ss-card-header"><h3 className="ss-card-title">Distribuição · {traitLabel[trait]}</h3></div>
            <div className="ss-card-body"><DistChart trait={trait} trendData={trendRecord[trait] as number[]} /></div>
          </div>
          {herdStats && (
            <div className="ss-card mt-3">
              <div className="ss-card-header"><h3 className="ss-card-title">Estatísticas do rebanho · {traitLabel[trait]}</h3></div>
              <div className="ss-card-body">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    ['Média', fmt(trait, herdStats.mean)],
                    ['Mediana', fmt(trait, herdStats.median)],
                    ['Desv. Pad.', herdStats.sd.toFixed(2)],
                    ['CV%', `${herdStats.cv.toFixed(1)}%`],
                    ['Mínimo', fmt(trait, herdStats.min)],
                    ['Máximo', fmt(trait, herdStats.max)],
                    ['Q1', fmt(trait, herdStats.q1)],
                    ['Q3', fmt(trait, herdStats.q3)],
                  ].map(([label, val]) => (
                    <div key={label} className="rounded-[8px] border border-[var(--ss-border)] bg-[var(--ss-wash)] px-2.5 py-2">
                      <small className="block text-[8.5px] uppercase tracking-[.5px] text-[var(--ss-muted)]">{label}</small>
                      <b className="font-mono text-[13px] text-[var(--ss-fg)]">{val}</b>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 text-center font-mono text-[10px] text-[var(--ss-muted)]">{herdStats.n} animais · Méd. rebanho {fmt(trait, HAVG[trait] ?? 0)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="ss-grid-2b">
        <div className="ss-card">
          <div className="ss-card-header">
            <h3 className="ss-card-title">Top 5 por característica</h3>
            <TraitSelect value={topTrait} onChange={setTopTrait} />
          </div>
          <div className="ss-card-body">
            {ranked.map((animal, i) => (
              <div key={animal.id} className="grid grid-cols-[22px_1fr_60px_auto] items-center gap-3 rounded-md border-b border-[var(--ss-border-2)] px-1 py-2.5 last:border-0">
                <span className="flex h-[19px] w-[19px] items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: medalColor[i] }}>{i + 1}</span>
                <div className="text-[13px] font-medium text-[var(--ss-fg)]">{animal.name}<small className="block font-mono text-[10px] font-normal text-[var(--ss-muted)]">{animal.sire}</small></div>
                <div className="h-1.5 overflow-hidden rounded bg-[var(--ss-border-2)]"><i className="block h-full rounded bg-[var(--ss-primary)]" style={{ width: `${100 - i * 12}%` }} /></div>
                <div className="text-right font-mono text-[13px] font-medium text-[var(--ss-fg)]">{fmt(topTrait, Number(animal[topTrait]))}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ss-card">
          <div className="ss-card-header"><h3 className="ss-card-title">Características de atenção</h3></div>
          <div className="ss-card-body">
            <div className="mb-3 border-b border-[var(--ss-border-2)] pb-3 font-mono text-[11.5px] text-[var(--ss-muted)]">Características do rebanho que estão <b className="text-[var(--ss-primary)]">abaixo do ideal</b> e merecem atenção na seleção de touros</div>
            {attention.map((d) => (
              <div key={d[0]} className="grid grid-cols-[1fr_76px_1fr] items-center gap-3 border-b border-[var(--ss-border-2)] px-1 py-2 last:border-0">
                <div className="text-[13px] font-medium text-[var(--ss-fg)]">{d[0]}<div className="text-[10px] font-normal text-[var(--ss-muted)]">{d[1]}</div></div>
                <div className="h-1.5 overflow-hidden rounded bg-[var(--ss-border-2)]"><i className="block h-full rounded bg-[var(--ss-amber)] opacity-80" style={{ width: `${Math.max(12, Math.abs(d[2] - d[3]) / maxGap * 100)}%` }} /></div>
                <div className="text-right font-mono text-[11.5px] text-[var(--ss-text)]"><b className="text-[var(--ss-fg)]">{d[2].toFixed(2)}</b> → ideal {d[3].toFixed(2)}<div className="text-[9px] text-[var(--ss-muted)]">{d[4]}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
