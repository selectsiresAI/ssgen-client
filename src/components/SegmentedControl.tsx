interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  wrap?: boolean
  size?: 'sm' | 'md'
}

export function SegmentedControl({ options, value, onChange, wrap = false, size = 'md' }: SegmentedControlProps) {
  return (
    <div className={`flex gap-[2px] rounded-[10px] bg-[var(--ss-border-2)] p-[3px] ${wrap ? 'flex-wrap' : ''}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-[8px] border-0 bg-transparent font-mono text-[11px] text-[var(--ss-muted)] transition hover:text-[var(--ss-fg)] ${
            size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-[5px]'
          } ${value === option.value ? 'bg-white text-[var(--ss-fg)] shadow-[0_1px_3px_rgba(0,0,0,.06)]' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
