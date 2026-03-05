"""
Application configuration — loads and validates environment variables via Pydantic Settings.

All env vars come from root .env.dev (dev) or .env.prod (prod).
Never create .env files inside this directory.
"""

from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=None,  # Env vars are injected by Docker Compose — not read from .env files
        case_sensitive=False,
    )

    # ── App ────────────────────────────────────────────────
    environment: Literal["development", "production"] = "development"
    port: int = 4000
    debug: bool = False

    # ── Database ───────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://dev:devpass@db:5432/mywebsite"

    @property
    def async_database_url(self) -> str:
        """Ensure the URL uses the asyncpg driver (auto-convert from standard postgresql://)."""
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # ── CORS ───────────────────────────────────────────────
    cors_origin: str = "http://localhost:3000"

    # ── Trusted hosts ──────────────────────────────────────
    api_domain: str = "localhost"

    # ── Email (Resend) ─────────────────────────────────────
    resend_api_key: str = ""
    contact_email_to: str = "blogchikuz@gmail.com"
    contact_email_from: str = "onboarding@resend.dev"

    # ── Admin / Auth ─────────────────────────────────────
    admin_github_id: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    jwt_secret: str = "dev-secret-change-in-prod"
    jwt_access_expire_minutes: int = 15
    jwt_refresh_expire_days: int = 7
    admin_cors_origin: str = "http://localhost:3001"

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.environment == "production":
            if self.jwt_secret == "dev-secret-change-in-prod" or len(self.jwt_secret) < 32:
                raise ValueError("JWT_SECRET must be a strong secret in production (min 32 chars)")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in self.cors_origin.split(",")]

    @property
    def admin_cors_origins(self) -> list[str]:
        """Parse comma-separated admin CORS origins."""
        return [origin.strip() for origin in self.admin_cors_origin.split(",") if origin.strip()]

    @property
    def allowed_hosts(self) -> list[str]:
        """Hosts allowed by TrustedHostMiddleware (production only)."""
        return [self.api_domain]


@lru_cache
def get_settings() -> Settings:
    return Settings()
