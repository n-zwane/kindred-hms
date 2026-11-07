import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Prescriptions</h1>
      {profile?.role === 'doctor' && (
        <div className="rounded-xl border bg-white p-4 space-y-3 max-w-lg">
          <h2 className="font-medium">New prescription</h2>
          <div>
            <Label>Patient</Label>
            <select
              className="mt-1 h-10 w-full rounded-lg border px-2"
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
          <Button type="button" onClick={() => void create()} disabled={!doctorId}>
            Add prescription
          </Button>
        </div>
      )}
      <ul className="divide-y rounded-xl border bg-white">
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3 text-sm">
            <div className="font-medium">
              {r.medication} · {r.dosage}
            </div>
            <div className="text-gray-500">
              {r.patients.first_name} {r.patients.last_name} ·{' '}
              {format(new Date(r.prescribed_at), 'dd MMM yyyy')}
            </div>
            {r.instructions && <p className="text-gray-600">{r.instructions}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
