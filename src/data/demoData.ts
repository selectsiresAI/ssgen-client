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

export const demoHerd: DemoAnimal[] = [
  { id: '1', name: 'MELARRY S-S-I 2948 12580-ET X CHERRYPENCOL JIMBO-ET', sire: '007HO15198', gtpi: 2725, nm: 384, hhp: 372, cm: 396, fm: 357, gm: 354, milk: 331, fat: 23, fat_pct: 0.04, prot: 17, prot_pct: 0.02, dpr: -1.10, pl: 2.60, scs: 2.88, hcr: 1.80, ccr: 0, liv: 1.60, sce: 1.50, ptat: -0.39, udc: 0.03, flc: -0.58, fsav: 157, rfi: -39, cfp: 40, efc: 3.60, da: 106, ket: 104, mast: 3.50, met: 1, rp: -0.70, ssb: 3.50, dsb: 3.40, hliv: 0.90, fi: 0.10, gl: 0.20, mf: 0, gfi: 252, sta: -0.71, str: -0.97, dfm: -0.92, rua: -0.43, rw: -1.04, rls: -0.80, rlr: -0.90, fta: 0.10, fls: -0.66, fua: 0.52, ruh: 0.09, ruw: -0.96, ucl: -0.89, udp: 0.64, ftp: -0.48, rtp: -0.81, ftl: -0.67, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '2', name: 'HOUIN S-S-I 16 376-ET X AURORA RAGNAR-ET', sire: '007HO15115', gtpi: 2776, nm: 413, hhp: 438, cm: 435, fm: 366, gm: 374, milk: 546, fat: 18, fat_pct: -0.02, prot: 28, prot_pct: 0.04, dpr: -0.20, pl: 3.70, scs: 2.75, hcr: 1.80, ccr: 0.70, liv: 2.20, sce: 1.50, ptat: -0.73, udc: -0.01, flc: -1.18, fsav: 56, rfi: -3, cfp: 46, efc: 1.70, da: 106, ket: 103, mast: 2.50, met: 0.30, rp: -0.30, ssb: 3.30, dsb: 3.40, hliv: 1.50, fi: 0.50, gl: -0.10, mf: 0, gfi: 391, sta: -0.80, str: -0.89, dfm: -1.25, rua: 0.77, rw: 0.28, rls: -0.86, rlr: -1.50, fta: -0.40, fls: -1.19, fua: -0.16, ruh: -0.42, ruw: -0.65, ucl: 0.27, udp: 0.45, ftp: 0.08, rtp: 0.64, ftl: -0.63, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '3', name: 'S-S-I HD 4795 392-ET X HORSENS SSI SOLUTION LON-ET', sire: '007HO14904', gtpi: 2732, nm: 424, hhp: 399, cm: 445, fm: 379, gm: 388, milk: 370, fat: 36, fat_pct: 0.08, prot: 22, prot_pct: 0.04, dpr: -1.20, pl: 2.50, scs: 2.75, hcr: 0.90, ccr: -0.80, liv: 0.20, sce: 1.60, ptat: -0.80, udc: -0.03, flc: -1.17, fsav: 138, rfi: -84, cfp: 58, efc: 2, da: 104, ket: 102, mast: 1.70, met: 1, rp: 0.10, ssb: 3.50, dsb: 3.70, hliv: 0.90, fi: -0.50, gl: 0.80, mf: 0, gfi: 207, sta: -0.90, str: -0.50, dfm: -0.86, rua: 0.79, rw: -0.56, rls: 1.12, rlr: -1.98, fta: -0.62, fls: -1.05, fua: 0.36, ruh: -0.24, ruw: -0.52, ucl: -0.58, udp: -0.08, ftp: 0.31, rtp: 0.24, ftl: -0.98, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '4', name: 'MELARRY SSI FANDA 12340-ET X AOT SILVER HELIX-ET', sire: '014HO07770', gtpi: 2804, nm: 282, hhp: 334, cm: 286, fm: 269, gm: 276, milk: 1048, fat: 63, fat_pct: 0.07, prot: 35, prot_pct: 0, dpr: -1.70, pl: -0.80, scs: 3.02, hcr: -1.10, ccr: -1.60, liv: -6.90, sce: 1.60, ptat: 0.44, udc: 0.20, flc: 0, fsav: -120, rfi: 70, cfp: 98, efc: 0.60, da: 100, ket: 98, mast: -0.80, met: 0.90, rp: -0.20, ssb: 4.10, dsb: 3.80, hliv: 0.30, fi: -1.40, gl: -0.60, mf: 0.10, gfi: -102, sta: 0.71, str: 0.41, dfm: 0.26, rua: 0.07, rw: -0.37, rls: 0.99, rlr: 0.19, fta: 0.29, fls: 0.15, fua: 0.11, ruh: 0.42, ruw: 0.25, ucl: 0.68, udp: 0.43, ftp: 0.45, rtp: 0.70, ftl: 0.43, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '5', name: 'S-S-I MONTOYA 7679 10010-ET X OCD HELIX FORTE-ET', sire: '007HO14319', gtpi: 2638, nm: 220, hhp: 253, cm: 239, fm: 180, gm: 185, milk: -6, fat: 36, fat_pct: 0.14, prot: 10, prot_pct: 0.04, dpr: -1.70, pl: 0.10, scs: 2.76, hcr: -1.90, ccr: -1.90, liv: 0.10, sce: 1.70, ptat: 0.30, udc: 0.36, flc: -0.71, fsav: -16, rfi: -14, cfp: 46, efc: -0.30, da: 101, ket: 96, mast: 1.90, met: -0.40, rp: -0.40, ssb: 3.90, dsb: 3.40, hliv: -0.10, fi: -1.60, gl: 0.80, mf: 0.10, gfi: 147, sta: 0.91, str: -0.13, dfm: -0.07, rua: 0.43, rw: 0.28, rls: -0.80, rlr: -0.38, fta: 0.78, fls: -0.49, fua: 0.81, ruh: 0.36, ruw: -0.54, ucl: 0.79, udp: 1.38, ftp: 1.07, rtp: 1.20, ftl: -0.64, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '6', name: 'S-S-I MONTOYA 8237 10052-ET X RMD-DOTTERER SSI MAXIMUS-ET', sire: '007HO14859', gtpi: 2826, nm: 485, hhp: 340, cm: 495, fm: 461, gm: 473, milk: 875, fat: 41, fat_pct: 0.02, prot: 33, prot_pct: 0.02, dpr: -2.20, pl: 1, scs: 2.96, hcr: 0.40, ccr: -1.10, liv: -0.50, sce: 1.40, ptat: -0.02, udc: 0.59, flc: -0.86, fsav: 300, rfi: -61, cfp: 74, efc: 3.20, da: 102, ket: 96, mast: -1, met: 1.20, rp: -0.20, ssb: 3.20, dsb: 3.30, hliv: 0.60, fi: -1, gl: -0.10, mf: 0, gfi: 102, sta: -0.01, str: -1.31, dfm: 1.05, rua: 1.38, rw: 0.21, rls: 0.74, rlr: -1.22, fta: -0.47, fls: -0.68, fua: 0.26, ruh: 1.41, ruw: 0.51, ucl: 0.10, udp: -0.11, ftp: 0.84, rtp: 0.84, ftl: -0.24, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '7', name: 'S-S-I MOOLA 8001 10061-ET X RMD-DOTTERER SSI MAXIMUS-ET', sire: '007HO14859', gtpi: 2804, nm: 522, hhp: 362, cm: 534, fm: 495, gm: 510, milk: 466, fat: 42, fat_pct: 0.08, prot: 21, prot_pct: 0.02, dpr: -1.40, pl: 2.20, scs: 2.89, hcr: 0.50, ccr: -0.60, liv: 0.80, sce: 1.30, ptat: -0.42, udc: 0.44, flc: -0.46, fsav: 350, rfi: -36, cfp: 63, efc: 3.70, da: 104, ket: 98, mast: -0.30, met: 1.10, rp: -0.50, ssb: 3.60, dsb: 3.20, hliv: 0.30, fi: -0.40, gl: -0.90, mf: 0.10, gfi: 239, sta: -1.18, str: -1.82, dfm: 0.38, rua: 0.09, rw: -0.28, rls: 0.63, rlr: -0.91, fta: -0.74, fls: -0.57, fua: -0.17, ruh: 0.93, ruw: 0.31, ucl: -0.13, udp: -0.61, ftp: 0.43, rtp: 0.41, ftl: -0.34, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '8', name: 'RMD-DOTTERER SSI 4067-ET X LARS-ACRES S-S-I STANNIS-ET', sire: '007HO14951', gtpi: 2790, nm: 283, hhp: 339, cm: 297, fm: 253, gm: 245, milk: 840, fat: 16, fat_pct: -0.06, prot: 33, prot_pct: 0.02, dpr: -1.60, pl: 2, scs: 2.83, hcr: 1.20, ccr: -0.10, liv: -0.80, sce: 1.30, ptat: -0.02, udc: 0.31, flc: 0.24, fsav: -22, rfi: -5, cfp: 49, efc: 3, da: 105, ket: 104, mast: 1.60, met: 1.40, rp: 0.30, ssb: 3.30, dsb: 4.40, hliv: 0.50, fi: -0.20, gl: 0.10, mf: 0.20, gfi: 245, sta: -0.50, str: 0.07, dfm: -0.70, rua: 0, rw: -0.30, rls: -0.28, rlr: 0.05, fta: 0.08, fls: 0.15, fua: 0.25, ruh: 0.22, ruw: 0.51, ucl: 0.05, udp: -0.07, ftp: 0.26, rtp: 0.42, ftl: -0.63, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '9', name: 'BADGER S-S-I 15534 16251-ET X LARS-ACRES S-S-I STANNIS-ET', sire: '007HO14951', gtpi: 2791, nm: 407, hhp: 443, cm: 431, fm: 352, gm: 377, milk: 376, fat: 24, fat_pct: 0.03, prot: 25, prot_pct: 0.05, dpr: -1.20, pl: 3.10, scs: 2.76, hcr: 0.70, ccr: 0.60, liv: -0.40, sce: 1.40, ptat: -0.38, udc: 0.03, flc: -0.18, fsav: 161, rfi: -126, cfp: 49, efc: 2.60, da: 104, ket: 103, mast: 3.10, met: 0.40, rp: -0.20, ssb: 3.30, dsb: 3.90, hliv: 0.90, fi: 0.10, gl: 1.10, mf: 0.10, gfi: 322, sta: -0.74, str: -0.35, dfm: -0.97, rua: -0.26, rw: -1.05, rls: -0.45, rlr: -0.62, fta: 0.02, fls: -0.24, fua: 0.20, ruh: 0.10, ruw: -0.25, ucl: -0.79, udp: 0.09, ftp: -0.24, rtp: -0.50, ftl: -0.81, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '10', name: 'S-S-I RENEGDE 8237 10618-ET X CHERRYPENCOL JIMBO-ET', sire: '007HO15198', gtpi: 2799, nm: 358, hhp: 417, cm: 371, fm: 327, gm: 339, milk: 496, fat: 28, fat_pct: 0.02, prot: 23, prot_pct: 0.03, dpr: -0.80, pl: 2.40, scs: 2.85, hcr: 1.40, ccr: 0.50, liv: -0.80, sce: 1.50, ptat: -0.02, udc: 0.18, flc: 0.01, fsav: 58, rfi: 4, cfp: 50, efc: 2.90, da: 104, ket: 104, mast: 3.60, met: 1.20, rp: -0.70, ssb: 3.60, dsb: 3.40, hliv: 0.60, fi: 0.30, gl: 0.50, mf: 0, gfi: 245, sta: -0.47, str: -0.58, dfm: -0.77, rua: -0.37, rw: -0.81, rls: -0.38, rlr: -0.03, fta: 0.26, fls: -0.14, fua: 0.53, ruh: 0.23, ruw: -0.58, ucl: -0.50, udp: 0.73, ftp: -0.40, rtp: -0.60, ftl: 0.11, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '11', name: 'S-S-I AZTEC 11371 10741-ET X BOMAZ TOP DOG-ET', sire: '007HO15069', gtpi: 2904, nm: 525, hhp: 589, cm: 554, fm: 460, gm: 478, milk: 480, fat: 58, fat_pct: 0.14, prot: 32, prot_pct: 0.06, dpr: -0.80, pl: 2.90, scs: 2.78, hcr: 0.60, ccr: -0.40, liv: 0.70, sce: 1.40, ptat: -0.33, udc: -0.33, flc: -0.44, fsav: -36, rfi: -61, cfp: 90, efc: 3.50, da: 102, ket: 105, mast: 1.70, met: 0.60, rp: -0.90, ssb: 3.60, dsb: 3.30, hliv: -0.30, fi: 0, gl: -0.30, mf: 0, gfi: 429, sta: 0.10, str: 0.23, dfm: -0.95, rua: -0.28, rw: 0.01, rls: -1.11, rlr: -0.03, fta: 0.54, fls: -0.50, fua: 0.30, ruh: -0.03, ruw: -0.43, ucl: -1.51, udp: 0.11, ftp: -0.91, rtp: -1.57, ftl: 0.16, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '12', name: 'BADGER SSI 15631 16327-ET X MELARRY EISAKU FANTASTIC-ET', sire: '007HO15151', gtpi: 2824, nm: 457, hhp: 431, cm: 479, fm: 407, gm: 420, milk: 123, fat: 50, fat_pct: 0.17, prot: 18, prot_pct: 0.05, dpr: -1.20, pl: 2.40, scs: 2.89, hcr: 1.70, ccr: -0.70, liv: 1, sce: 1.60, ptat: 0.08, udc: 0.50, flc: -0.25, fsav: 80, rfi: -16, cfp: 68, efc: 1.70, da: 104, ket: 102, mast: 1.20, met: 0, rp: -0.10, ssb: 3.60, dsb: 3.50, hliv: 0.60, fi: -0.40, gl: 0.80, mf: 0.20, gfi: 378, sta: -0.74, str: -0.30, dfm: -0.30, rua: -1.39, rw: -0.60, rls: 0.02, rlr: -0.68, fta: -0.13, fls: -0.30, fua: 0.93, ruh: 0.18, ruw: 0.01, ucl: 0.07, udp: 0.56, ftp: 0.19, rtp: 0.07, ftl: -0.77, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '13', name: 'S-S-I BG 38814 16401-ET X MELARRY EISAKU FANTASTIC-ET', sire: '007HO15151', gtpi: 2883, nm: 494, hhp: 508, cm: 523, fm: 430, gm: 449, milk: 95, fat: 53, fat_pct: 0.18, prot: 20, prot_pct: 0.06, dpr: -1.20, pl: 3, scs: 2.80, hcr: 2.10, ccr: -0.50, liv: 1.30, sce: 1.50, ptat: 0.13, udc: 0.46, flc: -0.15, fsav: 30, rfi: 8, cfp: 73, efc: 1.70, da: 104, ket: 102, mast: 2.10, met: 0.50, rp: 0, ssb: 3.50, dsb: 3.40, hliv: 0.40, fi: -0.30, gl: 0.60, mf: 0.20, gfi: 378, sta: -0.72, str: -0.18, dfm: -0.42, rua: -1.54, rw: -0.45, rls: 0.02, rlr: -0.42, fta: -0.14, fls: -0.23, fua: 0.97, ruh: 0.01, ruw: 0.17, ucl: -0.10, udp: 0.56, ftp: 0.04, rtp: -0.22, ftl: -0.67, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '14', name: 'S-S-I BG 2671 16402-ET X LARS-ACRES S-S-I STANNIS-ET', sire: '007HO14951', gtpi: 2830, nm: 464, hhp: 428, cm: 478, fm: 435, gm: 421, milk: 563, fat: 26, fat_pct: 0.02, prot: 24, prot_pct: 0.02, dpr: -1.40, pl: 3.70, scs: 2.83, hcr: 1.20, ccr: 0.20, liv: 1.10, sce: 1.20, ptat: -0.16, udc: 0.39, flc: 0.03, fsav: 170, rfi: -74, cfp: 50, efc: 2.80, da: 106, ket: 105, mast: 2.20, met: 1.20, rp: 0.30, ssb: 3, dsb: 3.80, hliv: 1.10, fi: 0, gl: 0.60, mf: 0.20, gfi: 223, sta: -1.05, str: -0.75, dfm: -0.68, rua: -0.40, rw: -0.23, rls: -0.06, rlr: -0.64, fta: -0.41, fls: -0.04, fua: 0.26, ruh: 0.35, ruw: -0.02, ucl: -0.07, udp: 0.15, ftp: -0.03, rtp: 0.19, ftl: 0.12, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '15', name: 'S-S-I LEGACY 8804 10972-ET X MELARRY EISAKU FANTASTIC-ET', sire: '007HO15151', gtpi: 2836, nm: 419, hhp: 441, cm: 444, fm: 363, gm: 381, milk: 82, fat: 41, fat_pct: 0.14, prot: 17, prot_pct: 0.05, dpr: -0.70, pl: 2.90, scs: 2.80, hcr: 1.90, ccr: -0.10, liv: 1.10, sce: 1.50, ptat: 0.22, udc: 0.61, flc: -0.32, fsav: 18, rfi: -2, cfp: 58, efc: 2.10, da: 105, ket: 103, mast: 1.90, met: 0.20, rp: 0, ssb: 3.60, dsb: 3.60, hliv: 0.70, fi: 0.10, gl: 0.70, mf: 0.20, gfi: 368, sta: -0.46, str: -0.14, dfm: -0.48, rua: -1.50, rw: -0.35, rls: -0.27, rlr: -0.60, fta: 0.06, fls: -0.32, fua: 1.14, ruh: 0.26, ruw: 0.12, ucl: 0.18, udp: 0.93, ftp: 0.19, rtp: 0.12, ftl: -0.55, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '16', name: 'S-S-I LEGACY 8804 10973-ET X BOMAZ TOP DOG-ET', sire: '007HO15069', gtpi: 2910, nm: 487, hhp: 571, cm: 516, fm: 423, gm: 442, milk: 196, fat: 52, fat_pct: 0.17, prot: 22, prot_pct: 0.06, dpr: 0.10, pl: 3.90, scs: 2.69, hcr: 0.20, ccr: 0.90, liv: 1, sce: 1.40, ptat: -0.10, udc: 0.33, flc: -0.37, fsav: -99, rfi: 39, cfp: 74, efc: 2.70, da: 102, ket: 104, mast: 2, met: -0.10, rp: -0.90, ssb: 3.90, dsb: 3.60, hliv: 0.20, fi: 0.70, gl: -0.40, mf: 0, gfi: 507, sta: -0.16, str: -0.01, dfm: -1.07, rua: -0.11, rw: -0.10, rls: -1.56, rlr: -0.05, fta: 0.69, fls: -0.46, fua: 0.78, ruh: 0.40, ruw: 0.04, ucl: -0.34, udp: 0.56, ftp: 0.02, rtp: -0.48, ftl: -0.27, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '17', name: 'S-S-I LEGACY 4273 11240-ET X MELARRY EISAKU FANTASTIC-ET', sire: '007HO15151', gtpi: 2839, nm: 439, hhp: 423, cm: 463, fm: 383, gm: 407, milk: -1, fat: 47, fat_pct: 0.18, prot: 16, prot_pct: 0.06, dpr: -0.80, pl: 2.50, scs: 2.91, hcr: 2.10, ccr: -0.20, liv: 1.20, sce: 1.50, ptat: 0.29, udc: 0.67, flc: -0.10, fsav: 56, rfi: -2, cfp: 63, efc: 1.90, da: 104, ket: 102, mast: 1.10, met: 0.20, rp: -0.10, ssb: 3.60, dsb: 3.40, hliv: 0.70, fi: 0, gl: 0.80, mf: 0.20, gfi: 378, sta: -0.69, str: -0.30, dfm: -0.33, rua: -1.66, rw: -0.38, rls: 0.05, rlr: -0.43, fta: 0, fls: -0.17, fua: 1.30, ruh: 0.33, ruw: 0.16, ucl: -0.07, udp: 0.83, ftp: 0.19, rtp: 0, ftl: -0.67, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '18', name: 'S-S-I RIVET 11371 11299-ET X MELARRY EISAKU FANTASTIC-ET', sire: '007HO15151', gtpi: 2845, nm: 460, hhp: 443, cm: 480, fm: 415, gm: 413, milk: 298, fat: 45, fat_pct: 0.12, prot: 21, prot_pct: 0.04, dpr: -1.60, pl: 2.30, scs: 2.85, hcr: 2.10, ccr: -1.50, liv: 1.10, sce: 1.70, ptat: 0.35, udc: 0.50, flc: -0.11, fsav: 103, rfi: -93, cfp: 66, efc: 3, da: 105, ket: 104, mast: 2, met: 0.70, rp: -0.10, ssb: 3.60, dsb: 3.30, hliv: 0.50, fi: -0.80, gl: 0.50, mf: 0.30, gfi: 277, sta: -0.23, str: -0.01, dfm: -0.16, rua: -0.85, rw: -0.21, rls: 0.75, rlr: -0.31, fta: -0.19, fls: -0.08, fua: 0.70, ruh: 0.54, ruw: 0.36, ucl: -0.09, udp: 0.59, ftp: -0.02, rtp: 0.10, ftl: -0.60, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '19', name: 'S-S-I POSITIV 5600 11527-ET X LARCREST CAPTIVATING-ET', sire: '250HO15156', gtpi: 2807, nm: 333, hhp: 355, cm: 348, fm: 296, gm: 298, milk: 513, fat: 53, fat_pct: 0.12, prot: 26, prot_pct: 0.03, dpr: -1.50, pl: 0, scs: 2.95, hcr: 0.60, ccr: -2.80, liv: -1, sce: 1.50, ptat: 0.75, udc: 0.47, flc: -0.26, fsav: -49, rfi: -38, cfp: 79, efc: 0.90, da: 101, ket: 100, mast: 2.30, met: 0.40, rp: 0, ssb: 3.80, dsb: 3.60, hliv: -0.10, fi: -1.60, gl: -0.10, mf: 0.10, gfi: -13, sta: 1.62, str: 0.58, dfm: 0.83, rua: 1.84, rw: 0.66, rls: -0.74, rlr: 0.32, fta: 0.54, fls: 0.10, fua: 0.82, ruh: 0.86, ruw: 1.03, ucl: 0.51, udp: 0.85, ftp: 1.14, rtp: 1.54, ftl: -1.46, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '20', name: 'S-S-I ASCENSION 3082-ET X PERLE', sire: '014HO15865', gtpi: 2834, nm: 459, hhp: 424, cm: 488, fm: 391, gm: 443, milk: -236, fat: 55, fat_pct: 0.25, prot: 12, prot_pct: 0.07, dpr: -0.30, pl: 2.80, scs: 2.83, hcr: 0.90, ccr: 0.70, liv: -0.50, sce: 1.20, ptat: -0.04, udc: 0.14, flc: 0.15, fsav: 58, rfi: 19, cfp: 67, efc: 2.10, da: 101, ket: 101, mast: 1.40, met: 1.60, rp: 0.40, ssb: 3.30, dsb: 3.50, hliv: 0, fi: 0.50, gl: -0.60, mf: 0.10, gfi: 484, sta: -0.43, str: -0.67, dfm: -0.54, rua: 1.04, rw: -0.39, rls: 0.37, rlr: -0.06, fta: -0.43, fls: 0.13, fua: 0.20, ruh: -0.33, ruw: -0.71, ucl: 0.42, udp: 0.97, ftp: 0.90, rtp: 1.29, ftl: -0.80, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '21', name: 'S-S-I HOLYSMOKES 4490-ET X MASTER-ET', sire: '007HO13010', gtpi: 2155, nm: -222, hhp: -248, cm: -233, fm: -197, gm: -174, milk: -347, fat: -31, fat_pct: -0.06, prot: -18, prot_pct: -0.02, dpr: 1.90, pl: -0.40, scs: 3, hcr: 0.90, ccr: 2.70, liv: 0.20, sce: 1.50, ptat: -1.10, udc: -1.34, flc: -0.69, fsav: 60, rfi: 22, cfp: -49, efc: -0.80, da: 96, ket: 94, mast: -1.10, met: -0.10, rp: 0.20, ssb: 4.30, dsb: 5.10, hliv: 0.30, fi: 1.90, gl: 0.70, mf: -0.20, gfi: 58, sta: -0.71, str: -0.71, dfm: -0.68, rua: 0.73, rw: -0.67, rls: -0.52, rlr: -0.98, fta: -0.63, fls: -0.72, fua: -1.41, ruh: -1.28, ruw: -1.47, ucl: -0.82, udp: -1.43, ftp: -0.81, rtp: -0.81, ftl: 0.77, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '22', name: 'S-S-I JALAPENO 1779 4641-ET X SOYSAUCE-ET', sire: '250HO15988', gtpi: 3062, nm: 539, hhp: 599, cm: 562, fm: 484, gm: 512, milk: 1094, fat: 58, fat_pct: 0.04, prot: 49, prot_pct: 0.05, dpr: -0.90, pl: 2.50, scs: 2.93, hcr: -0.30, ccr: -0.30, liv: -2.40, sce: 1.40, ptat: 0.74, udc: 0.75, flc: 0.23, fsav: -15, rfi: 20, cfp: 106, efc: 1.20, da: 101, ket: 102, mast: 0.90, met: 1, rp: 0.20, ssb: 3.50, dsb: 3.20, hliv: -0.10, fi: -0.40, gl: 0.80, mf: -0.10, gfi: 183, sta: 0.42, str: 0.06, dfm: 0.72, rua: 1.10, rw: 1.15, rls: -0.33, rlr: 0.36, fta: 0.20, fls: 0.32, fua: 0.89, ruh: 1.03, ruw: 1.29, ucl: 0.39, udp: 0.47, ftp: -0.11, rtp: 0.11, ftl: 0.42, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '23', name: 'S-S-I CUMULUS 2435 5018-ET X VICARIOUSLY-ET', sire: '014HO16681', gtpi: 3098, nm: 695, hhp: 688, cm: 720, fm: 637, gm: 678, milk: 909, fat: 74, fat_pct: 0.13, prot: 43, prot_pct: 0.05, dpr: -1.50, pl: 2.20, scs: 2.83, hcr: 0.40, ccr: -0.50, liv: -0.70, sce: 1.20, ptat: 0.41, udc: 0.60, flc: 0.02, fsav: 191, rfi: -15, cfp: 116, efc: 2.30, da: 99, ket: 98, mast: 2.50, met: 0.60, rp: -0.20, ssb: 3.40, dsb: 2.90, hliv: -0.10, fi: -0.50, gl: -0.80, mf: 0, gfi: 294, sta: 0.09, str: -0.71, dfm: 1.52, rua: 0.14, rw: 0.87, rls: 0.48, rlr: -0.26, fta: 0.06, fls: 0.13, fua: 0.23, ruh: 1.17, ruw: 1.21, ucl: 0.15, udp: 0.06, ftp: 0.08, rtp: 0.09, ftl: -0.41, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '24', name: 'S-S-I MAGNUM 2526 4945-ET X RIMBOT', sire: '007HO16644', gtpi: 3226, nm: 859, hhp: 852, cm: 865, fm: 850, gm: 824, milk: 1764, fat: 94, fat_pct: 0.08, prot: 54, prot_pct: -0.01, dpr: -2.30, pl: 2.50, scs: 2.79, hcr: 0.10, ccr: -1.40, liv: -0.50, sce: 1.20, ptat: 0.66, udc: 0.89, flc: -0.47, fsav: 201, rfi: -22, cfp: 148, efc: 2.30, da: 94, ket: 93, mast: 2.30, met: 0.50, rp: -0.30, ssb: 3.30, dsb: 3.30, hliv: 0.20, fi: -1.20, gl: -0.70, mf: 0, gfi: 164, sta: 0.18, str: -0.67, dfm: 1.39, rua: -0.31, rw: 0.08, rls: 0.46, rlr: -0.63, fta: -0.01, fls: -0.28, fua: 0.91, ruh: 1.25, ruw: 1.19, ucl: 0.39, udp: 0.63, ftp: 0.21, rtp: 0.22, ftl: -0.42, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '25', name: 'S-S-I OVERDO 2024 4892-ET X LOGIC-ET', sire: '007HO14037', gtpi: 2733, nm: 203, hhp: 336, cm: 222, fm: 163, gm: 171, milk: -122, fat: 17, fat_pct: 0.08, prot: 6, prot_pct: 0.04, dpr: 0.50, pl: 2.10, scs: 2.72, hcr: 0.70, ccr: 0.40, liv: 2.10, sce: 1.20, ptat: 0.25, udc: 0.64, flc: 0.38, fsav: -168, rfi: 45, cfp: 23, efc: 3.60, da: 105, ket: 105, mast: 3.60, met: 0.50, rp: -0.50, ssb: 3.20, dsb: 3.60, hliv: 0, fi: 0.80, gl: -0.10, mf: 0, gfi: 247, sta: -0.13, str: 0.38, dfm: -0.96, rua: -0.31, rw: 0.47, rls: -2.24, rlr: 0.77, fta: 1.05, fls: 0.28, fua: 1.02, ruh: 0.51, ruw: 0.33, ucl: -0.01, udp: 0.72, ftp: 0.59, rtp: 0.68, ftl: 0.02, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] },
  { id: '26', name: 'S-S-I JALAPENO 1554 4546-ET X DRIVE FELIX-ET', sire: '007HO16396', gtpi: 3118, nm: 774, hhp: 784, cm: 796, fm: 723, gm: 764, milk: 930, fat: 76, fat_pct: 0.14, prot: 41, prot_pct: 0.04, dpr: -0.40, pl: 3.20, scs: 2.80, hcr: 1.70, ccr: 0.80, liv: 1.70, sce: 1.30, ptat: 0.22, udc: 0.56, flc: -1.12, fsav: 211, rfi: -26, cfp: 117, efc: 1.90, da: 101, ket: 98, mast: 2, met: 0.20, rp: -0.50, ssb: 3.40, dsb: 3.40, hliv: -0.10, fi: 0.50, gl: 0.40, mf: -0.10, gfi: 392, sta: -0.34, str: -0.78, dfm: 1.22, rua: 0.26, rw: 0.71, rls: 1.03, rlr: -1.93, fta: -0.74, fls: -0.83, fua: 0.53, ruh: 0.56, ruw: 0.93, ucl: -0.03, udp: 0.14, ftp: 0.18, rtp: 0.23, ftl: -0.17, haps: [["HH1","free"],["HH3","free"],["HH4","free"],["HCD","free"],["Brachy","free"],["BLAD","free"]] }
]

