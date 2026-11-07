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

```bash
supabase db push
```

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
