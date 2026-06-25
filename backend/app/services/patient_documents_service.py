from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import DocumentFolder, MedicalDocument
from app.schemas.patient_api import DocumentFolderOut, MedicalDocumentOut
from app.services.file_storage import is_managed_storage_ref
from app.core.content_sanitize import sanitize_medical_text


def medical_document_to_out(doc: MedicalDocument, *, shared_token: str | None = None) -> MedicalDocumentOut:
    file_url = doc.file_url
    if is_managed_storage_ref(file_url):
        if shared_token:
            file_url = f"/api/shared/{shared_token}/documents/{doc.id}/file"
        else:
            file_url = f"/api/patient/documents/{doc.id}/file"
    return MedicalDocumentOut(
        id=str(doc.id),
        name=(sanitize_medical_text(doc.name) or doc.name),
        type=doc.type,
        date=doc.date,
        size=doc.size,
        sizeBytes=doc.size_bytes,
        doctor=sanitize_medical_text(doc.doctor),
        pathology=sanitize_medical_text(doc.pathology),
        notes=sanitize_medical_text(doc.notes),
        aiAnalyzed=doc.ai_analyzed,
        fromScan=doc.from_scan,
        folderId=str(doc.folder_id) if doc.folder_id else None,
        shareToken=doc.share_token,
        fileUrl=file_url,
        imageDataUrl=doc.image_data_url,
        reportContent=sanitize_medical_text(doc.report_content),
    )


def document_folder_to_out(db: Session, folder: DocumentFolder) -> DocumentFolderOut:
    doc_ids = db.scalars(
        select(MedicalDocument.id).where(MedicalDocument.folder_id == folder.id)
    ).all()
    return DocumentFolderOut(
        id=str(folder.id),
        name=(sanitize_medical_text(folder.name) or folder.name),
        description=sanitize_medical_text(folder.description),
        shareToken=folder.share_token,
        sharedAt=folder.shared_at,
        createdAt=folder.created_at,
        documentIds=[str(i) for i in doc_ids],
    )


def load_folder_documents(db: Session, folder_id: UUID, user_id: UUID) -> list[MedicalDocument]:
    return list(
        db.scalars(
            select(MedicalDocument)
            .where(MedicalDocument.user_id == user_id, MedicalDocument.folder_id == folder_id)
            .order_by(MedicalDocument.date.desc())
        ).all()
    )
