"""
Email service — sends contact form notifications via Resend SDK.

In development (no API key), messages are logged instead of sent.
"""

import logging

import resend

from src.app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_contact_email(name: str, email: str, message: str) -> bool:
    """
    Send a contact form notification email.

    Returns True if the email was sent (or skipped in dev), False on failure.
    """
    if not settings.resend_api_key:
        logger.info(
            "[Email SKIPPED — no API key] From: %s <%s> | Message: %s",
            name,
            email,
            message[:100],
        )
        return False

    resend.api_key = settings.resend_api_key

    try:
        resend.Emails.send(
            {
                "from": settings.contact_email_from,
                "to": [settings.contact_email_to],
                "subject": f"New contact from {name}",
                "reply_to": email,
                "html": _build_email_html(name, email, message),
            }
        )
        logger.info("Contact email sent for %s <%s>", name, email)
        return True
    except Exception:
        logger.exception("Failed to send contact email for %s <%s>", name, email)
        return False


def _build_email_html(name: str, email: str, message: str) -> str:
    """Build a simple HTML email body for contact form submissions."""
    return f"""
    <div style="font-family: 'IBM Plex Mono', monospace; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000022;">New Contact Form Submission</h2>
        <hr style="border: 1px solid #E28413;" />
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">
{message}
        </div>
        <hr style="border: 1px solid #eee; margin-top: 32px;" />
        <p style="color: #999; font-size: 12px;">Sent from abduroziq.com contact form</p>
    </div>
    """
