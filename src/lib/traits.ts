export interface RadarGroup {
  label: string
  traits: string[]
  names: string[]
  max: number[]
  inv?: number[]
  offset?: number[]
}

// Holstein fallback; runtime usa useBreed().
const radarGroupData: Record<string, Omit<RadarGroup, 'label' | 'names'> & { labelKey: string; traits: string[] }> = {
  indices: { labelKey: 'traits.group.indices', traits: ['hhp', 'gtpi', 'nm', 'cm', 'fm', 'gm'], max: [1100, 3200, 1100, 1050, 1050, 900] },
  prod: { labelKey: 'traits.group.production', traits: ['milk', 'fat', 'prot', 'fat_pct', 'prot_pct'], max: [2800, 120, 80, 0.35, 0.15] },
  func: { labelKey: 'traits.group.functional', traits: ['pl', 'dpr', 'scs', 'hcr', 'ccr', 'liv'], max: [9, 4, 1, 3, 3, 4], inv: [0, 0, 1, 0, 0, 0] },
  tipo: { labelKey: 'traits.group.type', traits: ['ptat', 'udc', 'flc', 'sta', 'dfm', 'fua'], max: [1, 0.8, 0, 1, 0.4, 1.2], offset: [0, 0, 1.2, 0, 0, 0] },
  saude: { labelKey: 'traits.group.health', traits: ['mast', 'met', 'rp', 'da', 'ket', 'hliv'], max: [7, 3, 1.2, 0.5, 0.5, 3.5] },
}
export function getRadarGroups(): Record<string, RadarGroup> {
  return Object.fromEntries(Object.entries(radarGroupData).map(([key, group]) => [key, { ...group, label: translate(group.labelKey), names: group.traits.map((trait) => traitLabel[trait] ?? trait.toUpperCase()) }]))
}
export const radarGroups: Record<string, RadarGroup> = new Proxy({} as Record<string, RadarGroup>, { get: (_, key: string) => getRadarGroups()[key], ownKeys: () => Reflect.ownKeys(radarGroupData), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) }) // i18n-ignore (codigo, sem texto)

