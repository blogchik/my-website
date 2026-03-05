"""
Rate limiting configuration via SlowAPI.

Two tiers:
  - Global default: 100 requests per 15 minutes per IP
  - Contact endpoint: 5 requests per hour per IP (stricter, anti-spam)
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/15minutes"],
    storage_uri="memory://",
)
