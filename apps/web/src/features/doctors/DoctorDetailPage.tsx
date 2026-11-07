import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Doctor } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

  if (!doctor) return <p className="text-gray-500">Loading…</p>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Dr. {doctor.first_name} {doctor.last_name}
          </CardTitle>
          <Badge>{doctor.specialisation}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>{doctor.email}</p>
          <p>{doctor.phone ?? '—'}</p>
          <p className="pt-2">{doctor.bio ?? 'No bio yet.'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {schedules.length === 0 ? (
            <p className="text-sm text-gray-500">No schedule configured.</p>
          ) : (
            schedules.map((s, i) => (
              <Badge key={i} variant="muted">
                D{s.day_of_week} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
