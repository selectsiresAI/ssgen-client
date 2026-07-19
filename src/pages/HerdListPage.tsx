import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFemalesFull } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { useBreed } from '@/lib/breed'
import { fmt } from '@/lib/traits'

const CATEGORIES = [
  { key: 'Bezerra', label: 'Bezerras', color: '#f59e0b' },
  { key: 'Novilha', label: 'Novilhas', color: '#10b981' },
  { key: 'Primípara', label: 'Primíparas', color: '#3b82f6' },
  { key: 'Secundípara', label: 'Secundíparas', color: '#8b5cf6' },
  { key: 'Multípara', label: 'Multíparas', color: '#ef4444' },
] as const

const herdCols: { key: string; label: string; mono?: boolean; role?: 'index' | 'udder' }[] = [
  { key: 'ear_tag', label: 'Brinco', mono: true },
  { key: 'name', label: 'Nome' },
  { key: 'cdcb_id', label: 'CDCB', mono: true },
  { key: 'category', label: 'Categoria' },
  { key: 'birth_date', label: 'Nascimento', mono: true },
  { key: 'sire_naab', label: 'Pai', mono: true },
  { key: 'mgs_naab', label: 'MGS', mono: true },
  { key: 'mmgs_naab', label: 'MMGS', mono: true },
  { key: 'hhp_dollar', label: 'HHP$', mono: true },
  { key: 'tpi', label: 'GTPI', mono: true, role: 'index' },
  { key: 'nm_dollar', label: 'NM$', mono: true },
  { key: 'cm_dollar', label: 'CM$', mono: true },
  { key: 'fm_dollar', label: 'FM$', mono: true },
  { key: 'gm_dollar', label: 'GM$', mono: true },
  { key: 'ptam', label: 'Leite', mono: true },
  { key: 'ptaf', label: 'Gordura', mono: true },
  { key: 'ptaf_pct', label: 'Gord%', mono: true },
  { key: 'ptap', label: 'Proteína', mono: true },
  { key: 'ptap_pct', label: 'Prot%', mono: true },
  { key: 'cfp', label: 'CFP', mono: true },
  { key: 'f_sav', label: 'F.Sav', mono: true },
  { key: 'rfi', label: 'RFI', mono: true },
  { key: 'pl', label: 'PL', mono: true },
  { key: 'scs', label: 'SCS', mono: true },
  { key: 'dpr', label: 'DPR', mono: true },
  { key: 'hcr', label: 'HCR', mono: true },
  { key: 'ccr', label: 'CCR', mono: true },
  { key: 'liv', label: 'LIV', mono: true },
  { key: 'h_liv', label: 'H.LIV', mono: true },
  { key: 'fi', label: 'FI', mono: true },
  { key: 'gl', label: 'GL', mono: true },
  { key: 'efc', label: 'EFC', mono: true },
  { key: 'sce', label: 'SCE', mono: true },
  { key: 'dce', label: 'DCE', mono: true },
  { key: 'ssb', label: 'SSB', mono: true },
  { key: 'dsb', label: 'DSB', mono: true },
  { key: 'ptat', label: 'Tipo', mono: true },
  { key: 'udc', label: 'UDC', mono: true, role: 'udder' },
  { key: 'flc', label: 'FLC', mono: true },
  { key: 'sta', label: 'STA', mono: true },
  { key: 'str', label: 'STR', mono: true },
  { key: 'dfm', label: 'DFM', mono: true },
  { key: 'bwc', label: 'BWC', mono: true },
  { key: 'rua', label: 'RUA', mono: true },
  { key: 'rw', label: 'RW', mono: true },
  { key: 'rls', label: 'RLS', mono: true },
  { key: 'rlr', label: 'RLR', mono: true },
  { key: 'fta', label: 'FTA', mono: true },
  { key: 'fls', label: 'FLS', mono: true },
  { key: 'fua', label: 'FUA', mono: true },
  { key: 'ruh', label: 'RUH', mono: true },
  { key: 'ruw', label: 'RUW', mono: true },
  { key: 'ucl', label: 'UCL', mono: true },
  { key: 'udp', label: 'UDP', mono: true },
  { key: 'ftp', label: 'FTP', mono: true },
  { key: 'rtp', label: 'RTP', mono: true },
  { key: 'ftl', label: 'FTL', mono: true },
  { key: 'mast', label: 'MAST', mono: true },
  { key: 'met', label: 'MET', mono: true },
  { key: 'rp', label: 'RP', mono: true },
  { key: 'da', label: 'DA', mono: true },
  { key: 'ket', label: 'KET', mono: true },
  { key: 'mf', label: 'MF', mono: true },
  { key: 'gfi', label: 'GFI', mono: true },
]

function fmtCell(key: string, val: unknown): string {
  if (val == null) return '—'
  if (key === 'birth_date') return new Date(String(val)).toLocaleDateString('pt-BR')
  if (typeof val === 'number') return fmt(traitKeyForColumn(key), val)
  return String(val)
}

