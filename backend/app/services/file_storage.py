from __future__ import annotations

import base64
import re
from pathlib import Path
from typing import Protocol, runtime_checkable

import boto3
from botocore.client import BaseClient

from app.core.config import settings


def s3_configured() -> bool:
    return bool(settings.s3_bucket and settings.s3_access_key and settings.s3_secret_key)


def _s3_client() -> BaseClient:
    kw: dict = {
        "service_name": "s3",
        "region_name": settings.s3_region,
        "aws_access_key_id": settings.s3_access_key,
        "aws_secret_access_key": settings.s3_secret_key,
    }
    if settings.s3_endpoint_url:
        kw["endpoint_url"] = settings.s3_endpoint_url
    return boto3.client(**kw)  # type: ignore[arg-type]


def safe_storage_key(key: str) -> str:
    k = key.strip().replace("\\", "/").lstrip("/")
    if not k or ".." in k.split("/"):
        raise ValueError("invalid storage key")
    return k


@runtime_checkable
class FileStorage(Protocol):
    def upload_file(self, content: bytes, key: str, content_type: str) -> str:
        """Persist bytes under key; return storage key stored in DB."""

    def delete_file(self, key: str) -> None:
        """Remove object; key matches upload_file return value."""

    def get_presigned_url(self, key: str, *, expires_in: int = 3600) -> str:
        """Time-limited GET URL (S3) or storage key (local; use authenticated /file routes)."""

    def read_file(self, key: str) -> tuple[bytes, str]:
        """Return body and content-type for server-side streaming."""


class S3FileStorage:
    def upload_file(self, content: bytes, key: str, content_type: str) -> str:
        sk = safe_storage_key(key)
        client = _s3_client()
        client.put_object(
            Bucket=settings.s3_bucket,
            Key=sk,
            Body=content,
            ContentType=content_type,
        )
        return sk

    def delete_file(self, key: str) -> None:
        if not key or key.startswith("http") or key.startswith("data:"):
            return
        sk = safe_storage_key(key)
        client = _s3_client()
        client.delete_object(Bucket=settings.s3_bucket, Key=sk)

    def get_presigned_url(self, key: str, *, expires_in: int = 3600) -> str:
        sk = safe_storage_key(key)
        client = _s3_client()
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": sk},
            ExpiresIn=expires_in,
        )

    def read_file(self, key: str) -> tuple[bytes, str]:
        sk = safe_storage_key(key)
        client = _s3_client()
        obj = client.get_object(Bucket=settings.s3_bucket, Key=sk)
        body = obj["Body"].read()
        ct = (obj.get("ContentType") or "application/octet-stream").split(";")[0].strip()
        return body, ct


class LocalFileStorage:
    def __init__(self, root: Path) -> None:
        self._root = root.resolve()
        self._root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        sk = safe_storage_key(key)
        path = (self._root / sk).resolve()
        if self._root not in path.parents and path != self._root:
            raise ValueError("invalid storage path")
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    def upload_file(self, content: bytes, key: str, content_type: str) -> str:
        sk = safe_storage_key(key)
        path = self._path(sk)
        path.write_bytes(content)
        meta = path.parent / f"{path.name}.meta.txt"
        meta.write_text(content_type, encoding="utf-8")
        return sk

    def delete_file(self, key: str) -> None:
        if not key or key.startswith("http") or key.startswith("data:"):
            return
        try:
            sk = safe_storage_key(key)
        except ValueError:
            return
        path = self._path(sk)
        if path.is_file():
            path.unlink(missing_ok=True)
        meta = path.parent / f"{path.name}.meta.txt"
        if meta.is_file():
            meta.unlink(missing_ok=True)

    def get_presigned_url(self, key: str, *, expires_in: int = 3600) -> str:
        del expires_in
        sk = safe_storage_key(key)
        return sk

    def read_file(self, key: str) -> tuple[bytes, str]:
        sk = safe_storage_key(key)
        path = self._path(sk)
        if not path.is_file():
            raise FileNotFoundError(sk)
        meta = path.parent / f"{path.name}.meta.txt"
        ct = "application/octet-stream"
        if meta.is_file():
            ct = meta.read_text(encoding="utf-8").strip() or ct
        return path.read_bytes(), ct


def get_file_storage() -> FileStorage:
    if s3_configured():
        return S3FileStorage()
    return LocalFileStorage(settings.local_uploads_dir)


def is_managed_storage_ref(ref: str | None) -> bool:
    if not ref:
        return False
    if ref.startswith("http://") or ref.startswith("https://") or ref.startswith("data:"):
        return False
    try:
        safe_storage_key(ref)
    except ValueError:
        return False
    return True


_DATA_URL_RE = re.compile(r"^data:([^;]+);base64,(.+)$", re.DOTALL)


_MAX_DATA_URL_BYTES = 50 * 1024 * 1024


def decode_data_url(data_url: str) -> tuple[bytes, str]:
    m = _DATA_URL_RE.match(data_url.strip())
    if not m:
        raise ValueError("invalid data URL")
    mime = m.group(1).strip().lower()

    raw = base64.b64decode(m.group(2), validate=True)
    if len(raw) > _MAX_DATA_URL_BYTES:
        raise ValueError("data URL payload too large")
    if mime not in ("image/png", "image/jpeg", "image/webp", "application/pdf"):
        raise ValueError("unsupported data URL media type")
    return raw, mime


def file_extension_for_content_type(content_type: str) -> str:
    ct = content_type.split(";")[0].strip().lower()
    if ct == "image/png":
        return ".png"
    if ct in ("image/jpeg", "image/jpg"):
        return ".jpg"
    if ct == "image/webp":
        return ".webp"
    if ct == "application/pdf":
        return ".pdf"
    return ".bin"
