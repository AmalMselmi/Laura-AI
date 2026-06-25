from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.content_sanitize import sanitize_medical_text
from app.schemas.patient_api import MedicalDocumentOut


class SharedFolderPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    description: Optional[str] = None
    documents: List[MedicalDocumentOut] = Field(default_factory=list)


class SharedLabInfoPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = ""
    address: str = ""
    postalCode: str = Field(default="", validation_alias="postalCode", serialization_alias="postalCode")
    city: str = ""
    country: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    rpps: str = ""
    siret: str = ""
    logoDataUrl: str = Field(default="", validation_alias="logoDataUrl", serialization_alias="logoDataUrl")
    logoUrl: Optional[str] = Field(default=None, validation_alias="logoUrl", serialization_alias="logoUrl")


class SharedReportPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    patientName: str = Field(validation_alias="patientName", serialization_alias="patientName")
    patientId: str = Field(validation_alias="patientId", serialization_alias="patientId")
    pathology: str = ""
    modality: str = ""
    content: str = ""
    finalizedAt: str = Field(validation_alias="finalizedAt", serialization_alias="finalizedAt")
    radiologistName: str = Field(validation_alias="radiologistName", serialization_alias="radiologistName")
    radiologistTitle: str = Field(validation_alias="radiologistTitle", serialization_alias="radiologistTitle")
    radiologistSpecialty: str = Field(validation_alias="radiologistSpecialty", serialization_alias="radiologistSpecialty")
    lab: SharedLabInfoPayload

    @field_validator(
        "patientName",
        "patientId",
        "pathology",
        "modality",
        "content",
        "radiologistName",
        "radiologistTitle",
        "radiologistSpecialty",
        mode="before",
    )
    @classmethod
    def _sanitize_strings(cls, v: object) -> str:
        if v is None:
            return ""
        out = sanitize_medical_text(str(v))
        return out if out is not None else ""


class SharedLinkPublicResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    token: str
    type: Literal["folder", "document", "report"]
    label: str
    createdAt: datetime = Field(serialization_alias="createdAt")
    expiresAt: datetime = Field(serialization_alias="expiresAt")
    folder: Optional[SharedFolderPayload] = None
    document: Optional[MedicalDocumentOut] = None
    report: Optional[SharedReportPayload] = None


class ShareReportCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    report: SharedReportPayload
    label: Optional[str] = None
    dicomFolderId: Optional[UUID] = Field(default=None, validation_alias="dicomFolderId")
