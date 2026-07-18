import type { FemaleFull } from './api'
import { DEMO_TO_FEMALE } from './traits'

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// Media por trait (chave demo) sobre as femeas com valor nao-nulo.
export function computeHerdAverage(females: FemaleFull[]): Record<string, number> {
  const avg: Record<string, number> = {}
  if (females.length === 0) return avg

  for (const [demoKey, field] of Object.entries(DEMO_TO_FEMALE)) {
    const vals = females.map((f) => numeric(f[field])).filter((v): v is number => v !== null)
    if (vals.length > 0) avg[demoKey] = vals.reduce((sum, value) => sum + value, 0) / vals.length
  }

  return avg
}

export function genotypedCount(females: FemaleFull[]): number {
  return females.filter((f) => f.hhp_dollar != null || f.tpi != null).length
}
