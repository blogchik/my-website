"""
FastAPI application — entry point.

Configures middleware (CORS, rate limiting, trusted hosts),
registers routers, and handles application lifecycle (startup/shutdown).
"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from src.app.config import get_settings
from src.app.database import async_session, engine
from src.app.middleware.rate_limiter import limiter
from src.app.routers import contact, health

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Configure logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — runs on startup and shutdown."""
    # Startup
    logger.info("Starting backend server (env=%s, port=%s)", settings.environment, settings.port)

    # Verify database connection
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        logger.info("Database connection verified")
    except Exception:
        logger.exception("Failed to connect to database — server starting in degraded mode")

    yield

    # Shutdown
    logger.info("Shutting down backend server")
    await engine.dispose()
    logger.info("Database connections closed")


# ── Create FastAPI app ─────────────────────────────────────────────────────
app = FastAPI(
    title="abduroziq.uz API",
    description="Backend API for personal portfolio website",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── Rate limiter ───────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Trusted hosts (production only) ───────────────────────────────────────
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts,
    )

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(contact.router)


# ── Global exception handler ──────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
