import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useBreedParams } from '@/hooks/useApi'
import type { BreedCatalogItem } from '@/lib/api'
import { benchmarks as holsteinBenchmarks, traitLabel, trend as holsteinTrend } from '@/lib/traits'

type Benchmarks = [string, string, number, number, number][]
type TrendData = typeof holsteinTrend | Record<string, number[]> | null

interface BreedContextValue {
  breed: string
  breedLabel: string
  indexLabel: string
  udderLabel: string
  catalog: BreedCatalogItem[]
  traitLabels: Record<string, string>
  benchmarks: Benchmarks | null
  trend: TrendData
  isLoading: boolean
}

const fallbackCatalog: BreedCatalogItem[] = Object.entries(traitLabel).map(([key, label]) => ({
  key,
  label,
  group: 'Fallback Holstein',
}))

const fallbackValue: BreedContextValue = {
  breed: 'HO',
  breedLabel: 'Holstein',
  indexLabel: 'GTPI',
  udderLabel: 'UDC',
  catalog: fallbackCatalog,
  traitLabels: traitLabel,
  benchmarks: holsteinBenchmarks,
  trend: holsteinTrend,
  isLoading: false,
}

const BreedContext = createContext<BreedContextValue>(fallbackValue)

export function BreedProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useBreedParams()

  const value = useMemo<BreedContextValue>(() => {
    const params = data?.params
    const reference = params?.reference

    if (isLoading || isError || !reference) {
      return { ...fallbackValue, isLoading }
    }

    const catalog = reference.catalog?.length ? reference.catalog : fallbackCatalog
    const traitLabels = catalog.reduce<Record<string, string>>((labels, item) => {
      labels[item.key] = item.label
      return labels
    }, { ...traitLabel })

    return {
      breed: data?.breed || params.breed || fallbackValue.breed,
      breedLabel: params.label || data?.breed || fallbackValue.breedLabel,
      indexLabel: reference.index_label || fallbackValue.indexLabel,
      udderLabel: reference.udder_label || fallbackValue.udderLabel,
      catalog,
      traitLabels,
      benchmarks: reference.benchmarks,
      trend: reference.trend,
      isLoading,
    }
  }, [data, isError, isLoading])

  return <BreedContext.Provider value={value}>{children}</BreedContext.Provider>
}

export function useBreed() {
  return useContext(BreedContext)
}
