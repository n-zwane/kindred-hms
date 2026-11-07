import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

type StatCardProps = {
  label: string
  value: number | string
  icon: Icon
  iconClassName?: string
  trend?: string
  trendUp?: boolean
  bars?: number[]
  barClassName?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  trend,
  trendUp,
  bars,
  barClassName,
}: StatCardProps) {
  const max = bars?.length ? Math.max(...bars, 1) : 1
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary',
              iconClassName,
            )}
          >
            <Icon size={20} weight="regular" aria-hidden />
          </div>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
                trendUp === false ? 'text-danger' : 'text-success',
              )}
            >
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">{value}</p>
        </div>
        {bars && bars.length > 0 && (
          <div className="flex h-10 items-end gap-1" aria-hidden>
            {bars.map((h, i) => (
              <div
                key={i}
                className={cn('w-1.5 flex-1 rounded-sm bg-primary/70', barClassName)}
                style={{ height: `${Math.max(10, (h / max) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
