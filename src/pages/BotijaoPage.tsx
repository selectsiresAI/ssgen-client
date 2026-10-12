import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Download, Droplets, Edit, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KpiCard } from '@/components/KpiCard'
import { BotijaoTankPanel } from '@/components/BotijaoTankPanel'
import { useSemenInventory, useBotijaoData, useSaveBotijao, useSearchBulls } from '@/hooks/useApi'
import type { BullSemen, PlatformBull } from '@/lib/api'
import { useI18n } from '@/i18n'

// ── Cryogenic Tank Icon ──

function CryoIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V2z" />
      <rect x="6" y="6" width="12" height="14" rx="3" />
      <path d="M6 20h12v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1z" />
      <path d="M10 6v2m4-2v2" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  )
}

// ── Types ──

interface Botijao {
  id: string
  nome: string
  canecas: number
  capacidadeLitros: number
}

interface BotijaoItem {
  id: string
  touro: BullSemen
  tipo: 'Convencional' | 'Sexado'
  doses: number
  preco: number
  caneca: number
  botijaoId: string
  dataAdicao: string
  observacoes: string
}

interface NitrogenRecord {
  id: string
  dataAbastecimento: string
  volume: number
  observacoes: string
}

export function BotijaoPage() {
  const { t, formatDate, formatNumber } = useI18n()
  const { data: bullsData } = useSemenInventory({})
  const allBulls = bullsData?.data ?? []
  const { data: remoteData, isLoading: loadingRemote } = useBotijaoData()
  const { mutateAsync: saveBotijaoApi } = useSaveBotijao()
  const [itens, setItens] = useState<BotijaoItem[]>([])
  const [botijoes, setBotijoes] = useState<Botijao[]>([])
  const [nitrogenRecords, setNitrogenRecords] = useState<NitrogenRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showStockUpdate, setShowStockUpdate] = useState(false)
  const [showNitrogen, setShowNitrogen] = useState(false)
  const [showCreateBotijao, setShowCreateBotijao] = useState(false)
  const [editingNitrogenId, setEditingNitrogenId] = useState<string | null>(null)
  const [addBullSearch, setAddBullSearch] = useState('')
  const [addSelectedBull, setAddSelectedBull] = useState<BullSemen | null>(null)
  const [addTipo, setAddTipo] = useState<'Convencional' | 'Sexado'>('Convencional')
  const [addDoses, setAddDoses] = useState(1)
  const [addPreco, setAddPreco] = useState(0)
  const [addCaneca, setAddCaneca] = useState(1)
  const [addBotijaoId, setAddBotijaoId] = useState('')
  const [addObs, setAddObs] = useState('')
  const [editItem, setEditItem] = useState<BotijaoItem | null>(null)
  const [stockTouroId, setStockTouroId] = useState('')
  const [stockDoses, setStockDoses] = useState(1)
  const [stockTecnico, setStockTecnico] = useState('')
  const [nitroData, setNitroData] = useState(new Date().toISOString().split('T')[0])
  const [nitroVolume, setNitroVolume] = useState(0)
  const [nitroObs, setNitroObs] = useState('')
  const [newBtjNome, setNewBtjNome] = useState('')
  const [newBtjCanecas, setNewBtjCanecas] = useState(6)
  const [newBtjLitros, setNewBtjLitros] = useState(35)
  const [activeBotijao, setActiveBotijao] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from Supabase (primary) or localStorage (fallback)
  useEffect(() => {
    if (hydrated) return
    if (remoteData && !loadingRemote) {
      setBotijoes(remoteData.botijoes.map((b) => ({ id: b.id, nome: b.nome, canecas: b.canecas, capacidadeLitros: Number(b.capacidade_litros) })))
      setItens(remoteData.itens.map((i) => ({ id: i.id, touro: { code: i.touro_code, name: i.touro_name, registration: null, breed: i.touro_breed, daughters_count: 0 }, tipo: i.tipo as 'Convencional' | 'Sexado', doses: i.doses, preco: Number(i.preco), caneca: i.caneca, botijaoId: i.botijao_id, dataAdicao: i.created_at, observacoes: i.observacoes })))
      setNitrogenRecords(remoteData.nitrogen.map((n) => ({ id: n.id, dataAbastecimento: n.data_abastecimento, volume: Number(n.volume), observacoes: n.observacoes })))
      setHydrated(true)
    } else if (!loadingRemote) {
      setItens([])
      setBotijoes([])
      setNitrogenRecords([])
      setHydrated(true)
    }
  }, [remoteData, loadingRemote, hydrated])

  // Keep localStorage as secondary cache
  useEffect(() => { if (hydrated) localStorage.setItem('botijao-ssgen-v2', JSON.stringify({ itens, botijoes })) }, [itens, botijoes, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem('nitrogen-ssgen', JSON.stringify(nitrogenRecords)) }, [nitrogenRecords, hydrated])

  // Helper: fire-and-forget save to API
  const saveToApi = useCallback((action: Parameters<typeof saveBotijaoApi>[0]) => { saveBotijaoApi(action).catch(() => { /* silent — localStorage is backup */ }) }, [saveBotijaoApi])

  // Search platform bulls (298k records)
  const { data: platformResults, isLoading: searchingBulls } = useSearchBulls(addBullSearch.trim())
  const filteredBulls: BullSemen[] = useMemo(() => {
    // If platform search returned results, map them to BullSemen shape
    if (platformResults?.data && platformResults.data.length > 0) {
      return platformResults.data.map((b: PlatformBull) => ({
        code: b.code,
        name: b.name,
        registration: b.registration,
        breed: b.company,
        daughters_count: 0,
      }))
    }
    // Fallback to local semen inventory
    const source = allBulls
    if (!addBullSearch) return source.slice(0, 30)
    const q = addBullSearch.trim().toLowerCase()
    return source.filter((b) => {
      const code = b.code.toLowerCase()
      const name = (b.name ?? '').toLowerCase()
      return code.includes(q) || name.includes(q)
    }).slice(0, 30)
  }, [allBulls, addBullSearch, platformResults])

  const stats = useMemo(() => {
    const total = itens.reduce((s, i) => s + i.doses, 0)
    const totalTouros = new Set(itens.map((i) => i.touro.code)).size
    const racas = new Set(itens.map((i) => i.touro.breed).filter(Boolean)).size
    const reservadas = itens.filter((i) => i.observacoes?.toLowerCase().includes('protocolo') || i.observacoes?.toLowerCase().includes('reserv')).reduce((s, i) => s + i.doses, 0)
    return { total, totalTouros, racas, reservadas }
  }, [itens])

  // Items filtered by active botijão
  const filteredItens = useMemo(() => {
    let items = activeBotijao ? itens.filter((i) => i.botijaoId === activeBotijao) : itens
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      items = items.filter((i) => i.touro.name?.toLowerCase().includes(lower) || i.touro.code.toLowerCase().includes(lower))
    }
    if (!sortField) return items
    return [...items].sort((a, b) => {
      if (sortField === 'doses') return sortDirection === 'asc' ? a.doses - b.doses : b.doses - a.doses
      if (sortField === 'preco') return sortDirection === 'asc' ? a.preco - b.preco : b.preco - a.preco
      const av = sortField === 'tipo' ? a.tipo : (a.touro.name ?? '')
      const bv = sortField === 'tipo' ? b.tipo : (b.touro.name ?? '')
      return sortDirection === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [itens, activeBotijao, searchTerm, sortField, sortDirection])

  // Stats per botijão for the list
  const botijaoStats = useMemo(() => {
    const map = new Map<string, { doses: number; canecasOcupadas: number }>()
    for (const btj of botijoes) {
      const btjItens = itens.filter((i) => i.botijaoId === btj.id)
      const doses = btjItens.reduce((s, i) => s + i.doses, 0)
      const canecasOcupadas = new Set(btjItens.map((i) => i.caneca)).size
      map.set(btj.id, { doses, canecasOcupadas })
    }
    return map
  }, [itens, botijoes])

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const resetAddForm = () => { setAddBullSearch(''); setAddSelectedBull(null); setAddTipo('Convencional'); setAddDoses(1); setAddPreco(0); setAddCaneca(1); setAddBotijaoId(botijoes[0]?.id ?? ''); setAddObs('') }
  const addItem = () => {
    if (!addSelectedBull) return
    const tempId = `${addSelectedBull.code}-${Date.now()}-${Math.random()}`
    const botId = addBotijaoId || botijoes[0]?.id || ''
    setItens((prev) => [...prev, { id: tempId, touro: addSelectedBull, tipo: addTipo, doses: addDoses, preco: addPreco, caneca: addCaneca, botijaoId: botId, dataAdicao: new Date().toISOString(), observacoes: addObs }])
    saveToApi({ action: 'upsert_item', item: { botijao_id: botId, touro_code: addSelectedBull.code, touro_name: addSelectedBull.name ?? undefined, touro_breed: addSelectedBull.breed ?? undefined, tipo: addTipo, doses: addDoses, preco: addPreco, caneca: addCaneca, observacoes: addObs } })
    resetAddForm(); setShowAdd(false)
  }
  const startEdit = (item: BotijaoItem) => { setEditItem({ ...item }); setShowEdit(true) }
  const saveEdit = () => {
    if (!editItem) return
    setItens((prev) => prev.map((i) => i.id === editItem.id ? editItem : i))
    saveToApi({ action: 'upsert_item', item: { id: editItem.id, botijao_id: editItem.botijaoId, touro_code: editItem.touro.code, touro_name: editItem.touro.name ?? undefined, touro_breed: editItem.touro.breed ?? undefined, tipo: editItem.tipo, doses: editItem.doses, preco: editItem.preco, caneca: editItem.caneca, observacoes: editItem.observacoes } })
    setEditItem(null); setShowEdit(false)
  }
  const removeItem = (id: string) => { setItens((prev) => prev.filter((i) => i.id !== id)); saveToApi({ action: 'delete_item', id }) }
  const duplicateItem = (item: BotijaoItem) => {
    const tempId = `${item.touro.code}-${Date.now()}-${Math.random()}`
    setItens((prev) => [...prev, { ...item, id: tempId, dataAdicao: new Date().toISOString() }])
    saveToApi({ action: 'upsert_item', item: { botijao_id: item.botijaoId, touro_code: item.touro.code, touro_name: item.touro.name ?? undefined, touro_breed: item.touro.breed ?? undefined, tipo: item.tipo, doses: item.doses, preco: item.preco, caneca: item.caneca, observacoes: item.observacoes } })
  }
  const applyStockUpdate = () => {
    if (!stockTouroId || !stockTecnico) return
    const target = itens.find((i) => i.id === stockTouroId)
    const newDoses = Math.max(0, (target?.doses ?? 0) - stockDoses)
    setItens((prev) => prev.map((i) => i.id === stockTouroId ? { ...i, doses: newDoses } : i))
    if (target) saveToApi({ action: 'upsert_item', item: { id: target.id, botijao_id: target.botijaoId, touro_code: target.touro.code, touro_name: target.touro.name ?? undefined, touro_breed: target.touro.breed ?? undefined, tipo: target.tipo, doses: newDoses, preco: target.preco, caneca: target.caneca, observacoes: target.observacoes } })
    setStockTouroId(''); setStockDoses(1); setStockTecnico(''); setShowStockUpdate(false)
  }
  const addNitrogen = () => {
    setNitrogenRecords((prev) => [...prev, { id: `n-${Date.now()}-${Math.random()}`, dataAbastecimento: nitroData, volume: nitroVolume, observacoes: nitroObs }])
    saveToApi({ action: 'add_nitrogen', nitrogen: { data_abastecimento: nitroData, volume: nitroVolume, observacoes: nitroObs } })
    setNitroData(new Date().toISOString().split('T')[0]); setNitroVolume(0); setNitroObs(''); setShowNitrogen(false)
  }
  const saveNitrogenEdit = (id: string, updates: Partial<NitrogenRecord>) => { setNitrogenRecords((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r)); setEditingNitrogenId(null) }
  const createBotijao = () => {
    if (!newBtjNome.trim()) return
    const tempId = `btj-${Date.now()}`
    setBotijoes((prev) => [...prev, { id: tempId, nome: newBtjNome.trim(), canecas: newBtjCanecas, capacidadeLitros: newBtjLitros }])
    saveToApi({ action: 'upsert_botijao', botijao: { nome: newBtjNome.trim(), canecas: newBtjCanecas, capacidade_litros: newBtjLitros } })
    setNewBtjNome(''); setNewBtjCanecas(6); setNewBtjLitros(35); setShowCreateBotijao(false)
  }

  const exportExcel = () => {
    import('xlsx').then(({ utils, writeFile }) => {
      const headers = ['NAAB', t('botijao.name'), t('botijao.type'), t('botijao.cup'), t('botijao.tank'), t('botijao.doses'), t('botijao.price'), t('botijao.date'), t('botijao.notes')]
      const rows = itens.map((i) => [i.touro.code, i.touro.name ?? '', i.tipo, i.caneca, botijoes.find((b) => b.id === i.botijaoId)?.nome ?? '', i.doses, i.preco.toFixed(2), i.dataAdicao, i.observacoes])
      const ws = utils.aoa_to_sheet([headers, ...rows])
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, t('botijao.sheetName'))
      writeFile(wb, `botijao-virtual-${new Date().toISOString().split('T')[0]}.xlsx`)
    })
  }

  return (
    <div>
      {/* KPI Cards */}
      <div className="ss-grid-kpis">
        <KpiCard icon={Droplets} label={t('botijao.dosesInStock')} value={formatNumber(stats.total)} delta={t('botijao.strawsAvailable')} />
        <KpiCard icon={Droplets} label={t('botijao.distinctBulls')} value={stats.totalTouros} delta={t('botijao.breeds', { count: stats.racas })} />
        <KpiCard icon={Droplets} label={t('botijao.activeTanks')} value={botijoes.length} delta={t('botijao.monitoredUnits')} />
        <KpiCard icon={Droplets} label={t('botijao.reserved')} value={stats.reservadas} delta={t('botijao.protocolInProgress')} />
      </div>

      {/* Botijões List */}
      <div className="ss-card mb-3.5">
        <div className="ss-card-header">
          <h3 className="ss-card-title flex items-center gap-2"><CryoIcon className="h-4 w-4 text-[var(--ss-primary)]" />{t('botijao.tanks')}</h3>
          <button className="ss-button ss-button-sm" onClick={() => setShowCreateBotijao(true)}><Plus className="h-3.5 w-3.5" />{t('botijao.createTank')}</button>
        </div>
        <div className="ss-card-body">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {botijoes.length > 0 ? botijoes.map((btj) => {
              const st = botijaoStats.get(btj.id)
              const isActive = activeBotijao === btj.id
              return (
                <button key={btj.id} type="button" onClick={() => setActiveBotijao(isActive ? null : btj.id)} className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${isActive ? 'border-[var(--ss-primary)] bg-[var(--ss-primary-soft)] shadow-[0_0_12px_rgba(185,28,28,.08)]' : 'border-[var(--ss-border)] bg-[var(--ss-wash)] hover:border-[var(--ss-muted-2)]'}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--ss-card)] border border-[var(--ss-border)]">
                    <CryoIcon className={`h-5 w-5 ${isActive ? 'text-[var(--ss-primary)]' : 'text-[var(--ss-muted)]'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-[var(--ss-fg)]">{btj.nome}</div>
                    <div className="font-mono text-[11px] text-[var(--ss-muted)]">{t('botijao.dosesCupsLiters', { doses: st?.doses ?? 0, cups: st?.canecasOcupadas ?? 0, totalCups: btj.canecas, liters: btj.capacidadeLitros })}</div>
                  </div>
                </button>
              )
            }) : <div className="col-span-full rounded-[10px] border border-[var(--ss-border)] bg-[var(--ss-wash)] p-5 text-center text-[12px] text-[var(--ss-muted)]">{t('botijao.noTankRegistered')}</div>}
          </div>
          {activeBotijao && <div className="mt-2 text-[11px] text-[var(--ss-muted)]">{t('botijao.filteringBy')} <b className="text-[var(--ss-fg)]">{botijoes.find((b) => b.id === activeBotijao)?.nome}</b> · <button type="button" className="text-[var(--ss-primary)] underline" onClick={() => setActiveBotijao(null)}>{t('botijao.viewAll')}</button></div>}
        </div>
      </div>

      {/* Tank Panel */}
      <BotijaoTankPanel
        items={filteredItens}
        totalDoses={activeBotijao ? (botijaoStats.get(activeBotijao)?.doses ?? 0) : stats.total}
        totalCanecas={activeBotijao ? (botijoes.find((b) => b.id === activeBotijao)?.canecas ?? 6) : 6}
      />

      {/* Search + Add */}
      <div className="ss-card mb-3.5">
        <div className="ss-card-header">
          <h3 className="ss-card-title">{t('botijao.addBulls')}</h3>
        </div>
        <div className="ss-card-body">
          <div className="mb-3 flex items-center gap-2">
            <Input placeholder={t('botijao.searchBulls')} value={addBullSearch} onChange={(e) => setAddBullSearch(e.target.value)} className="w-[420px]" />
            <span className="font-mono text-[11px] text-[var(--ss-muted)]">{searchingBulls ? t('botijao.searching') : t('botijao.results', { count: filteredBulls.length })}</span>
          </div>
          {addBullSearch && (
            <div className="max-h-[220px] overflow-auto rounded-md border border-[var(--ss-border)]">
              <table className="ss-table">
                <thead><tr><th>NAAB</th><th>{t('botijao.name')}</th><th>{t('botijao.company')}</th><th>{t('botijao.daughters')}</th><th></th></tr></thead>
                <tbody>
                  {filteredBulls.map((b) => (
                    <tr key={b.code}>
                      <td className="ss-mono">{b.code}</td>
                      <td>{b.name ?? '—'}</td>
                      <td>{b.breed ?? '—'}</td>
                      <td className="ss-mono">{b.daughters_count}</td>
                      <td><button className="ss-button ss-button-sm ss-button-ghost" onClick={() => { resetAddForm(); setAddSelectedBull(b); setAddBotijaoId(activeBotijao || botijoes[0]?.id || ''); setShowAdd(true) }}><Plus className="h-3.5 w-3.5" />{t('botijao.add')}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!addBullSearch && <p className="text-center text-[12px] text-[var(--ss-muted)]">{t('botijao.searchAtLeast')}</p>}
        </div>
      </div>

      {/* Stock Table */}
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title flex items-center gap-2"><CryoIcon className="h-4 w-4 text-[var(--ss-primary)]" />{t('botijao.tankStock')}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {nitrogenRecords.length > 0 && <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE6F2] bg-[#EAF4FA] px-3 py-1.5 font-mono text-[11.5px] text-[#2B6A8F]"><Droplets className="h-3.5 w-3.5" />N₂ {formatDate(nitrogenRecords[nitrogenRecords.length - 1].dataAbastecimento)}</span>}
            <button className="ss-button ss-button-ghost ss-button-sm" onClick={() => setShowNitrogen(true)}><Droplets className="h-3.5 w-3.5" />N₂</button>
            <button className="ss-button ss-button-ghost ss-button-sm" onClick={() => setShowStockUpdate(true)}><Upload className="h-3.5 w-3.5" />{t('botijao.use')}</button>
            <button className="ss-button ss-button-ghost ss-button-sm" onClick={exportExcel} disabled={itens.length === 0}><Download className="h-3.5 w-3.5" />{t('botijao.excel')}</button>
          </div>
        </div>
        <div className="p-3">
          <Input placeholder={t('botijao.searchBull')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-3 w-[300px]" />
          <div className="overflow-x-auto">
            <table className="ss-table">
              <thead><tr><th>NAAB</th><th onClick={() => handleSort('nome')} className="cursor-pointer">{t('botijao.name')}</th><th>{t('botijao.tank')}</th><th>{t('botijao.cup')}</th><th onClick={() => handleSort('tipo')} className="cursor-pointer">{t('botijao.type')}</th><th onClick={() => handleSort('doses')} className="cursor-pointer">{t('botijao.doses')}</th><th onClick={() => handleSort('preco')} className="cursor-pointer">{t('botijao.price')}</th><th>{t('botijao.actions')}</th></tr></thead>
              <tbody>{filteredItens.length > 0 ? filteredItens.map((i) => <tr key={i.id}><td className="ss-mono">{i.touro.code}</td><td>{i.touro.name ?? '-'}</td><td className="font-mono text-[11px] text-[var(--ss-muted)]">{botijoes.find((b) => b.id === i.botijaoId)?.nome ?? '-'}</td><td className="ss-mono">{i.caneca}</td><td><span className={i.tipo === 'Sexado' ? 'ss-badge-sex' : 'ss-badge-conv'}>{t(i.tipo === 'Sexado' ? 'botijao.sexed' : 'botijao.conventional')}</span></td><td className="ss-mono">{i.doses}</td><td className="ss-mono">R$ {i.preco}</td><td><div className="flex gap-1"><button className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)]" onClick={() => startEdit(i)} title={t('botijao.edit')}><Edit className="h-3.5 w-3.5" /></button><button className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)]" onClick={() => duplicateItem(i)} title={t('botijao.duplicate')}><Copy className="h-3.5 w-3.5" /></button><button className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)] text-[var(--ss-primary)]" onClick={() => { if (confirm(t('botijao.removeBullConfirm'))) removeItem(i.id) }} title={t('botijao.remove')}><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>) : <tr><td colSpan={8} className="text-center text-[var(--ss-muted)]">{t('botijao.noTankRegistered')}</td></tr>}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent><DialogHeader><DialogTitle>{t('botijao.configureBull')}</DialogTitle></DialogHeader>{addSelectedBull && <div className="mb-4 flex items-center gap-3 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-wash)] p-3"><div><div className="text-[13px] font-bold text-[var(--ss-fg)]">{addSelectedBull.name ?? t('botijao.noName')}</div><div className="font-mono text-[11px] text-[var(--ss-muted)]">{addSelectedBull.code}</div></div></div>}<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><FieldSelect label={t('botijao.tank')} value={addBotijaoId} onValueChange={setAddBotijaoId} items={botijoes.map((b) => ({ value: b.id, label: b.nome }))} /><NumField label={t('botijao.cup')} value={addCaneca} setValue={setAddCaneca} /></div><div className="grid grid-cols-3 gap-3"><FieldSelect label={t('botijao.type')} value={addTipo} onValueChange={(v) => setAddTipo(v as 'Convencional' | 'Sexado')} items={[{ value: 'Convencional', label: t('botijao.conventional') }, { value: 'Sexado', label: t('botijao.sexed') }]} /><NumField label={t('botijao.doses')} value={addDoses} setValue={setAddDoses} /><NumField label={t('botijao.pricePerDose')} value={addPreco} setValue={setAddPreco} step={0.01} /></div><div><Label>{t('botijao.notes')}</Label><Input value={addObs} onChange={(e) => setAddObs(e.target.value)} /></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>{t('botijao.cancel')}</DialogClose><Button onClick={addItem} disabled={!addSelectedBull}>{t('botijao.add')}</Button></DialogFooter></DialogContent></Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={(open) => { if (!open) { setShowEdit(false); setEditItem(null) } }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{t('botijao.editBull', { code: editItem?.touro.code ?? '' })}</DialogTitle></DialogHeader>{editItem && <div className="space-y-4"><div className="grid grid-cols-2 gap-3"><FieldSelect label={t('botijao.tank')} value={editItem.botijaoId} onValueChange={(v) => setEditItem({ ...editItem, botijaoId: v })} items={botijoes.map((b) => ({ value: b.id, label: b.nome }))} /><NumField label={t('botijao.cup')} value={editItem.caneca} setValue={(v) => setEditItem({ ...editItem, caneca: v })} /></div><div className="grid grid-cols-3 gap-3"><FieldSelect label={t('botijao.type')} value={editItem.tipo} onValueChange={(v) => setEditItem({ ...editItem, tipo: v as 'Convencional' | 'Sexado' })} items={[{ value: 'Convencional', label: t('botijao.conventional') }, { value: 'Sexado', label: t('botijao.sexed') }]} /><NumField label={t('botijao.doses')} value={editItem.doses} setValue={(v) => setEditItem({ ...editItem, doses: v })} /><NumField label={t('botijao.pricePerDose')} value={editItem.preco} setValue={(v) => setEditItem({ ...editItem, preco: v })} step={0.01} /></div><div><Label>{t('botijao.notes')}</Label><Input value={editItem.observacoes} onChange={(e) => setEditItem({ ...editItem, observacoes: e.target.value })} /></div></div>}<DialogFooter><Button variant="outline" onClick={() => { setShowEdit(false); setEditItem(null) }}>{t('botijao.cancel')}</Button><Button onClick={saveEdit}>{t('botijao.save')}</Button></DialogFooter></DialogContent></Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={showStockUpdate} onOpenChange={setShowStockUpdate}><DialogContent><DialogHeader><DialogTitle>{t('botijao.registerDoseUse')}</DialogTitle></DialogHeader><div className="space-y-4"><FieldSelect label={t('botijao.bull')} value={stockTouroId} onValueChange={setStockTouroId} items={itens.map((i) => ({ value: i.id, label: `${i.touro.code} - ${i.touro.name} (${i.doses} ${t('botijao.doses').toLowerCase()})` }))} /><div className="grid grid-cols-2 gap-3"><NumField label={t('botijao.dosesUsed')} value={stockDoses} setValue={setStockDoses} /><div><Label>{t('botijao.technician')}</Label><Input value={stockTecnico} onChange={(e) => setStockTecnico(e.target.value)} /></div></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>{t('botijao.cancel')}</DialogClose><Button onClick={applyStockUpdate} disabled={!stockTouroId || !stockTecnico}>{t('botijao.confirm')}</Button></DialogFooter></DialogContent></Dialog>

      {/* Nitrogen Dialog */}
      <Dialog open={showNitrogen} onOpenChange={setShowNitrogen}><DialogContent><DialogHeader><DialogTitle>{t('botijao.registerNitrogenSupply')}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>{t('botijao.date')}</Label><Input type="date" value={nitroData} onChange={(e) => setNitroData(e.target.value)} /></div><NumField label={t('botijao.volumeLiters')} value={nitroVolume} setValue={setNitroVolume} /><div><Label>{t('botijao.notes')}</Label><Input value={nitroObs} onChange={(e) => setNitroObs(e.target.value)} /></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>{t('botijao.cancel')}</DialogClose><Button onClick={addNitrogen}>{t('botijao.register')}</Button></DialogFooter></DialogContent></Dialog>

      {/* Create Botijão Dialog */}
      <Dialog open={showCreateBotijao} onOpenChange={setShowCreateBotijao}><DialogContent><DialogHeader><DialogTitle className="flex items-center gap-2"><CryoIcon className="h-5 w-5 text-[var(--ss-primary)]" />{t('botijao.createTank')}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>{t('botijao.tankName')}</Label><Input value={newBtjNome} onChange={(e) => setNewBtjNome(e.target.value)} placeholder={t('botijao.tankNameExample')} /></div><div className="grid grid-cols-2 gap-3"><NumField label={t('botijao.tankCapacity')} value={newBtjLitros} setValue={setNewBtjLitros} /><NumField label={t('botijao.numberOfCups')} value={newBtjCanecas} setValue={setNewBtjCanecas} /></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>{t('botijao.cancel')}</DialogClose><Button onClick={createBotijao} disabled={!newBtjNome.trim()}>{t('botijao.create')}</Button></DialogFooter></DialogContent></Dialog>

      {/* Nitrogen History */}
      {nitrogenRecords.length > 0 && (
        <div className="ss-card mt-3.5">
          <div className="ss-card-header"><h3 className="ss-card-title">{t('botijao.nitrogenHistory')}</h3></div>
          <div className="overflow-x-auto"><table className="ss-table"><thead><tr><th>{t('botijao.date')}</th><th>{t('botijao.volumeL')}</th><th>{t('botijao.notes')}</th><th>{t('botijao.actions')}</th></tr></thead>
            <tbody>{nitrogenRecords.map((r) => <tr key={r.id}>{editingNitrogenId === r.id ? <><td><Input type="date" value={r.dataAbastecimento} onChange={(e) => saveNitrogenEdit(r.id, { dataAbastecimento: e.target.value })} /></td><td><Input type="number" value={r.volume} onChange={(e) => saveNitrogenEdit(r.id, { volume: Number(e.target.value) })} /></td><td><Input value={r.observacoes} onChange={(e) => saveNitrogenEdit(r.id, { observacoes: e.target.value })} /></td><td><Button size="sm" variant="ghost" onClick={() => setEditingNitrogenId(null)}>{t('botijao.ok')}</Button></td></> : <><td>{formatDate(r.dataAbastecimento)}</td><td className="ss-mono">{r.volume}</td><td>{r.observacoes || '-'}</td><td><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setEditingNitrogenId(r.id)}>{t('botijao.edit')}</Button><Button size="sm" variant="ghost" className="text-[var(--ss-primary)]" onClick={() => setNitrogenRecords((prev) => prev.filter((x) => x.id !== r.id))}>{t('common.delete')}</Button></div></td></>}</tr>)}</tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

function NumField({ label, value, setValue, step = 1 }: { label: string; value: number; setValue: (v: number) => void; step?: number }) {
  return <div className="space-y-1"><Label>{label}</Label><Input type="number" min={0} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))} /></div>
}

function FieldSelect({ label, value, onValueChange, items }: { label: string; value: string; onValueChange: (v: string) => void; items: (string | { value: string; label: string })[] }) {
  return <div className="space-y-1"><Label>{label}</Label><Select value={value} onValueChange={(v) => onValueChange(v ?? '')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{items.map((item) => typeof item === 'string' ? <SelectItem key={item} value={item}>{item}</SelectItem> : <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div> // i18n-ignore
}
