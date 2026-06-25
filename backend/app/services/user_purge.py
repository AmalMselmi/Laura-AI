"""Remove a user's dependent rows and blob storage before deleting the user row."""

from __future__ import annotations

import shutil
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.entities import AsyncJob, DicomFile, DicomFolder, MedicalDocument
from app.services.file_storage import get_file_storage, is_managed_storage_ref


def _remove_dicom_disk(folder_id: UUID) -> None:
    try:
        ddir = settings.dicom_storage_dir / str(folder_id)
        if ddir.is_dir():
            shutil.rmtree(ddir, ignore_errors=True)
    except OSError:
        pass


def purge_user_dependencies(db: Session, user_id: UUID) -> None:
    """Delete async jobs and storage-backed blobs for this user. DB FK cascades handle the rest on user delete."""
    db.execute(delete(AsyncJob).where(AsyncJob.user_id == user_id))

    storage = get_file_storage()
    docs = list(db.scalars(select(MedicalDocument).where(MedicalDocument.user_id == user_id)).all())
    for d in docs:
        if d.file_url and is_managed_storage_ref(d.file_url):
            try:
                storage.delete_file(d.file_url)
            except OSError:
                pass
        if d.image_data_url and is_managed_storage_ref(d.image_data_url):
            try:
                storage.delete_file(d.image_data_url)
            except OSError:
                pass

    folders = list(db.scalars(select(DicomFolder).where(DicomFolder.radiologist_id == user_id)).all())
    for f in folders:
        _remove_dicom_disk(f.id)
        files = list(db.scalars(select(DicomFile).where(DicomFile.folder_id == f.id)).all())
        for df in files:
            if df.file_url:
                p = settings.dicom_storage_dir / df.file_url
                try:
                    if p.is_file():
                        p.unlink(missing_ok=True)  # type: ignore[arg-type]
                except OSError:
                    pass
