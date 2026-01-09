"""
RBAC (Role-Based Access Control) permissions system.
"""

from enum import Enum
from typing import List


class Permission(str, Enum):
    """Permissions disponíveis no sistema"""

    # Agent permissions
    AGENT_CREATE = "agent:create"
    AGENT_READ = "agent:read"
    AGENT_UPDATE = "agent:update"
    AGENT_DELETE = "agent:delete"

    # User permissions
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"

    # MCP Server permissions
    MCP_CREATE = "mcp:create"
    MCP_READ = "mcp:read"
    MCP_UPDATE = "mcp:update"
    MCP_DELETE = "mcp:delete"

    # API Key permissions
    APIKEY_CREATE = "apikey:create"
    APIKEY_READ = "apikey:read"
    APIKEY_UPDATE = "apikey:update"
    APIKEY_DELETE = "apikey:delete"

    # Admin permissions
    ADMIN_ALL = "admin:all"


class Role(str, Enum):
    """Roles disponíveis no sistema"""

    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


# Mapeamento de roles para permissions
ROLE_PERMISSIONS = {
    Role.ADMIN: [Permission.ADMIN_ALL],  # Admin tem todas as permissions
    Role.EDITOR: [
        # Agents
        Permission.AGENT_CREATE,
        Permission.AGENT_READ,
        Permission.AGENT_UPDATE,
        Permission.AGENT_DELETE,
        # MCP Servers
        Permission.MCP_CREATE,
        Permission.MCP_READ,
        Permission.MCP_UPDATE,
        # API Keys
        Permission.APIKEY_CREATE,
        Permission.APIKEY_READ,
        Permission.APIKEY_UPDATE,
        # Users (apenas leitura)
        Permission.USER_READ,
    ],
    Role.VIEWER: [
        # Apenas leitura
        Permission.AGENT_READ,
        Permission.MCP_READ,
        Permission.APIKEY_READ,
        Permission.USER_READ,
    ],
}


def get_user_permissions(role: str) -> List[Permission]:
    """
    Retorna permissions de uma role.

    Args:
        role: Nome da role

    Returns:
        Lista de permissions
    """
    try:
        role_enum = Role(role)
        return ROLE_PERMISSIONS.get(role_enum, [])
    except ValueError:
        return []


def has_permission(user_role: str, required_permission: Permission) -> bool:
    """
    Verifica se role tem permission.

    Args:
        user_role: Role do usuário
        required_permission: Permission requerida

    Returns:
        True se tem permission
    """
    permissions = get_user_permissions(user_role)

    # Admin tem todas as permissions
    if Permission.ADMIN_ALL in permissions:
        return True

    return required_permission in permissions


def has_any_permission(user_role: str, required_permissions: List[Permission]) -> bool:
    """
    Verifica se role tem pelo menos uma das permissions.

    Args:
        user_role: Role do usuário
        required_permissions: Lista de permissions requeridas

    Returns:
        True se tem pelo menos uma permission
    """
    return any(has_permission(user_role, perm) for perm in required_permissions)


def has_all_permissions(user_role: str, required_permissions: List[Permission]) -> bool:
    """
    Verifica se role tem todas as permissions.

    Args:
        user_role: Role do usuário
        required_permissions: Lista de permissions requeridas

    Returns:
        True se tem todas as permissions
    """
    return all(has_permission(user_role, perm) for perm in required_permissions)
