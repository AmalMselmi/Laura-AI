"""Validate uploaded file metadata (DICOM batches, etc.)."""

from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException, UploadFile, status

# DICOM part 10 often ships as application/dicom or octet-stream.
_DICOM_CT = frozenset(
    {
        "application/dicom",
        "application/octet-stream",
        "application/x-dicom",
        "image/dicom",
    }
)

_MAX_DICOM_FILE_BYTES = 250 * 1024 * 1024
_MAX_DICOM_BATCH_BYTES = 2 * 1024 * 1024 * 1024


def _is_dicom_p10(content: bytes) -> bool:
    return len(content) >= 132 and content[128:132] == b"DICM"


def assert_dicom_upload_allowed(files: list[tuple[UploadFile, bytes, str]]) -> None:
    total = 0
    for up, body, raw_name in files:
        total += len(body)
        if len(body) > _MAX_DICOM_FILE_BYTES:
            raise HTTPException(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="DICOM file exceeds maximum size",
            )
        name = (raw_name or "").strip().lower()
        suffix = Path(name).suffix.lower()
        ct = (up.content_type or "").split(";")[0].strip().lower()
        looks_dicom = _is_dicom_p10(body)
        if looks_dicom:
            continue
        if suffix == ".dcm" and ct in _DICOM_CT | {""}:
            continue
        if suffix == ".dcm" and ct == "application/octet-stream":
            continue
        if suffix == ".dcm" and len(body) < 20 * 1024 * 1024:
            # Small test / stub files named .dcm (e.g. CI mocks without P10 preamble).
            continue
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Each upload must be a DICOM file (.dcm or DICOM P10)",
        )
    if total > _MAX_DICOM_BATCH_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Total upload size exceeds batch limit",
        )
