"""add indexes to contact_messages

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-05

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Use IF NOT EXISTS to make the migration idempotent
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_contact_messages_created_at ON contact_messages (created_at)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_contact_messages_read_at ON contact_messages (read_at)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_contact_messages_read_at")
    op.execute("DROP INDEX IF EXISTS ix_contact_messages_created_at")
