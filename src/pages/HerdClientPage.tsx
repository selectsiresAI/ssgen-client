import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useFemalesFull, useServiceOrderOptions } from '@/hooks/useApi'
import { calculateCategoryCounts, getAutomaticCategory } from '@/utils/femaleCategories'
import { formatPtaValue } from '@/utils/ptaFormat'
import { ANIMAL_METRIC_COLUMNS } from '@/constants/animalMetrics'

type SortDir = 'asc' | 'desc'

export function HerdClientPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [serviceOrderId, setServiceOrderId] = useState<string>('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Debounce search
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = (v: string) => {
    setSearch(v)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => { setDebouncedSearch(v); setPage(1) }, 400))
  }

  const { data: soData } = useServiceOrderOptions()
  const { data, isLoading } = useFemalesFull({
    page,
    search: debouncedSearch,
    serviceOrderId: serviceOrderId || undefined,
  })

  const females = data?.data ?? []
  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const categoryCounts = useMemo(() => calculateCategoryCounts(females), [females])

  const sortedFemales = useMemo(() => {
    if (!sortKey) return females
    return [...females].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey]
      const bv = (b as Record<string, unknown>)[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [females, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <span className="text-muted-foreground/50 ml-1">↕</span>
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const serviceOrders = soData?.data ?? []

  const categoryCards = [
    { label: 'Total', value: categoryCounts.total, color: 'bg-primary/10 text-primary' },
    { label: 'Bezerras', value: categoryCounts.bezerras, color: 'bg-pink-50 text-pink-600' },
    { label: 'Novilhas', value: categoryCounts.novilhas, color: 'bg-purple-50 text-purple-600' },
    { label: 'Primiparas', value: categoryCounts.primiparas, color: 'bg-blue-50 text-blue-600' },
    { label: 'Secundiparas', value: categoryCounts.secundiparas, color: 'bg-amber-50 text-amber-600' },
    { label: 'Multiparas', value: categoryCounts.multiparas, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rebanho</h1>
        <p className="text-muted-foreground text-sm">Visualize as femeas genotipadas do seu rebanho</p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryCards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={serviceOrderId || 'all'}
          onValueChange={(v: string | null) => {
            setServiceOrderId(!v || v === 'all' ? '' : v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filtrar por Ordem de Servico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ordens</SelectItem>
            {serviceOrders.map(so => (
              <SelectItem key={so.id} value={so.id}>
                OS {so.ordem_servico_ssgen ?? '—'} — {so.nome_produto ?? ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar por nome, brinco ou registro..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-[300px]"
        />

        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} femea{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 min-w-[180px] cursor-pointer" onClick={() => handleSort('name')}>
                    Nome <SortIcon col="name" />
                  </TableHead>
                  <TableHead className="min-w-[100px] cursor-pointer" onClick={() => handleSort('ear_tag')}>
                    Brinco <SortIcon col="ear_tag" />
                  </TableHead>
                  <TableHead className="min-w-[100px]">Registro</TableHead>
                  <TableHead className="min-w-[100px]">Categoria</TableHead>
                  <TableHead className="min-w-[80px]">Raca</TableHead>
                  <TableHead className="min-w-[80px]">Sire</TableHead>
                  <TableHead className="min-w-[80px]">MGS</TableHead>
                  {ANIMAL_METRIC_COLUMNS.map(col => (
                    <TableHead
                      key={col.key}
                      className="min-w-[70px] text-right cursor-pointer"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label} <SortIcon col={col.key} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 + ANIMAL_METRIC_COLUMNS.length }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sortedFemales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7 + ANIMAL_METRIC_COLUMNS.length} className="text-center py-8 text-muted-foreground">
                      Nenhuma femea encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedFemales.map(f => {
                    const cat = getAutomaticCategory(f.birth_date)
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="sticky left-0 bg-card z-10 font-medium">
                          {f.name ?? '—'}
                        </TableCell>
                        <TableCell>{f.ear_tag ?? '—'}</TableCell>
                        <TableCell className="text-xs">{f.registration ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{cat}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{f.breed ?? '—'}</TableCell>
                        <TableCell className="text-xs font-mono">{f.sire_naab ?? '—'}</TableCell>
                        <TableCell className="text-xs font-mono">{f.mgs_naab ?? '—'}</TableCell>
                        {ANIMAL_METRIC_COLUMNS.map(col => (
                          <TableCell key={col.key} className="text-right text-xs tabular-nums">
                            {formatPtaValue(col.key, (f as Record<string, unknown>)[col.key] as number | null)}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Pagina {page} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Proxima</Button>
          </div>
        </div>
      )}
    </div>
  )
}
