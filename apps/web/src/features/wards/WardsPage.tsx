import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Patient, Ward } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ward management</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {wards.map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle>{w.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-primary">
                {w.occupied} / {w.capacity}
              </p>
              <p className="text-xs text-gray-500">occupied / capacity</p>
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
              className="mt-1 h-10 w-full rounded-lg border px-2"
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
              className="mt-1 h-10 w-full rounded-lg border px-2"
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            <Button type="button" className="mt-2" disabled={!wardId || !patientId} onClick={() => void allocate()}>
              Allocate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
