function parseNum(v: unknown): number {
  if (v == null) return NaN
  if (typeof v === 'number') return v
  const s = String(v).trim()
  if (s === '') return NaN
  return Number(s.replace(/,/g, ''))
}

const DECIMAL_PTA_NAMES = [
  'PTAF%','PTAP%','SCS','PL','DPR','LIV','H LIV','GL','MF','DA','Ket','Mast','Met','RP',
  'CCR','HCR','FI','RFI','EFC','F SAV','PTAT','UDC','JUI','FLC','BWC','STA','STR','BD','DFM',
  'RUA','TW','RLS','RLR','FA','FUA','FLS','FTA','RUH','RUW','RW','UCL','UD','UDP','FTP',
  'RTP','FTL','SCE','DCE','SSB','DSB','GFI',
]

const INTEGER_PTA_NAMES = ['HHP$','TPI','JPI','NM$','CM$','FM$','GM$','PTAM','PTAF','CFP','PTAP']

const COLUMN_TO_LABEL: Record<string, string> = {
  hhp_dollar:'HHP$',tpi:'TPI',jpi:'JPI',nm_dollar:'NM$',cm_dollar:'CM$',fm_dollar:'FM$',gm_dollar:'GM$',
  ptam:'PTAM',ptaf:'PTAF',cfp:'CFP',ptap:'PTAP',ptaf_pct:'PTAF%',ptap_pct:'PTAP%',scs:'SCS',
  pl:'PL',dpr:'DPR',liv:'LIV',h_liv:'H LIV',gl:'GL',mf:'MF',da:'DA',ket:'Ket',mast:'Mast',
  met:'Met',rp:'RP',ccr:'CCR',hcr:'HCR',fi:'FI',rfi:'RFI',f_sav:'F SAV',ptat:'PTAT',udc:'UDC',jui:'JUI',
  flc:'FLC',bwc:'BWC',sta:'STA',str:'STR',dfm:'DFM',rua:'RUA',rls:'RLS',rlr:'RLR',fua:'FUA',
  fls:'FLS',fta:'FTA',ruh:'RUH',ruw:'RUW',rw:'RW',ucl:'UCL',udp:'UDP',ftp:'FTP',rtp:'RTP',
  ftl:'FTL',sce:'SCE',dce:'DCE',ssb:'SSB',dsb:'DSB',gfi:'GFI',
}

function normalizePtaKey(name: string): string {
  const label = COLUMN_TO_LABEL[name.toLowerCase()]
  if (label) return label.replace(/[\s$%]/g, '').toUpperCase()
  return name.replace(/[\s$%]/g, '').toUpperCase()
}

const DECIMAL_SET = new Set(DECIMAL_PTA_NAMES.map(normalizePtaKey))
const INTEGER_SET = new Set(INTEGER_PTA_NAMES.map(normalizePtaKey))

export function formatPtaValue(fieldName: string, value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = parseNum(value)
  if (Number.isNaN(num)) return String(value)
  const key = normalizePtaKey(fieldName)
  if (DECIMAL_SET.has(key)) return num.toFixed(2)
  if (INTEGER_SET.has(key)) return Math.round(num).toString()
  return String(value)
}

export function getColumnLabel(columnKey: string): string {
  return COLUMN_TO_LABEL[columnKey] ?? columnKey.toUpperCase()
}
