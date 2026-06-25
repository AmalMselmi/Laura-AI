from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class PacsServerCreateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    host: str
    port: int = 104
    ae_title: str = Field(validation_alias="aeTitle", serialization_alias="aeTitle")
    calling_ae_title: str = Field(
        default="LAURA_AI", validation_alias="callingAeTitle", serialization_alias="callingAeTitle"
    )
    protocol: Literal["DICOM", "DICOMweb"] = "DICOM"
    web_url: Optional[str] = Field(default=None, validation_alias="webUrl", serialization_alias="webUrl")
    tls: bool = False
    active: bool = True


class PacsServerUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    ae_title: Optional[str] = Field(default=None, validation_alias="aeTitle", serialization_alias="aeTitle")
    calling_ae_title: Optional[str] = Field(
        default=None, validation_alias="callingAeTitle", serialization_alias="callingAeTitle"
    )
    protocol: Optional[Literal["DICOM", "DICOMweb"]] = None
    web_url: Optional[str] = Field(default=None, validation_alias="webUrl", serialization_alias="webUrl")
    tls: Optional[bool] = None
    active: Optional[bool] = None


class PacsServerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    name: str
    host: str
    port: int
    ae_title: str = Field(validation_alias="aeTitle", serialization_alias="aeTitle")
    calling_ae_title: str = Field(validation_alias="callingAeTitle", serialization_alias="callingAeTitle")
    protocol: str
    web_url: Optional[str] = Field(default=None, validation_alias="webUrl", serialization_alias="webUrl")
    tls: bool
    active: bool
    connection_status: str = Field(
        validation_alias="connectionStatus", serialization_alias="connectionStatus"
    )
    last_connected: Optional[datetime] = Field(
        default=None, validation_alias="lastConnected", serialization_alias="lastConnected"
    )
    created_at: datetime = Field(validation_alias="createdAt", serialization_alias="createdAt")


class PacsQueryRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    patient_name: Optional[str] = Field(default=None, validation_alias="patientName", serialization_alias="patientName")
    patient_id: Optional[str] = Field(default=None, validation_alias="patientId", serialization_alias="patientId")
    study_date_from: Optional[str] = Field(
        default=None, validation_alias="studyDateFrom", serialization_alias="studyDateFrom"
    )
    study_date_to: Optional[str] = Field(
        default=None, validation_alias="studyDateTo", serialization_alias="studyDateTo"
    )
    modality: Optional[str] = None


class PacsStudyOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    study_uid: str = Field(validation_alias="studyUID", serialization_alias="studyUID")
    patient_name: str = Field(validation_alias="patientName", serialization_alias="patientName")
    patient_id: str = Field(validation_alias="patientId", serialization_alias="patientId")
    patient_birth_date: str = Field(
        validation_alias="patientBirthDate", serialization_alias="patientBirthDate"
    )
    study_date: str = Field(validation_alias="studyDate", serialization_alias="studyDate")
    study_time: str = Field(validation_alias="studyTime", serialization_alias="studyTime")
    study_description: str = Field(
        validation_alias="studyDescription", serialization_alias="studyDescription"
    )
    modality: str
    series_count: int = Field(validation_alias="seriesCount", serialization_alias="seriesCount")
    images_count: int = Field(validation_alias="imagesCount", serialization_alias="imagesCount")
    accession_number: str = Field(
        validation_alias="accessionNumber", serialization_alias="accessionNumber"
    )
    referring_physician: str = Field(
        validation_alias="referringPhysician", serialization_alias="referringPhysician"
    )
    institution_name: str = Field(
        validation_alias="institutionName", serialization_alias="institutionName"
    )
    body_part: str = Field(validation_alias="bodyPart", serialization_alias="bodyPart")
    status: Literal["available", "archived"]
    has_report: bool = Field(validation_alias="hasReport", serialization_alias="hasReport")
    report_content: Optional[str] = Field(
        default=None, validation_alias="reportContent", serialization_alias="reportContent"
    )


class PacsRetrieveRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    study_uids: List[str] = Field(validation_alias="studyUIDs", serialization_alias="studyUIDs")


class PacsRetrieveResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(validation_alias="jobId", serialization_alias="jobId")


class AsyncJobOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    job_id: str = Field(validation_alias="jobId", serialization_alias="jobId")
    status: str
    progress: int
    type: str
    result_data: Optional[dict] = Field(default=None, validation_alias="resultData", serialization_alias="resultData")
    error_message: Optional[str] = Field(
        default=None, validation_alias="errorMessage", serialization_alias="errorMessage"
    )
    created_at: datetime = Field(validation_alias="createdAt", serialization_alias="createdAt")
    completed_at: Optional[datetime] = Field(
        default=None, validation_alias="completedAt", serialization_alias="completedAt"
    )


def pacs_server_to_out(row) -> PacsServerOut:
    from app.models.entities import PacsServer

    s: PacsServer = row
    proto = s.protocol.value if hasattr(s.protocol, "value") else str(s.protocol)
    return PacsServerOut(
        id=str(s.id),
        name=s.name,
        host=s.host,
        port=s.port,
        ae_title=s.ae_title,
        calling_ae_title=s.calling_ae_title,
        protocol=proto,
        web_url=s.web_url,
        tls=s.tls,
        active=s.active,
        connection_status=s.connection_status,
        last_connected=s.last_connected,
        created_at=s.created_at,
    )


def study_dict_to_out(d: dict) -> PacsStudyOut:
    return PacsStudyOut(
        study_uid=d["studyUID"],
        patient_name=d["patientName"],
        patient_id=d["patientId"],
        patient_birth_date=d["patientBirthDate"],
        study_date=d["studyDate"],
        study_time=d["studyTime"],
        study_description=d["studyDescription"],
        modality=d["modality"],
        series_count=d["seriesCount"],
        images_count=d["imagesCount"],
        accession_number=d["accessionNumber"],
        referring_physician=d["referringPhysician"],
        institution_name=d["institutionName"],
        body_part=d["bodyPart"],
        status=d["status"],
        has_report=d["hasReport"],
        report_content=d.get("reportContent"),
    )
