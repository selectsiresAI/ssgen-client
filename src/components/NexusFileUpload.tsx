import { useCallback, useRef } from 'react'
import { Upload } from 'lucide-react'
import { normalizeRows } from '@/lib/nexus-traits'

interface NexusFileUploadProps {
  onLoaded: (rows: Record<string, unknown>[]) => void
}

export function NexusFileUpload({ onLoaded }: NexusFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text()
        const lines = text.trim().split('\n')
        if (lines.length < 2) return
        const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().replace(/^"|"$/g, ''))
        const rows = lines.slice(1).map((line) => {
          const values = line.split(/[,;\t]/).map((v) => v.trim().replace(/^"|"$/g, ''))
          const obj: Record<string, string> = {}
          headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
          return obj
        })
        onLoaded(normalizeRows(rows))
      } else {
        const { read, utils } = await import('xlsx')
        const ab = await file.arrayBuffer()
        const wb = read(ab)
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = utils.sheet_to_json<Record<string, unknown>>(ws)
        onLoaded(normalizeRows(json as Record<string, unknown>[]))
      }
    } catch {
      alert('Erro ao processar arquivo. Verifique o formato.')
    }
  }, [onLoaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--ss-border)] bg-[var(--ss-wash)] px-6 py-10 transition hover:border-[var(--ss-primary)] hover:bg-[var(--ss-primary-soft)]"
    >
      <Upload className="h-8 w-8 text-[var(--ss-muted)]" />
      <div className="text-center">
        <p className="text-[13px] font-semibold text-[var(--ss-fg)]">Arraste ou clique para carregar fêmeas</p>
        <p className="mt-1 text-[11px] text-[var(--ss-muted)]">Formatos: Excel (.xlsx, .xls) ou CSV</p>
      </div>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm,.csv" onChange={handleChange} className="hidden" />
    </div>
  )
}
