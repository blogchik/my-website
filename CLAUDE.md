# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

Monorepo. Each service lives in its own subdirectory. Docker Compose files at root orchestrate all services.

```plaintext
my-website/
├── docker-compose.yml           ← base config (shared between dev/prod)
├── docker-compose.override.yml  ← dev overrides (auto-loaded)
├── docker-compose.prod.yml      ← prod overrides (Nginx + Certbot)
├── Makefile                     ← convenience commands
├── nginx/
│   ├── nginx.conf
│   └── conf.d/app.conf          ← HTTP→HTTPS redirect, proxy to frontend
├── scripts/
│   └── init-letsencrypt.sh      ← one-time SSL cert setup (run on VPS)
├── frontend/                    ← Next.js personal website
│   ├── Dockerfile               ← multi-stage: development / deps / builder / runner
│   ├── src/
│   └── public/
└── (backend/, admin/ — planned)
```

## Commands

### Root (Docker via Makefile)

| Command | Description |
|---------|-------------|
| `make dev` | Start dev environment (hot reload on :3000) |
| `make dev-build` | Rebuild dev image and start |
| `make dev-down` | Stop dev environment |
| `make dev-logs` | Tail dev logs |
| `make prod` | Start production (detached) |
| `make prod-build` | Rebuild prod images and start |
| `make prod-down` | Stop production |
| `make prod-logs` | Tail prod logs |
| `make prod-restart s=frontend` | Restart a single service |
| `make ssl-init` | Obtain first Let's Encrypt cert (run once on VPS) |
| `make ssl-renew` | Force immediate cert renewal |
| `make help` | List all commands |

Without Makefile:

```bash
# Dev
docker compose up

# Prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Frontend (`cd frontend/`)

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`

No test framework is configured.

## Environments

### Development

- Dockerfile stage: `development`
- Source code bind-mounted into container (`./frontend/src`, `./frontend/public`)
- `node_modules` isolated inside container via anonymous volume
- `WATCHPACK_POLLING=true` for reliable hot reload on Linux
- Env vars from `.env.dev` (committed to git, no secrets)

### Production

- Dockerfile stage: `runner` (standalone Next.js output)
- Frontend binds only to `127.0.0.1:3000` — not publicly reachable
- Nginx reverse proxy on ports 80/443
- Let's Encrypt SSL via Certbot (auto-renewal loop every 12h)
- Env vars from `.env.prod` (gitignored, lives only on VPS)

### First-time VPS setup

1. Fill in `.env.prod` (copy from `.env.example`, set `DOMAIN`, `CERTBOT_EMAIL`, etc.)
2. Replace `yourdomain.com` in `nginx/conf.d/app.conf` with actual domain
3. Ensure DNS A record → VPS IP, ports 80 and 443 open
4. Run `make ssl-init` — obtains first certificate
5. Run `make prod` — starts all services

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

### Environment variables

**Strict rule:** All env vars live in root `.env.dev` (dev) or `.env.prod` (prod) only. Never create `.env` files inside `frontend/`, `backend/`, or any other service directory. Docker Compose passes them via `env_file` in the compose files. See `.env.example` for all available variables.

- `.env.dev` — committed to git, safe defaults, no secrets
- `.env.prod` — gitignored, lives only on VPS, contains real secrets
- `.env.example` — template documenting all variables

### Deployment

`frontend/next.config.ts` sets `output: "standalone"`. Docker uses multi-stage build (Node 22 Alpine). The Dockerfile has four stages:

- `development` — hot reload dev (used by `docker-compose.override.yml`)
- `deps` — installs all dependencies
- `builder` — runs `pnpm build`
- `runner` — production image (used by `docker-compose.prod.yml`)

Site URL from `NEXT_PUBLIC_SITE_URL` env var.

### Key dependencies

- `cobe` — WebGL globe on the homepage
- Package manager: **pnpm**
