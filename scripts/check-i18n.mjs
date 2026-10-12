// Verifica os dicionarios de idioma: mesmas chaves, sem valor vazio, mesmos placeholders {x},
// chaves com o prefixo do namespace e nenhuma chave repetida entre namespaces.
// Importa os arquivos de verdade (Node 22.18+ remove os tipos do TypeScript sozinho).
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const localesDir = path.resolve('src/i18n/locales')
const locales = ['pt-BR', 'en-US', 'es']
let failed = false
const fail = (message) => {
  console.error(message)
  failed = true
}

const placeholders = (value) => [...value.matchAll(/\{([^}]+)\}/g)].map(([, name]) => name).sort().join(',')
const owner = new Map()

for (const file of (await readdir(localesDir)).filter((name) => name.endsWith('.ts')).sort()) {
  const namespace = path.basename(file, '.ts')
  let dictionaries
  try {
    dictionaries = (await import(pathToFileURL(path.join(localesDir, file)).href)).default
  } catch (error) {
    fail(`${file}: nao foi possivel carregar (${error.message})`)
    continue
  }

  const keys = new Set()
  for (const locale of locales) {
    if (!dictionaries?.[locale] || typeof dictionaries[locale] !== 'object') {
      fail(`${file}: idioma ausente "${locale}"`)
      continue
    }
    Object.keys(dictionaries[locale]).forEach((key) => keys.add(key))
  }

  for (const key of keys) {
    if (!key.startsWith(`${namespace}.`)) fail(`${file}: a chave "${key}" deve comecar com "${namespace}."`)
    if (owner.has(key) && owner.get(key) !== file) fail(`${file}: a chave "${key}" ja existe em ${owner.get(key)}`)
    owner.set(key, file)

    const values = locales.map((locale) => dictionaries[locale]?.[key])
    const missing = locales.filter((_, index) => typeof values[index] !== 'string')
    if (missing.length) {
      fail(`${file}: falta "${key}" em ${missing.join(', ')}`)
      continue
    }
    if (values.some((value) => value.trim() === '')) fail(`${file}: valor vazio em "${key}"`)
    if (new Set(values.map(placeholders)).size !== 1) fail(`${file}: placeholders diferentes em "${key}"`)
  }
  console.log(`${namespace}: ${keys.size} chaves`)
}

console.log(`total: ${owner.size} chaves em ${locales.length} idiomas`)
if (failed) process.exit(1)
