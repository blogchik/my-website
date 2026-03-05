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
│   └── conf.d/app.conf          ← HTTP→HTTPS redirect, proxy frontend + api subdomain
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
├── admin/                       ← Next.js admin panel (GitHub OAuth)
│   ├── Dockerfile               ← multi-stage: development / deps / builder / runner
│   ├── src/
│   └── public/
└── (future services)
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
| `make admin-logs` | Tail admin panel logs |
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

### Admin (`cd admin/`)

- **Dev server:** `pnpm dev` (port 3001)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`

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
- **Admin app** → `ghcr.io/<owner>/my-website-admin` → Dokploy application
- **Backend app** → `ghcr.io/<owner>/my-website-backend` → Dokploy application
- **PostgreSQL** → Dokploy built-in database service
- Traefik (Dokploy) handles SSL + routing

**CI/CD flow:** `push to main` → lint all three → security scan → build & push images → trigger Dokploy webhooks

**GitHub Secrets required:**

| Secret | Description |
|--------|-------------|
| `ENV_PROD` | Full `.env.prod` contents (backend env vars included) |
| `DOKPLOY_WEBHOOK_FRONTEND` | Dokploy webhook URL for frontend app |
| `DOKPLOY_WEBHOOK_ADMIN` | Dokploy webhook URL for admin app |
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

**Frontend env vars (build args via `ENV_PROD` secret):**

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://abduroziq.uz` |
| `NEXT_PUBLIC_API_URL` | `https://api.abduroziq.uz` |

**Frontend → Backend:** Client-side `fetch()` calls `NEXT_PUBLIC_API_URL` directly (baked at build time). No server-side proxy. CORS on the backend allows the frontend origin.

**Backend domain:** Dokploy routes `api.abduroziq.uz` → backend container via Traefik. Add `api.abduroziq.uz` as the domain in Dokploy backend app settings.

### First-time VPS setup (Docker Compose — alternative to Dokploy)

1. Fill in `.env.prod` (copy from `.env.example`, set `DOMAIN`, `CERTBOT_EMAIL`, etc.)
2. Replace `yourdomain.com` in `nginx/conf.d/app.conf` with actual domain
3. Ensure DNS A records for both `yourdomain.com` and `api.yourdomain.com` → VPS IP, ports 80 and 443 open
4. Run `make ssl-init` — obtains first certificate (must cover both domains)
5. Run `make prod` — starts all services

## Frontend architecture

Personal portfolio for Jabborov Abduroziq. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

- `frontend/src/app/` — App Router pages: home, `/about`, `/blog`, `/contact`, `/projects`, `/tools`
- `frontend/src/app/tools/` — Tools Hub listing page + individual tool pages (`/tools/[slug]`)
- `frontend/src/components/` — Shared components (header, footer, globe, custom-cursor, navigation-menu, project-card, contact-form, tool-card)
- `frontend/src/components/icons/` — SVG icon components
- `frontend/src/lib/constants.ts` — Social links
- `frontend/src/lib/tools.ts` — Tools registry (data, types, `toolsByCategory()` helper)
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

## Tools Hub architecture

A collection of free, browser-based developer utilities living under `/tools`. Each tool has its own playground page at `/tools/[slug]`.

### Adding a new tool

1. **Register** the tool in `frontend/src/lib/tools.ts` — add an entry to the `tools` array. If the tool belongs to a new category, add the category to the `categories` tuple first.
2. **Create the page** at `frontend/src/app/tools/<slug>/page.tsx` (server component with metadata) and a companion client component for the interactive playground.
3. Optionally add a **21 : 9 banner image** to `frontend/public/tools/<slug>/banner.webp` and set the `banner` field.

### Common fields per tool

Every tool entry in the registry has:

| Field | Type | Description |
|-------|------|-------------|
| `slug` | `string` | URL segment (`/tools/<slug>`) |
| `name` | `string` | Display name on card & page |
| `description` | `string` | Short one-liner for the card |
| `icon` | `string` | Emoji shown when no banner exists |
| `category` | `Category` | Grouping key (e.g. "Generators") |
| `banner` | `string \| null` | Path to 21 : 9 banner image in `/public` |
| `seo.title` | `string` | Custom `<title>` optimised for search (~60 chars) |
| `seo.description` | `string` | Meta description optimised for CTR (150-160 chars) |
| `seo.keywords` | `string[]` | Relevant search terms for the tool |
| `seo.canonical` | `string?` | Override canonical URL (defaults to `/tools/<slug>`) |

