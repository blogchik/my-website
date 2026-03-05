# abduroziq.uz

Personal portfolio website with a FastAPI backend and a private admin panel — monorepo managed with Docker Compose and deployed via Dokploy.

**Live:** [abduroziq.uz](https://abduroziq.uz) · **API:** [api.abduroziq.uz](https://api.abduroziq.uz) · **Docs:** [api.abduroziq.uz/docs](https://api.abduroziq.uz/docs) · **Admin:** [admin.abduroziq.uz](https://admin.abduroziq.uz)

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Admin panel | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Python 3.12, FastAPI, SQLAlchemy (async), Alembic |
| Database | PostgreSQL 18 |
| Email | Resend |
| Auth | GitHub OAuth + JWT (HS256, access + refresh tokens) |
| Container | Docker, Docker Compose |
| Reverse proxy | Nginx + Let's Encrypt (self-hosted) / Traefik (Dokploy) |
| CI/CD | GitHub Actions → GHCR → Dokploy |

---

## Project structure

```
my-website/
├── docker-compose.yml           ← base config (shared)
├── docker-compose.override.yml  ← dev overrides (auto-loaded)
├── docker-compose.prod.yml      ← prod overrides (Nginx + Certbot)
├── Makefile                     ← convenience commands
├── .env.dev                     ← dev env vars (committed, no secrets)
├── .env.example                 ← template for .env.prod
├── nginx/conf.d/app.conf        ← HTTP→HTTPS, frontend + api.* routing
├── frontend/                    ← Next.js personal site (port 3000)
├── admin/                       ← Next.js admin panel (port 3001)
└── backend/                     ← FastAPI REST API (port 4000)
```

---

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose plugin
- [make](https://www.gnu.org/software/make/)

### Development

```bash
git clone https://github.com/blogchik/my-website.git
cd my-website
make dev
```

Services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Admin panel | http://localhost:3001 |
| Backend API | http://localhost:4000 |
| API Docs | http://localhost:4000/docs |
| PostgreSQL | localhost:5432 |

Hot reload is enabled for all three services (Next.js dev server + uvicorn `--reload`).

### Useful commands

```bash
make dev          # Start dev environment
make dev-build    # Rebuild images and start
make dev-down     # Stop all services
make dev-logs     # Tail logs

make db-migrate   # Run pending Alembic migrations
make db-revision m="description"  # Create new migration
make db-shell     # Open PostgreSQL shell
make backend-logs # Tail backend logs
make admin-logs   # Tail admin panel logs

make help         # List all available commands
```

---

## API

Base URL: `https://api.abduroziq.uz` (production) · `http://localhost:4000` (dev)

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — DB connectivity, uptime |
| `POST` | `/contact` | Contact form submission (rate limited: 5/hour) |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc |

### Admin (auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/auth/github/callback` | GitHub OAuth token exchange |
| `POST` | `/admin/auth/refresh` | Refresh JWT access token |
| `POST` | `/admin/auth/logout` | Clear refresh cookie |
| `GET` | `/admin/auth/me` | Get current admin info |
| `GET` | `/admin/health` | Health + message stats |
| `GET` | `/admin/contacts` | Paginated contact list with search |
| `GET` | `/admin/contacts/{id}` | Single contact message |
| `PATCH` | `/admin/contacts/{id}` | Mark message read/unread |

Rate limits: 100 req/15min global · 5/hour for `/contact` · 10/hour for OAuth · 30/hour for token refresh.

---

## Environment variables

All variables live in the root `.env.dev` (dev) or `.env.prod` (prod). **Never** create `.env` files inside `frontend/`, `admin/`, or `backend/`.

Copy `.env.example` to get started:

```bash
cp .env.example .env.prod
# fill in the values
```

Key variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Frontend public URL |
| `NEXT_PUBLIC_API_URL` | Backend API URL (baked into frontend/admin at build time) |
| `NEXT_PUBLIC_ADMIN_URL` | Admin panel public URL |
| `DATABASE_URL` | PostgreSQL async connection string |
| `CORS_ORIGIN` | Allowed frontend origin for backend CORS |
| `ADMIN_CORS_ORIGIN` | Allowed admin origin for backend CORS |
| `API_DOMAIN` | Hostname for `TrustedHostMiddleware` |
| `RESEND_API_KEY` | Resend API key for email notifications |
| `ENVIRONMENT` | `development` or `production` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID (backend) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret (backend) |
| `ADMIN_GITHUB_ID` | GitHub user ID of the authorized admin |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth App client ID (admin frontend) |
| `JWT_SECRET` | HS256 signing key — generate with `openssl rand -hex 64` |
| `JWT_ACCESS_EXPIRE_MINUTES` | Access token lifetime (default: 15) |
| `JWT_REFRESH_EXPIRE_DAYS` | Refresh token lifetime (default: 7) |

---

## Deployment (Dokploy)

CI/CD pipeline on every push to `main`:

1. **Lint** — frontend ESLint + tsc, admin ESLint + tsc, backend ruff — all in parallel
2. **Security scan** — Trivy vulnerability scanner
3. **Build & push** — Docker images to `ghcr.io/blogchik/my-website-{frontend,admin,backend}`
4. **Deploy** — Dokploy webhooks triggered for all three apps

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `ENV_PROD` | Full `.env.prod` contents |
| `DOKPLOY_WEBHOOK_FRONTEND` | Dokploy webhook URL for frontend |
| `DOKPLOY_WEBHOOK_ADMIN` | Dokploy webhook URL for admin panel |
| `DOKPLOY_WEBHOOK_BACKEND` | Dokploy webhook URL for backend |

### Dokploy setup

1. Create three applications in Dokploy:
   - **Frontend** → image `ghcr.io/blogchik/my-website-frontend:main`, domain `abduroziq.uz`
   - **Admin** → image `ghcr.io/blogchik/my-website-admin:main`, domain `admin.abduroziq.uz`
   - **Backend** → image `ghcr.io/blogchik/my-website-backend:main`, domain `api.abduroziq.uz`, port `4000`
2. Add [backend environment variables](#environment-variables) in the Dokploy **Environment** tab
3. Add DNS A records: `abduroziq.uz`, `admin.abduroziq.uz`, and `api.abduroziq.uz` → VPS IP
4. Push to `main` — GitHub Actions builds and deploys automatically

---

## Self-hosted (Docker Compose + Nginx)

Alternative to Dokploy for VPS with direct SSH access:

```bash
# 1. Fill in production env vars
cp .env.example .env.prod
# edit .env.prod — set DOMAIN, CERTBOT_EMAIL, DATABASE_URL, etc.

# 2. Replace yourdomain.com in nginx config
sed -i 's/yourdomain.com/abduroziq.uz/g' nginx/conf.d/app.conf

# 3. Obtain first SSL certificate (one-time)
make ssl-init

# 4. Start production
make prod
```

---

## License

Apache 2.0 — see [LICENSE](LICENSE)


---

## Project structure

```
my-website/
├── docker-compose.yml           ← base config (shared)
├── docker-compose.override.yml  ← dev overrides (auto-loaded)
├── docker-compose.prod.yml      ← prod overrides (Nginx + Certbot)
├── Makefile                     ← convenience commands
├── .env.dev                     ← dev env vars (committed, no secrets)
├── .env.example                 ← template for .env.prod
├── nginx/conf.d/app.conf        ← HTTP→HTTPS, frontend + api.* routing
├── frontend/                    ← Next.js app
└── backend/                     ← FastAPI app
```

---

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose plugin
- [make](https://www.gnu.org/software/make/)

### Development

```bash
git clone https://github.com/blogchik/my-website.git
cd my-website
make dev
```

Services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API Docs | http://localhost:4000/docs |
| PostgreSQL | localhost:5432 |

Hot reload is enabled for both frontend (Next.js) and backend (uvicorn `--reload`).

### Useful commands

```bash
make dev          # Start dev environment
make dev-build    # Rebuild images and start
make dev-down     # Stop all services
make dev-logs     # Tail logs

make db-migrate   # Run pending Alembic migrations
make db-shell     # Open PostgreSQL shell
make backend-logs # Tail backend logs

make help         # List all available commands
```

---

## API

Base URL: `https://api.abduroziq.uz` (production) · `http://localhost:4000` (dev)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — DB connectivity, uptime |
| `POST` | `/contact` | Contact form submission (rate limited: 5/hour) |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc |

---

## Environment variables

All variables live in the root `.env.dev` (dev) or `.env.prod` (prod). **Never** create `.env` files inside `frontend/` or `backend/`.

Copy `.env.example` to get started:

```bash
cp .env.example .env.prod
# fill in the values
```

Key variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Frontend public URL |
| `NEXT_PUBLIC_API_URL` | Backend public URL (baked into frontend at build time) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CORS_ORIGIN` | Allowed frontend origin for CORS |
| `API_DOMAIN` | Hostname for `TrustedHostMiddleware` |
| `RESEND_API_KEY` | Resend API key for email notifications |
| `ENVIRONMENT` | `development` or `production` |

---

## Deployment (Dokploy)

CI/CD pipeline on every push to `main`:

1. **Lint** — frontend (ESLint + tsc) and backend (ruff) in parallel
2. **Security scan** — Trivy vulnerability scanner
3. **Build & push** — Docker images to `ghcr.io/blogchik/my-website-{frontend,backend}`
4. **Deploy** — Dokploy webhooks triggered for both apps

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `ENV_PROD` | Full `.env.prod` contents |
| `DOKPLOY_WEBHOOK_FRONTEND` | Dokploy webhook URL for frontend |
| `DOKPLOY_WEBHOOK_BACKEND` | Dokploy webhook URL for backend |

### Dokploy setup

1. Create two applications in Dokploy:
   - **Frontend** → image `ghcr.io/blogchik/my-website-frontend:main`, domain `abduroziq.uz`
   - **Backend** → image `ghcr.io/blogchik/my-website-backend:main`, domain `api.abduroziq.uz`, port `4000`
2. Add [backend environment variables](#environment-variables) in the Dokploy **Environment** tab
3. Add DNS A records: `abduroziq.uz` and `api.abduroziq.uz` → VPS IP
4. Push to `main` — GitHub Actions builds and deploys automatically

---

## Self-hosted (Docker Compose + Nginx)

Alternative to Dokploy for VPS with direct SSH access:

```bash
# 1. Fill in production env vars
cp .env.example .env.prod
# edit .env.prod — set DOMAIN, CERTBOT_EMAIL, DATABASE_URL, etc.

# 2. Replace yourdomain.com in nginx config
sed -i 's/yourdomain.com/abduroziq.uz/g' nginx/conf.d/app.conf

# 3. Obtain first SSL certificate (one-time)
make ssl-init

# 4. Start production
make prod
```

---

## License

Apache 2.0 — see [LICENSE](LICENSE)
