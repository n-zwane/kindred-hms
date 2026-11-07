import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import type { UserRole } from '@/types'
import type { ReactNode } from 'react'

export function RoleGate({
  allow,
  children,
}: {
  allow: UserRole[]
  children: ReactNode
}) {
  const { profile } = useAuth()
  if (!profile || !allow.includes(profile.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
