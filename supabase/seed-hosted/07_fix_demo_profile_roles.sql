-- Run in SQL Editor if staff logins show the correct name but role stays "patient".
-- The UI reads public.profiles.role, not Auth metadata alone.

-- 1) Prefer role from auth users' app_metadata (when set correctly)
update public.profiles p
set
  role = (u.raw_app_meta_data ->> 'role')::public.user_role,
  full_name = coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    p.full_name
  ),
  updated_at = now()
from auth.users u
where p.id = u.id
  and u.raw_app_meta_data ->> 'role' in (
    'patient',
    'receptionist',
    'doctor',
    'admin',
    'it_admin'
  )
  and p.role::text is distinct from (u.raw_app_meta_data ->> 'role');

-- 2) Hard-fix demo @kindred.demo accounts (if app_metadata was put in wrong field)
update public.profiles as p
set role = v.role::public.user_role, updated_at = now()
from (
  values
    ('it@kindred.demo', 'it_admin'),
    ('admin@kindred.demo', 'admin'),
    ('doctor@kindred.demo', 'doctor'),
    ('receptionist@kindred.demo', 'receptionist'),
    ('patient@kindred.demo', 'patient')
) as v(email, role)
where lower(p.email) = lower(v.email)
  and p.role::text is distinct from v.role;

-- Verify
select email, full_name, role from public.profiles
where email like '%@kindred.demo'
order by email;
