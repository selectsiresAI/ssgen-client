import { useState, useMemo } from 'react'
import { ParentescoGauge } from '@/components/charts/ParentescoGauge'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuditoria, useServiceOrderOptions } from '@/hooks/useApi'
import { formatPtaValue } from '@/utils/ptaFormat'
import { ANIMAL_METRIC_COLUMNS } from '@/constants/animalMetrics'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const STEPS = [
  { id: '1', label: 'Parentesco' },
  { id: '2', label: 'Top Parents' },
  { id: '4', label: 'Media Linear' },
  { id: '7', label: 'Distribuicao' },
]

const DEFAULT_LINEAR_TRAITS = 'sta,str,dfm,rua,rls,rtp,ftl,rw,rlr,fta,fls,fua,ruh,ruw,ucl,udp,ftp'
const DEFAULT_DIST_TRAITS = 'hhp_dollar,tpi,nm_dollar,dpr,pl,scs'

interface DescriptiveStats {
  mean: number; median: number; std: number; min: number; max: number; q1: number; q3: number; cv: number
}

function calcStats(values: number[]): DescriptiveStats {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  if (n === 0) return { mean: 0, median: 0, std: 0, min: 0, max: 0, q1: 0, q3: 0, cv: 0 }
  const mean = sorted.reduce((s, v) => s + v, 0) / n
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  const variance = sorted.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n
  const std = Math.sqrt(variance)
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const cv = mean !== 0 ? (std / Math.abs(mean)) * 100 : 0
  return { mean, median, std, min: sorted[0], max: sorted[n - 1], q1, q3, cv }
}

function buildHistogram(values: number[], bins: number, stats: DescriptiveStats) {
  const clean = values.filter(v => Number.isFinite(v))
  if (clean.length === 0) return []
  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const width = (max - min) / bins || 1
  const counts = new Array(bins).fill(0)
  for (const v of clean) {
    let idx = Math.floor((v - min) / width)
    if (idx >= bins) idx = bins - 1
    if (idx < 0) idx = 0
    counts[idx]++
  }
  return counts.map((n, i) => {
    const start = min + i * width
    const end = start + width
    const midpoint = (start + end) / 2
    const zScore = stats.std !== 0 ? Math.abs((midpoint - stats.mean) / stats.std) : 0
    return { bin: `${start.toFixed(1)} – ${end.toFixed(1)}`, midpoint, n, zScore }
  })
}

function getBarColor(zScore: number): string {
  if (zScore < 0.5) return 'hsl(var(--chart-1))'
  if (zScore < 1.5) return 'hsl(var(--chart-2))'
  return 'hsl(var(--chart-3))'
}

