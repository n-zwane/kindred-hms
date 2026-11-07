# Supabase Auth setup (Step 4) - `qgdxxvcgvftcigsacxap`

Do this in the [Supabase Dashboard](https://supabase.com/dashboard/project/qgdxxvcgvftcigsacxap) for patient sign-up and local dev.

## 1. Email provider

**Authentication** → **Providers** → **Email**

- **Enable Email provider**: ON  
- **Confirm email**: OFF for quick team testing; ON for production (requires SMTP)  
- **Enable sign ups**: ON  

## 2. URL configuration

**Authentication** → **URL configuration**

| Field | Value (local dev) |
|--------|-------------------|
| **Site URL** | `http://localhost:5173` |
| **Redirect URLs** | Add each on its own line: |

```
http://localhost:5173/**
http://127.0.0.1:5173/**
http://localhost:5173/reset-password
```

When you deploy, add your production URL the same way. Firebase Hosting for this repo is:

```
https://kindred-hms-nzwane.web.app/**
https://kindred-hms-nzwane.firebaseapp.com/**
```

## 3. Push database schema (one time)

Run from **this repo root** (not your home folder - link lives under `supabase/.temp/`):

```powershell
cd "C:\Users\Nicoroy L. Zwane\Documents\GitHub\SE"
```

The CLI often sits on **Initialising login role...** until it can reach the database or you cancel. Supabase then suggests using your real DB password instead of the temporary login role.

**PowerShell (recommended):**

```powershell
$env:SUPABASE_DB_PASSWORD = "YOUR_DATABASE_PASSWORD"   # from project create / Dashboard → Settings → Database
supabase db push
```

Or pass the password once on the command:

```powershell
supabase db push -p "YOUR_DATABASE_PASSWORD"
```

Remove the env var after use if you like: `Remove-Item Env:SUPABASE_DB_PASSWORD`

**If it still hangs:** check firewall/VPN; try again on another network. Password is in [Dashboard → Project Settings → Database](https://supabase.com/dashboard/project/qgdxxvcgvftcigsacxap/settings/database) (reset there if you lost it).

**No CLI option:** open **SQL Editor** and run, in order:

1. `supabase/migrations/20261107134938_core_schema.sql`
2. `supabase/migrations/20261107142302_grants_and_patient_signup.sql`

That creates tables, RLS, grants, and sign-up triggers.

Optional seed (demo wards/doctors) - run `supabase/seed.sql` in **SQL Editor** if you want sample data (not required for patient sign-up).

## 4. Web app env

`apps/web/.env` (not committed):

```env
VITE_SUPABASE_URL=https://qgdxxvcgvftcigsacxap.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NtaGj_CkWnNDSgxQD7y6tw_SZWBmkqn
```

Restart: `npm run dev`

## 5. Verify

1. Open `http://localhost:5173/signup` → create a patient account.  
2. Sign in → dashboard + **Appointments** should load.  
3. If sign-up fails with “email rate limit” or “signup disabled”, recheck step 1.

## Staff accounts

Patients use **Sign up**. Receptionist/doctor/admin/IT accounts should be created in **Authentication → Users** (or Admin API) and given roles via **`app_metadata`**:

```json
{ "role": "receptionist" }
```

Public sign-up always assigns the **patient** role only.
