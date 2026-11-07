import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Patient, Ward } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiStat } from '@/features/dashboard/components/KpiStat'

export function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [wardId, setWardId] = useState('')
  const [patientId, setPatientId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const { data: w } = await supabase.from('wards').select('*').order('name')
    setWards((w as Ward[]) ?? [])
    const { data: p } = await supabase.from('patients').select('*').order('last_name')
    setPatients((p as Patient[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  const allocate = async () => {
    setMessage(null)
    setError(null)
    const { error: insertError } = await supabase.from('ward_allocations').insert({
      ward_id: wardId,
      patient_id: patientId,
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setMessage('Patient allocated.')
    await load()
  }

  const occupied = wards.reduce((sum, w) => sum + w.occupied, 0)
  const capacity = wards.reduce((sum, w) => sum + w.capacity, 0)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Occupancy"
        actions={
          <Button type="button" size="sm" disabled={!wardId || !patientId} onClick={() => void allocate()}>
            Allocate
          </Button>
        }
      />
      <div className="flex flex-wrap gap-6 border-b border-border pb-4">
        <KpiStat label="Wards" value={wards.length} />
        <KpiStat label="Occupied" value={occupied} />
        <KpiStat label="Capacity" value={capacity} />
        <KpiStat label="Free beds" value={Math.max(0, capacity - occupied)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {wards.map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle>{w.name}</CardTitle>
              <p className="text-sm text-muted">occupied / capacity</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium tabular-nums tracking-tight text-foreground">
                {w.occupied} / {w.capacity}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Allocate patient</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Ward</Label>
            <select
              className="mt-1 h-9 w-full rounded-md border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
            >
              <option value="">Select ward…</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.capacity - w.occupied} free)
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Patient</Label>
            <select
              className="mt-1 h-9 w-full rounded-md border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            {error && <p className="text-sm text-danger">{error}</p>}
            {message && <p className="text-sm text-success">{message}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
