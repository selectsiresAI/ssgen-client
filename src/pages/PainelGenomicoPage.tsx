import { Download, X } from 'lucide-react'
import { useState } from 'react'
import { BenchmarkSpectrum } from '@/components/BenchmarkSpectrum'
import { GaugeChart } from '@/components/charts/GaugeChart'
import { DeltaCard } from '@/components/DeltaCard'
import { benchmarks, demoHerd, fmt, HAVG, traitLabel, trend } from '@/data/demoData'
import { generateReportPdf } from '@/lib/reportPdf'

function getZone(trait: string, val: number, natAvg: number, _top25: number, top10: number): { pct: number; zone: string; color: string } {
  const inv = ['scs', 'flc', 'rfi', 'gl', 'sce', 'ssb', 'dsb', 'da', 'ket'].includes(trait)
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
  const [spectrumCat, setSpectrumCat] = useState('all')
  const [periodFrom, setPeriodFrom] = useState(2)
  const [periodTo, setPeriodTo] = useState(6)
  const [showReport, setShowReport] = useState(false)
  const [reportSections, setReportSections] = useState([
    { key: 'executivo', label: 'Resumo Executivo (KPIs)', enabled: true },
    { key: 'perfil', label: 'Perfil Genético (barras)', enabled: true },
    { key: 'temporal', label: 'Progressão Temporal', enabled: true },
    { key: 'nacional', label: 'Rebanho vs Nacional', enabled: true },
    { key: 'top5', label: 'Top 5 Animais', enabled: true },
    { key: 'atencao', label: 'Fraquezas e Recomendações', enabled: true },
    { key: 'haplotipo', label: 'Haplotipo Comparativo', enabled: false },
    { key: 'scatter', label: 'Scatter Plot', enabled: false },
  ])
  const trendRecord = trend as Record<string, number[] | string[]>

  const attention = [
    ['SCS', 'Células Somáticas', HAVG.scs, 2.50, '↓ menor é melhor'],
    ['FLC', 'Escore Pernas/Pés', HAVG.flc, 0.00, '↑ maior é melhor'],
    ['DPR', 'Taxa Prenhez Filhas', HAVG.dpr, 2.50, '↑ maior é melhor'],
    ['RFI', 'Feed Intake Residual', HAVG.rfi, -80, '↓ menor é melhor'],
    ['GL', 'Gestation Length', HAVG.gl, 0.00, '↓ menor é melhor'],
    ['DFM', 'Dairy Form', HAVG.dfm, 0.30, '↑ maior é melhor'],
  ] as const
  const maxGap = Math.max(...attention.map((d) => Math.abs(d[2] - d[3])))
  const gaugeKeys = ['hhp', 'gtpi', 'nm']
  const categoryTabs = [
    ['all', 'Todos'],
    ['indices', 'Índices'],
    ['producao', 'Produção'],
    ['funcionais', 'Funcionais'],
    ['tipo', 'Tipo'],
    ['saude', 'Saúde'],
  ]
  const periodTraits = [
    ['hhp', 'Índice econômico'],
    ['gtpi', 'Mérito genômico'],
    ['nm', 'Mérito líquido'],
  ]
  const fromIndex = Math.min(periodFrom, periodTo)
  const toIndex = Math.max(periodFrom, periodTo)
  const report = () => generateReportPdf({ sections: reportSections, herdAvg: HAVG, benchmarks, trend, animals: demoHerd, attention })
  const toggleReportSection = (key: string) => setReportSections((items) => items.map((item) => item.key === key ? { ...item, enabled: !item.enabled } : item))

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" className="ss-button" onClick={() => setShowReport(true)}>
          <Download />Gerar Relatório
        </button>
      </div>
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="ss-card w-full max-w-[760px] overflow-hidden">
            <div className="ss-card-header">
              <h3 className="ss-card-title">Gerar Relatório Executivo</h3>
              <button type="button" className="rounded-md p-1.5 text-[var(--ss-muted)] hover:bg-[var(--ss-wash)]" onClick={() => setShowReport(false)} aria-label="Fechar"><X size={17} /></button>
            </div>
            <div className="ss-card-body">
              <div className="mb-5 grid grid-cols-2 gap-2 max-[640px]:grid-cols-1">
                {reportSections.map((section) => (
                  <label key={section.key} className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium ${section.enabled ? 'border-[var(--ss-primary)] bg-[var(--ss-primary-soft)] text-[var(--ss-primary)]' : 'border-[var(--ss-border)] text-[var(--ss-text)]'}`}>
                    <input type="checkbox" checked={section.enabled} onChange={() => toggleReportSection(section.key)} className="accent-[var(--ss-primary)]" />
                    {section.label}
                  </label>
                ))}
              </div>
              <div className="mb-5 flex flex-wrap justify-center gap-3">
                {['Resumo', 'Perfil', 'Evolução', 'Nacional', 'Top 5', 'Atenção'].map((label) => (
                  <div key={label} className="flex h-[126px] w-[90px] flex-col rounded-md border border-[var(--ss-border)] bg-white p-2 shadow-sm">
                    <div className="mb-2 h-3 rounded-sm bg-[var(--ss-primary)]" />
                    <div className="mb-1 h-1 rounded bg-[var(--ss-border-2)]" />
                    <div className="mb-2 h-1 w-2/3 rounded bg-[var(--ss-border-2)]" />
                    <div className="mt-auto text-center text-[8px] font-bold text-[var(--ss-muted)]">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="ss-button ss-button-ghost" onClick={() => setShowReport(false)}>Cancelar</button>
                <button type="button" className="ss-button" onClick={report}><Download />Gerar PDF (6 páginas)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gauges + Spectrum */}
      <div className="ss-card mb-4">
        <div className="ss-card-header">
          <div>
            <h3 className="ss-card-title">Rebanho vs Nacional</h3>
            <p className="mt-1 text-[12px] text-[var(--ss-muted)]">Gauges para índices-chave e espectro comparativo por característica.</p>
          </div>
        </div>
        <div className="ss-card-body">
          <div className="ss-section-label">Performance vs Benchmark</div>
          <div className="mb-7 grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
            {gaugeKeys.map((key) => {
              const bench = benchmarks.find(([bKey]) => bKey === key)
              if (!bench) return null
              const [, label, natAvg, top25, top10] = bench
              const val = HAVG[key] ?? 0
              const zone = getZone(key, val, natAvg, top25, top10)
              const min = Math.round(natAvg - Math.abs(top10 - natAvg))
              return <GaugeChart key={key} label={label} value={val} formattedValue={fmt(key, val)} min={min} max={top10} natAvg={natAvg} zone={zone.zone} zoneColor={zone.color} />
            })}
          </div>
          <div className="mb-6 flex flex-wrap gap-[2px] rounded-[10px] bg-[var(--ss-border-2)] p-[3px]">
            {categoryTabs.map(([key, label]) => (
              <button key={key} type="button" onClick={() => setSpectrumCat(key)} className={`rounded-[8px] px-4 py-2 text-[11.5px] font-semibold transition ${spectrumCat === key ? 'bg-white text-[var(--ss-fg)] shadow-[0_1px_3px_rgba(0,0,0,.06)]' : 'text-[var(--ss-muted)] hover:text-[var(--ss-fg)]'}`}>{label}</button>
            ))}
          </div>
          <BenchmarkSpectrum benchmarks={benchmarks} herdAvg={HAVG} category={spectrumCat} />
        </div>
      </div>

      {/* Atenção */}
      <div className="ss-card mb-4">
        <div className="ss-card-header"><h3 className="ss-card-title">Características de atenção</h3></div>
        <div className="ss-card-body">
          <div className="mb-3 border-b border-[var(--ss-border-2)] pb-3 font-mono text-[11.5px] text-[var(--ss-muted)]">Características do rebanho que estão <b className="text-[var(--ss-primary)]">abaixo do ideal</b> e merecem atenção na seleção de touros</div>
          <div className="grid grid-cols-2 gap-[10px] max-[720px]:grid-cols-1">
            {attention.map((d) => (
              <div key={d[0]} className="flex items-center gap-3.5 rounded-xl border border-[var(--ss-border)] bg-[var(--ss-wash)] p-4 transition hover:border-[var(--ss-amber)] hover:shadow-[0_0_16px_rgba(217,119,6,.06)]">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--ss-amber-soft)]">
                  <svg className="h-4 w-4 text-[var(--ss-amber)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[var(--ss-fg)]">{d[0]}</div>
                  <div className="text-[10px] text-[var(--ss-muted)]">{d[1]}</div>
                  <div className="mt-[7px] h-1 overflow-hidden rounded-[3px] bg-[var(--ss-border-2)]">
                    <i className="block h-full rounded-[3px] bg-[linear-gradient(90deg,var(--ss-amber),#F97316)]" style={{ width: `${Math.max(12, Math.abs(d[2] - d[3]) / maxGap * 100)}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[17px] font-extrabold text-[var(--ss-fg)]">{d[2].toFixed(2)}</div>
                  <div className="font-mono text-[10px] text-[var(--ss-muted)]">ideal {d[3].toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparativo Temporal */}
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Comparativo Temporal</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-[var(--ss-muted)]">De</span>
            <select value={periodFrom} onChange={(e) => setPeriodFrom(Number(e.target.value))} className="rounded-[8px] border border-[var(--ss-border)] bg-white px-2.5 py-1.5 font-mono text-[12px]">
              {trend.years.map((year, i) => <option key={year} value={i}>{year}</option>)}
            </select>
            <span className="font-bold text-[var(--ss-muted-2)]">VS</span>
            <select value={periodTo} onChange={(e) => setPeriodTo(Number(e.target.value))} className="rounded-[8px] border border-[var(--ss-border)] bg-white px-2.5 py-1.5 font-mono text-[12px]">
              {trend.years.map((year, i) => <option key={year} value={i}>{year}</option>)}
            </select>
            <span className="rounded-md border border-[var(--ss-border-2)] bg-[var(--ss-wash)] px-2.5 py-1 text-[12px] text-[var(--ss-muted)]">{trend.years[toIndex]} - {trend.years[fromIndex]}</span>
          </div>
        </div>
        <div className="ss-card-body">
          <div className="ss-grid-3-delta">
            {periodTraits.map(([key, subtitle]) => {
              const data = trendRecord[key] as number[]
              return <DeltaCard key={key} trait={key} label={traitLabel[key]} subtitle={subtitle} fromValue={data[fromIndex]} toValue={data[toIndex]} sparkData={data.slice(fromIndex, toIndex + 1)} formatter={fmt} />
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
