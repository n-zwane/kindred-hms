import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        className,
      )}
      {...props}
    />
  )
}
