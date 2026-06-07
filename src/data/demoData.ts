export interface DemoAnimal {
  id: string
  name: string
  sire: string
  gtpi: number
  nm: number
  hhp: number
  cm: number
  fm: number
  gm: number
  milk: number
  fat: number
  fat_pct: number
  prot: number
  prot_pct: number
  dpr: number
  pl: number
  scs: number
  hcr: number
  ccr: number
  liv: number
  sce: number
  ptat: number
  udc: number
  flc: number
  haps: [string, string][]
  [key: string]: string | number | [string, string][]
}

export interface RadarGroup {
  label: string
  traits: string[]
  names: string[]
  max: number[]
  inv?: number[]
  offset?: number[]
}

export interface BotijaoDemoItem {
  naab: string
  nome: string
  emp: string
  tipo: 'Convencional' | 'Sexado'
  doses: number
  preco: number
  Nov: number
  Prim: number
  Sec: number
  Mult: number
  Doa: number
  Int: number
  Rec: number
}

const defaults = {
  cm: 860, fm: 890, gm: 760, fat: 72, fat_pct: 0.15, prot: 54, prot_pct: 0.08,
  hcr: 1.5, ccr: 1.4, liv: 2.4, sce: 2.0, ptat: 0.46, udc: 0.40, flc: -0.70,
  fsav: 20, rfi: -60, cfp: 120, efc: 72, da: -0.1, ket: 0.0, mast: 4.4, met: 1.6,
  rp: 0.6, ssb: 5.0, dsb: 4.6, hliv: 1.8, fi: 1.4, gl: -0.5, sta: 0.52,
  str: 0.42, dfm: 0.18, rua: 0.92, rw: 0.38, rls: 0.21, rlr: 0.64, fta: 0.24,
  fls: 0.36, fua: 0.76, ruh: 0.44, ruw: 0.82, ucl: 0.30, udp: 0.16, ftp: 0.66,
  rtp: 0.28, ftl: 0.34, mf: 8.8, gfi: 10.8,
}

