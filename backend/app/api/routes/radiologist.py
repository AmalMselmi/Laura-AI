from __future__ import annotations

import re
import secrets
import shutil
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import List
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from starlette.datastructures import UploadFile as StarletteUploadFile
from starlette.requests import Request
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.content_sanitize import sanitize_medical_text
from app.core.database import SessionLocal
from app.core.deps import get_current_radiologist, get_db
from app.core.upload_policy import assert_dicom_upload_allowed
from app.models.entities import (
    AsyncJob,
    AsyncJobStatus,
    DicomFile,
    DicomFolder,
    LabInfo,
    ReportStatus,
    SharedLink,
    SharedLinkType,
    User,
)
from app.schemas.patient_api import ShareCreateResponse
from app.schemas.radiologist_dicom import (
    DicomFileOut,
    DicomFolderCreateRequest,
    DicomFolderOut,
    DicomFolderReportUpdateRequest,
    DicomFolderShareRequest,
    RadiologistLabContextResponse,
    RadiologistLabUpdateRequest,
    RadiologistProfileOut,
    RadiologistProfileUpdateRequest,
    RadiologistStorageQuotaOut,
    ReportGenerateResponse,
)
from app.services.storage_quota import (
    bump_storage_usage_gb,
    ensure_radiologist_upload_allowed,
    radiologist_storage_snapshot,
)
from app.services.lab_logo_storage import decode_data_url, store_logo_local_data_url, upload_lab_logo_png_jpeg
from app.schemas.shared_api import ShareReportCreateRequest, SharedLabInfoPayload, SharedReportPayload
from app.services.dicom_report_generation import build_preliminary_ai_report

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _new_share_token() -> str:
    return secrets.token_urlsafe(24)[:48]


def _build_share_response(token: str, expires_at: datetime) -> ShareCreateResponse:
    return ShareCreateResponse(token=token, expiresAt=expires_at, urlPath=f"/shared/{token}")


def _report_status_literal(folder: DicomFolder) -> str:
    rs = folder.report_status
    return rs.value if isinstance(rs, ReportStatus) else str(rs)


def _serialize_folder(folder: DicomFolder, files: List[DicomFile]) -> DicomFolderOut:
    return DicomFolderOut(
        id=str(folder.id),
        patient_name=(sanitize_medical_text(folder.patient_name) or folder.patient_name),
        patient_id=sanitize_medical_text(folder.patient_id),
        pathology=sanitize_medical_text(folder.pathology),
        modality=sanitize_medical_text(folder.modality),
        report_content=sanitize_medical_text(folder.report_content),
        report_status=_report_status_literal(folder),  # type: ignore[arg-type]
        share_token=folder.share_token,
        pacs_imported=folder.pacs_imported,
        pacs_study_uid=folder.pacs_study_uid,
        finalized_at=folder.finalized_at,
        created_at=folder.created_at,
        updated_at=folder.updated_at,
        files=[
            DicomFileOut(
                id=str(df.id),
                name=(sanitize_medical_text(df.name) or df.name),
                size_bytes=df.size_bytes,
                modality=sanitize_medical_text(df.modality),
                upload_date=df.upload_date,
            )
            for df in files
        ],
    )


def _get_folder_for_rad(db: Session, folder_id: UUID, radiologist_id: UUID) -> DicomFolder | None:
    return db.scalar(
        select(DicomFolder).where(DicomFolder.id == folder_id, DicomFolder.radiologist_id == radiologist_id)
    )


def _folder_files(db: Session, folder_id: UUID) -> List[DicomFile]:
    return list(db.scalars(select(DicomFile).where(DicomFile.folder_id == folder_id).order_by(DicomFile.upload_date)))


def _safe_filename(name: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]+", "_", Path(name).name)[:180]
    return base or "upload.bin"


def _lab_payload_from_row(row: LabInfo | None) -> SharedLabInfoPayload:
    if not row:
        return SharedLabInfoPayload(
            name="",
            address="",
            postalCode="",
            city="",
            country="",
            phone="",
            email="",
            website="",
            rpps="",
            siret="",
            logoDataUrl="",
            logoUrl=None,
        )
    return SharedLabInfoPayload(
        name=row.name or "",
        address=row.address or "",
        postalCode=row.postal_code or "",
        city=row.city or "",
        country=row.country or "",
        phone=row.phone or "",
        email=row.email or "",
        website=row.website or "",
        rpps=row.rpps or "",
        siret=row.siret or "",
        logoDataUrl=row.logo_data_url or "",
        logoUrl=row.logo_url or None,
    )


