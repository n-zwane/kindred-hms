import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthSplitLayout } from '@/features/auth/AuthSplitLayout'
import { AuthFormPanel } from '@/features/auth/AuthFormPanel'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (session) {
    return <Navigate to={(location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'} replace />
  }

  const onSubmit = async (values: FormValues) => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword(values)
    if (signInError) {
      setError(signInError.message)
      return
    }
    navigate('/')
  }

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Hospital administration - secure access for patients and care teams."
    >
        <AuthFormPanel>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Use your assigned account credentials.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <div className="space-y-2 text-center text-sm text-muted">
            <p>
              <Link className="text-primary hover:underline" to="/forgot-password">
                Forgot password?
              </Link>
            </p>
            <p>
              New patient?{' '}
              <Link className="text-primary hover:underline" to="/signup">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        </AuthFormPanel>
    </AuthSplitLayout>
  )
}
