import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import type { UserRole } from '@/types'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { session, profile, loading, profileLoading } = useAuth()
  const location = useLocation()

  if (loading || (session && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-gray-600">
        <div>
          <p className="font-medium">Could not load your profile.</p>
          <p className="mt-1 text-sm text-gray-500">
            Check that Supabase is running and your user has a row in <code>profiles</code>.
          </p>
        </div>
      </div>
    )
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
