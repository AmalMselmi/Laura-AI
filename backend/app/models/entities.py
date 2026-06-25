from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserRole(str, enum.Enum):
    patient = "patient"
    radiologist = "radiologist"
    admin = "admin"


class UserStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    pending = "pending"


class DocumentType(str, enum.Enum):
    ordonnance = "ordonnance"
    analyse = "analyse"
    imagerie = "imagerie"
    rapport = "rapport"
    certificat = "certificat"
    autre = "autre"


class ReportStatus(str, enum.Enum):
    none = "none"
    generating = "generating"
    ai_generated = "ai_generated"
    in_review = "in_review"
    finalized = "finalized"


class SharedLinkType(str, enum.Enum):
    folder = "folder"
    document = "document"
    report = "report"


class PacsProtocol(str, enum.Enum):
    DICOM = "DICOM"
    DICOMweb = "DICOMweb"


class AsyncJobStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class GdprRequestStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column("password_hash", String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole, name="user_role"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    country: Mapped[str] = mapped_column(String(10), nullable=False, server_default=text("'FR'"))
    plan_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("plans.id"), nullable=False, server_default=text("'free'")
    )
    status: Mapped[UserStatus] = mapped_column(
        SqlEnum(UserStatus, name="user_status"), nullable=False, server_default=text("'active'")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    last_active_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    radiologist_title: Mapped[Optional[str]] = mapped_column(String(200))
    radiologist_specialty: Mapped[Optional[str]] = mapped_column(String(255))
    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_role", "role"),
        Index("idx_users_plan", "plan_id"),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))


class Plan(Base):
    __tablename__ = "plans"
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    storage_gb: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    max_scans: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("5"))
    ai_quota: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("5"))
    # Column is JSON in DB (Alembic); list[str] in Python after read/write.
    features: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))


class StorageUsage(Base):
    __tablename__ = "storage_usage"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    used_gb: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False, server_default=text("0"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))


class ScanUsage(Base):
    __tablename__ = "scan_usage"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month: Mapped[date] = mapped_column(Date, nullable=False)
    scans_used: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    ai_used: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    __table_args__ = (
        UniqueConstraint("user_id", "month", name="uq_scan_usage_user_month"),
        Index("idx_scan_usage_month", "user_id", "month"),
    )


class DocumentFolder(Base):
    __tablename__ = "document_folders"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    share_token: Mapped[Optional[str]] = mapped_column(String(50))
    shared_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    __table_args__ = (Index("idx_folders_user", "user_id"),)


class MedicalDocument(Base):
    __tablename__ = "medical_documents"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[DocumentType] = mapped_column(SqlEnum(DocumentType, name="document_type"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    size: Mapped[Optional[str]] = mapped_column(String(20))
    size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger)
    doctor: Mapped[Optional[str]] = mapped_column(String(255))
    pathology: Mapped[Optional[str]] = mapped_column(String(500))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    ai_analyzed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    from_scan: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("document_folders.id", ondelete="SET NULL")
    )
    share_token: Mapped[Optional[str]] = mapped_column(String(50))
    file_url: Mapped[Optional[str]] = mapped_column(String(1000))
    image_data_url: Mapped[Optional[str]] = mapped_column(Text)
    report_content: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    __table_args__ = (
        Index("idx_docs_user", "user_id"),
        Index("idx_docs_folder", "folder_id"),
        Index("idx_docs_date", "date"),
        Index("idx_docs_type", "type"),
        Index("idx_docs_from_scan", "from_scan"),
    )


class DicomFolder(Base):
    __tablename__ = "dicom_folders"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    radiologist_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    patient_id: Mapped[Optional[str]] = mapped_column(String(50))
    pathology: Mapped[Optional[str]] = mapped_column(String(500))
    modality: Mapped[Optional[str]] = mapped_column(String(50))
    report_content: Mapped[Optional[str]] = mapped_column(Text)
    report_status: Mapped[ReportStatus] = mapped_column(
        SqlEnum(ReportStatus, name="report_status"), nullable=False, server_default=text("'none'")
    )
    share_token: Mapped[Optional[str]] = mapped_column(String(50))
    pacs_imported: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    pacs_study_uid: Mapped[Optional[str]] = mapped_column(String(200))
    finalized_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    __table_args__ = (
        Index("idx_dicom_rad", "radiologist_id"),
        Index("idx_dicom_status", "report_status"),
    )


class DicomFile(Base):
    __tablename__ = "dicom_files"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    folder_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("dicom_folders.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger)
    modality: Mapped[Optional[str]] = mapped_column(String(20))
    file_url: Mapped[Optional[str]] = mapped_column(String(1000))
    upload_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))


class SharedLink(Base):
    __tablename__ = "shared_links"
    token: Mapped[str] = mapped_column(String(50), primary_key=True)
    type: Mapped[SharedLinkType] = mapped_column(SqlEnum(SharedLinkType, name="shared_link_type"), nullable=False)
    label: Mapped[Optional[str]] = mapped_column(String(255))
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"))
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("medical_documents.id", ondelete="CASCADE")
    )
    folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("document_folders.id", ondelete="CASCADE")
    )
    dicom_folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid, ForeignKey("dicom_folders.id", ondelete="CASCADE")
    )
    report_data: Mapped[Optional[dict]] = mapped_column(JSON)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    __table_args__ = (
        Index("idx_shared_token", "token"),
        Index("idx_shared_expires", "expires_at"),
    )


class LabInfo(Base):
    __tablename__ = "lab_info"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    name: Mapped[Optional[str]] = mapped_column(String(255))
    address: Mapped[Optional[str]] = mapped_column(Text)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[Optional[str]] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    rpps: Mapped[Optional[str]] = mapped_column(String(50))
    siret: Mapped[Optional[str]] = mapped_column(String(50))
    logo_url: Mapped[Optional[str]] = mapped_column(String(1000))
    logo_data_url: Mapped[Optional[str]] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))


class PacsServer(Base):
    __tablename__ = "pacs_servers"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    radiologist_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("104"))
    ae_title: Mapped[str] = mapped_column(String(50), nullable=False)
    calling_ae_title: Mapped[str] = mapped_column(String(50), nullable=False, server_default=text("'LAURA_AI'"))
    protocol: Mapped[PacsProtocol] = mapped_column(
        SqlEnum(PacsProtocol, name="pacs_protocol"), nullable=False, server_default=text("'DICOM'")
    )
    web_url: Mapped[Optional[str]] = mapped_column(String(500))
    tls: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    connection_status: Mapped[str] = mapped_column(String(20), nullable=False, server_default=text("'unknown'"))
    last_connected: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    __table_args__ = (Index("idx_pacs_rad", "radiologist_id"),)


class AsyncJob(Base):
    __tablename__ = "async_jobs"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[AsyncJobStatus] = mapped_column(
        SqlEnum(AsyncJobStatus, name="async_job_status"), nullable=False, server_default=text("'queued'")
    )
    progress: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("users.id"))
    input_data: Mapped[Optional[dict]] = mapped_column(JSON)
    result_data: Mapped[Optional[dict]] = mapped_column(JSON)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    __table_args__ = (
        Index("idx_jobs_status", "status"),
        Index("idx_jobs_user", "user_id"),
    )


class GdprRequest(Base):
    __tablename__ = "gdpr_requests"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("users.id", ondelete="SET NULL"))
    user_name: Mapped[Optional[str]] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[GdprRequestStatus] = mapped_column(
        SqlEnum(GdprRequestStatus, name="gdpr_request_status"), nullable=False, server_default=text("'pending'")
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=text("NOW()"))

