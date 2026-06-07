interface DeltaCardProps {
  trait: string
  label: string
  subtitle: string
  fromValue: number
  toValue: number
  sparkData: number[]
  formatter: (trait: string, val: number) => string
}

const inverted = ['scs', 'flc', 'rfi', 'gl', 'sce', 'ssb', 'dsb', 'da', 'ket']

export function DeltaCard({ trait, label, subtitle, fromValue, toValue, sparkData, formatter }: DeltaCardProps) {
  const inv = inverted.includes(trait)
  const raw = fromValue === 0 ? 0 : ((toValue - fromValue) / Math.abs(fromValue)) * 100
  const quality = inv ? -raw : raw
  const isNeg = Math.abs(raw) >= 2 && quality < 0
  const max = Math.max(...sparkData)
  const min = Math.min(...sparkData)
  const barColor = isNeg ? '#C0633A' : 'var(--ss-primary)'

  return (
    <div className="group relative overflow-hidden rounded-[14px] border border-[var(--ss-border)] bg-white px-[22px] py-[22px] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--ss-primary), var(--ss-primary-bright), transparent 80%)' }} />
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <div className="text-[16px] font-extrabold tracking-[-0.3px] text-[var(--ss-fg)]">{label}</div>
          <div className="mt-0.5 text-[11px] font-medium text-[var(--ss-muted)]">{subtitle}</div>
        </div>
        <span className="rounded-lg bg-[var(--ss-primary-soft)] px-3 py-1.5 font-mono text-[13px] font-extrabold text-[var(--ss-primary)]">{raw > 0 ? '+' : ''}{raw.toFixed(1)}%</span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="relative font-mono text-[18px] font-medium text-[var(--ss-muted-2)] line-through">{formatter(trait, fromValue)}</span>
        <span className="text-xl font-light text-[var(--ss-primary)]">→</span>
        <span className="font-mono text-[34px] font-black leading-none tracking-[-2px] text-[var(--ss-fg)]">{formatter(trait, toValue)}</span>
      </div>
      <div className="mt-4 flex h-9 items-end gap-[3px]">
        {sparkData.map((v, i) => {
          const h = max === min ? 60 : 18 + ((v - min) / (max - min)) * 82
          return <span key={`${v}-${i}`} className="flex-1 rounded-t-[3px]" style={{ height: `${h}%`, background: barColor, opacity: 0.25 + i * 0.1 }} />
        })}
      </div>
    </div>
  )
}
