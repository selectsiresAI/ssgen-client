import { ArrowDown, ArrowUp, ArrowUpDown, Clock, Download, FileText, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/KpiCard'
import { useDashboard, useOrders, useFemalesFull } from '@/hooks/useApi'
import { api, type FemaleFull } from '@/lib/api'
import { fmt } from '@/data/demoData'

const demoOrders = [
  ['#2026-188', '312', 'Concluída', 'ok'],
  ['#2026-187', '540', 'Concluída', 'ok'],
  ['#2026-186', '96', 'Em análise', 'wait'],
  ['#2026-185', '208', 'Liberada', 'done'],
]

const herdCols: { key: keyof FemaleFull; label: string; mono?: boolean }[] = [
  // Identificação
  { key: 'ear_tag', label: 'Brinco', mono: true },
  { key: 'name', label: 'Nome' },
  { key: 'birth_date', label: 'Nascimento', mono: true },
  { key: 'sire_naab', label: 'Pai', mono: true },
  { key: 'mgs_naab', label: 'MGS', mono: true },
  { key: 'mmgs_naab', label: 'MMGS', mono: true },
  // Índices
  { key: 'hhp_dollar', label: 'HHP$', mono: true },
  { key: 'tpi', label: 'GTPI', mono: true },
  { key: 'nm_dollar', label: 'NM$', mono: true },
  { key: 'cm_dollar', label: 'CM$', mono: true },
  { key: 'fm_dollar', label: 'FM$', mono: true },
  { key: 'gm_dollar', label: 'GM$', mono: true },
  // Produção
  { key: 'ptam', label: 'Leite', mono: true },
  { key: 'ptaf', label: 'Gordura', mono: true },
  { key: 'ptaf_pct', label: 'Gord%', mono: true },
  { key: 'ptap', label: 'Proteína', mono: true },
  { key: 'ptap_pct', label: 'Prot%', mono: true },
  { key: 'cfp', label: 'CFP', mono: true },
  { key: 'f_sav', label: 'F.Sav', mono: true },
  { key: 'rfi', label: 'RFI', mono: true },
  // Funcionais
  { key: 'pl', label: 'PL', mono: true },
  { key: 'scs', label: 'SCS', mono: true },
  { key: 'dpr', label: 'DPR', mono: true },
  { key: 'hcr', label: 'HCR', mono: true },
  { key: 'ccr', label: 'CCR', mono: true },
  { key: 'liv', label: 'LIV', mono: true },
  { key: 'h_liv', label: 'H.LIV', mono: true },
  { key: 'fi', label: 'FI', mono: true },
  { key: 'gl', label: 'GL', mono: true },
  { key: 'efc', label: 'EFC', mono: true },
  // Parto
  { key: 'sce', label: 'SCE', mono: true },
  { key: 'dce', label: 'DCE', mono: true },
  { key: 'ssb', label: 'SSB', mono: true },
  { key: 'dsb', label: 'DSB', mono: true },
  // Tipo
  { key: 'ptat', label: 'Tipo', mono: true },
  { key: 'udc', label: 'UDC', mono: true },
  { key: 'flc', label: 'FLC', mono: true },
  { key: 'sta', label: 'STA', mono: true },
  { key: 'str', label: 'STR', mono: true },
  { key: 'dfm', label: 'DFM', mono: true },
  { key: 'bwc', label: 'BWC', mono: true },
  { key: 'rua', label: 'RUA', mono: true },
  { key: 'rw', label: 'RW', mono: true },
  { key: 'rls', label: 'RLS', mono: true },
  { key: 'rlr', label: 'RLR', mono: true },
  { key: 'fta', label: 'FTA', mono: true },
  { key: 'fls', label: 'FLS', mono: true },
  { key: 'fua', label: 'FUA', mono: true },
  { key: 'ruh', label: 'RUH', mono: true },
  { key: 'ruw', label: 'RUW', mono: true },
  { key: 'ucl', label: 'UCL', mono: true },
  { key: 'udp', label: 'UDP', mono: true },
  { key: 'ftp', label: 'FTP', mono: true },
  { key: 'rtp', label: 'RTP', mono: true },
  { key: 'ftl', label: 'FTL', mono: true },
  // Saúde
  { key: 'mast', label: 'MAST', mono: true },
  { key: 'met', label: 'MET', mono: true },
  { key: 'rp', label: 'RP', mono: true },
  { key: 'da', label: 'DA', mono: true },
  { key: 'ket', label: 'KET', mono: true },
  { key: 'mf', label: 'MF', mono: true },
  { key: 'gfi', label: 'GFI', mono: true },
]

function fmtCell(key: string, val: unknown): string {
  if (val == null) return '—'
  if (key === 'birth_date') return new Date(String(val)).toLocaleDateString('pt-BR')
  if (typeof val === 'number') return fmt(key.replace('_dollar', '').replace('pta', '').replace('tpi', 'gtpi'), val)
  return String(val)
}

type SortDir = 'asc' | 'desc' | null

export function DashboardPage() {
  const { data } = useDashboard()
  const { data: ordersData } = useOrders({ page: 1 })
  const orders = ordersData?.data ?? []
  const [herdPage, setHerdPage] = useState(1)
  const [herdSearch, setHerdSearch] = useState('')
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const { data: femalesData } = useFemalesFull({ page: herdPage, search: herdSearch })
  const rawFemales = femalesData?.data ?? []
  const totalFemales = femalesData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalFemales / (femalesData?.per_page ?? 50)))

  const females = useMemo(() => {
    if (!sortCol || !sortDir) return rawFemales
    return [...rawFemales].sort((a, b) => {
      const av = a[sortCol as keyof FemaleFull]
      const bv = b[sortCol as keyof FemaleFull]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rawFemales, sortCol, sortDir])

  const toggleSort = (key: string) => {
    if (sortCol !== key) { setSortCol(key); setSortDir('desc') }
    else if (sortDir === 'desc') setSortDir('asc')
    else { setSortCol(null); setSortDir(null) }
  }

  const exportFemales = async () => {
    const result = await api.getFemalesFull({ per_page: '9999' })
    const { utils, writeFile } = await import('xlsx')
    const headers = herdCols.map((c) => c.label)
    const rows = (result.data ?? []).map((f) => herdCols.map((c) => f[c.key] ?? ''))
    const ws = utils.aoa_to_sheet([headers, ...rows])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Rebanho')
    writeFile(wb, `rebanho-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div>
      <div className="ss-grid-kpis">
        <KpiCard icon={FileText} label="OS abertas" value={data?.orders_in_progress ?? 14} delta="▲ 3 esta semana" />
        <KpiCard icon={Plus} label="Amostras processadas" value={(data?.total_genotyped ?? 1974).toLocaleString('pt-BR')} delta="▲ 212 no mês" />
        <KpiCard icon={Download} label="Laudos disponíveis" value={data?.recent_results ?? 38} delta="▲ 9 novos" />
        <KpiCard icon={Clock} label="Aguardando CDCB" value={6} delta="▼ aguardando base" deltaType="down" />
      </div>
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Ordens de serviço</h3>
        </div>
        <div className="overflow-x-auto px-2 py-1">
          <table className="ss-table">
            <thead><tr><th>OS</th><th>Amostras</th><th>Status</th><th>Laudo</th></tr></thead>
            <tbody>
              {orders.length > 0 ? orders.map((o) => (
                <tr key={o.id}>
                  <td className="ss-mono">#{o.ordem_servico_ssgen ?? '—'}</td>
                  <td className="ss-mono">{o.numero_amostras ?? '—'}</td>
                  <td><span className={o.etapa_atual === 'Faturamento' ? 'ss-badge-ok' : 'ss-badge-wait'}>{o.etapa_atual === 'Faturamento' ? 'Concluída' : o.etapa_atual}</span></td>
                  <td className="ss-mono text-[var(--ss-primary)]">Baixar PDF</td>
                </tr>
              )) : demoOrders.map((o) => (
                <tr key={o[0]}>
                  <td className="ss-mono">{o[0]}</td><td className="ss-mono">{o[1]}</td>
                  <td><span className={`ss-badge-${o[3]}`}>{o[2]}</span></td>
                  <td>{o[3] === 'wait' ? <span className="ss-mono text-[var(--ss-muted-2)]">-</span> : <a className="ss-mono text-[var(--ss-primary)]">Baixar PDF</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="ss-card mt-3.5">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Rebanho completo · {totalFemales || '—'} fêmeas</h3>
          <div className="flex items-center gap-2">
            <div className="flex w-[230px] items-center gap-2 rounded-[7px] border border-[var(--ss-border)] bg-white px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-[var(--ss-muted)]" />
              <input value={herdSearch} onChange={(e) => { setHerdSearch(e.target.value); setHerdPage(1) }} placeholder="Buscar fêmea..." className="w-full border-0 bg-transparent text-[12px] outline-none" />
            </div>
            <button className="ss-button ss-button-ghost ss-button-sm" type="button" onClick={() => void exportFemales()}><Download />Exportar XLSX</button>
          </div>
        </div>
        <div className="ss-herd-scroll overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          <table className="ss-table ss-table-herd">
            <thead>
              <tr>
                {herdCols.map((c) => (
                  <th key={c.key} onClick={() => toggleSort(String(c.key))} className="cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {sortCol === String(c.key) ? (sortDir === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {females.length > 0 ? females.map((f) => (
                <tr key={f.id}>
                  {herdCols.map((c) => (
                    <td key={c.key} className={c.mono ? 'ss-mono' : ''}>{fmtCell(String(c.key), f[c.key])}</td>
                  ))}
                </tr>
              )) : (
                <tr><td colSpan={herdCols.length} className="text-center text-[var(--ss-muted)]">Nenhuma fêmea encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--ss-border-2)] px-4 py-2.5">
            <span className="font-mono text-[11px] text-[var(--ss-muted)]">Página {herdPage} de {totalPages}</span>
            <div className="flex gap-1.5">
              <button className="ss-button ss-button-ghost ss-button-sm" disabled={herdPage <= 1} onClick={() => setHerdPage((p) => p - 1)}>← Anterior</button>
              <button className="ss-button ss-button-ghost ss-button-sm" disabled={herdPage >= totalPages} onClick={() => setHerdPage((p) => p + 1)}>Próxima →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
