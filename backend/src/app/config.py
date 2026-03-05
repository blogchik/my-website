"""
Application configuration — loads and validates environment variables via Pydantic Settings.

All env vars come from root .env.dev (dev) or .env.prod (prod).
Never create .env files inside this directory.
"""

from functools import lru_cache
from typing import Literal

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

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        return [origin.strip() for origin in self.cors_origin.split(",")]

    @property
    def allowed_hosts(self) -> list[str]:
        """Hosts allowed by TrustedHostMiddleware (production only)."""
        return [self.api_domain]


@lru_cache
def get_settings() -> Settings:
    return Settings()