// REFERÊNCIA NACIONAL DA RAÇA (Holstein US) — não é dado do cliente. Fonte: médias oficiais.
export const trend = {
  years: ["2022","2023","2024","2025","2026"],
  gtpi: [2490.71, 2575.62, 2660.53, 2745.44, 2830.35],
  nm: [377.83, 390.71, 403.59, 416.47, 429.35],
  hhp: [383.17, 396.23, 409.29, 422.36, 435.42],
  cm: [393.76, 407.19, 420.61, 434.04, 447.46],
  fm: [341.92, 353.57, 365.23, 376.88, 388.54],
  gm: [353.63, 365.68, 377.74, 389.79, 401.85],
  milk: [395.43, 408.91, 422.39, 435.87, 449.35],
  fat: [37.07, 38.33, 39.59, 40.86, 42.12],
  fat_pct: [0.08, 0.08, 0.08, 0.09, 0.09],
  prot: [21.32, 22.05, 22.78, 23.5, 24.23],
  prot_pct: [0.04, 0.04, 0.04, 0.04, 0.04],
  dpr: [-0.85, -0.88, -0.91, -0.94, -0.97],
  pl: [2.02, 2.08, 2.15, 2.22, 2.29],
  scs: [3.07, 3.01, 2.95, 2.9, 2.84],
  hcr: [0.77, 0.79, 0.82, 0.84, 0.87],
  ccr: [-0.25, -0.25, -0.26, -0.27, -0.28],
  liv: [0.1, 0.1, 0.1, 0.11, 0.11],
  sce: [1.54, 1.52, 1.49, 1.46, 1.43],
  ptat: [0.01, 0.01, 0.01, 0.01, 0.01],
  udc: [0.27, 0.28, 0.29, 0.3, 0.31],
  flc: [-0.29, -0.3, -0.31, -0.32, -0.33],
  fsav: [63.4, 65.56, 67.72, 69.88, 72.04],
  rfi: [-16.59, -17.15, -17.72, -18.28, -18.85],
  cfp: [58.28, 60.27, 62.26, 64.24, 66.23],
  efc: [1.89, 1.96, 2.02, 2.09, 2.15],
  da: [90.24, 93.31, 96.39, 99.46, 102.54],
  ket: [88.88, 91.91, 94.94, 97.97, 101],
  mast: [1.49, 1.54, 1.59, 1.64, 1.69],
  met: [0.56, 0.58, 0.6, 0.62, 0.64],
  rp: [-0.2, -0.21, -0.22, -0.22, -0.23],
  ssb: [3.81, 3.74, 3.67, 3.6, 3.53],
  dsb: [3.83, 3.76, 3.69, 3.62, 3.55],
  hliv: [0.38, 0.39, 0.4, 0.42, 0.43],
  fi: [-0.18, -0.19, -0.2, -0.2, -0.21],
  gl: [0.16, 0.16, 0.17, 0.17, 0.18],
  mf: [0.1, 0.1, 0.1, 0.11, 0.11],
  gfi: [229.99, 237.83, 245.67, 253.51, 261.35],
  sta: [-0.24, -0.25, -0.25, -0.26, -0.27],
  str: [-0.34, -0.35, -0.37, -0.38, -0.39],
  dfm: [-0.16, -0.16, -0.17, -0.17, -0.18],
  rua: [-0.03, -0.03, -0.03, -0.03, -0.03],
  rw: [-0.11, -0.11, -0.11, -0.12, -0.12],
  rls: [-0.12, -0.13, -0.13, -0.14, -0.14],
  rlr: [-0.44, -0.45, -0.47, -0.48, -0.5],
  fta: [-0.01, -0.01, -0.01, -0.01, -0.01],
  fls: [-0.26, -0.27, -0.28, -0.29, -0.3],
  fua: [0.41, 0.43, 0.44, 0.46, 0.47],
  ruh: [0.3, 0.31, 0.32, 0.33, 0.34],
  ruw: [0.08, 0.08, 0.08, 0.09, 0.09],
  ucl: [-0.06, -0.06, -0.07, -0.07, -0.07],
  udp: [0.33, 0.34, 0.35, 0.36, 0.37],
  ftp: [0.14, 0.15, 0.15, 0.16, 0.16],
  rtp: [0.14, 0.15, 0.15, 0.16, 0.16],
  ftl: [-0.33, -0.34, -0.35, -0.36, -0.37],
}

const traitLabelKeys: Record<string, string> = {
  hhp: 'HHP$', gtpi: 'GTPI', nm: 'NM$', cm: 'CM$', fm: 'FM$', gm: 'GM$', milk: 'Leite',
  fat: 'Gordura', fat_pct: 'Gord%', prot: 'Proteína', prot_pct: 'Prot%', pl: 'PL', dpr: 'DPR', // i18n-ignore (reserva pt-BR; a traducao vem de translate)
  scs: 'SCS', hcr: 'HCR', ccr: 'CCR', liv: 'LIV', sce: 'SCE', ptat: 'Tipo', udc: 'UDC',
  flc: 'FLC', fsav: 'F.Sav', rfi: 'RFI', cfp: 'CFP', efc: 'EFC', da: 'DA', ket: 'KET',
  mast: 'MAST', met: 'MET', rp: 'RP', ssb: 'SSB', dsb: 'DSB', hliv: 'H.LIV', fi: 'FI', fsc: 'FSC',
  gl: 'GL', sta: 'STA', str: 'STR', dfm: 'DFM', rua: 'RUA', rw: 'RW', rls: 'RLS', rlr: 'RLR',
  fta: 'FTA', fls: 'FLS', fua: 'FUA', ruh: 'RUH', ruw: 'RUW', ucl: 'UCL', udp: 'UDP',
  ftp: 'FTP', rtp: 'RTP', ftl: 'FTL', mf: 'MF', gfi: 'GFI',
}
export function getTraitLabel(trait: string): string {
  return translate(`traits.${trait}`) === `traits.${trait}` ? traitLabelKeys[trait] ?? trait.toUpperCase() : translate(`traits.${trait}`)
}
export const traitLabel: Record<string, string> = new Proxy({} as Record<string, string>, { get: (_, key: string) => getTraitLabel(key), ownKeys: () => Reflect.ownKeys(traitLabelKeys), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) }) // i18n-ignore (codigo, sem texto)

