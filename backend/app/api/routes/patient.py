from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import Select, delete, func, or_, select, update
from sqlalchemy.orm import Session

from app.core.deps import get_current_patient, get_db
from app.models.entities import (
    DocumentFolder,
    DocumentType,
    MedicalDocument,
    SharedLink,
    SharedLinkType,
    User,
)
from app.schemas.patient_api import (
    DocumentFolderCreate,
    DocumentFolderOut,
    FolderDocumentsUpdate,
    MedicalDocumentCreate,
    MedicalDocumentOut,
    ShareCreateResponse,
)
from app.services.file_storage import get_file_storage, is_managed_storage_ref
from app.services.medical_document_files import ingest_patient_document_files
from app.services.patient_documents_service import document_folder_to_out, medical_document_to_out
from app.core.content_sanitize import sanitize_medical_text

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _new_share_token() -> str:
    return secrets.token_urlsafe(24)[:48]


def _parse_uuid(doc_id: str, label: str = "id") -> UUID:
    try:
        return UUID(str(doc_id))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {label}") from exc


# ── Documents ────────────────────────────────────────────────────────────────


@router.get("/documents", response_model=List[MedicalDocumentOut])
async def list_documents(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
    search: Optional[str] = Query(default=None),
    type: Optional[str] = Query(default=None, alias="type"),
    sort: str = Query(default="date"),
    order: str = Query(default="desc"),
) -> List[MedicalDocumentOut]:
    stmt: Select[tuple[MedicalDocument]] = select(MedicalDocument).where(MedicalDocument.user_id == user.id)

    if search:
        q = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                MedicalDocument.name.ilike(q),
                MedicalDocument.doctor.ilike(q),
                MedicalDocument.pathology.ilike(q),
                MedicalDocument.notes.ilike(q),
            )
        )
    if type and type != "all":
        try:
            dtype = DocumentType(type)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid document type filter") from exc
        stmt = stmt.where(MedicalDocument.type == dtype)

    sort_key = sort.lower()
    order_l = order.lower()
    col = MedicalDocument.date
    if sort_key == "name":
        col = MedicalDocument.name
    elif sort_key == "doctor":
        col = MedicalDocument.doctor
    elif sort_key == "pathology":
        col = MedicalDocument.pathology
    elif sort_key == "type":
        col = MedicalDocument.type
    elif sort_key == "date":
        col = MedicalDocument.date
    else:
        col = MedicalDocument.date

    stmt = stmt.order_by(col.desc() if order_l == "desc" else col.asc())

    rows = db.scalars(stmt).all()
    return [medical_document_to_out(d) for d in rows]


