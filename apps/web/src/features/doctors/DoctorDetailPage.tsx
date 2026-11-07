import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import type { Doctor } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/avatar'

interface Schedule {
  day_of_week: number
  start_time: string
  end_time: string
}

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    if (!id) return
    void (async () => {
      const { data: d } = await supabase.from('doctors').select('*').eq('id', id).single()
      setDoctor(d as Doctor)
      const { data: s } = await supabase
        .from('doctor_schedules')
        .select('day_of_week, start_time, end_time')
        .eq('doctor_id', id)
      setSchedules((s as Schedule[]) ?? [])
    })()
  }, [id])

  if (!doctor) return <p className="text-sm text-muted">Loading…</p>

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profile"
        meta={
          <span className="pb-2 text-muted">
            Dr. {doctor.first_name} {doctor.last_name}
          </span>
        }
        actions={
          <Link to="/doctors">
            <Button type="button" size="sm" variant="outline">
              <CaretLeft size={14} weight="bold" aria-hidden />
              Directory
            </Button>
          </Link>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={doctor.first_name}
              lastName={doctor.last_name}
              email={doctor.email}
              size="lg"
            />
            <div>
            <CardTitle>
              Dr. {doctor.first_name} {doctor.last_name}
            </CardTitle>
            <p className="text-sm text-muted">{doctor.specialisation}</p>
            </div>
          </div>
          <Badge>{doctor.specialisation}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>{doctor.email}</p>
          <p>{doctor.phone ?? '-'}</p>
          <p className="pt-2 text-foreground">{doctor.bio ?? 'No bio yet.'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {schedules.length === 0 ? (
            <p className="text-sm text-muted">No schedule configured.</p>
          ) : (
            schedules.map((s, i) => (
              <span
                key={i}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted"
              >
                D{s.day_of_week} {s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}
              </span>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
