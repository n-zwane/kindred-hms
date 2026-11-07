import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Patient } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatientFormDialog } from './PatientFormDialog'

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient grid</h1>
          <Badge className="mt-2">Total patients: {patients.length}</Badge>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New patient
        </Button>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <Link key={p.id} to={`/patients/${p.id}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="space-y-2 pt-6">
                  <div className="font-semibold">
                    {p.first_name} {p.last_name}
                  </div>
                  <p className="text-sm text-gray-500">
                    {p.gender ?? '—'}
                    {p.date_of_birth ? ` · ${p.date_of_birth}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{p.address ?? p.email ?? p.phone}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <PatientFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  )
}
