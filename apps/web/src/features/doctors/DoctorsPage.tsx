import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'
import { AddDoctorDrawer } from './AddDoctorDrawer'

export function DoctorsPage() {
  const { profile } = useAuth()
  const canAdd = profile?.role === 'receptionist' || profile?.role === 'admin'
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [open, setOpen] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('doctors').select('*').order('last_name')
    setDoctors((data as Doctor[]) ?? [])
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Doctor grid</h1>
          <Badge className="mt-2">Total doctors: {doctors.length}</Badge>
        </div>
        {canAdd && (
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New doctor
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => (
          <Link key={d.id} to={`/doctors/${d.id}`}>
            <Card className="hover:border-primary/40">
              <CardContent className="pt-6">
                <div className="font-semibold">
                  Dr. {d.first_name} {d.last_name}
                </div>
                <p className="text-sm text-primary">{d.specialisation}</p>
                <p className="mt-2 text-xs text-gray-500">{d.email}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <AddDoctorDrawer open={open} onClose={() => setOpen(false)} onSaved={load} />
    </div>
  )
}