const agStepKeys = [{ n: 0, key: 'steps.kinship' }, { n: 1, key: 'steps.topParents' }, { n: 3, key: 'steps.progress' }, { n: 6, key: 'steps.distribution' }, { n: 7, key: 'steps.evolution' }, { n: 8, key: 'steps.matrix' }, { n: 9, key: 'steps.strengths' }]
export function getAgSteps() { return agStepKeys.map((step) => ({ n: step.n, t: translate(step.key) })) }

// REFERÊNCIA NACIONAL DA RAÇA (Holstein US) — não é dado do cliente. Fonte: médias oficiais.
export const benchmarks: [string, string, number, number, number][] = [
  ['hhp', 'HHP$', 680, 850, 950],
  ['gtpi', 'GTPI', 2450, 2650, 2800],
  ['nm', 'NM$', 720, 880, 960],
  ['cm', 'CM$', 650, 830, 920],
  ['fm', 'FM$', 670, 860, 940],
  ['gm', 'GM$', 560, 730, 810],
  ['milk', 'Leite', 1500, 1900, 2200],
  ['fat', 'Gordura', 55, 70, 85],
  ['fat_pct', 'Gord%', 0.08, 0.14, 0.20],
  ['prot', 'Proteína', 40, 52, 62], // i18n-ignore (reserva pt-BR; a traducao vem de translate)
  ['prot_pct', 'Prot%', 0.04, 0.07, 0.10],
  ['cfp', 'CFP', 80, 115, 155],
  ['fsav', 'F.Sav', 10, 18, 25],
  ['rfi', 'RFI', -40, -58, -72],
  ['efc', 'EFC', 45, 68, 88],
  ['pl', 'PL', 4.0, 5.8, 7.0],
  ['dpr', 'DPR', 0.5, 1.5, 2.5],
  ['scs', 'SCS', 2.90, 2.78, 2.70],
  ['hcr', 'HCR', 0.6, 1.4, 2.0],
  ['ccr', 'CCR', 0.5, 1.3, 1.9],
  ['liv', 'LIV', 1.0, 2.2, 3.2],
  ['hliv', 'H.LIV', 0.6, 1.6, 2.4],
  ['fi', 'FI', 0.5, 1.2, 1.8],
  ['gl', 'GL', -0.2, -0.5, -0.8],
  ['sce', 'SCE', 2.5, 2.0, 1.7],
  ['ssb', 'SSB', 6.5, 5.0, 4.2],
  ['dsb', 'DSB', 6.0, 4.6, 3.8],
  ['mf', 'MF', 6.0, 8.5, 10.5],
  ['ptat', 'Tipo', 0.20, 0.40, 0.55],
  ['udc', 'UDC', 0.15, 0.35, 0.48],
  ['flc', 'FLC', -0.90, -0.72, -0.60],
  ['sta', 'STA', 0.25, 0.48, 0.65],
  ['str', 'STR', 0.18, 0.38, 0.52],
  ['dfm', 'DFM', 0.08, 0.16, 0.22],
  ['rua', 'RUA', 0.50, 0.85, 1.10],
  ['fua', 'FUA', 0.40, 0.72, 0.95],
  ['ruw', 'RUW', 0.45, 0.78, 1.02],
  ['ftp', 'FTP', 0.30, 0.60, 0.82],
  ['mast', 'MAST', 2.5, 4.0, 5.5],
  ['met', 'MET', 0.6, 1.4, 2.2],
  ['rp', 'RP', 0.2, 0.5, 0.8],
  ['da', 'DA', -0.5, -0.1, 0.0],
  ['ket', 'KET', -0.4, -0.1, 0.0],
  ['gfi', 'GFI', 7.5, 10.2, 12.5],
]

