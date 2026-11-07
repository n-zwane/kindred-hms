import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'

interface AuditRow {
  id: string
  action: string
  entity_type: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

export function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([])

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, entity_type, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(100)
      setRows((data as AuditRow[]) ?? [])
    })()
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity"
        meta={<span className="pb-2 text-muted">{rows.length} events</span>}
      />
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted">No audit entries yet.</p>
          ) : (
            <ul>
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-6 py-3 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{r.action}</span>
                    {r.entity_type && <span className="text-sm text-muted"> · {r.entity_type}</span>}
                  </div>
                  <div className="text-xs tabular-nums text-muted">
                    {format(new Date(r.created_at), 'dd MMM yyyy HH:mm')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
