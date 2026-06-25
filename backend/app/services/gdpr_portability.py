"""Build a machine-readable portability export for a user (admin-only)."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import (
    DocumentFolder,
    DicomFile,
    DicomFolder,
    GdprRequest,
    LabInfo,
    MedicalDocument,
    PacsServer,
    ScanUsage,
    SharedLink,
    StorageUsage,
    User,
)


def _iso(v: date | datetime | None) -> str | None:
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.isoformat()
    return v.isoformat()


def build_portability_export(db: Session, user_id: UUID) -> dict[str, Any]:
    u = db.get(User, user_id)
    if not u:
        return {}

    su = db.scalar(select(StorageUsage).where(StorageUsage.user_id == user_id))
    scans = list(db.scalars(select(ScanUsage).where(ScanUsage.user_id == user_id)).all())
    folders = list(db.scalars(select(DocumentFolder).where(DocumentFolder.user_id == user_id)).all())
    docs = list(db.scalars(select(MedicalDocument).where(MedicalDocument.user_id == user_id)).all())
    gdpr_reqs = list(db.scalars(select(GdprRequest).where(GdprRequest.user_id == user_id)).all())
    lab = db.scalar(select(LabInfo).where(LabInfo.user_id == user_id))
    dicom_folders = list(db.scalars(select(DicomFolder).where(DicomFolder.radiologist_id == user_id)).all())
    pacs = list(db.scalars(select(PacsServer).where(PacsServer.radiologist_id == user_id)).all())

    shared_created = list(db.scalars(select(SharedLink).where(SharedLink.created_by == user_id)).all())

    dicom_out: list[dict[str, Any]] = []
    for df in dicom_folders:
        files = list(db.scalars(select(DicomFile).where(DicomFile.folder_id == df.id)).all())
        dicom_out.append(
            {
                "id": str(df.id),
                "patientName": df.patient_name,
                "patientId": df.patient_id,
                "pathology": df.pathology,
                "modality": df.modality,
                "reportStatus": df.report_status.value if hasattr(df.report_status, "value") else str(df.report_status),
                "pacsImported": df.pacs_imported,
                "createdAt": _iso(df.created_at),
                "files": [
                    {
                        "id": str(f.id),
                        "name": f.name,
                        "sizeBytes": f.size_bytes,
                        "modality": f.modality,
                        "fileUrl": f.file_url,
                    }
                    for f in files
                ],
            }
        )

    return {
        "exportVersion": 1,
        "user": {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "role": u.role.value if hasattr(u.role, "value") else str(u.role),
            "planId": u.plan_id,
            "status": u.status.value if hasattr(u.status, "value") else str(u.status),
            "country": u.country,
            "createdAt": _iso(u.created_at),
            "updatedAt": _iso(u.updated_at),
            "lastActiveAt": _iso(u.last_active_at),
        },
        "storageUsage": {"usedGb": float(su.used_gb), "updatedAt": _iso(su.updated_at)} if su else None,
        "scanUsage": [
            {"month": s.month.isoformat(), "scansUsed": s.scans_used, "aiUsed": s.ai_used} for s in scans
        ],
        "documentFolders": [
            {
                "id": str(f.id),
                "name": f.name,
                "description": f.description,
                "shareToken": f.share_token,
                "sharedAt": _iso(f.shared_at),
                "createdAt": _iso(f.created_at),
            }
            for f in folders
        ],
        "medicalDocuments": [
            {
                "id": str(d.id),
                "name": d.name,
                "type": d.type.value if hasattr(d.type, "value") else str(d.type),
                "date": d.date.isoformat(),
                "size": d.size,
                "folderId": str(d.folder_id) if d.folder_id else None,
                "aiAnalyzed": d.ai_analyzed,
                "fromScan": d.from_scan,
                "fileUrl": d.file_url if d.file_url and not str(d.file_url).startswith("data:") else None,
                "hasImageDataUrl": bool(d.image_data_url),
                "reportContentLength": len(d.report_content or ""),
            }
            for d in docs
        ],
        "gdprRequests": [
            {
                "id": str(r.id),
                "type": r.type,
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
                "notes": r.notes,
                "createdAt": _iso(r.created_at),
            }
            for r in gdpr_reqs
        ],
        "labInfo": (
            {
                "name": lab.name,
                "address": lab.address,
                "city": lab.city,
                "postalCode": lab.postal_code,
                "country": lab.country,
                "phone": lab.phone,
                "email": lab.email,
                "website": lab.website,
                "rpps": lab.rpps,
                "siret": lab.siret,
                "hasLogo": bool(lab.logo_url or lab.logo_data_url),
            }
            if lab
            else None
        ),
        "dicomFolders": dicom_out,
        "pacsServers": [
            {
                "id": str(s.id),
                "name": s.name,
                "host": s.host,
                "port": s.port,
                "aeTitle": s.ae_title,
                "active": s.active,
            }
            for s in pacs
        ],
        "sharedLinksCreated": [
            {
                "token": sl.token,
                "type": sl.type.value if hasattr(sl.type, "value") else str(sl.type),
                "label": sl.label,
                "expiresAt": _iso(sl.expires_at),
            }
            for sl in shared_created
        ],
    }
