from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.entities import GdprRequest, GdprRequestStatus, User
from app.schemas.admin_api import AdminGdprRequestOut, GdprRequestCreate

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _gdpr_status_str(s: GdprRequestStatus) -> str:
    return s.value if isinstance(s, GdprRequestStatus) else str(s)


@router.post("/request", response_model=AdminGdprRequestOut, status_code=status.HTTP_201_CREATED)
def create_gdpr_request(
    body: GdprRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AdminGdprRequestOut:
    row = GdprRequest(
        id=uuid.uuid4(),
        user_id=user.id,
        user_name=user.name,
        type=body.type.strip()[:100],
        status=GdprRequestStatus.pending,
        notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return AdminGdprRequestOut(
        id=str(row.id),
        userId=str(row.user_id) if row.user_id else None,
        userName=row.user_name,
        type=row.type,
        status=_gdpr_status_str(row.status),
        notes=row.notes,
        createdAt=row.created_at,
        updatedAt=row.updated_at,
    )