function traitKeyForColumn(key: string): string {
  const map: Record<string, string> = {
    hhp_dollar: 'hhp',
    tpi: 'gtpi',
    nm_dollar: 'nm',
    cm_dollar: 'cm',
    fm_dollar: 'fm',
    gm_dollar: 'gm',
    ptam: 'milk',
    ptaf: 'fat',
    ptaf_pct: 'fat_pct',
    ptap: 'prot',
    ptap_pct: 'prot_pct',
    f_sav: 'fsav',
    h_liv: 'hliv',
  }
  return map[key] ?? key
}

type SortDir = 'asc' | 'desc' | null

export function HerdListPage() {
  const [herdPage, setHerdPage] = useState(1)
  const [herdSearch, setHerdSearch] = useState('')
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { indexKey, indexLabel, udderKey, udderLabel, traitLabels } = useBreed()
  const { data: femalesData } = useFemalesFull({ page: herdPage, perPage: 5000, search: herdSearch })
  const allFemales = femalesData?.data ?? []
  const totalFemales = femalesData?.total ?? 0

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    CATEGORIES.forEach((c) => { counts[c.key] = 0 })
    allFemales.forEach((f) => {
      const cat = f.category ?? ''
      if (cat in counts) counts[cat]++
    })
    return counts
  }, [allFemales])

  // Filtrar por categoria selecionada e busca
  const filteredFemales = useMemo(() => {
    let result = allFemales
    if (selectedCategory) result = result.filter((f) => f.category === selectedCategory)
    return result
  }, [allFemales, selectedCategory])

  const totalFiltered = filteredFemales.length
  const rawFemales = filteredFemales   // sem paginação — cliente rola por todos

  const columns = useMemo(() => herdCols.map((col) => {
    if (col.role === 'index') return { ...col, key: indexKey, label: indexLabel }
    if (col.role === 'udder') return { ...col, key: udderKey, label: udderLabel }
    return col
  }), [indexKey, indexLabel, udderKey, udderLabel])

  const females = useMemo(() => {
    if (!sortCol || !sortDir) return rawFemales
    return [...rawFemales].sort((a, b) => {
      const av = a[sortCol]
      const bv = b[sortCol]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rawFemales, sortCol, sortDir])

  const toggleSort = (key: string) => {
    if (sortCol !== key) { setSortCol(key); setSortDir('desc') }
    else if (sortDir === 'desc') setSortDir('asc')
    else { setSortCol(null); setSortDir(null) }
  }

  const exportFemales = async () => {
    const result = await api.getFemalesFull({ per_page: '9999' })
    const { utils, writeFile } = await import('xlsx')
    const headers = columns.map((c) => traitLabels[traitKeyForColumn(String(c.key))] ?? c.label)
    const rows = (result.data ?? []).map((f) => columns.map((c) => f[c.key] ?? ''))
    const ws = utils.aoa_to_sheet([headers, ...rows])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Rebanho')
    writeFile(wb, `rebanho-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div>
      {/* Cards de Categorias */}
      <div className="grid grid-cols-5 gap-2 mb-3.5">
        {CATEGORIES.map((cat) => {
          const n = categoryCounts[cat.key] ?? 0
          const pct = totalFemales > 0 ? ((n / totalFemales) * 100).toFixed(1) : '0.0'
          const active = selectedCategory === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => { setSelectedCategory(active ? null : cat.key); setHerdPage(1) }}
              className={`ss-card cursor-pointer transition-all ${active ? 'ring-2 ring-[var(--ss-primary)]' : 'hover:shadow-md'}`}
            >
              <div className="px-3 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ss-muted)]">{cat.label}</p>
                <p className="text-[18px] font-bold leading-tight text-[var(--ss-fg)]">{n}</p>
                <p className="text-[10px] text-[var(--ss-muted)]">{pct}%</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">
            {selectedCategory ? `${CATEGORIES.find((c) => c.key === selectedCategory)?.label} · ${totalFiltered} fêmeas` : `Rebanho completo · ${totalFemales || '—'} fêmeas`}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex w-[230px] items-center gap-2 rounded-[8px] border border-[var(--ss-border)] bg-white px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-[var(--ss-muted)]" />
              <input value={herdSearch} onChange={(e) => { setHerdSearch(e.target.value); setHerdPage(1) }} placeholder="Buscar fêmea..." className="w-full border-0 bg-transparent text-[12px] outline-none" />
            </div>
            <button className="ss-button ss-button-ghost ss-button-sm" type="button" onClick={() => void exportFemales()}><Download />Exportar XLSX</button>
          </div>
        </div>
        <div className="ss-herd-scroll overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <table className="ss-table ss-table-herd">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} onClick={() => toggleSort(String(c.key))} className="cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">
                      {traitLabels[traitKeyForColumn(String(c.key))] ?? c.label}
                      {sortCol === String(c.key) ? (sortDir === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {females.length > 0 ? females.map((f) => (
                <tr key={f.id}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.mono ? 'ss-mono' : ''}>{fmtCell(String(c.key), f[c.key])}</td>
                  ))}
                </tr>
              )) : (
                <tr><td colSpan={columns.length} className="text-center text-[var(--ss-muted)]">Nenhuma fêmea encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

