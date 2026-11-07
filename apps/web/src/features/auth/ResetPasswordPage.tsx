import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z
  .object({
    password: z.string().min(6),
    confirm: z.string().min(6),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  })

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<{
    password: string
    confirm: string
  }>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ password }: { password: string }) => {
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      return
    }
    navigate('/login')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-[var(--color-auth-panel)] lg:flex">
        <img src="/rafiki.png" alt="" className="max-h-80 w-auto" />
      </div>
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4 rounded-xl border bg-white p-8">
          <h1 className="text-xl font-semibold">Reset password</h1>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" {...register('confirm')} />
            </div>
            {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Set password
            </Button>
          </form>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
