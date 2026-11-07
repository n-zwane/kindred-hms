import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>
      <div className="flex gap-6 border-b border-border pb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="min-w-[120px] flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
