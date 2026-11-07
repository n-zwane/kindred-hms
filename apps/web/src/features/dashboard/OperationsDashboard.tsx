import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addDays,
  eachDayOfInterval,
  format,
  isAfter,
  isSameDay,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { CaretRight, Printer, ShareNetwork } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import type { Appointment, Doctor, UserRole } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, appointmentStatusVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { StackedMonthChart } from './components/StackedMonthChart'
import { PerformanceLineChart } from './components/PerformanceLineChart'
import { StatusSummaryCard } from './components/StatusSummaryCard'
import { DonutStat } from './components/DonutStat'
import { KpiStat } from './components/KpiStat'
import { cn } from '@/lib/utils'

type DoctorBucket = 'available' | 'busy' | 'leave'

type Props = {
  role: UserRole
}

const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function OperationsDashboard({ role }: Props) {
  const [counts, setCounts] = useState({ patients: 0, appointments: 0, doctors: 0 })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [aptTotal, setAptTotal] = useState(0)
  const [doctorTab, setDoctorTab] = useState<DoctorBucket | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all')
  const [tab, setTab] = useState<'overview' | 'doctors' | 'visits'>('overview')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      const [{ count: patientCount }, { data: aptRows }, { count: doctorCount }, { data: docRows }] =
        await Promise.all([
          supabase.from('patients').select('id', { count: 'exact', head: true }),
          supabase
            .from('appointments')
            .select('*, patients(first_name, last_name, phone, email), doctors(first_name, last_name, specialisation, email)')
            .order('starts_at', { ascending: false })
            .limit(250),
          supabase.from('doctors').select('id', { count: 'exact', head: true }),
          supabase.from('doctors').select('*').order('last_name').limit(24),
        ])
      setCounts({
        patients: patientCount ?? 0,
        appointments: aptRows?.length ? aptRows.length : 0,
        doctors: doctorCount ?? 0,
      })
      setAppointments((aptRows as Appointment[]) ?? [])
      setDoctors((docRows as Doctor[]) ?? [])
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    void supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setAptTotal(count ?? 0))
  }, [])

  const weekSeries = useMemo(() => {
    const thisStart = startOfWeek(new Date(), { weekStartsOn: 0 })
    const lastStart = subWeeks(thisStart, 1)
    const thisDays = eachDayOfInterval({ start: thisStart, end: addDays(thisStart, 6) })
    const lastDays = eachDayOfInterval({ start: lastStart, end: addDays(lastStart, 6) })
    return thisDays.map((day, i) => ({
      label: weekday[i],
      thisWeek: appointments.filter((a) => isSameDay(new Date(a.starts_at), day)).length,
      lastWeek: appointments.filter((a) => isSameDay(new Date(a.starts_at), lastDays[i])).length,
    }))
  }, [appointments])

  const thisWeekTotal = useMemo(
    () => weekSeries.reduce((sum, d) => sum + d.thisWeek, 0),
    [weekSeries],
  )
  const lastWeekTotal = useMemo(
    () => weekSeries.reduce((sum, d) => sum + d.lastWeek, 0),
    [weekSeries],
  )
  const weekDelta =
    lastWeekTotal === 0
      ? thisWeekTotal > 0
        ? '+100%'
        : '0%'
      : `${(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1)}%`

  const todayCount = useMemo(
    () => appointments.filter((a) => isSameDay(new Date(a.starts_at), new Date())).length,
    [appointments],
  )

  const confirmed = appointments.filter((a) => a.status === 'confirmed').length
  const checkedIn = appointments.filter((a) => a.status === 'checked_in').length
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length
  const completed = appointments.filter((a) => a.status === 'checked_out').length
  const denom = Math.max(appointments.length, 1)

  const monthStacked = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const buckets = labels.map((label) => ({
      label,
      completed: 0,
      ongoing: 0,
      scheduled: 0,
    }))
    for (const a of appointments) {
      const d = new Date(a.starts_at)
      if (d.getFullYear() !== now.getFullYear() || a.status === 'cancelled') continue
      const i = d.getMonth()
      if (a.status === 'checked_out') buckets[i].completed += 1
      else if (a.status === 'checked_in' || a.status === 'confirmed') buckets[i].ongoing += 1
      else buckets[i].scheduled += 1
    }
    return buckets
  }, [appointments])

  const upcoming = useMemo(() => {
    const now = new Date()
    return [...appointments]
      .filter((a) => isAfter(new Date(a.starts_at), now))
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 5)
  }, [appointments])

  const doctorMeta = useMemo(() => {
    const today = startOfDay(new Date())
    return doctors.map((d) => {
      const todays = appointments.filter(
        (a) =>
          a.doctor_id === d.id &&
          isSameDay(new Date(a.starts_at), today) &&
          a.status !== 'cancelled',
      ).length
      const future = appointments.some(
        (a) =>
          a.doctor_id === d.id &&
          isAfter(new Date(a.starts_at), new Date()) &&
          a.status !== 'cancelled',
      )
      let bucket: DoctorBucket = 'available'
      if (todays >= 4) bucket = 'busy'
      else if (!future && todays === 0) bucket = 'leave'
      return { doctor: d, bucket, todays }
    })
  }, [doctors, appointments])

  const doctorCounts = useMemo(
    () => ({
      available: doctorMeta.filter((x) => x.bucket === 'available').length,
      busy: doctorMeta.filter((x) => x.bucket === 'busy').length,
      leave: doctorMeta.filter((x) => x.bucket === 'leave').length,
    }),
    [doctorMeta],
  )

  const visibleDoctors = useMemo(() => {
    const list =
      doctorTab === 'all' ? doctorMeta : doctorMeta.filter((x) => x.bucket === doctorTab)
    return list.slice(0, 6)
  }, [doctorMeta, doctorTab])

  const tableRows = useMemo(() => {
    const filtered =
      statusFilter === 'all'
        ? appointments
        : appointments.filter((a) => a.status === statusFilter)
    return filtered.slice(0, 10)
  }, [appointments, statusFilter])

  const spark = weekSeries.map((d) => d.thisWeek)

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-5 text-sm" role="tablist" aria-label="Dashboard sections">
          {(
            [
              ['overview', 'Overview'],
              ['visits', 'Visits'],
              ['doctors', 'Doctors'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'cursor-pointer border-b-2 pb-2 text-muted transition-colors duration-150',
                tab === key
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            <ShareNetwork size={14} weight="regular" aria-hidden />
            Share
          </Button>
          <Button type="button" variant="outline" size="sm">
            <Printer size={14} weight="regular" aria-hidden />
            Print
          </Button>
          <Link to="/appointments">
            <Button type="button" size="sm">
              Export
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-border pb-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiStat label="Doctors" value={counts.doctors} trend="+8.2%" trendUp />
        <KpiStat label="Patients" value={counts.patients} trend="+1.1%" trendUp />
        <KpiStat label="Appointments" value={aptTotal} trend={weekDelta} trendUp={thisWeekTotal >= lastWeekTotal} />
        <KpiStat label="Confirmed" value={confirmed} />
        <KpiStat label="Checked in" value={checkedIn} />
        <KpiStat label="Cancelled" value={cancelled} trendUp={false} />
      </div>

      {(tab === 'overview' || tab === 'visits') && (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,1fr)]">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Appointment volume</CardTitle>
                    <p className="mt-1 text-sm text-muted">
                      Daily visits this week compared with last week
                      {role === 'admin' ? ' for clinic operations.' : '.'}
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                      This week
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                      Last week
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <PerformanceLineChart series={weekSeries} />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <StatusSummaryCard
                title="Status summary"
                label="Today's visits"
                value={todayCount}
                spark={spark}
              />
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <DonutStat
                    label="Completed"
                    value={`${Math.round((completed / denom) * 100)}%`}
                    percent={(completed / denom) * 100}
                  />
                  <DonutStat
                    label="Confirmed"
                    value={`${confirmed}`}
                    percent={(confirmed / denom) * 100}
                    color="var(--color-accent)"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,1fr)]">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Clinic overview</CardTitle>
                  <p className="mt-1 text-sm text-muted">Scheduled versus completed visits this year</p>
                  <p className="mt-3 text-2xl font-medium tabular-nums">
                    {aptTotal.toLocaleString()}{' '}
                    <span className="text-sm font-normal text-muted">visits</span>
                    <span
                      className={cn(
                        'ml-2 text-sm',
                        thisWeekTotal >= lastWeekTotal ? 'text-success' : 'text-danger',
                      )}
                    >
                      ({weekDelta})
                    </span>
                  </p>
                </div>
                <span className="rounded-md border border-border px-3 py-1.5 text-xs text-muted">
                  This year
                </span>
              </CardHeader>
              <CardContent>
                <StackedMonthChart months={monthStacked} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming visits</CardTitle>
                <Link to="/appointments" className="text-lg leading-none text-primary">
                  +
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcoming.length === 0 && (
                  <p className="text-sm text-muted">No upcoming appointments.</p>
                )}
                {upcoming.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border border-border" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        {a.patients
                          ? `${a.patients.first_name} ${a.patients.last_name}`
                          : 'Patient'}
                        {a.doctors && ` · Dr. ${a.doctors.last_name}`}
                      </p>
                      <p className="text-xs text-muted">
                        {format(new Date(a.starts_at), 'dd MMM yyyy · HH:mm')}
                      </p>
                    </div>
                    <Badge variant={appointmentStatusVariant(a.status)}>
                      {a.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {(tab === 'overview' || tab === 'doctors') && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Doctors schedule</CardTitle>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'All', doctorMeta.length],
                  ['available', 'Available', doctorCounts.available],
                  ['busy', 'Busy', doctorCounts.busy],
                  ['leave', 'No schedule', doctorCounts.leave],
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDoctorTab(key)}
                  className={cn(
                    'cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                    doctorTab === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-muted text-muted hover:text-foreground',
                  )}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums opacity-80">({count})</span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleDoctors.length === 0 && (
              <p className="text-sm text-muted">No doctors in this filter.</p>
            )}
            {visibleDoctors.map(({ doctor: d, bucket }) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-surface-muted"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    firstName={d.first_name}
                    lastName={d.last_name}
                    email={d.email}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Dr. {d.first_name} {d.last_name}
                    </p>
                    <p className="text-xs text-muted">{d.specialisation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      bucket === 'available' ? 'success' : bucket === 'busy' ? 'warning' : 'muted'
                    }
                  >
                    {bucket === 'leave' ? 'No schedule' : bucket}
                  </Badge>
                  <Link to={`/doctors/${d.id}`}>
                    <Button type="button" size="sm">
                      Book now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <Link to="/doctors" className="inline-flex">
              <Button type="button" variant="ghost" size="sm">
                View all doctors
                <CaretRight size={16} weight="bold" className="rtl:-scale-x-100" aria-hidden />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {tab === 'visits' && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>All appointments</CardTitle>
            {statusFilter !== 'all' && (
              <button
                type="button"
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
                onClick={() => setStatusFilter('all')}
              >
                Clear filter
              </button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border text-xs font-medium text-muted">
                  <tr>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Date & time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((a) => (
                    <tr key={a.id} className="border-b border-border/70">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            firstName={a.patients?.first_name}
                            lastName={a.patients?.last_name}
                            email={a.patients?.email}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {a.patients
                                ? `${a.patients.first_name} ${a.patients.last_name}`
                                : '-'}
                            </p>
                            {a.patients?.phone && (
                              <p className="text-xs text-muted">{a.patients.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {a.doctors
                          ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted">
                        {format(new Date(a.starts_at), 'dd MMM yyyy · HH:mm')}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
