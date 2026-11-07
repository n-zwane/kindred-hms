export type UserRole =
  | 'patient'
  | 'receptionist'
  | 'doctor'
  | 'admin'
  | 'it_admin'

export type AppointmentStatus =
  | 'pending'
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
}

export interface Patient {
  id: string
  profile_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  blood_group: string | null
  address: string | null
  created_at: string
}

export interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialisation: string
  email: string
  phone: string | null
  bio: string | null
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  notes: string | null
  patients?: Pick<Patient, 'first_name' | 'last_name' | 'phone'>
  doctors?: Pick<Doctor, 'first_name' | 'last_name' | 'specialisation'>
}

export interface Ward {
  id: string
  name: string
  capacity: number
  occupied: number
}
