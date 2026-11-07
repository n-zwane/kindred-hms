import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'

interface RecordRow {
  id: string
  patient_id: string
  summary: string | null
  history: string | null
  patients: { first_name: string; last_name: string }
}

export function RecordsPage() {
  const [rows, setRows] = useState<RecordRow[]>([])
  const [selected, setSelected] = useState<RecordRow | null>(null)
  const [summary, setSummary] = useState('')
  const [history, setHistory] = useState('')
  const [saved, setSaved] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('patient_records')
      .select('*, patients(first_name, last_name)')
    setRows((data as RecordRow[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (selected) {
      setSummary(selected.summary ?? '')
      setHistory(selected.history ?? '')
    }
  }, [selected])

  const save = async () => {
    if (!selected) return
    await supabase
      .from('patient_records')
      .update({ summary, history, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
    setSaved(true)
    void load()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notes"
        meta={<span className="pb-2 text-muted">{rows.length} records</span>}
        actions={
          selected ? (
            <Button type="button" size="sm" onClick={() => void save()}>
              Save record
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <p className="text-sm text-muted">Select a file to review or update</p>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {rows.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">No records yet.</p>
            )}
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-surface-muted',
                  selected?.id === r.id && 'bg-surface-muted font-medium text-foreground',
                )}
                onClick={() => {
                  setSelected(r)
                  setSaved(false)
                }}
              >
                {r.patients.first_name} {r.patients.last_name}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {selected
                ? `${selected.patients.first_name} ${selected.patients.last_name}`
                : 'Select a record'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <div>
                  <Label>Summary</Label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
                </div>
                <div>
                  <Label>History</Label>
                  <Textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={6} />
                </div>
                {saved && <p className="text-sm text-success">Saved.</p>}
              </>
            ) : (
              <p className="text-sm text-muted">Choose a patient from the list.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
