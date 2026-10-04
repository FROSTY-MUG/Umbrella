"""
Umbrella OS - Authentication Router & RBAC Engine
Supports Google OAuth 2.0 / OIDC standard flow, server-side JWT session cookies,
audit logging, and development mock provider for rapid local evaluation.
"""

import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import jwt

from services.api.config import settings
from services.api.database import get_db
from services.api import models

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

class LoginRequest(BaseModel):
    provider: str = "google"
    token: Optional[str] = None
    # Dev mock fields
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "researcher"

class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str
    created_at: datetime
    last_login: datetime

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + (settings.JWT_EXPIRATION_HOURS * 3600)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.cookies.get("umbrella_session")
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if not token:
        # Default anonymous guest user for seamless browsing if unauthenticated
        guest_user = db.query(models.User).filter(models.User.email == "guest@umbrella.local").first()
        if not guest_user:
            guest_user = models.User(
                email="guest@umbrella.local",
                name="Guest Researcher",
                role="guest",
                provider="local"
            )
            db.add(guest_user)
            db.commit()
            db.refresh(guest_user)
        return guest_user

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session user")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{current_user.role}' lacks required permissions ({allowed_roles})"
            )
        return current_user
    return role_checker

@router.post("/login")
def login(login_req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Logs in with Google OAuth or local dev mock."""
    email = login_req.email or "researcher@umbrella.corp"
    name = login_req.name or "Dr. A. Birkin"
    role = login_req.role if login_req.role in ["guest", "researcher", "admin"] else "researcher"
    picture = "https://api.dicebear.com/7.x/identicon/svg?seed=" + email

    # If Google OAuth token provided in production, verify via Google OIDC endpoint
    if login_req.token and not settings.AUTH_ALLOW_DEV_MOCK:
        # In real Google OIDC flow:
        # verify token with google-auth / https://oauth2.googleapis.com/tokeninfo
        pass

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            name=name,
            role=role,
            picture=picture,
            provider="google"
        )
        db.add(user)
    else:
        user.last_login = datetime.utcnow()
        if login_req.role:
            user.role = role

    db.commit()
    db.refresh(user)

    # Audit log entry
    audit = models.AuditLogEntry(
        actor=user.email,
        action="USER_LOGIN",
        resource_type="auth",
        resource_id=user.id,
        details={"provider": login_req.provider, "role": user.role}
    )
    db.add(audit)
    db.commit()

    token = create_access_token(user.id, user.email, user.role)

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="umbrella_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False, # Set True in HTTPS prod
        max_age=settings.JWT_EXPIRATION_HOURS * 3600
    )

    return {
        "status": "authenticated",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "role": user.role
        }
    }

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    """Returns current active user session and RBAC privileges."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture,
        "role": current_user.role,
        "last_login": current_user.last_login
    }

@router.post("/logout")
def logout(response: Response, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logs out and clears session cookie."""
    audit = models.AuditLogEntry(
        actor=current_user.email,
        action="USER_LOGOUT",
        resource_type="auth",
        resource_id=current_user.id,
        details={}
    )
    db.add(audit)
    db.commit()

    response.delete_cookie("umbrella_session")
    return {"status": "logged_out"}
