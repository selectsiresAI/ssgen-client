export type Locale = 'pt-BR' | 'en-US' | 'es'

export const LOCALES: readonly Locale[] = ['pt-BR', 'en-US', 'es']

export type Dict = Record<string, string>

export type NamespaceDict = Record<Locale, Dict>
