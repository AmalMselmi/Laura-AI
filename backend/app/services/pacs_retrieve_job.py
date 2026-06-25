"""Background job: simulate PACS C-MOVE — create DicomFolder + DicomFile rows."""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, List
from uuid import UUID

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.entities import AsyncJob, AsyncJobStatus, DicomFile, DicomFolder, ReportStatus
from app.services.pacs_mock_catalog import study_by_uid


def _utcnow() -> datetime:
    return datetime.utcnow()


def _safe_filename(name: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]+", "_", name)[:180]
    return base or "series.dcm"


def _synthetic_series_files(study: dict[str, Any]) -> List[tuple[str, int, str]]:
    modality = study["modality"]
    body = (study.get("bodyPart") or "study").replace(" ", "_")
    n = max(1, int(study.get("seriesCount") or 1))
    total_img = max(n, int(study.get("imagesCount") or n))
    per = total_img // n
    mod_code = "CT" if "Scanner" in modality else "MR" if modality == "IRM" else "PT" if "PET" in modality else "OT"
    out: List[tuple[str, int, str]] = []
    for i in range(n):
        name = f"{modality.replace('/', '_')}_{body}_serie{i + 1}.dcm"
        size = max(1024, per * 512 * 32)
        out.append((name, size, mod_code))
    return out


def run_pacs_retrieve_job(job_id: UUID, radiologist_id: UUID, study_uids: List[str]) -> None:
    db = SessionLocal()
    try:
        job = db.get(AsyncJob, job_id)
        if not job:
            return
        job.status = AsyncJobStatus.processing
        job.progress = 5
        job.updated_at = _utcnow()
        db.commit()

        root = settings.dicom_storage_dir
        root.mkdir(parents=True, exist_ok=True)

        created_ids: List[str] = []
        total = max(len(study_uids), 1)

        for idx, uid in enumerate(study_uids):
            study = study_by_uid(uid)
            if not study:
                continue

            folder = DicomFolder(
                id=uuid.uuid4(),
                radiologist_id=radiologist_id,
                patient_name=study["patientName"],
                patient_id=study["patientId"],
                pathology=study["studyDescription"],
                modality=study["modality"],
                report_status=ReportStatus.none,
                pacs_imported=True,
                pacs_study_uid=uid,
            )
            if study.get("hasReport") and study.get("reportContent"):
                folder.report_content = study["reportContent"]
                folder.report_status = ReportStatus.ai_generated

            db.add(folder)
            db.flush()

            dest_dir = root / str(folder.id)
            dest_dir.mkdir(parents=True, exist_ok=True)

            for fname, size_bytes, mod_code in _synthetic_series_files(study):
                file_id = uuid.uuid4()
                safe = f"{file_id.hex[:8]}_{_safe_filename(fname)}"
                path = dest_dir / safe
                path.write_bytes(b"DICM" + uuid.uuid4().bytes * 64)

                rel = str(path.relative_to(root))
                db.add(
                    DicomFile(
                        id=file_id,
                        folder_id=folder.id,
                        name=_safe_filename(fname),
                        size_bytes=size_bytes,
                        modality=mod_code,
                        file_url=rel,
                    )
                )

            folder.updated_at = _utcnow()
            created_ids.append(str(folder.id))

            job.progress = min(99, 5 + int((idx + 1) / total * 90))
            job.updated_at = _utcnow()
            db.commit()

        job.status = AsyncJobStatus.completed
        job.progress = 100
        job.completed_at = _utcnow()
        job.updated_at = _utcnow()
        job.result_data = {
            "createdFolderIds": created_ids,
            "folderId": created_ids[0] if created_ids else None,
        }
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
        finally:
            db2.close()
    finally:
        db.close()
