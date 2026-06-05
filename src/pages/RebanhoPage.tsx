import { Check, Download, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart } from '@/components/charts/RadarChart'
import { SegmentedControl } from '@/components/SegmentedControl'
import { demoHerd, fmt, HAVG, initials, radarGroups, traitLabel } from '@/data/demoData'
import { useFemalesFull } from '@/hooks/useApi'

const rankTraits = ['hhp', 'gtpi', 'nm', 'milk', 'fat', 'prot', 'pl', 'dpr', 'scs', 'ptat', 'udc', 'flc']

export function RebanhoPage() {
  const navigate = useNavigate()
  useFemalesFull({ page: 1 })
  const [trait, setTrait] = useState('hhp')
  const [selected, setSelected] = useState(0)
  const [radar, setRadar] = useState('indices')
  const sorted = useMemo(() => demoHerd.map((animal, idx) => ({ animal, idx })).sort((a, b) => (trait === 'scs' || trait === 'flc') ? Number(a.animal[trait]) - Number(b.animal[trait]) : Number(b.animal[trait]) - Number(a.animal[trait])), [trait])
  const animal = demoHerd[selected]
  const group = radarGroups[radar]

  return (
    <div>
      <div className="ss-preserved"><Check className="h-[15px] w-[15px]" />Filtros e exportação do Rebanho mantidos - adicionamos ranking interativo e perfil do animal vs. média do rebanho.</div>
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
    </div>
  )
}
