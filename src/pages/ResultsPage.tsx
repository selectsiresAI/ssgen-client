import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useResults } from '@/hooks/useApi'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatNum(n: number | null, decimals = 0) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function haplotypeBadge(val: string | null) {
  if (!val) return <span className="text-muted-foreground">—</span>
  const isCarrier = val.toUpperCase().includes('CARRIER') || val.toUpperCase() === 'C' || val.toUpperCase() === 'TC'
  return (
    <Badge variant={isCarrier ? 'destructive' : 'outline'} className="text-xs">
      {val}
    </Badge>
  )
}

export function ResultsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, error } = useResults({ page, search })

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resultados Genomicos</h1>
        <p className="text-muted-foreground text-sm">
          Provas genomicas dos seus animais genotipados
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nome, brinco ou registro..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary" size="sm">
          Buscar
        </Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setSearchInput('')
              setPage(1)
            }}
          >
            Limpar
          </Button>
        )}
        {data && (
          <span className="text-sm text-muted-foreground ml-auto">
            {data.total} resultado{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </form>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base sr-only">Resultados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Raca</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead className="text-right">TPI</TableHead>
                  <TableHead className="text-right">NM$</TableHead>
                  <TableHead className="text-right">HHP$</TableHead>
                  <TableHead className="text-right">Leite</TableHead>
                  <TableHead className="text-right">Prot</TableHead>
                  <TableHead className="text-right">PL</TableHead>
                  <TableHead className="text-right">SCS</TableHead>
                  <TableHead className="text-right">DPR</TableHead>
                  <TableHead>Haplotipos</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 14 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !data?.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      Nenhum resultado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{r.nome_animal ?? '—'}</p>
                          {r.animal_id && (
                            <p className="text-xs text-muted-foreground">{r.animal_id}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.registro ?? '—'}</TableCell>
                      <TableCell className="text-sm">{r.raca ?? '—'}</TableCell>
                      <TableCell className="text-sm">{r.sexo ?? '—'}</TableCell>
                      <TableCell className="text-right font-medium">{formatNum(r.tpi)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.nmpf)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.hhp_dollar)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.pta_milk)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.pta_protein)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.pta_pl, 1)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.pta_scs, 2)}</TableCell>
                      <TableCell className="text-right">{formatNum(r.pta_dpr, 1)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {haplotypeBadge(r.bvh)}
                          {haplotypeBadge(r.blad)}
                          {haplotypeBadge(r.cvm)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(r.uploaded_at)}</TableCell>
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Proxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
