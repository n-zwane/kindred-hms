-- Part 6 - year-plus of clinic activity + proper demo names.
-- Idempotent. Safe to re-run.

-- Logged-in patient should greet as Ayanda, not Demo
update public.profiles
set
  full_name = 'Ayanda Petersen',
  updated_at = now()
where
  lower(email) = 'patient@kindred.demo'
  or full_name ilike 'demo%'
  or full_name ilike 'demo patient';

update public.profiles set full_name = 'Sam Khumalo', updated_at = now()
where lower(email) = 'admin@kindred.demo' and full_name <> 'Sam Khumalo';

update public.profiles set full_name = 'Thandiwe Jacobs', updated_at = now()
where lower(email) = 'it@kindred.demo' and full_name <> 'Thandiwe Jacobs';

update public.profiles set full_name = 'Lindiwe Maseko', updated_at = now()
where lower(email) = 'receptionist@kindred.demo';

update public.profiles set full_name = 'Dr Johan van Wyk', updated_at = now()
where lower(email) = 'doctor@kindred.demo';

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
  'full_name', 'Ayanda Petersen',
  'first_name', 'Ayanda',
  'last_name', 'Petersen'
)
where lower(email) = 'patient@kindred.demo'
   or coalesce(raw_user_meta_data ->> 'full_name', '') ilike 'demo%';

update public.patients
set
  first_name = 'Ayanda',
  last_name = 'Petersen',
  email = coalesce(email, 'patient@kindred.demo'),
  phone = coalesce(phone, '+27 82 400 1101'),
  date_of_birth = coalesce(date_of_birth, '1994-03-21'),
  gender = coalesce(gender, 'Female'),
  blood_group = coalesce(blood_group, 'O+'),
  address = coalesce(address, '18 Hofmeyr Street, Bellville'),
  updated_at = now()
where
  first_name ilike 'demo'
  or lower(email) = 'patient@kindred.demo'
  or profile_id in (
    select id from public.profiles where full_name = 'Ayanda Petersen'
  );

-- Clinic has been open since early 2025
update public.patients
set created_at = timestamp '2025-02-08' + (random() * interval '50 days')
where email like '%@kindred.demo' and created_at > timestamp '2025-08-01';

insert into public.patient_records (patient_id, summary, history)
select
  p.id,
  'Registered Kindred portal patient; annual wellness and GP follow-up.',
  '2025-03: New patient intake at Trustcare Clinic. 2025-07: Seasonal flu vaccine. 2026-01: Wellness bloods normal. 2026-06: BP 118/76. No chronic medication.'
from public.patients p
where lower(p.email) = 'patient@kindred.demo'
  and not exists (select 1 from public.patient_records r where r.patient_id = p.id);

-- Historical visits: each demo patient every ~6 weeks for 14 months
insert into public.appointments (
  patient_id, doctor_id, starts_at, ends_at, status, notes, created_at
)
select
  p.id,
  d.id,
  slot.at,
  slot.at + interval '30 minutes',
  case
    when slot.at < now() - interval '2 days' then 'checked_out'::public.appointment_status
    when slot.at < now() then 'checked_in'::public.appointment_status
    else 'scheduled'::public.appointment_status
  end,
  'Cycle visit - ' || to_char(slot.at, 'Mon YYYY'),
  slot.at - interval '5 days'
from public.patients p
join lateral (
  select id
  from public.doctors
  order by abs(hashtext(p.email) - hashtext(email))
  limit 1
) d on true
cross join lateral (
  select generate_series(
    date_trunc('day', now()) - interval '14 months' + time '09:00',
    date_trunc('day', now()) - interval '12 days' + time '09:00',
    interval '42 days'
  ) + ((ascii(left(coalesce(p.email, 'p'), 1)) % 5) * interval '1 hour') as at
) slot
where p.email like '%@kindred.demo'
  and not exists (
    select 1
    from public.appointments a
    where a.patient_id = p.id
      and a.notes = 'Cycle visit - ' || to_char(slot.at, 'Mon YYYY')
  );

-- Extra future + recent mix for the portal patient
insert into public.appointments (patient_id, doctor_id, starts_at, ends_at, status, notes)
select
  p.id,
  d.id,
  v.starts_at,
  v.ends_at,
  v.status::public.appointment_status,
  v.notes
from public.patients p
join public.doctors d on d.email = 'nomsa.dlamini@kindred.demo'
cross join (
  values
    (
      date_trunc('day', now()) + interval '5 days' + time '10:00',
      date_trunc('day', now()) + interval '5 days' + time '10:30',
      'confirmed',
      'Ayanda - annual wellness'
    ),
    (
      date_trunc('day', now()) - interval '40 days' + time '11:00',
      date_trunc('day', now()) - interval '40 days' + time '11:30',
      'checked_out',
      'Ayanda - flu follow-up'
    )
) as v(starts_at, ends_at, status, notes)
where lower(p.email) = 'patient@kindred.demo'
  and not exists (
    select 1 from public.appointments a where a.patient_id = p.id and a.notes = v.notes
  );

insert into public.prescriptions (
  patient_id, doctor_id, medication, dosage, instructions, prescribed_at
)
select
  p.id,
  d.id,
  rx.medication,
  rx.dosage,
  rx.instructions,
  rx.at
from public.patients p
join public.doctors d on d.email = 'nomsa.dlamini@kindred.demo'
cross join (
  values
    ('Vitamin D3', '1000 IU', 'One capsule daily with breakfast.', now() - interval '11 months'),
    ('Cetirizine', '10 mg', 'One tablet at night during hay-fever season.', now() - interval '6 months'),
    ('Paracetamol', '500 mg', 'One to two tablets as needed for headache.', now() - interval '70 days')
) as rx(medication, dosage, instructions, at)
where lower(p.email) = 'patient@kindred.demo'
  and not exists (
    select 1
    from public.prescriptions x
    where x.patient_id = p.id and x.medication = rx.medication and x.prescribed_at = rx.at
  );

insert into public.audit_logs (actor_id, action, entity_type, metadata, created_at)
select
  null,
  ev.action,
  'clinic',
  jsonb_build_object('source', 'seed-hosted/08', 'month', to_char(ev.at, 'YYYY-MM')),
  ev.at
from generate_series(
  date_trunc('month', now()) - interval '13 months',
  date_trunc('month', now()),
  interval '1 month'
) as ev(at)
cross join (
  values
    ('clinic.month.close'),
    ('appointments.batch.reconciled')
) as a(action)
where not exists (
  select 1
  from public.audit_logs l
  where l.action = a.action
    and l.created_at = ev.at
);
