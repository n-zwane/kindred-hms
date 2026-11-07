-- Part 1/5 - clinic, wards, doctors, schedules
-- Paste into Supabase SQL Editor and Run.

update public.clinic_settings
set
  name = 'Kindred Hospital',
  location = 'Bellville Medical Park, Cape Town'
where id = 1;

insert into public.wards (name, capacity, occupied)
values
  ('General Ward A', 24, 0),
  ('General Ward B', 18, 0),
  ('Maternity Ward', 12, 0),
  ('Paediatrics', 14, 0),
  ('ICU', 8, 0),
  ('Emergency Observation', 6, 0);

insert into public.doctors (
  first_name,
  last_name,
  specialisation,
  email,
  phone,
  bio
)
values
  (
    'Nomsa',
    'Dlamini',
    'General Medicine',
    'nomsa.dlamini@kindred.demo',
    '+27 21 555 1001',
    'Primary care and chronic disease management.'
  ),
  (
    'Johan',
    'Van Wyk',
    'Cardiology',
    'johan.vanwyk@kindred.demo',
    '+27 21 555 1002',
    'Interventional cardiology; ECG and stress testing.'
  ),
  (
    'Priya',
    'Naidoo',
    'Paediatrics',
    'priya.naidoo@kindred.demo',
    '+27 21 555 1003',
    'Child wellness, immunisations, and developmental checks.'
  ),
  (
    'David',
    'Mokoena',
    'Orthopaedic Surgery',
    'david.mokoena@kindred.demo',
    '+27 21 555 1004',
    'Fractures, joint pain, and post-operative rehab planning.'
  ),
  (
    'Sarah',
    'Williams',
    'Obstetrics & Gynaecology',
    'sarah.williams@kindred.demo',
    '+27 21 555 1005',
    'Antenatal care and women''s health.'
  ),
  (
    'Ahmed',
    'Hassan',
    'Emergency Medicine',
    'ahmed.hassan@kindred.demo',
    '+27 21 555 1006',
    'Triage, acute assessment, and stabilisation.'
  ),
  (
    'Lerato',
    'Khumalo',
    'Dermatology',
    'lerato.khumalo@kindred.demo',
    '+27 21 555 1007',
    'Skin conditions, allergies, and minor procedures.'
  ),
  (
    'Chris',
    'Botha',
    'Psychiatry',
    'chris.botha@kindred.demo',
    '+27 21 555 1008',
    'Mental health consultations and care plans.'
  );

-- Schedules: day_of_week 1 = Monday … 5 = Friday (0 = Sunday)
insert into public.doctor_schedules (doctor_id, day_of_week, start_time, end_time)
select d.id, dow, t.start_t, t.end_t
from public.doctors d
cross join (
  values
    (1, time '08:00', time '16:00'),
    (2, time '08:00', time '16:00'),
    (3, time '08:00', time '16:00'),
    (4, time '08:00', time '16:00'),
    (5, time '08:00', time '13:00')
) as t(dow, start_t, end_t)
where d.email like '%@kindred.demo'
  and d.specialisation not in ('Emergency Medicine', 'Psychiatry');

insert into public.doctor_schedules (doctor_id, day_of_week, start_time, end_time)
select d.id, dow, t.start_t, t.end_t
from public.doctors d
cross join (
  values
    (1, time '07:00', time '19:00'),
    (2, time '07:00', time '19:00'),
    (3, time '07:00', time '19:00'),
    (4, time '07:00', time '19:00'),
    (5, time '07:00', time '19:00'),
    (6, time '09:00', time '14:00'),
    (0, time '09:00', time '14:00')
) as t(dow, start_t, end_t)
where d.email = 'ahmed.hassan@kindred.demo';

insert into public.doctor_schedules (doctor_id, day_of_week, start_time, end_time)
select d.id, dow, t.start_t, t.end_t
from public.doctors d
cross join (
  values
    (2, time '10:00', time '18:00'),
    (4, time '10:00', time '18:00')
) as t(dow, start_t, end_t)
where d.email = 'chris.botha@kindred.demo';
