/**
 * Creates hosted demo Auth users (staff + optional patient).
 * Requires service role key - never put this in the web app or commit it.
 *
 * PowerShell:
 *   $env:SUPABASE_URL = "https://qgdxxvcgvftcigsacxap.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "<Dashboard → Project Settings → API → service_role secret>"
 *   node scripts/seed-demo-auth-users.mjs
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}

if (serviceKey.includes('supabase.co/') || serviceKey.startsWith('http')) {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY must be the secret API key string, not a URL.\n' +
      'Dashboard → Project Settings → API → Project API keys → service_role → Reveal\n' +
      '(long JWT starting with eyJ... - never use the publishable key or /rest/v1 URL)',
  )
  process.exit(1)
}

if (serviceKey.startsWith('sb_publishable_')) {
  console.error(
    'You used the publishable (anon) key. Use service_role secret from the same API page.',
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'Password123!'

const users = [
  {
    email: 'patient@kindred.demo',
    app_metadata: { role: 'patient' },
    user_metadata: { full_name: 'Ayanda Petersen', first_name: 'Ayanda', last_name: 'Petersen' },
  },
  {
    email: 'receptionist@kindred.demo',
    app_metadata: { role: 'receptionist' },
    user_metadata: { full_name: 'Lindiwe Maseko' },
  },
  {
    email: 'doctor@kindred.demo',
    app_metadata: { role: 'doctor' },
    user_metadata: { full_name: 'Dr Johan van Wyk' },
  },
  {
    email: 'admin@kindred.demo',
    app_metadata: { role: 'admin' },
    user_metadata: { full_name: 'Sam Khumalo' },
  },
  {
    email: 'it@kindred.demo',
    app_metadata: { role: 'it_admin' },
    user_metadata: { full_name: 'Thandiwe Jacobs' },
  },
]

async function upsertUser({ email, app_metadata, user_metadata }) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) throw listError

  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      app_metadata,
      user_metadata,
    })
    if (error) throw error
    console.log(`Updated  ${email}`)
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata,
    user_metadata,
  })
  if (error) throw error
  console.log(`Created ${email}`)
  return data.user.id
}

async function syncProfileRow(userId, email, app_metadata, user_metadata) {
  const role = app_metadata?.role
  if (!role) return

  const full_name =
    user_metadata?.full_name ??
    [user_metadata?.first_name, user_metadata?.last_name].filter(Boolean).join(' ') ||
    email

  const { error } = await admin
    .from('profiles')
    .update({ role, full_name, email })
    .eq('id', userId)

  if (error) {
    console.warn(`Profile sync ${email}:`, error.message)
  }
}

async function linkDoctorProfile() {
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', 'doctor@kindred.demo')
    .maybeSingle()

  if (!profile?.id) return

  const { error: updErr } = await admin
    .from('doctors')
    .update({ profile_id: profile.id })
    .eq('email', 'johan.vanwyk@kindred.demo')

  if (updErr) console.warn('Doctor link:', updErr.message)
  else console.log('Linked doctor@kindred.demo → johan.vanwyk@kindred.demo')
}

for (const u of users) {
  const userId = await upsertUser(u)
  await syncProfileRow(userId, u.email, u.app_metadata, u.user_metadata)
}

await linkDoctorProfile()

console.log(`\nDone. All demo passwords: ${DEMO_PASSWORD}`)
console.log('Sign in at http://localhost:5173/login')
