import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useDashboard, useOrders, useServiceOrderOptions } from '@/hooks/useApi'
import { api } from '@/lib/api'

const KPI_CONFIG = [
  { key: 'total_females', label: 'Total de Femeas', color: 'text-blue-600' },
  { key: 'total_genotyped', label: 'Genotipadas', color: 'text-green-600' },
  { key: 'orders_in_progress', label: 'OSs em Andamento', color: 'text-amber-600' },
  { key: 'orders_completed', label: 'OSs Concluidas', color: 'text-emerald-600' },
  { key: 'recent_results', label: 'Resultados Liberados', color: 'text-purple-600' },
] as const

export function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ page: 1 })
  const { data: soData } = useServiceOrderOptions()
  const [selectedOs, setSelectedOs] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)

  const orders = ordersData?.data ?? []
  const serviceOrders = soData?.data ?? []

  const toggleOs = (id: string) => {
    setSelectedOs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exportFemales = async (serviceOrderId?: string) => {
    setDownloading(true)
    try {
      const params: Record<string, string> = { per_page: '9999' }
      if (serviceOrderId) params.service_order_id = serviceOrderId
      const result = await api.getFemalesFull(params)
      const females = result.data ?? []
      if (females.length === 0) { alert('Nenhuma femea encontrada'); return }

      const { utils, writeFile } = await import('xlsx')
      const headers = ['Nome', 'Brinco', 'Registro', 'Nascimento', 'Raca', 'Sire', 'MGS', 'HHP$', 'TPI', 'NM$', 'PTAM', 'PTAF', 'PTAP', 'PL', 'DPR', 'SCS', 'PTAT', 'UDC', 'FLC']
      const rows = females.map(f => [
        f.name ?? '', f.ear_tag ?? '', f.registration ?? '',
        f.birth_date ?? '', f.breed ?? '', f.sire_naab ?? '', f.mgs_naab ?? '',
        f.hhp_dollar, f.tpi, f.nm_dollar, f.ptam, f.ptaf, f.ptap, f.pl, f.dpr, f.scs, f.ptat, f.udc, f.flc
      ])
      const ws = utils.aoa_to_sheet([headers, ...rows])
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Rebanho')
      writeFile(wb, `rebanho-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error(err)
      alert('Erro ao exportar')
    } finally { setDownloading(false) }
  }

  const exportSelected = async () => {
    if (selectedOs.size === 0) { alert('Selecione pelo menos uma OS'); return }
    setDownloading(true)
    try {
      // Fetch females for each selected OS and merge
      const allFemales: any[] = []
      for (const osId of selectedOs) {
        const result = await api.getFemalesFull({ per_page: '9999', service_order_id: osId })
        allFemales.push(...(result.data ?? []))
      }
      // Deduplicate by id
      const seen = new Set<string>()
      const unique = allFemales.filter(f => { if (seen.has(f.id)) return false; seen.add(f.id); return true })

      if (unique.length === 0) { alert('Nenhuma femea encontrada nas OSs selecionadas'); setDownloading(false); return }

      const { utils, writeFile } = await import('xlsx')
      const headers = ['Nome', 'Brinco', 'Registro', 'Nascimento', 'Raca', 'Sire', 'MGS', 'HHP$', 'TPI', 'NM$', 'PTAM', 'PTAF', 'PTAP', 'PL', 'DPR', 'SCS', 'PTAT', 'UDC', 'FLC']
      const rows = unique.map((f: any) => [
        f.name ?? '', f.ear_tag ?? '', f.registration ?? '',
        f.birth_date ?? '', f.breed ?? '', f.sire_naab ?? '', f.mgs_naab ?? '',
        f.hhp_dollar, f.tpi, f.nm_dollar, f.ptam, f.ptaf, f.ptap, f.pl, f.dpr, f.scs, f.ptat, f.udc, f.flc
      ])
      const ws = utils.aoa_to_sheet([headers, ...rows])
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Rebanho Selecionado')
      writeFile(wb, `rebanho-selecionado-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error(err)
      alert('Erro ao exportar')
    } finally { setDownloading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visao geral dos seus resultados genomicos</p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">Erro ao carregar dados: {error.message}</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CONFIG.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : (
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {data?.[kpi.key]?.toLocaleString('pt-BR') ?? '—'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client */}
      <Card>
        <CardHeader><CardTitle className="text-base">Meu cliente</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data?.clients?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum cliente vinculado. Solicite ao administrador que vincule sua conta.</p>
          ) : (
            <div className="space-y-2">
              {data.clients.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <p className="font-medium text-sm">{c.nome}</p>
                  <Badge variant="outline" className="text-xs">{c.cidade}/{c.estado}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ordens de Servico</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OS SSGEN</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Amostras</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma ordem encontrada</TableCell>
                  </TableRow>
                ) : (
                  orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.ordem_servico_ssgen ?? '—'}</TableCell>
                      <TableCell className="text-sm">{o.client_name ?? '—'}</TableCell>
                      <TableCell className="text-sm">{o.nome_produto ?? '—'}</TableCell>
                      <TableCell className="text-center">{o.numero_amostras ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={o.etapa_atual === 'Faturamento' ? 'default' : 'secondary'}>
                          {o.etapa_atual === 'Faturamento' ? 'Concluida' : 'Em andamento'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card>
        <CardHeader><CardTitle className="text-base">Download do Rebanho</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => void exportFemales()} disabled={downloading}>
            {downloading ? 'Exportando...' : 'Exportar rebanho completo'}
          </Button>

          {serviceOrders.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Ou selecione ordens para agrupar:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {serviceOrders.map(so => (
                  <label key={so.id} className="flex items-center gap-3 cursor-pointer text-sm hover:bg-muted/50 rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedOs.has(so.id)}
                      onChange={() => toggleOs(so.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span>OS {so.ordem_servico_ssgen ?? '—'} — {so.nome_produto ?? ''}</span>
                  </label>
                ))}
              </div>
              <Button variant="outline" onClick={() => void exportSelected()} disabled={downloading || selectedOs.size === 0}>
                {downloading ? 'Exportando...' : `Exportar selecionadas (${selectedOs.size})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
