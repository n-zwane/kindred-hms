# Figma design inventory

Design exports live **locally only** under `Figma/` (gitignored). Paths below are relative to the project root on a developer machine.

## Visual system (Kindred / Preclinic kit)

- App background: `#F5F6F8`
- Auth accent panel: `#F0EDF7`
- Primary accent: purple (buttons, active nav, badges)
- Layout: collapsible left sidebar, top bar (search, calendar, settings, notifications, avatar)
- Status badges: Confirmed, Schedule, Checked In, Checked Out, Cancelled

## Assets

| File | Approx. size | Inferred screen | Module | Roadmap |
|------|--------------|-----------------|--------|---------|
| `Authentication.svg` | ~1.9 MB | Login / registration (multi-frame) | Auth | T5 |
| `Dashboard.svg` | ~13 MB | Admin / operations dashboard | Admin | T12 |
| `Clinic.svg` | ~26 MB | Clinic ops frames (patterns) | Wards / admin UI | T11, T12 |
| `Patient Dashboard.svg` | ~4.7 MB | Patient role home | Patient | T5+ |
| `Receptionist Dashboard.svg` | ~9.9 MB | Receptionist home | Receptionist | T7+ |
| `Doctor Dashboard.svg` | ~1 MB | Doctor home | Doctor | T9+ |
| `Patient Grid.jpg` | List | Patient grid + filters | Patients | T7 |
| `Patient Details.jpg` | Detail | Profile, vitals, appointments table | Patients | T7 |
| `Patient Appointment.jpg` | List | Appointment management table | Appointments | T8 |
| `Doctor Grid.jpg` | List | Doctor directory | Doctors | T9 |
| `Doctor Details.png` | Detail | Profile, availability, credentials | Doctors | T9 |
| `Add New Doctor.png` | Form drawer | Onboarding (implement core fields first) | Doctors | T9 |
| `reset-password/rafiki.png` | Illustration | Reset password panel | Auth | T5 |
| `Preclinic - ... UI Kit.jpg` | Reference | Full kit overview | — | Do not implement full menu |

Multi-frame SVGs embed raster content; use as visual reference. Export single-frame PNGs locally if pixel-diff review is needed.

## Gaps (build from established patterns)

- Ward allocation (dedicated screen)
- Prescription create/view
- IT admin (users, audit, system health)
- Patient self-service booking wizard (may be embedded in Patient Dashboard SVG only)

## Runtime assets

Do not commit `Figma/`. Copy individual files into `apps/web/public/` only when required for the running app (e.g. auth illustration), in small feature commits.
