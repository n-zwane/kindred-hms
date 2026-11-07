/**
 * Signs in as demo staff and writes a year of clinic activity.
 * Uses apps/web/.env (anon key) + Password123!
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve('apps/web/.env')
const envText = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY
const password = process.env.DEMO_USER_PASSWORD ?? 'Password123!'

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in apps/web/.env')
  process.exit(1)
}

function client() {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function signIn(email) {
  const sb = client()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`${email}: ${error.message}`)
  return { sb, user: data.user }
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function isoAt(date, hours) {
  const x = new Date(date)
  x.setHours(hours, 0, 0, 0)
  return x.toISOString()
}

const { sb: it } = await signIn('it@kindred.demo')
for (const [email, full_name] of [
  ['patient@kindred.demo', 'Ayanda Petersen'],
  ['admin@kindred.demo', 'Sam Khumalo'],
  ['it@kindred.demo', 'Thandiwe Jacobs'],
  ['receptionist@kindred.demo', 'Lindiwe Maseko'],
  ['doctor@kindred.demo', 'Dr Johan van Wyk'],
]) {
  const { error } = await it.from('profiles').update({ full_name }).eq('email', email)
  if (error) console.warn('profile', email, error.message)
  else console.log('Named', email, '→', full_name)
}

const { error: demoProfilesErr } = await it
  .from('profiles')
  .update({ full_name: 'Ayanda Petersen' })
  .ilike('full_name', 'demo%')
if (demoProfilesErr) console.warn('demo profiles', demoProfilesErr.message)

await it.auth.signOut()

const { sb: rec } = await signIn('receptionist@kindred.demo')

const { data: patients, error: pErr } = await rec.from('patients').select('id, email, first_name, last_name')
if (pErr) throw pErr
const { data: doctors, error: dErr } = await rec.from('doctors').select('id, email')
if (dErr) throw dErr

for (const p of patients ?? []) {
  if (p.first_name?.toLowerCase() === 'demo' || p.email?.toLowerCase() === 'patient@kindred.demo') {
    const { error } = await rec
      .from('patients')
      .update({
        first_name: 'Ayanda',
        last_name: 'Petersen',
        email: p.email || 'patient@kindred.demo',
        phone: '+27 82 400 1101',
        date_of_birth: '1994-03-21',
        gender: 'Female',
        blood_group: 'O+',
        address: '18 Hofmeyr Street, Bellville',
      })
      .eq('id', p.id)
    if (error) console.warn('rename patient', error.message)
    else console.log('Renamed patient row', p.id)
  }
}

const { data: patients2 } = await rec.from('patients').select('id, email, first_name')
const docs = doctors ?? []

let inserted = 0
for (const p of patients2 ?? []) {
  if (!p.email?.includes('@kindred.demo') && p.first_name !== 'Ayanda') continue
  const doc = docs[Math.abs(hash(p.email ?? p.id)) % Math.max(docs.length, 1)]
  if (!doc) continue
  for (let weeks = 2; weeks <= 62; weeks += 6) {
    const start = addDays(new Date(), -weeks * 7)
    start.setHours(9 + (hash(p.id) % 6), (hash(p.email ?? '') % 2) * 30, 0, 0)
    const end = new Date(start.getTime() + 30 * 60 * 1000)
    const note = `Cycle visit - ${start.toLocaleString('en-GB', { month: 'short', year: 'numeric' })}`
    const { data: existing } = await rec
      .from('appointments')
      .select('id')
      .eq('patient_id', p.id)
      .eq('notes', note)
      .maybeSingle()
    if (existing) continue
    const past = start.getTime() < Date.now() - 86400000
    const { error } = await rec.from('appointments').insert({
      patient_id: p.id,
      doctor_id: doc.id,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: past ? 'checked_out' : 'scheduled',
      notes: note,
    })
    if (error) console.warn('apt', error.message)
    else inserted++
  }
}

const ayanda = (patients2 ?? []).find(
  (p) => p.first_name === 'Ayanda' || p.email?.toLowerCase() === 'patient@kindred.demo',
)
const gp = docs.find((d) => d.email === 'nomsa.dlamini@kindred.demo') ?? docs[0]
if (ayanda && gp) {
  const extras = [
    {
      starts_at: isoAt(addDays(new Date(), 5), 10),
      ends_at: isoAt(addDays(new Date(), 5), 10.5),
      status: 'confirmed',
      notes: 'Ayanda - annual wellness',
    },
    {
      starts_at: isoAt(addDays(new Date(), -40), 11),
      ends_at: isoAt(addDays(new Date(), -40), 11.5),
      status: 'checked_out',
      notes: 'Ayanda - flu follow-up',
    },
  ]
  for (const e of extras) {
    const { data: existing } = await rec
      .from('appointments')
      .select('id')
      .eq('patient_id', ayanda.id)
      .eq('notes', e.notes)
      .maybeSingle()
    if (existing) continue
    const { error } = await rec.from('appointments').insert({
      patient_id: ayanda.id,
      doctor_id: gp.id,
      ...e,
      ends_at: new Date(new Date(e.starts_at).getTime() + 30 * 60 * 1000).toISOString(),
    })
    if (error) console.warn('ayanda apt', error.message)
  }
}

const { error: auditErr } = await rec.from('audit_logs').insert({
  actor_id: null,
  action: 'clinic.history.seeded',
  entity_type: 'clinic',
  metadata: { source: 'scripts/populate-livedata.mjs', appointments_added: inserted },
})
if (auditErr) console.warn('audit', auditErr.message)

console.log(`Inserted ${inserted} historical appointments`)
await rec.auth.signOut()

try {
  const { sb: patient } = await signIn('patient@kindred.demo')
  const { error } = await patient.from('profiles').update({ full_name: 'Ayanda Petersen' }).eq('email', 'patient@kindred.demo')
  if (error) console.warn('patient self-name', error.message)
  else console.log('Patient profile is Ayanda Petersen')
  await patient.auth.signOut()
} catch (e) {
  console.warn(e.message)
}

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}

console.log('Done.')
