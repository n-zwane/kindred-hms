import { describe, expect, it } from 'vitest'
import { navItemsForRole } from './navigation'

describe('navItemsForRole', () => {
  it('returns trimmed nav for patient', () => {
    const items = navItemsForRole('patient')
    expect(items.map((i) => i.href)).toEqual(['/', '/appointments'])
  })

  it('returns admin wards route', () => {
    const items = navItemsForRole('admin')
    expect(items.some((i) => i.href === '/wards')).toBe(true)
  })
})
