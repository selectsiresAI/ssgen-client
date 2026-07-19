import type { FemaleFull } from './api'

export const FEMALE_TRAIT_MAP: Record<string, keyof FemaleFull> = {
  hhp: 'hhp_dollar', gtpi: 'tpi', jpi: 'jpi', nm: 'nm_dollar', cm: 'cm_dollar', fm: 'fm_dollar', gm: 'gm_dollar',
  milk: 'ptam', fat: 'ptaf', fat_pct: 'ptaf_pct', prot: 'ptap', prot_pct: 'ptap_pct',
  cfp: 'cfp', fsav: 'f_sav', rfi: 'rfi', efc: 'efc',
  pl: 'pl', dpr: 'dpr', scs: 'scs', hcr: 'hcr', ccr: 'ccr', liv: 'liv', sce: 'sce',
  ptat: 'ptat', udc: 'udc', jui: 'jui', flc: 'flc',
  da: 'da', ket: 'ket', mast: 'mast', met: 'met', rp: 'rp',
  ssb: 'ssb', dsb: 'dsb', hliv: 'h_liv', fi: 'fi', gl: 'gl',
  sta: 'sta', str: 'str', dfm: 'dfm', rua: 'rua', rw: 'rw', rls: 'rls', rlr: 'rlr',
  fta: 'fta', fls: 'fls', fua: 'fua', ruh: 'ruh', ruw: 'ruw', ucl: 'ucl', udp: 'udp',
  ftp: 'ftp', rtp: 'rtp', ftl: 'ftl', mf: 'mf', gfi: 'gfi', bwc: 'bwc',
}

export function getTraitValue(f: FemaleFull, trait: string): number | null {
  const field = FEMALE_TRAIT_MAP[trait]
  if (!field) return null
  const v = f[field]
  return typeof v === 'number' ? v : null
}

export function computeParentesco(females: FemaleFull[]): { label: string; filled: number; missing: number }[] {
  const total = females.length
  if (total === 0) return []
  const sireCount = females.filter((f) => f.sire_naab).length
  const mgsCount = females.filter((f) => f.mgs_naab).length
  const mmgsCount = females.filter((f) => f.mmgs_naab).length
  const pct = (n: number) => Math.round((n / total) * 100)
  return [
    { label: 'Pai (Sire)', filled: pct(sireCount), missing: 100 - pct(sireCount) },
    { label: 'Avô Materno (MGS)', filled: pct(mgsCount), missing: 100 - pct(mgsCount) },
    { label: 'Bisavô Materno (MMGS)', filled: pct(mmgsCount), missing: 100 - pct(mmgsCount) },
  ]
}

export function computeTopParents(
  females: FemaleFull[],
  field: 'sire_naab' | 'mgs_naab',
  limit: number,
): { code: string; count: number; pct: number }[] {
  const counts: Record<string, number> = {}
  females.forEach((f) => {
    const val = f[field]
    if (val) counts[val] = (counts[val] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit)
  const total = sorted.reduce((s, [, n]) => s + n, 0)
  return sorted.map(([code, count]) => ({ code, count, pct: Math.round((count / total) * 1000) / 10 }))
}

export function computeTrendByYear(
  females: FemaleFull[],
  traits: string[],
): { years: string[]; data: Record<string, number[]> } {
  const byYear: Record<string, FemaleFull[]> = {}
  females.forEach((f) => {
    if (!f.birth_date) return
    const yr = new Date(f.birth_date).getFullYear().toString()
    if (!byYear[yr]) byYear[yr] = []
    byYear[yr].push(f)
  })
  const years = Object.keys(byYear).sort()
  // Only keep years with >= 5 animals
  const validYears = years.filter((yr) => byYear[yr].length >= 5)
  const data: Record<string, number[]> = {}
  for (const trait of traits) {
    data[trait] = validYears.map((yr) => {
      const vals = byYear[yr].map((f) => getTraitValue(f, trait)).filter((v): v is number => v !== null)
      if (vals.length === 0) return 0
      return vals.reduce((s, v) => s + v, 0) / vals.length
    })
  }
  return { years: validYears, data }
}

export function computeDistribution(
  females: FemaleFull[],
  trait: string,
  binCount = 5,
): { label: string; count: number }[] {
  const values = females.map((f) => getTraitValue(f, trait)).filter((v): v is number => v !== null)
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  if (span === 0) return [{ label: String(Math.round(min * 100) / 100), count: values.length }]
  const step = span / binCount
  const bins = Array.from({ length: binCount }, (_, i) => {
    const lo = min + i * step
    const hi = i === binCount - 1 ? max + 0.001 : min + (i + 1) * step
    const count = values.filter((v) => v >= lo && v < hi).length
    const mid = (lo + hi) / 2
    const isDecimal = ['fat_pct', 'prot_pct', 'dpr', 'pl', 'scs', 'ptat', 'udc', 'flc', 'hcr', 'ccr', 'liv',
      'sce', 'da', 'ket', 'met', 'rp', 'gl', 'sta', 'str', 'dfm', 'rua', 'rw', 'rls', 'rlr',
      'fta', 'fls', 'fua', 'ruh', 'ruw', 'ucl', 'udp', 'ftp', 'rtp', 'ftl'].includes(trait)
    return { label: isDecimal ? mid.toFixed(2) : String(Math.round(mid)), count }
  })
  return bins
}

export function computeHerdAverage(females: FemaleFull[]): Record<string, number> {
  const avg: Record<string, number> = {}
  for (const trait of Object.keys(FEMALE_TRAIT_MAP)) {
    const vals = females.map((f) => getTraitValue(f, trait)).filter((v): v is number => v !== null)
    if (vals.length > 0) {
      avg[trait] = vals.reduce((s, v) => s + v, 0) / vals.length
    }
  }
  return avg
}
