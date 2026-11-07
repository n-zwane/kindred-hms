type StatusSummaryCardProps = {
  title: string
  label: string
  value: number | string
  spark: number[]
}

function sparkPath(values: number[], width: number, height: number) {
  if (values.length === 0) return ''
  const max = Math.max(...values, 1)
  const step = values.length > 1 ? width / (values.length - 1) : width
  return values
    .map((v, i) => {
      const x = i * step
      const y = height - (v / max) * height
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

export function StatusSummaryCard({ title, label, value, spark }: StatusSummaryCardProps) {
  const d = sparkPath(spark, 160, 56)
  return (
    <div className="rounded-xl bg-primary p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs">★</span>
      </div>
      <p className="mt-6 text-xs text-white/75">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <p className="text-3xl font-medium tabular-nums">{value}</p>
        <svg viewBox="0 0 160 56" className="h-14 w-40" aria-hidden>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  )
}
