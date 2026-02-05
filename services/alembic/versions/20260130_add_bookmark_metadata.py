"""Add bookmark metadata fields

Revision ID: 20260130_add_bookmark_metadata
Revises: 
Create Date: 2026-01-30
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20260130_add_bookmark_metadata"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "bookmarks",
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
    )
    op.add_column(
        "bookmarks",
        sa.Column(
            "metadata_status",
            sa.String(length=32),
            nullable=False,
            server_default=sa.text("'ready'"),
        ),
    )
    op.add_column(
        "bookmarks",
        sa.Column("metadata_error", sa.Text(), nullable=True),
    )
    op.add_column(
        "bookmarks",
        sa.Column("metadata_updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "idx_bookmarks_metadata_status",
        "bookmarks",
        ["metadata_status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_bookmarks_metadata_status", table_name="bookmarks")
    op.drop_column("bookmarks", "metadata_updated_at")
    op.drop_column("bookmarks", "metadata_error")
    op.drop_column("bookmarks", "metadata_status")
    op.drop_column("bookmarks", "metadata")
