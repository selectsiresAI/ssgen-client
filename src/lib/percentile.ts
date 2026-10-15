// Classificação do rebanho pelo percentil REAL do banco de fêmeas SSGEN (e não por interpolação entre mediana e Top 10%).
// As tabelas vêm de breed_index_params.reference: `percentiles[traço]` = valores nos pontos PCT_POINTS (do menor ao maior)
// e `cohort_medians[traço][ano]` = mediana das fêmeas nascidas naquele ano (2019 reúne as nascidas até 2019).

export const PCT_POINTS = [5, 10, 25, 50, 75, 90, 95] as const

// traços em que MENOR é melhor: o percentil de "qualidade" é invertido
export const LOWER_IS_BETTER = ['scs', 'flc', 'rfi', 'gl', 'sce', 'ssb', 'dsb', 'da', 'ket']

export const COHORT_MIN_YEAR = 2019
export const COHORT_MAX_YEAR = 2026

export type ZoneName = 'elite' | 'top25' | 'medium' | 'below'

export const ZONE_COLORS: Record<ZoneName, string> = {
  elite: '#1a7a42',
  top25: 'var(--ss-green)',
  medium: 'var(--ss-amber)',
  below: '#C0633A',
}

/** Percentil (1 a 99) de um valor bruto, por interpolação linear entre os pontos da tabela. */
export function rawRank(value: number, pts: number[]): number {
  if (!Number.isFinite(value) || pts.length !== PCT_POINTS.length) return 50
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (value <= first) {
    const step = pts[1] - pts[0]
    return step > 0 ? Math.max(1, PCT_POINTS[0] - ((first - value) / step) * (PCT_POINTS[1] - PCT_POINTS[0])) : 1
  }
  if (value >= last) {
    const step = pts[pts.length - 1] - pts[pts.length - 2]
    const span = PCT_POINTS[PCT_POINTS.length - 1] - PCT_POINTS[PCT_POINTS.length - 2]
    return step > 0 ? Math.min(99, PCT_POINTS[PCT_POINTS.length - 1] + ((value - last) / step) * span) : 99
  }
  for (let i = 1; i < pts.length; i++) {
    if (value <= pts[i]) {
      const width = pts[i] - pts[i - 1]
      const frac = width > 0 ? (value - pts[i - 1]) / width : 0
      return PCT_POINTS[i - 1] + frac * (PCT_POINTS[i] - PCT_POINTS[i - 1])
    }
  }
  return 50
}

/** Percentil de qualidade: 99 = entre os melhores, 1 = entre os piores (já considera "menor é melhor"). */
export function goodRank(trait: string, value: number, pts: number[]): number {
  const r = rawRank(value, pts)
  return LOWER_IS_BETTER.includes(trait) ? 100 - r : r
}

/** Elite = Top 10% do banco; Top 25% = entre os 25% melhores; Médio = faixa central; Abaixo = 25% inferiores. */
export function zoneFromRank(rank: number): ZoneName {
  if (rank >= 90) return 'elite'
  if (rank >= 75) return 'top25'
  if (rank >= 25) return 'medium'
  return 'below'
}

/** "Top X%" mostrado ao usuário */
export function topPercent(rank: number): number {
  return Math.max(0.1, 100 - rank)
}

/**
 * Valor médio do rebanho ajustado pela idade: cada fêmea é comparada à mediana das nascidas no mesmo ano
 * e a vantagem média é somada à mediana nacional. Um rebanho jovem deixa de levar vantagem só por ser jovem.
 */
export function ageAdjustedValue<T extends { birth_date: string | null }>(
  females: T[],
  read: (f: T) => number | null,
  cohort: Record<string, number> | undefined,
  nationalMedian: number,
): number | null {
  let sum = 0
  let n = 0
  for (const f of females) {
    const v = read(f)
    if (v == null || !Number.isFinite(v)) continue
    let ref = nationalMedian
    if (cohort && f.birth_date) {
      const year = Math.min(COHORT_MAX_YEAR, Math.max(COHORT_MIN_YEAR, new Date(f.birth_date).getFullYear()))
      const m = cohort[String(year)]
      if (typeof m === 'number') ref = m
    }
    sum += v - ref
    n++
  }
  return n === 0 ? null : nationalMedian + sum / n
}
