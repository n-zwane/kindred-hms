# Project discovery

Hospital Management System (HMS) for Team **N-i-MBLUS** (University of the Western Cape). UI brand in designs: **Kindred** (Preclinic medical kit).

## Purpose

Integrate hospital services: patient self-service appointments, front-desk patient administration, doctor/specialisation lookup, medical records and prescriptions (doctors), appointment oversight and ward allocation (admin), with strong security and data protection (IT admin).

## Stakeholders and tasks

| Role | Tasks (use cases) |
|------|-------------------|
| **Patient** | Book appointments |
| **Receptionist** | Input/manage patient information; find doctors by specialisation |
| **Doctor** | Find doctors by specialisation; access patient medical records; manage prescriptions |
| **Administrator / management** | Track/update appointment statuses; allocate patients to wards |
| **IT administrator** | Protect sensitive data; prevent loss of data (auth, backups, monitoring) |

Supporting (internal) use cases include notify appointment confirmation, maintain system, manage users and permissions.

## Data entities

Patient, Appointment, Doctor, PatientRecord, Prescription, Ward, WardAllocation, UserAccount.

## Functional priorities (implementation order)

1. Security and data protection / reliability  
2. Patient information management  
3. Book appointments  
4. Manage and track appointment statuses  
5. Identify and access doctors by specialisation  
6. Access patient medical records  
7. Manage patient prescriptions  
8. Allocate patients to available wards  

**Deferred (out of scope for core delivery):** SMS/WhatsApp, USSD, multilingual, queue management, multi-clinic switching, full Preclinic kit navigation (HRM, Finance, Blogs, etc.).

## Non-functional requirements

- **Security:** authentication, RBAC, encryption at rest/in transit, input validation, secure passwords  
- **Usability:** consistent Kindred-style UI, clear errors  
- **Reliability:** validation, backups, recovery  
- **Maintainability:** modular features, documented design  
- **Availability:** monitoring, error handling  

## Architecture decisions (project)

| Topic | Decision |
|-------|----------|
| Frontend | TypeScript, React, Vite, Tailwind CSS, shadcn/ui |
| Backend/data | Supabase local (Docker): Auth + PostgreSQL, RLS |
| Testing | Vitest, React Testing Library |
| Clinic | Single default clinic |
| Navigation | Trimmed, role-specific sidebar |
| Doctor onboarding | Core fields first: name, specialisation, schedule, contact (extensible) |
| Reference assets | `Context/` and `Figma/` are **local only** — not in Git |

Course Step 5 report proposed React + Express + PostgreSQL; this repo uses **Supabase-first** access (Auth, Postgres, RLS; Edge Functions only when RLS is insufficient).

## Behavioural rules (summary)

- **Booking:** check doctor availability; create pending/confirmed; offer alternatives if slot taken  
- **Patient registration:** duplicate detection on key fields  
- **Ward allocation:** reject when ward at capacity; update capacity  
- **Access control:** authenticate → resolve role → allow only permitted data/actions; log denials  

## Reference materials

Requirements and UI exports are read from gitignored folders at the repo root:

- `Context/` — Step 4 and Step 5 PDFs  
- `Figma/` — screen exports (see [figma-inventory.md](./figma-inventory.md))  

Teammates need those folders locally or via team storage; distilled truth lives in `docs/`.
