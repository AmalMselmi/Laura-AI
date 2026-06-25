from pathlib import Path
from typing import Optional

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Laura AI API"
    app_env: str = "development"
    app_debug: bool = True
    api_prefix: str = "/api"

    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost",
            "http://127.0.0.1",
            "http://localhost:80",
            "http://127.0.0.1:80",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]
    )

    # Default matches `docker compose up db` (host port 5433, user laura). Override with DATABASE_URL.
    database_url: str = "postgresql+psycopg2://laura:laura@127.0.0.1:5433/laura_ai"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = Field(
        default="change-me",
        validation_alias=AliasChoices("JWT_SECRET", "JWT_SECRET_KEY"),
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    refresh_token_expire_days: int = 30
    # False so http://localhost dev works; set True in production (HTTPS).
    refresh_cookie_secure: bool = False

    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"

    dicom_storage_path: str = "./data/dicom_uploads"
    local_uploads_path: str = "./uploads"

    s3_bucket: Optional[str] = None
    s3_region: str = "us-east-1"
    s3_access_key: Optional[str] = None
    s3_secret_key: Optional[str] = None
    s3_endpoint_url: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("S3_ENDPOINT_URL", "S3_ENDPOINT"),
    )
    s3_public_base_url: Optional[str] = None

    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: Optional[str] = None

    enable_pacs_integration: bool = True
    enable_ai_scan: bool = True
    max_upload_mb: int = Field(default=50, ge=1, le=512)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("api_prefix", mode="before")
    @classmethod
    def _normalize_api_prefix(cls, v: object) -> str:
        """Empty ``API_PREFIX`` used to drop ``/api`` from generated paths → 404 on ``/api/health`` for the SPA."""
        if v is None:
            return "/api"
        s = str(v).strip()
        if not s:
            return "/api"
        if not s.startswith("/"):
            s = f"/{s}"
        s = s.rstrip("/")
        return s if s else "/api"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _parse_allowed_origins(cls, v: object) -> object:
        if isinstance(v, str):
            parts = [p.strip() for p in v.split(",") if p.strip()]
            return parts if parts else v
        return v

    def s3_lab_logos_enabled(self) -> bool:
        return bool(self.s3_bucket and self.s3_access_key and self.s3_secret_key)

    @property
    def max_scan_upload_bytes(self) -> int:
        return max(1, self.max_upload_mb) * 1024 * 1024

    @property
    def dicom_storage_dir(self) -> Path:
        return Path(self.dicom_storage_path).resolve()

    @property
    def local_uploads_dir(self) -> Path:
        return Path(self.local_uploads_path).resolve()


settings = Settings()
