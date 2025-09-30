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
    # For SQLite, recreate tables to add CASCADE to foreign keys while preserving data
    # Assuming development DB; for production, backup first

    # Handle boards table
    op.execute('CREATE TABLE boards_new (id INTEGER NOT NULL, name VARCHAR NOT NULL, workspace_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE)')
    op.execute('INSERT INTO boards_new SELECT * FROM boards')
    op.execute('DROP TABLE boards')
    op.execute('ALTER TABLE boards_new RENAME TO boards')
    op.execute('CREATE INDEX ix_boards_id ON boards (id)')
    op.execute('CREATE INDEX ix_boards_name ON boards (name)')

    # Handle lists table
    op.execute('CREATE TABLE lists_new (id INTEGER NOT NULL, name VARCHAR NOT NULL, position INTEGER, board_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(board_id) REFERENCES boards (id) ON DELETE CASCADE)')
    op.execute('INSERT INTO lists_new SELECT * FROM lists')
    op.execute('DROP TABLE lists')
    op.execute('ALTER TABLE lists_new RENAME TO lists')
    op.execute('CREATE INDEX ix_lists_id ON lists (id)')
    op.execute('CREATE INDEX ix_lists_name ON lists (name)')

    # Handle cards table
    op.execute('CREATE TABLE cards_new (id INTEGER NOT NULL, name VARCHAR NOT NULL, description VARCHAR, position INTEGER, list_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(list_id) REFERENCES lists (id) ON DELETE CASCADE)')
    op.execute('INSERT INTO cards_new SELECT * FROM cards')
    op.execute('DROP TABLE cards')
    op.execute('ALTER TABLE cards_new RENAME TO cards')
    op.execute('CREATE INDEX ix_cards_id ON cards (id)')
    op.execute('CREATE INDEX ix_cards_name ON cards (name)')


def downgrade() -> None:
    # Recreate tables without CASCADE
    # Handle cards table
    op.execute('CREATE TABLE cards_old (id INTEGER NOT NULL, name VARCHAR NOT NULL, description VARCHAR, position INTEGER, list_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(list_id) REFERENCES lists (id))')
    op.execute('INSERT INTO cards_old SELECT * FROM cards')
    op.execute('DROP TABLE cards')
    op.execute('ALTER TABLE cards_old RENAME TO cards')
    op.execute('CREATE INDEX ix_cards_id ON cards (id)')
    op.execute('CREATE INDEX ix_cards_name ON cards (name)')

    # Handle lists table
    op.execute('CREATE TABLE lists_old (id INTEGER NOT NULL, name VARCHAR NOT NULL, position INTEGER, board_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(board_id) REFERENCES boards (id))')
    op.execute('INSERT INTO lists_old SELECT * FROM lists')
    op.execute('DROP TABLE lists')
    op.execute('ALTER TABLE lists_old RENAME TO lists')
    op.execute('CREATE INDEX ix_lists_id ON lists (id)')
    op.execute('CREATE INDEX ix_lists_name ON lists (name)')

    # Handle boards table
    op.execute('CREATE TABLE boards_old (id INTEGER NOT NULL, name VARCHAR NOT NULL, workspace_id INTEGER NOT NULL, PRIMARY KEY (id), FOREIGN KEY(workspace_id) REFERENCES workspaces (id))')
    op.execute('INSERT INTO boards_old SELECT * FROM boards')
    op.execute('DROP TABLE boards')
    op.execute('ALTER TABLE boards_old RENAME TO boards')
    op.execute('CREATE INDEX ix_boards_id ON boards (id)')
    op.execute('CREATE INDEX ix_boards_name ON boards (name)')
