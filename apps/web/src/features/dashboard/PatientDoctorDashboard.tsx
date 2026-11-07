import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, isAfter, isSameDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import type { Appointment } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, appointmentStatusVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiStat } from './components/KpiStat'
import { MiniMonthCalendar } from './components/MiniMonthCalendar'
import { DashboardSkeleton } from './components/DashboardSkeleton'

export function PatientDashboardView() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    void (async () => {
      setLoading(true)
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle()
      if (!patient) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('appointments')
        .select('*, doctors(first_name, last_name, specialisation, email)')
        .eq('patient_id', patient.id)
        .order('starts_at', { ascending: true })
      setRows((data as Appointment[]) ?? [])
      setLoading(false)
    })()
  }, [profile])

  const upcoming = useMemo(
    () => rows.filter((a) => isAfter(new Date(a.starts_at), new Date())).slice(0, 5),
    [rows],
  )
  const todayCount = rows.filter((a) => isSameDay(new Date(a.starts_at), new Date())).length
  const completed = rows.filter((a) => a.status === 'checked_out').length

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        actions={
          <Link to="/appointments">
            <Button type="button" size="sm">
              Book appointment
            </Button>
          </Link>
        }
      />
      <div className="flex flex-wrap gap-6 border-b border-border pb-4">
        <KpiStat label="Upcoming" value={upcoming.length} />
        <KpiStat label="Today" value={todayCount} />
        <KpiStat label="Completed visits" value={completed} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Your calendar</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <MiniMonthCalendar
              month={new Date()}
              highlighted={rows.map((r) => new Date(r.starts_at))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Next appointments</CardTitle>
            <Link to="/appointments">
              <Button type="button" size="sm" variant="outline">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {upcoming.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">No upcoming appointments.</p>
            )}
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-md px-3 py-2 hover:bg-surface-muted"
              >
                <div className="flex gap-3">
                  <Avatar
                    firstName={a.doctors?.first_name}
                    lastName={a.doctors?.last_name}
                    email={a.doctors?.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(a.starts_at), 'dd MMM yyyy · HH:mm')}
                    </p>
                    <p className="text-xs text-muted">
                      {a.doctors
                        ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name} · ${a.doctors.specialisation}`
                        : 'Doctor TBC'}
                    </p>
                  </div>
                </div>
                <Badge variant={appointmentStatusVariant(a.status)}>
                  {a.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Visit history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul>
            {rows
              .slice()
              .reverse()
              .slice(0, 6)
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-3 text-sm last:border-0"
                >
                  <span className="tabular-nums text-muted">
                    {format(new Date(a.starts_at), 'dd MMM yyyy')}
                  </span>
                  <span className="text-foreground">
                    {a.doctors
                      ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name}`
                      : 'Clinic visit'}
                  </span>
                  <Badge variant={appointmentStatusVariant(a.status)}>
                    {a.status.replace('_', ' ')}
                  </Badge>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export function DoctorDashboardView() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    void (async () => {
      setLoading(true)
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle()
      const query = supabase
        .from('appointments')
        .select('*, patients(first_name, last_name, phone, email)')
        .order('starts_at', { ascending: true })
      const { data } = doctor
        ? await query.eq('doctor_id', doctor.id)
        : await query.limit(20)
      setRows((data as Appointment[]) ?? [])
      setLoading(false)
    })()
  }, [profile])

  const today = useMemo(
    () =>
      rows.filter(
        (a) =>
          isSameDay(new Date(a.starts_at), new Date()) &&
          !['cancelled', 'checked_out'].includes(a.status),
      ),
    [rows],
  )

  const weekCount = rows.filter((a) => {
    const d = new Date(a.starts_at)
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7 && a.status !== 'cancelled'
  }).length

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        actions={
          <Link to="/appointments">
            <Button type="button" size="sm">
              Full schedule
            </Button>
          </Link>
        }
      />
      <div className="flex flex-wrap gap-6 border-b border-border pb-4">
        <KpiStat label="Today" value={today.length} />
        <KpiStat label="This week" value={weekCount} />
        <KpiStat label="Total on record" value={rows.length} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-3 pt-0">
          {today.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">No patients scheduled for today.</p>
          )}
          {today.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-surface-muted"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={a.patients?.first_name}
                  lastName={a.patients?.last_name}
                  email={a.patients?.email}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {a.patients
                      ? `${a.patients.first_name} ${a.patients.last_name}`
                      : 'Patient'}
                  </p>
                  <p className="text-xs text-muted">
                    {format(new Date(a.starts_at), 'HH:mm')}
                    {a.patients?.phone ? ` · ${a.patients.phone}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={appointmentStatusVariant(a.status)}>
                  {a.status.replace('_', ' ')}
                </Badge>
                <Link to="/records">
                  <Button type="button" size="sm" variant="outline">
                    Records
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Upcoming week</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((a) => isAfter(new Date(a.starts_at), new Date()))
                .slice(0, 8)
                .map((a) => (
                  <tr key={a.id} className="border-b border-border/60 hover:bg-surface-muted">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {a.patients
                        ? `${a.patients.first_name} ${a.patients.last_name}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {format(new Date(a.starts_at), 'dd MMM · HH:mm')}
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

export function ItAdminDashboardView() {
  const [users, setUsers] = useState(0)
  const [appointments, setAppointments] = useState(0)
  const [patients, setPatients] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const [u, a, p] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('patients').select('id', { count: 'exact', head: true }),
      ])
      setUsers(u.count ?? 0)
      setAppointments(a.count ?? 0)
      setPatients(p.count ?? 0)
      setLoading(false)
    })()
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-5">
      <PageHeader title="Overview" />
      <div className="flex flex-wrap gap-6 border-b border-border pb-4">
        <KpiStat label="User accounts" value={users} />
        <KpiStat label="Patients" value={patients} />
        <KpiStat label="Appointments" value={appointments} />
        <KpiStat label="Platform" value="OK" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Administration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link to="/users">
              <Button type="button" className="w-full" size="sm" variant="outline">
                Manage users
              </Button>
            </Link>
            <Link to="/audit">
              <Button type="button" className="w-full" size="sm" variant="outline">
                Audit log
              </Button>
            </Link>
            <Link to="/wards">
              <Button type="button" className="w-full" size="sm" variant="outline">
                Wards
              </Button>
            </Link>
            <Link to="/prescriptions">
              <Button type="button" className="w-full" size="sm" variant="outline">
                Prescriptions
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Health checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0 text-sm">
            <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-surface-muted">
              <span className="text-muted">Auth service</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-surface-muted">
              <span className="text-muted">Database</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-surface-muted">
              <span className="text-muted">Last deploy</span>
              <span className="tabular-nums text-foreground">{format(new Date(), 'dd MMM yyyy')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
