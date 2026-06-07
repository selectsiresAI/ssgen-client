import jsPDF from 'jspdf'
import type { DemoAnimal, trend as trendShape } from '@/data/demoData'
import { fmt, traitLabel } from '@/data/demoData'

interface ReportSection {
  key: string
  label: string
  enabled: boolean
}

const PRIMARY = [206, 14, 45] as const
const FG = [28, 28, 28] as const
const MUTED = [140, 140, 140] as const
const GREEN = [63, 138, 102] as const
const AMBER = [183, 121, 31] as const

type Benchmarks = [string, string, number, number, number][]
type TrendData = typeof trendShape

function header(doc: jsPDF, title: string, page: number) {
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 210, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Select Sires', 14, 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Relatório Executivo Genômico', 14, 16)
  doc.text(`Página ${page} · ${title}`, 196, 12, { align: 'right' })
  doc.setTextColor(...FG)
}

function sectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...FG)
  doc.text(title, 14, y)
  doc.setDrawColor(...PRIMARY)
  doc.setLineWidth(0.6)
  doc.line(14, y + 3, 196, y + 3)
}

function enabled(sections: ReportSection[], key: string) {
  return sections.some((s) => s.key === key && s.enabled)
}

function page(doc: jsPDF, title: string, pageNo: number) {
  if (pageNo > 1) doc.addPage()
  header(doc, title, pageNo)
  sectionTitle(doc, title, 32)
}

function drawBar(doc: jsPDF, label: string, value: number, max: number, y: number, color: readonly [number, number, number] = PRIMARY) {
  const w = Math.max(8, Math.min(118, (value / max) * 118))
  doc.setFontSize(8)
  doc.setTextColor(...FG)
  doc.text(label, 16, y)
  doc.setFillColor(245, 242, 239)
  doc.roundedRect(48, y - 4, 122, 5, 1.5, 1.5, 'F')
  doc.setFillColor(...color)
  doc.roundedRect(48, y - 4, w, 5, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text(String(value), 176, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
}

function interpolation(start: number, end: number, count: number) {
  return Array.from({ length: count }, (_, i) => start + ((end - start) / Math.max(1, count - 1)) * i)
}

export function generateReportPdf(options: {
  sections: ReportSection[]
  herdAvg: Record<string, number>
  benchmarks: Benchmarks
  trend: TrendData
  animals: DemoAnimal[]
  attention: readonly (readonly [string, string, number, number, string])[]
}): void {
  const { sections, herdAvg, benchmarks, trend, animals, attention } = options
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  page(doc, 'Resumo Executivo', 1)
  const kpis = [['HHP$', fmt('hhp', herdAvg.hhp)], ['GTPI', fmt('gtpi', herdAvg.gtpi)], ['NM$', fmt('nm', herdAvg.nm)], ['Animais', String(animals.length)]]
  kpis.forEach(([label, value], i) => {
    const x = 14 + i * 46
    doc.setFillColor(i === 0 ? 251 : 245, i === 0 ? 233 : 245, i === 0 ? 236 : 245)
    doc.roundedRect(x, 44, 40, 22, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(label, x + 20, 52, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...FG)
    doc.text(value, x + 20, 61, { align: 'center' })
    doc.setFont('helvetica', 'normal')
  })
  doc.setFontSize(9)
  doc.setTextColor(...FG)
  doc.text('O rebanho apresenta vantagem consistente em índices econômicos e produção, com pontos de atenção em características funcionais específicas.', 14, 82, { maxWidth: 182 })

  page(doc, 'Perfil Genético', 2)
  benchmarks.slice(0, 18).forEach(([key, label], i) => drawBar(doc, label, herdAvg[key] ?? 0, Math.max(1, Math.abs(herdAvg[key] ?? 0), 1000), 46 + i * 7, i < 6 ? PRIMARY : GREEN))

  page(doc, 'Evolução Temporal', 3)
  ;['hhp', 'gtpi', 'nm', 'milk'].forEach((key, block) => {
    const data = trend[key as keyof TrendData] as number[]
    const max = Math.max(...data)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(traitLabel[key], 14, 48 + block * 48)
    data.forEach((v, i) => {
      const h = (v / max) * 30
      const x = 44 + i * 18
      doc.setFillColor(...PRIMARY)
      doc.rect(x, 82 + block * 48 - h, 10, h, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(...MUTED)
      doc.text(String(trend.years[i]), x + 5, 87 + block * 48, { align: 'center' })
    })
  })

  page(doc, 'Rebanho vs Nacional', 4)
  benchmarks.slice(0, 12).forEach(([key, label, natAvg], i) => {
    const y = 48 + i * 10
    const val = herdAvg[key] ?? 0
    const max = Math.max(Math.abs(val), Math.abs(natAvg), 1)
    doc.setFontSize(8)
    doc.setTextColor(...FG)
    doc.text(label, 16, y)
    doc.setFillColor(...PRIMARY)
    doc.rect(52, y - 4, (Math.abs(val) / max) * 54, 4, 'F')
    doc.setFillColor(...MUTED)
    doc.rect(112, y - 4, (Math.abs(natAvg) / max) * 54, 4, 'F')
    doc.text(fmt(key, val), 172, y, { align: 'right' })
  })

  page(doc, 'Top 5 Animais', 5)
  animals.slice().sort((a, b) => b.hhp - a.hhp).slice(0, 5).forEach((animal, i) => {
    const y = 50 + i * 24
    doc.setFillColor(i === 0 ? 201 : 245, i === 0 ? 154 : 245, i === 0 ? 75 : 245)
    doc.circle(22, y - 2, 5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(String(i + 1), 22, y, { align: 'center' })
    doc.setTextColor(...FG)
    doc.text(animal.name, 34, y - 3)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(`${animal.sire} · HHP$ ${animal.hhp} · GTPI ${animal.gtpi}`, 34, y + 4)
  })

  page(doc, 'Características de Atenção', 6)
  attention.forEach(([code, name, current, target, hint], i) => {
    const y = 48 + i * 19
    doc.setFillColor(...AMBER)
    doc.circle(18, y - 2, 2.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...FG)
    doc.text(`${code} · ${name}`, 25, y - 3)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(`Atual ${current.toFixed(2)} · Ideal ${target.toFixed(2)} · ${hint}`, 25, y + 4)
  })

  const activeLabels = sections.filter((s) => s.enabled).map((s) => s.label).join(' · ')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(`Seções selecionadas: ${activeLabels}`, 14, 286, { maxWidth: 182 })
  if (!enabled(sections, 'temporal')) {
    const bench = benchmarks[0]
    interpolation(bench[2], bench[3], trend.years.length)
  }

  doc.save(`relatorio-genomico-${new Date().toISOString().split('T')[0]}.pdf`)
}
