"""Initial PostgreSQL-like schema with seeds.

Revision ID: 20260430_0001
Revises:
Create Date: 2026-04-30
"""

from __future__ import annotations

import uuid
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "20260430_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("patient", "radiologist", "admin", name="user_role")
    user_status = sa.Enum("active", "suspended", "pending", name="user_status")
    document_type = sa.Enum(
        "ordonnance", "analyse", "imagerie", "rapport", "certificat", "autre", name="document_type"
    )
    report_status = sa.Enum(
        "none", "generating", "ai_generated", "in_review", "finalized", name="report_status"
    )
    shared_link_type = sa.Enum("folder", "document", "report", name="shared_link_type")
    pacs_protocol = sa.Enum("DICOM", "DICOMweb", name="pacs_protocol")
    async_job_status = sa.Enum("queued", "processing", "completed", "failed", name="async_job_status")
    gdpr_request_status = sa.Enum(
        "pending", "in_progress", "completed", name="gdpr_request_status"
    )

    # PostgreSQL: do not call Enum.create() here — create_table emits CREATE TYPE
    # and a prior explicit create would duplicate the same named types.

    op.create_table(
        "plans",
        sa.Column("id", sa.String(length=50), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("storage_gb", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("max_scans", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("ai_quota", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("features", sa.JSON(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("country", sa.String(length=10), nullable=False, server_default="FR"),
        sa.Column("plan_id", sa.String(length=50), sa.ForeignKey("plans.id"), nullable=False, server_default="free"),
        sa.Column("status", user_status, nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("last_active_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "storage_usage",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("used_gb", sa.Numeric(10, 3), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "scan_usage",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("month", sa.Date(), nullable=False),
        sa.Column("scans_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("ai_used", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("user_id", "month", name="uq_scan_usage_user_month"),
    )

    op.create_table(
        "document_folders",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("share_token", sa.String(length=50), nullable=True),
        sa.Column("shared_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "medical_documents",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", document_type, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("size", sa.String(length=20), nullable=True),
        sa.Column("size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("doctor", sa.String(length=255), nullable=True),
        sa.Column("pathology", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("ai_analyzed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("from_scan", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("folder_id", sa.Uuid(), sa.ForeignKey("document_folders.id", ondelete="SET NULL"), nullable=True),
        sa.Column("share_token", sa.String(length=50), nullable=True),
        sa.Column("file_url", sa.String(length=1000), nullable=True),
        sa.Column("image_data_url", sa.Text(), nullable=True),
        sa.Column("report_content", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "dicom_folders",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("radiologist_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("patient_name", sa.String(length=255), nullable=False),
        sa.Column("patient_id", sa.String(length=50), nullable=True),
        sa.Column("pathology", sa.String(length=500), nullable=True),
        sa.Column("modality", sa.String(length=50), nullable=True),
        sa.Column("report_content", sa.Text(), nullable=True),
        sa.Column("report_status", report_status, nullable=False, server_default="none"),
        sa.Column("share_token", sa.String(length=50), nullable=True),
        sa.Column("pacs_imported", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("pacs_study_uid", sa.String(length=200), nullable=True),
        sa.Column("finalized_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "dicom_files",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("folder_id", sa.Uuid(), sa.ForeignKey("dicom_folders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("modality", sa.String(length=20), nullable=True),
        sa.Column("file_url", sa.String(length=1000), nullable=True),
        sa.Column("upload_date", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "shared_links",
        sa.Column("token", sa.String(length=50), primary_key=True),
        sa.Column("type", shared_link_type, nullable=False),
        sa.Column("label", sa.String(length=255), nullable=True),
        sa.Column("created_by", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("document_id", sa.Uuid(), sa.ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=True),
        sa.Column("folder_id", sa.Uuid(), sa.ForeignKey("document_folders.id", ondelete="CASCADE"), nullable=True),
        sa.Column("dicom_folder_id", sa.Uuid(), sa.ForeignKey("dicom_folders.id", ondelete="CASCADE"), nullable=True),
        sa.Column("report_data", sa.JSON(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "lab_info",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("postal_code", sa.String(length=20), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("rpps", sa.String(length=50), nullable=True),
        sa.Column("siret", sa.String(length=50), nullable=True),
        sa.Column("logo_url", sa.String(length=1000), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "pacs_servers",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("radiologist_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("host", sa.String(length=255), nullable=False),
        sa.Column("port", sa.Integer(), nullable=False, server_default="104"),
        sa.Column("ae_title", sa.String(length=50), nullable=False),
        sa.Column("calling_ae_title", sa.String(length=50), nullable=False, server_default="LAURA_AI"),
        sa.Column("protocol", pacs_protocol, nullable=False, server_default="DICOM"),
        sa.Column("web_url", sa.String(length=500), nullable=True),
        sa.Column("tls", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("connection_status", sa.String(length=20), nullable=False, server_default="unknown"),
        sa.Column("last_connected", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "async_jobs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("status", async_job_status, nullable=False, server_default="queued"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("input_data", sa.JSON(), nullable=True),
        sa.Column("result_data", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "gdpr_requests",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_name", sa.String(length=255), nullable=True),
        sa.Column("type", sa.String(length=100), nullable=False),
        sa.Column("status", gdpr_request_status, nullable=False, server_default="pending"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    # Documented indexes.
    op.create_index("idx_users_email", "users", ["email"])
    op.create_index("idx_users_role", "users", ["role"])
    op.create_index("idx_users_plan", "users", ["plan_id"])
    op.create_index("idx_docs_user", "medical_documents", ["user_id"])
    op.create_index("idx_docs_folder", "medical_documents", ["folder_id"])
    op.create_index("idx_docs_date", "medical_documents", ["date"])
    op.create_index("idx_docs_type", "medical_documents", ["type"])
    op.create_index("idx_docs_from_scan", "medical_documents", ["from_scan"])
    op.create_index("idx_folders_user", "document_folders", ["user_id"])
    op.create_index("idx_shared_token", "shared_links", ["token"])
    op.create_index("idx_shared_expires", "shared_links", ["expires_at"])
    op.create_index("idx_dicom_rad", "dicom_folders", ["radiologist_id"])
    op.create_index("idx_dicom_status", "dicom_folders", ["report_status"])
    op.create_index("idx_pacs_rad", "pacs_servers", ["radiologist_id"])
    op.create_index("idx_jobs_status", "async_jobs", ["status"])
    op.create_index("idx_jobs_user", "async_jobs", ["user_id"])
    op.create_index("idx_scan_usage_month", "scan_usage", ["user_id", "month"])

    # Seeds: plans.
    op.bulk_insert(
        sa.table(
            "plans",
            sa.column("id", sa.String()),
            sa.column("name", sa.String()),
            sa.column("price", sa.Numeric()),
            sa.column("storage_gb", sa.Integer()),
            sa.column("max_scans", sa.Integer()),
            sa.column("ai_quota", sa.Integer()),
            sa.column("features", sa.JSON()),
            sa.column("active", sa.Boolean()),
        ),
        [
            {
                "id": "free",
                "name": "Gratuit",
                "price": 0,
                "storage_gb": 1,
                "max_scans": 5,
                "ai_quota": 5,
                "features": ["5 scans IA/mois", "1 GB stockage"],
                "active": True,
            },
            {
                "id": "starter",
                "name": "Starter",
                "price": 4.99,
                "storage_gb": 5,
                "max_scans": 50,
                "ai_quota": 50,
                "features": ["50 scans IA/mois", "5 GB stockage"],
                "active": True,
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": 9.99,
                "storage_gb": 20,
                "max_scans": -1,
                "ai_quota": 200,
                "features": ["Scans illimités", "20 GB stockage"],
                "active": True,
            },
            {
                "id": "radpro",
                "name": "Radiologue Pro",
                "price": 29.99,
                "storage_gb": 100,
                "max_scans": -1,
                "ai_quota": -1,
                "features": ["DICOM illimité", "100 GB stockage"],
                "active": True,
            },
            {
                "id": "enterprise",
                "name": "Entreprise",
                "price": 0,
                "storage_gb": -1,
                "max_scans": -1,
                "ai_quota": -1,
                "features": ["Tout illimité", "Support dédié"],
                "active": True,
            },
        ],
    )

    # Seeds: demo users (password hashes intentionally deterministic placeholders for demo env).
    op.bulk_insert(
        sa.table(
            "users",
            sa.column("id", sa.Uuid()),
            sa.column("email", sa.String()),
            sa.column("password_hash", sa.String()),
            sa.column("role", user_role),
            sa.column("name", sa.String()),
            sa.column("plan_id", sa.String()),
            sa.column("status", user_status),
            sa.column("country", sa.String()),
        ),
        [
            {
                "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
                "email": "amira.bensalah@email.com",
                "password_hash": "$2b$12$WLiCjJBUXDHSUvpRr7nRaOFiNnY2iG5cuycLPksKH76lg/5qdq4eu",
                "role": "patient",
                "name": "Amira Ben Salah",
                "plan_id": "starter",
                "status": "active",
                "country": "FR",
            },
            {
                "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
                "email": "k.mansour@radiology.com",
                "password_hash": "$2b$12$pnowu0TtIt2ByOS8Anw3sOhVCgPm9h4/1U5le3mzlNvFe37oBv7ei",
                "role": "radiologist",
                "name": "Dr. Karim Mansour",
                "plan_id": "radpro",
                "status": "active",
                "country": "FR",
            },
            {
                "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
                "email": "admin@laura-ai.fr",
                "password_hash": "$2b$12$87uHaW1izexyxNYulM9XaedL93myhw0UDvTknGqFQygLTR2rjqLA.",
                "role": "admin",
                "name": "Super Admin",
                "plan_id": "enterprise",
                "status": "active",
                "country": "FR",
            },
        ],
    )


def downgrade() -> None:
    for idx_name, table_name in [
        ("idx_scan_usage_month", "scan_usage"),
        ("idx_jobs_user", "async_jobs"),
        ("idx_jobs_status", "async_jobs"),
        ("idx_pacs_rad", "pacs_servers"),
        ("idx_dicom_status", "dicom_folders"),
        ("idx_dicom_rad", "dicom_folders"),
        ("idx_shared_expires", "shared_links"),
        ("idx_shared_token", "shared_links"),
        ("idx_folders_user", "document_folders"),
        ("idx_docs_from_scan", "medical_documents"),
        ("idx_docs_type", "medical_documents"),
        ("idx_docs_date", "medical_documents"),
        ("idx_docs_folder", "medical_documents"),
        ("idx_docs_user", "medical_documents"),
        ("idx_users_plan", "users"),
        ("idx_users_role", "users"),
        ("idx_users_email", "users"),
    ]:
        op.drop_index(idx_name, table_name=table_name)

    op.drop_table("gdpr_requests")
    op.drop_table("async_jobs")
    op.drop_table("pacs_servers")
    op.drop_table("lab_info")
    op.drop_table("shared_links")
    op.drop_table("dicom_files")
    op.drop_table("dicom_folders")
    op.drop_table("medical_documents")
    op.drop_table("document_folders")
    op.drop_table("scan_usage")
    op.drop_table("storage_usage")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
    op.drop_table("plans")

    bind = op.get_bind()
    if bind.dialect.name != "sqlite":
        sa.Enum(name="gdpr_request_status").drop(bind, checkfirst=True)
        sa.Enum(name="async_job_status").drop(bind, checkfirst=True)
        sa.Enum(name="pacs_protocol").drop(bind, checkfirst=True)
        sa.Enum(name="shared_link_type").drop(bind, checkfirst=True)
        sa.Enum(name="report_status").drop(bind, checkfirst=True)
        sa.Enum(name="document_type").drop(bind, checkfirst=True)
        sa.Enum(name="user_status").drop(bind, checkfirst=True)
        sa.Enum(name="user_role").drop(bind, checkfirst=True)
