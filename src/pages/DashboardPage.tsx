import { Clock, Download, FileText, Plus } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { useDashboard, useOrders } from '@/hooks/useApi'

const demoOrders = [
  ['#2026-188', '312', 'Concluída', 'ok'],
  ['#2026-187', '540', 'Concluída', 'ok'],
  ['#2026-186', '96', 'Em análise', 'wait'],
  ['#2026-185', '208', 'Liberada', 'done'],
]

export function DashboardPage() {
  const { data } = useDashboard()
  const { data: ordersData } = useOrders({ page: 1 })
  const orders = ordersData?.data ?? []

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
    </div>
  )
}
