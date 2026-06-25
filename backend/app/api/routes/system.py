"""Public diagnostics (same DB session as auth)."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import User


def health_payload(db: Session) -> dict:
    """Shared body for GET /api/health and GET /health (same DB session as login)."""
    try:
        total = int(db.scalar(select(func.count()).select_from(User)) or 0)
        amira = db.scalar(select(User).where(User.email == "amira.bensalah@email.com"))
        admin = db.scalar(select(User).where(User.email == "admin@laura-ai.fr"))
        radio = db.scalar(select(User).where(User.email == "k.mansour@radiology.com"))
    except Exception as exc:  # pragma: no cover - defensive
        return {
            "status": "degraded",
            "database": "error",
            "detail": str(exc),
            "users": 0,
            "seedPatientPresent": False,
            "seedRadiologistPresent": False,
            "seedAdminPresent": False,
        }

    return {
        "status": "ok",
        "database": "connected",
        "users": total,
        "seedPatientPresent": amira is not None,
        "seedRadiologistPresent": radio is not None,
        "seedAdminPresent": admin is not None,
    }
