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
│   └── conf.d/app.conf          ← HTTP→HTTPS redirect, proxy to frontend + backend
├── scripts/
│   └── init-letsencrypt.sh      ← one-time SSL cert setup (run on VPS)
├── frontend/                    ← Next.js personal website
│   ├── Dockerfile               ← multi-stage: development / deps / builder / runner
│   ├── src/
│   └── public/
├── backend/                     ← FastAPI REST API
│   ├── Dockerfile               ← multi-stage: development / deps / runner
│   ├── pyproject.toml           ← uv project config + dependencies
│   ├── alembic.ini              ← Alembic migration config
│   ├── alembic/                 ← migration scripts
│   └── src/app/                 ← FastAPI application code
└── (admin/ — planned)
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
| `make db-migrate` | Run pending Alembic migrations |
| `make db-revision m="..."` | Create new Alembic migration |
| `make db-shell` | Open PostgreSQL shell |
| `make backend-logs` | Tail backend logs |
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

### Backend (`cd backend/`)

- **Dev server:** `uv run uvicorn src.app.main:app --reload --host 0.0.0.0 --port 4000`
- **Lint/Format:** `uv run ruff check .` / `uv run ruff format .`
- **Tests:** `uv run pytest`
- **Migrations:** `uv run alembic upgrade head`
- **New migration:** `uv run alembic revision --autogenerate -m "description"`

Package manager: **uv**

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

### Dokploy deployment (production)

CI/CD pipeline (GitHub Actions) builds Docker images and pushes to GHCR, then triggers Dokploy webhooks.

**Architecture:**
- **Frontend app** → `ghcr.io/<owner>/my-website-frontend` → Dokploy application
- **Backend app** → `ghcr.io/<owner>/my-website-backend` → Dokploy application
- **PostgreSQL** → Dokploy built-in database service
- Traefik (Dokploy) handles SSL + routing

**CI/CD flow:** `push to main` → lint both → security scan → build & push images → trigger Dokploy webhooks

**GitHub Secrets required:**

| Secret | Description |
|--------|-------------|
| `ENV_PROD` | Full `.env.prod` contents (backend env vars included) |
| `DOKPLOY_WEBHOOK_FRONTEND` | Dokploy webhook URL for frontend app |
| `DOKPLOY_WEBHOOK_BACKEND` | Dokploy webhook URL for backend app |

**Backend env vars in Dokploy (Environment tab):**

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@db-host:5432/mydb` (from Dokploy DB) |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` |
| `CORS_ORIGIN` | `https://abduroziq.com` |
| `ENVIRONMENT` | `production` |
| `CONTACT_EMAIL_TO` | `hello@abduroziq.com` |
| `CONTACT_EMAIL_FROM` | `noreply@abduroziq.com` |

**Frontend env vars (build args via `ENV_PROD` secret):**

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://abduroziq.com` |
| `BACKEND_URL` | `http://<backend-app-name>:4000` |

**Frontend → Backend proxy:** Next.js rewrites `/api/*` to `BACKEND_URL` (baked at build time). The `BACKEND_URL` must match the backend container name in Dokploy's internal network.

### First-time VPS setup (Docker Compose — alternative to Dokploy)

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

## Backend architecture

REST API for abduroziq.com. Built with Python 3.12, FastAPI, SQLAlchemy (async), Alembic, and Pydantic.

- `backend/src/app/main.py` — FastAPI app entry point (middleware, routers, lifespan)
- `backend/src/app/config.py` — Pydantic Settings (validates env vars at startup)
- `backend/src/app/database.py` — Async SQLAlchemy engine + session factory
- `backend/src/app/models/` — SQLAlchemy ORM models (`ContactMessage`)
- `backend/src/app/schemas/` — Pydantic request/response schemas
- `backend/src/app/routers/` — API route handlers (`health`, `contact`)
- `backend/src/app/services/` — Business logic (`email` via Resend SDK)
- `backend/src/app/middleware/` — Rate limiting via SlowAPI
- `backend/alembic/` — Database migration scripts

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (DB connectivity, uptime) |
| `POST` | `/api/contact` | Contact form submission (rate limited: 5/hour) |

### Security

- **CORS:** Only `CORS_ORIGIN` (frontend URL) is allowed
- **Rate limiting:** Global 100 req/15min; contact endpoint 5 req/hour per IP
- **Trusted hosts:** Enabled in production
- **Nginx proxy:** All `/api/` requests routed to backend; backend not publicly exposed

### Database

PostgreSQL 16, accessed via async SQLAlchemy + asyncpg driver. Alembic manages schema migrations.

### Deployment

Docker multi-stage build (`python:3.12-slim`). Three stages:

- `development` — full deps, `uvicorn --reload` (used by `docker-compose.override.yml`)
- `deps` — production deps only (`uv sync --no-dev`)
- `runner` — non-root user, `uvicorn` with 2 workers (used by `docker-compose.prod.yml`)

Backend port: 4000 (internal, not publicly exposed). Nginx proxies `/api/` to `backend:4000`.

### Key dependencies

- `fastapi` — async web framework
- `sqlalchemy[asyncio]` + `asyncpg` — async PostgreSQL ORM
- `alembic` — database migrations
- `resend` — email notifications
- `slowapi` — rate limiting
- `pydantic-settings` — environment configuration
- Package manager: **uv**
