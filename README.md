# abduroziq.uz

Personal portfolio website with a FastAPI backend, a private admin panel, and a Tools Hub — monorepo managed with Docker Compose and deployed via Dokploy.

**Live:** [abduroziq.uz](https://abduroziq.uz) · **API:** [api.abduroziq.uz](https://api.abduroziq.uz) · **Admin:** [admin.abduroziq.uz](https://admin.abduroziq.uz) · **Tools:** [abduroziq.uz/tools](https://abduroziq.uz/tools)

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
├── docker-compose.yml           ← base config (shared between dev/prod)
├── docker-compose.override.yml  ← dev overrides (auto-loaded)
├── docker-compose.prod.yml      ← prod overrides (Nginx + Certbot)
├── Makefile                     ← convenience commands
├── .env.dev                     ← dev env vars (committed, no secrets)
├── .env.example                 ← template for .env.prod
├── nginx/conf.d/app.conf        ← HTTP→HTTPS, routing for all subdomains
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
| API Docs (dev only) | http://localhost:4000/docs |
| PostgreSQL | localhost:5432 |

Hot reload is enabled for all three services (Next.js dev server + uvicorn `--reload`).

### Useful commands

```bash
make dev          # Start dev environment
make dev-build    # Rebuild images and start
make dev-down     # Stop all services
make dev-logs     # Tail all logs

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

> `/docs` and `/redoc` are available in **development only** — disabled in production.

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

## Tools Hub

Free, browser-based developer utilities at [abduroziq.uz/tools](https://abduroziq.uz/tools). All tools run entirely client-side — no data is sent to any server.

| Tool | Slug | Category |
|------|------|----------|
| UUID Generator | `uuid-generator` | Generators |
| Password Generator | `password-generator` | Generators |
| Hash Generator | `hash-generator` | Generators |
| Lorem Ipsum Generator | `lorem-ipsum-generator` | Generators |
| Slug Generator | `slug-generator` | Generators |
| NanoID Generator | `nanoid-generator` | Generators |
| JSON Formatter | `json-formatter` | Text Processing |
| Base64 Encoder / Decoder | `base64` | Text Processing |
| Character Counter | `character-counter` | Text Processing |
| XML Formatter | `xml-formatter` | Text Processing |
| Diff Checker | `diff-checker` | Text Processing |
| Case Converter | `case-converter` | Text Processing |
| Regex Tester | `regex-tester` | Text Processing |
| Markdown Previewer | `markdown-previewer` | Text Processing |
| JWT Decoder | `jwt-decoder` | Encoders / Decoders |
| URL Encoder / Decoder | `url-encode-decode` | Encoders / Decoders |
| JSON ↔ YAML Converter | `json-yaml` | Converters |
| Timestamp Converter | `timestamp-converter` | Converters |
| JSON ↔ CSV Converter | `json-csv` | Converters |
| Query String Parser | `query-string-parser` | Web & API |
| HTTP Status Codes | `http-status-codes` | Web & API |
| Curl Builder | `curl-builder` | Web & API |
| Webhook Tester | `webhook-tester` | Web & API |
| API Playground | `api-playground` | Web & API |
| Open Graph Preview | `og-meta-preview` | Web & API |
| Robots.txt Validator | `robots-txt-validator` | Web & API |
| Color Converter | `color-converter` | CSS & Design |
| CSS Shadow Generator | `css-shadow-generator` | CSS & Design |
| Image Compressor | `image-compressor` | Media |
| Cron Expression Helper | `cron-parser` | DevOps |
| Date & Timezone Helper | `date-timezone` | DevOps |
| Tech Stack Snippets | `snippet-vault` | DevOps |
| LLM Pricing Compare | `llm-pricing` | DevOps |

To add a new tool, see [CLAUDE.md](CLAUDE.md#tools-hub-architecture).

---

## Environment variables

All variables live in the root `.env.dev` (dev) or `.env.prod` (prod). **Never** create `.env` files inside `frontend/`, `admin/`, or `backend/`.

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
4. **Deploy** — backend deployed first, health-checked, then frontend + admin

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
2. Add backend environment variables in the Dokploy **Environment** tab
3. Add DNS A records: `abduroziq.uz`, `admin.abduroziq.uz`, `api.abduroziq.uz` → VPS IP
4. Push to `main` — GitHub Actions builds and deploys automatically

---

## Self-hosted (Docker Compose + Nginx)

Alternative to Dokploy for VPS with direct SSH access:

```bash
cp .env.example .env.prod
# edit .env.prod — set DOMAIN, CERTBOT_EMAIL, DATABASE_URL, etc.

sed -i 's/yourdomain.com/abduroziq.uz/g' nginx/conf.d/app.conf

make ssl-init   # obtain first SSL certificate (one-time)
make prod       # start production
```

---

## License

Apache 2.0 — see [LICENSE](LICENSE)
