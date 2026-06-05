import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DemoAnimal } from '@/data/demoData'
import { proof, fmt } from '@/data/demoData'

const PRIMARY = [206, 14, 45] as const // #CE0E2D
const FG = [28, 28, 28] as const
const MUTED = [140, 140, 140] as const

function drawHeader(doc: jsPDF, animal: DemoAnimal) {
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Select Sires', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Prova Genômica Individual', 14, 19)
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 196, 12, { align: 'right' })
  doc.text('Base CDCB-S · 04/2026', 196, 19, { align: 'right' })

  doc.setTextColor(...FG)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(animal.name, 14, 38)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text(`HO840329657664 · 99% RHA-I · Brinco ${animal.id} · Pai: ${animal.sire}`, 14, 44)
}

function drawIndices(doc: jsPDF, animal: DemoAnimal, y: number): number {
  const indices = [
    ['HHP$', `$${animal.hhp}`],
    ['GTPI', `+${animal.gtpi}`],
    ['NM$', `$${animal.nm}`],
    ['CM$', `$${animal.cm}`],
    ['FM$', `$${animal.fm}`],
    ['GM$', `$${animal.gm}`],
  ]
  const w = 29
  indices.forEach(([label, val], i) => {
    const x = 14 + i * (w + 2)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(x, y, w, 14, 1, 1, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(label, x + w / 2, y + 5, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(...FG)
    doc.setFont('helvetica', 'bold')
    doc.text(val, x + w / 2, y + 11, { align: 'center' })
    doc.setFont('helvetica', 'normal')
  })
  return y + 18
}

function drawPedigree(doc: jsPDF, y: number): number {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...FG)
  doc.text('PEDIGREE', 14, y)
  doc.setDrawColor(...FG)
  doc.setLineWidth(0.4)
  doc.line(14, y + 1, 100, y + 1)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  for (const p of proof.ped) {
    if (p[0] === 'lact') {
      doc.setTextColor(...MUTED)
      doc.text(`    ${p[2]}`, 16, y)
    } else {
      doc.setTextColor(...PRIMARY)
      doc.text(`${p[1]}`, 16, y)
      doc.setTextColor(...FG)
      doc.text(` ${p[2]}`, 16 + doc.getTextWidth(`${p[1]} `), y)
    }
    y += 3.5
    if (y > 275) break
  }
  return y + 2
}

function drawLinear(doc: jsPDF, startY: number): number {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...FG)
  doc.text('LINEAR', 106, startY)
  doc.setDrawColor(...FG)
  doc.setLineWidth(0.4)
  doc.line(106, startY + 1, 196, startY + 1)
  let y = startY + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  for (const [name, val] of proof.lin) {
    doc.setTextColor(...FG)
    doc.text(String(name), 106, y)
    // bar
    const barX = 150
    const barW = 30
    const mid = barX + barW / 2
    doc.setFillColor(240, 240, 240)
    doc.rect(barX, y - 2, barW, 2.5, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.line(mid, y - 2, mid, y + 0.5)
    const v = Number(val)
    const half = Math.min(Math.abs(v) / 2, 1) * (barW / 2)
    const bx = v >= 0 ? mid : mid - half
    doc.setFillColor(...PRIMARY)
    doc.rect(bx, y - 2, half, 2.5, 'F')
    doc.setTextColor(...FG)
    doc.text(v.toFixed(2), 184, y, { align: 'right' })
    y += 3.5
    if (y > 275) break
  }
  return y + 2
}

function drawSections(doc: jsPDF, startY: number) {
  let y = startY
  for (const section of proof.sections) {
    if (y > 255) { doc.addPage(); y = 20 }
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...FG)
    doc.text(section.t.toUpperCase(), 14, y)
    if (section.meta) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(section.meta, 196, y, { align: 'right' })
    }
    doc.setDrawColor(...FG)
    doc.setLineWidth(0.4)
    doc.line(14, y + 1, 196, y + 1)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    for (const row of section.rows) {
      if (y > 280) { doc.addPage(); y = 20 }
      doc.setTextColor(...FG)
      doc.text(row[0], 16, y)
      doc.setFont('helvetica', 'bold')
      doc.text(row[1], 110, y, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(row[2], 114, y)
      y += 3.8
    }
    y += 3
  }
}

export function generateProofPdf(animal: DemoAnimal) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  drawHeader(doc, animal)
  let y = drawIndices(doc, animal, 50)
  y += 2
  drawPedigree(doc, y)
  drawLinear(doc, y)
  const maxPedY = Math.max(y + proof.ped.length * 3.5 + 4, y + proof.lin.length * 3.5 + 4)
  drawSections(doc, maxPedY + 4)
  // Haplotypes footer
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(
    animal.haps.map((h) => `${h[0]}: ${h[1] === 'free' ? 'Livre' : 'Portador'}`).join(' · '),
    14,
    285,
  )
  doc.save(`prova-${animal.name.replace(/\s+/g, '-')}.pdf`)
}

export function generateCatalogPdf(animals: DemoAnimal[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  // Header
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 297, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Select Sires · Catálogo Genômico', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${animals.length} fêmeas · Gerado ${new Date().toLocaleDateString('pt-BR')}`, 283, 13, { align: 'right' })

  const head = [['#', 'Nome', 'Brinco', 'Pai', 'HHP$', 'GTPI', 'NM$', 'Leite', 'Gord', 'Prot', 'PL', 'DPR', 'SCS', 'PTAT', 'UDC', 'FLC', 'Haplótipos']]
  const body = animals.map((a, i) => [
    i + 1,
    a.name,
    a.id,
    a.sire,
    fmt('hhp', a.hhp),
    fmt('gtpi', a.gtpi),
    fmt('nm', a.nm),
    fmt('milk', a.milk),
    fmt('fat', a.fat),
    fmt('prot', a.prot),
    fmt('pl', a.pl),
    fmt('dpr', a.dpr),
    a.scs.toFixed(2),
    fmt('ptat', a.ptat),
    fmt('udc', a.udc),
    fmt('flc', a.flc),
    a.haps.map((h) => `${h[0]}:${h[1] === 'free' ? 'L' : 'P'}`).join(' '),
  ])

  autoTable(doc, {
    startY: 25,
    head,
    body,
    styles: { fontSize: 7, cellPadding: 1.5, font: 'helvetica' },
    headStyles: { fillColor: [...PRIMARY], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 38 },
      4: { fontStyle: 'bold' },
      5: { fontStyle: 'bold' },
    },
  })

  doc.save(`catalogo-genomico-${new Date().toISOString().split('T')[0]}.pdf`)
}
