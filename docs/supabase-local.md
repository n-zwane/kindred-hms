# Supabase local development

## Prerequisites

- Docker Desktop running
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed

## Commands

From the repository root:

```bash
supabase start
```

Copy **API URL** and **anon key** from the CLI output into `apps/web/.env`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon-key-from-cli>
```

Apply migrations and seed:

```bash
supabase db reset
```

Stop stack:

```bash
supabase stop
```

## Create dev users

In [Supabase Studio](http://127.0.0.1:54323) → Authentication → Users, create users and set **User Metadata** JSON, for example:

```json
{ "role": "receptionist", "full_name": "Desk User" }
```

Allowed `role` values: `patient`, `receptionist`, `doctor`, `admin`, `it_admin`.

Link patient portal users by setting `patients.profile_id` to their `auth.users` id after signup.

## Migrations

SQL files live in `supabase/migrations/`. Add new migrations with:

```bash
supabase migration new <name>
```
