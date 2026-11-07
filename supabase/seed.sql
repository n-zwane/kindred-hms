-- Fictional reference data (run after `supabase db reset`)

insert into public.wards (name, capacity, occupied)
values
  ('General Ward A', 20, 0),
  ('General Ward B', 15, 0),
  ('ICU', 8, 0);

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
    'Mick',
    'Thompson',
    'Cardiologist',
    'mick.thompson@example.com',
    '+1 555 0101',
    'Experienced cardiologist.'
  ),
  (
    'John',
    'Smith',
    'Cardiology',
    'john.smith@example.com',
    '+1 555 0102',
    'Family and cardiac care.'
  );

insert into public.doctor_schedules (doctor_id, day_of_week, start_time, end_time)
select
  d.id,
  1,
  time '09:00',
  time '17:00'
from public.doctors d
where d.email = 'john.smith@example.com';

insert into public.patients (
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  gender,
  blood_group,
  address
)
values (
  'Alberto',
  'Ripley',
  'alberto.ripley@example.com',
  '+1 555 0201',
  '1990-01-25',
  'Male',
  'O+',
  '4150 Hiney Road, Bellville'
);

insert into public.patient_records (patient_id, summary, history)
select
  p.id,
  'Routine check-ups; no chronic conditions documented.',
  'Sample fictional history for development.'
from public.patients p
where p.email = 'alberto.ripley@example.com';