@router.post("/documents", response_model=MedicalDocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: MedicalDocumentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> MedicalDocumentOut:
    folder_id: Optional[UUID] = None
    if payload.folderId:
        folder_id = _parse_uuid(payload.folderId, "folderId")
        folder = db.scalar(
            select(DocumentFolder).where(DocumentFolder.id == folder_id, DocumentFolder.user_id == user.id)
        )
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")

    doc_id = uuid4()
    file_url, image_data_url = ingest_patient_document_files(
        user.id,
        doc_id,
        file_url=payload.fileUrl,
        image_data_url=payload.imageDataUrl,
    )
    doc = MedicalDocument(
        id=doc_id,
        user_id=user.id,
        name=(sanitize_medical_text(payload.name) or payload.name).strip(),
        type=payload.type,
        date=payload.date,
        size=payload.size,
        size_bytes=payload.sizeBytes,
        doctor=sanitize_medical_text(payload.doctor),
        pathology=sanitize_medical_text(payload.pathology),
        notes=sanitize_medical_text(payload.notes),
        ai_analyzed=payload.aiAnalyzed,
        from_scan=payload.fromScan,
        folder_id=folder_id,
        file_url=file_url,
        image_data_url=image_data_url,
        report_content=sanitize_medical_text(payload.reportContent),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return medical_document_to_out(doc)


@router.get("/documents/{doc_id}", response_model=MedicalDocumentOut)
async def get_document(
    doc_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> MedicalDocumentOut:
    uid = _parse_uuid(doc_id, "doc_id")
    doc = db.scalar(select(MedicalDocument).where(MedicalDocument.id == uid, MedicalDocument.user_id == user.id))
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return medical_document_to_out(doc)


@router.get("/documents/{doc_id}/file")
async def download_medical_document_file(
    doc_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> Response:
    uid = _parse_uuid(doc_id, "doc_id")
    doc = db.scalar(select(MedicalDocument).where(MedicalDocument.id == uid, MedicalDocument.user_id == user.id))
    if not doc or not doc.file_url:
        raise HTTPException(status_code=404, detail="File not found")
    fu = doc.file_url
    if fu.startswith("http://") or fu.startswith("https://"):
        return RedirectResponse(fu)
    if fu.startswith("data:") or not is_managed_storage_ref(fu):
        raise HTTPException(status_code=404, detail="File not found")
    storage = get_file_storage()
    body, ct = storage.read_file(fu)
    return Response(content=body, media_type=ct, headers={"Cache-Control": "private, max-age=600"})


@router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> None:
    uid = _parse_uuid(doc_id, "doc_id")
    doc = db.scalar(select(MedicalDocument).where(MedicalDocument.id == uid, MedicalDocument.user_id == user.id))
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.share_token:
        db.execute(delete(SharedLink).where(SharedLink.token == doc.share_token))
    if doc.file_url and is_managed_storage_ref(doc.file_url):
        get_file_storage().delete_file(doc.file_url)
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}


# ── Folders ──────────────────────────────────────────────────────────────────


@router.get("/folders", response_model=List[DocumentFolderOut])
async def list_folders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> List[DocumentFolderOut]:
    folders = db.scalars(
        select(DocumentFolder).where(DocumentFolder.user_id == user.id).order_by(DocumentFolder.created_at.desc())
    ).all()
    return [document_folder_to_out(db, f) for f in folders]


@router.post("/folders", response_model=DocumentFolderOut, status_code=status.HTTP_201_CREATED)
async def create_folder(
    payload: DocumentFolderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> DocumentFolderOut:
    folder = DocumentFolder(
        user_id=user.id,
        name=(sanitize_medical_text(payload.name) or payload.name).strip(),
        description=sanitize_medical_text(payload.description),
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return document_folder_to_out(db, folder)


@router.put("/folders/{folder_id}/documents", response_model=DocumentFolderOut)
async def set_folder_documents(
    folder_id: str,
    payload: FolderDocumentsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> DocumentFolderOut:
    fid = _parse_uuid(folder_id, "folder_id")
    folder = db.scalar(select(DocumentFolder).where(DocumentFolder.id == fid, DocumentFolder.user_id == user.id))
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    doc_uuids = [_parse_uuid(d, "documentIds") for d in payload.documentIds]
    if doc_uuids:
        count = db.scalar(
            select(func.count()).select_from(MedicalDocument).where(
                MedicalDocument.user_id == user.id, MedicalDocument.id.in_(doc_uuids)
            )
        )
        if count != len(doc_uuids):
            raise HTTPException(status_code=400, detail="One or more documents are invalid")

    # Clear folder membership for docs that were in this folder
    db.execute(
        update(MedicalDocument)
        .where(MedicalDocument.user_id == user.id, MedicalDocument.folder_id == fid)
        .values(folder_id=None)
    )
    if doc_uuids:
        db.execute(
            update(MedicalDocument)
            .where(MedicalDocument.user_id == user.id, MedicalDocument.id.in_(doc_uuids))
            .values(folder_id=fid)
        )
    db.commit()
    db.refresh(folder)
    return document_folder_to_out(db, folder)


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> None:
    fid = _parse_uuid(folder_id, "folder_id")
    folder = db.scalar(select(DocumentFolder).where(DocumentFolder.id == fid, DocumentFolder.user_id == user.id))
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    if folder.share_token:
        db.execute(delete(SharedLink).where(SharedLink.token == folder.share_token))
    db.execute(
        update(MedicalDocument)
        .where(MedicalDocument.user_id == user.id, MedicalDocument.folder_id == fid)
        .values(folder_id=None)
    )
    db.delete(folder)
    db.commit()


# ── Share ───────────────────────────────────────────────────────────────────


def _build_share_response(token: str, expires_at: datetime) -> ShareCreateResponse:
    return ShareCreateResponse(token=token, expiresAt=expires_at, urlPath=f"/shared/{token}")


@router.post("/documents/{doc_id}/share", response_model=ShareCreateResponse)
async def share_document(
    doc_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> ShareCreateResponse:
    uid = _parse_uuid(doc_id, "doc_id")
    doc = db.scalar(select(MedicalDocument).where(MedicalDocument.id == uid, MedicalDocument.user_id == user.id))
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.share_token:
        db.execute(delete(SharedLink).where(SharedLink.token == doc.share_token))
        doc.share_token = None

    token = _new_share_token()
    expires_at = _utcnow() + timedelta(days=7)
    link = SharedLink(
        token=token,
        type=SharedLinkType.document,
        label=doc.name,
        created_by=user.id,
        document_id=doc.id,
        expires_at=expires_at,
    )
    db.add(link)
    doc.share_token = token
    db.commit()
    return _build_share_response(token, expires_at)


@router.post("/folders/{folder_id}/share", response_model=ShareCreateResponse)
async def share_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_patient),
) -> ShareCreateResponse:
    fid = _parse_uuid(folder_id, "folder_id")
    folder = db.scalar(select(DocumentFolder).where(DocumentFolder.id == fid, DocumentFolder.user_id == user.id))
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    if folder.share_token:
        db.execute(delete(SharedLink).where(SharedLink.token == folder.share_token))
        folder.share_token = None
        folder.shared_at = None

    token = _new_share_token()
    expires_at = _utcnow() + timedelta(days=7)
    link = SharedLink(
        token=token,
        type=SharedLinkType.folder,
        label=folder.name,
        created_by=user.id,
        folder_id=folder.id,
        expires_at=expires_at,
    )
    db.add(link)
    folder.share_token = token
    folder.shared_at = _utcnow()
    db.commit()
    return _build_share_response(token, expires_at)
