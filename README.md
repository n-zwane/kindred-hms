# Hospital Management System (SE)

TypeScript React front end with **Supabase** (Auth + PostgreSQL) for the N-i-MBLUS HMS project.

## Reference materials (not in Git)

- `Context/` - requirements PDFs (local copy)  
- `Figma/` - UI exports (local copy)  

Summaries live in [`docs/`](./docs/). Obtain PDFs and Figma files from your team if you clone this repo without them.

## Branching

| Branch | Use |
|--------|-----|
| `main` | Production-ready releases only |
| `develop` | Integration; default for day-to-day work |
| `feature/*`, `fix/*`, `chore/*`, `docs/*` | Short-lived branches from `develop` |

Do **not** commit directly to `main`.

Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).

## Environment

Copy `.env.example` to `.env` and fill Supabase values after local stack is running (Task 3). Never commit `.env`.

## Scripts (from repo root)

```bash
npm install
npm run dev      # Vite dev server (@hms/web)
npm run build
npm run test
```

- Local Supabase: [docs/supabase-local.md](./docs/supabase-local.md)  
- Hosted / team database: [docs/supabase-hosted.md](./docs/supabase-hosted.md)  
- Auth URLs (step 4): [docs/supabase-auth-setup.md](./docs/supabase-auth-setup.md)  
- Patients: **Sign in** or **Create account** at `/signup`

## Firebase Hosting

The Vite app builds to `apps/web/dist` and deploys as a single-page app.

```bash
npm run build
firebase deploy --only hosting
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `apps/web/.env` before building. After the first deploy, add the Firebase URL to Supabase Auth redirect allow-lists.

Live site: [https://kindred-hms-nzwane.web.app](https://kindred-hms-nzwane.web.app)

## Status

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for current progress.

## Docs

- [Discovery](./docs/discovery.md)  
- [Architecture](./docs/architecture.md)  
- [Figma inventory](./docs/figma-inventory.md)  
- [Roadmap](./docs/ROADMAP.md)  
