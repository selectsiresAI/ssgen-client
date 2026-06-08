import { supabase } from './supabase'

async function callFunction<T>(name: string, params?: Record<string, string>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Edge Function error: ${res.status}`)
  }

  return res.json()
}

async function callFunctionPost<T>(name: string, body: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Edge Function error: ${res.status}`)
  }

  return res.json()
}

export interface FemaleFull {
  id: string
  client_id: string
  ear_tag: string | null
  name: string | null
  registration: string | null
  cdcb_id: string | null
  birth_date: string | null
  breed: string | null
  category: string | null
  status: string | null
  parity_order: number | null
  sire_naab: string | null
  mgs_naab: string | null
  mmgs_naab: string | null
  genomic_result_id: string | null
  hhp_dollar: number | null
  tpi: number | null
  nm_dollar: number | null
  cm_dollar: number | null
  fm_dollar: number | null
  gm_dollar: number | null
  f_sav: number | null
  ptam: number | null
  cfp: number | null
  ptaf: number | null
  ptaf_pct: number | null
  ptap: number | null
  ptap_pct: number | null
  pl: number | null
  dpr: number | null
  liv: number | null
  scs: number | null
  mast: number | null
  met: number | null
  rp: number | null
  da: number | null
  ket: number | null
  mf: number | null
  ptat: number | null
  udc: number | null
  flc: number | null
  sce: number | null
  dce: number | null
  ssb: number | null
  dsb: number | null
  h_liv: number | null
  ccr: number | null
  hcr: number | null
  fi: number | null
  gl: number | null
  efc: number | null
  bwc: number | null
  sta: number | null
  str: number | null
  dfm: number | null
  rua: number | null
  rls: number | null
  rtp: number | null
  ftl: number | null
  rw: number | null
  rlr: number | null
  fta: number | null
  fls: number | null
  fua: number | null
  ruh: number | null
  ruw: number | null
  ucl: number | null
  udp: number | null
  ftp: number | null
  rfi: number | null
  beta_casein: string | null
  kappa_casein: string | null
  gfi: number | null
  created_at: string
  [key: string]: unknown
}

export interface BullSemen {
  code: string
  name: string | null
  registration: string | null
  breed: string | null
  daughters_count: number
  [key: string]: unknown
}

export interface PlatformBull {
  code: string
  name: string | null
  registration: string | null
  company: string | null
  hhp_dollar: number | null
  tpi: number | null
}

export interface BullTraits {
  code: string
  name: string | null
  hhp_dollar: number | null
  tpi: number | null
  nm_dollar: number | null
  ptam: number | null
  ptaf: number | null
  ptap: number | null
  cfp: number | null
  pl: number | null
  dpr: number | null
  scs: number | null
  ptat: number | null
  udc: number | null
}

export interface ServiceOrderOption {
  id: string
  ordem_servico_ssgen: number | null
  nome_produto: string | null
}

export interface ParentageRow {
  role: string
  status: string
  n: number
  pct: number
}

export interface TopParentRow {
  parent_label: string
  daughters_count: number
  trait_mean: number | null
}

export interface LinearMeanRow {
  trait_key: string
  group_label: string
  mean_value: number
  n: number
}

// --- Types ---

export interface DashboardData {
  total_females: number
  total_genotyped: number
  orders_in_progress: number
  orders_completed: number
  recent_results: number
  clients: { id: string; nome: string; farm_name: string; cidade: string; estado: string }[]
}

