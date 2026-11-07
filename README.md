# Hospital Management System (SE)

TypeScript React front end with **Supabase** (Auth + PostgreSQL) for the N-i-MBLUS HMS project.

## Reference materials (not in Git)

- `Context/` — requirements PDFs (local copy)  
- `Figma/` — UI exports (local copy)  

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

## Status

**Task 1 complete:** discovery documentation and repository initialisation. Application scaffold starts in Task 2.

## Docs

- [Discovery](./docs/discovery.md)  
- [Architecture](./docs/architecture.md)  
- [Figma inventory](./docs/figma-inventory.md)  
- [Roadmap](./docs/ROADMAP.md)  
