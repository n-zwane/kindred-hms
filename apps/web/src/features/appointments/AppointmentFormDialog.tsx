import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  starts_at: z.string().min(1),
  ends_at: z.string().min(1),
})

type Values = z.infer<typeof schema>

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [patients, setPatients] = useState<{ id: string; label: string }[]>([])
  const [doctors, setDoctors] = useState<{ id: string; label: string }[]>([])
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) return
    void (async () => {
      const { data: p } = await supabase.from('patients').select('id, first_name, last_name')
      setPatients(
        (p ?? []).map((row) => ({
          id: row.id,
          label: `${row.first_name} ${row.last_name}`,
        })),
      )
      const { data: d } = await supabase.from('doctors').select('id, first_name, last_name')
      setDoctors(
        (d ?? []).map((row) => ({
          id: row.id,
          label: `Dr. ${row.first_name} ${row.last_name}`,
        })),
      )
    })()
  }, [open])

  if (!open) return null

  const onSubmit = async (values: Values) => {
    setError(null)
    const { error: insertError } = await supabase.from('appointments').insert({
      ...values,
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
      status: 'pending',
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    onOpenChange(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-transparent bg-white p-6 shadow-border">
        <h2 className="text-lg font-semibold">New appointment</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Patient</Label>
            <select className="h-10 w-full rounded-lg border px-2" {...register('patient_id')}>
              <option value="">Select…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Doctor</Label>
            <select className="h-10 w-full rounded-lg border px-2" {...register('doctor_id')}>
              <option value="">Select…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Starts</Label>
            <Input type="datetime-local" {...register('starts_at')} />
          </div>
          <div>
            <Label>Ends</Label>
            <Input type="datetime-local" {...register('ends_at')} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
