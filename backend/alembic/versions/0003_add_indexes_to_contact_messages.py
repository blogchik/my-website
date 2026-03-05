"""add indexes to contact_messages

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-05

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index("ix_contact_messages_created_at", "contact_messages", ["created_at"])
    op.create_index("ix_contact_messages_read_at", "contact_messages", ["read_at"])


def downgrade() -> None:
    op.drop_index("ix_contact_messages_read_at", table_name="contact_messages")
    op.drop_index("ix_contact_messages_created_at", table_name="contact_messages")
