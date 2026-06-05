import { Download, FileText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SegmentedControl } from '@/components/SegmentedControl'
import { demoHerd, proof } from '@/data/demoData'
import { generateProofPdf, generateCatalogPdf } from '@/lib/pdf'

function LinearRows({ limit }: { limit?: number }) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-[1fr_150px_48px] gap-2"><div /><div className="flex justify-between font-mono text-[9px] text-[var(--ss-muted)]"><span>-2</span><span>-1</span><span>0</span><span>+1</span><span>+2</span></div></div>
      {proof.lin.slice(0, limit).map((line) => {
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
  const [view, setView] = useState('detail')
  const [query, setQuery] = useState('')
  const animal = demoHerd[active]
  const filtered = useMemo(() => demoHerd.map((a, i) => ({ a, i })).filter(({ a }) => !query || `${a.name} ${a.id} ${a.sire}`.toUpperCase().includes(query.toUpperCase())), [query])

  const toggleAll = () => setSelected((prev) => prev.size === demoHerd.length ? new Set() : new Set(demoHerd.map((_, i) => i)))
  const toggle = (idx: number) => setSelected((prev) => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next })

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="flex w-[280px] items-center gap-2 rounded-[7px] border border-[var(--ss-border)] bg-white px-3 py-2"><Search className="h-4 w-4 text-[var(--ss-muted)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar fêmea..." className="w-full border-0 bg-transparent text-[13px] outline-none" /></div>
        <SegmentedControl options={[{ value: 'all', label: 'Todas' }, { value: 'with', label: 'Com prova' }, { value: 'without', label: 'Sem prova' }]} value="all" onChange={() => undefined} />
        <span className="font-mono text-[11.5px] text-[var(--ss-muted)]">{selected.size} selecionada{selected.size !== 1 ? 's' : ''}</span>
        <button className="ss-button ss-button-ghost ss-button-sm" onClick={toggleAll}>Selecionar todas</button>
        <button className="ss-button ss-button-sm disabled:pointer-events-none disabled:opacity-40" disabled={selected.size === 0} onClick={() => generateCatalogPdf(Array.from(selected).map((i) => demoHerd[i]))}><FileText />Gerar Catálogo PDF</button>
        <SegmentedControl options={[{ value: 'detail', label: 'Prova Detalhada' }, { value: 'pdf', label: 'Preview PDF' }]} value={view} onChange={setView} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[340px_1fr]">
        <div className="ss-card">
          <div className="ss-card-header"><h3 className="ss-card-title">Fêmeas · {demoHerd.length}</h3></div>
          <div className="max-h-[calc(100vh-180px)] overflow-auto p-2">
            {filtered.map(({ a, i }) => (
              <button key={a.id} onClick={() => setActive(i)} className={`ss-rrow w-full grid-cols-[28px_1fr_auto_auto] px-3.5 py-2.5 text-left ${i === active ? 'is-selected' : ''}`}>
                <input type="checkbox" checked={selected.has(i)} onClick={(e) => e.stopPropagation()} onChange={() => toggle(i)} className="h-[15px] w-[15px] accent-[var(--ss-primary)]" />
                <div><div className="text-[13px] font-medium text-[var(--ss-fg)]">{a.name}</div><div className="font-mono text-[11px] text-[var(--ss-muted)]">{a.sire} · Brinco {a.id}</div></div>
                <div className="text-right"><b className="block font-mono text-xs text-[var(--ss-fg)]">${a.hhp}</b><small className="text-[8.5px] text-[var(--ss-muted-2)]">HHP$</small></div>
                <div className="text-right"><b className="block font-mono text-xs text-[var(--ss-fg)]">+{a.gtpi}</b><small className="text-[8.5px] text-[var(--ss-muted-2)]">GTPI</small></div>
              </button>
            ))}
          </div>
        </div>

        {view === 'detail' ? (
          <div className="ss-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ss-border-2)] px-5 py-[13px]"><span className="rounded-full border border-[var(--ss-border)] bg-[var(--ss-wash)] px-3 py-1.5 font-mono text-[11px]">Validade <b className="text-[var(--ss-primary)]">04/2026</b></span><span className="font-mono text-[11px] text-[var(--ss-muted)]">Base <b className="text-[var(--ss-fg)]">CDCB-S</b></span><button className="ss-button ss-button-ghost ss-button-sm" onClick={() => generateProofPdf(animal)}><Download />PDF</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-[.96fr_1.04fr]">
              <div className="border-r border-[var(--ss-border-2)] p-6">
                <div className="text-lg font-bold leading-tight tracking-[-.3px] text-[var(--ss-fg)]">{animal.name}</div>
                <div className="mt-2 font-mono text-[11px] leading-7 text-[var(--ss-text)]"><span className="text-[var(--ss-muted)]">HO840329657664</span> · 99% RHA-I · Born 2/12/25<br /><b className="text-[var(--ss-fg)]">HHP$ ${animal.hhp}</b> · GTPI +{animal.gtpi} · NM$ ${animal.nm}</div>
                <div className="my-5 border-b-2 border-[var(--ss-fg)] pb-1 text-[11px] font-semibold uppercase tracking-[.6px] text-[var(--ss-fg)]">Pedigree</div>
                <div className="font-mono text-[11px] leading-6 text-[var(--ss-text)]">{proof.ped.map((p, i) => p[0] === 'lact' ? <span key={i} className="block pl-4 text-[10px] text-[var(--ss-muted)]">{p[2]}</span> : <div key={i}><span className="font-medium text-[var(--ss-primary)]">{p[1]}</span> {p[2]}</div>)}</div>
                <div className="my-5 border-b-2 border-[var(--ss-fg)] pb-1 text-[11px] font-semibold uppercase tracking-[.6px] text-[var(--ss-fg)]">Linear</div>
                <LinearRows />
              </div>
              <div className="p-6">
                {proof.sections.map((section) => (
                  <div key={section.t}>
                    <div className="mb-2 mt-5 flex justify-between border-b-2 border-[var(--ss-fg)] pb-1 text-[11px] font-semibold uppercase tracking-[.6px] text-[var(--ss-fg)] first:mt-0">{section.t}<span className="font-mono text-[8.5px] font-normal normal-case tracking-normal text-[var(--ss-muted)]">{section.meta}</span></div>
                    {section.rows.map((row) => <div key={`${section.t}-${row[0]}`} className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-baseline gap-2 border-b border-[var(--ss-border-2)] py-[3.5px] font-mono text-[11px]"><div className="text-[var(--ss-text)]">{row[0]}</div><div className="text-right font-medium text-[var(--ss-fg)]">{row[1]}</div><div className="text-right text-[9.5px] text-[var(--ss-muted)]">{row[2]}</div></div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[760px] bg-white shadow-sm">
            <div className="bg-[var(--ss-primary)] px-8 py-4 text-white"><b>Select Sires</b><div className="text-xs opacity-80">Prova individual · Preview PDF</div></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[var(--ss-fg)]">{animal.name}</h2>
              <p className="font-mono text-xs text-[var(--ss-muted)]">HO840329657664 · 99% RHA-I · Born 2/12/25 · aAa 243</p>
              <div className="my-5 grid grid-cols-3 gap-2">{[['HHP$', `$${animal.hhp}`], ['GTPI', `+${animal.gtpi}`], ['NM$', `$${animal.nm}`], ['CM$', '$860'], ['FM$', '$890'], ['GM$', '$760']].map((kv) => <div key={kv[0]} className="rounded-md bg-[var(--ss-wash)] px-2 py-1.5"><div className="text-[8px] uppercase tracking-[.5px] text-[var(--ss-muted)]">{kv[0]}</div><div className="font-mono text-[13px] font-semibold text-[var(--ss-fg)]">{kv[1]}</div></div>)}</div>
              <div className="grid grid-cols-2 gap-6"><div><h3 className="mb-2 text-xs font-semibold uppercase">Pedigree</h3><div className="font-mono text-[10px] leading-5">{proof.ped.slice(0, 7).map((p, i) => <div key={i}>{p[2]}</div>)}</div></div><div><h3 className="mb-2 text-xs font-semibold uppercase">Linear</h3><LinearRows limit={10} /></div></div>
              <div className="mt-5 flex flex-wrap gap-1.5">{animal.haps.map((h) => <span key={h[0]} className={`ss-chip ${h[1] === 'free' ? 'ss-chip-free' : 'ss-chip-carr'}`}>{h[0]} · {h[1] === 'free' ? 'Livre' : 'Portador'}</span>)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
