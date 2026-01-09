"""add_performance_indexes

Revision ID: 9c84197411d9
Revises: 172e7ed2198c
Create Date: 2026-01-09 18:50:48.327117

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c84197411d9"
down_revision: Union[str, None] = "172e7ed2198c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add performance indexes."""
    # Agents - busca por nome e client_id
    op.create_index("idx_agents_name", "agents", ["name"])
    op.create_index("idx_agents_client_id", "agents", ["client_id"])
    op.create_index("idx_agents_type", "agents", ["type"])
    op.create_index("idx_agents_folder_id", "agents", ["folder_id"])

    # Sessions - busca por user
    op.create_index("idx_sessions_user_id", "sessions", ["user_id"])
    op.create_index("idx_sessions_app_name", "sessions", ["app_name"])

    # API Keys - busca por client e status
    op.create_index("idx_api_keys_client_id", "api_keys", ["client_id"])
    op.create_index("idx_api_keys_is_active", "api_keys", ["is_active"])
    op.create_index("idx_api_keys_provider", "api_keys", ["provider"])

    # Users - busca por email (unique)
    op.create_index("idx_users_email", "users", ["email"], unique=True)
    op.create_index("idx_users_client_id", "users", ["client_id"])


def downgrade() -> None:
    """Downgrade schema - Remove performance indexes."""
    op.drop_index("idx_agents_name")
    op.drop_index("idx_agents_client_id")
    op.drop_index("idx_agents_type")
    op.drop_index("idx_agents_folder_id")
    op.drop_index("idx_sessions_user_id")
    op.drop_index("idx_sessions_app_name")
    op.drop_index("idx_api_keys_client_id")
    op.drop_index("idx_api_keys_is_active")
    op.drop_index("idx_api_keys_provider")
    op.drop_index("idx_users_email")
    op.drop_index("idx_users_client_id")
