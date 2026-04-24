# Store Platform

Production-grade monorepo for a storefront SaaS:

- Frontend SPA in `apps/frontend`
- API backend in `apps/backend`
- Shared contracts and utilities in `packages/*`
- Prisma ORM with PostgreSQL migrations
- Cookie-based auth with refresh token rotation, CSRF protection, and RBAC
- Docker, GitHub Actions CI, and deployment targets for Vercel + Render/Railway/AWS

## Workspaces

```text
apps/
  backend/
  frontend/
packages/
  config/
  types/
  utils/
```

## Commands

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run db:migrate
npm run db:seed
```

`npm run dev` now runs the pending Prisma migrations and reseeds the local database from `text.csv` before starting the backend and frontend, so the catalog products are ready automatically in development.

## Environment

Use the root env templates as the source of truth:

- `.env.development.example`
- `.env.staging.example`
- `.env.production.example`

## Deployment targets

- Frontend: Vercel
- Backend: Render, Railway, or AWS App Runner/ECS
- Database: Managed PostgreSQL

## Migration

The previous `client/` and `server/` folders are now legacy references. Active development should use `apps/frontend` and `apps/backend`.
