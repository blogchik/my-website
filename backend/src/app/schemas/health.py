"""
Pydantic schemas for the health endpoint.
"""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    uptime: float
    timestamp: str
    database: str  # "connected" | "disconnected"
    environment: str
