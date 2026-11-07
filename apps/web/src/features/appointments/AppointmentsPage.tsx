import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Plus } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import type { Appointment, AppointmentStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge, appointmentStatusVariant } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { AppointmentFormDialog } from './AppointmentFormDialog'

const statusOptions: AppointmentStatus[] = [
  'pending',
  'scheduled',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]

const filterChips: { key: AppointmentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'checked_in', label: 'Checked in' },
  { key: 'cancelled', label: 'Cancelled' },
]

export function AppointmentsPage() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Appointment[]>([])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all')

  const load = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name, phone, email), doctors(first_name, last_name, specialisation, email)')
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

  const visible = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Visits"
        meta={<span className="pb-2 text-muted">{visible.length} shown</span>}
        actions={
          canCreate ? (
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              <Plus size={14} weight="regular" aria-hidden />
              New appointment
            </Button>
          ) : undefined
        }
      />
      <div className="flex flex-wrap gap-2">
        {filterChips.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              'cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
              filter === key
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-white text-muted hover:bg-surface-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <CardContent className="overflow-x-auto overscroll-x-contain p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3">Date & time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border/60 transition-colors duration-150 hover:bg-surface-muted"
                >
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {format(new Date(a.starts_at), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        firstName={a.patients?.first_name}
                        lastName={a.patients?.last_name}
                        email={a.patients?.email}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium text-foreground">
                          {a.patients
                            ? `${a.patients.first_name} ${a.patients.last_name}`
                            : '-'}
                        </div>
                        {a.patients?.phone && (
                          <div className="text-xs text-muted">{a.patients.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {a.doctors && (
                        <Avatar
                          firstName={a.doctors.first_name}
                          lastName={a.doctors.last_name}
                          email={a.doctors.email}
                          size="sm"
                        />
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {a.doctors
                            ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name}`
                            : '-'}
                        </div>
                        {a.doctors?.specialisation && (
                          <div className="text-xs text-muted">{a.doctors.specialisation}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canUpdateStatus ? (
                      <select
                        className="h-9 cursor-pointer rounded-md border border-border bg-white px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        value={a.status}
                        aria-label={`Status for ${a.patients?.last_name ?? 'appointment'}`}
                        onChange={(e) =>
                          void updateStatus(a.id, e.target.value as AppointmentStatus)
                        }
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
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
        </CardContent>
      </Card>
      <AppointmentFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  )
}
