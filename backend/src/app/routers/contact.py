"""
Contact form endpoint — POST /api/contact

Validates input, saves to database, and sends notification email via Resend.
Stricter rate limit: 5 requests per hour per IP to prevent spam.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.database import get_db
from src.app.middleware.rate_limiter import limiter
from src.app.models.contact import ContactMessage
from src.app.schemas.contact import ContactRequest, ContactResponse
from src.app.services.email import send_contact_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["contact"])


@router.post("/contact", response_model=ContactResponse, status_code=201)
@limiter.limit("5/hour")
async def submit_contact(
    request: Request,
    data: ContactRequest,
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    """
    Handle contact form submission.

    1. Validate input (Pydantic schema)
    2. Save to database
    3. Send notification email via Resend
    4. Return success response
    """
    # Save to database
    contact = ContactMessage(
        name=data.name,
        email=data.email,
        message=data.message,
    )
    db.add(contact)
    await db.flush()  # Get the ID before commit

    logger.info("Contact message saved: id=%s from=%s <%s>", contact.id, data.name, data.email)

    # Send email notification (non-blocking — failure doesn't reject the request)
    email_sent = await send_contact_email(
        name=data.name,
        email=data.email,
        message=data.message,
    )

    if email_sent:
        contact.sent_at = datetime.now(timezone.utc)

    return ContactResponse(
        success=True,
        message="Message sent successfully" if email_sent else "Message received (email delivery pending)",
    )
