"""
Pydantic schemas for admin endpoints.
"""

from pydantic import BaseModel, computed_field

from src.app.schemas.contact import ContactMessageOut


class GitHubCallbackRequest(BaseModel):
    """GitHub OAuth callback request."""

    code: str


class AdminTokenResponse(BaseModel):
    """JWT token response after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AdminUserInfo(BaseModel):
    """Authenticated admin user info."""

    github_id: str
    github_login: str
    name: str
    avatar_url: str


class ContactMessageListResponse(BaseModel):
    """Paginated list of contact messages."""

    items: list[ContactMessageOut]
    total: int
    page: int
    page_size: int

    @computed_field
    @property
    def total_pages(self) -> int:
        return (self.total + self.page_size - 1) // self.page_size


class MarkReadRequest(BaseModel):
    """Mark a contact message as read or unread."""

    read: bool = True
