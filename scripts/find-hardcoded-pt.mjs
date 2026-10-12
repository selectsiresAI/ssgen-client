// Acha texto de interface escrito direto no codigo (deveria passar por t()/translate()).
// Uso: node scripts/find-hardcoded-pt.mjs [arquivos...]   (sem argumento varre src/**)
// Ignora comentarios, src/i18n/locales e linhas com "// i18n-ignore".
// Regras: (1) texto JSX solto; (2) atributos de texto; (3) toast/label/title literais;
//         (4) literal igual a um valor pt-BR dos dicionarios; (5) toLocale*('pt-BR') fixo.
import { glob, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const files = process.argv.slice(2).length ? process.argv.slice(2) : await Array.fromAsync(glob('src/**/*.{ts,tsx}'))
const hasLetters = /[A-Za-zÀ-ÿ]{2,}/
const allowedText = /^(Top( \d+%)?|SS|SSGen|SSGEN|Select Sires|CDCB|NAAB|HHP\$|GTPI|NM\$|CM\$|FM\$|GM\$|PDF|N₂|OK)$/i

// valores pt-BR dos dicionarios, para detectar texto ja extraido que continua duplicado no codigo
const ptValues = new Set()
const localesDir = path.resolve('src/i18n/locales')
for (const name of (await readdir(localesDir)).filter((n) => n.endsWith('.ts'))) {
  try {
    const dict = (await import(pathToFileURL(path.join(localesDir, name)).href)).default
    for (const value of Object.values(dict['pt-BR'] ?? {})) if (value.length >= 6 && (/\s/.test(value) || /[À-ÿ]/.test(value)) && /[a-zà-ÿ]/.test(value)) ptValues.add(value)
  } catch {
    // check:i18n reporta o erro de carga
  }
}

const rules = [
  ['texto JSX solto', (line) => {
    const t = line.trim()
    if (!t || /^[?:|&+-]/.test(t) || /^\w+\??:\s/.test(t) || /[<>{}=;()'"`/*,:]$|^[})\]]|^(import|export|const|let|var|return|case|default|type|interface|function|if|else|for|while|from|async|await|new|class|extends)\b/.test(t)) return false
    if (/[<>{}=;()'"`/*]/.test(t)) return false
    const words = t.split(/\s+/)
    if (words.length >= 2) return /[A-Za-zÀ-ÿ]{2,}/.test(t) && !/^[a-z]+[A-Z]/.test(t)
    return /^[A-ZÀ-Ý][a-zà-ÿ]{2,}$/.test(t)
  }],
  ['texto JSX na mesma linha', (line) => [...line.matchAll(/>([^<>{}]+)</g)].some(([, text]) => hasLetters.test(text) && !/[=?&|()]/.test(text) && !allowedText.test(text.trim()))],
  ['texto junto a expressao', (line) => !/`[^`]*\$\{/.test(line.replace(/\{t\(/g,'')) && [...line.matchAll(/(?<![=-])[>}]([^<>{}=?&|()]*[A-Za-zÀ-ÿ]{3,}[^<>{}=?&|()]*)[<{]/g)].some(([, text]) => !/^\s*(else|catch|finally|return|null|true|false|undefined|void|typeof|await|async|as|in|of|new|default|case)\s*$/.test(text) && !/^\s*[,;:.\s\]]*$/.test(text) && !/^[A-Z0-9$%·\s./+-]+$/.test(text.trim()) && !allowedText.test(text.trim()) && !/^\s*(?:Select Sires|SSGen|SSGEN)\s*$/i.test(text))],
  ['atributo de texto', (line) => /\b(placeholder|title|aria-label|alt|label|description|helperText)=("|')[^"']*[A-Za-zÀ-ÿ]{2,}/.test(line)],
  ['toast/alert literal', (line) => /\b(toast(\.\w+)?|alert|confirm)\(\s*(["'`])[^"'`]*[A-Za-zÀ-ÿ]{2,}/.test(line)],
  ['rotulo literal', (line) => !/(label|title|name|labelKey):\s*("|')[a-z][A-Za-z0-9]*(\.[A-Za-z0-9_-]+)+("|')/.test(line) && !/(label|title|name):\s*("|')[A-Z0-9$%.+ /-]{1,12}("|')/.test(line) && /\b(label|title|subtitle|description|header|name):\s*(["'`])[^"'`$]*[A-Za-zÀ-ÿ]{3,}[^"'`$]*\2/.test(line)],
  ['formato fixo pt-BR', (line) => /toLocale(Date|Time)?String\(\s*['"]pt-BR['"]/.test(line)],
  ['texto pt-BR do dicionario repetido', (line) => [...ptValues].some((value) => line.includes(`'${value}'`) || line.includes(`"${value}"`) || line.includes(`>${value}<`))],
]

let found = 0
for (const file of files) {
  const normalized = file.replace(/\\/g, '/')
  if (normalized.includes('src/i18n/locales/')) continue
  const source = await readFile(path.resolve(file), 'utf8')
  let inBlockComment = false
  if (source.includes('i18n-ignore-file')) continue
  for (const [index, raw] of source.split(/\r?\n/).entries()) {
    let line = raw
    if (inBlockComment) {
      if (line.includes('*/')) inBlockComment = false
      continue
    }
    if (line.includes('/*') && !line.includes('*/')) {
      inBlockComment = true
      continue
    }
    if (line.includes('i18n-ignore') || line.trimStart().startsWith('//')) continue
    line = line.replace(/\/\*.*?\*\//g, '').replace(/\s\/\/\s.*$/, '')
    const hit = rules.find(([, test]) => test(line))
    if (hit) {
      console.error(`${file}:${index + 1} [${hit[0]}] ${raw.trim().slice(0, 140)}`)
      found += 1
    }
  }
}

console.log(found ? `${found} ocorrencia(s) de texto fixo` : 'nenhum texto fixo encontrado')
if (found) process.exit(1)
