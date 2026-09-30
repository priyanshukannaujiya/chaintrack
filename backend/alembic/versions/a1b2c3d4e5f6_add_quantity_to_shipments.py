"""Add quantity to shipments

Revision ID: a1b2c3d4e5f6
Revises: 3c8cf459ec67
Create Date: 2026-09-30 22:44:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '3c8cf459ec67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add quantity column to shipments table."""
    op.add_column('shipments', sa.Column('quantity', sa.Numeric(), nullable=True))
    # Backfill existing rows with 1 (default quantity)
    op.execute("UPDATE shipments SET quantity = 1 WHERE quantity IS NULL")
    # Now enforce NOT NULL
    op.alter_column('shipments', 'quantity', nullable=False)


def downgrade() -> None:
    """Remove quantity column from shipments table."""
    op.drop_column('shipments', 'quantity')