Each tool page also includes **JSON-LD structured data** (`WebApplication` schema) for rich search results.

### Tool playground conventions

Each tool page consists of **common sections** (present on every tool) plus **tool-specific playground controls**:

**Common sections:**
- Breadcrumb navigation (Tools Hub → Tool Name)
- Title, description
- Banner image area (21 : 9 aspect ratio)

**Tool-specific playground (varies per tool):**
- Interactive controls (inputs, selects, buttons)
- Result area with one-click copy
- Recent results history (persisted via cookie)
- Structural / educational info about the tool's domain
- "Where is this useful" quick reference

### Current tools

| Tool | Slug | Category |
|------|------|----------|
| UUID Generator | `uuid-generator` | Generators |
| Password Generator | `password-generator` | Generators |
| Hash Generator | `hash-generator` | Generators |
| JSON Formatter | `json-formatter` | Text Processing |
| Base64 Encoder / Decoder | `base64` | Text Processing |
| JSON ↔ YAML Converter | `json-yaml` | Text Processing |

### Files

```
frontend/src/
├── lib/tools.ts                         ← tool registry & types
├── components/tool-card.tsx              ← card shown on /tools listing
└── app/tools/
    ├── page.tsx                          ← /tools listing (server component)
    ├── uuid-generator/
    │   ├── page.tsx                      ← /tools/uuid-generator (metadata + layout)
    │   └── uuid-playground.tsx           ← interactive client component
    ├── password-generator/
    │   ├── page.tsx                      ← /tools/password-generator (metadata + layout)
    │   └── password-playground.tsx       ← interactive client component
    └── hash-generator/
        ├── page.tsx                      ← /tools/hash-generator (metadata + layout)
        └── hash-playground.tsx           ← interactive client component (MD5 pure-JS + Web Crypto SHA)
    └── json-formatter/
        ├── page.tsx                      ← /tools/json-formatter (metadata + layout)
        └── json-playground.tsx           ← interactive client component (parse, format, sort keys, highlight)
    └── base64/
        ├── page.tsx                      ← /tools/base64 (metadata + layout)
        └── base64-playground.tsx         ← interactive client component (encode/decode, switch, copy)
    └── json-yaml/
        ├── page.tsx                      ← /tools/json-yaml (metadata + layout)
        └── yaml-playground.tsx           ← interactive client component (js-yaml, direction, indent, sort)
```

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
| `GET` | `/docs` | Swagger UI (available in all environments) |
| `GET` | `/redoc` | ReDoc (available in all environments) |

All endpoints are served from `api.abduroziq.uz` (production) or `localhost:4000` (dev).

### Security

- **CORS:** `CORS_ORIGIN` (frontend) + `ADMIN_CORS_ORIGIN` (admin panel) allowed
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
- `runner` — non-root user, `uvicorn` with 2 workers (used by `docker-compose.prod.yml`)

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

## Admin architecture

Admin panel for abduroziq.uz. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Dark theme (navy bg).

- `admin/src/app/` — App Router pages: login, callback, dashboard, contacts
- `admin/src/components/` — Shared components (sidebar, status-badge, pagination, loading-skeleton)
- `admin/src/lib/auth.ts` — GitHub OAuth helpers, token management (sessionStorage)
- `admin/src/lib/api.ts` — API client with auto token refresh on 401

### Auth flow

1. User clicks "Sign in with GitHub" → redirects to GitHub OAuth
2. GitHub redirects to `/callback` with code
3. Frontend sends code to `POST /admin/auth/github/callback`
4. Backend validates GitHub user ID matches `ADMIN_GITHUB_ID`
5. Backend issues JWT access token (response body) + refresh token (HttpOnly cookie)
6. Frontend stores access token in `sessionStorage`

### Design

- **Dark theme:** navy (#000022) background, white text, orange (#E28413) accents
- **Font:** IBM Plex Mono (monospace throughout)
- **Animations:** fade-up, fade-in, scale-in, slide-right

### Deployment

Same pattern as frontend: Next.js standalone output, multi-stage Docker build, port 3001.
Accessed via `admin.abduroziq.uz` (Dokploy/Traefik routes to admin container).

### Import alias

`@/` maps to `admin/src/` (configured in `admin/tsconfig.json`).

### Key dependencies

Same as frontend: Next.js 16, React 19, Tailwind v4. Package manager: **pnpm**
