# Hosted Supabase (shared / production database)

Use a [Supabase cloud project](https://supabase.com/dashboard) so teammates and patients share one database instead of only local Docker.

## 1. Create the project

1. New project in the Supabase dashboard (choose a region close to users).
2. Save the database password somewhere safe (password manager).

## 2. Link this repo

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

## 3. Push schema

From the **linked repo root** (e.g. `...\Documents\GitHub\SE`):

```powershell
$env:SUPABASE_DB_PASSWORD = "YOUR_DATABASE_PASSWORD"
supabase db push
```

If the CLI hangs on `Initialising login role...`, you canceled before the password prompt, or you see `context canceled` / `SUPABASE_DB_PASSWORD` - use the env var or `-p` above ([docs/supabase-auth-setup.md](./supabase-auth-setup.md#3-push-database-schema-one-time)).

If you see `wsarecv` / `i/o timeout` / `tls error` to `pooler.supabase.com` (ports **5432** or **6543**), your network is blocking or timing out Postgres (common on campus VPN/Wi‑Fi). The CLI cannot push until something changes (e.g. phone hotspot, home network).

### Apply schema via SQL Editor (works over HTTPS)

1. Open [SQL Editor](https://supabase.com/dashboard/project/qgdxxvcgvftcigsacxap/sql/new).
2. Paste and **Run** the full contents of `supabase/migrations/20261107134938_core_schema.sql`.
3. New query → paste and **Run** `supabase/migrations/20261107142302_grants_and_patient_signup.sql`.
4. New query → **Run** `supabase/mark_migrations_applied.sql` (records migration history for a future `db push`).

Optional: run `supabase/seed.sql` for demo wards/doctors.

The direct host `db.<ref>.supabase.co` is often **IPv6-only**; if the CLI says `no such host` while the dashboard works, that is a separate IPv4/IPv6 issue-use the SQL Editor path above.

This applies all files in `supabase/migrations/` to the remote database.

## 4. Configure the web app

Dashboard → **Project Settings** → **API**:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** JWT (or publishable key if your client version requires it) → `VITE_SUPABASE_ANON_KEY`

Create `apps/web/.env` (never commit):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev` after changing env.

## 5. Auth settings (patient sign-up)

Dashboard → **Authentication** → **Providers** → Email:

- Enable email sign-up.
- For demos, you may disable “Confirm email”; for production, keep confirmation on and configure SMTP.

Dashboard → **URL configuration**:

- **Site URL**: your deployed app URL (or `http://localhost:5173` for local dev against cloud).
- **Redirect URLs**: add `http://localhost:5173/**` and production URLs for password reset.

## 6. First staff user

Public sign-up always creates **patient** accounts (see migration `grants_and_patient_signup`).

Create the first IT admin in **Authentication** → **Add user**, then run in **SQL Editor**:

```sql
update public.profiles
set role = 'it_admin', full_name = 'IT Admin'
where id = '<auth-user-uuid>';
```

Or use Admin API with `app_metadata: { "role": "it_admin" }` when creating users (not `user_metadata`).

## 7. Deploy frontend

Build with the same `VITE_*` variables in your host (Vercel, Netlify, etc.). Do **not** expose `service_role` in the browser.

## Local vs hosted

| | Local | Hosted |
|---|--------|--------|
| Command | `supabase start` | Dashboard project |
| Env | `http://127.0.0.1:54321` | `https://xxx.supabase.co` |
| Patient sign-up | `/signup` | Same |

After switching to hosted, remove or overwrite local keys in `apps/web/.env` and restart Vite.
