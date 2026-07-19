import type { FemaleFull } from './api'

export interface Proof {
  ped: [string, string, string][]
  lin: [string, number, string][]
  sections: { t: string; meta: string; rows: [string, string, string][] }[]
}

export interface BreedProofOptions {
  indexLabel: string
  indexKey: string
  udderLabel: string
  udderKey: string
}

export const holsteinProofOptions: BreedProofOptions = {
  indexLabel: 'GTPI',
  indexKey: 'tpi',
  udderLabel: 'UDC',
  udderKey: 'udc',
}

const n = (value: number | null | undefined) => value ?? 0
const f2 = (value: number) => (value >= 0 ? '+' : '') + value.toFixed(2)
const f1 = (value: number) => (value >= 0 ? '+' : '') + value.toFixed(1)
const plus = (value: number) => `${value >= 0 ? '+' : ''}${value}`
const money = (value: number) => `${value >= 0 ? '+$' : '-$'}${Math.round(Math.abs(value))}`
const idx = (value: number) => `${value > 0 ? '+' : ''}${Math.round(value)}`
const femaleNumber = (f: FemaleFull, key: string) => {
  const value = f[key]
  return typeof value === 'number' ? value : 0
}

export function buildProofFromFemale(f: FemaleFull, opts: BreedProofOptions = holsteinProofOptions): Proof {
  return {
    ped: [
      ['role', 'Pai:', f.sire_naab ?? '—'],
      ['role', 'Avô Mat.:', f.mgs_naab ?? '—'],
      ['role', 'Bisavô Mat.:', f.mmgs_naab ?? '—'],
    ],
    lin: [
      ['Estatura', n(f.sta), 'T'],
      ['Força', n(f.str), 'S'],
      ['Prof. Corporal', n(f.dfm), 'D'],
      ['Largura de Garupa', n(f.rw), 'W'],
      ['Ângulo de Garupa', n(f.rua), 'S'],
      ['Pernas Tras. V. Lateral', n(f.rls), 'S'],
      ['Pernas Tras. V. Trás', n(f.rlr), 'H'],
      ['Ângulo do Casco', n(f.fta), 'L'],
      ['Escore Pernas e Pés', n(f.fls), 'L'],
      ['Úbere Anterior', n(f.fua), 'S'],
      ['Altura Úbere Post.', n(f.ruh), 'H'],
      ['Largura Úbere Post.', n(f.ruw), 'W'],
      ['Ligamento Central', n(f.ucl), 'W'],
      ['Prof. de Úbere', n(f.udp), 'S'],
      ['Tetos Anteriores', n(f.ftp), 'C'],
      ['Tetos Posteriores', n(f.rtp), 'C'],
      ['Compr. de Tetos', n(f.ftl), 'S'],
    ],
    sections: [
      { t: 'Produção', meta: '(PTA) · Predição Pedigree', rows: [['Leite', plus(n(f.ptam)), ''], ['Proteína', plus(n(f.ptap)), '% Prot ' + f2(n(f.ptap_pct))], ['Gordura', plus(n(f.ptaf)), '% Gord ' + f2(n(f.ptaf_pct))], ['CFP', plus(n(f.cfp)), ''], ['NM$', money(n(f.nm_dollar)), ''], ['GM$', money(n(f.gm_dollar)), ''], ['F.Sav', plus(n(f.f_sav)), ''], ['RFI', String(n(f.rfi)), '']] },
      { t: 'Tipo', meta: '(PTA) · Predição Pedigree', rows: [[opts.indexLabel, idx(femaleNumber(f, opts.indexKey)), ''], ['PTAT', f2(n(f.ptat)), ''], [opts.udderLabel, opts.udderKey === 'jui' ? idx(femaleNumber(f, opts.udderKey)) : f2(femaleNumber(f, opts.udderKey)), ''], ['FLC', n(f.flc).toFixed(2), '']] },
      { t: 'Aptidão', meta: '', rows: [['HHP$®', money(n(f.hhp_dollar)), ''], ['SCS', n(f.scs).toFixed(2), ''], ['PL', f1(n(f.pl)), ''], ['LIV', f1(n(f.liv)), ''], ['DPR', f1(n(f.dpr)), ''], ['HCR', f1(n(f.hcr)), ''], ['CCR', f1(n(f.ccr)), ''], ['FI', f1(n(f.fi)), '']] },
      { t: 'Saúde', meta: '', rows: [['Mastite', f1(n(f.mast)), ''], ['Metrite', f1(n(f.met)), ''], ['Ret. Placenta', f1(n(f.rp)), ''], ['Desp. Abomaso', f1(n(f.da)), ''], ['Cetose', f1(n(f.ket)), ''], ['Febre de Leite', f1(n(f.mf)), '']] },
      { t: 'Facilidade de Parto', meta: '', rows: [['SCE', n(f.sce).toFixed(1), ''], ['SSB', n(f.ssb).toFixed(1), ''], ['DSB', n(f.dsb).toFixed(1), ''], ['Gestação', f1(n(f.gl)), ''], ['EFC', plus(n(f.efc)), '']] },
    ],
  }
}
