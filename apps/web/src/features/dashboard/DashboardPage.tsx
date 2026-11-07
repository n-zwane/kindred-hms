import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/types'

const copy: Record<UserRole, { title: string; body: string; cta?: { label: string; href: string } }> = {
  patient: {
    title: 'Patient dashboard',
    body: 'View and book appointments and access your authorised health information.',
    cta: { label: 'My appointments', href: '/appointments' },
  },
  receptionist: {
    title: 'Reception desk',
    body: 'Register patients, manage appointments, and find doctors by specialisation.',
    cta: { label: 'Patient grid', href: '/patients' },
  },
  doctor: {
    title: 'Doctor dashboard',
    body: 'Your appointment book, patient records, and prescriptions.',
    cta: { label: 'Appointments', href: '/appointments' },
  },
  admin: {
    title: 'Operations dashboard',
    body: 'Track appointment statuses and allocate wards with available capacity.',
    cta: { label: 'Ward management', href: '/wards' },
  },
  it_admin: {
    title: 'System administration',
    body: 'Manage users, review audit activity, and monitor system health.',
    cta: { label: 'Users', href: '/users' },
  },
}

export function DashboardPage() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState({ patients: 0, appointments: 0, doctors: 0 })

  useEffect(() => {
    if (!profile) return
    void (async () => {
      if (['receptionist', 'admin', 'doctor', 'it_admin'].includes(profile.role)) {
        const { count } = await supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
        setCounts((c) => ({ ...c, patients: count ?? 0 }))
      }
      const { count: aptCount } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
      setCounts((c) => ({ ...c, appointments: aptCount ?? 0 }))
      if (profile.role !== 'patient') {
        const { count: docCount } = await supabase
          .from('doctors')
          .select('id', { count: 'exact', head: true })
        setCounts((c) => ({ ...c, doctors: docCount ?? 0 }))
      }
    })()
  }, [profile])

  if (!profile) {
    return <p className="text-gray-500">Loading dashboard…</p>
  }
  const content = copy[profile.role]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
        <p className="mt-1 text-gray-600">{content.body}</p>
        {content.cta && (
          <Link to={content.cta.href} className="mt-4 inline-block">
            <Button type="button">{content.cta.label}</Button>
          </Link>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {profile.role !== 'patient' && (
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-primary">{counts.patients}</CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-primary">{counts.appointments}</CardContent>
        </Card>
        {profile.role !== 'patient' && (
          <Card>
            <CardHeader>
              <CardTitle>Doctors</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-primary">{counts.doctors}</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
