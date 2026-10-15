import { describe, expect, it } from 'vitest'
import { FEMALE_TRAIT_MAP, getTraitValue, referenceKey } from '@/lib/auditoria-utils'
import { DEMO_TO_FEMALE, benchmarks as holsteinBenchmarks, femaleTrait } from '@/lib/traits'
import { traitGroups } from '@/components/TraitSelect'
import type { FemaleFull } from '@/lib/api'

// Contrato entre o que o banco chama de "índice principal" da raça e o que as telas procuram.
// Já quebrou duas vezes (Matriz de Performance e Evolução vs Nacional ficaram sem TPI) porque o
// banco devolve 'tpi' e a tabela de referência chama o mesmo índice de 'gtpi'.

// chaves de índice principal e de úbere por raça, como vêm de breed_index_params.reference
const BREEDS = {
  HO: { indexKey: 'tpi', udderKey: 'udc' },
  JE: { indexKey: 'jpi', udderKey: 'jui' },
}

const sample = { tpi: 2700, jpi: 300, hhp_dollar: 400, nm_dollar: 300, udc: 0.5, jui: 0.4 } as unknown as FemaleFull

describe('índice principal da raça', () => {
  for (const [breed, { indexKey, udderKey }] of Object.entries(BREEDS)) {
    it(`${breed}: ${indexKey} e ${udderKey} têm valor nas fêmeas`, () => {
      expect(getTraitValue(sample, indexKey)).not.toBeNull()
      expect(getTraitValue(sample, udderKey)).not.toBeNull()
      expect(femaleTrait(sample as unknown as Record<string, unknown>, indexKey)).not.toBeNull()
    })
  }

  it('Holandês: a referência nacional é achada pelo nome que o banco devolve', () => {
    const key = referenceKey(BREEDS.HO.indexKey)
    expect(holsteinBenchmarks.find(([k]) => k === key)).toBeTruthy()
  })

  it('TPI e GTPI apontam para a mesma coluna', () => {
    expect(FEMALE_TRAIT_MAP.tpi).toBe(FEMALE_TRAIT_MAP.gtpi)
    expect(DEMO_TO_FEMALE.tpi).toBe(DEMO_TO_FEMALE.gtpi)
  })
})

describe('seletor de características', () => {
  // toda característica que o usuário pode escolher precisa ter coluna (senão o gráfico some ou diz "sem dados")
  const keys = traitGroups.flatMap((g) => g.keys).map((k) => (k === 'gtpi' ? BREEDS.HO.indexKey : k === 'udc' ? BREEDS.HO.udderKey : k))
  it.each(Array.from(new Set(keys)))('%s tem coluna no mapa de características', (key) => {
    expect(FEMALE_TRAIT_MAP[key], `${key} sem coluna em FEMALE_TRAIT_MAP`).toBeTruthy()
  })
  it.each(Array.from(new Set(keys)))('%s tem coluna no mapa do painel', (key) => {
    expect(DEMO_TO_FEMALE[key] ?? FEMALE_TRAIT_MAP[key], `${key} sem coluna em DEMO_TO_FEMALE`).toBeTruthy()
  })
})
