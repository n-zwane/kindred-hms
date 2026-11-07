import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Pill,
  Stethoscope,
  Users,
  Building2,
  Shield,
  FileText,
} from 'lucide-react'
import type { UserRole } from '@/types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const byRole: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
  ],
  receptionist: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Doctors', href: '/doctors', icon: Stethoscope },
  ],
  doctor: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Records', href: '/records', icon: FileText },
    { label: 'Prescriptions', href: '/prescriptions', icon: Pill },
  ],
  admin: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Wards', href: '/wards', icon: Building2 },
  ],
  it_admin: [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Users', href: '/users', icon: Shield },
    { label: 'Audit log', href: '/audit', icon: ClipboardList },
  ],
}

export function navItemsForRole(role: UserRole): NavItem[] {
  return byRole[role] ?? []
}
