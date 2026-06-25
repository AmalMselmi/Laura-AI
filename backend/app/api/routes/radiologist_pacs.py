from __future__ import annotations

import socket
import uuid
from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.core.api_errors import PACS_CONNECTION_FAILED, api_error
from app.core.config import settings
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_radiologist, get_db
from app.models.entities import AsyncJob, AsyncJobStatus, PacsProtocol, PacsServer, User
from app.schemas.pacs_api import (
    AsyncJobOut,
    PacsQueryRequest,
    PacsRetrieveRequest,
    PacsRetrieveResponse,
    PacsServerCreateRequest,
    PacsServerOut,
    PacsServerUpdateRequest,
    PacsStudyOut,
    pacs_server_to_out,
    study_dict_to_out,
)
from app.services.pacs_mock_catalog import filter_studies
from app.services.pacs_retrieve_job import run_pacs_retrieve_job

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _get_pacs_or_404(db: Session, server_id: UUID, rad_id: UUID) -> PacsServer:
    row = db.scalar(select(PacsServer).where(PacsServer.id == server_id, PacsServer.radiologist_id == rad_id))
    if not row:
        raise HTTPException(status_code=404, detail="PACS server not found")
    return row


def _tcp_reachable(host: str, port: int, timeout: float = 2.0) -> bool:
    try:
        with socket.create_connection((host, int(port)), timeout=timeout):
            return True
    except OSError:
        return False


@router.get("", response_model=List[PacsServerOut])
async def list_pacs_servers(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> List[PacsServerOut]:
    rows = db.scalars(
        select(PacsServer).where(PacsServer.radiologist_id == user.id).order_by(PacsServer.created_at.desc())
    ).all()
    return [pacs_server_to_out(r) for r in rows]


@router.post("", response_model=PacsServerOut, status_code=status.HTTP_201_CREATED)
async def create_pacs_server(
    payload: PacsServerCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> PacsServerOut:
    proto = PacsProtocol.DICOM if payload.protocol == "DICOM" else PacsProtocol.DICOMweb
    row = PacsServer(
        id=uuid.uuid4(),
        radiologist_id=user.id,
        name=payload.name,
        host=payload.host,
        port=payload.port,
        ae_title=payload.ae_title,
        calling_ae_title=payload.calling_ae_title,
        protocol=proto,
        web_url=payload.web_url,
        tls=payload.tls,
        active=payload.active,
        connection_status="unknown",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return pacs_server_to_out(row)


@router.put("/{server_id}", response_model=PacsServerOut)
async def update_pacs_server(
    server_id: UUID,
    payload: PacsServerUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> PacsServerOut:
    row = _get_pacs_or_404(db, server_id, user.id)
    if payload.name is not None:
        row.name = payload.name
    if payload.host is not None:
        row.host = payload.host
    if payload.port is not None:
        row.port = payload.port
    if payload.ae_title is not None:
        row.ae_title = payload.ae_title
    if payload.calling_ae_title is not None:
        row.calling_ae_title = payload.calling_ae_title
    if payload.protocol is not None:
        row.protocol = PacsProtocol.DICOM if payload.protocol == "DICOM" else PacsProtocol.DICOMweb
    if payload.web_url is not None:
        row.web_url = payload.web_url
    if payload.tls is not None:
        row.tls = payload.tls
    if payload.active is not None:
        row.active = payload.active
    db.commit()
    db.refresh(row)
    return pacs_server_to_out(row)


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pacs_server(
    server_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> None:
    row = _get_pacs_or_404(db, server_id, user.id)
    db.delete(row)
    db.commit()


@router.post("/{server_id}/test", response_model=PacsServerOut)
async def test_pacs_server(
    server_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> PacsServerOut:
    row = _get_pacs_or_404(db, server_id, user.id)
    ok = _tcp_reachable(row.host, row.port)
    row.connection_status = "connected" if ok else "error"
    row.last_connected = _utcnow() if ok else row.last_connected
    db.commit()
    db.refresh(row)
    if not ok:
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            PACS_CONNECTION_FAILED,
            f"Cannot reach PACS at {row.host}:{row.port}. Check network, firewall, and AE titles.",
        )
    return pacs_server_to_out(row)


@router.post("/{server_id}/query", response_model=List[PacsStudyOut])
async def query_pacs_studies(
    server_id: UUID,
    payload: PacsQueryRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> List[PacsStudyOut]:
    if not settings.enable_pacs_integration:
        return []
    _get_pacs_or_404(db, server_id, user.id)
    raw = filter_studies(
        patient_name=payload.patient_name,
        patient_id=payload.patient_id,
        study_date_from=payload.study_date_from,
        study_date_to=payload.study_date_to,
        modality=payload.modality,
    )
    return [study_dict_to_out(s) for s in raw]


@router.post("/{server_id}/retrieve", response_model=PacsRetrieveResponse, status_code=status.HTTP_202_ACCEPTED)
async def retrieve_pacs_studies(
    server_id: UUID,
    payload: PacsRetrieveRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> PacsRetrieveResponse:
    if not settings.enable_pacs_integration:
        raise HTTPException(status_code=503, detail="PACS integration is disabled")
    _get_pacs_or_404(db, server_id, user.id)
    if not payload.study_uids:
        raise HTTPException(status_code=400, detail="studyUIDs required")

    job = AsyncJob(
        id=uuid.uuid4(),
        type="pacs_retrieve",
        status=AsyncJobStatus.queued,
        progress=0,
        user_id=user.id,
        input_data={"pacsServerId": str(server_id), "studyUIDs": payload.study_uids},
    )
    db.add(job)
    db.commit()

    uids = list(payload.study_uids)
    background_tasks.add_task(run_pacs_retrieve_job, job.id, user.id, uids)
    return PacsRetrieveResponse(jobId=str(job.id))
