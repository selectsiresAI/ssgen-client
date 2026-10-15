import { describe, expect, it } from 'vitest'
import { PCT_POINTS, ageAdjustedValue, goodRank, rawRank, topPercent, zoneFromRank } from '@/lib/percentile'

// GTPI do banco SSGEN em 15/10/2026 (p5, p10, p25, p50, p75, p90, p95)
const GTPI = [1949, 2138, 2389, 2599, 2770, 2900, 2977]
const SCS = [2.6, 2.68, 2.78, 2.94, 3.09, 3.2, 3.27]

describe('percentil real', () => {
  it('cai exatamente nos pontos da tabela', () => {
    PCT_POINTS.forEach((p, i) => expect(rawRank(GTPI[i], GTPI)).toBeCloseTo(p, 6))
  })
  it('é crescente e fica entre 1 e 99', () => {
    let prev = 0
    for (let v = 1500; v <= 3500; v += 50) {
      const r = rawRank(v, GTPI)
      expect(r).toBeGreaterThanOrEqual(prev)
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(99)
      prev = r
    }
  })
  it('traço em que menor é melhor inverte', () => {
    expect(goodRank('scs', 2.6, SCS)).toBeGreaterThan(goodRank('scs', 3.3, SCS))
    expect(goodRank('scs', 2.94, SCS)).toBeCloseTo(50, 6)
  })
})

describe('zonas', () => {
  it('Elite = Top 10%, Top 25%, Médio e Abaixo', () => {
    expect(zoneFromRank(95)).toBe('elite')
    expect(zoneFromRank(90)).toBe('elite')
    expect(zoneFromRank(80)).toBe('top25')
    expect(zoneFromRank(75)).toBe('top25')
    expect(zoneFromRank(50)).toBe('medium')
    expect(zoneFromRank(25)).toBe('medium')
    expect(zoneFromRank(24.9)).toBe('below')
  })
  it('Top X% é o complemento do percentil', () => {
    expect(topPercent(78)).toBeCloseTo(22, 6)
  })
  it('Granja Modelo (GTPI médio 2769) fica no limite do Top 25%', () => {
    const rank = goodRank('gtpi', 2769, GTPI)
    expect(topPercent(rank)).toBeGreaterThan(24)
    expect(topPercent(rank)).toBeLessThan(26)
  })
})

describe('ajuste por idade', () => {
  const cohort = { '2019': 2037, '2024': 2682, '2026': 2790 }
  type F = { birth_date: string | null; v: number }
  const young: F[] = [{ birth_date: '2026-03-01', v: 2790 }, { birth_date: '2026-05-01', v: 2790 }]
  const read = (f: F) => f.v
  it('rebanho jovem sem vantagem sobre os da mesma idade fica na mediana nacional', () => {
    const adj = ageAdjustedValue(young, read, cohort, 2599)
    expect(adj).toBeCloseTo(2599, 6)
  })
  it('sem data de nascimento não ajusta', () => {
    const adj = ageAdjustedValue<F>([{ birth_date: null, v: 2700 }], read, cohort, 2599)
    expect(adj).toBeCloseTo(2700, 6)
  })
  it('sem dados devolve nulo', () => {
    expect(ageAdjustedValue<F>([], read, cohort, 2599)).toBeNull()
  })
})
