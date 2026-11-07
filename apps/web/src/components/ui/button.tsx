import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,background-color,opacity,transform] duration-150 ease-out motion-safe:enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline:
          'border border-border bg-white text-foreground hover:bg-surface-muted',
        ghost: 'text-muted hover:bg-surface-muted hover:text-foreground',
        destructive: 'bg-danger text-white hover:brightness-95',
      },
      size: {
        default:
          'h-9 px-4 py-2 has-[>svg:first-child]:ps-3.5 has-[>svg:last-child]:pe-3.5',
        sm: 'h-8 rounded-md px-3 text-[13px] has-[>svg:first-child]:ps-2.5 has-[>svg:last-child]:pe-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg:first-child]:ps-[22px] has-[>svg:last-child]:pe-[22px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
