-- Part 3/5 - appointments (mix of statuses and dates around today)

insert into public.appointments (
  patient_id,
  doctor_id,
  starts_at,
  ends_at,
  status,
  notes
)
select
  p.id,
  d.id,
  slot.starts_at,
  slot.ends_at,
  slot.status::public.appointment_status,
  slot.notes
from (
  values
    (
      'thabo.molefe@kindred.demo',
      'johan.vanwyk@kindred.demo',
      (date_trunc('day', now()) + interval '1 day' + time '09:00')::timestamptz,
      (date_trunc('day', now()) + interval '1 day' + time '09:30')::timestamptz,
      'confirmed',
      'BP check and ECG'
    ),
    (
      'zanele.nkosi@kindred.demo',
      'sarah.williams@kindred.demo',
      (date_trunc('day', now()) + interval '1 day' + time '10:30')::timestamptz,
      (date_trunc('day', now()) + interval '1 day' + time '11:00')::timestamptz,
      'scheduled',
      '28-week antenatal visit'
    ),
    (
      'michael.oconnor@kindred.demo',
      'nomsa.dlamini@kindred.demo',
      (date_trunc('day', now()) + interval '2 days' + time '11:00')::timestamptz,
      (date_trunc('day', now()) + interval '2 days' + time '11:30')::timestamptz,
      'pending',
      'HbA1c review'
    ),
    (
      'aisha.patel@kindred.demo',
      'priya.naidoo@kindred.demo',
      (date_trunc('day', now()) + time '14:00')::timestamptz,
      (date_trunc('day', now()) + time '14:30')::timestamptz,
      'checked_in',
      'Asthma control visit'
    ),
    (
      'pieter.deklerk@kindred.demo',
      'david.mokoena@kindred.demo',
      (date_trunc('day', now()) - interval '1 day' + time '15:00')::timestamptz,
      (date_trunc('day', now()) - interval '1 day' + time '15:45')::timestamptz,
      'checked_out',
      'Post-op follow-up'
    ),
    (
      'nadine.jacobs@kindred.demo',
      'chris.botha@kindred.demo',
      (date_trunc('day', now()) + interval '3 days' + time '16:00')::timestamptz,
      (date_trunc('day', now()) + interval '3 days' + time '17:00')::timestamptz,
      'scheduled',
      'CBT progress review'
    ),
    (
      'sipho.ngwenya@kindred.demo',
      'priya.naidoo@kindred.demo',
      (date_trunc('day', now()) + interval '4 days' + time '09:30')::timestamptz,
      (date_trunc('day', now()) + interval '4 days' + time '10:00')::timestamptz,
      'confirmed',
      'Growth chart + vaccines'
    ),
    (
      'emma.brown@kindred.demo',
      'lerato.khumalo@kindred.demo',
      (date_trunc('day', now()) + interval '2 days' + time '13:00')::timestamptz,
      (date_trunc('day', now()) + interval '2 days' + time '13:20')::timestamptz,
      'scheduled',
      'Eczema flare'
    ),
    (
      'willem.venter@kindred.demo',
      'johan.vanwyk@kindred.demo',
      (date_trunc('day', now()) - interval '3 days' + time '10:00')::timestamptz,
      (date_trunc('day', now()) - interval '3 days' + time '10:45')::timestamptz,
      'checked_out',
      'Cardiology follow-up'
    ),
    (
      'lungile.zulu@kindred.demo',
      'nomsa.dlamini@kindred.demo',
      (date_trunc('day', now()) + interval '5 days' + time '08:30')::timestamptz,
      (date_trunc('day', now()) + interval '5 days' + time '09:00')::timestamptz,
      'pending',
      'Repeat FBC'
    ),
    (
      'james.mitchell@kindred.demo',
      'david.mokoena@kindred.demo',
      (date_trunc('day', now()) + interval '6 days' + time '11:30')::timestamptz,
      (date_trunc('day', now()) + interval '6 days' + time '12:15')::timestamptz,
      'confirmed',
      'Pre-op assessment'
    ),
    (
      'fatima.saidi@kindred.demo',
      'chris.botha@kindred.demo',
      (date_trunc('day', now()) - interval '2 days' + time '12:00')::timestamptz,
      (date_trunc('day', now()) - interval '2 days' + time '12:45')::timestamptz,
      'cancelled',
      'Patient rescheduled - school exam'
    ),
    (
      'thabo.molefe@kindred.demo',
      'nomsa.dlamini@kindred.demo',
      (date_trunc('day', now()) + interval '7 days' + time '09:00')::timestamptz,
      (date_trunc('day', now()) + interval '7 days' + time '09:30')::timestamptz,
      'scheduled',
      'Med review'
    ),
    (
      'michael.oconnor@kindred.demo',
      'johan.vanwyk@kindred.demo',
      (date_trunc('day', now()) + interval '8 days' + time '14:30')::timestamptz,
      (date_trunc('day', now()) + interval '8 days' + time '15:00')::timestamptz,
      'scheduled',
      'Cardio risk discussion'
    ),
    (
      'aisha.patel@kindred.demo',
      'ahmed.hassan@kindred.demo',
      (date_trunc('day', now()) - interval '5 days' + time '20:15')::timestamptz,
      (date_trunc('day', now()) - interval '5 days' + time '21:00')::timestamptz,
      'checked_out',
      'After-hours wheeze - nebuliser given'
    )
) as slot(patient_email, doctor_email, starts_at, ends_at, status, notes)
join public.patients p on lower(p.email) = lower(slot.patient_email)
join public.doctors d on lower(d.email) = lower(slot.doctor_email);

-- Link YOUR signed-up patient to a couple of appointments (if they exist in patients table)
insert into public.appointments (patient_id, doctor_id, starts_at, ends_at, status, notes)
select
  p.id,
  d.id,
  (date_trunc('day', now()) + interval '3 days' + time '10:00')::timestamptz,
  (date_trunc('day', now()) + interval '3 days' + time '10:30')::timestamptz,
  'scheduled'::public.appointment_status,
  'Welcome visit - portal booking'
from public.patients p
join public.doctors d on d.email = 'nomsa.dlamini@kindred.demo'
where p.profile_id is not null
  and (p.email is null or p.email not like '%@kindred.demo')
  and not exists (
    select 1
    from public.appointments a
    where a.patient_id = p.id
      and a.notes = 'Welcome visit - portal booking'
  );
