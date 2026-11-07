import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-gray-500">No audit entries yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {rows.map((r) => (
                <li key={r.id} className="py-2">
                  <span className="font-medium">{r.action}</span>
                  {r.entity_type && <span className="text-gray-500"> · {r.entity_type}</span>}
                  <div className="text-xs text-gray-400">
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
