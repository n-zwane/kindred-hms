import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted/70 transition-[border-color,box-shadow] duration-150 ease-out focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        className,
      )}
      {...props}
    />
  )
}
