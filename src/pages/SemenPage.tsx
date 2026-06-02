import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useSemenInventory } from '@/hooks/useApi'
import { formatPtaValue } from '@/utils/ptaFormat'
import { ANIMAL_METRIC_COLUMNS } from '@/constants/animalMetrics'

type SortDir = 'asc' | 'desc'

export function SemenPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortKey, setSortKey] = useState<string>('daughters_count')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = (v: string) => {
    setSearch(v)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => setDebouncedSearch(v), 400))
  }

  const { data, isLoading } = useSemenInventory({ search: debouncedSearch })
  const bulls = data?.data ?? []

  const sorted = useMemo(() => {
    if (!sortKey) return bulls
    return [...bulls].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey]
      const bv = (b as Record<string, unknown>)[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [bulls, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <span className="text-muted-foreground/50 ml-1">↕</span>
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const totalBulls = bulls.length
  const totalDaughters = bulls.reduce((sum, b) => sum + (b.daughters_count ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Botijao Virtual</h1>
        <p className="text-muted-foreground text-sm">Touros utilizados no seu rebanho</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Touros</p>
            <p className="text-2xl font-bold text-primary">{totalBulls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Filhas no rebanho</p>
            <p className="text-2xl font-bold text-primary">{totalDaughters}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por NAAB ou nome..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-[300px]"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 min-w-[100px] cursor-pointer" onClick={() => handleSort('code')}>
                    NAAB <SortIcon col="code" />
                  </TableHead>
                  <TableHead className="min-w-[180px] cursor-pointer" onClick={() => handleSort('name')}>
                    Nome <SortIcon col="name" />
                  </TableHead>
                  <TableHead className="min-w-[80px] text-right cursor-pointer" onClick={() => handleSort('daughters_count')}>
                    Filhas <SortIcon col="daughters_count" />
                  </TableHead>
                  {ANIMAL_METRIC_COLUMNS.map(col => (
                    <TableHead key={col.key} className="min-w-[70px] text-right cursor-pointer" onClick={() => handleSort(col.key)}>
                      {col.label} <SortIcon col={col.key} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 3 + ANIMAL_METRIC_COLUMNS.length }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3 + ANIMAL_METRIC_COLUMNS.length} className="text-center py-8 text-muted-foreground">
                      Nenhum touro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map(b => (
                    <TableRow key={b.code}>
                      <TableCell className="sticky left-0 bg-card z-10 font-mono font-medium">{b.code}</TableCell>
                      <TableCell>{b.name ?? '—'}</TableCell>
                      <TableCell className="text-right font-bold">{b.daughters_count}</TableCell>
                      {ANIMAL_METRIC_COLUMNS.map(col => (
                        <TableCell key={col.key} className="text-right text-xs tabular-nums">
                          {formatPtaValue(col.key, (b as Record<string, unknown>)[col.key] as number | null)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
