from __future__ import annotations

from uuid import UUID

from app.core.config import settings
from app.services.file_storage import (
    decode_data_url,
    file_extension_for_content_type,
    get_file_storage,
)


def _should_externalize_data_url(data_url: str | None) -> bool:
    if not data_url or not data_url.startswith("data:"):
        return False
    if settings.app_env == "production":
        return True
    if settings.s3_lab_logos_enabled():
        return True
    return len(data_url) > 120_000


def ingest_patient_document_files(
    user_id: UUID,
    doc_id: UUID,
    *,
    file_url: str | None,
    image_data_url: str | None,
) -> tuple[str | None, str | None]:
    """
    Upload large / production data URLs to configured storage; return (file_url, image_data_url)
    suitable for DB persistence. Keeps small inline data URLs in development for demo.
    """
    out_file = file_url
    out_image = image_data_url

    storage = get_file_storage()
    key_base = f"patient-files/{user_id}"

    if _should_externalize_data_url(file_url):
        raw, ct = decode_data_url(file_url)
        k = f"{key_base}/{doc_id}-file{file_extension_for_content_type(ct)}"
        out_file = storage.upload_file(raw, k, ct)

    if _should_externalize_data_url(image_data_url):
        raw, ct = decode_data_url(image_data_url)
        k = f"{key_base}/{doc_id}-image{file_extension_for_content_type(ct)}"
        storage.upload_file(raw, k, ct)
        out_image = None
        if not out_file or (isinstance(out_file, str) and out_file.startswith("data:")):
            out_file = k

    return out_file, out_image