export interface ServiceOrder {
  id: string
  client_id: string
  ordem_servico_ssgen: number | null
  ordem_servico_neogen: number | null
  nome_produto: string | null
  numero_amostras: number | null
  etapa_atual: string
  prioridade: string | null
  cra_data: string | null
  envio_resultados_previsao: string | null
  envio_resultados_data: string | null
  dt_receb_resultados: string | null
  liberacao_data: string | null
  dt_faturamento: string | null
  created_at: string
  client_name: string | null
  farm_name: string | null
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export interface GenomicResult {
  id: string
  client_id: string
  service_order_id: string | null
  animal_id: string | null
  nome_animal: string | null
  registro: string | null
  data_nascimento: string | null
  sexo: string | null
  raca: string | null
  pta_milk: number | null
  pta_fat: number | null
  pta_protein: number | null
  pta_pl: number | null
  pta_scs: number | null
  pta_dpr: number | null
  tpi: number | null
  nmpf: number | null
  hhp_dollar: number | null
  bvh: string | null
  blad: string | null
  dumps: string | null
  mf: string | null
  cvm: string | null
  file_name: string | null
  uploaded_at: string | null
}

export interface Female {
  id: string
  client_id: string
  ear_tag: string | null
  name: string | null
  registration: string | null
  birth_date: string | null
  breed: string | null
  category: string | null
  status: string | null
  pta_milk: number | null
  pta_fat: number | null
  pta_protein: number | null
  pta_pl: number | null
  pta_scs: number | null
  pta_dpr: number | null
  tpi: number | null
  nmpf: number | null
  hhp_dollar: number | null
  genomic_result_id: string | null
  sire_naab: string | null
  mgs_naab: string | null
  created_at: string
}

export interface Technician {
  farm_id: string
  farm_name: string
  technician_id: string
  technician_name: string
  technician_email: string
}

// --- API calls ---

export const api = {
  getFemalesFull: (params?: { page?: string; per_page?: string; search?: string; service_order_id?: string }) =>
    callFunction<Paginated<FemaleFull>>('get-my-females-full', params),

  getSemenInventory: (params?: { search?: string }) =>
    callFunction<{ data: BullSemen[] }>('get-my-semen-inventory', params),

  getAuditoria: (params: { step: string; service_order_id?: string; parent_type?: string; order_trait?: string; limit?: string; traits?: string }) =>
    callFunction<{ data: unknown }>('get-my-auditoria', params),

  getServiceOrderOptions: () =>
    callFunction<Paginated<ServiceOrderOption>>('get-my-orders', { per_page: '100' }),

  getDashboard: () => callFunction<DashboardData>('get-my-dashboard'),

  getOrders: (params?: { page?: string; per_page?: string; status?: string }) =>
    callFunction<Paginated<ServiceOrder>>('get-my-orders', params),

  getResults: (params?: { page?: string; per_page?: string; search?: string }) =>
    callFunction<Paginated<GenomicResult>>('get-my-results', params),

  getFemales: (params?: { page?: string; per_page?: string; search?: string; genotyped?: string; breed?: string }) =>
    callFunction<Paginated<Female>>('get-my-females', params),

  getTechnicians: () => callFunction<Technician[]>('get-my-technicians'),

  searchPlatformBulls: (params: { search: string }) =>
    callFunction<{ data: PlatformBull[] }>('search-platform-bulls', params),

  getBullTraits: (params: { codes: string }) =>
    callFunction<{ data: BullTraits[] }>('get-bull-traits', params),

  getBotijaoData: () => callFunction<BotijaoData>('get-my-botijao'),

  saveBotijao: (body: SaveBotijaoAction) =>
    callFunctionPost<{ data: unknown }>('save-my-botijao', body),

  ingestResults: async (payload: {
    file_path: string
    service_order_id?: string
    client_id: string
  }) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-results`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      },
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `Ingest error: ${res.status}`)
    }

    return res.json() as Promise<IngestResult>
  },
}

export interface IngestResult {
  success: boolean
  inserted: number
  total_rows: number
  mapped_columns: string[]
  errors?: string[]
}

// --- Botijão types ---

export interface BotijaoRecord {
  id: string
  user_id: string
  nome: string
  canecas: number
  capacidade_litros: number
  created_at: string
  updated_at: string
}

export interface BotijaoItemRecord {
  id: string
  user_id: string
  botijao_id: string
  touro_code: string
  touro_name: string | null
  touro_breed: string | null
  tipo: string
  doses: number
  preco: number
  caneca: number
  observacoes: string
  created_at: string
  updated_at: string
}

export interface NitrogenRecord {
  id: string
  user_id: string
  botijao_id: string | null
  data_abastecimento: string
  volume: number
  observacoes: string
  created_at: string
}

export interface BotijaoData {
  botijoes: BotijaoRecord[]
  itens: BotijaoItemRecord[]
  nitrogen: NitrogenRecord[]
}

export type SaveBotijaoAction =
  | { action: 'upsert_botijao'; botijao: { id?: string; nome: string; canecas: number; capacidade_litros: number } }
  | { action: 'delete_botijao'; id: string }
  | { action: 'upsert_item'; item: { id?: string; botijao_id: string; touro_code: string; touro_name?: string; touro_breed?: string; tipo: string; doses: number; preco: number; caneca: number; observacoes?: string } }
  | { action: 'delete_item'; id: string }
  | { action: 'add_nitrogen'; nitrogen: { botijao_id?: string; data_abastecimento: string; volume: number; observacoes?: string } }
  | { action: 'delete_nitrogen'; id: string }
