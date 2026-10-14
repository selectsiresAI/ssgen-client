import { supabase } from '@/lib/supabase'

// Versão vigente da Política de Privacidade. Mudou o texto => subir aqui e em
// supabase/functions/privacy-consent/index.ts (todos passam a ver a tela de aceite de novo).
export const PRIVACY_VERSION = '1.0'
export const PRIVACY_EFFECTIVE = '2026-10-14'

export type PolicyBlock =
  | { type: 'p'; key: string }
  | { type: 'ul'; keys: string[] }
  | { type: 'table'; head: [string, string]; rows: [string, string][] }

export interface PolicySection {
  title: string
  blocks: PolicyBlock[]
}

const rows = (prefix: string, n: number): [string, string][] =>
  Array.from({ length: n }, (_, i) => [`${prefix}.r${i + 1}.a`, `${prefix}.r${i + 1}.b`])
const list = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}.l${i + 1}`)

export const PRIVACY_SECTIONS: PolicySection[] = [
  { title: 'privacy.s1.title', blocks: [{ type: 'p', key: 'privacy.s1.p1' }, { type: 'p', key: 'privacy.s1.p2' }] },
  { title: 'privacy.s2.title', blocks: [{ type: 'table', head: ['privacy.th.group', 'privacy.th.what'], rows: rows('privacy.s2', 5) }, { type: 'p', key: 'privacy.s2.p1' }] },
  { title: 'privacy.s3.title', blocks: [{ type: 'table', head: ['privacy.th.purpose', 'privacy.th.base'], rows: rows('privacy.s3', 6) }] },
  { title: 'privacy.s4.title', blocks: [{ type: 'p', key: 'privacy.s4.p1' }] },
  { title: 'privacy.s5.title', blocks: [{ type: 'table', head: ['privacy.th.who', 'privacy.th.why'], rows: rows('privacy.s5', 6) }, { type: 'p', key: 'privacy.s5.p1' }] },
  { title: 'privacy.s6.title', blocks: [{ type: 'p', key: 'privacy.s6.p1' }] },
  { title: 'privacy.s7.title', blocks: [{ type: 'p', key: 'privacy.s7.p1' }] },
  { title: 'privacy.s8.title', blocks: [{ type: 'p', key: 'privacy.s8.p1' }] },
  { title: 'privacy.s9.title', blocks: [{ type: 'ul', keys: list('privacy.s9', 4) }, { type: 'p', key: 'privacy.s9.p1' }] },
  { title: 'privacy.s10.title', blocks: [{ type: 'p', key: 'privacy.s10.p1' }] },
  { title: 'privacy.s11.title', blocks: [{ type: 'p', key: 'privacy.s11.p1' }, { type: 'ul', keys: list('privacy.s11', 7) }, { type: 'p', key: 'privacy.s11.p2' }] },
  { title: 'privacy.s12.title', blocks: [{ type: 'p', key: 'privacy.s12.p1' }] },
  { title: 'privacy.s13.title', blocks: [{ type: 'p', key: 'privacy.s13.p1' }] },
]

export interface PrivacyStatus {
  current_version: string
  accepted: boolean
  accepted_at: string | null
  marketing_opt_in: boolean
}

async function call(body: Record<string, unknown>): Promise<PrivacyStatus> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/privacy-consent`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
  return json as PrivacyStatus
}

export const privacyApi = {
  status: () => call({ action: 'status' }),
  accept: (args: { marketing: boolean; locale: string; hash: string; source: string }) =>
    call({ action: 'accept', version: PRIVACY_VERSION, ...args }),
  setMarketing: (marketing: boolean, locale: string) => call({ action: 'marketing', marketing, locale, source: 'privacy-page' }),
}

// "impressão digital" do texto da política exibido no idioma do cliente (prova do que foi aceito)
export async function policyHash(texts: string[]): Promise<string> {
  const data = new TextEncoder().encode(`${PRIVACY_VERSION}\n${texts.join('\n')}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
