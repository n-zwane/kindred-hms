# Demo logins (hosted Supabase)

**App:** `http://localhost:5173/login` (or your deployed URL)

Staff accounts are **not** created by the SQL seed files. Until you add them, logins like `receptionist@kindred.demo` return **Invalid login credentials**. Only accounts you created (e.g. via **Sign up**) exist in Auth.

**`@kindred.local` passwords from [supabase-local.md](./supabase-local.md) do not work on the cloud project.**

### Fast path: create all demo users (recommended)

1. Open [Project Settings → API](https://supabase.com/dashboard/project/qgdxxvcgvftcigsacxap/settings/api).
2. Under **Project API keys**, find **`service_role`** → click **Reveal** → copy the **whole key** (a long token, usually starts with `eyJ…`).
   - **Not** the Project URL  
   - **Not** `…/rest/v1`  
   - **Not** `sb_publishable_…` (that is for the browser app only)
3. In PowerShell from the repo root:

```powershell
$env:SUPABASE_URL = "https://qgdxxvcgvftcigsacxap.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."   # your full secret
node scripts/seed-demo-auth-users.mjs
```

3. Sign in with any row below using password `Password123!` (or set `DEMO_USER_PASSWORD` before running the script).

Or create users manually in [Authentication → Users](https://supabase.com/dashboard/project/qgdxxvcgvftcigsacxap/auth/users). Public **Sign up** always creates a **patient**.

Use one shared demo password for every test account (e.g. `Password123!`).

## Create each user (one-time)

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email + password below
3. Enable **Auto Confirm User** (if email confirmation is off for your project)
4. Expand **App Metadata** (not User Metadata) and paste the JSON **exactly**
5. Optional **User Metadata** for display name: `{ "full_name": "..." }`

## Cheat sheet

| Role | Email | Password (you choose) | App metadata (`raw_app_meta_data`) | After create |
|------|--------|------------------------|-------------------------------------|--------------|
| **Patient** | Your existing sign-up email **or** `patient@kindred.demo` | What you set at `/signup` **or** `Password123!` | *(none - use Sign up, or leave empty)* | Use `/signup` or dashboard user |
| **Receptionist** | `receptionist@kindred.demo` | `Password123!` | `{ "role": "receptionist" }` | - |
| **Doctor** | `doctor@kindred.demo` | `Password123!` | `{ "role": "doctor" }` | Run [doctor link SQL](#doctor-link) |
| **Admin** | `admin@kindred.demo` | `Password123!` | `{ "role": "admin" }` | - |
| **IT admin** | `it@kindred.demo` | `Password123!` | `{ "role": "it_admin" }` | - |

Allowed `role` values: `patient`, `receptionist`, `doctor`, `admin`, `it_admin`.

### Doctor link

After `doctor@kindred.demo` exists, SQL Editor:

```sql
update public.doctors
set profile_id = (select id from public.profiles where email = 'doctor@kindred.demo')
where email = 'johan.vanwyk@kindred.demo';
```

### Optional display names (User Metadata)

| Email | User metadata |
|-------|----------------|
| `receptionist@kindred.demo` | `{ "full_name": "Lindiwe Maseko" }` |
| `doctor@kindred.demo` | `{ "full_name": "Dr Johan van Wyk" }` |
| `admin@kindred.demo` | `{ "full_name": "Sam Admin" }` |
| `it@kindred.demo` | `{ "full_name": "IT Support" }` |

## What each role sees

| Role | Main nav |
|------|----------|
| Patient | Dashboard, Appointments (+ Doctors via URL `/doctors`) |
| Receptionist | Dashboard, Patients, Appointments, Doctors |
| Doctor | Dashboard, Appointments, Patients, Records, Prescriptions |
| Admin | Dashboard, Appointments, Wards |
| IT admin | Dashboard, Users, Audit log |

## Troubleshooting: correct name but **patient** sidebar / dashboard

The app uses **`public.profiles.role`**, set once when the auth user is first created. Updating **App metadata** later does not change `profiles` automatically.

**Fix:** run `supabase/seed-hosted/07_fix_demo_profile_roles.sql` in the SQL Editor, then sign out and sign in again.

When creating users in the dashboard, put `"role"` in **App Metadata**, not User Metadata:

```json
{ "role": "it_admin" }
```

Re-run `node scripts/seed-demo-auth-users.mjs` (with service role key) to sync auth + profiles.

## Troubleshooting “Invalid login credentials”

| Cause | Fix |
|--------|-----|
| Staff email never created | Run `scripts/seed-demo-auth-users.mjs` or add user in dashboard |
| Using `*@kindred.local` | Local Docker only; use `*@kindred.demo` on hosted |
| Wrong password | Reset in dashboard **Users → … → Send password recovery** or re-run seed script |
| Wrong Supabase project | `apps/web/.env` must be `https://qgdxxvcgvftcigsacxap.supabase.co` (restart `npm run dev`) |
| Your patient account | Use the **exact** email/password from `/signup`, not `Password123!` unless you set that |

Confirm users exist: dashboard **Authentication** → **Users**, or SQL Editor: `select email, created_at from auth.users order by created_at;`

## Local Docker only (not hosted)

If you use `supabase start` and local API URL, pre-made users are `*@kindred.local` with password `Password123!` - see [supabase-local.md](./supabase-local.md). Those logins do **not** apply to the cloud project.

## Fix wrong role

If you created a user without app metadata (defaults to patient), SQL Editor:

```sql
update public.profiles
set role = 'receptionist'  -- or doctor, admin, it_admin
where email = 'receptionist@kindred.demo';
```
