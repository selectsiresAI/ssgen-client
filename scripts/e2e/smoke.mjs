// Teste de fumaça do portal: abre cada etapa da Auditoria, o Painel Genômico e a Lista do Rebanho
// com o índice principal selecionado, e falha se aparecer "Sem dados", gráfico sumido ou coluna vazia.
//
// Uso (precisa de um usuário de teste ligado a uma conta com animais):
//   E2E_BASE_URL=http://localhost:5173 E2E_EMAIL=teste@exemplo.com E2E_PASSWORD=... npm run e2e:smoke
// Usa o Chrome instalado no computador (não baixa navegador).
import { chromium } from 'playwright'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const EMAIL = process.env.E2E_EMAIL
const PASSWORD = process.env.E2E_PASSWORD
if (!EMAIL || !PASSWORD) {
  console.error('Defina E2E_EMAIL e E2E_PASSWORD (usuário de teste ligado a uma conta com animais).')
  process.exit(2)
}

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'OK   ' : 'FALHA'}  ${name}${detail ? ` · ${detail}` : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

// login (e aceite da política, se for o primeiro acesso do usuário de teste)
await page.goto(`${BASE}/auth`)
await page.fill('#login-email', EMAIL)
await page.fill('#login-password', PASSWORD)
await page.click('button[type=submit]')
await page.waitForTimeout(4000)
if (await page.locator('[role=dialog] input[type=checkbox]').count()) {
  await page.locator('[role=dialog] input[type=checkbox]').first().check()
  await page.locator('[role=dialog] button:not([disabled]):has-text("Aceitar")').click()
  await page.waitForSelector('[role=dialog]', { state: 'detached', timeout: 20000 })
}

// ---- Auditoria: 7 etapas ----
await page.goto(`${BASE}/auditoria`)
await page.waitForTimeout(5000)
const stepButtons = page.locator('button:has(span.font-mono)')
const nSteps = await stepButtons.count()
check('Auditoria tem 7 etapas', nSteps === 7, `${nSteps} encontradas`)
for (let i = 0; i < nSteps; i++) {
  await stepButtons.nth(i).click()
  await page.waitForTimeout(2500)
  const body = (await page.locator('main, body').first().innerText()).trim()
  check(`Auditoria etapa ${i + 1} abre com conteúdo`, body.length > 200)
  if (i === 4) {
    const titles = (await page.locator('.ss-card-title').allTextContents()).map((s) => s.replace(/\s+/g, ' '))
    const evo = titles.filter((s) => s.startsWith('Evolução'))
    check('Etapa 5 mostra 3 gráficos de evolução (HHP$, índice principal, NM$)', evo.length >= 3, evo.join(' | '))
    check('Etapa 5 inclui o índice principal (TPI/GTPI)', evo.some((s) => /TPI/i.test(s)))
  }
  if (i === 5) {
    const noData = await page.locator('text=Sem dados para os índices selecionados').count()
    check('Etapa 6 (Matriz) tem dados com o índice principal no eixo X', noData === 0)
  }
}

// ---- Painel Genômico ----
await page.goto(`${BASE}/painel`)
await page.waitForTimeout(5000)
const gaugeTexts = await page.locator('text=/Top \\d+|Elite|Médio|Abaixo/').count()
check('Painel mostra a classificação dos gauges', gaugeTexts >= 3, `${gaugeTexts} rótulos`)
check('Painel tem referência nacional', (await page.locator('text=/referência nacional.*indisponível|ainda não disponível/i').count()) === 0)

// ---- Lista do Rebanho ----
await page.goto(`${BASE}/lista-rebanho`)
await page.waitForTimeout(6000)
const heads = (await page.locator('table.ss-table thead th').allTextContents()).map((h) => h.trim().toUpperCase())
for (const col of ['RTP', 'EFC', 'DCE', 'SCE']) {
  const idx = heads.findIndex((h) => h.startsWith(col))
  if (idx < 0) { check(`Lista tem a coluna ${col}`, false, 'não encontrada'); continue }
  const vals = await page.locator(`table.ss-table tbody tr td:nth-child(${idx + 1})`).allTextContents()
  const filled = vals.filter((v) => !['—', '-', ''].includes(v.trim())).length
  check(`Lista: coluna ${col} tem valores`, vals.length === 0 || filled > 0, `${filled}/${vals.length}`)
}

check('Sem erros de JavaScript na sessão', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} verificações passaram`)
process.exit(failed.length ? 1 : 0)
