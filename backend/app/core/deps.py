from collections.abc import Generator
from typing import Optional
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from jose import ExpiredSignatureError, JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.api_errors import TOKEN_EXPIRED, UNAUTHORIZED_ROLE, api_error
from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.entities import User, UserRole


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_optional_current_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(default=None),
) -> Optional[User]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        raise api_error(status.HTTP_401_UNAUTHORIZED, TOKEN_EXPIRED, "Access token expired.")
    except JWTError:
        return None
    if not payload or payload.get("type") != "access":
        return None
    user_id = payload.get("uid")
    if not user_id:
        return None
    try:
        user_uuid = UUID(str(user_id))
    except ValueError:
        return None
    return db.scalar(select(User).where(User.id == user_uuid))


def get_current_user(
    user: Optional[User] = Depends(get_optional_current_user),
) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")
    return user


def get_current_patient(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.patient:
        raise api_error(
            status.HTTP_403_FORBIDDEN,
            UNAUTHORIZED_ROLE,
            "Patient access required.",
        )
    return user


def get_current_radiologist(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.radiologist:
        raise api_error(
            status.HTTP_403_FORBIDDEN,
            UNAUTHORIZED_ROLE,
            "Radiologist access required.",
        )
    return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise api_error(
            status.HTTP_403_FORBIDDEN,
            UNAUTHORIZED_ROLE,
            "Admin access required.",
        )
    return user
