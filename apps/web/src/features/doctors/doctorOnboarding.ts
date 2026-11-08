import { z } from 'zod'

export const WEEKDAYS = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' },
] as const

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Number.NaN
  return hours * 60 + minutes
}

export const doctorOnboardingSchema = z
  .object({
    first_name: z.string().trim().min(1, 'Enter a first name'),
    last_name: z.string().trim().min(1, 'Enter a last name'),
    specialisation: z.string().trim().min(1, 'Enter a specialisation'),
    email: z.string().trim().email('Enter a valid email'),
    phone: z.string().optional(),
    bio: z.string().optional(),
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().min(1, 'Choose a start time'),
    end_time: z.string().min(1, 'Choose an end time'),
  })
  .refine((values) => timeToMinutes(values.start_time) < timeToMinutes(values.end_time), {
    path: ['end_time'],
    message: 'End time must be after start time',
  })

export type DoctorOnboardingValues = z.infer<typeof doctorOnboardingSchema>
