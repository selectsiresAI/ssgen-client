interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  wrap?: boolean
  size?: 'sm' | 'md'
}

export function SegmentedControl({ options, value, onChange, wrap = false, size = 'md' }: SegmentedControlProps) {
  return (
    <div className={`flex gap-0.5 rounded-[7px] border border-[var(--ss-border)] bg-[var(--ss-wash)] p-[3px] ${wrap ? 'flex-wrap' : ''}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-[5px] border-0 bg-transparent font-mono text-[11px] text-[var(--ss-muted)] transition hover:text-[var(--ss-fg)] ${
            size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-[5px]'
          } ${value === option.value ? 'bg-[var(--ss-card)] text-[var(--ss-primary)] shadow-[0_1px_2px_rgba(0,0,0,.08)]' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
