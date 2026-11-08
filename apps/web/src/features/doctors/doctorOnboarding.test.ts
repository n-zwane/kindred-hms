import { describe, expect, it } from 'vitest'
import { doctorOnboardingSchema } from './doctorOnboarding'

const valid = {
  first_name: 'Nomsa',
  last_name: 'Dlamini',
  specialisation: 'Cardiology',
  email: 'nomsa.dlamini@clinic.test',
  phone: '0210000000',
  bio: '',
  day_of_week: 1,
  start_time: '09:00',
  end_time: '17:00',
}

describe('doctorOnboardingSchema', () => {
  it('accepts a numeric weekday from the receptionist form', () => {
    const parsed = doctorOnboardingSchema.parse(valid)
    expect(parsed.day_of_week).toBe(1)
  })

  it('rejects a closing time that is not after the opening time', () => {
    const result = doctorOnboardingSchema.safeParse({
      ...valid,
      start_time: '17:00',
      end_time: '09:00',
    })
    expect(result.success).toBe(false)
  })
})
