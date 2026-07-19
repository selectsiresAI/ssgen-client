import { traitLabel } from '@/lib/traits'
import { useBreed } from '@/lib/breed'

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
  const { indexKey, udderKey, traitLabels } = useBreed()
  const groups = traitGroups.map((group) => ({
    ...group,
    keys: group.keys.map((key) => {
      if (key === 'gtpi') return indexKey
      if (key === 'udc') return udderKey
      return key
    }),
  }))

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-[8px] border border-[var(--ss-border)] bg-white px-3 py-1.5 font-mono text-[11px] text-[var(--ss-fg)] outline-none ${className ?? ''}`}
    >
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.keys.map((k) => (
            <option key={k} value={k}>{traitLabels[k] ?? traitLabel[k] ?? k.toUpperCase()}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

