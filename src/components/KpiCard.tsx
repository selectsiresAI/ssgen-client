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
      <div className="mb-[6px] text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--ss-muted)]">
        <Icon className="mb-1 h-3.5 w-3.5 text-[var(--ss-primary)]" strokeWidth={1.8} />
        <span className="ml-1">{label}</span>
      </div>
      <div className="font-mono text-[26px] font-black leading-none tracking-[-1.5px] text-[var(--ss-fg)]">{value}</div>
      <div className={`mt-[4px] font-mono text-[11px] font-semibold ${deltaType === 'up' ? 'text-[var(--ss-green)]' : 'text-[#C0633A]'}`}>
        {delta}
      </div>
    </div>
  )
}
