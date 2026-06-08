import { useMemo, useState } from 'react'
import { Download, TrendingUp, Plus, Trash2, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KpiCard } from '@/components/KpiCard'
import { useBotijaoData, useFemalesFull, useBullTraits } from '@/hooks/useApi'
import { NEXUS_TRAITS, formatTrait, type NexusTrait } from '@/lib/nexus-traits'
import type { FemaleFull, BullTraits } from '@/lib/api'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'

// ── Mapeamento de campos → Nexus traits ──

const TRAIT_FIELD_MAP: Record<NexusTrait, string> = {
  'HHP+': 'hhp_dollar',
  'TPI': 'tpi',
  'ML$': 'nm_dollar',
  'Leite lbs': 'ptam',
  'Gordura lbs': 'ptaf',
  'Proteína lbs': 'ptap',
  'CFP': 'cfp',
  'VP': 'pl',
  'DPR': 'dpr',
  'CCS': 'scs',
  'PTA Type': 'ptat',
  'Composto Ubere': 'udc',
}

function getTraitValue(f: FemaleFull, trait: NexusTrait): number | null {
  const val = f[TRAIT_FIELD_MAP[trait]]
  return typeof val === 'number' ? val : null
}

function getBullTraitValue(b: BullTraits, trait: NexusTrait): number | null {
  const val = (b as unknown as Record<string, unknown>)[TRAIT_FIELD_MAP[trait]]
  return typeof val === 'number' ? val : null
}

// ── Tipos ──

interface GenerationRow {
  label: string
  year: number | null // null = agrupado
  count: number
  averages: Record<NexusTrait, number | null>
}

interface MatingGroup {
  id: string
  bulls: { code: string; name: string | null; pct: number }[]
  generations: string[] // labels das gerações (e.g. "2024", "2023", "≤2020")
}

interface PredictionRow {
  generation: string
  bull: string
  bullCode: string
  pct: number
  count: number // fêmeas afetadas
  values: Record<NexusTrait, number>
}

