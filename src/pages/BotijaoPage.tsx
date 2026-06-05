import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Droplets, Edit, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KpiCard } from '@/components/KpiCard'
import { useSemenInventory } from '@/hooks/useApi'
import type { BullSemen } from '@/lib/api'
import { botijaoDemo } from '@/data/demoData'

interface BotijaoItem {
  id: string
  touro: BullSemen
  tipo: 'Convencional' | 'Sexado'
  doses: number
  preco: number
  distribuicao: { Nov: number; Prim: number; Secund: number; Mult: number; Doadoras: number; Intermediarias: number; Receptoras: number }
  dataAdicao: string
  observacoes: string
}

interface NitrogenRecord {
  id: string
  dataAbastecimento: string
  volume: number
  observacoes: string
}

const EMPTY_DIST = { Nov: 0, Prim: 0, Secund: 0, Mult: 0, Doadoras: 0, Intermediarias: 0, Receptoras: 0 }

function demoItems(): BotijaoItem[] {
  return botijaoDemo.map((i) => ({
    id: `${i.naab}-demo`,
    touro: { code: i.naab, name: i.nome, registration: null, breed: 'HO', daughters_count: 0 },
    tipo: i.tipo,
    doses: i.doses,
    preco: i.preco,
    distribuicao: { Nov: i.Nov, Prim: i.Prim, Secund: i.Sec, Mult: i.Mult, Doadoras: i.Doa, Intermediarias: i.Int, Receptoras: i.Rec },
    dataAdicao: new Date().toISOString(),
    observacoes: i.emp,
  }))
}

