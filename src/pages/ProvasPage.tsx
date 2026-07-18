import { Download, FileText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFemalesFull } from '@/hooks/useApi'
import type { FemaleFull } from '@/lib/api'
import { useBreed } from '@/lib/breed'
import { buildProofFromFemale } from '@/lib/proof'
import { femaleTrait, fmt, traitLabel } from '@/lib/traits'
import { generateProofPdf, generateCatalogPdf } from '@/lib/pdf'

const rankTraits = ['hhp', 'gtpi', 'nm', 'milk', 'fat', 'prot', 'pl', 'dpr', 'scs', 'ptat', 'udc', 'flc']

function LinearRows({ data, limit }: { data: [string, number, string][]; limit?: number }) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-[1fr_150px_48px] gap-2"><div /><div className="flex justify-between font-mono text-[9px] text-[var(--ss-muted)]"><span>-2</span><span>-1</span><span>0</span><span>+1</span><span>+2</span></div></div>
      {data.slice(0, limit).map((line) => {
        const v = line[1]
        const half = Math.min(Math.abs(v) / 2, 1) * 50
        const left = v >= 0 ? 50 : 50 - half
        return (
          <div key={line[0]} className="grid grid-cols-[1fr_150px_48px] items-center gap-2 py-[2.5px]">
            <div className="font-mono text-[10px] text-[var(--ss-text)]">{line[0]}</div>
            <div className="relative h-[11px] rounded-sm border border-[var(--ss-border)] bg-[var(--ss-wash)]"><div className="absolute bottom-[-1px] left-1/2 top-[-1px] w-px bg-[#CBC4BC]" /><i className="absolute bottom-px top-px rounded-sm bg-[var(--ss-primary)] opacity-90" style={{ left: `${left}%`, width: `${half}%` }} /></div>
            <div className="text-right font-mono text-[10px] font-medium text-[var(--ss-fg)]">{v.toFixed(2)} {line[2]}</div>
          </div>
        )
      })}
    </div>
  )
}

