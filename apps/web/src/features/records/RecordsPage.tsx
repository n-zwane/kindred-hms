import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Patient records</h1>
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            className="w-full rounded-lg border bg-white p-4 text-left hover:border-primary"
            onClick={() => {
              setSelected(r)
              setSaved(false)
            }}
          >
            {r.patients.first_name} {r.patients.last_name}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {selected
              ? `${selected.patients.first_name} ${selected.patients.last_name}`
              : 'Select a record'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected && (
            <>
              <div>
                <Label>Summary</Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
              </div>
              <div>
                <Label>History</Label>
                <Textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={6} />
              </div>
              <Button type="button" onClick={() => void save()}>
                Save record
              </Button>
              {saved && <p className="text-sm text-emerald-700">Saved.</p>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
