import { Activity, AlertTriangle, DollarSign, HeartPulse } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DistChart } from '@/components/charts/DistChart'
import { EvoChart } from '@/components/charts/EvoChart'
import { KpiCard } from '@/components/KpiCard'
import { SegmentedControl } from '@/components/SegmentedControl'
import { demoHerd, fmt, HAVG, traitLabel, trend } from '@/data/demoData'

const trendKeys = Object.keys(trend).filter((k) => k !== 'years')
const topTraits = ['gtpi', 'nm', 'hhp', 'milk', 'dpr']
const medalColor = ['#C99A4B', '#A9A9A9', '#B07A4B', '#CBC4BC', '#CBC4BC']

export function PainelGenomicoPage() {
  const [trait, setTrait] = useState('gtpi')
  const [topTrait, setTopTrait] = useState('gtpi')
  const trendRecord = trend as Record<string, number[] | string[]>
  const ranked = useMemo(() => demoHerd.slice().sort((a, b) => Number(b[topTrait]) - Number(a[topTrait])).slice(0, 5), [topTrait])
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
        <KpiCard icon={Activity} label="GTPI Médio" value="+2.687" delta="▲ +94 vs. base" />
        <KpiCard icon={DollarSign} label="NM$ Médio" value="$921" delta="▲ +38" />
        <KpiCard icon={HeartPulse} label="HHP$ Médio" value="$874" delta="▲ +51" />
        <KpiCard icon={AlertTriangle} label="Portadores HH" value="6,3%" delta="▼ monitorar" deltaType="down" />
      </div>
      <div className="ss-grid-2">
        <div className="ss-card">
          <div className="ss-card-header"><h3 className="ss-card-title">Evolução genética por geração</h3><SegmentedControl options={trendKeys.map((k) => ({ value: k, label: traitLabel[k] ?? k.toUpperCase() }))} value={trait} onChange={setTrait} wrap size="sm" /></div>
          <div className="ss-card-body"><EvoChart trait={trait} years={trend.years} data={trendRecord[trait] as number[]} /></div>
        </div>
        <div className="ss-card">
          <div className="ss-card-header"><h3 className="ss-card-title">Distribuição · {traitLabel[trait]}</h3></div>
          <div className="ss-card-body"><DistChart trait={trait} trendData={trendRecord[trait] as number[]} /></div>
        </div>
      </div>
      <div className="ss-grid-2b">
        <div className="ss-card">
          <div className="ss-card-header"><h3 className="ss-card-title">Top 5 por característica</h3><SegmentedControl options={topTraits.map((k) => ({ value: k, label: traitLabel[k] }))} value={topTrait} onChange={setTopTrait} /></div>
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
