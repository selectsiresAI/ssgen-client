import { traitLabel } from '@/lib/traits'
import { useBreed } from '@/lib/breed'
import { useI18n } from '@/i18n'

const traitGroups = [
  { label: 'traits.group.indices', keys: ['hhp', 'gtpi', 'nm', 'cm', 'fm', 'gm'] }, { label: 'traits.group.production', keys: ['milk', 'fat', 'fat_pct', 'prot', 'prot_pct', 'cfp', 'fsav', 'rfi', 'efc'] }, { label: 'traits.group.functional', keys: ['pl', 'scs', 'dpr', 'hcr', 'ccr', 'liv', 'hliv', 'fi', 'gl'] }, { label: 'traits.group.calving', keys: ['sce', 'ssb', 'dsb', 'mf'] }, { label: 'traits.group.type', keys: ['ptat', 'udc', 'flc', 'sta', 'str', 'dfm', 'rua', 'rw', 'rls', 'rlr', 'fta', 'fls', 'fua', 'ruh', 'ruw', 'ucl', 'udp', 'ftp', 'rtp', 'ftl'] }, { label: 'traits.group.health', keys: ['mast', 'met', 'rp', 'da', 'ket', 'gfi'] },
]

interface TraitSelectProps {
  value: string
  onChange: (v: string) => void
  className?: string
}

export function TraitSelect({ value, onChange, className }: TraitSelectProps) {
  const { t } = useI18n()
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
        <optgroup key={g.label} label={t(g.label)}>
          {g.keys.map((k) => (
            <option key={k} value={k}>{traitLabels[k] ?? traitLabel[k] ?? k.toUpperCase()}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

