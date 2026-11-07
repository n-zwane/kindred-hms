type DonutStatProps = {
  label: string
  value: string
  percent: number
  color?: string
}

export function DonutStat({ label, value, percent, color = 'var(--color-primary)' }: DonutStatProps) {
  const r = 16
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, percent))
  const offset = c - (clamped / 100) * c
  return (
    <div className="flex items-center gap-3">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="#eef0f5" strokeWidth="6" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  )
}
