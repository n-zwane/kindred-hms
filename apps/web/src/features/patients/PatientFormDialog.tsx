import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
})

type Values = z.infer<typeof schema>

export function PatientFormDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  if (!open) return null

  const onSubmit = async (values: Values) => {
    setError(null)
    const { error: insertError } = await supabase.from('patients').insert({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || null,
      phone: values.phone || null,
      gender: values.gender || null,
      blood_group: values.blood_group || null,
      address: values.address || null,
      date_of_birth: values.date_of_birth || null,
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    reset()
    onOpenChange(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">New patient</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First name</Label>
              <Input {...register('first_name')} />
            </div>
            <div>
              <Label>Last name</Label>
              <Input {...register('last_name')} />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Gender</Label>
              <Input {...register('gender')} />
            </div>
            <div>
              <Label>Blood group</Label>
              <Input {...register('blood_group')} />
            </div>
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input type="date" {...register('date_of_birth')} />
          </div>
          <div>
            <Label>Address</Label>
            <Input {...register('address')} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
