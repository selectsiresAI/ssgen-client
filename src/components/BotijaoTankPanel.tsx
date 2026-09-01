export interface TankItem {
  id: string
  touro: { code: string; name: string | null; breed?: string | null }
  tipo: 'Convencional' | 'Sexado' | string
  doses: number
}

interface BotijaoTankPanelProps {
  items: TankItem[]
  totalDoses?: number
  totalCanecas?: number
}

export function BotijaoTankPanel({
  items,
  totalDoses,
  totalCanecas = 6,
}: BotijaoTankPanelProps) {
  const total = totalDoses ?? items.reduce((s, i) => s + i.doses, 0)
  const bullCount = items.length
  const maxDoses = Math.max(1, ...items.map((i) => i.doses))

  const PALETTE = ['#B91C1C', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DB2777', '#0891B2']
  const colorFor = (code: string) => PALETTE[[...code].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length]

  const occupied = bullCount === 0 ? 0 : Math.max(1, Math.min(totalCanecas, Math.ceil(bullCount / 3)))
  const canecaOf = (idx: number) => (occupied ? (idx % occupied) + 1 : 0)

  const SZ = 200, cx = SZ / 2, cy = SZ / 2, R = 66, cr = 20
  const slots = Array.from({ length: totalCanecas }, (_, i) => {
    const ang = (-90 + i * (360 / totalCanecas)) * Math.PI / 180
    return { n: i + 1, x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), filled: i < occupied }
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: 14, marginBottom: 14 }}>
      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Botijão · vista superior</h3>
          <span className="ss-mono text-[11px] text-[var(--ss-muted)]">{occupied}/{totalCanecas} canecas</span>
        </div>
        <div className="ss-card-body">
          <svg width="100%" viewBox={`0 0 ${SZ} ${SZ}`} style={{ maxWidth: 200, margin: '0 auto', display: 'block' }}>
            <circle cx={cx} cy={cy} r={90} fill="none" stroke="var(--ss-border)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={82} fill="var(--ss-wash)" />
            {slots.map((s) => (
              <g key={s.n}>
                <circle
                  cx={s.x} cy={s.y} r={cr}
                  fill={s.filled ? 'var(--ss-primary-soft)' : 'transparent'}
                  stroke={s.filled ? 'var(--ss-primary)' : 'var(--ss-border)'}
                  strokeWidth={s.filled ? 2 : 1.4}
                  strokeDasharray={s.filled ? 'none' : '4 4'}
                />
                <text x={s.x} y={s.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fontFamily="var(--ss-mono)" fill={s.filled ? 'var(--ss-primary)' : 'var(--ss-muted-2)'}>
                  {s.filled ? s.n : '+'}
                </text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r={26} fill="var(--ss-card)" stroke="var(--ss-border)" />
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="7.5" fontWeight="700" letterSpacing="1.3" fill="var(--ss-muted-2)">DOSES</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="var(--ss-mono)" fill="var(--ss-fg)">{total}</text>
          </svg>
        </div>
      </div>

      <div className="ss-card">
        <div className="ss-card-header">
          <h3 className="ss-card-title">Inventário de doses</h3>
          <span className="ss-mono text-[11px] text-[var(--ss-muted)]">{bullCount} touros · {total} doses</span>
        </div>
        <div style={{ padding: '4px 8px 10px', overflowX: 'auto' }}>
          <table className="ss-table">
            <thead>
              <tr>
                <th>Touro</th>
                <th>Raça</th>
                <th>Caneca</th>
                <th>Estoque</th>
                <th style={{ textAlign: 'right' }}>Doses</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ss-muted)', padding: '24px 0' }}>Sem touros no botijão. Adicione doses para ver o inventário.</td></tr>
              ) : items.map((i, idx) => (
                <tr key={i.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span style={{ width: 10, height: 24, borderRadius: 3, flex: '0 0 auto', background: colorFor(i.touro.code), boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} title="Cor da palheta" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', color: 'var(--ss-fg)' }}>{i.touro.name ?? '—'}</div>
                        <div className="ss-mono" style={{ fontSize: 10, color: 'var(--ss-muted-2)' }}>{i.touro.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--ss-muted)' }}>{i.touro.breed ?? '—'}</td>
                  <td className="ss-mono" style={{ color: 'var(--ss-muted)' }}>#{canecaOf(idx)}</td>
                  <td>
                    <div style={{ minWidth: 90, height: 6, borderRadius: 4, background: 'var(--ss-border-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${(i.doses / maxDoses) * 100}%`, height: '100%', borderRadius: 4, background: colorFor(i.touro.code) }} />
                    </div>
                  </td>
                  <td className="ss-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ss-fg)' }}>{i.doses}</td>
                  <td><span className={i.tipo === 'Sexado' ? 'ss-badge-sex' : 'ss-badge-conv'}>{i.tipo}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
