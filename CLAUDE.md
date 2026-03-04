# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

Monorepo. Each service lives in its own subdirectory. `docker-compose.yml` at root orchestrates all services.

```plaintext
my-website/
├── docker-compose.yml   ← runs all services
├── frontend/            ← Next.js personal website
│   ├── Dockerfile
│   ├── src/
│   └── public/
└── (backend/, admin/ — planned)
```

## Commands

### Root (Docker)

- **Run all services:** `docker compose up`
- **Build all services:** `docker compose build`

### Frontend (`cd frontend/`)

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`

No test framework is configured.

## Frontend architecture

Personal portfolio for Jabborov Abduroziq. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

- `frontend/src/app/` — App Router pages: home, `/about`, `/blog`, `/contact`, `/projects`
- `frontend/src/components/` — Shared components (header, footer, globe, custom-cursor, navigation-menu, project-card, contact-form)
- `frontend/src/components/icons/` — SVG icon components
- `frontend/src/lib/constants.ts` — Social links
- `frontend/src/app/opengraph-image.tsx` — Dynamic OG image via `next/og`
- `frontend/src/app/globals.css` — Tailwind v4 `@theme` with custom colors and animations

### Design system

- **Font:** IBM Plex Mono (monospace throughout)
- **Colors:** `--color-navy` (#000022), `--color-orange` (#E28413), `--color-white` (#ffffff) — defined as Tailwind theme tokens in `globals.css`
- **Animations:** `fade-up`, `fade-in`, `scale-in`, `slide-right` exposed as `animate-*` Tailwind utilities
- **Custom cursor:** Dot + ring cursor via JS (`custom-cursor.tsx`) + CSS; hidden on touch devices

### Import alias

`@/` maps to `frontend/src/` (configured in `frontend/tsconfig.json`).

### Deployment

`frontend/next.config.ts` sets `output: "standalone"`. Docker uses multi-stage build (Node 22 Alpine). Site URL from `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL` env vars.

### Key dependencies

- `cobe` — WebGL globe on the homepage
- Package manager: **pnpm**
