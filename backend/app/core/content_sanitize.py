"""Strip HTML/script payloads from user-controlled medical text (defense in depth for clients that render HTML)."""

from __future__ import annotations

import re

# Avoid pathological CPU use on huge blobs.
_MAX_SANITIZE_CHARS = 500_000

_TAG_RE = re.compile(r"<[^>]+>")


def sanitize_medical_text(value: str | None) -> str | None:
    if value is None:
        return None
    if len(value) > _MAX_SANITIZE_CHARS:
        value = value[:_MAX_SANITIZE_CHARS]
    # Remove HTML tags (including script/style); keep plain text and newlines.
    stripped = _TAG_RE.sub("", value)
    # Neutralize common event-handler injections if angle brackets were escaped.
    stripped = re.sub(
        r"(?i)\s(on\w+)\s*=",
        r" data-removed-\1=",
        stripped,
    )
    return stripped