export const DEMO_TO_FEMALE: Record<string, string> = {
  gtpi: 'tpi', jpi: 'jpi', nm: 'nm_dollar', hhp: 'hhp_dollar', cm: 'cm_dollar', fm: 'fm_dollar', gm: 'gm_dollar',
  milk: 'ptam', fat: 'ptaf', fat_pct: 'ptaf_pct', prot: 'ptap', prot_pct: 'ptap_pct',
  dpr: 'dpr', pl: 'pl', scs: 'scs', hcr: 'hcr', ccr: 'ccr', liv: 'liv', sce: 'sce',
  ptat: 'ptat', udc: 'udc', jui: 'jui', flc: 'flc', fsav: 'f_sav', rfi: 'rfi', cfp: 'cfp', efc: 'efc',
  da: 'da', ket: 'ket', mast: 'mast', met: 'met', rp: 'rp', ssb: 'ssb', dsb: 'dsb', hliv: 'h_liv',
  fi: 'fi', fsc: 'fsc', gl: 'gl', mf: 'mf', gfi: 'gfi', sta: 'sta', str: 'str', dfm: 'dfm',
  rua: 'rua', rw: 'rw', rls: 'rls', rlr: 'rlr', fta: 'fta', fls: 'fls', fua: 'fua', ruh: 'ruh', ruw: 'ruw',
  ucl: 'ucl', udp: 'udp', ftp: 'ftp', rtp: 'rtp', ftl: 'ftl',
  sire: 'sire_naab', mgs: 'mgs_naab', mmgs: 'mmgs_naab', mggs: 'mmgs_naab', name: 'name', id: 'ear_tag', // i18n-ignore (reserva pt-BR; a traducao vem de translate)
}

export function femaleTrait(f: Record<string, unknown>, demoKey: string): number | null {
  const field = DEMO_TO_FEMALE[demoKey] ?? demoKey
  const value = f[field]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
// Regra de casas decimais alinhada ao ToolSS (src/utils/ptaFormat.ts):
// características de grandeza decimal (decimal/centesimal/milesimal) -> 2 casas;
// índices e $ -> inteiro. Nada de valor cru com casas inconsistentes.
export function fmt(trait: string, value: number): string {
  // 2 casas decimais (traits de magnitude decimal)
  const dec = ['dpr', 'pl', 'ptat', 'udc', 'flc', 'hcr', 'ccr', 'liv', 'sce', 'dce', 'fat_pct', 'prot_pct',
    'da', 'ket', 'met', 'rp', 'gl', 'sta', 'str', 'dfm', 'rua', 'rw', 'rls', 'rlr', 'fta', 'fls', 'fua',
    'ruh', 'ruw', 'ucl', 'udp', 'ftp', 'rtp', 'ftl', 'mf', 'gfi', 'mast', 'ssb', 'dsb', 'hliv', 'fi', 'fsc',
    'rfi', 'efc', 'fsav', 'f_sav', 'bwc', 'bd']
  // índices em $ -> inteiro com prefixo
  if (['nm', 'hhp', 'cm', 'fm', 'gm'].includes(trait)) return `$${Math.round(value)}`
  // índices/PTAs de produção -> inteiro com sinal
  if (['gtpi', 'tpi', 'jpi', 'jui', 'milk', 'fat', 'prot', 'cfp'].includes(trait)) return `${value > 0 ? '+' : ''}${Math.round(value)}`
  // SCS -> 2 casas, sem sinal (menor é melhor)
  if (trait === 'scs') return value.toFixed(2)
  if (dec.includes(trait)) return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
  // fallback: inteiro se for inteiro, senão 2 casas (nunca valor cru)
  return Number.isInteger(value) ? `${value > 0 ? '+' : ''}${value}` : `${value > 0 ? '+' : ''}${value.toFixed(2)}`
}

export function initials(name: string): string {
  const parts = name.split(' ')
  const digit = name.match(/\d/)?.[0] ?? ''
  return `${parts[1]?.[0] ?? parts[0]?.[0] ?? '?'}${digit}`.toUpperCase()
}

import { translate } from '@/i18n'