export function BotijaoPage() {
  const { data: bullsData } = useSemenInventory({})
  const allBulls = bullsData?.data ?? []
  const [itens, setItens] = useState<BotijaoItem[]>([])
  const [nitrogenRecords, setNitrogenRecords] = useState<NitrogenRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showStockUpdate, setShowStockUpdate] = useState(false)
  const [showNitrogen, setShowNitrogen] = useState(false)
  const [editingNitrogenId, setEditingNitrogenId] = useState<string | null>(null)
  const [addBullSearch, setAddBullSearch] = useState('')
  const [addSelectedBull, setAddSelectedBull] = useState<BullSemen | null>(null)
  const [addTipo, setAddTipo] = useState<'Convencional' | 'Sexado'>('Convencional')
  const [addDoses, setAddDoses] = useState(1)
  const [addPreco, setAddPreco] = useState(0)
  const [addDist, setAddDist] = useState({ ...EMPTY_DIST })
  const [addObs, setAddObs] = useState('')
  const [editItem, setEditItem] = useState<BotijaoItem | null>(null)
  const [stockTouroId, setStockTouroId] = useState('')
  const [stockDoses, setStockDoses] = useState(1)
  const [stockCategoria, setStockCategoria] = useState('Nov')
  const [stockData, setStockData] = useState(new Date().toISOString().split('T')[0])
  const [stockTecnico, setStockTecnico] = useState('')
  const [nitroData, setNitroData] = useState(new Date().toISOString().split('T')[0])
  const [nitroVolume, setNitroVolume] = useState(0)
  const [nitroObs, setNitroObs] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('botijao-ssgen')
      setItens(saved ? JSON.parse(saved) : demoItems())
    } catch { setItens(demoItems()) }
    try {
      const saved = localStorage.getItem('nitrogen-ssgen')
      if (saved) setNitrogenRecords(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])
  useEffect(() => { localStorage.setItem('botijao-ssgen', JSON.stringify(itens)) }, [itens])
  useEffect(() => { localStorage.setItem('nitrogen-ssgen', JSON.stringify(nitrogenRecords)) }, [nitrogenRecords])

  const filteredBulls = useMemo(() => {
    const source = allBulls.length > 0 ? allBulls : demoItems().map((i) => i.touro)
    if (!addBullSearch) return source.slice(0, 20)
    const lower = addBullSearch.toLowerCase()
    return source.filter((b) => b.name?.toLowerCase().includes(lower) || b.code.toLowerCase().includes(lower)).slice(0, 20)
  }, [allBulls, addBullSearch])

  const stats = useMemo(() => {
    const total = itens.reduce((s, i) => s + i.doses, 0)
    const convencional = itens.filter((i) => i.tipo === 'Convencional').reduce((s, i) => s + i.doses, 0)
    const sexado = itens.filter((i) => i.tipo === 'Sexado').reduce((s, i) => s + i.doses, 0)
    const valorTotal = itens.reduce((s, i) => s + i.preco * i.doses, 0)
    const porCategoria = {
      Nov: itens.reduce((s, i) => s + i.distribuicao.Nov, 0),
      Prim: itens.reduce((s, i) => s + i.distribuicao.Prim, 0),
      Secund: itens.reduce((s, i) => s + i.distribuicao.Secund, 0),
      Mult: itens.reduce((s, i) => s + i.distribuicao.Mult, 0),
    }
    return { total, convencional, sexado, valorTotal, porCategoria, totalTouros: itens.length }
  }, [itens])

  const sortedItems = useMemo(() => {
    let filtered = itens
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter((i) => i.touro.name?.toLowerCase().includes(lower) || i.touro.code.toLowerCase().includes(lower))
    }
    if (!sortField) return filtered
    return [...filtered].sort((a, b) => {
      if (sortField === 'doses') return sortDirection === 'asc' ? a.doses - b.doses : b.doses - a.doses
      if (sortField === 'preco') return sortDirection === 'asc' ? a.preco - b.preco : b.preco - a.preco
      const av = sortField === 'tipo' ? a.tipo : (a.touro.name ?? '')
      const bv = sortField === 'tipo' ? b.tipo : (b.touro.name ?? '')
      return sortDirection === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [itens, searchTerm, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const resetAddForm = () => { setAddBullSearch(''); setAddSelectedBull(null); setAddTipo('Convencional'); setAddDoses(1); setAddPreco(0); setAddDist({ ...EMPTY_DIST }); setAddObs('') }
  const addItem = () => {
    if (!addSelectedBull) return
    setItens((prev) => [...prev, { id: `${addSelectedBull.code}-${Date.now()}-${Math.random()}`, touro: addSelectedBull, tipo: addTipo, doses: addDoses, preco: addPreco, distribuicao: { ...addDist }, dataAdicao: new Date().toISOString(), observacoes: addObs }])
    resetAddForm(); setShowAdd(false)
  }
  const startEdit = (item: BotijaoItem) => { setEditItem({ ...item, distribuicao: { ...item.distribuicao } }); setShowEdit(true) }
  const saveEdit = () => { if (!editItem) return; setItens((prev) => prev.map((i) => i.id === editItem.id ? editItem : i)); setEditItem(null); setShowEdit(false) }
  const removeItem = (id: string) => setItens((prev) => prev.filter((i) => i.id !== id))
  const duplicateItem = (item: BotijaoItem) => setItens((prev) => [...prev, { ...item, id: `${item.touro.code}-${Date.now()}-${Math.random()}`, dataAdicao: new Date().toISOString() }])
  const applyStockUpdate = () => { if (!stockTouroId || !stockTecnico) return; setItens((prev) => prev.map((i) => i.id === stockTouroId ? { ...i, doses: Math.max(0, i.doses - stockDoses) } : i)); setStockTouroId(''); setStockDoses(1); setStockTecnico(''); setShowStockUpdate(false) }
  const addNitrogen = () => { setNitrogenRecords((prev) => [...prev, { id: `n-${Date.now()}-${Math.random()}`, dataAbastecimento: nitroData, volume: nitroVolume, observacoes: nitroObs }]); setNitroData(new Date().toISOString().split('T')[0]); setNitroVolume(0); setNitroObs(''); setShowNitrogen(false) }
  const saveNitrogenEdit = (id: string, updates: Partial<NitrogenRecord>) => { setNitrogenRecords((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r)); setEditingNitrogenId(null) }

  const exportExcel = () => {
    import('xlsx').then(({ utils, writeFile }) => {
      const headers = ['NAAB', 'Nome', 'Tipo', 'Doses', 'Preço', 'Nov', 'Prim', 'Secund', 'Mult', 'Doadoras', 'Intermediarias', 'Receptoras', 'Data Adicao', 'Observacoes']
      const rows = itens.map((i) => [i.touro.code, i.touro.name ?? '', i.tipo, i.doses, i.preco.toFixed(2), i.distribuicao.Nov, i.distribuicao.Prim, i.distribuicao.Secund, i.distribuicao.Mult, i.distribuicao.Doadoras, i.distribuicao.Intermediarias, i.distribuicao.Receptoras, i.dataAdicao, i.observacoes])
      const ws = utils.aoa_to_sheet([headers, ...rows])
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Botijao Virtual')
      writeFile(wb, `botijao-virtual-${new Date().toISOString().split('T')[0]}.xlsx`)
    })
  }

  return (
    <div>
      <div className="ss-preserved"><Droplets className="h-[15px] w-[15px]" />CRUD localStorage, exportação, nitrogênio e atualização de estoque preservados.</div>
      <div className="ss-grid-kpis">
        <KpiCard icon={Droplets} label="Total doses" value={stats.total} delta={`${stats.totalTouros} touros`} />
        <KpiCard icon={Droplets} label="Convencional" value={stats.convencional} delta="doses disponíveis" />
        <KpiCard icon={Droplets} label="Sexado" value={stats.sexado} delta="doses disponíveis" />
        <KpiCard icon={Droplets} label="Valor total" value={`R$ ${stats.valorTotal.toLocaleString('pt-BR')}`} delta="estoque virtual" />
      </div>
      <div className="ss-grid-4">
        {(['Nov', 'Prim', 'Secund', 'Mult'] as const).map((cat) => <div key={cat} className="ss-card p-4 text-center"><div className="text-xs text-[var(--ss-muted)]">{cat === 'Nov' ? 'Novilhas' : cat === 'Prim' ? 'Primíparas' : cat === 'Secund' ? 'Secundíparas' : 'Multíparas'}</div><b className="text-lg text-[var(--ss-fg)]">{stats.porCategoria[cat]} doses</b></div>)}
      </div>
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Estoque do botijão</h3>
          <div className="flex flex-wrap items-center gap-2">
            {nitrogenRecords.length > 0 && <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE6F2] bg-[#EAF4FA] px-3 py-1.5 font-mono text-[11.5px] text-[#2B6A8F]"><Droplets className="h-3.5 w-3.5" />N₂ {new Date(nitrogenRecords[nitrogenRecords.length - 1].dataAbastecimento).toLocaleDateString('pt-BR')}</span>}
            <button className="ss-button ss-button-ghost ss-button-sm" onClick={() => setShowNitrogen(true)}><Droplets />Abastecer N₂</button>
            <button className="ss-button ss-button-ghost ss-button-sm" onClick={() => setShowStockUpdate(true)}><Upload />Atualizar estoque</button>
            <button className="ss-button ss-button-ghost ss-button-sm" onClick={exportExcel} disabled={itens.length === 0}><Download />Exportar</button>
            <button className="ss-button ss-button-sm" onClick={() => setShowAdd(true)}><Plus />Adicionar touro</button>
          </div>
        </div>
        <div className="p-3">
          <Input placeholder="Buscar touro por NAAB ou nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-3 w-[300px]" />
          <div className="overflow-x-auto">
            <table className="ss-table">
              <thead><tr><th>NAAB</th><th onClick={() => handleSort('nome')} className="cursor-pointer">Nome</th><th>Empresa</th><th onClick={() => handleSort('tipo')} className="cursor-pointer">Tipo</th><th onClick={() => handleSort('doses')} className="cursor-pointer">Doses</th><th onClick={() => handleSort('preco')} className="cursor-pointer">Preço</th><th>Nov</th><th>Prim</th><th>Sec</th><th>Mult</th><th>Doad.</th><th>Interm.</th><th>Recept.</th><th>Ações</th></tr></thead>
              <tbody>{sortedItems.map((i) => <tr key={i.id}><td className="ss-mono">{i.touro.code}</td><td>{i.touro.name ?? '-'}</td><td>{i.observacoes || '-'}</td><td><span className={i.tipo === 'Sexado' ? 'ss-badge-sex' : 'ss-badge-conv'}>{i.tipo}</span></td><td className="ss-mono">{i.doses}</td><td className="ss-mono">R$ {i.preco}</td><td className="ss-mono">{i.distribuicao.Nov}</td><td className="ss-mono">{i.distribuicao.Prim}</td><td className="ss-mono">{i.distribuicao.Secund}</td><td className="ss-mono">{i.distribuicao.Mult}</td><td className="ss-mono">{i.distribuicao.Doadoras}</td><td className="ss-mono">{i.distribuicao.Intermediarias}</td><td className="ss-mono">{i.distribuicao.Receptoras}</td><td><div className="flex gap-1"><button className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)]" onClick={() => startEdit(i)} title="Editar"><Edit className="h-3.5 w-3.5" /></button><button className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)]" onClick={() => duplicateItem(i)} title="Duplicar"><Copy className="h-3.5 w-3.5" /></button><button className="grid h-7 w-7 place-items-center rounded-md border border-[var(--ss-border)] text-[var(--ss-primary)]" onClick={() => { if (confirm('Remover este touro?')) removeItem(i.id) }} title="Remover"><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Adicionar Touro ao Botijão</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Buscar touro</Label><Input value={addBullSearch} onChange={(e) => setAddBullSearch(e.target.value)} placeholder="Nome ou NAAB..." /><div className="max-h-40 overflow-y-auto rounded-md border">{filteredBulls.map((b) => <button key={b.code} type="button" className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--ss-wash)] ${addSelectedBull?.code === b.code ? 'bg-[var(--ss-primary-soft)]' : ''}`} onClick={() => setAddSelectedBull(b)}><span className="font-mono">{b.code}</span> - {b.name ?? 'Sem nome'}</button>)}</div></div><div className="grid grid-cols-3 gap-3"><FieldSelect label="Tipo" value={addTipo} onValueChange={(v) => setAddTipo(v as 'Convencional' | 'Sexado')} items={['Convencional', 'Sexado']} /><NumField label="Doses" value={addDoses} setValue={setAddDoses} /><NumField label="Preço/dose (R$)" value={addPreco} setValue={setAddPreco} step={0.01} /></div><DistFields dist={addDist} setDist={setAddDist} /><div><Label>Observações</Label><Input value={addObs} onChange={(e) => setAddObs(e.target.value)} /></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose><Button onClick={addItem} disabled={!addSelectedBull}>Adicionar</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={showEdit} onOpenChange={(open) => { if (!open) { setShowEdit(false); setEditItem(null) } }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Editar Touro - {editItem?.touro.code}</DialogTitle></DialogHeader>{editItem && <div className="space-y-4"><div className="grid grid-cols-3 gap-3"><FieldSelect label="Tipo" value={editItem.tipo} onValueChange={(v) => setEditItem({ ...editItem, tipo: v as 'Convencional' | 'Sexado' })} items={['Convencional', 'Sexado']} /><NumField label="Doses" value={editItem.doses} setValue={(v) => setEditItem({ ...editItem, doses: v })} /><NumField label="Preço/dose (R$)" value={editItem.preco} setValue={(v) => setEditItem({ ...editItem, preco: v })} step={0.01} /></div><DistFields dist={editItem.distribuicao} setDist={(d) => setEditItem({ ...editItem, distribuicao: d })} /><div><Label>Observações</Label><Input value={editItem.observacoes} onChange={(e) => setEditItem({ ...editItem, observacoes: e.target.value })} /></div></div>}<DialogFooter><Button variant="outline" onClick={() => { setShowEdit(false); setEditItem(null) }}>Cancelar</Button><Button onClick={saveEdit}>Salvar</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={showStockUpdate} onOpenChange={setShowStockUpdate}><DialogContent><DialogHeader><DialogTitle>Registrar Uso de Doses</DialogTitle></DialogHeader><div className="space-y-4"><FieldSelect label="Touro" value={stockTouroId} onValueChange={setStockTouroId} items={itens.map((i) => ({ value: i.id, label: `${i.touro.code} - ${i.touro.name} (${i.doses} doses)` }))} /><div className="grid grid-cols-2 gap-3"><NumField label="Doses usadas" value={stockDoses} setValue={setStockDoses} /><FieldSelect label="Categoria" value={stockCategoria} onValueChange={setStockCategoria} items={['Nov', 'Prim', 'Secund', 'Mult', 'Doadoras', 'Intermediarias', 'Receptoras']} /></div><div className="grid grid-cols-2 gap-3"><div><Label>Data</Label><Input type="date" value={stockData} onChange={(e) => setStockData(e.target.value)} /></div><div><Label>Técnico</Label><Input value={stockTecnico} onChange={(e) => setStockTecnico(e.target.value)} /></div></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose><Button onClick={applyStockUpdate} disabled={!stockTouroId || !stockTecnico}>Confirmar</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={showNitrogen} onOpenChange={setShowNitrogen}><DialogContent><DialogHeader><DialogTitle>Registrar Abastecimento de Nitrogênio</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Data</Label><Input type="date" value={nitroData} onChange={(e) => setNitroData(e.target.value)} /></div><NumField label="Volume (litros)" value={nitroVolume} setValue={setNitroVolume} /><div><Label>Observações</Label><Input value={nitroObs} onChange={(e) => setNitroObs(e.target.value)} /></div></div><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose><Button onClick={addNitrogen}>Registrar</Button></DialogFooter></DialogContent></Dialog>
      {nitrogenRecords.length > 0 && <div className="ss-card mt-3.5"><div className="ss-card-header"><h3 className="ss-card-title">Histórico de Abastecimento N₂</h3></div><div className="overflow-x-auto"><table className="ss-table"><thead><tr><th>Data</th><th>Volume (L)</th><th>Observações</th><th>Ações</th></tr></thead><tbody>{nitrogenRecords.map((r) => <tr key={r.id}>{editingNitrogenId === r.id ? <><td><Input type="date" value={r.dataAbastecimento} onChange={(e) => saveNitrogenEdit(r.id, { dataAbastecimento: e.target.value })} /></td><td><Input type="number" value={r.volume} onChange={(e) => saveNitrogenEdit(r.id, { volume: Number(e.target.value) })} /></td><td><Input value={r.observacoes} onChange={(e) => saveNitrogenEdit(r.id, { observacoes: e.target.value })} /></td><td><Button size="sm" variant="ghost" onClick={() => setEditingNitrogenId(null)}>OK</Button></td></> : <><td>{new Date(r.dataAbastecimento).toLocaleDateString('pt-BR')}</td><td className="ss-mono">{r.volume}</td><td>{r.observacoes || '-'}</td><td><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setEditingNitrogenId(r.id)}>Editar</Button><Button size="sm" variant="ghost" className="text-[var(--ss-primary)]" onClick={() => setNitrogenRecords((prev) => prev.filter((x) => x.id !== r.id))}>Excluir</Button></div></td></>}</tr>)}</tbody></table></div></div>}
    </div>
  )
}

function NumField({ label, value, setValue, step = 1 }: { label: string; value: number; setValue: (v: number) => void; step?: number }) {
  return <div className="space-y-1"><Label>{label}</Label><Input type="number" min={0} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))} /></div>
}

function FieldSelect({ label, value, onValueChange, items }: { label: string; value: string; onValueChange: (v: string) => void; items: (string | { value: string; label: string })[] }) {
  return <div className="space-y-1"><Label>{label}</Label><Select value={value} onValueChange={(v) => onValueChange(v ?? '')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{items.map((item) => typeof item === 'string' ? <SelectItem key={item} value={item}>{item}</SelectItem> : <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>
}

function DistFields({ dist, setDist }: { dist: BotijaoItem['distribuicao']; setDist: (v: BotijaoItem['distribuicao']) => void }) {
  return <div className="space-y-2"><Label>Distribuição por categoria</Label><div className="grid grid-cols-4 gap-2">{(['Nov', 'Prim', 'Secund', 'Mult'] as const).map((cat) => <NumField key={cat} label={cat} value={dist[cat]} setValue={(v) => setDist({ ...dist, [cat]: v })} />)}</div><Label>Distribuição por segmento</Label><div className="grid grid-cols-3 gap-2">{(['Doadoras', 'Intermediarias', 'Receptoras'] as const).map((cat) => <NumField key={cat} label={cat} value={dist[cat]} setValue={(v) => setDist({ ...dist, [cat]: v })} />)}</div></div>
}
