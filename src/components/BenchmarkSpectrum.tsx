import { fmt, traitLabel } from '@/lib/traits'
import { useBreed } from '@/lib/breed'

interface BenchmarkSpectrumProps {
  benchmarks: [string, string, number, number, number][]
  herdAvg: Record<string, number>
  category: string
}

const inverted = ['scs', 'flc', 'rfi', 'gl', 'sce', 'ssb', 'dsb', 'da', 'ket']
const categories: Record<string, string[]> = {
  indices: ['hhp', 'gtpi', 'nm', 'cm', 'fm', 'gm'],
  producao: ['milk', 'fat', 'fat_pct', 'prot', 'prot_pct', 'cfp', 'fsav', 'rfi', 'efc'],
  funcionais: ['pl', 'dpr', 'scs', 'hcr', 'ccr', 'liv', 'hliv', 'fi', 'gl', 'sce', 'ssb', 'dsb', 'mf'],
  tipo: ['ptat', 'udc', 'flc', 'sta', 'str', 'dfm', 'rua', 'fua', 'ruw', 'ftp'],
  saude: ['mast', 'met', 'rp', 'da', 'ket', 'gfi'],
}

function zoneFor(trait: string, val: number, natAvg: number, _top25: number, top10: number) {
  const inv = inverted.includes(trait)
  const range = inv ? natAvg - top10 : top10 - natAvg
  const raw = range === 0 ? 0 : inv ? (natAvg - val) / range : (val - natAvg) / range
  const pct = Math.max(2, Math.min(98, 50 + raw * 50))
  if (pct >= 82) return { pct, zone: 'Elite', color: '#1a7a42' }
  if (pct >= 62) return { pct, zone: 'Top 25%', color: 'var(--ss-green)' }
  if (pct >= 42) return { pct, zone: 'Médio', color: 'var(--ss-amber)' }
  return { pct, zone: 'Abaixo', color: '#C0633A' }
}

export function BenchmarkSpectrum({ benchmarks, herdAvg, category }: BenchmarkSpectrumProps) {
  const { indexKey, udderKey, traitLabels } = useBreed()
  const categoryKeys = categories[category]?.map((key) => {
    if (key === 'gtpi') return indexKey
    if (key === 'udc') return udderKey
    return key
  })
  const filtered = category === 'all' ? benchmarks : benchmarks.filter(([key]) => categoryKeys?.includes(key))

  return (
    <div className="flex max-h-[420px] flex-col overflow-y-auto ss-herd-scroll">
      {filtered.map(([key, label, natAvg, top25, top10]) => {
        const val = herdAvg[key] ?? 0
        const mine = zoneFor(key, val, natAvg, top25, top10)
        const inv = inverted.includes(key)
        const diff = natAvg === 0 ? 0 : ((inv ? natAvg - val : val - natAvg) / Math.abs(natAvg)) * 100
        return (
          <div key={key} className="grid grid-cols-[110px_1fr_120px] items-center gap-[18px] border-b border-[var(--ss-border-2)] py-[14px] last:border-0 max-[720px]:grid-cols-1">
            <div>
              <div className="text-[14px] font-bold text-[var(--ss-fg)]">{label}</div>
              <div className="font-mono text-[10px] text-[var(--ss-muted)]">{traitLabels[key] ?? traitLabel[key] ?? key.toUpperCase()}</div>
            </div>
            <div className="relative h-2 rounded-[5px] bg-[linear-gradient(90deg,#DC2626,#F59E0B_30%,#65A30D_60%,#22C55E_85%,#16A34A)] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)]">
              <div className="absolute inset-y-0 z-20 w-0.5" style={{ left: '50%', background: 'repeating-linear-gradient(to bottom, var(--ss-muted) 0, var(--ss-muted) 3px, transparent 3px, transparent 6px)' }} />
              <div className="absolute inset-y-0 z-30 flex flex-col items-center" style={{ left: `${mine.pct}%` }}>
                <span className="absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-[var(--ss-fg)] px-2 py-0.5 font-mono text-[11px] font-extrabold text-white shadow-[0_3px_10px_rgba(0,0,0,.2)]">{fmt(key, val)}</span>
                <span className="absolute top-[2px] left-1/2 -translate-x-1/2 h-3 w-0.5 rounded-sm bg-[var(--ss-fg)]" />
              </div>
            </div>
            <div className="text-right max-[720px]:text-left">
              <div className="font-mono text-[18px] font-black tracking-[-1px]" style={{ color: mine.color }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</div>
              <span className="inline-flex rounded-[6px] px-2.5 py-1 text-[10px] font-bold" style={{ background: `${mine.color}20`, color: mine.color }}>{mine.zone}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

