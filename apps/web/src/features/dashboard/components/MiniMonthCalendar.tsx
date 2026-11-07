import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { cn } from '@/lib/utils'

type MiniMonthCalendarProps = {
  month: Date
  highlighted?: Date[]
}

const weekday = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function MiniMonthCalendar({ month, highlighted = [] }: MiniMonthCalendarProps) {
  const start = startOfWeek(startOfMonth(month))
  const end = endOfWeek(endOfMonth(month))
  const days = eachDayOfInterval({ start, end })
  const weeks = days.length / 7
  const today = new Date()

  return (
    <div className="flex min-h-[22rem] flex-col text-sm">
      <p className="mb-3 font-medium text-foreground">{format(month, 'MMMM yyyy')}</p>
      <div
        className="grid min-h-0 flex-1 grid-cols-7 text-center text-xs text-muted"
        style={{ gridTemplateRows: `auto repeat(${weeks}, minmax(2.75rem, 1fr))` }}
      >
        {weekday.map((d) => (
          <div key={d} className="py-1.5 font-medium uppercase tracking-wide">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month)
          const isToday = isSameDay(day, today)
          const hasAppt = highlighted.some((h) => isSameDay(h, day))
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex items-center justify-center rounded-md text-sm tabular-nums',
                !inMonth && 'text-border',
                inMonth && 'text-foreground/80',
                isToday && 'bg-primary font-medium text-primary-foreground',
                !isToday && hasAppt && 'bg-primary/10 font-medium text-primary',
              )}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
    </div>
  )
}
