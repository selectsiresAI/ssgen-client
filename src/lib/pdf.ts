import jsPDF from 'jspdf'
import type { FemaleFull } from '@/lib/api'
import { buildProofFromFemale } from '@/lib/proof'

const PRIMARY = [206, 14, 45] as const
const FG = [28, 28, 28] as const
const MUTED = [140, 140, 140] as const

// Compact spacings to fit everything on one page
const LH_PED = 3      // pedigree line height
const LH_LIN = 3      // linear line height
const LH_ROW = 3.2    // section row height
const SEC_GAP = 1.5    // gap between sections
const SEC_HEAD = 4     // section header height

function label(animal: FemaleFull) {
  return animal.name ?? animal.ear_tag ?? animal.id
}

function drawHeader(doc: jsPDF, animal: FemaleFull, subtitle?: string) {
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, 210, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Select Sires', 14, 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle ?? 'Prova Genômica Individual', 14, 16)
  doc.text(`Gerado: ${new Date().toLocaleDateString('pt-BR')}`, 196, 10, { align: 'right' })
  doc.text('Predição Pedigree', 196, 16, { align: 'right' })

  doc.setTextColor(...FG)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(label(animal), 14, 28)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text(`Brinco ${animal.ear_tag ?? '-'} · ${animal.breed ?? '-'} · Pai: ${animal.sire_naab ?? '-'}`, 14, 33)
}

function drawIndices(doc: jsPDF, animal: FemaleFull, y: number): number {
  const indices = [
    ['HHP$', animal.hhp_dollar != null ? `$${animal.hhp_dollar}` : '-'],
    ['GTPI', animal.tpi != null ? `+${animal.tpi}` : '-'],
    ['NM$', animal.nm_dollar != null ? `$${animal.nm_dollar}` : '-'],
    ['CM$', animal.cm_dollar != null ? `$${animal.cm_dollar}` : '-'],
    ['FM$', animal.fm_dollar != null ? `$${animal.fm_dollar}` : '-'],
    ['GM$', animal.gm_dollar != null ? `$${animal.gm_dollar}` : '-'],
  ]
  const w = 29
  const h = 11
  indices.forEach(([label, val], i) => {
    const x = 14 + i * (w + 1)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F')
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text(label, x + w / 2, y + 4, { align: 'center' })
    doc.setFontSize(9.5)
    doc.setTextColor(...FG)
    doc.setFont('helvetica', 'bold')
    doc.text(val, x + w / 2, y + 9, { align: 'center' })
    doc.setFont('helvetica', 'normal')
  })
  return y + h + 5
}

function drawPedigree(doc: jsPDF, y: number, ped: string[][]): number {
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...FG)
  doc.text('PEDIGREE', 14, y)
  doc.setDrawColor(...FG)
  doc.setLineWidth(0.3)
  doc.line(14, y + 1, 100, y + 1)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  for (const p of ped) {
    if (p[0] === 'lact') {
      doc.setTextColor(...MUTED)
      doc.text(`    ${p[2]}`, 16, y)
    } else {
      doc.setTextColor(...PRIMARY)
      doc.text(`${p[1]}`, 16, y)
      doc.setTextColor(...FG)
      doc.text(` ${p[2]}`, 16 + doc.getTextWidth(`${p[1]} `), y)
    }
    y += LH_PED
  }
  return y + 1
}

function drawLinear(doc: jsPDF, startY: number, lin: [string, number, string][]): number {
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...FG)
  doc.text('LINEAR', 106, startY)
  doc.setDrawColor(...FG)
  doc.setLineWidth(0.3)
  doc.line(106, startY + 1, 196, startY + 1)
  let y = startY + 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  for (const [name, val] of lin) {
    doc.setTextColor(...FG)
    doc.text(String(name), 106, y)
    const barX = 150
    const barW = 28
    const mid = barX + barW / 2
    doc.setFillColor(240, 240, 240)
    doc.rect(barX, y - 1.8, barW, 2, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.line(mid, y - 1.8, mid, y + 0.2)
    const v = Number(val)
    const half = Math.min(Math.abs(v) / 2, 1) * (barW / 2)
    const bx = v >= 0 ? mid : mid - half
    doc.setFillColor(...PRIMARY)
    doc.rect(bx, y - 1.8, half, 2, 'F')
    doc.setTextColor(...FG)
    doc.text(v.toFixed(2), 182, y, { align: 'right' })
    y += LH_LIN
  }
  return y + 1
}

function drawSections(doc: jsPDF, startY: number, sections: { t: string; meta: string; rows: string[][] }[]) {
  let y = startY
  for (const section of sections) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...FG)
    doc.text(section.t.toUpperCase(), 14, y)
    if (section.meta) {
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(section.meta, 196, y, { align: 'right' })
    }
    doc.setDrawColor(...FG)
    doc.setLineWidth(0.3)
    doc.line(14, y + 1, 196, y + 1)
    y += SEC_HEAD
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    for (const row of section.rows) {
      doc.setTextColor(...FG)
      doc.text(row[0], 16, y)
      doc.setFont('helvetica', 'bold')
      doc.text(row[1], 110, y, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED)
      doc.text(row[2], 114, y)
      y += LH_ROW
    }
    y += SEC_GAP
  }
  return y
}

function drawOnePage(doc: jsPDF, animal: FemaleFull, subtitle?: string) {
  const animalProof = buildProofFromFemale(animal)
  drawHeader(doc, animal, subtitle)
  let y = drawIndices(doc, animal, 36)
  const pedLinY = y
  drawPedigree(doc, pedLinY, animalProof.ped)
  const linEndY = drawLinear(doc, pedLinY, animalProof.lin)
  const pedEndY = pedLinY + animalProof.ped.length * LH_PED + 5
  const contentY = Math.max(pedEndY, linEndY) + 1
  const secEndY = drawSections(doc, contentY, animalProof.sections)

  const footerY = Math.max(secEndY + 2, 278)
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.text(
    `Beta caseína: ${animal.beta_casein ?? '-'} · Kappa caseína: ${animal.kappa_casein ?? '-'}`,
    14,
    Math.min(footerY, 288),
  )
}

export function generateProofPdf(animal: FemaleFull) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  drawOnePage(doc, animal)
  doc.save(`prova-${label(animal).replace(/\s+/g, '-')}.pdf`)
}

export function generateCatalogPdf(animals: FemaleFull[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  animals.forEach((animal, idx) => {
    if (idx > 0) doc.addPage()
    drawOnePage(doc, animal, `Catálogo Genômico · Fêmea ${idx + 1} de ${animals.length}`)
  })
  doc.save(`catalogo-genomico-${animals.length}-femeas-${new Date().toISOString().split('T')[0]}.pdf`)
}
