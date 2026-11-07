import { useEffect, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { format } from 'date-fns'

interface Rx {
  id: string
  medication: string
  dosage: string
  instructions: string | null
  prescribed_at: string
  patients: { first_name: string; last_name: string }
}

export function PrescriptionsPage() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Rx[]>([])
  const [patientId, setPatientId] = useState('')
  const [patients, setPatients] = useState<{ id: string; label: string }[]>([])
  const [medication, setMedication] = useState('')
  const [dosage, setDosage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [doctorId, setDoctorId] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase
      .from('prescriptions')
      .select('*, patients(first_name, last_name)')
      .order('prescribed_at', { ascending: false })
    setRows((data as Rx[]) ?? [])
  }

  useEffect(() => {
    void load()
    void (async () => {
      if (profile?.role === 'doctor') {
        const { data: d } = await supabase
          .from('doctors')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle()
        setDoctorId(d?.id ?? null)
      }
      const { data: p } = await supabase.from('patients').select('id, first_name, last_name')
      setPatients(
        (p ?? []).map((x) => ({ id: x.id, label: `${x.first_name} ${x.last_name}` })),
      )
    })()
  }, [profile])

  const create = async () => {
    if (!doctorId || !patientId) return
    await supabase.from('prescriptions').insert({
      patient_id: patientId,
      doctor_id: doctorId,
      medication,
      dosage,
      instructions: instructions || null,
    })
    setMedication('')
    setDosage('')
    setInstructions('')
    await load()
  }

  const canCreate = profile?.role === 'doctor'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Issued"
        meta={<span className="pb-2 text-muted">{rows.length} prescriptions</span>}
        actions={
          canCreate ? (
            <Button
              type="button"
              size="sm"
              onClick={() => void create()}
              disabled={!doctorId || !patientId || !medication || !dosage}
            >
              <Plus size={14} weight="regular" aria-hidden />
              Add prescription
            </Button>
          ) : undefined
        }
      />
      {canCreate && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>New prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Patient</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                <option value="">Select…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Medication</Label>
              <Input value={medication} onChange={(e) => setMedication(e.target.value)} />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input value={dosage} onChange={(e) => setDosage(e.target.value)} />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul>
            {rows.length === 0 && (
              <li className="px-6 py-4 text-sm text-muted">No prescriptions yet.</li>
            )}
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-6 py-3 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {r.medication} · {r.dosage}
                  </div>
                  <div className="text-xs text-muted">
                    {r.patients.first_name} {r.patients.last_name} ·{' '}
                    {format(new Date(r.prescribed_at), 'dd MMM yyyy')}
                  </div>
                  {r.instructions && <p className="mt-1 text-sm text-muted">{r.instructions}</p>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
