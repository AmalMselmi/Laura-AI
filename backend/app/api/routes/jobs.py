from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.entities import AsyncJob, User, UserRole
from app.schemas.pacs_api import AsyncJobOut

router = APIRouter()


@router.get("/{jobId}", response_model=AsyncJobOut)
async def get_job(
    jobId: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AsyncJobOut:
    try:
        jid = UUID(jobId)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Job not found") from exc

    job = db.get(AsyncJob, jid)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if user.role == UserRole.admin:
        pass
    elif job.user_id == user.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Forbidden")

    st = job.status.value if hasattr(job.status, "value") else str(job.status)
    return AsyncJobOut(
        job_id=str(job.id),
        status=st,
        progress=job.progress,
        type=job.type,
        result_data=job.result_data,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
    )
