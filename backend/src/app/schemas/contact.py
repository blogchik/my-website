"""
Pydantic schemas for the contact endpoint.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ContactRequest(BaseModel):
    """Incoming contact form submission."""

    name: str = Field(min_length=2, max_length=100, description="Sender's name")
    email: EmailStr = Field(description="Sender's email address")
    message: str = Field(min_length=10, max_length=2000, description="Message body")


class ContactResponse(BaseModel):
    """Successful contact submission response."""

    success: bool = True
    message: str = "Message sent successfully"


class ContactMessageOut(BaseModel):
    """Full contact message representation (for admin use)."""

    model_config = {"from_attributes": True}

    id: UUID
    name: str
    email: str
    message: str
    created_at: datetime
    sent_at: datetime | None = None
