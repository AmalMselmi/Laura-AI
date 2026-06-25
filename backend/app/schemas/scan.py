from __future__ import annotations

from typing import Any, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class MeasurementModel(BaseModel):
    size: Optional[str] = None
    dimension: Optional[str] = None
    volume: Optional[str] = None


class FindingModel(BaseModel):
    severity: Literal["critical", "important", "moderate", "minor"]
    category: str
    title: str
    description: str
    location: Optional[str] = None
    measurements: Optional[MeasurementModel] = None
    classification: Optional[str] = None
    characteristics: Optional[List[str]] = None


class RecommendationModel(BaseModel):
    priority: Literal["urgent", "high", "medium", "low"]
    title: str
    description: str
    timeframe: Optional[str] = None
    action: Optional[str] = None


class TechnicalDetailsModel(BaseModel):
    modality: Optional[str] = None
    bodyPart: Optional[str] = None
    slices: Optional[int] = None
    contrast: Optional[bool] = None
    acquisitionDate: Optional[str] = None


class ScanAnalyzeRequest(BaseModel):
    fileBase64: str
    mimeType: str
    fileName: str
    userId: Optional[str] = None


class ScanAnalyzeResponse(BaseModel):
    type: str
    examType: Optional[str] = None
    anatomicalRegion: Optional[str] = None
    confidence: int
    findings: List[FindingModel]
    normalFindings: Optional[List[str]] = None
    recommendations: List[RecommendationModel]
    technicalDetails: Optional[TechnicalDetailsModel] = None
    disclaimer: str
    suggestedName: str
    suggestedPathology: Optional[str] = None


class ScanQuotaResponse(BaseModel):
    planId: str
    maxScans: int
    scansUsed: int
    remaining: int
    aiQuota: int
    aiUsed: int


class ScanAnalyzeMultipartResponse(ScanAnalyzeResponse):
    """Same fields as scan analysis plus optional persisted document id (patient multipart flow)."""

    model_config = ConfigDict(populate_by_name=True)

    documentId: Optional[str] = Field(default=None, serialization_alias="documentId")
