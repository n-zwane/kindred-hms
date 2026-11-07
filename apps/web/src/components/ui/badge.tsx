import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-emerald-100 text-emerald-800',
        warning: 'bg-amber-100 text-amber-900',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-sky-100 text-sky-800',
        muted: 'bg-gray-100 text-gray-700',
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
