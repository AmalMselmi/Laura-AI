from __future__ import annotations

import json
from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.api_errors import QUOTA_EXCEEDED, UNAUTHORIZED_ROLE, api_error
from app.core.content_sanitize import sanitize_medical_text
from app.core.deps import get_current_user, get_db, get_optional_current_user
from app.models.entities import DocumentType, MedicalDocument, Plan, ScanUsage, User, UserRole
from app.schemas.scan import (
    ScanAnalyzeMultipartResponse,
    ScanAnalyzeRequest,
    ScanAnalyzeResponse,
    ScanQuotaResponse,
)
from app.services.file_storage import file_extension_for_content_type, get_file_storage
from app.services.scan_service import analyze_upload, analyze_upload_bytes

router = APIRouter()


def _month_start(d: date) -> date:
    return date(d.year, d.month, 1)


def _get_or_create_monthly_scan_usage(db: Session, user_id: UUID, month: date) -> ScanUsage:
    row = db.scalar(select(ScanUsage).where(ScanUsage.user_id == user_id, ScanUsage.month == month))
    if row:
        return row
    row = ScanUsage(user_id=user_id, month=month)
    db.add(row)
    db.flush()
    return row


def _quota_for_user(db: Session, user: User) -> tuple[Plan, ScanUsage]:
    plan = db.scalar(select(Plan).where(Plan.id == user.plan_id))
    if not plan:
        raise HTTPException(status_code=500, detail="Plan not found")
    month = _month_start(datetime.now(timezone.utc).date())
    usage = _get_or_create_monthly_scan_usage(db, user.id, month)
    return plan, usage


def _ensure_scan_allowed(plan: Plan, usage: ScanUsage, *, uses_openai: bool) -> None:
    if plan.max_scans != -1 and usage.scans_used >= plan.max_scans:
        raise api_error(
            status.HTTP_402_PAYMENT_REQUIRED,
            QUOTA_EXCEEDED,
            "Monthly scan quota exceeded for your plan.",
        )
    if uses_openai and plan.ai_quota != -1 and usage.ai_used >= plan.ai_quota:
        raise api_error(
            status.HTTP_402_PAYMENT_REQUIRED,
            QUOTA_EXCEEDED,
            "AI analysis quota exceeded for your plan.",
        )


def _doc_type_from_scan_type(scan_type: str) -> DocumentType:
    t = (scan_type or "").lower()
    if "ordonnance" in t:
        return DocumentType.ordonnance
    if "analyse" in t:
        return DocumentType.analyse
    if any(x in t for x in ("scanner", "irm", "radiographie", "imagerie", "ct")):
        return DocumentType.imagerie
    return DocumentType.rapport


@router.post("/analyze", response_model=ScanAnalyzeResponse)
async def analyze_scan(
    payload: ScanAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> ScanAnalyzeResponse:
    if payload.userId:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        try:
            claimed = UUID(str(payload.userId))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid userId") from exc
        if current_user.id != claimed:
            raise HTTPException(status_code=403, detail="userId does not match authenticated user")

    usage: ScanUsage | None = None
    plan: Plan | None = None
    if current_user:
        if current_user.role != UserRole.patient:
            raise api_error(
                status.HTTP_403_FORBIDDEN,
                UNAUTHORIZED_ROLE,
                "Only patients consume scan quota here.",
            )
        plan, usage = _quota_for_user(db, current_user)

    try:
        _raw_bytes, result, used_openai = analyze_upload(
            file_name=payload.fileName, mime_type=payload.mimeType, file_base64=payload.fileBase64
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if usage is not None and plan is not None:
        _ensure_scan_allowed(plan, usage, uses_openai=used_openai)
        usage.scans_used += 1
        if used_openai:
            usage.ai_used += 1
        db.commit()

    return result


@router.post("/analyze-multipart", response_model=ScanAnalyzeMultipartResponse)
async def analyze_scan_multipart(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(default=None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> ScanAnalyzeMultipartResponse:
    if user_id:
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        try:
            claimed = UUID(str(user_id))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid userId") from exc
        if current_user.id != claimed:
            raise HTTPException(status_code=403, detail="userId does not match authenticated user")

    usage: ScanUsage | None = None
    plan: Plan | None = None
    if current_user:
        if current_user.role != UserRole.patient:
            raise api_error(
                status.HTTP_403_FORBIDDEN,
                UNAUTHORIZED_ROLE,
                "Only patients consume scan quota here.",
            )
        plan, usage = _quota_for_user(db, current_user)

    raw = await file.read()
    fname = file.filename or "upload"
    mime = (file.content_type or "").split(";")[0].strip() or "application/octet-stream"

    try:
        _raw, result, used_openai = analyze_upload_bytes(file_name=fname, mime_type=mime, payload=raw)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if usage is not None and plan is not None:
        _ensure_scan_allowed(plan, usage, uses_openai=used_openai)
        usage.scans_used += 1
        if used_openai:
            usage.ai_used += 1

    doc_id_str: str | None = None
    if current_user and current_user.role == UserRole.patient:
        storage = get_file_storage()
        doc_uuid = uuid4()
        ext = file_extension_for_content_type(mime)
        key = f"patient-files/{current_user.id}/{doc_uuid}-scan{ext}"
        storage.upload_file(raw, key, mime)
        report_json = json.dumps(result.model_dump(), ensure_ascii=False)
        doc = MedicalDocument(
            id=doc_uuid,
            user_id=current_user.id,
            name=(sanitize_medical_text(f"Rapport IA — {result.suggestedName}") or f"Rapport IA — {result.suggestedName}").strip(),
            type=_doc_type_from_scan_type(result.type),
            date=datetime.now(timezone.utc).date(),
            size=f"{len(raw) / (1024 * 1024):.2f} MB",
            size_bytes=len(raw),
            pathology=sanitize_medical_text(result.suggestedPathology),
            notes=sanitize_medical_text(result.examType or result.type),
            ai_analyzed=True,
            from_scan=True,
            file_url=key,
            report_content=sanitize_medical_text(report_json),
        )
        db.add(doc)
        doc_id_str = str(doc_uuid)

    db.commit()

    merged = {**result.model_dump(), "documentId": doc_id_str}
    return ScanAnalyzeMultipartResponse.model_validate(merged)


@router.get("/quota", response_model=ScanQuotaResponse)
async def scan_quota(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> ScanQuotaResponse:
    if user.role != UserRole.patient:
        raise api_error(
            status.HTTP_403_FORBIDDEN,
            UNAUTHORIZED_ROLE,
            "Patient access required.",
        )
    plan, usage = _quota_for_user(db, user)
    remaining = -1 if plan.max_scans == -1 else max(plan.max_scans - usage.scans_used, 0)
    ai_remaining = -1 if plan.ai_quota == -1 else max(plan.ai_quota - usage.ai_used, 0)
    return ScanQuotaResponse(
        planId=plan.id,
        maxScans=plan.max_scans,
        scansUsed=usage.scans_used,
        remaining=remaining,
        aiQuota=plan.ai_quota,
        aiUsed=usage.ai_used,
    )
