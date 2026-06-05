import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  delta: string
  deltaType?: 'up' | 'down'
}

export function KpiCard({ icon: Icon, label, value, delta, deltaType = 'up' }: KpiCardProps) {
  return (
    <div className="ss-kpi">
      <div className="mb-[9px] flex items-center gap-[7px] text-[11px] font-medium text-[var(--ss-muted)]">
        <Icon className="h-3.5 w-3.5 text-[var(--ss-primary)]" strokeWidth={1.8} />
        {label}
      </div>
      <div className="text-[25px] font-bold leading-none tracking-[-0.5px] text-[var(--ss-fg)]">{value}</div>
      <div className={`mt-[7px] font-mono text-[11px] ${deltaType === 'up' ? 'text-[var(--ss-green)]' : 'text-[#C0633A]'}`}>
        {delta}
      </div>
    </div>
  )
}
