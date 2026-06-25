from __future__ import annotations

import tempfile
from pathlib import Path

from app.services.file_storage import LocalFileStorage, decode_data_url, safe_storage_key


def test_safe_storage_key_rejects_traversal() -> None:
    try:
        safe_storage_key("../etc/passwd")
        assert False, "expected ValueError"
    except ValueError:
        pass


def test_local_roundtrip() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        st = LocalFileStorage(Path(tmp))
        key = "patient-files/u1/d1-image.jpg"
        st.upload_file(b"hello", key, "image/jpeg")
        body, ct = st.read_file(key)
        assert body == b"hello"
        assert ct == "image/jpeg"
        st.delete_file(key)
        try:
            st.read_file(key)
            assert False, "expected FileNotFoundError"
        except FileNotFoundError:
            pass


def test_decode_data_url_png() -> None:
    raw, ct = decode_data_url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
    assert ct == "image/png"
    assert raw[:8] == b"\x89PNG\r\n\x1a\n"
