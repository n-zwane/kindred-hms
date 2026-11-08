# Kindred HMS — 3-minute demo script

**Audience:** Lecturers / stakeholders (UWC N-i-MBLUS)  
**Goal:** Show role-based workflows, security, and core use cases in ~180 seconds.  
**URL:** `http://localhost:5173` (or your deployed URL)

## Before you record (2 min setup)

- [ ] Dev server running: `npm run dev`
- [ ] Hosted Supabase + demo seed applied (`seed-hosted` SQL)
- [ ] Demo users exist (`node scripts/seed-demo-auth-users.mjs` or dashboard)
- [ ] Roles fixed if needed: `07_fix_demo_profile_roles.sql`
- [ ] Browser zoom **100%**, sidebar visible, notifications off
- [ ] Pre-open tabs: login page only (clean start)
- [ ] All demo passwords: **`Password123!`** (see [demo-logins-hosted.md](./demo-logins-hosted.md))

**Tip:** Practice one full run once; account switches cost ~8 seconds each (sign out → login).

---

## Presenter copy (read aloud)

### 0:00–0:20 — Hook + patient

**Screen:** Login → `patient@kindred.demo`  
**Say:** “This is **Kindred** — our HMS for Trustcare Clinic, Bellville. Each role gets a **different, secure** experience.”

### 0:20–0:45 — Patient journey

**Screen:** Dashboard → **Appointments** → (optional) **Doctors**  
**Say:** “Patients see only their scope: appointments and doctor lookup. Access is enforced in the database, not just by hiding menu items.”

### 0:45–1:25 — Reception

**Screen:** Sign out → `receptionist@kindred.demo` → **Patients** (one profile) → **Doctors** → **Appointments**  
**Say:** “Reception runs the register, finds doctors by specialisation, and manages the shared appointment board.”

### 1:25–2:05 — Doctor

**Screen:** Sign out → `doctor@kindred.demo` → **Appointments** → **Records** → **Prescriptions**  
**Say:** “Doctors see their schedule, clinical **records**, and **prescriptions** for patients in their care.”

### 2:05–2:40 — Admin

**Screen:** Sign out → `admin@kindred.demo` → **Appointments** (optional status change) → **Wards**  
**Say:** “Operations tracks appointment status and **ward capacity** so allocations stay within bed limits.”

### 2:40–3:00 — IT + close

**Screen:** Sign out → `it@kindred.demo` → **Users** → **Audit log** (skip audit if you’re at 2:55)  
**Say:** “IT manages **users** and can review **audit** activity for accountability.”

**Closer:** “**React, TypeScript, Supabase Auth, PostgreSQL with RLS** — five roles, one clinic, demo data. Thanks.”

---

## Script (≈3:00) — detailed table

| Time | On screen | You say |
|------|-----------|---------|
| **0:00–0:20** | Login page, then **Patient** `patient@kindred.demo` | “This is **Kindred** — our hospital management web app for Trustcare Clinic in Bellville. Patients sign in securely and use a **role-specific** interface, not a one-size-fits-all portal.” |
| **0:20–0:45** | Patient **Dashboard** → **Appointments** → optional **Doctors** (`/doctors`) | “As a patient, I see only what I’m allowed to: my dashboard and appointments. I can browse doctors and specialisations to plan a visit — data access is enforced on the server, not just hidden in the UI.” |
| **0:45–0:55** | Sign out | “Next, front desk.” *(Sign out.)* |
| **0:55–1:25** | **Receptionist** `receptionist@kindred.demo` → **Patients** → open one row → **Doctors** → **Appointments** | “**Reception** manages the patient register, searches the directory, and sees the full appointment schedule across the clinic — booking, confirmations, and check-in statuses for the whole team.” |
| **1:25–1:35** | Sign out | “Clinical workflow.” |
| **1:35–2:05** | **Doctor** `doctor@kindred.demo` → **Appointments** → **Records** → **Prescriptions** | “Doctors work from their own view: today’s appointments, **medical records** for patients they’re treating, and **prescriptions** — aligned with our use cases for records and e-prescribing.” |
| **2:05–2:15** | Sign out | “Operations and beds.” |
| **2:15–2:40** | **Admin** `admin@kindred.demo` → **Appointments** (change one status if time) → **Wards** | “**Administration** tracks appointment progression and **ward allocation** — capacity and occupancy so beds aren’t over-allocated.” |
| **2:40–2:50** | Sign out | “Finally, IT governance.” |
| **2:50–3:10** | **IT** `it@kindred.demo` → **Users** → **Audit log** | “**IT administrators** manage accounts and review **audit activity** — part of our security and data-protection requirements.” |

*If you’re strict on 3:00, stop IT at Users only and skip Audit.*

---

## Closing line (last 5–10 seconds)

> “Under the hood: **TypeScript React**, **Supabase Auth**, and **PostgreSQL with row-level security** — one clinic, five roles, fictional demo data only. Thank you.”

---

## One-line story arc (if you forget the script)

**Patient self-service → Reception coordination → Doctor care → Admin beds → IT oversight → secure cloud backend.**

---

## Fast cuts (if you’re over time)

| Cut | Saves |
|-----|--------|
| Skip patient **Doctors** page | ~10 s |
| Reception: list patients only, no detail | ~15 s |
| Doctor: show **Records** only, skip prescriptions | ~15 s |
| Admin: **Wards** only, skip appointment status edit | ~15 s |
| IT: **Users** only | ~10 s |

**Minimum viable 90 s demo:** Reception (patients) → Doctor (records) → Admin (wards) → one sentence on RLS.

---

## Likely Q&A (optional)

- **Multi-clinic?** Single clinic by design (simplified scope).  
- **SMS / WhatsApp?** Deferred per requirements.  
- **Why Supabase?** Auth + Postgres + RLS in one stack; team can share one hosted database.
