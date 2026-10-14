import type { FemaleFull } from './api'
import { getLocale, translate } from '@/i18n'
import type { Locale } from '@/i18n/types'

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

const parentLabel = (naab: string | null | undefined, name: string | null | undefined) => {
  if (!naab && !name) return '—'
  if (name && naab) return `${name} (${naab})`
  return name ?? naab ?? '—'
}

export function buildProofFromFemale(f: FemaleFull, opts: BreedProofOptions = holsteinProofOptions, locale: Locale = getLocale()): Proof {
  const t = (key: string, params?: Record<string, string | number>) => translate(key, params, locale)
  return {
    ped: [
      ['role', t('pdf.father'), parentLabel(f.sire_naab, f.sire_name)],
      ['role', t('pdf.maternalGrandsire'), parentLabel(f.mgs_naab, f.mgs_name)],
      ['role', t('pdf.maternalGreatGrandsire'), parentLabel(f.mmgs_naab, f.mmgs_name)],
    ],
    lin: [
      [t('pdf.lin.sta'), n(f.sta), 'T'], [t('pdf.lin.str'), n(f.str), 'S'], [t('pdf.lin.dfm'), n(f.dfm), 'D'], [t('pdf.lin.rw'), n(f.rw), 'W'], [t('pdf.lin.rua'), n(f.rua), 'S'], [t('pdf.lin.rls'), n(f.rls), 'S'], [t('pdf.lin.rlr'), n(f.rlr), 'H'], [t('pdf.lin.fta'), n(f.fta), 'L'], [t('pdf.lin.fls'), n(f.fls), 'L'], [t('pdf.lin.fua'), n(f.fua), 'S'], [t('pdf.lin.ruh'), n(f.ruh), 'H'], [t('pdf.lin.ruw'), n(f.ruw), 'W'], [t('pdf.lin.ucl'), n(f.ucl), 'W'], [t('pdf.lin.udp'), n(f.udp), 'S'], [t('pdf.lin.ftp'), n(f.ftp), 'C'], [t('pdf.lin.rtp'), n(f.rtp), 'C'], [t('pdf.lin.ftl'), n(f.ftl), 'S'],
    ],
    sections: [
      { t: t('pdf.production'), meta: `(PTA) · ${t('pdf.pedigreePrediction')}`, rows: [[t('traits.milk'), plus(n(f.ptam)), ''], [t('pdf.protein'), plus(n(f.ptap)), '% Prot ' + f2(n(f.ptap_pct))], [t('pdf.fat'), plus(n(f.ptaf)), '% Gord ' + f2(n(f.ptaf_pct))], ['CFP', plus(n(f.cfp)), ''], ['NM$', money(n(f.nm_dollar)), ''], ['GM$', money(n(f.gm_dollar)), ''], ['F.Sav', plus(n(f.f_sav)), ''], ['RFI', String(n(f.rfi)), '']] },
      { t: t('pdf.type'), meta: `(PTA) · ${t('pdf.pedigreePrediction')}`, rows: [[opts.indexLabel, idx(femaleNumber(f, opts.indexKey)), ''], ['PTAT', f2(n(f.ptat)), ''], [opts.udderLabel, opts.udderKey === 'jui' ? idx(femaleNumber(f, opts.udderKey)) : f2(femaleNumber(f, opts.udderKey)), ''], ['FLC', n(f.flc).toFixed(2), ''], ['BD', f.bd == null ? '—' : f2(n(f.bd)), ''], ['BSC', f.bsc == null ? '—' : f2(n(f.bsc)), ''], ['HCC', f.hcc == null ? '—' : f2(n(f.hcc)), '']] },
      { t: t('pdf.aptitude'), meta: '', rows: [['HHP$®', money(n(f.hhp_dollar)), ''], ['SCS', n(f.scs).toFixed(2), ''], ['PL', f1(n(f.pl)), ''], ['LIV', f1(n(f.liv)), ''], ['DPR', f1(n(f.dpr)), ''], ['HCR', f1(n(f.hcr)), ''], ['CCR', f1(n(f.ccr)), ''], ['FI', f1(n(f.fi)), ''], ['FSC', f.fsc == null ? '—' : f1(n(f.fsc)), '']] },
      { t: t('pdf.health'), meta: '', rows: [[t('pdf.mastitis'), f1(n(f.mast)), ''], [t('pdf.metritis'), f1(n(f.met)), ''], [t('pdf.retainedPlacenta'), f1(n(f.rp)), ''], [t('pdf.displacedAbomasum'), f1(n(f.da)), ''], [t('pdf.ketosis'), f1(n(f.ket)), ''], [t('pdf.milkFever'), f1(n(f.mf)), '']] },
      { t: t('pdf.calvingEase'), meta: '', rows: [['SCE', n(f.sce).toFixed(1), ''], ['SSB', n(f.ssb).toFixed(1), ''], ['DSB', n(f.dsb).toFixed(1), ''], [t('pdf.gestation'), f1(n(f.gl)), ''], ['EFC', plus(n(f.efc)), '']] },
    ],
  }
}
