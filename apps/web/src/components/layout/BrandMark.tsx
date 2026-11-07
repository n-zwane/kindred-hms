import { cn } from '@/lib/utils'
import logo from '@/assets/Kindred logo.png'

type BrandMarkProps = {
  className?: string
  inverted?: boolean
}

export function BrandMark({ className, inverted = false }: BrandMarkProps) {
  return (
    <img
      src={logo}
      alt=""
      className={cn(
        'h-9 w-auto object-contain',
        inverted && 'rounded-md bg-white p-1',
        className,
      )}
      aria-hidden
    />
  )
}
