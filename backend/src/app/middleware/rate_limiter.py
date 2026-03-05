"""
Rate limiting configuration via SlowAPI.

Two tiers:
  - Global default: 100 requests per 15 minutes per IP
  - Contact endpoint: 5 requests per hour per IP (stricter, anti-spam)
"""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_real_ip(request: Request) -> str:
    """Extract the real client IP from proxy headers set by Nginx/Traefik."""
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(
    key_func=get_real_ip,
    default_limits=["100/15minutes"],
    storage_uri="memory://",
)
