import { Clock, Download, FileText, Plus } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { useDashboard, useOrders } from '@/hooks/useApi'
import { useI18n } from '@/i18n'

export function DashboardPage() {
  const { data } = useDashboard()
  const { data: ordersData } = useOrders({ page: 1 })
  const orders = ordersData?.data ?? []
  const { t, formatNumber } = useI18n()

  return (
    <div>
      <div className="ss-grid-kpis">
        <KpiCard icon={FileText} label={t('dashboard.openOrders')} value={data?.orders_in_progress ?? 0} delta="" />
        <KpiCard icon={Plus} label={t('dashboard.registeredFemales')} value={formatNumber(data?.total_genotyped ?? 0)} delta="" />
        <KpiCard icon={Download} label={t('dashboard.availableReports')} value={data?.recent_results ?? 0} delta="" />
        <KpiCard icon={Clock} label={t('dashboard.awaitingCdcb')} value={0} delta="" />
      </div>
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">{t('dashboard.serviceOrders')}</h3>
        </div>
        <div className="overflow-x-auto px-2 py-1">
          <table className="ss-table">
            <thead>
              <tr>
                <th>{'OS'}</th>
                <th>{t('dashboard.samples')}</th>
                <th>{t('dashboard.status')}</th>
                <th>{t('dashboard.report')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((o) => (
                <tr key={o.id}>
                  <td className="ss-mono">#{o.ordem_servico_ssgen ?? '—'}</td>
                  <td className="ss-mono">{o.numero_amostras ?? '—'}</td>
                  <td><span className={o.etapa_atual === 'Faturamento' ? 'ss-badge-ok' : 'ss-badge-wait'}>{o.etapa_atual === 'Faturamento' ? t('dashboard.completed') : o.etapa_atual}</span></td>
                  <td className="ss-mono text-[var(--ss-primary)]">{t('dashboard.downloadPdf')}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center text-[var(--ss-muted)]">{t('dashboard.noServiceOrders')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
