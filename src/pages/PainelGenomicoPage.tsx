import { Activity, AlertTriangle, DollarSign, HeartPulse } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DistChart } from '@/components/charts/DistChart'
import { EvoChart } from '@/components/charts/EvoChart'
import { KpiCard } from '@/components/KpiCard'
import { TraitSelect } from '@/components/TraitSelect'
import { demoHerd, fmt, HAVG, traitLabel, trend } from '@/data/demoData'

const medalColor = ['#C99A4B', '#A9A9A9', '#B07A4B', '#CBC4BC', '#CBC4BC']

// National benchmarks (simulated) — [trait, nationalAvg, top25, top10]
const benchmarks: [string, string, number, number, number][] = [
  ['hhp', 'HHP$', 680, 850, 950],
  ['gtpi', 'GTPI', 2450, 2650, 2800],
  ['nm', 'NM$', 720, 880, 960],
  ['milk', 'Leite', 1500, 1900, 2200],
  ['fat', 'Gordura', 55, 70, 85],
  ['prot', 'Proteína', 40, 52, 62],
  ['pl', 'PL', 4.0, 5.8, 7.0],
  ['dpr', 'DPR', 0.5, 1.5, 2.5],
  ['scs', 'SCS', 2.90, 2.78, 2.70],
  ['ptat', 'Tipo', 0.20, 0.40, 0.55],
  ['udc', 'UDC', 0.15, 0.35, 0.48],
  ['flc', 'FLC', -0.90, -0.72, -0.60],
]

function getZone(trait: string, val: number, natAvg: number, _top25: number, top10: number): { pct: number; zone: string; color: string } {
  const inv = ['scs', 'flc'].includes(trait)
  const range = inv ? natAvg - top10 : top10 - natAvg
  if (range === 0) return { pct: 50, zone: 'Médio', color: 'var(--ss-amber)' }
  const raw = inv ? (natAvg - val) / range : (val - natAvg) / range
  const pct = Math.max(2, Math.min(98, 50 + raw * 50))
  if (pct >= 82) return { pct, zone: 'Elite', color: '#1a7a42' }
  if (pct >= 62) return { pct, zone: 'Top 25%', color: 'var(--ss-green)' }
  if (pct >= 42) return { pct, zone: 'Médio', color: 'var(--ss-amber)' }
  return { pct, zone: 'Abaixo', color: '#C0633A' }
}

export function PainelGenomicoPage() {
  const [trait, setTrait] = useState('hhp')
  const [topTrait, setTopTrait] = useState('hhp')
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
          <div className="ss-card mt-3">
            <div className="ss-card-header"><h3 className="ss-card-title">Perfil genético do rebanho</h3></div>
            <div className="ss-card-body">
              <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[.5px] text-[var(--ss-muted)]">
                <span>Característica</span>
                <div className="flex gap-6">
                  <span className="text-[#C0633A]">● Abaixo</span>
                  <span className="text-[var(--ss-amber)]">● Médio</span>
                  <span className="text-[var(--ss-green)]">● Top 25%</span>
                  <span className="text-[#1a7a42]">● Elite</span>
                </div>
              </div>
              {benchmarks.map(([key, label, natAvg, top25, top10]) => {
                const val = HAVG[key] ?? 0
                const { pct, zone, color } = getZone(key, val, natAvg, top25, top10)
                return (
                  <div key={key} className="grid grid-cols-[70px_1fr_72px] items-center gap-2 border-b border-[var(--ss-border-2)] py-[7px] last:border-0">
                    <div className="text-[12px] font-medium text-[var(--ss-fg)]">{label}</div>
                    <div className="relative h-[10px] overflow-hidden rounded-full bg-gradient-to-r from-[#f0c4b8] via-[#f5e6c8] via-60% to-[#b8e0c8]">
                      <div className="absolute top-0 h-full w-[3px] rounded-full bg-[var(--ss-fg)] shadow-sm" style={{ left: `${pct}%` }} />
                    </div>
                    <div className="text-right">
                      <b className="font-mono text-[11.5px]" style={{ color }}>{fmt(key, val)}</b>
                      <div className="text-[8px] font-medium" style={{ color }}>{zone}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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
