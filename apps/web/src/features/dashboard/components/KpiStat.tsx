import { cn } from '@/lib/utils'

type KpiStatProps = {
  label: string
  value: number | string
  trend?: string
  trendUp?: boolean
}

export function KpiStat({ label, value, trend, trendUp }: KpiStatProps) {
  return (
    <div className="min-w-[120px] flex-1 px-1 py-1">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-foreground">{value}</p>
      {trend && (
        <p
          className={cn(
            'mt-1 text-xs tabular-nums',
            trendUp === false ? 'text-danger' : 'text-success',
          )}
        >
          {trendUp === false ? '▾' : '▴'} {trend}
        </p>
      )}
    </div>
  )
}
