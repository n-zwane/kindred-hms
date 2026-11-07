import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { RoleGate } from '@/app/RoleGate'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignUpPage } from '@/features/auth/SignUpPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PatientsPage } from '@/features/patients/PatientsPage'
import { PatientDetailPage } from '@/features/patients/PatientDetailPage'
import { DoctorsPage } from '@/features/doctors/DoctorsPage'
import { DoctorDetailPage } from '@/features/doctors/DoctorDetailPage'
import { AppointmentsPage } from '@/features/appointments/AppointmentsPage'
import { WardsPage } from '@/features/wards/WardsPage'
import { RecordsPage } from '@/features/records/RecordsPage'
import { PrescriptionsPage } from '@/features/prescriptions/PrescriptionsPage'
import { UsersPage } from '@/features/admin/UsersPage'
import { AuditPage } from '@/features/admin/AuditPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="patients"
              element={
                <RoleGate allow={['receptionist', 'doctor', 'admin', 'it_admin']}>
                  <PatientsPage />
                </RoleGate>
              }
            />
            <Route
              path="patients/:id"
              element={
                <RoleGate allow={['receptionist', 'doctor', 'admin', 'it_admin', 'patient']}>
                  <PatientDetailPage />
                </RoleGate>
              }
            />
            <Route
              path="doctors"
              element={
                <RoleGate allow={['receptionist', 'doctor', 'admin', 'patient']}>
                  <DoctorsPage />
                </RoleGate>
              }
            />
            <Route
              path="doctors/:id"
              element={
                <RoleGate allow={['receptionist', 'doctor', 'admin', 'patient']}>
                  <DoctorDetailPage />
                </RoleGate>
              }
            />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route
              path="wards"
              element={
                <RoleGate allow={['admin']}>
                  <WardsPage />
                </RoleGate>
              }
            />
            <Route
              path="records"
              element={
                <RoleGate allow={['doctor']}>
                  <RecordsPage />
                </RoleGate>
              }
            />
            <Route
              path="prescriptions"
              element={
                <RoleGate allow={['doctor', 'patient']}>
                  <PrescriptionsPage />
                </RoleGate>
              }
            />
            <Route
              path="users"
              element={
                <RoleGate allow={['it_admin']}>
                  <UsersPage />
                </RoleGate>
              }
            />
            <Route
              path="audit"
              element={
                <RoleGate allow={['it_admin']}>
                  <AuditPage />
                </RoleGate>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
