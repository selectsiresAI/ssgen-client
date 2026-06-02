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
  getDashboard: () => callFunction<DashboardData>('get-my-dashboard'),

  getOrders: (params?: { page?: string; per_page?: string; status?: string }) =>
    callFunction<Paginated<ServiceOrder>>('get-my-orders', params),

  getResults: (params?: { page?: string; per_page?: string; search?: string }) =>
    callFunction<Paginated<GenomicResult>>('get-my-results', params),

  getFemales: (params?: { page?: string; per_page?: string; search?: string; genotyped?: string; breed?: string }) =>
    callFunction<Paginated<Female>>('get-my-females', params),

  getTechnicians: () => callFunction<Technician[]>('get-my-technicians'),

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
