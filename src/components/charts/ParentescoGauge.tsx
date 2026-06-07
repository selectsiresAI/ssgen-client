import { useId } from 'react'

interface ParentescoGaugeProps {
  /** Percentual "Informado" (0–100) exibido no centro e como preenchimento do arco. */
  pct: number
  size?: number
}

/**
 * Medidor radial em rosca de 270° para o step Parentesco da Auditoria.
 * Usa exclusivamente tokens do design system do repo (--ss-*).
 */
export function ParentescoGauge({ pct, size = 150 }: ParentescoGaugeProps) {
  const uid = useId()
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 14
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75 // 270°
  const frac = Math.max(0, Math.min(1, pct / 100))

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} aria-label={`${Math.round(pct)}% informado`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <title id={uid}>{Math.round(pct)}% informado</title>
        {/* trilho */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--ss-border)" strokeWidth={12}
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* preenchimento */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--ss-green)" strokeWidth={12}
          strokeDasharray={`${arc * frac} ${circ}`} strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="ss-mono text-[28px] font-extrabold leading-none tracking-[-1px] text-[var(--ss-fg)]">
          {Math.round(pct)}%
        </span>
        <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[1.5px] text-[var(--ss-muted)]">
          Informado
        </span>
      </div>
    </div>
  )
}
