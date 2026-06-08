export const NEXUS_TRAITS = [
  "HHP+", "TPI", "ML$", "Leite lbs", "Gordura lbs",
  "Proteína lbs", "CFP", "VP", "DPR", "CCS", "PTA Type", "Composto Ubere",
] as const

export type NexusTrait = (typeof NEXUS_TRAITS)[number]

const INTEGER_TRAITS: NexusTrait[] = ["HHP+", "TPI", "ML$", "Leite lbs", "Gordura lbs", "Proteína lbs", "CFP"]

export function parseNum(v: unknown): number {
  if (v == null) return NaN
  const s = String(v).trim().replace(/,/g, '')
  return Number(s)
}

export function formatTrait(trait: NexusTrait, value: number): string {
  if (isNaN(value)) return '—'
  if (INTEGER_TRAITS.includes(trait)) return Math.round(value).toString()
  return value.toFixed(2)
}

const HEADER_MAPPING: Record<string, string> = {
  'ID Animal': 'ID Animal',
  Brinco: 'ID Animal',
  identifier: 'ID Animal',
  'Data de Nascimento': 'Data de Nascimento',
  Nascimento: 'Data de Nascimento',
  'Data Nascimento': 'Data de Nascimento',
  'HHP+': 'HHP+',
  'HHP$': 'HHP$',
  TPI: 'TPI',
  'ML$': 'ML$',
  'NM$': 'ML$',
  'Leite lbs': 'Leite lbs',
  'Leite (lb)': 'Leite lbs',
  'Leite (lbs)': 'Leite lbs',
  PTAM: 'Leite lbs',
  Milk: 'Leite lbs',
  'Gordura lbs': 'Gordura lbs',
  'Gordura (lb)': 'Gordura lbs',
  'Gordura (lbs)': 'Gordura lbs',
  PTAF: 'Gordura lbs',
  Fat: 'Gordura lbs',
  'Proteína lbs': 'Proteína lbs',
  'Proteina lbs': 'Proteína lbs',
  'Proteína (lb)': 'Proteína lbs',
  'Proteína (lbs)': 'Proteína lbs',
  'Proteina (lb)': 'Proteína lbs',
  'Proteina (lbs)': 'Proteína lbs',
  PTAP: 'Proteína lbs',
  Protein: 'Proteína lbs',
  CFP: 'CFP',
  VP: 'VP',
  DPR: 'DPR',
  CCS: 'CCS',
  SCS: 'CCS',
  'PTA Type': 'PTA Type',
  PTAT: 'PTA Type',
  'Composto Ubere': 'Composto Ubere',
}

export function normalizeRows(rawRows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rawRows.map((row) => {
    const normalized: Record<string, unknown> = { 'ID Animal': '', 'Data de Nascimento': '' }
    NEXUS_TRAITS.forEach((t) => { normalized[t] = '' })

    Object.entries(row).forEach(([key, val]) => {
      const mapped = HEADER_MAPPING[key.trim()]
      if (mapped) normalized[mapped] = val
    })

    return normalized
  })
}
