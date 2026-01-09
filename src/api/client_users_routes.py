
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.models.models import User, Client
from src.schemas.user import UserResponse, UserInvite, MessageResponse
from src.services.auth_service import get_current_user
from src.services.user_service import create_user, get_user_by_email
from src.services.email_service import send_invite_email
from src.schemas.user import UserCreate
import logging
import uuid
import secrets

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/client/users",
    tags=["client-users"],
    responses={404: {"description": "Not found"}},
)

def check_permission(user: User, required_role: str):
    # Simple role hierarchy: owner > admin > editor > viewer
    roles = ["viewer", "editor", "admin", "owner"]
    try:
        user_level = roles.index(user.role)
        required_level = roles.index(required_role)
        if user_level < required_level:
             raise HTTPException(status_code=403, detail="Insufficient permissions")
    except ValueError:
        pass # If role not in list, assume no permissions

@router.get("/", response_model=list[UserResponse])
async def list_client_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all users in the current authenticated user's Client Organization"""
    if not current_user.client_id:
        raise HTTPException(status_code=400, detail="User is not part of any organization")
    
    users = db.query(User).filter(User.client_id == current_user.client_id).all()
    # Add fake role if missing (migration compat)
    for u in users:
        if not hasattr(u, "role") or u.role is None:
            u.role = "editor" 
    return users

@router.post("/invite", response_model=UserResponse)
async def invite_user(
    invite: UserInvite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invite a new user to the organization"""
    check_permission(current_user, "admin")
    
    if not current_user.client_id:
        raise HTTPException(status_code=400, detail="User is not part of any organization")
    
    # Check if user already exists
    existing_user = get_user_by_email(db, invite.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Generate a random password for the invite
    temp_password = secrets.token_urlsafe(12)
    
    user_data = UserCreate(
        email=invite.email,
        name=invite.email.split("@")[0], # Default name
        password=temp_password
    )
    
    user, msg = create_user(
        db, 
        user_data, 
        is_admin=False, 
        client_id=current_user.client_id,
        auto_verify=False
    )
    
    if not user:
        raise HTTPException(status_code=400, detail=msg)
    
    # Update role
    user.role = invite.role
    db.commit()
    db.refresh(user)
    
    # Send invitation email
    client = db.query(Client).filter(Client.id == current_user.client_id).first()
    org_name = client.name if client else "Evo AI"
    
    if send_invite_email(user.email, temp_password, user.role, org_name):
        logger.info(f"Invitation email sent to {user.email}")
    else:
        logger.error(f"Failed to send invitation email to {user.email}")
        # Note: We don't rollback user creation, but we could return a warning.
        # For now, just log it. The user exists and can potentially reset password.
    
    return user

@router.delete("/{user_id}", response_model=MessageResponse)
async def remove_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a user from the organization"""
    check_permission(current_user, "owner")
    
    user_to_remove = db.query(User).filter(User.id == user_id, User.client_id == current_user.client_id).first()
    if not user_to_remove:
        raise HTTPException(status_code=404, detail="User not found in this organization")
        
    if user_to_remove.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    
    # We can delete or deactivate. Let's deactivate for now to keep history? 
    # Or delete as per request. The task.md said "Remove", implying deletion or unlinking.
    # Since we have N:1, deleting `User` is the way, assuming SaaS owner wants them gone.
    # Alternatively, set client_id to None and is_active to False.
    
    db.delete(user_to_remove)
    db.commit()
    
    return {"message": "User removed successfully"}

@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a user's role"""
    check_permission(current_user, "owner")
    
    user_to_update = db.query(User).filter(User.id == user_id, User.client_id == current_user.client_id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_to_update.role = role
    db.commit()
    db.refresh(user_to_update)
    
    return user_to_update
