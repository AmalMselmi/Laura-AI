from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.api_errors import TOKEN_EXPIRED, UNAUTHORIZED_ROLE, api_error
from app.core.deps import get_current_user, get_db
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token_or_none,
    get_password_hash,
    hash_refresh_token,
    verify_password,
)
from app.models.entities import RefreshToken, User
from app.schemas.auth import (
    AuthResponse,
    AuthUser,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
)
from app.schemas.common import MessageResponse

router = APIRouter()

REFRESH_COOKIE_KEY = "refresh_token"


def _build_auth_user(user: User) -> AuthUser:
    return AuthUser(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        plan=user.plan_id,
    )


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_KEY,
        value=refresh_token,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite="strict",
        path="/",
    )


def _refresh_expiry(token: str) -> datetime:
    payload = decode_token_or_none(token) or {}
    exp = payload.get("exp")
    return datetime.fromtimestamp(exp, tz=timezone.utc) if exp else datetime.now(timezone.utc)


def _role_claim(user: User) -> str:
    return user.role.value if hasattr(user.role, "value") else str(user.role)


def _issue_auth_session(db: Session, response: Response, user: User) -> AuthResponse:
    access = create_access_token(
        subject=str(user.id),
        extra_claims={"uid": str(user.id), "role": _role_claim(user), "email": user.email},
    )
    refresh = create_refresh_token(subject=str(user.id))
    db.add(
        RefreshToken(
            id=uuid4(),
            user_id=user.id,
            token_hash=hash_refresh_token(refresh),
            expires_at=_refresh_expiry(refresh),
            revoked=False,
        )
    )
    db.commit()
    _set_refresh_cookie(response, refresh)
    return AuthResponse(access_token=access, user=_build_auth_user(user))


def _authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return user


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = _authenticate_user(db, payload.email, payload.password)
    if payload.role and user.role.value != payload.role:
        raise api_error(
            status.HTTP_403_FORBIDDEN,
            UNAUTHORIZED_ROLE,
            "Role mismatch for this account.",
        )

    return _issue_auth_session(db, response, user)


@router.post("/admin/login", response_model=AuthResponse)
async def admin_login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = _authenticate_user(db, payload.email, payload.password)
    if user.role.value != "admin":
        raise api_error(
            status.HTTP_403_FORBIDDEN,
            UNAUTHORIZED_ROLE,
            "Admin access required.",
        )

    return _issue_auth_session(db, response, user)


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    """Passwords are stored only as bcrypt hashes (never plaintext)."""
    user = db.scalar(select(User).where(User.email == payload.email))
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    if payload.role not in {"patient", "radiologist"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    plan_id = "starter" if payload.role == "patient" else "radpro"
    user = User(
        id=uuid4(),
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        name=payload.name,
        plan_id=plan_id,
    )
    db.add(user)
    db.flush()
    return _issue_auth_session(db, response, user)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None, alias=REFRESH_COOKIE_KEY),
    db: Session = Depends(get_db),
) -> AuthResponse:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh cookie")

    payload = decode_token_or_none(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    try:
        subject_uuid = UUID(str(subject))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    stored = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(refresh_token),
            RefreshToken.revoked.is_(False),
        )
    )
    if not stored or stored.expires_at <= datetime.now(timezone.utc):
        raise api_error(
            status.HTTP_401_UNAUTHORIZED,
            TOKEN_EXPIRED,
            "Refresh token expired or revoked.",
        )

    user = db.scalar(select(User).where(User.id == subject_uuid))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    stored.revoked = True

    new_refresh = create_refresh_token(subject=str(user.id))
    db.add(
        RefreshToken(
            id=uuid4(),
            user_id=user.id,
            token_hash=hash_refresh_token(new_refresh),
            expires_at=_refresh_expiry(new_refresh),
            revoked=False,
        )
    )

    access = create_access_token(
        subject=str(user.id),
        extra_claims={"uid": str(user.id), "role": user.role.value, "email": user.email},
    )
    db.commit()
    _set_refresh_cookie(response, new_refresh)
    return AuthResponse(access_token=access, user=_build_auth_user(user))


@router.get("/me", response_model=AuthUser)
async def me(user: User = Depends(get_current_user)) -> AuthUser:
    return _build_auth_user(user)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None, alias=REFRESH_COOKIE_KEY),
    db: Session = Depends(get_db),
) -> MessageResponse:
    if refresh_token:
        stored = db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(refresh_token))
        )
        if stored:
            stored.revoked = True
            db.commit()

    response.delete_cookie(REFRESH_COOKIE_KEY, path="/")
    return MessageResponse(message="Logged out")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(_payload: ForgotPasswordRequest) -> MessageResponse:
    # TODO: integrate real email provider and reset-token flow.
    return MessageResponse(message="If the account exists, a reset email will be sent.")
