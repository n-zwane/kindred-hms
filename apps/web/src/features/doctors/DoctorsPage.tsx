import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import type { Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/AuthContext'
import { AddDoctorDrawer } from './AddDoctorDrawer'

export function DoctorsPage() {
  const { profile } = useAuth()
  const canAdd = profile?.role === 'receptionist' || profile?.role === 'admin'
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('doctors').select('*').order('last_name')
    setDoctors((data as Doctor[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter((d) =>
      `${d.first_name} ${d.last_name} ${d.specialisation} ${d.email}`.toLowerCase().includes(q),
    )
  }, [doctors, query])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Directory"
        meta={<span className="pb-2 text-muted">{doctors.length} doctors</span>}
        actions={
          canAdd ? (
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              <Plus size={14} weight="regular" aria-hidden />
              New doctor
            </Button>
          ) : undefined
        }
      />
      <div className="relative max-w-md">
        <MagnifyingGlass
          size={16}
          weight="regular"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or speciality"
          className="h-9 w-full rounded-md border border-border bg-white pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label="Search doctors"
        />
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar firstName={d.first_name} lastName={d.last_name} email={d.email} />
                  <div>
                    <div className="font-medium text-foreground">
                      Dr. {d.first_name} {d.last_name}
                    </div>
                    <p className="text-sm font-medium text-primary">{d.specialisation}</p>
                    <p className="mt-1 text-xs text-muted">{d.email}</p>
                  </div>
                </div>
                <Link to={`/doctors/${d.id}`} className="block">
                  <Button type="button" variant="outline" size="sm" className="w-full">
                    View profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted">No doctors match your search.</p>
      )}
      <AddDoctorDrawer open={open} onClose={() => setOpen(false)} onSaved={load} />
    </div>
  )
}
