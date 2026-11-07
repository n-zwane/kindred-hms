import { describe, expect, it } from 'vitest'
import { format } from 'date-fns'

describe('date-fns format strings', () => {
  it('throws if English words are left unescaped in the format pattern', () => {
    expect(() => format(new Date('2026-11-07T12:00:00'), 'd MMM · Today')).toThrow(
      /unescaped latin alphabet character/i,
    )
  })

  it('keeps Today as literal text next to a formatted date', () => {
    expect(`${format(new Date('2026-11-07T12:00:00'), 'd MMM')} · Today`).toBe(
      '7 Nov · Today',
    )
  })
})
