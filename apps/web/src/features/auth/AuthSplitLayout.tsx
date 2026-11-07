import type { ReactNode } from 'react'
import oilBubbles from '@/assets/oil-bubbles-against-abstract-background.jpg'
import { BrandMark } from '@/components/layout/BrandMark'

type AuthSplitLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthSplitLayout({ title, subtitle, children }: AuthSplitLayoutProps) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-12">
      <img
        src={oilBubbles}
        alt=""
        className="auth-bg-motion pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="animate-enter-up relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2.5 text-white">
          <BrandMark inverted />
          <p className="text-base font-medium">Kindred</p>
        </div>
        <h1 className="text-3xl font-medium leading-tight text-white">{title}</h1>
        <p className="mt-2 mb-8 max-w-md text-sm leading-relaxed text-white/90">{subtitle}</p>
        {children}
        <p className="mt-8 text-xs text-white/75">© {new Date().getFullYear()} Kindred</p>
      </div>
    </div>
  )
}
