import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarBlank,
  EnvelopeSimple,
  MagnifyingGlass,
  SignOut,
} from '@phosphor-icons/react'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import type { Appointment } from '@/types'

type MenuId = 'date' | 'search' | 'alerts' | 'mail' | 'profile' | null

const iconBtn =
  'inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted transition-[color,background-color,scale] duration-150 ease-out hover:bg-surface-muted hover:text-foreground motion-safe:enabled:active:scale-[0.96]'

function Popover({
  open,
  align = 'end',
  children,
}: {
  open: boolean
  align?: 'start' | 'end'
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div
      role="dialog"
      className={cn(
        'animate-popover-in absolute top-[calc(100%+8px)] z-30 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-white p-3 shadow-border',
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
      )}
    >
      {children}
    </div>
  )
}

export function HeaderToolbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<MenuId>(null)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<{ label: string; href: string }[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const nameParts = profile?.full_name?.trim().split(/\s+/) ?? []

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    void supabase
      .from('appointments')
      .select('*, patients(first_name, last_name, email), doctors(first_name, last_name, specialisation, email)')
      .order('starts_at', { ascending: false })
      .limit(12)
      .then(({ data }) => setAppointments((data as Appointment[]) ?? []))
  }, [])

  useEffect(() => {
    if (open !== 'search') return
    const q = query.trim()
    if (q.length < 2) {
      setHits([])
      return
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        const like = `%${q}%`
        const [{ data: patients }, { data: doctors }] = await Promise.all([
          supabase
            .from('patients')
            .select('id, first_name, last_name')
            .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`)
            .limit(5),
          supabase
            .from('doctors')
            .select('id, first_name, last_name, specialisation')
            .or(`first_name.ilike.${like},last_name.ilike.${like},specialisation.ilike.${like}`)
            .limit(5),
        ])
        setHits([
          ...(patients ?? []).map((p) => ({
            label: `${p.first_name} ${p.last_name}`,
            href: `/patients/${p.id}`,
          })),
          ...(doctors ?? []).map((d) => ({
            label: `Dr. ${d.first_name} ${d.last_name} · ${d.specialisation}`,
            href: `/doctors/${d.id}`,
          })),
        ])
      })()
    }, 150)
    return () => window.clearTimeout(handle)
  }, [open, query])

  const now = new Date()
  const alerts = useMemo(
    () =>
      appointments.filter((a) => {
        const start = new Date(a.starts_at)
        return (
          a.status === 'cancelled' ||
          (isAfter(start, now) && isBefore(start, addDays(now, 7)))
        )
      }).slice(0, 6),
    [appointments, now],
  )
  const notes = useMemo(
    () => appointments.filter((a) => a.notes).slice(0, 6),
    [appointments],
  )

  const toggle = (id: MenuId) => setOpen((cur) => (cur === id ? null : id))

  return (
    <div ref={rootRef} className="relative ml-auto flex shrink-0 items-center gap-1.5">
      <div className="relative">
        <button
          type="button"
          className="hidden h-10 cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-3.5 text-sm text-foreground sm:inline-flex"
          aria-expanded={open === 'date'}
          aria-label="Clinic date"
          onClick={() => toggle('date')}
        >
          <CalendarBlank size={18} weight="regular" className="text-muted" aria-hidden />
          {format(now, 'MM/dd/yyyy')}
        </button>
        <Popover open={open === 'date'}>
          <p className="text-sm font-medium text-foreground">{format(now, 'EEEE, d MMMM yyyy')}</p>
          <p className="mt-1 text-xs text-muted">Trustcare Clinic · Bellville</p>
          <p className="mt-2 text-xs text-muted">Consulting hours 08:00 - 17:00</p>
        </Popover>
      </div>

      <div className="relative">
        <button
          type="button"
          className={iconBtn}
          aria-label="Search"
          aria-expanded={open === 'search'}
          onClick={() => toggle('search')}
        >
          <MagnifyingGlass size={20} weight="regular" />
        </button>
        <Popover open={open === 'search'}>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients or doctors"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Search patients or doctors"
          />
          <ul className="mt-2 max-h-56 overflow-y-auto overscroll-contain">
            {query.trim().length >= 2 && hits.length === 0 && (
              <li className="px-2 py-2 text-sm text-muted">No matches.</li>
            )}
            {hits.map((h) => (
              <li key={h.href}>
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm hover:bg-surface-muted"
                  onClick={() => {
                    setOpen(null)
                    navigate(h.href)
                  }}
                >
                  {h.label}
                </button>
              </li>
            ))}
          </ul>
        </Popover>
      </div>

      <div className="relative">
        <button
          type="button"
          className={cn(iconBtn, 'relative')}
          aria-label="Notifications"
          aria-expanded={open === 'alerts'}
          onClick={() => toggle('alerts')}
        >
          <Bell size={20} weight="regular" />
          {alerts.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" aria-hidden />
          )}
        </button>
        <Popover open={open === 'alerts'}>
          <p className="px-1 pb-2 text-sm font-medium text-foreground">Notifications</p>
          {alerts.length === 0 && <p className="px-1 text-sm text-muted">No new clinic alerts.</p>}
          <ul className="max-h-64 overflow-y-auto overscroll-contain">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-md px-1 py-2 hover:bg-surface-muted">
                <p className="text-sm text-foreground">
                  {a.status === 'cancelled' ? 'Cancelled' : 'Upcoming'} ·{' '}
                  {a.patients
                    ? `${a.patients.first_name} ${a.patients.last_name}`
                    : 'Visit'}
                </p>
                <p className="text-xs text-muted">{format(new Date(a.starts_at), 'dd MMM · HH:mm')}</p>
              </li>
            ))}
          </ul>
        </Popover>
      </div>

      <div className="relative">
        <button
          type="button"
          className={iconBtn}
          aria-label="Messages"
          aria-expanded={open === 'mail'}
          onClick={() => toggle('mail')}
        >
          <EnvelopeSimple size={20} weight="regular" />
        </button>
        <Popover open={open === 'mail'}>
          <p className="px-1 pb-2 text-sm font-medium text-foreground">Clinic notes</p>
          {notes.length === 0 && <p className="px-1 text-sm text-muted">No messages yet.</p>}
          <ul className="max-h-64 overflow-y-auto overscroll-contain">
            {notes.map((a) => (
              <li key={a.id} className="rounded-md px-1 py-2 hover:bg-surface-muted">
                <p className="text-sm text-foreground">{a.notes}</p>
                <p className="text-xs text-muted">
                  {a.doctors
                    ? `Dr. ${a.doctors.first_name} ${a.doctors.last_name}`
                    : 'Clinic'}{' '}
                  · {format(new Date(a.starts_at), 'dd MMM yyyy')}
                </p>
              </li>
            ))}
          </ul>
        </Popover>
      </div>

      <div className="relative">
        <button
          type="button"
          className="cursor-pointer rounded-full"
          aria-label="Account"
          aria-expanded={open === 'profile'}
          onClick={() => toggle('profile')}
        >
          <Avatar
            firstName={nameParts[0]}
            lastName={nameParts[1]}
            fullName={profile?.full_name}
            email={profile?.email}
            size="md"
          />
        </button>
        <Popover open={open === 'profile'}>
          <div className="flex items-center gap-3 px-1 pb-3">
            <Avatar
              firstName={nameParts[0]}
              lastName={nameParts[1]}
              fullName={profile?.full_name}
              email={profile?.email}
              size="lg"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{profile?.full_name}</p>
              <p className="truncate text-xs capitalize text-muted">{profile?.role?.replace('_', ' ')}</p>
              <p className="truncate text-xs text-muted">{profile?.email}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => void signOut()}
          >
            <SignOut size={16} weight="regular" />
            Sign out
          </Button>
        </Popover>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={() => void signOut()}
        aria-label="Sign out"
      >
        <SignOut size={20} weight="regular" />
      </Button>
    </div>
  )
}
