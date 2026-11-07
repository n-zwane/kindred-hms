import { cn } from '@/lib/utils'
import { personHue, personInitials } from '@/lib/person'
import { portraitUrl } from '@/lib/portraits'

type AvatarProps = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  fullName?: string | null
  src?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function Avatar({
  firstName,
  lastName,
  email,
  fullName,
  src,
  className,
  size = 'md',
}: AvatarProps) {
  const initials = personInitials(firstName, lastName)
  const hue = personHue(firstName, lastName)
  const photo = src ?? portraitUrl({ email, firstName, lastName, fullName })

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className={cn(
          'shrink-0 rounded-full object-cover outline outline-1 outline-offset-[-1px] outline-black/10',
          sizeClass[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-medium text-white',
        sizeClass[size],
        className,
      )}
      style={{ backgroundColor: `hsl(${hue} 42% 48%)` }}
      aria-hidden
    >
      {initials}
    </div>
  )
}
