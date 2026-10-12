import { Download, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { BenchmarkSpectrum } from '@/components/BenchmarkSpectrum'
import { GaugeChart } from '@/components/charts/GaugeChart'
import { TraitSelect } from '@/components/TraitSelect'
import { useFemalesFull } from '@/hooks/useApi'
import { useBreed } from '@/lib/breed'
import { computeHerdAverage } from '@/lib/herdStats'
import { fmt } from '@/lib/traits'
import { generateReportPdf } from '@/lib/reportPdf'
import { traitLabel } from '@/lib/traits'
import { useI18n } from '@/i18n'

function getZone(trait: string, val: number, natAvg: number, _top25: number, top10: number): { pct: number; zone: string; color: string } {
  const inv = ['scs', 'flc', 'rfi', 'gl', 'sce', 'ssb', 'dsb', 'da', 'ket'].includes(trait)
  const range = inv ? natAvg - top10 : top10 - natAvg
  if (range === 0) return { pct: 50, zone: 'medium', color: 'var(--ss-amber)' }
  const raw = inv ? (natAvg - val) / range : (val - natAvg) / range
  const pct = Math.max(2, Math.min(98, 50 + raw * 50))
  if (pct >= 82) return { pct, zone: 'elite', color: '#1a7a42' }
  if (pct >= 62) return { pct, zone: 'top25', color: 'var(--ss-green)' }
  if (pct >= 42) return { pct, zone: 'medium', color: 'var(--ss-amber)' }
  return { pct, zone: 'below', color: '#C0633A' }
}

export function PainelGenomicoPage() {
  const { t, locale } = useI18n()
  const [spectrumCat, setSpectrumCat] = useState('all')
  const [showReport, setShowReport] = useState(false)
  const [gauge2, setGauge2] = useState('gtpi')
  const [gauge3, setGauge3] = useState('nm')
  const { data: fem, isLoading } = useFemalesFull({ page: 1, perPage: 5000 })
  const { benchmarks, trend, breedLabel, indexKey, indexLabel, traitLabels } = useBreed()
  const females = fem?.data ?? []
  const herdAvg = useMemo(() => computeHerdAverage(females), [females])
  const [reportSections, setReportSections] = useState([
    { key: 'executivo', enabled: true }, { key: 'perfil', enabled: true }, { key: 'temporal', enabled: true }, { key: 'nacional', enabled: true }, { key: 'top5', enabled: true }, { key: 'atencao', enabled: true }, { key: 'haplotipo', enabled: false }, { key: 'scatter', enabled: false },
  ])
  const attention = [
    ['SCS', 'painel.attention.scs', herdAvg.scs ?? null, 2.50, 'painel.attention.lower'], ['FLC', 'painel.attention.flc', herdAvg.flc ?? null, 0.00, 'painel.attention.higher'], ['DPR', 'painel.attention.dpr', herdAvg.dpr ?? null, 2.50, 'painel.attention.higher'], ['RFI', 'painel.attention.rfi', herdAvg.rfi ?? null, -80, 'painel.attention.lower'], ['GL', 'painel.attention.gl', herdAvg.gl ?? null, 0.00, 'painel.attention.lower'], ['DFM', 'painel.attention.dfm', herdAvg.dfm ?? null, 0.30, 'painel.attention.higher'],
  ] as const
  const visibleAttention = attention.filter((d) => d[2] != null)
  const maxGap = Math.max(1, ...visibleAttention.map((d) => Math.abs((d[2] ?? 0) - d[3])))
  const renderGauge = (key: string, control: ReactNode) => {
    const bench = benchmarks?.find(([bKey]) => bKey === key)
    const val = herdAvg[key]
    let gauge: ReactNode
    if (bench && val != null) {
      const [, label, natAvg, top25, top10] = bench
      const zone = getZone(key, val, natAvg, top25, top10)
      const min = Math.round(natAvg - Math.abs(top10 - natAvg))
      gauge = <GaugeChart label={traitLabels[key] ?? traitLabel[key] ?? label} value={val} formattedValue={fmt(key, val)} min={min} max={top10} natAvg={natAvg} zone={t(`painel.${zone.zone}`)} zoneColor={zone.color} />
    } else {
      gauge = <div className="flex h-[130px] items-center justify-center rounded-[14px] border border-dashed border-[var(--ss-border)] bg-[var(--ss-wash)] px-4 text-center text-[12px] text-[var(--ss-muted)]">{t('painel.noIndexReference')}</div>
    }
    return <div className="flex flex-col gap-2">{control}{gauge}</div>
  }
  const categoryTabs = [
    ['all', t('painel.tab.all')], ['indices', t('painel.tab.indices')], ['producao', t('painel.tab.production')], ['funcionais', t('painel.tab.functional')], ['tipo', t('painel.tab.type')], ['saude', t('painel.tab.health')],
  ]
  const hasReference = benchmarks != null && trend != null
  const canGenerateReport = hasReference && 'years' in trend
  const report = () => {
    if (!canGenerateReport) return
    generateReportPdf({ sections: reportSections.map((section) => ({ ...section, label: t(`painel.section.${section.key}`) })), herdAvg, benchmarks, trend: trend as Parameters<typeof generateReportPdf>[0]['trend'], animals: females, attention: visibleAttention, breed: { indexKey, indexLabel }, locale })
  }
  const toggleReportSection = (key: string) => setReportSections((items) => items.map((item) => item.key === key ? { ...item, enabled: !item.enabled } : item))
  const isEmpty = !isLoading && Object.keys(herdAvg).length === 0

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" className="ss-button" onClick={() => setShowReport(true)}>
          <Download />{t('painel.report')}
        </button>
      </div>
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="ss-card w-full max-w-[760px] overflow-hidden">
            <div className="ss-card-header">
              <h3 className="ss-card-title">{t('painel.reportTitle')}</h3>
              <button type="button" className="rounded-md p-1.5 text-[var(--ss-muted)] hover:bg-[var(--ss-wash)]" onClick={() => setShowReport(false)} aria-label={t('painel.close')}><X size={17} /></button>
            </div>
            <div className="ss-card-body">
              <div className="mb-5 grid grid-cols-2 gap-2 max-[640px]:grid-cols-1">
                {reportSections.map((section) => (
                  <label key={section.key} className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium ${section.enabled ? 'border-[var(--ss-primary)] bg-[var(--ss-primary-soft)] text-[var(--ss-primary)]' : 'border-[var(--ss-border)] text-[var(--ss-text)]'}`}>
                    <input type="checkbox" checked={section.enabled} onChange={() => toggleReportSection(section.key)} className="accent-[var(--ss-primary)]" />
                    {t(`painel.section.${section.key}`)}
                  </label>
                ))}
              </div>
              <div className="mb-5 flex flex-wrap justify-center gap-3">
                {['summary', 'profile', 'evolution', 'national', 'top5', 'attention'].map((label) => (
                  <div key={label} className="flex h-[126px] w-[90px] flex-col rounded-md border border-[var(--ss-border)] bg-white p-2 shadow-sm">
                    <div className="mb-2 h-3 rounded-sm bg-[var(--ss-primary)]" />
                    <div className="mb-1 h-1 rounded bg-[var(--ss-border-2)]" />
                    <div className="mb-2 h-1 w-2/3 rounded bg-[var(--ss-border-2)]" />
                    <div className="mt-auto text-center text-[8px] font-bold text-[var(--ss-muted)]">{t(`painel.preview.${label}`)}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="ss-button ss-button-ghost" onClick={() => setShowReport(false)}>{t('common.cancel')}</button>
                <button type="button" className="ss-button disabled:pointer-events-none disabled:opacity-40" disabled={!canGenerateReport} onClick={report}><Download />{t('painel.generatePdf')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gauges + Spectrum */}
      <div className="ss-card mb-4">
        <div className="ss-card-header">
          <div>
            <h3 className="ss-card-title">{t('painel.national')}</h3>
            <p className="mt-1 text-[12px] text-[var(--ss-muted)]">{t('painel.gauges')}</p>
          </div>
        </div>
        <div className="ss-card-body">
          {isEmpty ? (
            <div className="rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] p-6 text-center">
              <div className="text-[14px] font-bold text-[var(--ss-fg)]">{t('painel.noResults')}</div>
              <div className="mt-1 text-[12px] text-[var(--ss-muted)]">{t('painel.resultsHint')}</div>
            </div>
          ) : !hasReference ? (
            <div className="rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] p-6 text-center">
              <div className="text-[14px] font-bold text-[var(--ss-fg)]">{t('painel.referenceUnavailable', { breed: breedLabel })}</div>
              <div className="mt-1 text-[12px] text-[var(--ss-muted)]">{t('painel.averageHint')}</div>
            </div>
          ) : (
            <>
              <div className="ss-section-label">{t('painel.performance')}</div>
              <div className="mb-7 grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                {renderGauge('hhp', <div className="rounded-[8px] bg-[var(--ss-primary-soft)] px-3 py-[7px] text-center text-[11px] font-bold uppercase tracking-[1px] text-[var(--ss-primary)]">{t('painel.primaryIndex')}</div>)}
                {renderGauge(gauge2, <TraitSelect value={gauge2} onChange={setGauge2} />)}
                {renderGauge(gauge3, <TraitSelect value={gauge3} onChange={setGauge3} />)}
              </div>
              <div className="mb-6 flex flex-wrap gap-[2px] rounded-[10px] bg-[var(--ss-border-2)] p-[3px]">
                {categoryTabs.map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setSpectrumCat(key)} className={`rounded-[8px] px-4 py-2 text-[11.5px] font-semibold transition ${spectrumCat === key ? 'bg-white text-[var(--ss-fg)] shadow-[0_1px_3px_rgba(0,0,0,.06)]' : 'text-[var(--ss-muted)] hover:text-[var(--ss-fg)]'}`}>{label}</button>
                ))}
              </div>
              <BenchmarkSpectrum benchmarks={benchmarks} herdAvg={herdAvg} category={spectrumCat} />
            </>
          )}
        </div>
      </div>

      {/* Atenção */}
      <div className="ss-card mb-4">
        <div className="ss-card-header"><h3 className="ss-card-title">{t('painel.attention.title')}</h3></div>
        <div className="ss-card-body">
          <div className="mb-3 border-b border-[var(--ss-border-2)] pb-3 font-mono text-[11.5px] text-[var(--ss-muted)]">{t('painel.attention.description')}</div>
          <div className="grid grid-cols-2 gap-[10px] max-[720px]:grid-cols-1">
            {visibleAttention.map((d) => (
              <div key={d[0]} className="flex items-center gap-3.5 rounded-xl border border-[var(--ss-border)] bg-[var(--ss-wash)] p-4 transition hover:border-[var(--ss-amber)] hover:shadow-[0_0_16px_rgba(217,119,6,.06)]">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--ss-amber-soft)]">
                  <svg className="h-4 w-4 text-[var(--ss-amber)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[var(--ss-fg)]">{d[0]}</div>
                  <div className="text-[10px] text-[var(--ss-muted)]">{t(d[1])}</div>
                  <div className="mt-[7px] h-1 overflow-hidden rounded-[3px] bg-[var(--ss-border-2)]">
                    <i className="block h-full rounded-[3px] bg-[linear-gradient(90deg,var(--ss-amber),#F97316)]" style={{ width: `${Math.max(12, Math.abs((d[2] ?? 0) - d[3]) / maxGap * 100)}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[17px] font-extrabold text-[var(--ss-fg)]">{(d[2] ?? 0).toFixed(2)}</div>
                  <div className="font-mono text-[10px] text-[var(--ss-muted)]">{t('painel.attention.ideal', { value: (d[3] ?? 0).toFixed(2) })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
