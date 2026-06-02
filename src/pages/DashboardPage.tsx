import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/hooks/useApi'

const KPI_CONFIG = [
  { key: 'total_females', label: 'Total de Femeas', color: 'text-blue-600' },
  { key: 'total_genotyped', label: 'Genotipadas', color: 'text-green-600' },
  { key: 'orders_in_progress', label: 'OSs em Andamento', color: 'text-amber-600' },
  { key: 'orders_completed', label: 'OSs Concluidas', color: 'text-emerald-600' },
  { key: 'recent_results', label: 'Resultados Liberados', color: 'text-purple-600' },
] as const

export function DashboardPage() {
  const { data, isLoading, error } = useDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visao geral dos seus resultados genomicos
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">Erro ao carregar dados: {error.message}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CONFIG.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {data?.[kpi.key]?.toLocaleString('pt-BR') ?? '—'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Linked Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fazendas vinculadas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.clients?.length ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma fazenda vinculada. Solicite ao administrador que vincule sua conta.
            </p>
          ) : (
            <div className="space-y-2">
              {data.clients.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{c.nome}</p>
                    {c.farm_name && (
                      <p className="text-xs text-muted-foreground">{c.farm_name}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {c.cidade}/{c.estado}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
