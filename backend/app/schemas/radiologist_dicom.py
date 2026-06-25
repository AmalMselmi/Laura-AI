from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.shared_api import SharedLabInfoPayload


ReportStatusLiteral = Literal["none", "generating", "ai_generated", "in_review", "finalized"]


class DicomFileStubIn(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    size_bytes: int = Field(default=0, validation_alias="sizeBytes", serialization_alias="sizeBytes")
    modality: str = ""


class DicomFolderCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    patient_name: str = Field(validation_alias="patientName", serialization_alias="patientName")
    patient_id: str = Field(default="", validation_alias="patientId", serialization_alias="patientId")
    pathology: str = ""
    modality: str = ""
    pacs_imported: bool = Field(default=False, validation_alias="pacsImported", serialization_alias="pacsImported")
    pacs_study_uid: Optional[str] = Field(default=None, validation_alias="pacsStudyUID", serialization_alias="pacsStudyUID")
    initial_files: List[DicomFileStubIn] = Field(
        default_factory=list, validation_alias="initialFiles", serialization_alias="initialFiles"
    )
    report_content: Optional[str] = Field(default=None, validation_alias="reportContent", serialization_alias="reportContent")


class DicomFileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    name: str
    size_bytes: Optional[int] = Field(default=None, validation_alias="sizeBytes", serialization_alias="sizeBytes")
    modality: Optional[str] = None
    upload_date: datetime = Field(validation_alias="uploadDate", serialization_alias="uploadDate")


class DicomFolderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    patient_name: str = Field(validation_alias="patientName", serialization_alias="patientName")
    patient_id: Optional[str] = Field(default=None, validation_alias="patientId", serialization_alias="patientId")
    pathology: Optional[str] = None
    modality: Optional[str] = None
    report_content: Optional[str] = Field(default=None, validation_alias="reportContent", serialization_alias="reportContent")
    report_status: ReportStatusLiteral = Field(validation_alias="reportStatus", serialization_alias="reportStatus")
    share_token: Optional[str] = Field(default=None, validation_alias="shareToken", serialization_alias="shareToken")
    pacs_imported: bool = Field(validation_alias="pacsImported", serialization_alias="pacsImported")
    pacs_study_uid: Optional[str] = Field(default=None, validation_alias="pacsStudyUID", serialization_alias="pacsStudyUID")
    finalized_at: Optional[datetime] = Field(default=None, validation_alias="finalizedAt", serialization_alias="finalizedAt")
    created_at: datetime = Field(validation_alias="createdAt", serialization_alias="createdAt")
    updated_at: datetime = Field(validation_alias="updatedAt", serialization_alias="updatedAt")
    files: List[DicomFileOut] = Field(default_factory=list)


class DicomFolderReportUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    report_content: str = Field(validation_alias="reportContent", serialization_alias="reportContent")
    finalize: bool = False


class DicomFolderShareRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    label: Optional[str] = None
    lab: Optional[SharedLabInfoPayload] = None
    radiologist_title: str = Field(
        default="Médecin Radiologue", validation_alias="radiologistTitle", serialization_alias="radiologistTitle"
    )
    radiologist_specialty: str = Field(
        default="Imagerie médicale", validation_alias="radiologistSpecialty", serialization_alias="radiologistSpecialty"
    )


class ReportGenerateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["generating"] = "generating"
    folder_id: str = Field(validation_alias="folderId", serialization_alias="folderId")
    job_id: str = Field(validation_alias="jobId", serialization_alias="jobId")


class RadiologistProfileOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    title: str = "Médecin Radiologue"
    specialty: str = "Imagerie médicale"


class RadiologistLabUpdateRequest(BaseModel):
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
    clearLogo: bool = False
    logoDataUrl: Optional[str] = Field(default=None, validation_alias="logoDataUrl", serialization_alias="logoDataUrl")


class RadiologistProfileUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    title: str = "Médecin Radiologue"
    specialty: str = "Imagerie médicale"


class RadiologistLabContextResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    lab: SharedLabInfoPayload
    profile: RadiologistProfileOut


class RadiologistStorageQuotaOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    used_gb: float = Field(serialization_alias="usedGb")
    allocated_gb: float = Field(serialization_alias="allocatedGb")
    unlimited: bool = False
