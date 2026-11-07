import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import type { Appointment, Patient } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, appointmentStatusVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/avatar'
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
        .select('*, doctors(first_name, last_name, specialisation, email)')
        .eq('patient_id', id)
        .order('starts_at', { ascending: false })
      setAppointments((apts as Appointment[]) ?? [])
    })()
  }, [id])

  if (!patient) return <p className="text-sm text-muted">Loading…</p>

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profile"
        meta={
          <span className="pb-2 text-muted">
            {patient.first_name} {patient.last_name}
          </span>
        }
        actions={
          <Link to="/patients">
            <Button type="button" size="sm" variant="outline">
              <CaretLeft size={14} weight="bold" aria-hidden />
              Directory
            </Button>
          </Link>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar
            firstName={patient.first_name}
            lastName={patient.last_name}
            email={patient.email}
            size="lg"
          />
          <CardTitle>
            {patient.first_name} {patient.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted md:grid-cols-2">
          <div>Phone: {patient.phone ?? '-'}</div>
          <div>Email: {patient.email ?? '-'}</div>
          <div>DOB: {patient.date_of_birth ?? '-'}</div>
          <div>Blood group: {patient.blood_group ?? '-'}</div>
          <div className="md:col-span-2">Address: {patient.address ?? '-'}</div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-border/60 hover:bg-surface-muted">
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {format(new Date(a.starts_at), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {a.doctors
                      ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name} · ${a.doctors.specialisation}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
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
