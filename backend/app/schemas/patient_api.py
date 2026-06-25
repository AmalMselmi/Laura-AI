from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import DocumentType


class MedicalDocumentOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    type: DocumentType
    date: date
    size: Optional[str] = None
    sizeBytes: Optional[int] = Field(default=None, serialization_alias="sizeBytes")
    doctor: Optional[str] = None
    pathology: Optional[str] = None
    notes: Optional[str] = None
    aiAnalyzed: bool = Field(serialization_alias="aiAnalyzed")
    fromScan: bool = Field(serialization_alias="fromScan")
    folderId: Optional[str] = Field(default=None, serialization_alias="folderId")
    shareToken: Optional[str] = Field(default=None, serialization_alias="shareToken")
    fileUrl: Optional[str] = Field(default=None, serialization_alias="fileUrl")
    imageDataUrl: Optional[str] = Field(default=None, serialization_alias="imageDataUrl")
    reportContent: Optional[str] = Field(default=None, serialization_alias="reportContent")


class MedicalDocumentCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    type: DocumentType
    date: date
    size: Optional[str] = None
    sizeBytes: Optional[int] = Field(default=None, validation_alias="sizeBytes")
    doctor: Optional[str] = None
    pathology: Optional[str] = None
    notes: Optional[str] = None
    aiAnalyzed: bool = Field(default=False, validation_alias="aiAnalyzed")
    fromScan: bool = Field(default=False, validation_alias="fromScan")
    folderId: Optional[str] = Field(default=None, validation_alias="folderId")
    fileUrl: Optional[str] = Field(default=None, validation_alias="fileUrl")
    imageDataUrl: Optional[str] = Field(default=None, validation_alias="imageDataUrl")
    reportContent: Optional[str] = Field(default=None, validation_alias="reportContent")


class DocumentFolderOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    description: Optional[str] = None
    shareToken: Optional[str] = Field(default=None, serialization_alias="shareToken")
    sharedAt: Optional[datetime] = Field(default=None, serialization_alias="sharedAt")
    createdAt: datetime = Field(serialization_alias="createdAt")
    documentIds: List[str] = Field(default_factory=list, serialization_alias="documentIds")


class DocumentFolderCreate(BaseModel):
    name: str
    description: Optional[str] = None


class FolderDocumentsUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    documentIds: List[str] = Field(validation_alias="documentIds")


class ShareCreateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    token: str
    expiresAt: datetime = Field(serialization_alias="expiresAt")
    urlPath: str = Field(serialization_alias="urlPath")


class SharedPayloadOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    token: str
    type: str
    label: Optional[str] = None
    expiresAt: datetime = Field(serialization_alias="expiresAt")
    reportData: Optional[dict] = Field(default=None, serialization_alias="reportData")
