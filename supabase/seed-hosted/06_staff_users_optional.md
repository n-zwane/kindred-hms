# Optional: staff logins for full UI

Demo **data** (doctors, patients, appointments) is visible when you sign in as **staff**. Patients only see their own rows (RLS).

Create users in **Authentication → Users → Add user** (set a password). For each user, open the user → **Raw App Meta Data**:

```json
{ "role": "receptionist" }
```

| Email (suggested) | `app_metadata.role` | Use |
|-------------------|---------------------|-----|
| `receptionist@kindred.demo` | `receptionist` | Patients, appointments, doctors read |
| `admin@kindred.demo` | `admin` | Wards, full admin |
| `doctor@kindred.demo` | `doctor` | Then run SQL below to link doctor row |
| `it@kindred.demo` | `it_admin` | Users + audit log |

After creating **doctor@kindred.demo**, link to a demo doctor (SQL Editor):

```sql
update public.doctors
set profile_id = (select id from public.profiles where email = 'doctor@kindred.demo')
where email = 'johan.vanwyk@kindred.demo';
```

Password suggestion for demo only: `Password123!`
