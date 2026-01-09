"""
Security decorators for route protection.
"""

from functools import wraps
from typing import List
from fastapi import Depends, HTTPException, status
from src.core.permissions import Permission, has_permission, has_any_permission
from src.core.jwt_middleware import get_jwt_token


def require_permission(permission: Permission):
    """
    Decorator para verificar permission específica.

    Args:
        permission: Permission requerida

    Usage:
        @router.post("/agents")
        @require_permission(Permission.AGENT_CREATE)
        async def create_agent(...):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, payload: dict = Depends(get_jwt_token), **kwargs):
            user_role = payload.get("role", "viewer")

            if not has_permission(user_role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {permission.value} required",
                )

            return await func(*args, payload=payload, **kwargs)

        return wrapper

    return decorator


def require_any_permission(permissions: List[Permission]):
    """
    Decorator para verificar se tem pelo menos uma permission.

    Args:
        permissions: Lista de permissions (OR logic)

    Usage:
        @router.get("/agents")
        @require_any_permission([Permission.AGENT_READ, Permission.ADMIN_ALL])
        async def list_agents(...):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, payload: dict = Depends(get_jwt_token), **kwargs):
            user_role = payload.get("role", "viewer")

            if not has_any_permission(user_role, permissions):
                perm_names = [p.value for p in permissions]
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: one of {perm_names} required",
                )

            return await func(*args, payload=payload, **kwargs)

        return wrapper

    return decorator


def require_role(role: str):
    """
    Decorator para verificar role específica.

    Args:
        role: Role requerida (admin, editor, viewer)

    Usage:
        @router.delete("/users/{user_id}")
        @require_role("admin")
        async def delete_user(...):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, payload: dict = Depends(get_jwt_token), **kwargs):
            user_role = payload.get("role", "viewer")

            if user_role != role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role '{role}' required",
                )

            return await func(*args, payload=payload, **kwargs)

        return wrapper

    return decorator
