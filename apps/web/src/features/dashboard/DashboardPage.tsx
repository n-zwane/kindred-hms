import { useAuth } from '@/features/auth/AuthContext'
import { OperationsDashboard } from './OperationsDashboard'
import {
  DoctorDashboardView,
  ItAdminDashboardView,
  PatientDashboardView,
} from './PatientDoctorDashboard'

export function DashboardPage() {
  const { profile } = useAuth()

  if (!profile) {
    return (
      <p className="text-sm text-[var(--color-muted)]" role="status">
        Loading dashboard…
      </p>
    )
  }

  switch (profile.role) {
    case 'patient':
      return <PatientDashboardView />
    case 'doctor':
      return <DoctorDashboardView />
    case 'it_admin':
      return <ItAdminDashboardView />
    case 'receptionist':
    case 'admin':
    default:
      return <OperationsDashboard role={profile.role} />
  }
}
