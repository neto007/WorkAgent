from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from src.config.database import get_db
from typing import List
import uuid
from src.core.jwt_middleware import (
    get_jwt_token,
    verify_user_client,
    verify_admin,
    get_current_user_client_id,
    verify_role,
)
from src.schemas.schemas import (
    Client,
    ClientCreate,
)
from src.schemas.user import UserCreate, TokenResponse
from src.services import (
    client_service,
)
from src.services.auth_service import create_access_token
import logging

logger = logging.getLogger(__name__)


class ClientRegistration(BaseModel):
    name: str
    email: str
    password: str


router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)


@router.post("", response_model=Client, status_code=status.HTTP_201_CREATED)
async def create_user(
    registration: ClientRegistration,
    db: Session = Depends(get_db),
    payload: dict = Depends(get_jwt_token),
):
    """
    Create a client and a user associated with it

    Args:
        registration: Client and user data to be created
        db: Database session
        payload: JWT token payload

    Returns:
        Client: Created client
    """
    # Only administrators can create clients
    await verify_admin(payload)

    # Create ClientCreate and UserCreate objects from ClientRegistration
    client = ClientCreate(name=registration.name, email=registration.email)
    user = UserCreate(
        email=registration.email, password=registration.password, name=registration.name
    )

    # Create client with user
    client_obj, message = client_service.create_client_with_user(db, client, user)
    if not client_obj:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return client_obj


@router.get("/", response_model=List[Client])
async def read_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    payload: dict = Depends(get_jwt_token),
):
    # If admin, can see all clients
    # If regular user, can only see their own client
    client_id = get_current_user_client_id(payload)

    if client_id:
        # Regular user - returns only their own client
        client = client_service.get_client(db, client_id)
        return [client] if client else []
    else:
        # Administrator - returns all clients
        return client_service.get_clients(db, skip, limit)


@router.get("/{client_id}", response_model=Client)
async def read_client(
    client_id: uuid.UUID,
    db: Session = Depends(get_db),
    payload: dict = Depends(get_jwt_token),
):
    # Verify if the user has access to this client's data
    await verify_user_client(payload, db, client_id)

    db_client = client_service.get_client(db, client_id)
    if db_client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )
    return db_client


@router.put("/{client_id}", response_model=Client)
async def update_client(
    client_id: uuid.UUID,
    client: ClientCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(get_jwt_token),
):
    # Verify if the user has access to this client's data
    await verify_user_client(payload, db, client_id)
    await verify_role("owner", payload)

    db_client = client_service.update_client(db, client_id, client)
    if db_client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )
    return db_client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: uuid.UUID,
    db: Session = Depends(get_db),
    payload: dict = Depends(get_jwt_token),
):
    # Only administrators can delete clients
    await verify_admin(payload)

    if not client_service.delete_client(db, client_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )


@router.post("/{client_id}/impersonate", response_model=TokenResponse)
async def impersonate_client(
    client_id: uuid.UUID,
    response: Response,
    db: Session = Depends(get_db),
    payload: dict = Depends(get_jwt_token),
):
    """
    Allows an administrator to obtain a token to impersonate a client

    Args:
        client_id: ID of the client to impersonate
        response: Response object to set cookies
        db: Database session
        payload: JWT payload of the administrator

    Returns:
        TokenResponse: Access token for the client

    Raises:
        HTTPException: If the user is not an administrator or the client does not exist
    """
    # Verify if the user is an administrator
    await verify_admin(payload)
    
    # Get current admin user ID
    admin_user_id = payload.get('sub')
    
    # Query admin user directly to create backup token
    from src.models.models import User
    # Payload sub contains email, not UUID
    admin_user = db.query(User).filter(User.email == admin_user_id).first()
    if admin_user:
        admin_backup_token = create_access_token(admin_user)
        # Save admin token in backup cookie
        logger.info(f"Setting admin_backup_token cookie for user {admin_user.email}")
        response.set_cookie(
            key="admin_backup_token",
            value=admin_backup_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,  # 7 days
            path="/"
        )
    else:
        logger.error(f"FAILED to find admin user for backup token: {admin_user_id}")

    # Search for the client
    client = client_service.get_client(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )

    user = client_service.get_client_user(db, client_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with the client not found",
        )

    access_token = create_access_token(user)

    # Set HttpOnly cookie like the login endpoint
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/"
    )

    logger.info(
        f"Administrator {payload.get('sub')} impersonated client {client.name} (ID: {client_id})"
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/exit-impersonation", response_model=dict)
async def exit_impersonation(
    request: Request,
    response: Response,
):
    """
    Exit impersonation and restore admin session
    
    Swaps the client token for the backed-up admin token
    """
    # Debug: Print all cookies
    logger.info(f"Exit impersonation cookies received: {request.cookies.keys()}")
    
    # Read admin backup token from cookies
    admin_backup_token = request.cookies.get("admin_backup_token")
    
    if not admin_backup_token:
        logger.warning("No admin backup token found when trying to exit impersonation")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No admin session to restore"
        )
    
    logger.info("Found admin_backup_token, restoring session...")
    
    # Clear client token and backup
    # response.delete_cookie(key="access_token", path="/") # Redundant if we overwrite
    response.delete_cookie(key="admin_backup_token", path="/")
    
    # Restore admin token
    response.set_cookie(
        key="access_token",
        value=admin_backup_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/"
    )
    
    logger.info("Admin exited impersonation and session restored")
    
    return {"message": "Admin session restored successfully"}
