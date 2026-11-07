import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import type { Appointment, AppointmentStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge, appointmentStatusVariant } from '@/components/ui/badge'
import { AppointmentFormDialog } from './AppointmentFormDialog'

const statusOptions: AppointmentStatus[] = [
  'pending',
  'scheduled',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]

export function AppointmentsPage() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Appointment[]>([])
  const [open, setOpen] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name, phone), doctors(first_name, last_name, specialisation)')
      .order('starts_at', { ascending: false })
    setRows((data as Appointment[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  const canCreate =
    profile && ['patient', 'receptionist', 'admin', 'doctor'].includes(profile.role)
  const canUpdateStatus =
    profile && ['receptionist', 'admin', 'doctor'].includes(profile.role)

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Appointments</h1>
        {canCreate && (
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New appointment
          </Button>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Date & time</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  {format(new Date(a.starts_at), 'dd MMM yyyy HH:mm')}
                </td>
                <td className="px-4 py-3">
                  {a.patients
                    ? `${a.patients.first_name} ${a.patients.last_name}`
                    : '—'}
                  {a.patients?.phone && (
                    <div className="text-xs text-gray-400">{a.patients.phone}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {a.doctors
                    ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name}`
                    : '—'}
                  {a.doctors?.specialisation && (
                    <div className="text-xs text-gray-400">{a.doctors.specialisation}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {canUpdateStatus ? (
                    <select
                      className="rounded border px-2 py-1 text-xs"
                      value={a.status}
                      onChange={(e) =>
                        void updateStatus(a.id, e.target.value as AppointmentStatus)
                      }
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant={appointmentStatusVariant(a.status)}>
                      {a.status.replace('_', ' ')}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AppointmentFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  )
}
