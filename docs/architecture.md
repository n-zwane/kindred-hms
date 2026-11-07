# Architecture

## Layers

```text
┌─────────────────────────────────────────────┐
│  apps/web — React (presentation only)       │
│  Tailwind + shadcn/ui, role-based routes    │
└─────────────────────┬───────────────────────┘
                      │ Supabase JS client
┌─────────────────────▼───────────────────────┐
│  Supabase Auth — sessions, passwords        │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│  PostgreSQL — domain tables + RLS policies  │
│  (optional Edge Functions for transactions) │
└─────────────────────────────────────────────┘
```

## Module map

| Module | Responsibility |
|--------|------------------|
| `auth` | Login, logout, password reset, session, role resolution |
| `patients` | CRUD, search, duplicate checks |
| `doctors` | Directory, profile, core onboarding, specialisation |
| `appointments` | Booking, status workflow, conflict detection |
| `records` | PatientRecord read (doctor, scoped) |
| `prescriptions` | Create/update, link to record |
| `wards` | Ward capacity, allocation |
| `admin` | Cross-cutting appointment status (management) |
| `system` | IT: users/roles, audit read, health placeholders |

## Security

- **Never** rely on hiding UI alone; enforce **RLS** on every sensitive table.  
- Roles: `patient`, `receptionist`, `doctor`, `admin`, `it_admin` (exact enum TBD in migrations).  
- Store role in `profiles` linked to `auth.users`; optional `app_metadata` for bootstrap.  
- Client uses **anon key** only; service role only in local scripts/Edge Functions, never in frontend.  
- Fictional seed data only in development.

## Frontend structure (planned)

```text
apps/web/src/
  app/           # router, providers
  features/      # auth, patients, doctors, appointments, …
  components/    # shared UI
  layouts/       # AppShell, role sidebars
  lib/           # supabase client, utils
  styles/        # design tokens
```

## Navigation (trimmed by role)

See [discovery.md](./discovery.md). No multi-clinic switcher. No kit-only modules (Finance, HRM, etc.) unless added to requirements later.

## Repository layout (target)

```text
SE/
  apps/web/
  supabase/        # config, migrations, seed
  docs/
  .env.example
```

`Context/` and `Figma/` remain outside version control.
