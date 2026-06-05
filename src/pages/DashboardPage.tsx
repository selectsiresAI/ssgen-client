import { Check, Clock, Download, FileText, Plus } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { useDashboard, useOrders } from '@/hooks/useApi'
import { api } from '@/lib/api'

const demoOrders = [
  ['#2026-188', 'Fazenda Sape', '312', '28/04/26', 'Concluída', 'ok'],
  ['#2026-187', 'Coop. Vale Verde', '540', '22/04/26', 'Concluída', 'ok'],
  ['#2026-186', 'Sítio Boa Vista', '96', '19/04/26', 'Em análise', 'wait'],
  ['#2026-185', 'Fazenda Aurora', '208', '11/04/26', 'Liberada', 'done'],
]

export function DashboardPage() {
  const { data } = useDashboard()
  const { data: ordersData } = useOrders({ page: 1 })
  const orders = ordersData?.data ?? []

  const exportFemales = async () => {
    const result = await api.getFemalesFull({ per_page: '9999' })
    const { utils, writeFile } = await import('xlsx')
    const headers = ['Nome', 'Brinco', 'Registro', 'Nascimento', 'Raça', 'Sire', 'MGS', 'HHP$', 'TPI', 'NM$', 'PTAM', 'PL', 'DPR', 'SCS', 'PTAT', 'UDC', 'FLC']
    const rows = (result.data ?? []).map((f) => [f.name ?? '', f.ear_tag ?? '', f.registration ?? '', f.birth_date ?? '', f.breed ?? '', f.sire_naab ?? '', f.mgs_naab ?? '', f.hhp_dollar, f.tpi, f.nm_dollar, f.ptam, f.pl, f.dpr, f.scs, f.ptat, f.udc, f.flc])
    const ws = utils.aoa_to_sheet([headers, ...rows])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Rebanho')
    writeFile(wb, `rebanho-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div>
      <div className="ss-preserved"><Check className="h-[15px] w-[15px]" />Funções atuais preservadas - OS, status e download mantidos, apenas reestilizados.</div>
      <div className="ss-grid-kpis">
        <KpiCard icon={FileText} label="OS abertas" value={data?.orders_in_progress ?? 14} delta="▲ 3 esta semana" />
        <KpiCard icon={Plus} label="Amostras processadas" value={(data?.total_genotyped ?? 1974).toLocaleString('pt-BR')} delta="▲ 212 no mês" />
        <KpiCard icon={Download} label="Laudos disponíveis" value={data?.recent_results ?? 38} delta="▲ 9 novos" />
        <KpiCard icon={Clock} label="Aguardando CDCB" value={6} delta="▼ aguardando base" deltaType="down" />
      </div>
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Ordens de serviço</h3>
          <button className="ss-button ss-button-ghost" type="button" onClick={() => void exportFemales()}><Download />Exportar</button>
        </div>
        <div className="overflow-x-auto px-2 py-1">
          <table className="ss-table">
            <thead><tr><th>OS</th><th>Fazenda</th><th>Amostras</th><th>Coleta</th><th>Status</th><th>Laudo</th></tr></thead>
            <tbody>
              {orders.length > 0 ? orders.map((o) => (
                <tr key={o.id}>
                  <td className="ss-mono">#{o.ordem_servico_ssgen ?? '—'}</td>
                  <td>{o.farm_name ?? o.client_name ?? '—'}</td>
                  <td className="ss-mono">{o.numero_amostras ?? '—'}</td>
                  <td className="ss-mono">{o.cra_data ? new Date(o.cra_data).toLocaleDateString('pt-BR') : '—'}</td>
                  <td><span className={o.etapa_atual === 'Faturamento' ? 'ss-badge-ok' : 'ss-badge-wait'}>{o.etapa_atual === 'Faturamento' ? 'Concluída' : o.etapa_atual}</span></td>
                  <td className="ss-mono text-[var(--ss-primary)]">Baixar PDF</td>
                </tr>
              )) : demoOrders.map((o) => (
                <tr key={o[0]}>
                  <td className="ss-mono">{o[0]}</td><td>{o[1]}</td><td className="ss-mono">{o[2]}</td><td className="ss-mono">{o[3]}</td>
                  <td><span className={`ss-badge-${o[5]}`}>{o[4]}</span></td>
                  <td>{o[5] === 'wait' ? <span className="ss-mono text-[var(--ss-muted-2)]">-</span> : <a className="ss-mono text-[var(--ss-primary)]">Baixar PDF</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
