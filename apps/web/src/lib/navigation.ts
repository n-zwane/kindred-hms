import type { Icon } from '@phosphor-icons/react'
import {
  Buildings,
  CalendarBlank,
  ClipboardText,
  Note,
  Pill,
  ShieldCheck,
  SquaresFour,
  Stethoscope,
  Users,
} from '@phosphor-icons/react'
import type { UserRole } from '@/types'

export interface NavItem {
  label: string
  href: string
  icon: Icon
}

const byRole: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Appointments', href: '/appointments', icon: CalendarBlank },
  ],
  receptionist: [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Appointments', href: '/appointments', icon: CalendarBlank },
    { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  ],
  doctor: [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Appointments', href: '/appointments', icon: CalendarBlank },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Records', href: '/records', icon: Note },
    { label: 'Prescriptions', href: '/prescriptions', icon: Pill },
  ],
  admin: [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Appointments', href: '/appointments', icon: CalendarBlank },
    { label: 'Wards', href: '/wards', icon: Buildings },
  ],
  it_admin: [
    { label: 'Dashboard', href: '/', icon: SquaresFour },
    { label: 'Users', href: '/users', icon: ShieldCheck },
    { label: 'Audit log', href: '/audit', icon: ClipboardText },
  ],
}

export function navItemsForRole(role: UserRole): NavItem[] {
  return byRole[role] ?? []
}
