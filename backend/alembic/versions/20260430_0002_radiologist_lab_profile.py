"""Radiologist profile fields and lab logo_data_url.

Revision ID: 20260430_0002
Revises: 20260430_0001
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260430_0002"
down_revision = "20260430_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("radiologist_title", sa.String(length=200), nullable=True))
    op.add_column("users", sa.Column("radiologist_specialty", sa.String(length=255), nullable=True))
    op.add_column("lab_info", sa.Column("logo_data_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("lab_info", "logo_data_url")
    op.drop_column("users", "radiologist_specialty")
    op.drop_column("users", "radiologist_title")
