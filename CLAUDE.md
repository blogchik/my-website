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
│   └── conf.d/app.conf          ← HTTP→HTTPS redirect, proxy main + api
├── scripts/
│   └── init-letsencrypt.sh      ← one-time SSL cert setup (run on VPS)
├── frontend/                    ← Next.js public website (ShadCN UI, RTL)
│   ├── Dockerfile               ← multi-stage: development / deps / builder / runner
│   ├── components.json          ← ShadCN UI configuration
│   ├── app/                     ← App Router pages
│   ├── components/              ← UI components (ShadCN + custom)
│   ├── lib/                     ← Utilities (cn, etc.)
│   └── public/
├── backend/                     ← FastAPI REST API
│   ├── Dockerfile               ← multi-stage: development / deps / runner
│   ├── pyproject.toml           ← uv project config + dependencies
│   ├── alembic.ini              ← Alembic migration config
│   ├── alembic/                 ← migration scripts
│   └── src/app/                 ← FastAPI application code
└── (future services)
```

## Commands

### Root (Docker via Makefile)

| Command | Description |
|---------|-------------|
| `make dev` | Start dev environment |
| `make dev-build` | Rebuild dev image and start |
| `make dev-down` | Stop dev environment |
| `make dev-logs` | Tail dev logs |
| `make prod` | Start production (detached) |
| `make prod-build` | Rebuild prod images and start |
| `make prod-down` | Stop production |
| `make prod-logs` | Tail prod logs |
| `make prod-restart s=backend` | Restart a single service |
| `make ssl-init` | Obtain first Let's Encrypt cert (run once on VPS) |
| `make ssl-renew` | Force immediate cert renewal |
| `make db-migrate` | Run pending Alembic migrations |
| `make db-revision m="..."` | Create new Alembic migration |
| `make db-shell` | Open PostgreSQL shell |
| `make frontend-logs` | Tail frontend logs |
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

- **Dev server:** `pnpm dev` (port 3000)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Type check:** `pnpm type-check`

Package manager: **pnpm**

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
- Source code bind-mounted into container
- `node_modules` isolated inside container via anonymous volume
- `WATCHPACK_POLLING=true` for reliable hot reload on Linux
- Env vars from `.env.dev` (committed to git, no secrets)

### Production

- Dockerfile stage: `runner` (standalone Next.js output)
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

**CI/CD flow:** `push to main` → lint frontend + backend → security scan → build & push images → trigger Dokploy webhooks

**GitHub Secrets required:**

| Secret | Description |
|--------|-------------|
| `ENV_PROD` | Full `.env.prod` contents (backend env vars included) |
| `DOKPLOY_WEBHOOK_FRONTEND` | Dokploy webhook URL for frontend app |
| `DOKPLOY_WEBHOOK_BACKEND` | Dokploy webhook URL for backend app |

**Backend env vars in Dokploy (Environment tab):**

| Variable | Example |
|----------|--------- |
| `DATABASE_URL` | `postgresql://user:pass@db-host:5432/mydb` (from Dokploy DB) |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` |
| `CORS_ORIGIN` | `https://abduroziq.uz` |
| `API_DOMAIN` | `api.abduroziq.uz` |
| `ENVIRONMENT` | `production` |
| `CONTACT_EMAIL_TO` | `hello@abduroziq.uz` |
| `CONTACT_EMAIL_FROM` | `noreply@abduroziq.uz` |

**Backend domain:** Dokploy routes `api.abduroziq.uz` → backend container via Traefik. Add `api.abduroziq.uz` as the domain in Dokploy backend app settings.

### First-time VPS setup (Docker Compose — alternative to Dokploy)

1. Fill in `.env.prod` (copy from `.env.example`, set `DOMAIN`, `CERTBOT_EMAIL`, etc.)
2. Replace `yourdomain.com` in `nginx/conf.d/app.conf` with actual domain
3. Ensure DNS A records for `yourdomain.com`, `www.yourdomain.com`, and `api.yourdomain.com` → VPS IP, ports 80 and 443 open
4. Run `make ssl-init` — obtains first certificate (must cover all domains)
5. Run `make prod` — starts all services

## Backend architecture

REST API for abduroziq.uz. Built with Python 3.12, FastAPI, SQLAlchemy (async), Alembic, and Pydantic.