def _lab_payload_for_user(db: Session, user: User) -> SharedLabInfoPayload:
    row = db.scalar(select(LabInfo).where(LabInfo.user_id == user.id))
    return _lab_payload_from_row(row)


def _profile_out(user: User) -> RadiologistProfileOut:
    return RadiologistProfileOut(
        name=user.name,
        title=user.radiologist_title or "Médecin Radiologue",
        specialty=user.radiologist_specialty or "Imagerie médicale",
    )


async def _apply_lab_logo_to_row(
    row: LabInfo,
    user_id: uuid.UUID,
    payload: RadiologistLabUpdateRequest,
    logo_file: StarletteUploadFile | UploadFile | None,
) -> None:
    if payload.clearLogo:
        row.logo_url = None
        row.logo_data_url = None
        return

    raw: bytes | None = None
    content_type: str | None = None
    if logo_file and logo_file.filename:
        raw = await logo_file.read()
        content_type = logo_file.content_type
    elif payload.logoDataUrl and payload.logoDataUrl.strip():
        try:
            raw, content_type = decode_data_url(payload.logoDataUrl.strip())
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid logoDataUrl") from exc

    if not raw:
        return

    try:
        if settings.s3_lab_logos_enabled():
            url = upload_lab_logo_png_jpeg(raw, content_type, user_id)
            row.logo_url = url
            row.logo_data_url = None
        else:
            row.logo_data_url = store_logo_local_data_url(raw, content_type)
            row.logo_url = None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _complete_dicom_report_job(job_id: UUID, folder_id: UUID, radiologist_id: UUID) -> None:
    db = SessionLocal()
    try:
        job = db.get(AsyncJob, job_id)
        folder = db.scalar(
            select(DicomFolder).where(DicomFolder.id == folder_id, DicomFolder.radiologist_id == radiologist_id)
        )
        if not folder or folder.report_status != ReportStatus.generating:
            if job:
                job.status = AsyncJobStatus.failed
                job.error_message = "Folder not in generating state"
                job.updated_at = _utcnow()
                db.commit()
            return

        if job:
            job.status = AsyncJobStatus.processing
            job.progress = 40
            job.updated_at = _utcnow()
            db.commit()

        time.sleep(0.35)

        n_files = db.scalar(select(func.count()).select_from(DicomFile).where(DicomFile.folder_id == folder_id)) or 0
        text = build_preliminary_ai_report(
            patient_name=folder.patient_name,
            patient_id=folder.patient_id or "",
            pathology=folder.pathology or "",
            modality=folder.modality or "",
            file_count=int(n_files),
        )
        folder.report_content = text
        folder.report_status = ReportStatus.ai_generated
        folder.updated_at = _utcnow()
        if job:
            job.status = AsyncJobStatus.completed
            job.progress = 100
            job.completed_at = _utcnow()
            job.result_data = {"ok": True}
            job.updated_at = _utcnow()
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        db2 = SessionLocal()
        try:
            job = db2.get(AsyncJob, job_id)
            if job:
                job.status = AsyncJobStatus.failed
                job.error_message = str(exc)
                job.updated_at = _utcnow()
                db2.commit()
            folder = db2.scalar(select(DicomFolder).where(DicomFolder.id == folder_id))
            if folder and folder.report_status == ReportStatus.generating:
                folder.report_status = ReportStatus.none
                folder.updated_at = _utcnow()
                db2.commit()
        finally:
            db2.close()
    finally:
        db.close()


@router.get("/dashboard")
async def radiologist_dashboard(_user: User = Depends(get_current_radiologist)) -> dict[str, str]:
    return {"scope": "radiologist", "status": "ok"}


