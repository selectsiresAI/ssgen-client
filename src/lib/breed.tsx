import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useBreedParams } from '@/hooks/useApi'
import type { BreedCatalogItem } from '@/lib/api'
import { benchmarks as holsteinBenchmarks, traitLabel, trend as holsteinTrend } from '@/lib/traits'
import { translate, useI18n } from '@/i18n'

type Benchmarks = [string, string, number, number, number][]
type TrendData = typeof holsteinTrend | Record<string, number[]> | null

interface BreedContextValue {
  breed: string
  breedLabel: string
  indexKey: string
  indexLabel: string
  udderKey: string
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
  group: translate('breed.fallbackGroup'),
}))

const fallbackValue: BreedContextValue = {
  breed: 'HO',
  breedLabel: translate('breed.holstein'),
  indexKey: 'tpi',
  indexLabel: 'GTPI',
  udderKey: 'udc',
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
  const { locale } = useI18n()

  const value = useMemo<BreedContextValue>(() => {
    const params = data?.params
    const reference = params?.reference

    if (isLoading || isError || !reference) {
      return { ...fallbackValue, isLoading }
    }

    const catalog = reference.catalog?.length ? reference.catalog : fallbackCatalog
    // O catalogo vem do banco em portugues. Em pt-BR mantem o rotulo do servidor; nos outros idiomas traduz pela chave.
    const traitLabels = catalog.reduce<Record<string, string>>((labels, item) => {
      const translated = translate(`traits.${item.key}`, undefined, locale)
      const hasTranslation = translated !== `traits.${item.key}`
      if (locale === 'pt-BR' || !hasTranslation) labels[item.key] = item.label
      else labels[item.key] = item.label.startsWith('PTA ') && !translated.startsWith('PTA') ? `PTA ${translated}` : translated
      return labels
    }, { ...traitLabel })

    return {
      breed: data?.breed || params.breed || fallbackValue.breed,
      breedLabel: params.label || data?.breed || fallbackValue.breedLabel,
      indexKey: reference.index_key || fallbackValue.indexKey,
      indexLabel: reference.index_label || fallbackValue.indexLabel,
      udderKey: reference.udder_key || fallbackValue.udderKey,
      udderLabel: reference.udder_label || fallbackValue.udderLabel,
      catalog,
      traitLabels,
      benchmarks: reference.benchmarks,
      trend: reference.trend,
      isLoading,
    }
  }, [data, isError, isLoading, locale])

  return <BreedContext.Provider value={value}>{children}</BreedContext.Provider>
}

export function useBreed() {
  return useContext(BreedContext)
}
