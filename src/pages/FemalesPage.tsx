import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useFemales } from '@/hooks/useApi'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatNum(n: number | null, decimals = 0) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function FemalesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [genotyped, setGenotyped] = useState('')
  const [breed, setBreed] = useState('')

  const { data, isLoading, error } = useFemales({
    page,
    search,
    genotyped: genotyped || undefined,
    breed: breed || undefined,
  })

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Femeas</h1>
        <p className="text-muted-foreground text-sm">
          Rebanho cadastrado e status de genotipagem
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            placeholder="Buscar nome, brinco ou registro..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="secondary" size="sm">
            Buscar
          </Button>
        </form>

        <Select
          value={genotyped}
          onValueChange={(v: string | null) => {
            setGenotyped(!v || v === 'all' ? '' : v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Genotipagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Genotipadas</SelectItem>
            <SelectItem value="false">Nao genotipadas</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Filtrar raca..."
          value={breed}
          onChange={(e) => {
            setBreed(e.target.value)
            setPage(1)
          }}
          className="w-40"
        />

        {(search || genotyped || breed) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setSearchInput('')
              setGenotyped('')
              setBreed('')
              setPage(1)
            }}
          >
            Limpar filtros
          </Button>
        )}

        {data && (
          <span className="text-sm text-muted-foreground ml-auto">
            {data.total} femea{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base sr-only">Femeas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Brinco</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Raca</TableHead>
                  <TableHead>Nasc.</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Genotipada</TableHead>
                  <TableHead className="text-right">TPI</TableHead>
                  <TableHead className="text-right">NM$</TableHead>
                  <TableHead className="text-right">HHP$</TableHead>
                  <TableHead className="text-right">Leite</TableHead>
                  <TableHead className="text-right">DPR</TableHead>
                  <TableHead>Pai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 13 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !data?.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      Nenhuma femea encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium text-sm">{f.name ?? '—'}</TableCell>
                      <TableCell className="text-sm">{f.ear_tag ?? '—'}</TableCell>
                      <TableCell className="text-sm">{f.registration ?? '—'}</TableCell>
                      <TableCell className="text-sm">{f.breed ?? '—'}</TableCell>
                      <TableCell className="text-sm">{formatDate(f.birth_date)}</TableCell>
                      <TableCell className="text-sm">{f.category ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={f.genomic_result_id ? 'default' : 'outline'} className="text-xs">
                          {f.genomic_result_id ? 'Sim' : 'Nao'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatNum(f.tpi)}</TableCell>
                      <TableCell className="text-right">{formatNum(f.nmpf)}</TableCell>
                      <TableCell className="text-right">{formatNum(f.hhp_dollar)}</TableCell>
                      <TableCell className="text-right">{formatNum(f.pta_milk)}</TableCell>
                      <TableCell className="text-right">{formatNum(f.pta_dpr, 1)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{f.sire_naab ?? '—'}</TableCell>
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
