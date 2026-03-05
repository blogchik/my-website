"""
Health check endpoint — GET /health

Used by Docker healthcheck and external monitoring.
Verifies database connectivity and reports server status.
"""

import time
from datetime import UTC, datetime

from fastapi import APIRouter, Request
from sqlalchemy import text

from src.app.config import get_settings
from src.app.database import async_session
from src.app.middleware.rate_limiter import limiter
from src.app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])
settings = get_settings()

# Track server start time for uptime calculation
_start_time = time.monotonic()


@router.get("/health", response_model=HealthResponse)
@limiter.limit("30/minute")
async def health_check(request: Request) -> HealthResponse:
    """
    Health check endpoint.

    Returns server status, uptime, and database connectivity.
    """
    db_status = "connected"

    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        uptime=round(time.monotonic() - _start_time, 2),
        timestamp=datetime.now(UTC).isoformat(),
        database=db_status,
        environment=settings.environment,
    )
