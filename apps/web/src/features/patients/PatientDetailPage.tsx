import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Appointment, Patient } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, appointmentStatusVariant } from '@/components/ui/badge'
import { format } from 'date-fns'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (!id) return
    void (async () => {
      const { data: p } = await supabase.from('patients').select('*').eq('id', id).single()
      setPatient(p as Patient)
      const { data: apts } = await supabase
        .from('appointments')
        .select('*, doctors(first_name, last_name, specialisation)')
        .eq('patient_id', id)
        .order('starts_at', { ascending: false })
      setAppointments((apts as Appointment[]) ?? [])
    })()
  }, [id])

  if (!patient) return <p className="text-gray-500">Loading…</p>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {patient.first_name} {patient.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
          <div>Phone: {patient.phone ?? '—'}</div>
          <div>Email: {patient.email ?? '—'}</div>
          <div>DOB: {patient.date_of_birth ?? '—'}</div>
          <div>Blood group: {patient.blood_group ?? '—'}</div>
          <div className="md:col-span-2">Address: {patient.address ?? '—'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Doctor</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4">
                    {format(new Date(a.starts_at), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="py-3 pr-4">
                    {a.doctors
                      ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name} · ${a.doctors.specialisation}`
                      : '—'}
                  </td>
                  <td className="py-3">
                    <Badge variant={appointmentStatusVariant(a.status)}>
                      {a.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
