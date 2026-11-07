-- Optional: run FIRST if you already pasted an older demo seed and want a clean re-run.
-- Does NOT delete auth users or patients who signed up via /signup (only @kindred.demo rows).

delete from public.ward_allocations
where patient_id in (
  select id from public.patients where lower(email) like '%@kindred.demo'
);

delete from public.prescriptions
where patient_id in (
  select id from public.patients where lower(email) like '%@kindred.demo'
);

delete from public.appointments
where patient_id in (
  select id from public.patients where lower(email) like '%@kindred.demo'
);

delete from public.patient_records
where patient_id in (
  select id from public.patients where lower(email) like '%@kindred.demo'
);

delete from public.patients where lower(email) like '%@kindred.demo';

delete from public.doctor_schedules
where doctor_id in (
  select id from public.doctors where lower(email) like '%@kindred.demo'
);

delete from public.doctors where lower(email) like '%@kindred.demo';

delete from public.audit_logs where action like 'demo.%';

update public.wards
set occupied = 0
where name in (
  'General Ward A',
  'General Ward B',
  'Maternity Ward',
  'Paediatrics',
  'ICU',
  'Emergency Observation'
);

delete from public.wards
where name in (
  'General Ward A',
  'General Ward B',
  'Maternity Ward',
  'Paediatrics',
  'ICU',
  'Emergency Observation'
);
