import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import type { Patient } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/AuthContext'
import { PatientFormDialog } from './PatientFormDialog'

export function PatientsPage() {
  const { profile } = useAuth()
  const canAdd = profile?.role === 'receptionist' || profile?.role === 'admin'
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('last_name')
    if (!error && data) setPatients(data as Patient[])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter((p) =>
      `${p.first_name} ${p.last_name} ${p.email ?? ''} ${p.phone ?? ''}`.toLowerCase().includes(q),
    )
  }, [patients, query])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Directory"
        meta={<span className="pb-2 text-muted">{patients.length} patients</span>}
        actions={
          canAdd ? (
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              <Plus size={14} weight="regular" aria-hidden />
              New patient
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
          placeholder="Search by name, email, or phone"
          className="h-9 w-full rounded-md border border-border bg-white pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label="Search patients"
        />
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    firstName={p.first_name}
                    lastName={p.last_name}
                    email={p.email}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">
                      {p.first_name} {p.last_name}
                    </div>
                    <p className="text-sm text-muted">
                      {p.gender ?? '-'}
                      {p.date_of_birth ? ` · ${p.date_of_birth}` : ''}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {p.phone ?? p.email ?? p.address ?? '-'}
                    </p>
                  </div>
                </div>
                <Link to={`/patients/${p.id}`} className="block">
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
        <p className="text-sm text-muted">No patients match your search.</p>
      )}
      <PatientFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  )
}