function Step1({ serviceOrderId }: { serviceOrderId: string }) {
  const { data, isLoading } = useAuditoria({ step: '1', serviceOrderId })
  const rows = (data?.data ?? []) as Array<{ role: string; status: string; n: number; pct: number }>

  const byRole = useMemo(() => {
    const consolidated: Record<string, { informed: number; notInformed: number }> = {
      sire: { informed: 0, notInformed: 0 },
      mgs: { informed: 0, notInformed: 0 },
      mmgs: { informed: 0, notInformed: 0 },
    }
    rows.forEach(row => {
      if (!consolidated[row.role]) return
      if (row.status === 'Desconhecido') consolidated[row.role].notInformed += row.n
      else consolidated[row.role].informed += row.n
    })
    return consolidated
  }, [rows])

  if (isLoading) return <Skeleton className="h-40 w-full" />

  const roleLabels: Record<string, string> = { sire: 'Pai (Sire)', mgs: 'Avo Materno (MGS)', mmgs: 'Bisavo Materno (MMGS)' }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <p className="font-medium mb-1">Como interpretar</p>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li><span className="text-destructive font-medium">Nao Informado:</span> Parentesco nao identificado no genomico</li>
          <li><span className="text-emerald-500 font-medium">Informado:</span> Parentesco identificado corretamente</li>
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(['sire', 'mgs', 'mmgs'] as const).map(role => {
          const d = byRole[role]
          const total = d.informed + d.notInformed
          const infPct = total > 0 ? (d.informed / total) * 100 : 0
          const niPct = total > 0 ? (d.notInformed / total) * 100 : 0
          return (
            <Card key={role}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{roleLabels[role]}</CardTitle>
                <p className="text-sm text-muted-foreground">{total} animais</p>
              </CardHeader>
              <CardContent>
                {total > 0 ? (
                  <>
                    <ParentescoGauge pct={infPct} />
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />Informado</span>
                        <span className="font-mono font-semibold">{infPct.toFixed(1)}% <span className="font-normal text-muted-foreground">· {d.informed}</span></span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-destructive"><span className="h-2 w-2 rounded-full bg-destructive" />Nao Informado</span>
                        <span className="font-mono font-semibold text-destructive">{niPct.toFixed(1)}% <span className="font-normal text-muted-foreground">· {d.notInformed}</span></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">Sem dados</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Step2({ serviceOrderId }: { serviceOrderId: string }) {
  const [orderTrait, setOrderTrait] = useState('hhp_dollar')
  const [limit, setLimit] = useState(20)

  const { data: sireData, isLoading: sireLoading } = useAuditoria({
    step: '2', serviceOrderId, parentType: 'sire', orderTrait, limit: String(limit),
  })
  const { data: mgsData, isLoading: mgsLoading } = useAuditoria({
    step: '2', serviceOrderId, parentType: 'mgs', orderTrait, limit: String(limit),
  })

  const sireRows = (sireData?.data ?? []) as Array<{ parent_label: string; daughters_count: number; trait_mean: number | null }>
  const mgsRows = (mgsData?.data ?? []) as Array<{ parent_label: string; daughters_count: number; trait_mean: number | null }>

  const loading = sireLoading || mgsLoading

  function RankingList({ rows, title }: { rows: typeof sireRows; title: string }) {
    const total = rows.reduce((s, r) => s + r.daughters_count, 0)
    const maxVal = Math.max(0, ...rows.map(r => r.daughters_count))
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-xs text-muted-foreground">Total filhas: <strong>{total}</strong></span>
        </div>
        <div className="space-y-1">
          {rows.map((row, idx) => {
            const width = maxVal > 0 ? (row.daughters_count / maxVal) * 100 : 0
            const pct = total > 0 ? ((row.daughters_count / total) * 100).toFixed(2) : '0.00'
            return (
              <div key={`${row.parent_label}-${idx}`} className="flex items-center gap-2 text-sm">
                <div className="w-40 flex-shrink-0 text-right">
                  <span className="font-medium font-mono tabular-nums">{row.parent_label}</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-5 bg-muted transition-all" style={{ width: `${width}%` }} />
                  <span className="text-xs font-medium min-w-[3rem] text-right tabular-nums">{row.daughters_count}</span>
                  <span className="text-[10px] text-muted-foreground min-w-[3rem] text-right tabular-nums">{pct}%</span>
                  <span className="text-[10px] text-muted-foreground">
                    {row.trait_mean == null ? 'N/A' : `${orderTrait}: ${Math.round(row.trait_mean)}`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Top Parents</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input className="w-28" type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} />
          <Input className="w-44" value={orderTrait} onChange={e => setOrderTrait(e.target.value)} placeholder="Indice para ordenar" />
        </div>

        {loading && <div className="py-6 text-center text-muted-foreground">Carregando...</div>}

        {!loading && sireRows.length === 0 && mgsRows.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">Sem dados</div>
        )}

        {!loading && (sireRows.length > 0 || mgsRows.length > 0) && (
          <Tabs defaultValue="sire" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="sire">Sire (Pai)</TabsTrigger>
              <TabsTrigger value="mgs">MGS (Avo Materno)</TabsTrigger>
            </TabsList>
            <TabsContent value="sire">
              <RankingList rows={sireRows} title={`Top ${sireRows.length} — Sire`} />
            </TabsContent>
            <TabsContent value="mgs">
              <RankingList rows={mgsRows} title={`Top ${mgsRows.length} — MGS`} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function Step4({ serviceOrderId }: { serviceOrderId: string }) {
  const allTraits = ANIMAL_METRIC_COLUMNS.filter(c => c.numeric).map(c => c.key)
  const defaultTraits = DEFAULT_LINEAR_TRAITS.split(',')
  const [traits, setTraits] = useState<string[]>(defaultTraits)

  const { data, isLoading } = useAuditoria({
    step: '4', serviceOrderId, traits: traits.join(','),
  })

  const rows = (data?.data ?? []) as Array<{ trait_key: string; group_label: string; mean_value: number; n: number }>

  const chartData = useMemo(() => {
    return rows.map(r => ({
      trait: r.trait_key.toUpperCase(),
      avgValue: r.mean_value,
    }))
  }, [rows])

  const toggleTrait = (key: string) => {
    setTraits(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  return (
    <Card>
      <CardHeader><CardTitle>Media de Traits Lineares</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {allTraits.map(key => {
            const on = traits.includes(key)
            const label = ANIMAL_METRIC_COLUMNS.find(c => c.key === key)?.label ?? key.toUpperCase()
            return (
              <Badge key={key} variant={on ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleTrait(key)}>
                {label}
              </Badge>
            )
          })}
        </div>

        {isLoading && <div className="py-6 text-center text-muted-foreground">Carregando...</div>}

        {!isLoading && chartData.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">Sem dados</div>
        )}

        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 25)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={v => Number(v).toFixed(2)} allowDecimals />
              <YAxis dataKey="trait" type="category" width={90} />
              <Tooltip formatter={(val) => Number(val).toFixed(2)} />
              <Bar dataKey="avgValue" fill="hsl(var(--muted))">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.avgValue >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function Step7({ serviceOrderId }: { serviceOrderId: string }) {
  const allTraitKeys = ANIMAL_METRIC_COLUMNS.filter(c => c.numeric).map(c => c.key)
  const [selectedTraits, setSelectedTraits] = useState<string[]>(DEFAULT_DIST_TRAITS.split(','))

  const { data, isLoading } = useAuditoria({
    step: '7', serviceOrderId, traits: selectedTraits.join(','),
  })

  const rawData = (data?.data ?? {}) as Record<string, number[]>

  const series = useMemo(() => {
    return selectedTraits.map(traitKey => {
      const values = rawData[traitKey] ?? []
      const label = ANIMAL_METRIC_COLUMNS.find(c => c.key === traitKey)?.label ?? traitKey.toUpperCase()
      const stats = calcStats(values)
      const histogramData = buildHistogram(values, 30, stats)
      return { traitKey, label, data: histogramData, total: values.length, stats }
    }).filter(s => s.total > 0)
  }, [rawData, selectedTraits])

  const toggleTrait = (key: string) => {
    setSelectedTraits(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {allTraitKeys.map(key => {
              const on = selectedTraits.includes(key)
              const label = ANIMAL_METRIC_COLUMNS.find(c => c.key === key)?.label ?? key.toUpperCase()
              return (
                <Badge key={key} variant={on ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleTrait(key)}>
                  {label}
                </Badge>
              )
            })}
          </div>
          <p className="text-sm text-muted-foreground">{selectedTraits.length} selecionadas</p>
        </CardContent>
      </Card>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {series.map(s => (
        <Card key={s.traitKey}>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              {s.label}
              <Badge variant="outline" className="text-xs">n={s.total}</Badge>
            </CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
              <div className="bg-muted/50 px-2 py-1 rounded">
                <div className="text-xs text-muted-foreground">Media</div>
                <div className="font-semibold">{formatPtaValue(s.traitKey, s.stats.mean)}</div>
              </div>
              <div className="bg-muted/50 px-2 py-1 rounded">
                <div className="text-xs text-muted-foreground">Mediana</div>
                <div className="font-semibold">{formatPtaValue(s.traitKey, s.stats.median)}</div>
              </div>
              <div className="bg-muted/50 px-2 py-1 rounded">
                <div className="text-xs text-muted-foreground">Desvio Padrao</div>
                <div className="font-semibold">{formatPtaValue(s.traitKey, s.stats.std)}</div>
              </div>
              <div className="bg-muted/50 px-2 py-1 rounded">
                <div className="text-xs text-muted-foreground">CV%</div>
                <div className="font-semibold">{s.stats.cv.toFixed(1)}%</div>
              </div>
              <div className="bg-muted/50 px-2 py-1 rounded">
                <div className="text-xs text-muted-foreground">Min - Max</div>
                <div className="font-semibold text-xs">{formatPtaValue(s.traitKey, s.stats.min)} – {formatPtaValue(s.traitKey, s.stats.max)}</div>
              </div>
              <div className="bg-muted/50 px-2 py-1 rounded">
                <div className="text-xs text-muted-foreground">Q1 - Q3</div>
                <div className="font-semibold text-xs">{formatPtaValue(s.traitKey, s.stats.q1)} – {formatPtaValue(s.traitKey, s.stats.q3)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bin" tick={{ fontSize: 10 }} interval={Math.floor(s.data.length / 10)} angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      const pct = ((d.n / s.total) * 100).toFixed(1)
                      return (
                        <div className="bg-popover border p-3 rounded-md shadow-lg text-sm">
                          <p className="font-semibold mb-1">{d.bin}</p>
                          <p>Frequencia: <strong className="text-primary">{d.n}</strong> ({pct}%)</p>
                        </div>
                      )
                    }
                    return null
                  }} />
                  <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                    {s.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.zScore)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span>Proximo da media</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span>Moderado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                <span>Distante</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {series.length === 0 && !isLoading && (
        <div className="text-sm text-muted-foreground">Selecione PTAs para visualizar as distribuicoes.</div>
      )}
    </div>
  )
}

export function AuditoriaClientPage() {
  const [activeStep, setActiveStep] = useState('1')
  const [serviceOrderId, setServiceOrderId] = useState('')
  const { data: soData } = useServiceOrderOptions()
  const serviceOrders = soData?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditoria Genetica</h1>
        <p className="text-muted-foreground text-sm">Analise a composicao genetica do seu rebanho</p>
      </div>

      {/* OS Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={serviceOrderId || 'all'}
          onValueChange={(v: string | null) => setServiceOrderId(!v || v === 'all' ? '' : v)}
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
      </div>

      {/* Stepper */}
      <div className="flex gap-2 flex-wrap">
        {STEPS.map(s => (
          <Button
            key={s.id}
            variant={activeStep === s.id ? 'default' : 'outline'}
            onClick={() => setActiveStep(s.id)}
            className="gap-1"
          >
            <span className="text-xs font-bold">{s.id}</span>
            {s.label}
          </Button>
        ))}
      </div>

      {/* Step content */}
      {activeStep === '1' && <Step1 serviceOrderId={serviceOrderId} />}
      {activeStep === '2' && <Step2 serviceOrderId={serviceOrderId} />}
      {activeStep === '4' && <Step4 serviceOrderId={serviceOrderId} />}
      {activeStep === '7' && <Step7 serviceOrderId={serviceOrderId} />}
    </div>
  )
}
