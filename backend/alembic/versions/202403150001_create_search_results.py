"""create search results table

Revision ID: 202403150001
Revises:
Create Date: 2024-03-15 00:01:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202403150001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "search_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("input_term", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="completed"),
        sa.Column("result_payload", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("search_results")
