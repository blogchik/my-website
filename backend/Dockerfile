# ── Base ─────────────────────────────────────────────────────────────────────
# Python 3.12 slim (not Alpine — better compatibility with C extensions)
FROM python:3.12-slim AS base

# Install uv (fast Python package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# System dependencies for asyncpg (PostgreSQL async driver)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Development ──────────────────────────────────────────────────────────────
FROM base AS development

# Copy project metadata first (better layer caching)
COPY pyproject.toml uv.lock* ./

# Install all dependencies (including dev)
RUN uv sync --frozen 2>/dev/null || uv sync

# Copy Alembic config (needed for migrations in dev)
COPY alembic.ini ./
COPY alembic/ ./alembic/

EXPOSE 4000
ENV PORT=4000

# ── Dependencies (production only) ──────────────────────────────────────────
FROM base AS deps

COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev 2>/dev/null || uv sync --no-dev

# ── Production ───────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runner

# Install wget for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN groupadd --system --gid 1001 appgroup \
    && useradd --system --uid 1001 --gid appgroup appuser

# Copy uv and virtual environment from deps stage
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
COPY --from=deps /app/.venv /app/.venv

# Copy application code
COPY alembic.ini ./
COPY alembic/ ./alembic/
COPY src/ ./src/

# Ensure venv is on PATH
ENV PATH="/app/.venv/bin:$PATH"

USER appuser

EXPOSE 4000
ENV PORT=4000

CMD ["sh", "-c", "python -m alembic upgrade head && python -m uvicorn src.app.main:app --host 0.0.0.0 --port 4000 --workers 2"]
