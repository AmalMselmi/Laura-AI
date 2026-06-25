from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.entities import DicomFolder, DocumentFolder, MedicalDocument, SharedLink, SharedLinkType, User
from app.schemas.shared_api import SharedFolderPayload, SharedLinkPublicResponse, SharedReportPayload
from app.services.file_storage import get_file_storage, is_managed_storage_ref
from app.services.patient_documents_service import load_folder_documents, medical_document_to_out

router = APIRouter()

_NOT_FOUND = HTTPException(status_code=404, detail="Not found")


def _utcnow() -> datetime:
    # DB timestamps are stored without tz (SQLite); compare as naive UTC.
    return datetime.utcnow()


def _shared_medical_doc_for_file(db: Session, token: str, doc_uuid: UUID) -> MedicalDocument | None:
    link = db.scalar(select(SharedLink).where(SharedLink.token == token))
    if not link or link.expires_at <= _utcnow():
        return None
    doc = db.scalar(select(MedicalDocument).where(MedicalDocument.id == doc_uuid))
    if not doc:
        return None
    if link.type == SharedLinkType.document:
        return doc if link.document_id == doc_uuid else None
    if link.type == SharedLinkType.folder and link.folder_id:
        folder = db.scalar(select(DocumentFolder).where(DocumentFolder.id == link.folder_id))
        if folder and doc.folder_id == folder.id and doc.user_id == folder.user_id:
            return doc
    return None


@router.get("/{token}/documents/{doc_id}/file")
async def shared_medical_document_file(
    token: str,
    doc_id: str,
    db: Session = Depends(get_db),
) -> Response:
    try:
        doc_uuid = UUID(str(doc_id))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid document id") from exc
    doc = _shared_medical_doc_for_file(db, token, doc_uuid)
    if not doc or not doc.file_url:
        raise _NOT_FOUND
    fu = doc.file_url
    if fu.startswith("http://") or fu.startswith("https://"):
        return RedirectResponse(fu)
    if fu.startswith("data:") or not is_managed_storage_ref(fu):
        raise _NOT_FOUND
    storage = get_file_storage()
    body, ct = storage.read_file(fu)
    return Response(content=body, media_type=ct, headers={"Cache-Control": "private, max-age=600"})


@router.get("/{token}", response_model=SharedLinkPublicResponse)
async def read_shared(token: str, db: Session = Depends(get_db)) -> SharedLinkPublicResponse:
    link = db.scalar(select(SharedLink).where(SharedLink.token == token))
    if not link:
        raise _NOT_FOUND
    if link.expires_at <= _utcnow():
        raise _NOT_FOUND

    if link.type == SharedLinkType.document:
        doc = db.scalar(select(MedicalDocument).where(MedicalDocument.id == link.document_id))
        if not doc:
            raise _NOT_FOUND
        return SharedLinkPublicResponse(
            token=link.token,
            type="document",
            label=link.label or doc.name,
            createdAt=link.created_at,
            expiresAt=link.expires_at,
            document=medical_document_to_out(doc, shared_token=link.token),
        )

    if link.type == SharedLinkType.folder:
        folder = db.scalar(select(DocumentFolder).where(DocumentFolder.id == link.folder_id))
        if not folder:
            raise _NOT_FOUND
        docs = load_folder_documents(db, folder.id, folder.user_id)
        payload = SharedFolderPayload(
            id=str(folder.id),
            name=folder.name,
            description=folder.description,
            documents=[medical_document_to_out(d, shared_token=link.token) for d in docs],
        )
        return SharedLinkPublicResponse(
            token=link.token,
            type="folder",
            label=link.label or folder.name,
            createdAt=link.created_at,
            expiresAt=link.expires_at,
            folder=payload,
        )

    if link.type == SharedLinkType.report:
        if not link.report_data:
            raise _NOT_FOUND
        try:
            report = SharedReportPayload.model_validate(link.report_data)
        except Exception as exc:
            raise _NOT_FOUND from exc
        return SharedLinkPublicResponse(
            token=link.token,
            type="report",
            label=link.label or f"Compte-rendu — {report.patientName}",
            createdAt=link.created_at,
            expiresAt=link.expires_at,
            report=report,
        )

    raise _NOT_FOUND


@router.delete("/{token}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_shared(
    token: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    link = db.scalar(select(SharedLink).where(SharedLink.token == token))
    if not link or link.created_by != user.id:
        raise _NOT_FOUND

    if link.type == SharedLinkType.document and link.document_id:
        doc = db.scalar(
            select(MedicalDocument).where(MedicalDocument.id == link.document_id, MedicalDocument.user_id == user.id)
        )
        if doc and doc.share_token == token:
            doc.share_token = None
    if link.type == SharedLinkType.folder and link.folder_id:
        folder = db.scalar(
            select(DocumentFolder).where(DocumentFolder.id == link.folder_id, DocumentFolder.user_id == user.id)
        )
        if folder and folder.share_token == token:
            folder.share_token = None
            folder.shared_at = None

    if link.type == SharedLinkType.report and link.dicom_folder_id:
        dicom_folder = db.scalar(
            select(DicomFolder).where(DicomFolder.id == link.dicom_folder_id, DicomFolder.radiologist_id == user.id)
        )
        if dicom_folder and dicom_folder.share_token == token:
            dicom_folder.share_token = None

    db.execute(delete(SharedLink).where(SharedLink.token == token))
    db.commit()
