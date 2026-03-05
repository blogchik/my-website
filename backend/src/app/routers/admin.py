"""
Admin API endpoints — /admin/*

All endpoints except auth require a valid JWT access token.
Only the configured GitHub user (ADMIN_GITHUB_ID) can authenticate.
"""

import logging
import time
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.config import get_settings
from src.app.database import get_db
from src.app.middleware.rate_limiter import limiter
from src.app.models.contact import ContactMessage
from src.app.schemas.admin import (
    AdminTokenResponse,
    AdminUserInfo,
    ContactMessageListResponse,
    GitHubCallbackRequest,
    MarkReadRequest,
)
from src.app.schemas.contact import ContactMessageOut
from src.app.services.auth import (
    create_access_token,
    create_refresh_token,
    exchange_github_code,
    is_admin_user,
    require_admin,
    verify_token,
)

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/admin", tags=["admin"])

# Track server start time
_start_time = time.monotonic()


def _set_refresh_cookie(response: Response, token: str) -> None:
    """Set the refresh token as an HttpOnly secure cookie."""
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="strict",
        max_age=settings.jwt_refresh_expire_days * 86400,
        path="/admin/auth",
    )


# ── Auth endpoints ────────────────────────────────────────────────────────


@router.post("/auth/github/callback", response_model=AdminTokenResponse)
@limiter.limit("10/hour")
async def github_callback(
    request: Request,
    body: GitHubCallbackRequest,
    response: Response,
) -> AdminTokenResponse:
    """Exchange GitHub OAuth code for admin JWT tokens."""
    github_user = await exchange_github_code(body.code)

    if not is_admin_user(github_user["id"]):
        logger.warning(
            "Unauthorized admin login attempt from GitHub user: %s",
            github_user["login"],
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    access_token = create_access_token(github_user["id"], github_user["login"])
    refresh_token = create_refresh_token(github_user["id"])

    _set_refresh_cookie(response, refresh_token)

    logger.info("Admin login successful: %s", github_user["login"])

    return AdminTokenResponse(
        access_token=access_token,
        expires_in=settings.jwt_access_expire_minutes * 60,
    )


@router.post("/auth/refresh", response_model=AdminTokenResponse)
@limiter.limit("30/hour")
async def refresh_access_token(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None),  # noqa: B008
) -> AdminTokenResponse:
    """Issue a new access token using the refresh cookie."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token",
        )

    payload = verify_token(refresh_token, "refresh")

    if not is_admin_user(payload["sub"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    access_token = create_access_token(payload["sub"], payload.get("login", ""))

    return AdminTokenResponse(
        access_token=access_token,
        expires_in=settings.jwt_access_expire_minutes * 60,
    )


@router.post("/auth/logout")
async def logout(
    response: Response,
    _admin: dict = Depends(require_admin),  # noqa: B008
) -> dict:
    """Clear the refresh token cookie."""
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=settings.is_production,
        samesite="strict",
        path="/admin/auth",
    )
    return {"success": True}


@router.get("/auth/me", response_model=AdminUserInfo)
async def get_current_admin(
    admin: dict = Depends(require_admin),  # noqa: B008
) -> AdminUserInfo:
    """Get the currently authenticated admin's info."""
    return AdminUserInfo(
        github_id=admin["sub"],
        github_login=admin.get("login", ""),
        name=admin.get("name", ""),
        avatar_url=admin.get("avatar_url", ""),
    )


# ── Health endpoint ───────────────────────────────────────────────────────


@router.get("/health")
async def admin_health(
    _admin: dict = Depends(require_admin),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> dict:
    """Health check with additional admin stats."""
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    # Get message counts
    total_count = await db.scalar(select(func.count(ContactMessage.id)))
    unread_count = await db.scalar(
        select(func.count(ContactMessage.id)).where(ContactMessage.read_at.is_(None))
    )

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "uptime": round(time.monotonic() - _start_time, 2),
        "timestamp": datetime.now(UTC).isoformat(),
        "database": db_status,
        "environment": settings.environment,
        "message_count": total_count or 0,
        "unread_count": unread_count or 0,
    }


# ── Contact messages ──────────────────────────────────────────────────────


@router.get("/contacts", response_model=ContactMessageListResponse)
async def list_contacts(
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    search: str | None = Query(default=None, max_length=200),  # noqa: B008
    unread_only: bool = Query(default=False),  # noqa: B008
    _admin: dict = Depends(require_admin),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> ContactMessageListResponse:
    """List contact messages with pagination, search, and filtering."""
    query = select(ContactMessage)
    count_query = select(func.count(ContactMessage.id))

    if search:
        search_filter = ContactMessage.name.ilike(f"%{search}%") | ContactMessage.email.ilike(
            f"%{search}%"
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if unread_only:
        query = query.where(ContactMessage.read_at.is_(None))
        count_query = count_query.where(ContactMessage.read_at.is_(None))

    total = await db.scalar(count_query) or 0

    offset = (page - 1) * page_size
    query = query.order_by(ContactMessage.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    messages = result.scalars().all()

    return ContactMessageListResponse(
        items=[ContactMessageOut.model_validate(m) for m in messages],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/contacts/{contact_id}", response_model=ContactMessageOut)
async def get_contact(
    contact_id: UUID,
    _admin: dict = Depends(require_admin),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> ContactMessageOut:
    """Get a single contact message."""
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == contact_id))
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    return ContactMessageOut.model_validate(message)


@router.patch("/contacts/{contact_id}", response_model=ContactMessageOut)
async def update_contact(
    contact_id: UUID,
    body: MarkReadRequest,
    _admin: dict = Depends(require_admin),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> ContactMessageOut:
    """Mark a contact message as read or unread."""
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == contact_id))
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    message.read_at = datetime.now(UTC) if body.read else None
    await db.commit()
    await db.refresh(message)

    return ContactMessageOut.model_validate(message)