export const HAVG: Record<string, number> = {
  gtpi: 2830, nm: 429, hhp: 435, cm: 447, fm: 389, gm: 402, milk: 449, fat: 42.1, fat_pct: 0.09, prot: 24.2, prot_pct: 0.04, dpr: -0.97, pl: 2.29, scs: 2.84, hcr: 0.87, ccr: -0.28, liv: 0.11, sce: 1.43, ptat: 0.01, udc: 0.31, flc: -0.33, fsav: 72.0, rfi: -18.9, cfp: 66.2, efc: 2.15, da: 103, ket: 101, mast: 1.69, met: 0.64, rp: -0.23, ssb: 3.53, dsb: 3.55, hliv: 0.43, fi: -0.21, gl: 0.18, mf: 0.11, gfi: 261, sta: -0.27, str: -0.39, dfm: -0.18, rua: -0.03, rw: -0.12, rls: -0.14, rlr: -0.50, fta: -0.01, fls: -0.30, fua: 0.47, ruh: 0.34, ruw: 0.09, ucl: -0.07, udp: 0.37, ftp: 0.16, rtp: 0.16, ftl: -0.37
}

export const radarGroups: Record<string, RadarGroup> = {
  indices: { label: 'Índices', traits: ['hhp', 'gtpi', 'nm', 'cm', 'fm', 'gm'], names: ['HHP$', 'GTPI', 'NM$', 'CM$', 'FM$', 'GM$'], max: [1100, 3200, 1100, 1050, 1050, 900] },
  prod: { label: 'Produção', traits: ['milk', 'fat', 'prot', 'fat_pct', 'prot_pct'], names: ['Leite', 'Gord', 'Prot', 'G%', 'P%'], max: [2800, 120, 80, 0.35, 0.15] },
  func: { label: 'Funcionais', traits: ['pl', 'dpr', 'scs', 'hcr', 'ccr', 'liv'], names: ['PL', 'DPR', 'SCS', 'HCR', 'CCR', 'LIV'], max: [9, 4, 1, 3, 3, 4], inv: [0, 0, 1, 0, 0, 0] },
  tipo: { label: 'Tipo', traits: ['ptat', 'udc', 'flc', 'sta', 'dfm', 'fua'], names: ['PTAT', 'UDC', 'FLC', 'STA', 'DFM', 'FUA'], max: [1, 0.8, 0, 1, 0.4, 1.2], offset: [0, 0, 1.2, 0, 0, 0] },
  saude: { label: 'Saúde', traits: ['mast', 'met', 'rp', 'da', 'ket', 'hliv'], names: ['MAST', 'MET', 'RP', 'DA', 'KET', 'H.LIV'], max: [7, 3, 1.2, 0.5, 0.5, 3.5] },
}

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
  ped: [['role', 'Pai:', 'Jimbo (HO840003201118925)'], ['role', 'Avô Mat.:', 'Roscoe (HO840003141559673)'], ['role', 'Bisavô Mat.:', 'Frazzled (HOUSA000074261651)']],
  lin: [["Estatura",-0.71,"T"],["Força",-0.97,"S"],["Prof. Corporal",-0.92,"D"],["Largura de Garupa",-0.96,"W"],["Ângulo de Garupa",-0.43,"S"],["Pernas Tras. V. Lateral",-0.8,"S"],["Pernas Tras. V. Trás",-0.9,"H"],["Ângulo do Casco",0.1,"L"],["Escore de Pernas e Pés",-0.66,"L"],["Úbere Anterior, Inserção",0.52,"S"],["Altura Úbere Posterior",0.09,"H"],["Largura Úbere Posterior",-0.96,"W"],["Ligamento Central",-0.89,"W"],["Profundidade de Úbere",0.64,"S"],["Coloc. Tetos Anteriores",-0.48,"C"],["Coloc. Tetos Post.",-0.81,"C"],["Comprimento de Tetos",-0.67,"S"]] as [string, number, string][],
  sections: [
    { t: 'Produção', meta: '(PTA-lbs) · 07/26 Predição Pedigree', rows: [['Leite', '+331', ''], ['Proteína', '+17', '% Proteína +0.02'], ['Gordura', '+23', '% Gordura +0.04'], ['CFP', '+40', ''], ['NM$', '+$384', ''], ['GM$', '+$354', ''], ['Feed Saved', '+157', ''], ['RFI', '-39', '']] },
    { t: 'Tipo', meta: '(PTA) · 07/26 Predição Pedigree', rows: [['TPI', '+2725', ''], ['Tipo', '-0.39', ''], ['UDC', '+0.03', ''], ['FLC', '-0.58', '']] },
    { t: 'Aptidão', meta: '', rows: [['HHP$®', '+$372', ''], ['Células Somáticas', '2.88', ''], ['Vida Produtiva', '+2.6', ''], ['Livability', '+1.6', ''], ['DPR', '-1.1', ''], ['HCR', '+1.8', ''], ['CCR', '+0.0', ''], ['FI', '+0.1', '']] },
    { t: 'Saúde', meta: '', rows: [['Mastite', '+3.5', ''], ['Metrite', '+1.0', ''], ['Ret. Placenta', '-0.7', ''], ['Desp. Abomaso', '+106.0', ''], ['Cetose', '+104.0', ''], ['Febre de Leite', '+0.0', '']] },
    { t: 'Facilidade de Parto', meta: '(% DBH)', rows: [['SCE Touros', '1.5', ''], ['SSB Touros', '3.5', ''], ['DSB Filhas', '3.4', ''], ['Gestação', '+0.2', ''], ['EFC', '+3.6', '']] },
  ],
}

export const botijaoDemo: BotijaoDemoItem[] = []

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
