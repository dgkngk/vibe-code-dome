"""Add cascade deletes to foreign keys

Revision ID: 003
Revises: 002
Create Date: 2023-11-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Handle cards table
    op.drop_constraint('cards_list_id_fkey', 'cards', type_='foreignkey')
    op.create_foreign_key('cards_list_id_fkey', 'cards', 'lists', ['list_id'], ['id'], ondelete='CASCADE')

    # Handle lists table
    op.drop_constraint('lists_board_id_fkey', 'lists', type_='foreignkey')
    op.create_foreign_key('lists_board_id_fkey', 'lists', 'boards', ['board_id'], ['id'], ondelete='CASCADE')

    # Handle boards table
    op.drop_constraint('boards_workspace_id_fkey', 'boards', type_='foreignkey')
    op.create_foreign_key('boards_workspace_id_fkey', 'boards', 'workspaces', ['workspace_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # Recreate tables without CASCADE
    # Handle cards table
    op.drop_constraint('cards_list_id_fkey', 'cards', type_='foreignkey')
    op.create_foreign_key('cards_list_id_fkey', 'cards', 'lists', ['list_id'], ['id'])

    # Handle lists table
    op.drop_constraint('lists_board_id_fkey', 'lists', type_='foreignkey')
    op.create_foreign_key('lists_board_id_fkey', 'lists', 'boards', ['board_id'], ['id'])

    # Handle boards table
    op.drop_constraint('boards_workspace_id_fkey', 'boards', type_='foreignkey')
    op.create_foreign_key('boards_workspace_id_fkey', 'boards', 'workspaces', ['workspace_id'], ['id'])
