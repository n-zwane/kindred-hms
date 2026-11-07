import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string().min(8),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

export function SignUpPage() {
  const { session } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (session) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setSuccess(null)
    const full_name = `${values.first_name} ${values.last_name}`.trim()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name,
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone ?? '',
          date_of_birth: values.date_of_birth ?? '',
        },
      },
    })
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (data.session) {
      window.location.href = '/'
      return
    }
    setSuccess(
      'Account created. If email confirmation is enabled, check your inbox; otherwise you can sign in now.',
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-[var(--color-auth-panel)] px-10 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Patient registration</h1>
        <p className="mt-4 max-w-md text-gray-600">
          Create a portal account to book appointments and view your authorised health information.
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Create account</h2>
            <p className="text-sm text-gray-500">Staff accounts are issued by your hospital administrator.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" autoComplete="given-name" {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-xs text-red-600">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" autoComplete="family-name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-xs text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of birth (optional)</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} />
              {errors.confirm && <p className="text-xs text-red-600">{errors.confirm.message}</p>}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-700">{success}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create patient account'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link className="text-primary hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
