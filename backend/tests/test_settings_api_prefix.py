"""Settings edge cases that affect route URLs (e.g. SPA health checks)."""

from app.core.config import Settings


def test_api_prefix_blank_env_normalizes_to_default() -> None:
    assert Settings(api_prefix="").api_prefix == "/api"


def test_api_prefix_whitespace_normalizes() -> None:
    assert Settings(api_prefix="   ").api_prefix == "/api"


def test_api_prefix_adds_leading_slash() -> None:
    assert Settings(api_prefix="v1").api_prefix == "/v1"


def test_api_prefix_strips_trailing_slash() -> None:
    assert Settings(api_prefix="/api/").api_prefix == "/api"
