# Implementation roadmap

One task at a time. Update checkboxes when a task is complete and committed on `develop`.

## Task 1 — Discovery and Git

- [x] Discovery docs
- [x] Git: `main` + `develop`
- [x] Context/Figma gitignored

## Task 2 — Scaffold

- [x] Root workspace + `apps/web` Vite React TS
- [x] Vitest + RTL setup

## Task 3 — Supabase local

- [x] `supabase init`, core migration, seed, `docs/supabase-local.md`
- [ ] Run `supabase start` + `supabase db reset` on your machine (Docker)

## Task 4 — Design system and shell

- [x] Tailwind (Kindred tokens)
- [x] shadcn-style UI primitives
- [x] AppShell + role sidebar

## Task 5 — Auth and routing

- [x] Login, forgot/reset password, Supabase Auth
- [x] Protected routes + `RoleGate`

## Task 6 — Database core

- [x] Migrations: profiles, patients, doctors, appointments, records, Rx, wards, audit
- [x] RLS policies (review in Supabase Studio after local reset)

## Task 7 — Patients UI

- [x] Grid, detail, create dialog

## Task 8 — Appointments

- [x] List, create, status updates (staff)

## Task 9 — Doctors

- [x] Grid, detail, add doctor (core fields + schedule)

## Task 10 — Records and prescriptions

- [x] Records editor (doctor)
- [x] Prescriptions list + create (doctor)

## Task 11 — Wards

- [x] Ward cards + allocation with capacity trigger

## Task 12 — Admin and IT

- [x] Role-based dashboards
- [x] IT users/roles, audit read

## Task 13 — Hardening

- [x] Navigation unit tests
- [ ] E2E against local Supabase with seeded users
- [ ] Expanded Vitest for auth forms
