import { traitLabel } from '@/data/demoData'

const traitGroups = [
  { label: 'Índices', keys: ['hhp', 'gtpi', 'nm', 'cm', 'fm', 'gm'] },
  { label: 'Produção', keys: ['milk', 'fat', 'fat_pct', 'prot', 'prot_pct', 'cfp', 'fsav', 'rfi', 'efc'] },
  { label: 'Funcionais', keys: ['pl', 'scs', 'dpr', 'hcr', 'ccr', 'liv', 'hliv', 'fi', 'gl'] },
  { label: 'Parto', keys: ['sce', 'ssb', 'dsb', 'mf'] },
  { label: 'Tipo', keys: ['ptat', 'udc', 'flc', 'sta', 'str', 'dfm', 'rua', 'rw', 'rls', 'rlr', 'fta', 'fls', 'fua', 'ruh', 'ruw', 'ucl', 'udp', 'ftp', 'rtp', 'ftl'] },
  { label: 'Saúde', keys: ['mast', 'met', 'rp', 'da', 'ket', 'gfi'] },
]

interface TraitSelectProps {
  value: string
  onChange: (v: string) => void
  className?: string
}

export function TraitSelect({ value, onChange, className }: TraitSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-[7px] border border-[var(--ss-border)] bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-[var(--ss-fg)] outline-none ${className ?? ''}`}
    >
      {traitGroups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.keys.map((k) => (
            <option key={k} value={k}>{traitLabel[k] ?? k.toUpperCase()}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
