"""Structured API error payloads (code + message) for clients."""

from __future__ import annotations

from fastapi import HTTPException

QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
STORAGE_EXCEEDED = "STORAGE_EXCEEDED"
UNAUTHORIZED_ROLE = "UNAUTHORIZED_ROLE"
TOKEN_EXPIRED = "TOKEN_EXPIRED"
PACS_CONNECTION_FAILED = "PACS_CONNECTION_FAILED"


def api_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})
