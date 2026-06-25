from __future__ import annotations

import base64
import re
import uuid
from typing import Optional
from uuid import UUID

import boto3
from botocore.client import BaseClient

from app.core.config import settings

_MAX_LOGO_BYTES = 5 * 1024 * 1024


def is_png_or_jpeg(raw: bytes) -> bool:
    if len(raw) < 8:
        return False
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if raw[:2] == b"\xff\xd8":
        return True
    return False


def image_content_type(raw: bytes) -> str:
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    return "image/jpeg"


def decode_data_url(data_url: str) -> tuple[bytes, str]:
    m = re.match(r"^data:(image/(?:png|jpeg));base64,(.+)$", data_url.strip(), re.DOTALL)
    if not m:
        raise ValueError("invalid logo data URL")
    mime = m.group(1)
    if mime == "image/png":
        ct = "image/png"
    else:
        ct = "image/jpeg"
    raw = base64.b64decode(m.group(2), validate=True)
    return raw, ct


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


def public_url_for_key(key: str) -> str:
    if settings.s3_public_base_url:
        return f"{settings.s3_public_base_url.rstrip('/')}/{key}"
    if settings.s3_endpoint_url and settings.s3_bucket:
        return f"{settings.s3_endpoint_url.rstrip('/')}/{settings.s3_bucket}/{key}"
    return f"https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com/{key}"


def upload_lab_logo_png_jpeg(raw: bytes, content_type: str | None, user_id: UUID) -> str:
    if len(raw) > _MAX_LOGO_BYTES:
        raise ValueError("logo too large")
    if not is_png_or_jpeg(raw):
        raise ValueError("logo must be PNG or JPEG")
    ct = content_type if content_type in ("image/png", "image/jpeg") else image_content_type(raw)
    ext = ".png" if ct == "image/png" else ".jpg"
    key = f"lab-logos/{user_id}/{uuid.uuid4().hex}{ext}"
    client = _s3_client()
    client.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=raw,
        ContentType=ct,
    )
    return public_url_for_key(key)


def store_logo_local_data_url(raw: bytes, content_type: str | None) -> str:
    if len(raw) > _MAX_LOGO_BYTES:
        raise ValueError("logo too large")
    if not is_png_or_jpeg(raw):
        raise ValueError("logo must be PNG or JPEG")
    ct = content_type if content_type in ("image/png", "image/jpeg") else image_content_type(raw)
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:{ct};base64,{b64}"
