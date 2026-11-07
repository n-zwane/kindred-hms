import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        danger: 'bg-red-50 text-red-700',
        info: 'bg-primary/10 text-primary',
        muted: 'bg-slate-100 text-slate-600',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function appointmentStatusVariant(
  status: string,
): VariantProps<typeof badgeVariants>['variant'] {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'checked_in':
      return 'warning'
    case 'cancelled':
      return 'danger'
    case 'checked_out':
      return 'muted'
    case 'scheduled':
      return 'info'
    default:
      return 'default'
  }
}
