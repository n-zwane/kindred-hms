import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  WEEKDAYS,
  doctorOnboardingSchema,
  type DoctorOnboardingValues,
} from './doctorOnboarding'

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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<DoctorOnboardingValues>({
    resolver: zodResolver(doctorOnboardingSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      specialisation: '',
      email: '',
      phone: '',
      bio: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
    },
  })
  const selectedDay = watch('day_of_week')

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const onSubmit = async (values: DoctorOnboardingValues) => {
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
      setError(docErr?.message ?? 'Could not create this doctor.')
      return
    }
    const { error: schedErr } = await supabase.from('doctor_schedules').insert({
      doctor_id: doctor.id,
      day_of_week: values.day_of_week,
      start_time: values.start_time,
      end_time: values.end_time,
    })
    if (schedErr) {
      await supabase.from('doctors').delete().eq('id', doctor.id)
      setError(schedErr.message)
      return
    }
    reset()
    onClose()
    onSaved()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-full w-full max-w-lg flex-col bg-white shadow-border"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="new-doctor-title"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id="new-doctor-title" className="text-xl font-semibold">
              New doctor
            </h2>
            <p className="text-sm text-muted">Contact details and a sample clinic day.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-surface-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Contact information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="doctor-first-name">First name</Label>
                  <Input id="doctor-first-name" autoComplete="given-name" {...register('first_name')} />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-danger">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="doctor-last-name">Last name</Label>
                  <Input id="doctor-last-name" autoComplete="family-name" {...register('last_name')} />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-danger">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="doctor-specialisation">Specialisation</Label>
                <Input id="doctor-specialisation" {...register('specialisation')} />
                {errors.specialisation && (
                  <p className="mt-1 text-xs text-danger">{errors.specialisation.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="doctor-email">Email</Label>
                  <Input id="doctor-email" type="email" autoComplete="email" {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="doctor-phone">Phone</Label>
                  <Input id="doctor-phone" type="tel" autoComplete="tel" {...register('phone')} />
                </div>
              </div>
              <div>
                <Label htmlFor="doctor-bio">Bio</Label>
                <Textarea id="doctor-bio" rows={3} {...register('bio')} />
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Appointment schedule</h3>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      setValue('day_of_week', day.value, { shouldValidate: true, shouldDirty: true })
                    }
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      Number(selectedDay) === day.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-muted text-muted hover:text-foreground',
                    )}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('day_of_week')} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="doctor-start">From</Label>
                  <Input id="doctor-start" type="time" {...register('start_time')} />
                  {errors.start_time && (
                    <p className="mt-1 text-xs text-danger">{errors.start_time.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="doctor-end">To</Label>
                  <Input id="doctor-end" type="time" {...register('end_time')} />
                  {errors.end_time && (
                    <p className="mt-1 text-xs text-danger">{errors.end_time.message}</p>
                  )}
                </div>
              </div>
            </section>
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
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
