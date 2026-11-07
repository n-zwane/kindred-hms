-- Fix: grant table access to Supabase API roles (RLS alone is not enough)
-- Patient self-registration: secure roles + auto-create patient record

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;

grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant all on tables to service_role;

-- Staff roles may only be set via service-role / Admin API (app_metadata).
-- Public sign-up is always patient.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role := 'patient';
  app_role text;
  full_name text;
  first_name text;
  last_name text;
  new_patient_id uuid;
  dob text;
begin
  app_role := new.raw_app_meta_data ->> 'role';
  if app_role in ('patient', 'receptionist', 'doctor', 'admin', 'it_admin') then
    requested_role := app_role::public.user_role;
  else
    requested_role := 'patient';
  end if;

  full_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    trim(concat_ws(' ',
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'last_name'
    )),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  first_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    split_part(full_name, ' ', 1)
  );
  last_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''),
    nullif(trim(substring(full_name from length(first_name) + 2)), ''),
    'User'
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    full_name,
    requested_role
  );

  if requested_role = 'patient' then
    dob := new.raw_user_meta_data ->> 'date_of_birth';
    insert into public.patients (
      profile_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth
    )
    values (
      new.id,
      first_name,
      last_name,
      new.email,
      nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
      case when dob is not null and dob <> '' then dob::date else null end
    )
    returning id into new_patient_id;

    insert into public.patient_records (patient_id, summary, history)
    values (
      new_patient_id,
      'Patient portal account',
      'Register additional clinical history during visits.'
    );
  end if;

  return new;
end;
$$;

-- Patients may update their own demographic row after sign-up
create policy patients_update_self on public.patients
for update to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());
