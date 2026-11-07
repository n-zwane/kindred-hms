import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  specialisation: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
})

type Values = z.infer<typeof schema>

export function AddDoctorDrawer({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
  })

  if (!open) return null

  const onSubmit = async (values: Values) => {
    setError(null)
    const { data: doctor, error: docErr } = await supabase
      .from('doctors')
      .insert({
        first_name: values.first_name,
        last_name: values.last_name,
        specialisation: values.specialisation,
        email: values.email,
        phone: values.phone || null,
        bio: values.bio || null,
      })
      .select('id')
      .single()
    if (docErr || !doctor) {
      setError(docErr?.message ?? 'Failed to create doctor')
      return
    }
    const { error: schedErr } = await supabase.from('doctor_schedules').insert({
      doctor_id: doctor.id,
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
    })
    if (schedErr) {
      setError(schedErr.message)
      return
    }
    reset()
    onClose()
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">New doctor</h2>
        <p className="text-sm text-gray-500">Core fields — extend profile later.</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First name</Label>
              <Input {...register('first_name')} />
            </div>
            <div>
              <Label>Last name</Label>
              <Input {...register('last_name')} />
            </div>
          </div>
          <div>
            <Label>Specialisation</Label>
            <Input {...register('specialisation')} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register('phone')} />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea rows={3} {...register('bio')} />
          </div>
          <fieldset className="rounded-lg border p-3">
            <legend className="px-1 text-sm font-medium">Weekly schedule (sample day)</legend>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Day (0=Sun)</Label>
                <Input type="number" min={0} max={6} {...register('day_of_week')} />
              </div>
              <div>
                <Label>From</Label>
                <Input type="time" {...register('start_time')} />
              </div>
              <div>
                <Label>To</Label>
                <Input type="time" {...register('end_time')} />
              </div>
            </div>
          </fieldset>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Add doctor
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
