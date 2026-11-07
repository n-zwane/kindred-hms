import { Outlet, NavLink } from 'react-router-dom'
import { Bell, Calendar, LogOut, Search, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { navItemsForRole } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const CLINIC_NAME = 'Trustcare Clinic'
const CLINIC_LOCATION = 'Bellville'

export function AppShell() {
  const { profile, signOut } = useAuth()
  const nav = profile ? navItemsForRole(profile.role) : []

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-white">
        <div className="border-b border-gray-100 px-5 py-5">
          <div className="text-lg font-bold text-primary">Kindred</div>
          <p className="mt-3 text-xs font-medium text-gray-500">Clinic</p>
          <div className="mt-1 rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <div className="font-medium text-gray-900">{CLINIC_NAME}</div>
            <div className="text-gray-500">{CLINIC_LOCATION}</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50',
                  isActive && 'bg-primary/10 text-primary',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4 text-xs text-gray-400">
          © {new Date().getFullYear()} Kindred
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-white px-6">
          <div className="relative mx-auto w-full max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search…"
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-gray-50 pl-10 pr-4 text-sm"
              aria-label="Search"
            />
          </div>
          <Calendar className="h-5 w-5 text-gray-500" aria-hidden />
          <Settings className="h-5 w-5 text-gray-500" aria-hidden />
          <Bell className="h-5 w-5 text-gray-500" aria-hidden />
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="text-right text-sm">
              <div className="font-medium">{profile?.full_name}</div>
              <div className="text-xs capitalize text-gray-500">{profile?.role.replace('_', ' ')}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => void signOut()} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
