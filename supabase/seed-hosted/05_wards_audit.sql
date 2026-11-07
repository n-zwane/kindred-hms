-- Part 5/5 - ward bed allocations + sample audit log rows
-- Ward trigger bumps `occupied` automatically on each allocation.

insert into public.ward_allocations (ward_id, patient_id, status, allocated_at)
select w.id, p.id, 'active', now() - interval '2 days'
from public.wards w
join public.patients p on p.email = 'pieter.deklerk@kindred.demo'
where w.name = 'General Ward A';

insert into public.ward_allocations (ward_id, patient_id, status, allocated_at)
select w.id, p.id, 'active', now() - interval '1 day'
from public.wards w
join public.patients p on p.email = 'willem.venter@kindred.demo'
where w.name = 'ICU';

insert into public.ward_allocations (ward_id, patient_id, status, allocated_at)
select w.id, p.id, 'active', now() - interval '12 hours'
from public.wards w
join public.patients p on p.email = 'zanele.nkosi@kindred.demo'
where w.name = 'Maternity Ward';

insert into public.ward_allocations (ward_id, patient_id, status, allocated_at)
select w.id, p.id, 'active', now() - interval '8 hours'
from public.wards w
join public.patients p on p.email = 'sipho.ngwenya@kindred.demo'
where w.name = 'Paediatrics';

insert into public.ward_allocations (ward_id, patient_id, status, allocated_at)
select w.id, p.id, 'active', now() - interval '4 hours'
from public.wards w
join public.patients p on p.email = 'nadine.jacobs@kindred.demo'
where w.name = 'Emergency Observation';

insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
values
  (
    null,
    'demo.seed.completed',
    'clinic',
    null,
    '{"source": "seed-hosted/05", "note": "Demo data loaded via SQL Editor"}'::jsonb
  ),
  (
    null,
    'demo.patient.created',
    'patient',
    (select id from public.patients where email = 'thabo.molefe@kindred.demo'),
    '{"method": "receptionist_intake"}'::jsonb
  ),
  (
    null,
    'demo.appointment.scheduled',
    'appointment',
    null,
    '{"count": 15, "module": "appointments"}'::jsonb
  );