export function ProvasPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [active, setActive] = useState(0)
  const [query, setQuery] = useState('')
  const [rankTrait, setRankTrait] = useState('hhp')
  const { indexLabel, udderLabel, traitLabels } = useBreed()
  const { data } = useFemalesFull({ page: 1, perPage: 5000 })
  const herd = data?.data ?? []
  const animal = herd[active] ?? herd[0]
  const animalProof = useMemo(() => animal ? buildProofFromFemale(animal) : null, [animal])

  const inverse = ['scs', 'flc']
  const sorted = useMemo(() => {
    return herd.map((a, i) => ({ a, i })).sort((x, y) =>
      inverse.includes(rankTrait)
        ? (femaleTrait(x.a, rankTrait) ?? Infinity) - (femaleTrait(y.a, rankTrait) ?? Infinity)
        : (femaleTrait(y.a, rankTrait) ?? -Infinity) - (femaleTrait(x.a, rankTrait) ?? -Infinity)
    )
  }, [herd, rankTrait])

  const filtered = useMemo(() => {
    if (query) return sorted.filter(({ a }) => `${a.name ?? ''} ${a.ear_tag ?? ''} ${a.sire_naab ?? ''}`.toUpperCase().includes(query.toUpperCase()))
    return sorted
  }, [query, sorted])

  const toggle = (idx: number) => setSelected((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next })
  const selectedFemales = Array.from(selected).map((i) => herd[i]).filter((f): f is FemaleFull => Boolean(f))

  if (herd.length === 0) {
    return (
      <div className="ss-card">
        <div className="ss-card-body text-center">
          <div className="text-[14px] font-bold text-[var(--ss-fg)]">Nenhuma fêmea</div>
          <div className="mt-1 text-[12px] text-[var(--ss-muted)]">Sem resultados genômicos ainda</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="flex w-[280px] items-center gap-2 rounded-[7px] border border-[var(--ss-border)] bg-white px-3 py-2"><Search className="h-4 w-4 text-[var(--ss-muted)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar fêmea..." className="w-full border-0 bg-transparent text-[13px] outline-none" /></div>
        <span className="font-mono text-[11.5px] text-[var(--ss-muted)]">{selected.size} selecionada{selected.size !== 1 ? 's' : ''}</span>
        <button className="ss-button ss-button-sm disabled:pointer-events-none disabled:opacity-40" disabled={selectedFemales.length === 0} onClick={() => generateCatalogPdf(selectedFemales)}><FileText />Gerar Catálogo PDF</button>
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[340px_1fr] lg:items-stretch" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="ss-card flex flex-col">
          <div className="ss-card-header">
            <h3 className="ss-card-title">Fêmeas · {herd.length}</h3>
            <select className="rounded-[7px] border border-[var(--ss-border)] bg-white px-2 py-1.5 text-[11px] font-medium" value={rankTrait} onChange={(e) => setRankTrait(e.target.value)}>
              {rankTraits.map((key) => <option key={key} value={key}>{traitLabels[key] ?? traitLabel[key]}</option>)}
            </select>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {filtered.map(({ a, i }) => (
              <button key={a.id} onClick={() => setActive(i)} className={`ss-rrow w-full grid-cols-[28px_1fr_auto_auto] px-3.5 py-2.5 text-left ${i === active ? 'is-selected' : ''}`}>
                <input type="checkbox" checked={selected.has(i)} onClick={(e) => e.stopPropagation()} onChange={() => toggle(i)} className="h-[15px] w-[15px] accent-[var(--ss-primary)]" />
                <div><div className="text-[13px] font-medium text-[var(--ss-fg)]">{a.name ?? a.ear_tag ?? 'Sem identificação'}</div><div className="font-mono text-[11px] text-[var(--ss-muted)]">{a.sire_naab ?? '—'} · Brinco {a.ear_tag ?? '—'}</div></div>
                <div className="text-right"><b className="block font-mono text-xs text-[var(--ss-fg)]">{femaleTrait(a, rankTrait) != null ? fmt(rankTrait, femaleTrait(a, rankTrait) ?? 0) : '—'}</b><small className="text-[8.5px] text-[var(--ss-muted-2)]">{traitLabels[rankTrait] ?? traitLabel[rankTrait]}</small></div>
                <div className="text-right"><b className="block font-mono text-xs text-[var(--ss-fg)]">{a.hhp_dollar != null ? `$${a.hhp_dollar}` : '—'}</b><small className="text-[8.5px] text-[var(--ss-muted-2)]">HHP$</small></div>
              </button>
            ))}
          </div>
        </div>

        <div className="ss-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ss-border-2)] px-5 py-[13px]"><span className="rounded-full border border-[var(--ss-border)] bg-[var(--ss-wash)] px-3 py-1.5 font-mono text-[11px]">Prova <b className="text-[var(--ss-primary)]">genômica</b></span><span className="font-mono text-[11px] text-[var(--ss-muted)]">Base <b className="text-[var(--ss-fg)]">Predição Pedigree</b></span><button className="ss-button ss-button-ghost ss-button-sm" onClick={() => animal && generateProofPdf(animal)}><Download />PDF</button></div>
          <div className="grid grid-cols-1 lg:grid-cols-[.96fr_1.04fr]">
            <div className="border-r border-[var(--ss-border-2)] p-6">
              <div className="text-lg font-bold leading-tight tracking-[-.3px] text-[var(--ss-fg)]">{animal?.name ?? animal?.ear_tag ?? 'Sem identificação'}</div>
              <div className="mt-2 font-mono text-[11px] leading-7 text-[var(--ss-text)]"><span className="text-[var(--ss-muted)]">Brinco {animal?.ear_tag ?? '—'}</span> · {animal?.breed ?? '—'} · Predição Pedigree<br /><b className="text-[var(--ss-fg)]">HHP$ {animal?.hhp_dollar ?? '—'}</b> · {indexLabel} +{animal?.tpi ?? '—'} · NM$ {animal?.nm_dollar ?? '—'}</div>
              <div className="my-5 border-b-2 border-[var(--ss-fg)] pb-1 text-[11px] font-semibold uppercase tracking-[.6px] text-[var(--ss-fg)]">Pedigree</div>
              <div className="font-mono text-[11px] leading-6 text-[var(--ss-text)]">{animalProof?.ped.map((p, i) => p[0] === 'lact' ? <span key={i} className="block pl-4 text-[10px] text-[var(--ss-muted)]">{p[2]}</span> : <div key={i}><span className="font-medium text-[var(--ss-primary)]">{p[1]}</span> {p[2]}</div>)}</div>
              <div className="my-5 border-b-2 border-[var(--ss-fg)] pb-1 text-[11px] font-semibold uppercase tracking-[.6px] text-[var(--ss-fg)]">Linear</div>
              <LinearRows data={animalProof?.lin ?? []} />
            </div>
            <div className="p-6">
              {animalProof?.sections.map((section) => (
                <div key={section.t}>
                  <div className="mb-2 mt-5 flex justify-between border-b-2 border-[var(--ss-fg)] pb-1 text-[11px] font-semibold uppercase tracking-[.6px] text-[var(--ss-fg)] first:mt-0">{section.t}<span className="font-mono text-[8.5px] font-normal normal-case tracking-normal text-[var(--ss-muted)]">{section.meta}</span></div>
                  {section.rows.map((row) => {
                    const label = row[0] === 'TPI' ? indexLabel : row[0] === 'UDC' ? udderLabel : row[0]
                    return <div key={`${section.t}-${row[0]}`} className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-baseline gap-2 border-b border-[var(--ss-border-2)] py-[3.5px] font-mono text-[11px]"><div className="text-[var(--ss-text)]">{label}</div><div className="text-right font-medium text-[var(--ss-fg)]">{row[1]}</div><div className="text-right text-[9.5px] text-[var(--ss-muted)]">{row[2]}</div></div>
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
