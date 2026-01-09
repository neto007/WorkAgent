from fastapi import HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from src.config.settings import settings
from datetime import datetime
from sqlalchemy.orm import Session
from src.config.database import get_db
from uuid import UUID
import logging
from typing import Optional

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


# Role hierarchy definition
ROLE_HIERARCHY = {
    "owner": 4,
    "admin": 3,
    "editor": 2,
    "viewer": 1
}

async def get_jwt_token(
    request: Request,
    token: str = Depends(oauth2_scheme)
) -> dict:
    """
    Extracts and validates the JWT token from header or cookie

    Args:
        request: FastAPI request object
        token: Token JWT from Authorization header

    Returns:
        dict: Token payload data

    Raises:
        HTTPException: If the token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # If header auth failed or was missing, check cookie (same as get_current_user)
    if not token:
        token = request.cookies.get("access_token")
        if token:
            pass # logger.info(f"Token found in cookie for JWT middleware: {token[:10]}...")
        else:
            logger.warning("No token found in header or cookie (jwt_middleware)")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token found in header or cookie",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        email: str = payload.get("sub")
        if email is None:
            logger.warning("Token without email (sub)")
            raise credentials_exception

        exp = payload.get("exp")
        if exp is None or datetime.fromtimestamp(exp) < datetime.utcnow():
            logger.warning(f"Token expired for {email}")
            raise credentials_exception

        return payload

    except JWTError as e:
        logger.error(f"Error decoding JWT token: {str(e)}")
        raise credentials_exception


async def verify_user_client(
    payload: dict = Depends(get_jwt_token),
    db: Session = Depends(get_db),
    required_client_id: UUID = None,
) -> bool:
    """
    Verifies if the user is associated with the specified client

    Args:
        payload: Token JWT payload
        db: Database session
        required_client_id: Client ID to be verified

    Returns:
        bool: True if verified successfully

    Raises:
        HTTPException: If the user does not have permission
    """
    # Administrators have access to all clients
    if payload.get("is_admin", False):
        return True

    # For non-admins, verify if the client_id corresponds
    user_client_id = payload.get("client_id")
    if not user_client_id:
        logger.warning(
            f"Non-admin user without client_id in token: {payload.get('sub')}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not associated with a client",
        )

    # If no client_id is specified to verify, any client is valid
    if not required_client_id:
        return True

    # Verify if the user's client_id corresponds to the required_client_id
    if str(user_client_id) != str(required_client_id):
        logger.warning(
            f"Access denied: User {payload.get('sub')} tried to access resources of client {required_client_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to access resources of this client",
        )

    return True


async def verify_role(
    required_role: str,
    payload: dict
) -> bool:
    """
    Verifies if the user has at least the required role severity.
    
    Args:
        required_role: The minimum role required (viewer, editor, admin, owner)
        payload: The JWT payload containing the user's role
        
    Returns:
        bool: True if authorized
        
    Raises:
        HTTPException: If role is insufficient
    """
    # System admins bypass role checks
    if payload.get("is_admin", False):
        return True

    user_role = payload.get("role", "viewer") # Default to viewer if missing
    
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    user_level = ROLE_HIERARCHY.get(user_role, 0)
    
    if user_level < required_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Required role: {required_role}"
        )
        
    return True


async def verify_user_access(
    payload: dict = Depends(get_jwt_token),
    required_role: str = "viewer"
) -> bool:
    """Dependency wrapper for verify_role"""
    return await verify_role(required_role, payload)


async def verify_admin(payload: dict = Depends(get_jwt_token)) -> bool:
    """
    Verifies if the user is an administrator
    
    Args:
        payload: Token JWT payload

    Returns:
        bool: True if the user is an administrator

    Raises:
        HTTPException: If the user is not an administrator
    """
    if not payload.get("is_admin", False):
        logger.warning(f"Access denied to admin: User {payload.get('sub')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Restricted to administrators.",
        )

    return True


def get_current_user_client_id(
    payload: dict = Depends(get_jwt_token),
) -> Optional[UUID]:
    """
    Gets the ID of the client associated with the current user

    Args:
        payload: Token JWT payload

    Returns:
        Optional[UUID]: Client ID or None if the user is an administrator
    """
    if payload.get("is_admin", False):
        return None

    client_id = payload.get("client_id")
    if client_id:
        return UUID(client_id)

    return None


async def get_jwt_token_ws(token: str) -> Optional[dict]:
    """
    Verifies and decodes the JWT token for WebSocket.
    Returns the payload if the token is valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None