export function NexusPage() {
  const { data: botijaoData } = useBotijaoData()
  const { data: femalesData, isLoading: loadingFemales } = useFemalesFull({ page: 1, perPage: 5000 })
  const [matingGroups, setMatingGroups] = useState<MatingGroup[]>([])
  const [predictions, setPredictions] = useState<PredictionRow[]>([])
  const [showResults, setShowResults] = useState(false)

  // Fêmeas e touros
  const femeas = useMemo(() => femalesData?.data ?? [], [femalesData])
  const touros = useMemo(() => {
    const itens = botijaoData?.itens ?? []
    if (itens.length > 0) {
      const map = new Map<string, { code: string; name: string | null }>()
      itens.forEach((i) => { if (!map.has(i.touro_code)) map.set(i.touro_code, { code: i.touro_code, name: i.touro_name }) })
      return Array.from(map.values())
    }
    try {
      const saved = localStorage.getItem('botijao-ssgen-v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        const localItens = parsed.itens ?? []
        const map = new Map<string, { code: string; name: string | null }>()
        localItens.forEach((i: { touro?: { code: string; name: string | null } }) => {
          if (i.touro && !map.has(i.touro.code)) map.set(i.touro.code, { code: i.touro.code, name: i.touro.name })
        })
        return Array.from(map.values())
      }
    } catch { /* ignore */ }
    return []
  }, [botijaoData])

  // Buscar traits dos touros da plataforma
  const touroCodes = useMemo(() => touros.map((t) => t.code), [touros])
  const { data: bullTraitsData } = useBullTraits(touroCodes)
  const bullTraitsMap = useMemo(() => {
    const map = new Map<string, BullTraits>()
    bullTraitsData?.data?.forEach((b) => { map.set(b.code, b) })
    return map
  }, [bullTraitsData])

  // ── Gerações (agrupar por ano de nascimento) ──
  const generations: GenerationRow[] = useMemo(() => {
    if (femeas.length === 0) return []

    // Extrair anos
    const byYear = new Map<number, FemaleFull[]>()
    femeas.forEach((f) => {
      const y = f.birth_date ? new Date(f.birth_date).getFullYear() : null
      if (y && !isNaN(y)) {
        if (!byYear.has(y)) byYear.set(y, [])
        byYear.get(y)!.push(f)
      }
    })

    const years = Array.from(byYear.keys()).sort((a, b) => b - a) // desc
    if (years.length === 0) return []

    const rows: GenerationRow[] = []
    const recentYears = years.slice(0, 5)
    const olderYears = years.slice(5)

    // Recent years (individual rows)
    recentYears.forEach((year) => {
      const animals = byYear.get(year)!
      rows.push({
        label: String(year),
        year,
        count: animals.length,
        averages: calcAverages(animals),
      })
    })

    // Older years grouped
    if (olderYears.length > 0) {
      const allOlder = olderYears.flatMap((y) => byYear.get(y)!)
      rows.push({
        label: `≤${olderYears[0]}`,
        year: null,
        count: allOlder.length,
        averages: calcAverages(allOlder),
      })
    }

    return rows
  }, [femeas])

  // Calcular médias para um grupo de fêmeas
  function calcAverages(animals: FemaleFull[]): Record<NexusTrait, number | null> {
    const result = {} as Record<NexusTrait, number | null>
    NEXUS_TRAITS.forEach((trait) => {
      const values = animals.map((f) => getTraitValue(f, trait)).filter((v): v is number => v != null)
      result[trait] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null
    })
    return result
  }

  // ── Plano de Acasalamento ──

  const addMatingGroup = () => {
    setMatingGroups((prev) => [...prev, {
      id: `mg-${Date.now()}`,
      bulls: [],
      generations: generations.length > 0 ? [generations[0].label] : [],
    }])
  }

  const removeMatingGroup = (id: string) => {
    setMatingGroups((prev) => prev.filter((g) => g.id !== id))
  }

  const addBullToGroup = (groupId: string, bull: { code: string; name: string | null }) => {
    setMatingGroups((prev) => prev.map((g) =>
      g.id === groupId && !g.bulls.find((b) => b.code === bull.code)
        ? { ...g, bulls: [...g.bulls, { ...bull, pct: 100 }] }
        : g
    ))
  }

  const removeBullFromGroup = (groupId: string, code: string) => {
    setMatingGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, bulls: g.bulls.filter((b) => b.code !== code) } : g
    ))
  }

  const setBullPct = (groupId: string, code: string, pct: number) => {
    setMatingGroups((prev) => prev.map((g) =>
      g.id === groupId ? { ...g, bulls: g.bulls.map((b) => b.code === code ? { ...b, pct } : b) } : g
    ))
  }

  const toggleGeneration = (groupId: string, label: string) => {
    setMatingGroups((prev) => prev.map((g) => {
      if (g.id !== groupId) return g
      const has = g.generations.includes(label)
      return { ...g, generations: has ? g.generations.filter((l) => l !== label) : [...g.generations, label] }
    }))
  }

  // ── Calcular predições ──

  const calcularPredicoes = () => {
    if (matingGroups.length === 0 || femeas.length === 0) return

    const results: PredictionRow[] = []

    // Para cada grupo de acasalamento
    matingGroups.forEach((group) => {
      if (group.bulls.length === 0 || group.generations.length === 0) return

      // Normalizar percentuais
      const totalPct = group.bulls.reduce((s, b) => s + b.pct, 0)

      group.generations.forEach((genLabel) => {
        // Encontrar fêmeas dessa geração
        const gen = generations.find((g) => g.label === genLabel)
        if (!gen) return

        const genFemales = femeas.filter((f) => {
          if (!f.birth_date) return false
          const y = new Date(f.birth_date).getFullYear()
          if (gen.year) return y === gen.year
          // Agrupado
          const recentYears = generations.filter((g) => g.year != null).map((g) => g.year!)
          return !recentYears.includes(y)
        })

        if (genFemales.length === 0) return

        // Para cada touro do grupo
        group.bulls.forEach((bull) => {
          const effectivePct = totalPct > 0 ? bull.pct / totalPct : 1 / group.bulls.length
          const count = Math.round(genFemales.length * effectivePct)

          const bullData = bullTraitsMap.get(bull.code)
          const values = {} as Record<NexusTrait, number>
          NEXUS_TRAITS.forEach((trait) => {
            const femaleVals = genFemales.map((f) => getTraitValue(f, trait)).filter((v): v is number => v != null)
            const avgFemale = femaleVals.length > 0 ? femaleVals.reduce((a, b) => a + b, 0) / femaleVals.length : 0
            const bullVal = bullData ? getBullTraitValue(bullData, trait) ?? 0 : 0
            // Predição: ((média_mãe + PTA_touro) / 2) * 0.92
            values[trait] = ((avgFemale + bullVal) / 2) * 0.92
          })

          results.push({
            generation: genLabel,
            bull: bull.name ?? bull.code,
            bullCode: bull.code,
            pct: Math.round(effectivePct * 100),
            count,
            values,
          })
        })
      })
    })

    setPredictions(results)
    setShowResults(true)
  }

  // ── KPIs ──
  const totalFemeas = femalesData?.total ?? femeas.length
  const femeasCarregadas = femeas.length
  const totalGenerations = generations.length
  const femeasNasGeracoes = generations.reduce((s, g) => s + g.count, 0)
  const bestHhp = useMemo(() => {
    if (predictions.length === 0) return '—'
    const max = Math.max(...predictions.map((p) => p.values['HHP+']))
    return isFinite(max) ? Math.round(max).toString() : '—'
  }, [predictions])

  // ── Export ──
  const exportExcel = () => {
    if (predictions.length === 0) return
    const rows = predictions.map((p) => {
      const row: Record<string, string | number> = { Geração: p.generation, Touro: p.bull, NAAB: p.bullCode, '%': p.pct, 'Fêmeas': p.count }
      NEXUS_TRAITS.forEach((t) => { row[t] = Number(formatTrait(t, p.values[t])) })
      return row
    })
    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.json_to_sheet(rows)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Predições Nexus 3')
      writeFile(wb, `nexus3-acasalamento-${new Date().toISOString().split('T')[0]}.xlsx`)
    })
  }

  return (
    <div>
      {/* KPIs */}
      <div className="ss-grid-kpis">
        <KpiCard icon={TrendingUp} label="Fêmeas no Banco" value={loadingFemales ? '...' : totalFemeas} delta={`${femeasCarregadas} carregadas · ${femeasNasGeracoes} com geração`} />
        <KpiCard icon={BarChart3} label="Gerações" value={totalGenerations} delta="anos identificados" />
        <KpiCard icon={TrendingUp} label="Touros no Botijão" value={touros.length} delta="disponíveis" />
        <KpiCard icon={TrendingUp} label="Melhor HHP+ (filhas)" value={bestHhp} delta="predição" />
      </div>

      {/* ── Tabela de Gerações ── */}
      <div className="ss-card mb-3.5">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Médias por Geração</h3>
          <span className="ss-mono text-[11px] text-[var(--ss-muted)]">{femeasNasGeracoes} fêmeas com geração · {totalGenerations} gerações · {totalFemeas} total no banco</span>
        </div>
        <div className="ss-card-body">
          {loadingFemales ? (
            <p className="py-6 text-center text-[12px] text-[var(--ss-muted)]">Carregando dados...</p>
          ) : generations.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[var(--ss-muted)]">Nenhuma fêmea com data de nascimento no banco.</p>
          ) : (
            <div className="relative overflow-hidden rounded-lg border border-[var(--ss-border)]">
              <div className="overflow-x-auto">
                <table className="ss-table" style={{ minWidth: NEXUS_TRAITS.length * 90 + 140 }}>
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-[var(--ss-card)] min-w-[120px] border-r border-[var(--ss-border)]">Geração</th>
                      {NEXUS_TRAITS.map((t) => <th key={t} className="text-center whitespace-nowrap">{t}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {generations.map((gen) => (
                      <tr key={gen.label}>
                        <td className="sticky left-0 z-10 bg-[var(--ss-card)] border-r border-[var(--ss-border)]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--ss-fg)]">{gen.label}</span>
                            <span className="text-[10px] text-[var(--ss-muted)]">({gen.count})</span>
                          </div>
                        </td>
                        {NEXUS_TRAITS.map((t) => (
                          <td key={t} className="ss-mono text-center">
                            {gen.averages[t] != null ? formatTrait(t, gen.averages[t]!) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Plano de Acasalamento ── */}
      <div className="ss-card mb-3.5">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Plano de Acasalamento</h3>
          <button className="ss-button ss-button-sm" onClick={addMatingGroup}><Plus className="h-3.5 w-3.5" />Novo Grupo</button>
        </div>
        <div className="ss-card-body">
          {matingGroups.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-[var(--ss-muted)]">Crie grupos de acasalamento para simular predições.</p>
              <p className="mt-1 text-[11px] text-[var(--ss-muted-2)]">Cada grupo associa touros do botijão a gerações específicas com percentuais de uso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matingGroups.map((group, idx) => (
                <div key={group.id} className="rounded-xl border border-[var(--ss-border)] bg-[var(--ss-wash)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[var(--ss-fg)]">Grupo {idx + 1}</span>
                    <button onClick={() => removeMatingGroup(group.id)} className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)] text-[var(--ss-primary)] hover:bg-[var(--ss-primary-soft)]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>

                  {/* Gerações */}
                  <div className="mb-3">
                    <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--ss-muted)]">Gerações (mães)</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {generations.map((gen) => {
                        const active = group.generations.includes(gen.label)
                        return (
                          <button
                            key={gen.label}
                            type="button"
                            onClick={() => toggleGeneration(group.id, gen.label)}
                            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${active ? 'bg-[var(--ss-primary)] text-white' : 'border border-[var(--ss-border)] bg-[var(--ss-card)] text-[var(--ss-muted)] hover:border-[var(--ss-primary)]'}`}
                          >
                            {gen.label} <span className="opacity-60">({gen.count})</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Touros */}
                  <div>
                    <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--ss-muted)]">Touros & Percentual</Label>
                    {group.bulls.length > 0 && (
                      <div className="mb-2 space-y-1.5">
                        {group.bulls.map((bull) => (
                          <div key={bull.code} className="flex items-center gap-2 rounded-md border border-[var(--ss-border)] bg-[var(--ss-card)] px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[12px] font-semibold text-[var(--ss-fg)]">{bull.name ?? bull.code}</span>
                              <span className="ml-2 font-mono text-[10px] text-[var(--ss-muted)]">{bull.code}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                value={bull.pct}
                                onChange={(e) => setBullPct(group.id, bull.code, Number(e.target.value) || 1)}
                                className="h-7 w-16 text-center text-[12px]"
                              />
                              <span className="text-[11px] text-[var(--ss-muted)]">%</span>
                            </div>
                            <button onClick={() => removeBullFromGroup(group.id, bull.code)} className="text-[var(--ss-primary)] hover:text-[var(--ss-primary-bright)]"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Seletor de touros */}
                    <div className="flex flex-wrap gap-1.5">
                      {touros.filter((t) => !group.bulls.find((b) => b.code === t.code)).map((t) => (
                        <button
                          key={t.code}
                          type="button"
                          onClick={() => addBullToGroup(group.id, t)}
                          className="rounded-md border border-dashed border-[var(--ss-border)] px-2.5 py-1 text-[11px] text-[var(--ss-muted)] transition hover:border-[var(--ss-primary)] hover:text-[var(--ss-primary)]"
                        >
                          <Plus className="mr-1 inline h-3 w-3" />{t.name ?? t.code}
                        </button>
                      ))}
                      {touros.length === 0 && <span className="text-[11px] text-[var(--ss-muted)]">Adicione touros no Botijão Virtual primeiro.</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botão calcular */}
          {matingGroups.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={calcularPredicoes}
                disabled={matingGroups.every((g) => g.bulls.length === 0 || g.generations.length === 0)}
                className="bg-[var(--ss-primary)] text-white hover:bg-[var(--ss-primary-bright)]"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Simular Acasalamento
              </Button>
              <span className="text-[11px] text-[var(--ss-muted)]">
                {matingGroups.reduce((s, g) => s + g.bulls.length, 0)} touros · {matingGroups.reduce((s, g) => s + g.generations.length, 0)} gerações selecionadas
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Resultados (Gráficos) ── */}
      {showResults && predictions.length > 0 && (
        <div className="ss-card mb-3.5">
          <div className="ss-card-header">
            <h3 className="ss-card-title">Predição de Progênie (Filhas)</h3>
            <Button variant="outline" size="sm" onClick={exportExcel}><Download className="mr-2 h-3.5 w-3.5" />Exportar Excel</Button>
          </div>
          <div className="ss-card-body">
            <div className="mb-4 flex justify-end">
              <Button onClick={calcularPredicoes} size="sm" className="bg-[var(--ss-primary)] text-white hover:bg-[var(--ss-primary-bright)]">
                <TrendingUp className="mr-2 h-3.5 w-3.5" />Recalcular
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {NEXUS_TRAITS.map((trait) => {
                const isCCS = trait === 'CCS'
                // Montar dados do gráfico: eixo X da geração mais velha → mais nova
                const genLabels = Array.from(new Set(predictions.map((p) => p.generation))).sort((a, b) => {
                  const ya = a.startsWith('≤') ? Number(a.slice(1)) - 1 : Number(a)
                  const yb = b.startsWith('≤') ? Number(b.slice(1)) - 1 : Number(b)
                  return ya - yb
                })
                const chartData = genLabels.map((gen) => {
                  const genData = generations.find((g) => g.label === gen)
                  const motherVal = genData?.averages[trait] ?? null
                  const genPreds = predictions.filter((p) => p.generation === gen)
                  const totalCount = genPreds.reduce((s, p) => s + p.count, 0)
                  const daughterVal = totalCount > 0
                    ? genPreds.reduce((s, p) => s + p.values[trait] * p.count, 0) / totalCount
                    : null
                  return { generation: gen, Mães: motherVal, Filhas: daughterVal }
                })

                // Média geral das mães (para linha de referência)
                const motherVals = chartData.map((d) => d.Mães).filter((v): v is number => v != null)
                const avgMother = motherVals.length > 0 ? motherVals.reduce((a, b) => a + b, 0) / motherVals.length : 0

                // Calcular domínio Y com margem para melhor escala
                const allVals = chartData.flatMap((d) => [d.Mães, d.Filhas]).filter((v): v is number => v != null)
                const minVal = allVals.length > 0 ? Math.min(...allVals) : 0
                const maxVal = allVals.length > 0 ? Math.max(...allVals) : 0
                const padding = (maxVal - minVal) * 0.15 || Math.abs(maxVal) * 0.1 || 1
                const yDomain: [number, number] = isCCS
                  ? [maxVal + padding, minVal - padding]  // CCS invertido (menor = melhor)
                  : [minVal - padding, maxVal + padding]

                const isInteger = ['HHP+', 'HHP$', 'TPI', 'ML$', 'Leite lbs', 'Gordura lbs', 'Proteína lbs', 'CFP'].includes(trait)
                const tickFormatter = (v: number) => isInteger ? Math.round(v).toString() : v.toFixed(2)

                return (
                  <div key={trait} className="rounded-xl border border-[var(--ss-border)] bg-[var(--ss-card)] p-4">
                    <h4 className="mb-3 text-[13px] font-bold text-[var(--ss-fg)]">
                      {trait}
                      {isCCS && <span className="ml-1.5 text-[10px] font-normal text-[var(--ss-muted)]">(menor = melhor)</span>}
                    </h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--ss-border)" />
                        <XAxis dataKey="generation" tick={{ fontSize: 11 }} />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          domain={yDomain}
                          tickCount={7}
                          tickFormatter={tickFormatter}
                          reversed={isCCS}
                          allowDataOverflow
                        />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          formatter={(value) => formatTrait(trait, Number(value))}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <ReferenceLine
                          y={avgMother}
                          stroke="#3b82f6"
                          strokeDasharray="6 6"
                          label={{ value: `Média ${formatTrait(trait, avgMother)}`, position: 'right', fontSize: 10, fill: '#3b82f6' }}
                        />
                        <Line type="monotone" dataKey="Mães" stroke="#1a1a1a" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                        <Line type="monotone" dataKey="Filhas" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-[var(--ss-muted)]">
              <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-[#1a1a1a]" /> Mães (média por geração)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-[#dc2626]" /> Filhas (predição)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#3b82f6]" /> Média geral</span>
              <span>Fórmula: ((mãe + touro) / 2) × 0.92</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
