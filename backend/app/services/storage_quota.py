from __future__ import annotations

import uuid
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.api_errors import STORAGE_EXCEEDED, api_error
from app.models.entities import Plan, StorageUsage, User


def allocated_storage_gb(plan: Plan | None) -> float:
    if not plan:
        return 0.0
    gb = int(plan.storage_gb or 0)
    if gb < 0:
        return float("inf")
    return float(gb)


def _get_or_create_storage_usage(db: Session, user_id: UUID) -> StorageUsage:
    su = db.scalar(select(StorageUsage).where(StorageUsage.user_id == user_id))
    if su:
        return su
    row = StorageUsage(id=uuid.uuid4(), user_id=user_id, used_gb=0)
    db.add(row)
    db.flush()
    return row


def ensure_radiologist_upload_allowed(db: Session, user: User, additional_bytes: int) -> None:
    if additional_bytes <= 0:
        return
    plan = db.get(Plan, user.plan_id)
    alloc = allocated_storage_gb(plan)
    if alloc == float("inf"):
        return
    su = _get_or_create_storage_usage(db, user.id)
    used = float(su.used_gb or 0)
    delta_gb = additional_bytes / (1024**3)
    if used + delta_gb > alloc + 1e-9:
        raise api_error(
            507,
            STORAGE_EXCEEDED,
            "Storage quota exceeded for your plan. Free space or upgrade your plan.",
        )


def bump_storage_usage_gb(db: Session, user_id: UUID, additional_bytes: int) -> None:
    if additional_bytes <= 0:
        return
    su = _get_or_create_storage_usage(db, user_id)
    su.used_gb = float(su.used_gb or 0) + additional_bytes / (1024**3)


def radiologist_storage_snapshot(db: Session, user: User) -> tuple[float, float]:
    plan = db.get(Plan, user.plan_id)
    alloc = allocated_storage_gb(plan)
    su = db.scalar(select(StorageUsage).where(StorageUsage.user_id == user.id))
    used = float(su.used_gb) if su else 0.0
    return used, alloc
