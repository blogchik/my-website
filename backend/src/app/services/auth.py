"""
Admin authentication service — GitHub OAuth + JWT tokens.

Security model:
- Access token (short-lived, 15min) returned in response body, stored in sessionStorage
- Refresh token (long-lived, 7 days) set as HttpOnly Secure SameSite=Strict cookie
- Bearer header for API calls → inherently CSRF-immune
"""

import uuid
from datetime import UTC, datetime, timedelta

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.app.config import get_settings

settings = get_settings()

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"

security = HTTPBearer()


async def exchange_github_code(code: str) -> dict:
    """Exchange GitHub OAuth authorization code for user profile.

    Returns dict with 'id', 'login', 'name', 'avatar_url'.
    Raises HTTPException 401 if exchange fails.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Exchange code for access token
        token_response = await client.post(
            GITHUB_TOKEN_URL,
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to exchange GitHub authorization code",
            )

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=token_data.get("error_description", "GitHub OAuth failed"),
            )

        # Fetch user profile
        user_response = await client.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to fetch GitHub user profile",
            )

        user_data = user_response.json()
        return {
            "id": str(user_data["id"]),
            "login": user_data.get("login", ""),
            "name": user_data.get("name", ""),
            "avatar_url": user_data.get("avatar_url", ""),
        }


def is_admin_user(github_id: str) -> bool:
    """Check if the GitHub user ID matches the configured admin."""
    return str(github_id) == settings.admin_github_id


def create_access_token(github_id: str, github_login: str) -> str:
    """Create a short-lived JWT access token."""
    now = datetime.now(UTC)
    payload = {
        "sub": github_id,
        "login": github_login,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_access_expire_minutes),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(github_id: str) -> str:
    """Create a long-lived JWT refresh token."""
    now = datetime.now(UTC)
    payload = {
        "sub": github_id,
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=settings.jwt_refresh_expire_days),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def verify_token(token: str, expected_type: str) -> dict:
    """Decode and verify a JWT token.

    Raises HTTPException 401 on expired, invalid, or wrong-type tokens.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from err
    except jwt.InvalidTokenError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from err

    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    return payload


async def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),  # noqa: B008
) -> dict:
    """FastAPI dependency — verify Bearer access token and return payload."""
    return verify_token(credentials.credentials, "access")
