import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { navItemsForRole } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/layout/BrandMark'
import { HeaderToolbar } from '@/layouts/HeaderToolbar'

const CLINIC_NAME = 'Trustcare Clinic'
const CLINIC_LOCATION = 'Bellville'

const routeCopy: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Your clinic performance summary this week',
  },
  '/patients': { title: 'Patients', subtitle: 'Search and open patient profiles' },
  '/doctors': { title: 'Doctors', subtitle: 'Browse specialists and availability' },
  '/appointments': { title: 'Appointments', subtitle: 'Scheduling, check-ins, and status' },
  '/wards': { title: 'Wards', subtitle: 'Occupancy and bed allocation' },
  '/records': { title: 'Records', subtitle: 'Clinical notes and visit history' },
  '/prescriptions': { title: 'Prescriptions', subtitle: 'Medications issued to patients' },
  '/users': { title: 'Users', subtitle: 'Accounts and role assignments' },
  '/audit': { title: 'Audit', subtitle: 'Recent platform activity' },
}

function copyForPath(pathname: string) {
  if (routeCopy[pathname]) return routeCopy[pathname]
  if (pathname.startsWith('/patients/')) {
    return { title: 'Patient', subtitle: 'Profile, contact details, and visit history' }
  }
  if (pathname.startsWith('/doctors/')) {
    return { title: 'Doctor', subtitle: 'Profile, speciality, and availability' }
  }
  return { title: 'Kindred', subtitle: '' }
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function AppShell() {
  const { profile } = useAuth()
  const location = useLocation()
  const nav = profile ? navItemsForRole(profile.role) : []
  const copy = copyForPath(location.pathname)
  const nameParts = profile?.full_name?.trim().split(/\s+/) ?? []
  const greeting = greetingForHour(new Date().getHours())
  const firstName = nameParts[0] || 'there'

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="flex w-56 shrink-0 flex-col bg-white">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <BrandMark />
          <div className="text-[15px] font-medium text-foreground">Kindred</div>
        </div>
        <p className="px-5 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
          {CLINIC_NAME} · {CLINIC_LOCATION}
        </p>
        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Main navigation">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-[background-color,color] duration-150 hover:bg-surface-muted hover:text-foreground',
                  isActive && 'bg-surface-muted font-medium text-primary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    weight={isActive ? 'fill' : 'regular'}
                    className="shrink-0"
                    aria-hidden
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-muted">© {new Date().getFullYear()} Kindred</div>
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="flex flex-nowrap items-center gap-3 bg-background px-6 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] font-normal text-muted">
              {greeting}, <span className="font-medium text-foreground">{firstName}</span>
            </h1>
            <p className="mt-0.5 text-sm text-muted">{copy.subtitle || copy.title}</p>
          </div>
          <HeaderToolbar />
        </header>
        <main
          key={location.pathname}
          className="animate-enter-up min-w-0 flex-1 px-6 pb-8 pt-3"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
