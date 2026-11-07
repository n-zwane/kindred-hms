# Hosted demo seed (SQL Editor)

Run in the [SQL Editor](https://supabase.com/dashboard/project/qgdxxvcgvftcigsacxap/sql/new) **in order**. Skip `00` unless you need to wipe and re-run demo data.

| Step | File |
|------|------|
| (optional) | `supabase/seed-hosted/00_cleanup_demo_data.sql` |
| 1 | `01_clinic_wards_doctors.sql` |
| 2 | `02_patients_records.sql` |
| 3 | `03_appointments.sql` |
| 4 | `04_prescriptions.sql` |
| 5 | `05_wards_audit.sql` |
| (if staff show as patient) | `07_fix_demo_profile_roles.sql` |
| (year of activity + Ayanda) | `08_usage_history.sql` |

Demo rows use emails `*@kindred.demo`. Your `/signup` account is kept; part 3 may add one “Welcome visit” appointment for portal patients.

Staff logins: [demo-logins-hosted.md](./demo-logins-hosted.md) (or `supabase/seed-hosted/06_staff_users_optional.md`).
