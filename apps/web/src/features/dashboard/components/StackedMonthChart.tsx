type MonthBucket = {
  label: string
  completed: number
  ongoing: number
  scheduled: number
}

type StackedMonthChartProps = {
  months: MonthBucket[]
}

export function StackedMonthChart({ months }: StackedMonthChartProps) {
  const max = Math.max(
    1,
    ...months.map((m) => m.completed + m.ongoing + m.scheduled),
  )
  const barMaxPx = 160

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          Scheduled
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          Completed
        </span>
      </div>
      <div className="flex items-end gap-3 border-b border-border pb-2" style={{ height: barMaxPx }}>
        {months.map((m) => {
          const total = m.completed + m.ongoing + m.scheduled
          const barH = total ? Math.max(10, (total / max) * (barMaxPx - 22)) : 8
          const lower = m.scheduled + m.ongoing
          return (
            <div key={m.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div
                className="flex w-full max-w-7 flex-col-reverse overflow-hidden rounded-sm"
                style={{ height: barH }}
                role="img"
                aria-label={`${m.label}: ${total} appointments`}
              >
                {lower > 0 && (
                  <div
                    className="w-full bg-accent"
                    style={{ height: `${(lower / total) * 100}%` }}
                  />
                )}
                {m.completed > 0 && (
                  <div
                    className="w-full bg-primary"
                    style={{ height: `${(m.completed / total) * 100}%` }}
                  />
                )}
                {total === 0 && <div className="h-full w-full bg-surface-muted" />}
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted">{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
