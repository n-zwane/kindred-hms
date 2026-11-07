import type { ReactNode } from 'react'

export function AuthFormPanel({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-xl border border-white/40 bg-white p-8 text-left shadow-border">
      {children}
    </div>
  )
}
