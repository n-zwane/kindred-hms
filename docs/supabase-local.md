# Supabase local development

## Prerequisites

- Docker Desktop running
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed

## Commands

From the repository root:

```bash
supabase start
```

Copy values from `supabase status` into `apps/web/.env` (file is gitignored):

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<ANON_KEY from supabase status>
```

Use the JWT **`ANON_KEY`** for `@supabase/supabase-js` in the browser. The CLI may also show a **Publishable** key (`sb_publishable_…`); prefer `ANON_KEY` unless you migrate the client to the newer key format.

Never put **SERVICE_ROLE_KEY** / **Secret** keys in the frontend or commit them.

Apply migrations and seed:

```bash
supabase db reset
```

Stop stack:

```bash
supabase stop
```

## Dev login accounts (local only)

These accounts are for **local development only**. Password for all: `Password123!`

| Role | Email | Notes |
|------|-------|--------|
| Patient | `patient@kindred.local` | Linked to seeded patient Alberto Ripley |
| Receptionist | `receptionist@kindred.local` | Full patient CRUD |
| Doctor | `doctor@kindred.local` | Linked to seeded Dr. John Smith |
| Admin | `admin@kindred.local` | Appointments + wards |
| IT admin | `it@kindred.local` | Users + audit log |

Recreate with Supabase Admin API or Studio if you `supabase db reset` (auth users are wiped on reset unless you add a seed script).

### Manual creation (Studio)

Authentication → Users → Add user, with metadata:

```json
{ "role": "receptionist", "full_name": "Desk User" }
```

Allowed `role` values: `patient`, `receptionist`, `doctor`, `admin`, `it_admin`.

Link patient portal users with `UPDATE patients SET profile_id = '<auth-user-uuid>' WHERE ...`.

## Migrations

SQL files live in `supabase/migrations/`. Add new migrations with:

```bash
supabase migration new <name>
```
