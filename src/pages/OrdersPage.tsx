import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrders } from '@/hooks/useApi'

const STAGES = [
  'CRA',
  'Envio Planilha',
  'VRI',
  'LPR',
  'Envio Resultados',
  'Receb. Resultados',
  'Faturamento',
] as const

function stageBadgeVariant(stage: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (stage === 'Faturamento') return 'default'
  if (stage === 'CRA' || stage === 'VRI') return 'destructive'
  return 'secondary'
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading, error } = useOrders({
    page,
    status: statusFilter || undefined,
  })

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ordens de Servico</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe o status das suas ordens de genotipagem
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v: string | null) => {
            setStatusFilter(!v || v === 'all' ? '' : v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as etapas</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} ordem{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base sr-only">Lista de ordens</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OS SSGEN</TableHead>
                  <TableHead>Cliente / Fazenda</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Amostras</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>CRA</TableHead>
                  <TableHead>Previsao</TableHead>
                  <TableHead>Liberacao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !data?.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma ordem encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">
                        {o.ordem_servico_ssgen ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{o.client_name ?? '—'}</p>
                          {o.farm_name && (
                            <p className="text-xs text-muted-foreground">{o.farm_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{o.nome_produto ?? '—'}</TableCell>
                      <TableCell className="text-center">{o.numero_amostras ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={stageBadgeVariant(o.etapa_atual)}>
                          {o.etapa_atual}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(o.cra_data)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(o.envio_resultados_previsao)}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(o.liberacao_data)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Proxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