export const demoHerd: DemoAnimal[] = [
  { ...defaults, id: '7240', name: 'Sape Vitória 7240', sire: '7HO15264', gtpi: 2890, nm: 948, hhp: 948, milk: 2140, dpr: 2.4, pl: 6.8, scs: 2.71, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7102', name: 'Sape Estrela 7102', sire: '7HO14921', gtpi: 2841, nm: 933, hhp: 912, milk: 1980, dpr: 1.9, pl: 6.2, scs: 2.78, haps: [['HH1', 'free'], ['HH3', 'carr'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6988', name: 'Sape Diamante 6988', sire: '7HO15102', gtpi: 2812, nm: 905, hhp: 889, milk: 2260, dpr: 0.8, pl: 5.4, scs: 2.92, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'carr'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7311', name: 'Sape Princesa 7311', sire: '7HO15264', gtpi: 2776, nm: 884, hhp: 901, milk: 1840, dpr: 2.7, pl: 7.1, scs: 2.65, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'carr'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6754', name: 'Sape Aurora 6754', sire: '7HO14758', gtpi: 2729, nm: 861, hhp: 855, milk: 2010, dpr: 1.2, pl: 5.9, scs: 2.81, haps: [['HH1', 'carr'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7420', name: 'Sape Joia 7420', sire: '7HO15388', gtpi: 2698, nm: 842, hhp: 838, milk: 1760, dpr: 2.1, pl: 6.4, scs: 2.74, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6602', name: 'Sape Pérola 6602', sire: '7HO14921', gtpi: 2654, nm: 818, hhp: 826, milk: 1920, dpr: 0.6, pl: 5.1, scs: 2.95, haps: [['HH1', 'free'], ['HH3', 'carr'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'carr'], ['BLAD', 'free']] },
  { ...defaults, id: '7188', name: 'Sape Rainha 7188', sire: '7HO15102', gtpi: 2611, nm: 799, hhp: 804, milk: 1690, dpr: 2.9, pl: 7.4, scs: 2.62, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7501', name: 'Sape Safira 7501', sire: '7HO15388', gtpi: 2580, nm: 785, hhp: 792, milk: 1820, dpr: 1.6, pl: 5.7, scs: 2.84, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6890', name: 'Sape Lua 6890', sire: '7HO14758', gtpi: 2548, nm: 770, hhp: 778, milk: 1950, dpr: 1.0, pl: 5.3, scs: 2.88, haps: [['HH1', 'free'], ['HH3', 'carr'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7055', name: 'Sape Flor 7055', sire: '7HO15264', gtpi: 2520, nm: 758, hhp: 765, milk: 1710, dpr: 2.3, pl: 6.6, scs: 2.70, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7390', name: 'Sape Brisa 7390', sire: '7HO14921', gtpi: 2495, nm: 742, hhp: 751, milk: 2080, dpr: 0.4, pl: 4.9, scs: 2.97, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'carr'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6520', name: 'Sape Cristal 6520', sire: '7HO15102', gtpi: 2468, nm: 728, hhp: 738, milk: 1640, dpr: 2.5, pl: 7.0, scs: 2.68, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'carr'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7145', name: 'Sape Jade 7145', sire: '7HO15388', gtpi: 2440, nm: 715, hhp: 724, milk: 1880, dpr: 1.8, pl: 6.1, scs: 2.76, haps: [['HH1', 'carr'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6678', name: 'Sape Mel 6678', sire: '7HO14758', gtpi: 2415, nm: 701, hhp: 710, milk: 1790, dpr: 1.4, pl: 5.5, scs: 2.83, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'carr'], ['BLAD', 'free']] },
  { ...defaults, id: '7280', name: 'Sape Rubi 7280', sire: '7HO15264', gtpi: 2388, nm: 688, hhp: 696, milk: 1960, dpr: 0.9, pl: 5.2, scs: 2.90, haps: [['HH1', 'free'], ['HH3', 'carr'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '6445', name: 'Sape Neve 6445', sire: '7HO14921', gtpi: 2360, nm: 674, hhp: 682, milk: 1580, dpr: 2.6, pl: 6.9, scs: 2.66, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7468', name: 'Sape Coral 7468', sire: '7HO15102', gtpi: 2335, nm: 660, hhp: 668, milk: 1730, dpr: 1.1, pl: 5.6, scs: 2.86, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'carr']] },
  { ...defaults, id: '6812', name: 'Sape Oliva 6812', sire: '7HO15388', gtpi: 2310, nm: 648, hhp: 655, milk: 1850, dpr: 2.0, pl: 6.3, scs: 2.73, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'free'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
  { ...defaults, id: '7022', name: 'Sape Rosa 7022', sire: '7HO14758', gtpi: 2285, nm: 635, hhp: 642, milk: 1670, dpr: 1.7, pl: 5.8, scs: 2.79, haps: [['HH1', 'free'], ['HH3', 'free'], ['HH4', 'carr'], ['HCD', 'free'], ['Brachy', 'free'], ['BLAD', 'free']] },
]

export const HAVG: Record<string, number> = {
  gtpi: 2687, nm: 921, hhp: 874, cm: 860, fm: 890, gm: 760, milk: 1950, fat: 72,
  fat_pct: 0.15, prot: 54, prot_pct: 0.08, dpr: 1.7, pl: 6.0, scs: 2.80, hcr: 1.5,
  ccr: 1.4, liv: 2.4, sce: 2.0, ptat: 0.46, udc: 0.40, flc: -0.70, fsav: 20,
  rfi: -60, cfp: 120, efc: 72, da: -0.1, ket: 0.0, mast: 4.4, met: 1.6, rp: 0.6,
  ssb: 5.0, dsb: 4.6, hliv: 1.8, fi: 1.4, gl: -0.5, sta: 0.52, str: 0.42,
  dfm: 0.18, rua: 0.92, rw: 0.38, rls: 0.21, rlr: 0.64, fta: 0.24, fls: 0.36,
  fua: 0.76, ruh: 0.44, ruw: 0.82, ucl: 0.30, udp: 0.16, ftp: 0.66, rtp: 0.28,
  ftl: 0.34, mf: 8.8, gfi: 10.8,
}

export const radarGroups: Record<string, RadarGroup> = {
  indices: { label: 'Índices', traits: ['hhp', 'gtpi', 'nm', 'cm', 'fm', 'gm'], names: ['HHP$', 'GTPI', 'NM$', 'CM$', 'FM$', 'GM$'], max: [1100, 3200, 1100, 1050, 1050, 900] },
  prod: { label: 'Produção', traits: ['milk', 'fat', 'prot', 'fat_pct', 'prot_pct'], names: ['Leite', 'Gord', 'Prot', 'G%', 'P%'], max: [2800, 120, 80, 0.35, 0.15] },
  func: { label: 'Funcionais', traits: ['pl', 'dpr', 'scs', 'hcr', 'ccr', 'liv'], names: ['PL', 'DPR', 'SCS', 'HCR', 'CCR', 'LIV'], max: [9, 4, 1, 3, 3, 4], inv: [0, 0, 1, 0, 0, 0] },
  tipo: { label: 'Tipo', traits: ['ptat', 'udc', 'flc', 'sta', 'dfm', 'fua'], names: ['PTAT', 'UDC', 'FLC', 'STA', 'DFM', 'FUA'], max: [1, 0.8, 0, 1, 0.4, 1.2], offset: [0, 0, 1.2, 0, 0, 0] },
  saude: { label: 'Saúde', traits: ['mast', 'met', 'rp', 'da', 'ket', 'hliv'], names: ['MAST', 'MET', 'RP', 'DA', 'KET', 'H.LIV'], max: [7, 3, 1.2, 0.5, 0.5, 3.5] },
}

export const trend = {
  years: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
  hhp: [610, 648, 698, 742, 789, 838, 874], gtpi: [2310, 2398, 2467, 2541, 2602, 2671, 2734], nm: [712, 748, 791, 829, 861, 898, 936], cm: [680, 718, 762, 801, 841, 878, 905], fm: [695, 731, 778, 818, 860, 898, 933], gm: [580, 612, 648, 688, 725, 762, 798],
  milk: [1480, 1560, 1655, 1742, 1820, 1908, 1985], fat: [48, 52, 58, 64, 72, 80, 88], fat_pct: [0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.20], prot: [38, 42, 46, 51, 55, 59, 62], prot_pct: [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10],
  pl: [3.8, 4.2, 4.6, 5.1, 5.5, 6.0, 6.4], scs: [2.92, 2.89, 2.86, 2.83, 2.80, 2.77, 2.74], dpr: [0.4, 0.6, 0.9, 1.1, 1.4, 1.7, 2.0], hcr: [0.8, 1.0, 1.2, 1.4, 1.5, 1.7, 1.9], ccr: [0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8], liv: [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0], sce: [2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8],
  ptat: [0.22, 0.28, 0.34, 0.40, 0.46, 0.52, 0.58], udc: [0.18, 0.24, 0.30, 0.35, 0.40, 0.44, 0.48], flc: [-0.90, -0.84, -0.78, -0.74, -0.70, -0.66, -0.62],
  fsav: [12, 14, 16, 18, 20, 23, 27], rfi: [-42, -48, -52, -56, -60, -66, -73], cfp: [82, 88, 96, 104, 118, 138, 160], efc: [48, 52, 58, 64, 72, 82, 92],
  da: [-0.4, -0.3, -0.2, -0.2, -0.1, -0.1, 0.0], ket: [-0.3, -0.2, -0.2, -0.1, -0.1, 0.0, 0.0], mast: [2.8, 3.2, 3.6, 4.0, 4.4, 4.8, 5.3], met: [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.1], rp: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  ssb: [6.2, 5.9, 5.6, 5.3, 5.0, 4.7, 4.4], dsb: [5.8, 5.5, 5.2, 4.9, 4.6, 4.3, 4.0], hliv: [0.8, 1.0, 1.2, 1.5, 1.8, 2.1, 2.4], fi: [0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.9], gl: [-1.2, -1.0, -0.8, -0.6, -0.5, -0.4, -0.3],
  sta: [0.30, 0.35, 0.40, 0.46, 0.52, 0.58, 0.65], str: [0.20, 0.25, 0.30, 0.36, 0.42, 0.48, 0.55], dfm: [0.10, 0.12, 0.14, 0.16, 0.18, 0.20, 0.22], rua: [0.60, 0.68, 0.76, 0.84, 0.92, 1.00, 1.10], rw: [0.22, 0.26, 0.30, 0.34, 0.38, 0.42, 0.48], rls: [0.10, 0.12, 0.15, 0.18, 0.21, 0.24, 0.28], rlr: [0.40, 0.46, 0.52, 0.58, 0.64, 0.72, 0.82], fta: [0.12, 0.15, 0.18, 0.21, 0.24, 0.27, 0.30], fls: [0.20, 0.24, 0.28, 0.32, 0.36, 0.40, 0.45],
  fua: [0.50, 0.56, 0.62, 0.68, 0.76, 0.84, 0.92], ruh: [0.28, 0.32, 0.36, 0.40, 0.44, 0.50, 0.58], ruw: [0.52, 0.58, 0.66, 0.74, 0.82, 0.92, 1.02], ucl: [0.14, 0.18, 0.22, 0.26, 0.30, 0.34, 0.38], udp: [0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.20], ftp: [0.38, 0.44, 0.50, 0.58, 0.66, 0.74, 0.83], rtp: [0.12, 0.16, 0.20, 0.24, 0.28, 0.32, 0.38], ftl: [0.18, 0.22, 0.26, 0.30, 0.34, 0.38, 0.42],
  mf: [6.2, 6.8, 7.4, 8.1, 8.8, 9.6, 10.4], gfi: [8.4, 9.0, 9.6, 10.2, 10.8, 11.6, 12.4],
}

export const traitLabel: Record<string, string> = {
  hhp: 'HHP$', gtpi: 'GTPI', nm: 'NM$', cm: 'CM$', fm: 'FM$', gm: 'GM$', milk: 'Leite',
  fat: 'Gordura', fat_pct: 'Gord%', prot: 'Proteína', prot_pct: 'Prot%', pl: 'PL', dpr: 'DPR',
  scs: 'SCS', hcr: 'HCR', ccr: 'CCR', liv: 'LIV', sce: 'SCE', ptat: 'Tipo', udc: 'UDC',
  flc: 'FLC', fsav: 'F.Sav', rfi: 'RFI', cfp: 'CFP', efc: 'EFC', da: 'DA', ket: 'KET',
  mast: 'MAST', met: 'MET', rp: 'RP', ssb: 'SSB', dsb: 'DSB', hliv: 'H.LIV', fi: 'FI',
  gl: 'GL', sta: 'STA', str: 'STR', dfm: 'DFM', rua: 'RUA', rw: 'RW', rls: 'RLS', rlr: 'RLR',
  fta: 'FTA', fls: 'FLS', fua: 'FUA', ruh: 'RUH', ruw: 'RUW', ucl: 'UCL', udp: 'UDP',
  ftp: 'FTP', rtp: 'RTP', ftl: 'FTL', mf: 'MF', gfi: 'GFI',
}

export const proof = {
  ped: [['role', 'Pai:', 'Ocd Hayk Stagger-ET'], ['role', 'Mãe:', 'Badger Ssi Dominanc 6001-ET'], ['lact', '', '1-11 3X 305d 25.410M 5.3% 1352F 3.8% 969P'], ['role', 'Avô:', 'Sdg-Ph Delux Dominance-ET'], ['role', 'Avó:', 'Badger Ssi Rashan 17470-ET'], ['lact', '', '3-02 3X 305d 32.250M 5.7% 1.841F 3.5% 1.136P'], ['lact', '', 'Filhas: Badger Shf Cirrs 39462-P-ET (VG-85-VG-MS)'], ['lact', '', '1-10 3X 338d 33.830M 4.4% 1.499F 3.5% 1.200P'], ['role', 'Bisavô:', 'S-S-I Renegade Rashan-ET'], ['role', 'Bisavó:', 'Badger Ssi 15631 16330-ET'], ['lact', '', '4-04 3X 305d 31.530M 4.6% 1.461F 3.3% 1.046P'], ['role', 'PGS:', 'Welcome-Tel Taos Hayk-ET'], ['role', 'PGD:', 'Ocd Gameday Soy 64855-ET (VG-86-VG-MS-DOM)']],
  lin: [['Estatura', 0.69, 'T'], ['Caract. Leiteira', 0.20, 'D'], ['Força', 0.55, 'S'], ['Profundidade Corporal', 0.50, 'D'], ['Largura de Garupa', 0.48, 'W'], ['Ângulo de Garupa', 1.10, 'S'], ['Pernas Tras. V. Lateral', 0.25, 'S'], ['Pernas Tras. V. Trás', 0.82, 'H'], ['Ângulo do Casco', 0.28, 'L'], ['Escore de Pernas e Pés', 0.45, 'L'], ['Úbere Anterior, Inserção', 1.02, 'S'], ['Altura Úbere Posterior', 0.58, 'H'], ['Largura Úbere Posterior', 1.11, 'W'], ['Ligamento Central', 0.35, 'W'], ['Profundidade de Úbere', 0.16, 'S'], ['Coloc. Tetos Anteriores', 0.83, 'C'], ['Coloc. Tetos Post. V. Lateral', 0.27, 'C'], ['Comprimento de Tetos', 0.37, 'S']] as [string, number, string][],
  sections: [
    { t: 'Produção', meta: '(PTA-lbs) · 04/26 CDCB-S Gen. Eval.', rows: [['Leite', '+897', '80% C / 0 F / 0 R'], ['Proteína', '+62', '% Proteína +0.12'], ['Gordura', '+122', '% Gordura +0.31'], ['CFP', '+184', ''], ['ML$', '+$1.124', '72%C'], ['MQ$', '+$1.180', 'Mérito Fluido $ +$996'], ['GM$', '+$1.093', 'Veloc. Ord. 7.07 / 62%C'], ['Feed Saved', '+27', '46%C'], ['RFI', '-73', '26%C']] },
    { t: 'Tipo', meta: '(PTA) · 04/26 CDCB-S/HA Gen. Eval.', rows: [['GTPI', '+3547', 'Age Adjusted Avg. N/A'], ['Tipo', '+0.64', '79% Conf / 0 D / 0 H'], ['UDC', '+0.48', 'CPC +0.28'], ['FLC', '-0.73', '']] },
    { t: 'Aptidão', meta: '', rows: [['HHP$®', '+$1.309', ''], ['Células Somáticas', '2.65', '76%C'], ['Vida Produtiva', '+5.7', '75%C'], ['Permanência', '+1.2', '72%C'], ['Livability Novilhas', '+0.2', '62%C'], ['Índice Prenhez Filhas', '+0.6', '74%C'], ['Heifer Conception Rate', '+1.9', '73%C · 0 Filhas'], ['Cow Conception Rate', '+2.0', '74%C · 0 Filhas'], ['Índice de Fertilidade', '+1.9', '74%C']] },
    { t: 'Bem Estar', meta: '', rows: [['Mastite', '+5.3', '72%C · 0 Filhas'], ['Metrite', '+2.1', '69%C · 0 Filhas'], ['Ret. de Placenta', '+0.8', '69%C · 0 Filhas'], ['Desp. Abomaso.', '-0.2', '71%C · 0 Filhas'], ['Cetose', '-0.2', '68%C · 0 Filhas'], ['Febre de leite', '-0.2', '61%C · 0 Filhas']] },
    { t: 'Avaliação Facilidade', meta: '(% DBH)', rows: [['Facilidade de Parto do Touro', '1.6', '63%C · 0 Obs'], ['Fac. de Parto das Filhas', '1.7', '57%C · 0 Filhas'], ['Mortes ao Nascer - Touros', '4.4', '61%C · 0 Obs'], ['Mortes ao Nascer - Filhas', '3.4', '56%C · 0 Filhas'], ['Duração Gestação', '-0.7', '73%C · 0 Filhas'], ['Início do primeiro parto', '+7.0', '72%C · 0 Filhas']] },
  ],
}

export const botijaoDemo: BotijaoDemoItem[] = [
  { naab: '7HO15264', nome: 'S-S-I Stagger Baelum-ET', emp: 'Select Sires', tipo: 'Convencional', doses: 24, preco: 85, Nov: 6, Prim: 8, Sec: 4, Mult: 6, Doa: 0, Int: 0, Rec: 0 },
  { naab: '7HO14921', nome: 'Sdg-Ph Delux Dominance', emp: 'Select Sires', tipo: 'Sexado', doses: 18, preco: 140, Nov: 10, Prim: 4, Sec: 2, Mult: 2, Doa: 0, Int: 0, Rec: 0 },
  { naab: '7HO15102', nome: 'Welcome-Tel Taos Hayk', emp: 'Select Sires', tipo: 'Convencional', doses: 19, preco: 78, Nov: 2, Prim: 2, Sec: 1, Mult: 1, Doa: 4, Int: 4, Rec: 5 },
  { naab: '7HO15388', nome: 'Ocd Gameday Soy', emp: 'GenEx', tipo: 'Sexado', doses: 12, preco: 120, Nov: 4, Prim: 2, Sec: 1, Mult: 1, Doa: 0, Int: 0, Rec: 4 },
  { naab: '250HO16021', nome: 'Peak Altahotrod', emp: 'Alta', tipo: 'Convencional', doses: 12, preco: 72, Nov: 0, Prim: 0, Sec: 0, Mult: 0, Doa: 3, Int: 5, Rec: 4 },
]

export const agSteps = [{ n: 0, t: 'Parentesco' }, { n: 1, t: 'Top Pais' }, { n: 3, t: 'Progressão' }, { n: 6, t: 'Distribuição' }, { n: 7, t: 'Evolução vs Nacional' }, { n: 8, t: 'Scatter Plot' }, { n: 9, t: 'Análise de Forças' }]

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
  ['prot', 'Proteína', 40, 52, 62],
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

export function fmt(trait: string, value: number): string {
  const dec = ['dpr', 'pl', 'ptat', 'udc', 'flc', 'hcr', 'ccr', 'liv', 'sce', 'fat_pct', 'prot_pct', 'da', 'ket', 'met', 'rp', 'gl', 'sta', 'str', 'dfm', 'rua', 'rw', 'rls', 'rlr', 'fta', 'fls', 'fua', 'ruh', 'ruw', 'ucl', 'udp', 'ftp', 'rtp', 'ftl']
  if (['nm', 'hhp', 'cm', 'fm', 'gm'].includes(trait)) return `$${value}`
  if (trait === 'scs') return value.toFixed(2)
  if (dec.includes(trait)) return `${value > 0 ? '+' : ''}${value.toFixed(2)}`
  if (['mf', 'gfi', 'mast', 'ssb', 'dsb', 'hliv', 'fi'].includes(trait)) return value.toFixed(1)
  return `${value > 0 ? '+' : ''}${value}`
}

export function initials(name: string): string {
  const parts = name.split(' ')
  const digit = name.match(/\d/)?.[0] ?? ''
  return `${parts[1]?.[0] ?? parts[0]?.[0] ?? '?'}${digit}`.toUpperCase()
}
