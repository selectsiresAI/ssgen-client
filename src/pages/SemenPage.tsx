import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useSemenInventory } from '@/hooks/useApi'
import type { BullSemen } from '@/lib/api'

// ── Types ──

interface BotijaoItem {
  id: string
  touro: BullSemen
  tipo: 'Convencional' | 'Sexado'
  doses: number
  preco: number
  distribuicao: {
    Nov: number; Prim: number; Secund: number; Mult: number
    Doadoras: number; Intermediarias: number; Receptoras: number
  }
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

// ── Helpers ──

function calcStock(itens: BotijaoItem[]) {
  const total = itens.reduce((s, i) => s + i.doses, 0)
  const convencional = itens.filter(i => i.tipo === 'Convencional').reduce((s, i) => s + i.doses, 0)
  const sexado = itens.filter(i => i.tipo === 'Sexado').reduce((s, i) => s + i.doses, 0)
  return { total, convencional, sexado }
}

// ── Component ──

export function SemenPage() {
  // Load bulls from Edge Function
  const { data: bullsData, isLoading: bullsLoading } = useSemenInventory({})
  const allBulls = bullsData?.data ?? []

  // Botijao state
  const [itens, setItens] = useState<BotijaoItem[]>([])
  const [nitrogenRecords, setNitrogenRecords] = useState<NitrogenRecord[]>([])

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('botijao-ssgen')
      if (saved) setItens(JSON.parse(saved))
    } catch { /* ignore */ }
    try {
      const saved = localStorage.getItem('nitrogen-ssgen')
      if (saved) setNitrogenRecords(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  // Persist
  useEffect(() => {
    localStorage.setItem('botijao-ssgen', JSON.stringify(itens))
  }, [itens])
  useEffect(() => {
    localStorage.setItem('nitrogen-ssgen', JSON.stringify(nitrogenRecords))
  }, [nitrogenRecords])

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Dialogs
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showStockUpdate, setShowStockUpdate] = useState(false)
  const [showNitrogen, setShowNitrogen] = useState(false)
  const [editingNitrogenId, setEditingNitrogenId] = useState<string | null>(null)

  // Add form
  const [addBullSearch, setAddBullSearch] = useState('')
  const [addSelectedBull, setAddSelectedBull] = useState<BullSemen | null>(null)
  const [addTipo, setAddTipo] = useState<'Convencional' | 'Sexado'>('Convencional')
  const [addDoses, setAddDoses] = useState(1)
  const [addPreco, setAddPreco] = useState(0)
  const [addDist, setAddDist] = useState({ ...EMPTY_DIST })
  const [addObs, setAddObs] = useState('')

  // Edit form
  const [editItem, setEditItem] = useState<BotijaoItem | null>(null)

  // Stock update form
  const [stockTouroId, setStockTouroId] = useState('')
  const [stockDoses, setStockDoses] = useState(1)
  const [stockCategoria, setStockCategoria] = useState('Nov')
  const [stockData, setStockData] = useState(new Date().toISOString().split('T')[0])
  const [stockTecnico, setStockTecnico] = useState('')

  // Nitrogen form
  const [nitroData, setNitroData] = useState(new Date().toISOString().split('T')[0])
  const [nitroVolume, setNitroVolume] = useState(0)
  const [nitroObs, setNitroObs] = useState('')

  // Filtered bulls for add dialog
  const filteredBulls = useMemo(() => {
    if (!addBullSearch) return allBulls.slice(0, 20)
    const lower = addBullSearch.toLowerCase()
    return allBulls.filter(b =>
      b.name?.toLowerCase().includes(lower) || b.code.toLowerCase().includes(lower)
    ).slice(0, 20)
  }, [allBulls, addBullSearch])

  // Stats
  const stats = useMemo(() => {
    const stock = calcStock(itens)
    const valorTotal = itens.reduce((s, i) => s + i.preco * i.doses, 0)
    const porCategoria = {
      Nov: itens.reduce((s, i) => s + i.distribuicao.Nov, 0),
      Prim: itens.reduce((s, i) => s + i.distribuicao.Prim, 0),
      Secund: itens.reduce((s, i) => s + i.distribuicao.Secund, 0),
      Mult: itens.reduce((s, i) => s + i.distribuicao.Mult, 0),
    }
    return { ...stock, valorTotal, porCategoria, totalTouros: itens.length }
  }, [itens])

  // Sort
  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const sortedItems = useMemo(() => {
    let filtered = itens
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(i =>
        i.touro.name?.toLowerCase().includes(lower) || i.touro.code.toLowerCase().includes(lower)
      )
    }
    if (!sortField) return filtered
    return [...filtered].sort((a, b) => {
      let aVal: string, bVal: string
      switch (sortField) {
        case 'nome': aVal = (a.touro.name ?? '').toLowerCase(); bVal = (b.touro.name ?? '').toLowerCase(); break
        case 'tipo': aVal = a.tipo.toLowerCase(); bVal = b.tipo.toLowerCase(); break
        case 'doses': return sortDirection === 'asc' ? a.doses - b.doses : b.doses - a.doses
        case 'preco': return sortDirection === 'asc' ? a.preco - b.preco : b.preco - a.preco
        default: return 0
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [itens, searchTerm, sortField, sortDirection])

  const SortIcon = ({ col }: { col: string }) => {
    if (sortField !== col) return <span className="text-muted-foreground/50 ml-1">↕</span>
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  // CRUD
  const addItem = () => {
    if (!addSelectedBull) return
    const item: BotijaoItem = {
      id: `${addSelectedBull.code}-${Date.now()}-${Math.random()}`,
      touro: addSelectedBull,
      tipo: addTipo,
      doses: addDoses,
      preco: addPreco,
      distribuicao: { ...addDist },
      dataAdicao: new Date().toISOString(),
      observacoes: addObs,
    }
    setItens(prev => [...prev, item])
    resetAddForm()
    setShowAdd(false)
  }

  const resetAddForm = () => {
    setAddBullSearch(''); setAddSelectedBull(null); setAddTipo('Convencional')
    setAddDoses(1); setAddPreco(0); setAddDist({ ...EMPTY_DIST }); setAddObs('')
  }

  const removeItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id))
  }

  const duplicateItem = (item: BotijaoItem) => {
    const dup: BotijaoItem = {
      ...item,
      id: `${item.touro.code}-${Date.now()}-${Math.random()}`,
      dataAdicao: new Date().toISOString(),
    }
    setItens(prev => [...prev, dup])
  }

  const startEdit = (item: BotijaoItem) => {
    setEditItem({ ...item, distribuicao: { ...item.distribuicao } })
    setShowEdit(true)
  }

  const saveEdit = () => {
    if (!editItem) return
    setItens(prev => prev.map(i => i.id === editItem.id ? editItem : i))
    setEditItem(null)
    setShowEdit(false)
  }

  // Stock update
  const applyStockUpdate = () => {
    if (!stockTouroId || !stockTecnico) return
    setItens(prev => prev.map(i => {
      if (i.id === stockTouroId) {
        return { ...i, doses: Math.max(0, i.doses - stockDoses) }
      }
      return i
    }))
    setStockTouroId(''); setStockDoses(1); setStockTecnico('')
    setShowStockUpdate(false)
  }

  // Nitrogen
  const addNitrogen = () => {
    const record: NitrogenRecord = {
      id: `n-${Date.now()}-${Math.random()}`,
      dataAbastecimento: nitroData,
      volume: nitroVolume,
      observacoes: nitroObs,
    }
    setNitrogenRecords(prev => [...prev, record])
    setNitroData(new Date().toISOString().split('T')[0]); setNitroVolume(0); setNitroObs('')
    setShowNitrogen(false)
  }

  const deleteNitrogen = (id: string) => setNitrogenRecords(prev => prev.filter(r => r.id !== id))

  const saveNitrogenEdit = (id: string, updates: Partial<NitrogenRecord>) => {
    setNitrogenRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    setEditingNitrogenId(null)
  }

  // Export
  const exportExcel = () => {
    import('xlsx').then(({ utils, writeFile }) => {
      const headers = ['NAAB', 'Nome', 'Tipo', 'Doses', 'Preco', 'Nov', 'Prim', 'Secund', 'Mult', 'Doadoras', 'Intermediarias', 'Receptoras', 'Data Adicao', 'Observacoes']
      const rows = itens.map(i => [
        i.touro.code, i.touro.name ?? '', i.tipo, i.doses, i.preco.toFixed(2),
        i.distribuicao.Nov, i.distribuicao.Prim, i.distribuicao.Secund, i.distribuicao.Mult,
        i.distribuicao.Doadoras, i.distribuicao.Intermediarias, i.distribuicao.Receptoras,
        i.dataAdicao, i.observacoes,
      ])
      const ws = utils.aoa_to_sheet([headers, ...rows])
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Botijao Virtual')
      writeFile(wb, `botijao-virtual-${new Date().toISOString().split('T')[0]}.xlsx`)
    })
  }

  const clearAll = () => {
    if (!confirm('Limpar todos os dados do botijao? Esta acao nao pode ser desfeita.')) return
    setItens([])
    setNitrogenRecords([])
    localStorage.removeItem('botijao-ssgen')
    localStorage.removeItem('nitrogen-ssgen')
  }

  if (bullsLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Botijao Virtual</h1></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Botijao Virtual</h1>
        <p className="text-muted-foreground text-sm">Gerencie o estoque virtual de semen</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Doses</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Convencional</p>
            <p className="text-2xl font-bold text-blue-600">{stats.convencional}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Sexado</p>
            <p className="text-2xl font-bold text-pink-600">{stats.sexado}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-emerald-600">R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['Nov', 'Prim', 'Secund', 'Mult'] as const).map(cat => (
          <Card key={cat}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{cat === 'Nov' ? 'Novilhas' : cat === 'Prim' ? 'Primiparas' : cat === 'Secund' ? 'Secundiparas' : 'Multiparas'}</p>
              <p className="text-lg font-bold">{stats.porCategoria[cat]} doses</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <Button onClick={() => setShowAdd(true)}>+ Adicionar Touro</Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Adicionar Touro ao Botijao</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* Bull search */}
              <div className="space-y-2">
                <Label>Buscar touro</Label>
                <Input
                  placeholder="Nome ou NAAB..."
                  value={addBullSearch}
                  onChange={e => setAddBullSearch(e.target.value)}
                />
                {addBullSearch && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {filteredBulls.map(b => (
                      <button
                        key={b.code}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${addSelectedBull?.code === b.code ? 'bg-primary/10' : ''}`}
                        onClick={() => setAddSelectedBull(b)}
                      >
                        <span className="font-mono">{b.code}</span> — {b.name ?? 'Sem nome'}
                        <span className="text-xs text-muted-foreground ml-2">({b.daughters_count} filhas)</span>
                      </button>
                    ))}
                    {filteredBulls.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum touro encontrado</p>
                    )}
                  </div>
                )}
                {addSelectedBull && (
                  <p className="text-sm">Selecionado: <strong>{addSelectedBull.code}</strong> — {addSelectedBull.name}</p>
                )}
              </div>

              {/* Type & doses */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select value={addTipo} onValueChange={(v) => setAddTipo(v as 'Convencional' | 'Sexado')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Convencional">Convencional</SelectItem>
                      <SelectItem value="Sexado">Sexado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Doses</Label>
                  <Input type="number" min={1} value={addDoses} onChange={e => setAddDoses(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Preco/dose (R$)</Label>
                  <Input type="number" min={0} step={0.01} value={addPreco} onChange={e => setAddPreco(Number(e.target.value))} />
                </div>
              </div>

              {/* Distribution by age */}
              <div className="space-y-2">
                <Label>Distribuicao por categoria</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Nov', 'Prim', 'Secund', 'Mult'] as const).map(cat => (
                    <div key={cat} className="space-y-1">
                      <Label className="text-xs">{cat}</Label>
                      <Input type="number" min={0} value={addDist[cat]} onChange={e => setAddDist(prev => ({ ...prev, [cat]: Number(e.target.value) }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution by segment */}
              <div className="space-y-2">
                <Label>Distribuicao por segmento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Doadoras', 'Intermediarias', 'Receptoras'] as const).map(seg => (
                    <div key={seg} className="space-y-1">
                      <Label className="text-xs">{seg}</Label>
                      <Input type="number" min={0} value={addDist[seg]} onChange={e => setAddDist(prev => ({ ...prev, [seg]: Number(e.target.value) }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Observacoes</Label>
                <Input value={addObs} onChange={e => setAddObs(e.target.value)} placeholder="Opcional..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={addItem} disabled={!addSelectedBull}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showNitrogen} onOpenChange={setShowNitrogen}>
          <Button variant="outline" onClick={() => setShowNitrogen(true)}>Abastecimento N2</Button>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Abastecimento de Nitrogenio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Data</Label>
                <Input type="date" value={nitroData} onChange={e => setNitroData(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Volume (litros)</Label>
                <Input type="number" min={0} value={nitroVolume} onChange={e => setNitroVolume(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Observacoes</Label>
                <Input value={nitroObs} onChange={e => setNitroObs(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={addNitrogen}>Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showStockUpdate} onOpenChange={setShowStockUpdate}>
          <Button variant="outline" onClick={() => setShowStockUpdate(true)}>Atualizar Estoque</Button>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Uso de Doses</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Touro</Label>
                <Select value={stockTouroId} onValueChange={(v: string | null) => setStockTouroId(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Selecione o touro" /></SelectTrigger>
                  <SelectContent>
                    {itens.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.touro.code} — {i.touro.name} ({i.doses} doses)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Doses usadas</Label>
                  <Input type="number" min={1} value={stockDoses} onChange={e => setStockDoses(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Categoria</Label>
                  <Select value={stockCategoria} onValueChange={(v: string | null) => setStockCategoria(v ?? 'Nov')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Nov', 'Prim', 'Secund', 'Mult', 'Doadoras', 'Intermediarias', 'Receptoras'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Data</Label>
                  <Input type="date" value={stockData} onChange={e => setStockData(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Tecnico</Label>
                  <Input value={stockTecnico} onChange={e => setStockTecnico(e.target.value)} placeholder="Nome do tecnico" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <Button onClick={applyStockUpdate} disabled={!stockTouroId || !stockTecnico}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={exportExcel} disabled={itens.length === 0}>Exportar Excel</Button>
      </div>

      {/* Last nitrogen info */}
      {nitrogenRecords.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">N2</Badge>
          Ultimo abastecimento: {new Date(nitrogenRecords[nitrogenRecords.length - 1].dataAbastecimento).toLocaleDateString('pt-BR')}
          — {nitrogenRecords[nitrogenRecords.length - 1].volume}L
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Buscar touro por NAAB ou nome..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-[300px]"
      />

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">NAAB</TableHead>
                  <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleSort('nome')}>
                    Nome <SortIcon col="nome" />
                  </TableHead>
                  <TableHead className="min-w-[80px] cursor-pointer" onClick={() => handleSort('tipo')}>
                    Tipo <SortIcon col="tipo" />
                  </TableHead>
                  <TableHead className="min-w-[60px] text-right cursor-pointer" onClick={() => handleSort('doses')}>
                    Doses <SortIcon col="doses" />
                  </TableHead>
                  <TableHead className="min-w-[80px] text-right cursor-pointer" onClick={() => handleSort('preco')}>
                    Preco <SortIcon col="preco" />
                  </TableHead>
                  <TableHead className="text-right">Nov</TableHead>
                  <TableHead className="text-right">Prim</TableHead>
                  <TableHead className="text-right">Secund</TableHead>
                  <TableHead className="text-right">Mult</TableHead>
                  <TableHead className="text-right">Doad.</TableHead>
                  <TableHead className="text-right">Interm.</TableHead>
                  <TableHead className="text-right">Recept.</TableHead>
                  <TableHead className="min-w-[160px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      {itens.length === 0 ? 'Nenhum touro no botijao. Clique em "Adicionar Touro" para comecar.' : 'Nenhum resultado para a busca.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.touro.code}</TableCell>
                      <TableCell className="text-sm">{item.touro.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={item.tipo === 'Sexado' ? 'default' : 'outline'} className="text-xs">
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{item.doses}</TableCell>
                      <TableCell className="text-right text-sm">R$ {item.preco.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Nov}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Prim}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Secund}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Mult}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Doadoras}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Intermediarias}</TableCell>
                      <TableCell className="text-right text-xs">{item.distribuicao.Receptoras}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => startEdit(item)}>Editar</Button>
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => duplicateItem(item)}>Duplicar</Button>
                          <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => { if (confirm('Remover este touro?')) removeItem(item.id) }}>Remover</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={(open) => { if (!open) { setShowEdit(false); setEditItem(null) } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Touro — {editItem?.touro.code}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select value={editItem.tipo} onValueChange={(v) => setEditItem({ ...editItem, tipo: v as 'Convencional' | 'Sexado' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Convencional">Convencional</SelectItem>
                      <SelectItem value="Sexado">Sexado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Doses</Label>
                  <Input type="number" min={0} value={editItem.doses} onChange={e => setEditItem({ ...editItem, doses: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>Preco/dose (R$)</Label>
                  <Input type="number" min={0} step={0.01} value={editItem.preco} onChange={e => setEditItem({ ...editItem, preco: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Distribuicao por categoria</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Nov', 'Prim', 'Secund', 'Mult'] as const).map(cat => (
                    <div key={cat} className="space-y-1">
                      <Label className="text-xs">{cat}</Label>
                      <Input type="number" min={0} value={editItem.distribuicao[cat]}
                        onChange={e => setEditItem({ ...editItem, distribuicao: { ...editItem.distribuicao, [cat]: Number(e.target.value) } })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Distribuicao por segmento</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Doadoras', 'Intermediarias', 'Receptoras'] as const).map(seg => (
                    <div key={seg} className="space-y-1">
                      <Label className="text-xs">{seg}</Label>
                      <Input type="number" min={0} value={editItem.distribuicao[seg]}
                        onChange={e => setEditItem({ ...editItem, distribuicao: { ...editItem.distribuicao, [seg]: Number(e.target.value) } })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Observacoes</Label>
                <Input value={editItem.observacoes} onChange={e => setEditItem({ ...editItem, observacoes: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEdit(false); setEditItem(null) }}>Cancelar</Button>
            <Button onClick={saveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nitrogen History */}
      {nitrogenRecords.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Historico de Abastecimento N2</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Volume (L)</TableHead>
                  <TableHead>Observacoes</TableHead>
                  <TableHead className="w-28">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nitrogenRecords.map(r => (
                  <TableRow key={r.id}>
                    {editingNitrogenId === r.id ? (
                      <>
                        <TableCell>
                          <Input type="date" value={r.dataAbastecimento} onChange={e => saveNitrogenEdit(r.id, { dataAbastecimento: e.target.value })} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" className="w-20" value={r.volume} onChange={e => saveNitrogenEdit(r.id, { volume: Number(e.target.value) })} />
                        </TableCell>
                        <TableCell>
                          <Input value={r.observacoes} onChange={e => saveNitrogenEdit(r.id, { observacoes: e.target.value })} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditingNitrogenId(null)}>OK</Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-sm">{new Date(r.dataAbastecimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right font-medium">{r.volume}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.observacoes || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingNitrogenId(r.id)}>Editar</Button>
                            <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => deleteNitrogen(r.id)}>Excluir</Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Clear all */}
      {itens.length > 0 && (
        <div className="flex justify-end">
          <Button variant="destructive" size="sm" onClick={clearAll}>Limpar tudo</Button>
        </div>
      )}
    </div>
  )
}
