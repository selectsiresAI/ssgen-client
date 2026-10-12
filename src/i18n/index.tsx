/* eslint-disable react-refresh/only-export-components -- modulo de idioma: exporta provider, hook e funcoes de traducao */
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import type { Dict, Locale, NamespaceDict } from './types'
import { LOCALES } from './types'

const STORAGE_KEY = 'ssgen.locale'
const dictionaries: Record<Locale, Dict> = {
  'pt-BR': {},
  'en-US': {},
  es: {},
}

const modules = import.meta.glob('./locales/*.ts', { eager: true }) as Record<
  string,
  { default: NamespaceDict }
>

for (const module of Object.values(modules)) {
  for (const locale of LOCALES) {
    Object.assign(dictionaries[locale], module.default[locale])
  }
}

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value)
}

function initialLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // localStorage may be unavailable.
  }

  const language = typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase()
  if (language.startsWith('pt')) return 'pt-BR'
  if (language.startsWith('es')) return 'es'
  if (language.startsWith('en')) return 'en-US'
  return 'pt-BR'
}

let currentLocale = initialLocale()
const listeners = new Set<() => void>()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  currentLocale = locale
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Persisting the preference is best-effort.
  }
  if (typeof document !== 'undefined') document.documentElement.lang = locale
  listeners.forEach((listener) => listener())
}

export function translate(
  key: string,
  params?: Record<string, string | number>,
  locale: Locale = currentLocale,
): string {
  const template = dictionaries[locale][key] ?? dictionaries['pt-BR'][key] ?? key
  return template.replace(/\{([^}]+)\}/g, (placeholder, name: string) =>
    params?.[name] === undefined ? placeholder : String(params[name]),
  )
}

const intlLocales: Record<Locale, 'pt-BR' | 'en-US' | 'es-ES'> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  es: 'es-ES',
}

type I18nValue = {
  locale: Locale
  setLocale: typeof setLocale
  t: (key: string, params?: Record<string, string | number>) => string
  formatDate: (value: Date | string | number, opts?: Intl.DateTimeFormatOptions) => string
  formatNumber: (value: number, opts?: Intl.NumberFormatOptions) => string
  intlLocale: 'pt-BR' | 'en-US' | 'es-ES'
}

const I18nContext = createContext<I18nValue | null>(null)

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getLocale, getLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nValue>(() => {
    const intlLocale = intlLocales[locale]
    return {
      locale,
      setLocale,
      t: (key, params) => translate(key, params, locale),
      formatDate: (date, opts) => new Intl.DateTimeFormat(intlLocale, opts).format(new Date(date)),
      formatNumber: (number, opts) => new Intl.NumberFormat(intlLocale, opts).format(number),
      intlLocale,
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within an I18nProvider')
  return context
}
