# Implementation roadmap

One task at a time. Update checkboxes when a task is complete and committed on `develop`.

## Task 1 — Discovery and Git

- [x] Discovery docs (`docs/discovery.md`, `figma-inventory.md`, `architecture.md`)
- [x] `.gitignore` (includes `Context/`, `Figma/`)
- [x] `.env.example`, `README.md`
- [x] Git: `main` baseline, `develop` branch
- [x] Task 1 report confirmed with stakeholder

## Task 2 — Scaffold (not started)

- [ ] Root `package.json` / workspace
- [ ] `apps/web` Vite + React + TypeScript
- [ ] README run scripts stub

## Task 3 — Supabase local

- [ ] `supabase init`
- [ ] Docker + `supabase start` documented
- [ ] Local `.env` (user-provided, not committed)

## Task 4 — Design system and shell

- [ ] Tailwind theme (Kindred tokens)
- [ ] shadcn/ui init
- [ ] AppShell + role sidebar scaffold

## Task 5 — Auth and routing

- [ ] Supabase Auth login/logout
- [ ] Password reset UI
- [ ] Protected routes + role guard

## Task 6 — Database core

- [ ] Migrations: profiles, patients, doctors, appointments
- [ ] RLS policies per role

## Task 7 — Patients UI

- [ ] Grid + detail + receptionist CRUD

## Task 8 — Appointments

- [ ] List, booking, status workflow

## Task 9 — Doctors

- [ ] Grid, detail, add doctor (core fields)

## Task 10 — Records and prescriptions

- [ ] Doctor-scoped records + Rx

## Task 11 — Wards

- [ ] Capacity + allocation

## Task 12 — Admin and IT

- [ ] Admin dashboard patterns
- [ ] Users/roles, audit read

## Task 13 — Hardening

- [ ] Vitest for critical paths
- [ ] Seed data, README runbook