@router.get("/storage-quota", response_model=RadiologistStorageQuotaOut)
async def radiologist_storage_quota(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> RadiologistStorageQuotaOut:
    used, alloc = radiologist_storage_snapshot(db, user)
    unlimited = alloc == float("inf")
    return RadiologistStorageQuotaOut(
        used_gb=used,
        allocated_gb=0.0 if unlimited else alloc,
        unlimited=unlimited,
    )


@router.get("/lab", response_model=RadiologistLabContextResponse)
async def radiologist_lab_context(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> RadiologistLabContextResponse:
    row = db.scalar(select(LabInfo).where(LabInfo.user_id == user.id))
    return RadiologistLabContextResponse(lab=_lab_payload_from_row(row), profile=_profile_out(user))


@router.put("/lab", response_model=RadiologistLabContextResponse)
async def update_radiologist_lab(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> RadiologistLabContextResponse:
    content_type = request.headers.get("content-type") or ""
    logo_file: UploadFile | None = None
    # Starlette may report multipart as "multipart/form-data; boundary=..."
    if content_type.lower().startswith("multipart/form-data"):
        form = await request.form()
        data_field = form.get("data")
        if not data_field or not isinstance(data_field, str):
            raise HTTPException(status_code=422, detail="Multipart form must include 'data' (JSON string)")
        payload = RadiologistLabUpdateRequest.model_validate_json(data_field)
        up = form.get("logo")
        # request.form() yields starlette.datastructures.UploadFile, not fastapi.UploadFile
        if isinstance(up, StarletteUploadFile) and (up.filename or "").strip():
            logo_file = up
    else:
        body = await request.json()
        payload = RadiologistLabUpdateRequest.model_validate(body)

    row = db.scalar(select(LabInfo).where(LabInfo.user_id == user.id))
    if not row:
        row = LabInfo(id=uuid.uuid4(), user_id=user.id)
        db.add(row)
        db.flush()

    row.name = payload.name or None
    row.address = payload.address or None
    row.postal_code = payload.postalCode or None
    row.city = payload.city or None
    row.country = payload.country or None
    row.phone = payload.phone or None
    row.email = payload.email or None
    row.website = payload.website or None
    row.rpps = payload.rpps or None
    row.siret = payload.siret or None
    row.updated_at = _utcnow()

    await _apply_lab_logo_to_row(row, user.id, payload, logo_file)
    db.commit()
    db.refresh(row)
    return RadiologistLabContextResponse(lab=_lab_payload_from_row(row), profile=_profile_out(user))


@router.put("/profile", response_model=RadiologistProfileOut)
async def update_radiologist_profile(
    payload: RadiologistProfileUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> RadiologistProfileOut:
    name = payload.name.strip()
    if name:
        user.name = name
    user.radiologist_title = payload.title.strip() or None
    user.radiologist_specialty = payload.specialty.strip() or None
    user.updated_at = _utcnow()
    db.commit()
    db.refresh(user)
    return _profile_out(user)


@router.get("/folders", response_model=List[DicomFolderOut])
async def list_dicom_folders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> List[DicomFolderOut]:
    folders = db.scalars(
        select(DicomFolder).where(DicomFolder.radiologist_id == user.id).order_by(DicomFolder.updated_at.desc())
    ).all()
    out: List[DicomFolderOut] = []
    for f in folders:
        out.append(_serialize_folder(f, _folder_files(db, f.id)))
    return out


@router.post("/folders", response_model=DicomFolderOut, status_code=status.HTTP_201_CREATED)
async def create_dicom_folder(
    payload: DicomFolderCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> DicomFolderOut:
    folder = DicomFolder(
        id=uuid.uuid4(),
        radiologist_id=user.id,
        patient_name=payload.patient_name,
        patient_id=payload.patient_id or None,
        pathology=payload.pathology or None,
        modality=payload.modality or None,
        report_status=ReportStatus.none,
        pacs_imported=payload.pacs_imported,
        pacs_study_uid=payload.pacs_study_uid,
    )
    if payload.report_content:
        folder.report_content = sanitize_medical_text(payload.report_content)
        folder.report_status = ReportStatus.ai_generated
    db.add(folder)
    db.flush()

    for stub in payload.initial_files:
        db.add(
            DicomFile(
                id=uuid.uuid4(),
                folder_id=folder.id,
                name=stub.name,
                size_bytes=stub.size_bytes or None,
                modality=stub.modality or None,
                file_url=None,
            )
        )
    db.commit()
    db.refresh(folder)
    return _serialize_folder(folder, _folder_files(db, folder.id))


@router.post("/folders/{folder_id}/files", response_model=DicomFolderOut)
async def upload_dicom_files(
    folder_id: UUID,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> DicomFolderOut:
    folder = _get_folder_for_rad(db, folder_id, user.id)
    if not folder:
        raise HTTPException(status_code=404, detail="DICOM folder not found")

    root = settings.dicom_storage_dir
    root.mkdir(parents=True, exist_ok=True)
    dest_dir = root / str(folder_id)
    dest_dir.mkdir(parents=True, exist_ok=True)

    file_items: list[tuple[UploadFile, bytes, str]] = []
    total_bytes = 0
    for up in files:
        raw_name = up.filename or "file.dcm"
        body = await up.read()
        file_items.append((up, body, raw_name))
        total_bytes += len(body)

    assert_dicom_upload_allowed(file_items)
    ensure_radiologist_upload_allowed(db, user, total_bytes)

    for _up, body, raw_name in file_items:
        fname = f"{uuid.uuid4().hex[:10]}_{_safe_filename(raw_name)}"
        path = dest_dir / fname
        path.write_bytes(body)
        db.add(
            DicomFile(
                id=uuid.uuid4(),
                folder_id=folder.id,
                name=_safe_filename(raw_name),
                size_bytes=len(body),
                modality=folder.modality,
                file_url=str(path.relative_to(root)),
            )
        )

    bump_storage_usage_gb(db, user.id, total_bytes)
    folder.updated_at = _utcnow()
    db.commit()
    db.refresh(folder)
    return _serialize_folder(folder, _folder_files(db, folder.id))


@router.post("/folders/{folder_id}/report/generate", response_model=ReportGenerateResponse)
async def generate_dicom_report(
    folder_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> ReportGenerateResponse:
    folder = _get_folder_for_rad(db, folder_id, user.id)
    if not folder:
        raise HTTPException(status_code=404, detail="DICOM folder not found")
    if folder.report_status == ReportStatus.finalized:
        raise HTTPException(status_code=400, detail="Cannot regenerate report for a finalized folder")
    if folder.report_status == ReportStatus.generating:
        raise HTTPException(status_code=409, detail="Report generation already in progress")

    n_files = db.scalar(select(func.count()).select_from(DicomFile).where(DicomFile.folder_id == folder_id)) or 0
    if int(n_files) < 1:
        raise HTTPException(status_code=400, detail="At least one DICOM file is required")

    job = AsyncJob(
        id=uuid.uuid4(),
        type="dicom_report",
        status=AsyncJobStatus.queued,
        progress=0,
        user_id=user.id,
        input_data={"folderId": str(folder_id)},
    )
    db.add(job)
    folder.report_status = ReportStatus.generating
    folder.updated_at = _utcnow()
    db.commit()

    background_tasks.add_task(_complete_dicom_report_job, job.id, folder_id, user.id)
    return ReportGenerateResponse(folderId=str(folder_id), jobId=str(job.id))


@router.put("/folders/{folder_id}/report", response_model=DicomFolderOut)
async def update_dicom_report(
    folder_id: UUID,
    payload: DicomFolderReportUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> DicomFolderOut:
    folder = _get_folder_for_rad(db, folder_id, user.id)
    if not folder:
        raise HTTPException(status_code=404, detail="DICOM folder not found")

    folder.report_content = sanitize_medical_text(payload.report_content)
    if payload.finalize:
        folder.report_status = ReportStatus.finalized
        folder.finalized_at = _utcnow()
    elif folder.report_status != ReportStatus.finalized:
        folder.report_status = ReportStatus.in_review
    folder.updated_at = _utcnow()
    db.commit()
    db.refresh(folder)
    return _serialize_folder(folder, _folder_files(db, folder.id))


@router.post("/folders/{folder_id}/share", response_model=ShareCreateResponse, status_code=status.HTTP_201_CREATED)
async def share_dicom_folder(
    folder_id: UUID,
    payload: DicomFolderShareRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> ShareCreateResponse:
    folder = _get_folder_for_rad(db, folder_id, user.id)
    if not folder:
        raise HTTPException(status_code=404, detail="DICOM folder not found")
    if not (folder.report_content or "").strip():
        raise HTTPException(status_code=400, detail="Report content is empty")

    lab = payload.lab or _lab_payload_for_user(db, user)
    finalized = folder.finalized_at.isoformat() if folder.finalized_at else _utcnow().isoformat()
    report_model = SharedReportPayload(
        patientName=folder.patient_name,
        patientId=folder.patient_id or "",
        pathology=folder.pathology or "",
        modality=folder.modality or "",
        content=folder.report_content or "",
        finalizedAt=finalized,
        radiologistName=user.name,
        radiologistTitle=payload.radiologist_title,
        radiologistSpecialty=payload.radiologist_specialty,
        lab=lab,
    )
    req = ShareReportCreateRequest(report=report_model, label=payload.label, dicomFolderId=folder_id)

    if folder.share_token:
        db.execute(delete(SharedLink).where(SharedLink.token == folder.share_token))
        folder.share_token = None

    token = _new_share_token()
    expires_at = _utcnow() + timedelta(days=30)
    label = req.label or f"CR {folder.patient_name} — {folder.pathology or ''}"
    report_dict = req.report.model_dump(mode="json", by_alias=True)

    link = SharedLink(
        token=token,
        type=SharedLinkType.report,
        label=label,
        created_by=user.id,
        dicom_folder_id=folder_id,
        report_data=report_dict,
        expires_at=expires_at,
    )
    db.add(link)
    folder.share_token = token
    db.commit()
    return _build_share_response(token, expires_at)


@router.delete("/folders/{folder_id}/files/{file_id}", response_model=DicomFolderOut)
async def delete_dicom_file(
    folder_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> DicomFolderOut:
    folder = _get_folder_for_rad(db, folder_id, user.id)
    if not folder:
        raise HTTPException(status_code=404, detail="DICOM folder not found")

    dfile = db.scalar(select(DicomFile).where(DicomFile.id == file_id, DicomFile.folder_id == folder_id))
    if not dfile:
        raise HTTPException(status_code=404, detail="File not found")

    if dfile.file_url:
        try:
            path = settings.dicom_storage_dir / dfile.file_url
            if path.is_file():
                path.unlink()
        except OSError:
            pass

    db.delete(dfile)
    folder.updated_at = _utcnow()
    db.commit()
    db.refresh(folder)
    return _serialize_folder(folder, _folder_files(db, folder.id))


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dicom_folder(
    folder_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> None:
    folder = _get_folder_for_rad(db, folder_id, user.id)
    if not folder:
        raise HTTPException(status_code=404, detail="DICOM folder not found")

    if folder.share_token:
        db.execute(delete(SharedLink).where(SharedLink.token == folder.share_token))

    try:
        ddir = settings.dicom_storage_dir / str(folder_id)
        if ddir.is_dir():
            shutil.rmtree(ddir, ignore_errors=True)
    except OSError:
        pass

    db.delete(folder)
    db.commit()


@router.post("/share/report", response_model=ShareCreateResponse, status_code=status.HTTP_201_CREATED)
async def share_report(
    payload: ShareReportCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_radiologist),
) -> ShareCreateResponse:
    dicom_folder: DicomFolder | None = None
    if payload.dicomFolderId:
        dicom_folder = db.scalar(
            select(DicomFolder).where(DicomFolder.id == payload.dicomFolderId, DicomFolder.radiologist_id == user.id)
        )
        if not dicom_folder:
            raise HTTPException(status_code=404, detail="DICOM folder not found")
        if dicom_folder.share_token:
            db.execute(delete(SharedLink).where(SharedLink.token == dicom_folder.share_token))
            dicom_folder.share_token = None

    token = _new_share_token()
    expires_at = _utcnow() + timedelta(days=30)
    label = payload.label or f"CR {payload.report.patientName} — {payload.report.pathology}"
    report_dict = payload.report.model_dump(mode="json", by_alias=True)

    link = SharedLink(
        token=token,
        type=SharedLinkType.report,
        label=label,
        created_by=user.id,
        dicom_folder_id=payload.dicomFolderId,
        report_data=report_dict,
        expires_at=expires_at,
    )
    db.add(link)
    if dicom_folder:
        dicom_folder.share_token = token
    db.commit()
    return _build_share_response(token, expires_at)
