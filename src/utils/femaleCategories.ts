export type FemaleCategory = 'Bezerra' | 'Novilha' | 'Primipara' | 'Secundipara' | 'Multipara' | 'Indefinida'

export function calculateDeliveries(birthDate?: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  if (birth.getTime() > today.getTime()) return null
  const daysAlive = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  return daysAlive / 365
}

export function calculateParityOrder(deliveries: number | null): number | null {
  if (deliveries === null) return null
  if (deliveries <= 1.00) return 0
  if (deliveries < 2.00) return 0.1
  if (deliveries < 3.00) return 1
  if (deliveries < 4.00) return 2
  return 3
}

export function parityOrderToCategory(parityOrder: number | null): FemaleCategory {
  if (parityOrder === null) return 'Indefinida'
  if (parityOrder === 0) return 'Bezerra'
  if (parityOrder === 0.1) return 'Novilha'
  if (parityOrder === 1) return 'Primipara'
  if (parityOrder === 2) return 'Secundipara'
  if (parityOrder >= 3) return 'Multipara'
  return 'Indefinida'
}

export function getAutomaticCategory(birthDate?: string | null): FemaleCategory {
  const deliveries = calculateDeliveries(birthDate)
  const parityOrder = calculateParityOrder(deliveries)
  return parityOrderToCategory(parityOrder)
}

export interface CategoryCounts {
  total: number
  bezerras: number
  novilhas: number
  primiparas: number
  secundiparas: number
  multiparas: number
}

export function calculateCategoryCounts(females: Array<{ birth_date?: string | null }>): CategoryCounts {
  const counts: CategoryCounts = { total: females.length, bezerras: 0, novilhas: 0, primiparas: 0, secundiparas: 0, multiparas: 0 }
  females.forEach(f => {
    const cat = getAutomaticCategory(f.birth_date)
    switch (cat) {
      case 'Bezerra': counts.bezerras++; break
      case 'Novilha': counts.novilhas++; break
      case 'Primipara': counts.primiparas++; break
      case 'Secundipara': counts.secundiparas++; break
      case 'Multipara': counts.multiparas++; break
    }
  })
  return counts
}
