from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AdminStatsOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    totalUsers: int = Field(serialization_alias="totalUsers")
    activeUsers: int = Field(serialization_alias="activeUsers")
    suspendedUsers: int = Field(serialization_alias="suspendedUsers")
    pendingUsers: int = Field(serialization_alias="pendingUsers")
    patients: int = 0
    radiologists: int = 0
    admins: int = 0
    totalStorageUsedGb: float = Field(serialization_alias="totalStorageUsedGb")
    pendingGdprRequests: int = Field(serialization_alias="pendingGdprRequests")
    estimatedMonthlyRevenue: float = Field(serialization_alias="estimatedMonthlyRevenue")
    planDistribution: List[dict] = Field(default_factory=list, serialization_alias="planDistribution")


class AdminUserOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    email: str
    role: str
    planId: str = Field(serialization_alias="planId")
    status: str
    storageUsedGb: float = Field(serialization_alias="storageUsedGb")
    storageAllocatedGb: float = Field(serialization_alias="storageAllocatedGb")
    createdAt: datetime = Field(serialization_alias="createdAt")
    lastActiveAt: datetime = Field(serialization_alias="lastActiveAt")


class AdminUserStatusPatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["active", "suspended", "pending"]


class AdminUserPlanPatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    planId: str = Field(validation_alias="planId", serialization_alias="planId")


class AdminPlanOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    price: float
    storageGb: int = Field(serialization_alias="storageGb")
    maxScans: int = Field(serialization_alias="maxScans")
    aiQuota: int = Field(serialization_alias="aiQuota")
    features: List[str] = Field(default_factory=list)
    active: bool
    userCount: int = Field(serialization_alias="userCount")


class AdminPlanUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    price: float
    storageGb: int = Field(validation_alias="storageGb", serialization_alias="storageGb")
    maxScans: int = Field(validation_alias="maxScans", serialization_alias="maxScans")
    aiQuota: int = Field(validation_alias="aiQuota", serialization_alias="aiQuota")
    features: List[str] = Field(default_factory=list)
    active: bool


class AdminStorageSummaryOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    totalUsedGb: float = Field(serialization_alias="totalUsedGb")
    totalAllocatedGb: float = Field(serialization_alias="totalAllocatedGb")
    userCount: int = Field(serialization_alias="userCount")


class AdminStorageUserRow(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    userId: str = Field(serialization_alias="userId")
    name: str
    email: str
    role: str
    planId: str = Field(serialization_alias="planId")
    usedGb: float = Field(serialization_alias="usedGb")
    allocatedGb: float = Field(serialization_alias="allocatedGb")


class AdminStorageOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    summary: AdminStorageSummaryOut
    users: List[AdminStorageUserRow]


class AdminGdprRequestOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    userId: Optional[str] = Field(default=None, serialization_alias="userId")
    userName: Optional[str] = Field(default=None, serialization_alias="userName")
    type: str
    status: str
    notes: Optional[str] = None
    createdAt: datetime = Field(serialization_alias="createdAt")
    updatedAt: datetime = Field(serialization_alias="updatedAt")


class AdminGdprRequestPatch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["pending", "in_progress", "completed"]
    notes: Optional[str] = None


class GdprRequestCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = None


class GdprEraseBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    confirm: Literal["DELETE_ALL_USER_DATA"]


class ComplianceItemOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    label: str
    ok: bool


class AdminComplianceOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    items: List[ComplianceItemOut]
    compliantCount: int = Field(serialization_alias="compliantCount")
    totalCount: int = Field(serialization_alias="totalCount")
