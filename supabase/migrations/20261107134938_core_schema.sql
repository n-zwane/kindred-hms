-- HMS core schema, RLS, and helpers

create type public.user_role as enum (
  'patient',
  'receptionist',
  'doctor',
  'admin',
  'it_admin'
);

create type public.appointment_status as enum (
  'pending',
  'scheduled',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled'
);

create table public.clinic_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Trustcare Clinic',
  location text not null default 'Bellville'
);

insert into public.clinic_settings default values;

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  blood_group text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index patients_email_unique on public.patients (lower(email))
where email is not null;

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  specialisation text not null,
  email text not null,
  phone text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (start_time < end_time)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create index appointments_doctor_starts_idx on public.appointments (doctor_id, starts_at);

create table public.patient_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null unique references public.patients (id) on delete cascade,
  summary text,
  history text,
  updated_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  medication text not null,
  dosage text not null,
  instructions text,
  prescribed_at timestamptz not null default now()
);

create table public.wards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null check (capacity > 0),
  occupied int not null default 0 check (occupied >= 0),
  check (occupied <= capacity)
);

create table public.ward_allocations (
  id uuid primary key default gen_random_uuid(),
  ward_id uuid not null references public.wards (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete cascade,
  status text not null default 'active',
  allocated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Auth profile bootstrap
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  begin
    requested_role :=
      coalesce(
        (new.raw_user_meta_data ->> 'role')::public.user_role,
        'patient'::public.user_role
      );
  exception
    when invalid_text_representation then
      requested_role := 'patient';
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    requested_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_user_role() in (
      'receptionist',
      'doctor',
      'admin',
      'it_admin'
    ),
    false
  );
$$;

create or replace function public.patient_owned_by_user(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.patients p
    where p.id = p_id and p.profile_id = auth.uid()
  );
$$;

create or replace function public.doctor_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.id
  from public.doctors d
  where d.profile_id = auth.uid()
  limit 1;
$$;

create or replace function public.ward_capacity_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int;
  occ int;
begin
  select capacity, occupied into cap, occ
  from public.wards
  where id = new.ward_id
  for update;

  if occ >= cap then
    raise exception 'Ward at capacity';
  end if;

  update public.wards set occupied = occupied + 1 where id = new.ward_id;
  return new;
end;
$$;

create trigger ward_allocation_capacity
before insert on public.ward_allocations
for each row
execute function public.ward_capacity_guard();

-- RLS
alter table public.clinic_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_schedules enable row level security;
alter table public.appointments enable row level security;
alter table public.patient_records enable row level security;
alter table public.prescriptions enable row level security;
alter table public.wards enable row level security;
alter table public.ward_allocations enable row level security;
alter table public.audit_logs enable row level security;

-- clinic_settings: authenticated read
create policy clinic_settings_read on public.clinic_settings
for select to authenticated
using (true);

-- profiles
create policy profiles_select_own on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or public.current_user_role() = 'it_admin'
  or public.current_user_role() = 'admin'
);

create policy profiles_select_staff on public.profiles
for select to authenticated
using (public.is_staff());

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy profiles_it_update on public.profiles
for update to authenticated
using (public.current_user_role() = 'it_admin')
with check (public.current_user_role() = 'it_admin');

-- patients
create policy patients_patient_select on public.patients
for select to authenticated
using (profile_id = auth.uid());

create policy patients_receptionist_admin_write on public.patients
for all to authenticated
using (public.current_user_role() in ('receptionist', 'admin'))
with check (public.current_user_role() in ('receptionist', 'admin'));

create policy patients_it_read on public.patients
for select to authenticated
using (public.current_user_role() = 'it_admin');

create policy patients_doctor_select on public.patients
for select to authenticated
using (
  public.current_user_role() = 'doctor'
  and exists (
    select 1
    from public.appointments a
    where a.patient_id = patients.id
      and a.doctor_id = public.doctor_profile_id()
  )
);

-- doctors
create policy doctors_read_authenticated on public.doctors
for select to authenticated
using (true);

create policy doctors_write_staff on public.doctors
for all to authenticated
using (public.current_user_role() in ('receptionist', 'admin', 'it_admin'))
with check (public.current_user_role() in ('receptionist', 'admin', 'it_admin'));

-- doctor_schedules
create policy doctor_schedules_read on public.doctor_schedules
for select to authenticated
using (true);

create policy doctor_schedules_write on public.doctor_schedules
for all to authenticated
using (public.current_user_role() in ('receptionist', 'admin', 'doctor'))
with check (public.current_user_role() in ('receptionist', 'admin', 'doctor'));

-- appointments
create policy appointments_patient_select on public.appointments
for select to authenticated
using (public.patient_owned_by_user(patient_id));

create policy appointments_patient_insert on public.appointments
for insert to authenticated
with check (
  public.current_user_role() = 'patient'
  and public.patient_owned_by_user(patient_id)
);

create policy appointments_staff on public.appointments
for all to authenticated
using (
  public.current_user_role() in ('receptionist', 'admin', 'doctor')
)
with check (
  public.current_user_role() in ('receptionist', 'admin', 'doctor')
);

-- patient_records
create policy records_patient_select on public.patient_records
for select to authenticated
using (public.patient_owned_by_user(patient_id));

create policy records_doctor on public.patient_records
for all to authenticated
using (
  public.current_user_role() = 'doctor'
  and exists (
    select 1
    from public.appointments a
    where a.patient_id = patient_records.patient_id
      and a.doctor_id = public.doctor_profile_id()
  )
)
with check (
  public.current_user_role() = 'doctor'
);

create policy records_staff_read on public.patient_records
for select to authenticated
using (public.current_user_role() in ('receptionist', 'admin', 'it_admin'));

-- prescriptions
create policy rx_patient_select on public.prescriptions
for select to authenticated
using (public.patient_owned_by_user(patient_id));

create policy rx_doctor on public.prescriptions
for all to authenticated
using (
  public.current_user_role() = 'doctor'
  and doctor_id = public.doctor_profile_id()
)
with check (
  public.current_user_role() = 'doctor'
  and doctor_id = public.doctor_profile_id()
);

-- wards
create policy wards_read on public.wards
for select to authenticated
using (public.current_user_role() in ('admin', 'receptionist', 'doctor', 'it_admin'));

create policy wards_admin on public.wards
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- ward_allocations
create policy ward_alloc_read on public.ward_allocations
for select to authenticated
using (public.current_user_role() in ('admin', 'receptionist', 'doctor', 'it_admin'));

create policy ward_alloc_admin on public.ward_allocations
for insert to authenticated
with check (public.current_user_role() = 'admin');

-- audit_logs
create policy audit_it_read on public.audit_logs
for select to authenticated
using (public.current_user_role() = 'it_admin');

create policy audit_insert on public.audit_logs
for insert to authenticated
with check (actor_id = auth.uid() or actor_id is null);
