export function personInitials(first?: string | null, last?: string | null) {
  const a = (first?.trim()?.[0] ?? '').toUpperCase()
  const b = (last?.trim()?.[0] ?? '').toUpperCase()
  return (a + b) || '?'
}

export function personHue(first?: string | null, last?: string | null) {
  const seed = `${first ?? ''}${last ?? ''}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}
