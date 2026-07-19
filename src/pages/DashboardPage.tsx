import { Clock, Download, FileText, Plus } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { useDashboard, useOrders } from '@/hooks/useApi'

export function DashboardPage() {
  const { data } = useDashboard()
  const { data: ordersData } = useOrders({ page: 1 })
  const orders = ordersData?.data ?? []

  return (
    <div>
      <div className="ss-grid-kpis">
        <KpiCard icon={FileText} label="OS abertas" value={data?.orders_in_progress ?? 0} delta="" />
        <KpiCard icon={Plus} label="Fêmeas cadastradas" value={(data?.total_genotyped ?? 0).toLocaleString('pt-BR')} delta="" />
        <KpiCard icon={Download} label="Laudos disponíveis" value={data?.recent_results ?? 0} delta="" />
        <KpiCard icon={Clock} label="Aguardando CDCB" value={0} delta="" />
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
              )) : (
                <tr>
                  <td colSpan={4} className="text-center text-[var(--ss-muted)]">Nenhuma ordem de serviço ainda</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