- `backend/src/app/main.py` — FastAPI app entry point (middleware, routers, lifespan)
- `backend/src/app/config.py` — Pydantic Settings (validates env vars at startup)
- `backend/src/app/database.py` — Async SQLAlchemy engine + session factory
- `backend/src/app/models/` — SQLAlchemy ORM models (`ContactMessage`)
- `backend/src/app/schemas/` — Pydantic request/response schemas
- `backend/src/app/routers/` — API route handlers (`health`, `contact`, `admin`)
- `backend/src/app/services/` — Business logic (`email` via Resend SDK, `auth` for admin JWT/OAuth)
- `backend/src/app/middleware/` — Rate limiting via SlowAPI
- `backend/alembic/` — Database migration scripts

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check (DB connectivity, uptime) |
| `POST` | `/contact` | Contact form submission (rate limited: 5/hour) |
| `POST` | `/admin/auth/github/callback` | GitHub OAuth token exchange (rate limited: 10/hour) |
| `POST` | `/admin/auth/refresh` | Refresh JWT access token (rate limited: 30/hour) |
| `POST` | `/admin/auth/logout` | Clear refresh cookie (auth required) |
| `GET` | `/admin/auth/me` | Get current admin info (auth required) |
| `GET` | `/admin/health` | Health + message stats (auth required) |
| `GET` | `/admin/contacts` | Paginated contact list with search (auth required) |
| `GET` | `/admin/contacts/{id}` | Single contact message (auth required) |
| `PATCH` | `/admin/contacts/{id}` | Mark read/unread (auth required) |
| `GET` | `/docs` | Swagger UI (**dev only** — disabled in production) |
| `GET` | `/redoc` | ReDoc (**dev only** — disabled in production) |

All endpoints are served from `api.abduroziq.uz` (production) or `localhost:4000` (dev).

### Security

- **CORS:** `CORS_ORIGIN` + `ADMIN_CORS_ORIGIN` (admin panel) allowed
- **Rate limiting:** Global 100 req/15min; contact endpoint 5 req/hour per IP
- **Admin auth:** GitHub OAuth → JWT (HS256). Only `ADMIN_GITHUB_ID` allowed. Access token (15min) + HttpOnly refresh cookie (7d)
- **Trusted hosts:** `API_DOMAIN` enforced via `TrustedHostMiddleware` in production
- **Subdomain routing:** `api.abduroziq.uz` → backend (via Traefik/Nginx); backend not directly exposed

### Database

PostgreSQL 18, accessed via async SQLAlchemy + asyncpg driver. Alembic manages schema migrations.

### Deployment

Docker multi-stage build (`python:3.12-slim`). Three stages:

- `development` — full deps, `uvicorn --reload` (used by `docker-compose.override.yml`)
- `deps` — production deps only (`uv sync --no-dev`)
- `runner` — non-root user, `uvicorn` with 1 worker (used by `docker-compose.prod.yml`)

Backend port: 4000 (internal). Accessed via `api.abduroziq.uz` subdomain (Traefik/Nginx routes to `backend:4000`).

### Key dependencies

- `fastapi` — async web framework
- `sqlalchemy[asyncio]` + `asyncpg` — async PostgreSQL ORM
- `alembic` — database migrations
- `resend` — email notifications
- `slowapi` — rate limiting
- `pydantic-settings` — environment configuration
- `PyJWT` + `cryptography` — JWT token handling
- `httpx` — GitHub OAuth HTTP calls
- Package manager: **uv**

## Frontend architecture

Public-facing website at abduroziq.uz. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and ShadCN UI with RTL support.

- `frontend/app/` — App Router pages
- `frontend/components/ui/` — ShadCN UI components
- `frontend/lib/utils.ts` — ShadCN `cn()` utility (clsx + tailwind-merge)
- `frontend/components.json` — ShadCN configuration (radix-nova style, hugeicons)

### Deployment

Next.js standalone output, multi-stage Docker build, port 3000.
Served at `abduroziq.uz` (main domain). Nginx/Traefik routes main domain to frontend container.

### Import alias

`@/` maps to `frontend/` root (configured in `frontend/tsconfig.json`).

### Key dependencies

Next.js 16, React 19, Tailwind v4, ShadCN UI, Radix UI. Package manager: **pnpm**
