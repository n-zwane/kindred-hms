import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthSplitLayout } from '@/features/auth/AuthSplitLayout'
import { AuthFormPanel } from '@/features/auth/AuthFormPanel'

const schema = z.object({ email: z.string().email() })

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: { email: string }) => {
    setError(null)
    setMessage(null)
    const redirectTo = `${window.location.origin}/reset-password`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (resetError) {
      setError(resetError.message)
      return
    }
    setMessage('If an account exists, a reset link was sent.')
  }

  return (
    <AuthSplitLayout
      title="Reset your password"
      subtitle="Enter the email linked to your account and we will send a secure reset link."
    >
      <AuthFormPanel>
      <div>
        <h1 className="text-xl font-medium">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">We will email you a reset link.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Send reset link
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
      </AuthFormPanel>
    </AuthSplitLayout>
  )
}
