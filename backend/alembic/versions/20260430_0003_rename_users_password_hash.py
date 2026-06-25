"""Rename legacy users.passwordHash to password_hash (PostgreSQL).

Revision ID: 20260430_0003
Revises: 20260430_0002
Create Date: 2026-04-30

Idempotent: no-op if password_hash already exists.
Safe for production: RENAME preserves data; does not DROP columns.
"""

from __future__ import annotations

from alembic import op
from sqlalchemy import inspect, text

revision = "20260430_0003"
down_revision = "20260430_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    insp = inspect(bind)
    col_names = [c["name"] for c in insp.get_columns("users")]
    if "password_hash" in col_names:
        return

    # Legacy camelCase column (quoted identifier in PostgreSQL).
    if "passwordHash" in col_names:
        op.execute(text('ALTER TABLE users RENAME COLUMN "passwordHash" TO password_hash'))
        return

    # Rare: unquoted creation folded to lowercase.
    if "passwordhash" in col_names:
        op.execute(text("ALTER TABLE users RENAME COLUMN passwordhash TO password_hash"))


def downgrade() -> None:
    """No-op: reversing could break DBs that always had password_hash from 20260430_0001."""
    pass
