from __future__ import annotations

import csv
import io
import json
import zipfile
from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_db
from app.services.storage_quota import allocated_storage_gb
from app.models.entities import (
    GdprRequest,
    GdprRequestStatus,
    Plan,
    StorageUsage,
    User,
    UserRole,
    UserStatus,
)
from app.schemas.admin_api import (
    AdminComplianceOut,
    AdminGdprRequestOut,
    AdminGdprRequestPatch,
    AdminPlanOut,
    AdminPlanUpdate,
    AdminStatsOut,
    AdminStorageOut,
    AdminStorageSummaryOut,
    AdminStorageUserRow,
    AdminUserOut,
    AdminUserPlanPatch,
    AdminUserStatusPatch,
    ComplianceItemOut,
    GdprEraseBody,
)
from app.services.gdpr_portability import build_portability_export
from app.services.user_purge import purge_user_dependencies

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _status_str(s: UserStatus | str) -> str:
    return s.value if isinstance(s, UserStatus) else str(s)


def _role_str(r: UserRole | str) -> str:
    return r.value if isinstance(r, UserRole) else str(r)


def _gdpr_status_str(s: GdprRequestStatus | str) -> str:
    return s.value if isinstance(s, GdprRequestStatus) else str(s)


def _plan_features_as_strings(raw: object | None) -> list[str]:
    """Coerce plan.features to list[str].

    Heals mistaken storage where a JSON array was split into a list of
    single-character strings (e.g. legacy bug: iterating a string into DB).
    """
    if raw is None:
        return []
    if isinstance(raw, list):
        parts = [str(x) for x in raw]
        if len(parts) >= 8 and all(len(s) == 1 for s in parts):
            merged = "".join(parts).strip()
            if merged.startswith("["):
                try:
                    parsed = json.loads(merged)
                except json.JSONDecodeError:
                    parsed = None
                if isinstance(parsed, list):
                    return [str(x) for x in parsed]
        return parts
    if isinstance(raw, str):
        s = raw.strip()
        if not s:
            return []
        if s.startswith("["):
            try:
                parsed = json.loads(s)
            except json.JSONDecodeError:
                return [s]
            if isinstance(parsed, list):
                return [str(x) for x in parsed]
        return [s]
    return [str(raw)]


def _serialize_admin_user(db: Session, u: User) -> AdminUserOut:
    su = db.scalar(select(StorageUsage).where(StorageUsage.user_id == u.id))
    used = float(su.used_gb) if su else 0.0
    plan = db.get(Plan, u.plan_id)
    raw_alloc = allocated_storage_gb(plan)
    alloc = 999999.0 if raw_alloc == float("inf") else raw_alloc
    return AdminUserOut(
        id=str(u.id),
        name=u.name,
        email=u.email,
        role=_role_str(u.role),
        planId=u.plan_id,
        status=_status_str(u.status),
        storageUsedGb=used,
        storageAllocatedGb=alloc if alloc < 999999 else 999.0,
        createdAt=u.created_at,
        lastActiveAt=u.last_active_at,
    )


@router.get("/stats", response_model=AdminStatsOut)
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminStatsOut:
    total = db.scalar(select(func.count()).select_from(User)) or 0
    active = db.scalar(select(func.count()).select_from(User).where(User.status == UserStatus.active)) or 0
    suspended = db.scalar(select(func.count()).select_from(User).where(User.status == UserStatus.suspended)) or 0
    pending = db.scalar(select(func.count()).select_from(User).where(User.status == UserStatus.pending)) or 0
    patients = db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.patient)) or 0
    radiologists = db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.radiologist)) or 0
    admins = db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.admin)) or 0

    storage_sum = db.scalar(select(func.coalesce(func.sum(StorageUsage.used_gb), 0))) or 0
    pending_gdpr = (
        db.scalar(
            select(func.count()).select_from(GdprRequest).where(GdprRequest.status == GdprRequestStatus.pending)
        )
        or 0
    )

    plan_rows = db.execute(select(User.plan_id, func.count()).select_from(User).group_by(User.plan_id)).all()
    rev = 0.0
    plan_distribution: List[dict] = []
    for pid, cnt in plan_rows:
        p = db.get(Plan, pid)
        c = int(cnt)
        if p:
            rev += float(p.price or 0) * c
        plan_distribution.append({"planId": pid, "userCount": c, "name": p.name if p else pid})

    return AdminStatsOut(
        totalUsers=int(total),
        activeUsers=int(active),
        suspendedUsers=int(suspended),
        pendingUsers=int(pending),
        patients=int(patients),
        radiologists=int(radiologists),
        admins=int(admins),
        totalStorageUsedGb=float(storage_sum),
        pendingGdprRequests=int(pending_gdpr),
        estimatedMonthlyRevenue=round(rev, 2),
        planDistribution=plan_distribution,
    )


@router.get("/users", response_model=List[AdminUserOut])
def admin_list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None, description="patient|radiologist|admin"),
    status_filter: Optional[str] = Query(default=None, alias="status"),
) -> List[AdminUserOut]:
    q = select(User).order_by(User.created_at.desc())
    if search:
        term = f"%{search.strip()}%"
        q = q.where(or_(User.name.ilike(term), User.email.ilike(term)))
    if role:
        try:
            r = UserRole(role)
            q = q.where(User.role == r)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid role") from exc
    if status_filter:
        try:
            s = UserStatus(status_filter)
            q = q.where(User.status == s)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid status") from exc

    users = list(db.scalars(q).all())
    return [_serialize_admin_user(db, u) for u in users]


@router.patch("/users/{user_id}/status", response_model=AdminUserOut)
def admin_patch_user_status(
    user_id: UUID,
    body: AdminUserStatusPatch,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> AdminUserOut:
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change own status here")
    try:
        u.status = UserStatus(body.status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid status") from exc
    u.updated_at = _utcnow()
    db.commit()
    db.refresh(u)
    return _serialize_admin_user(db, u)


@router.patch("/users/{user_id}/plan", response_model=AdminUserOut)
def admin_patch_user_plan(
    user_id: UUID,
    body: AdminUserPlanPatch,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> AdminUserOut:
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change own plan")
    plan = db.get(Plan, body.planId)
    if not plan:
        raise HTTPException(status_code=400, detail="Unknown plan")
    u.plan_id = body.planId
    u.updated_at = _utcnow()
    db.commit()
    db.refresh(u)
    return _serialize_admin_user(db, u)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> Response:
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete own account")
    if u.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin users")
    purge_user_dependencies(db, user_id)
    db.delete(u)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/users/{user_id}/gdpr-portability")
def admin_gdpr_portability_export(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
    format: Literal["json", "zip"] = Query("json", description="json | zip"),
) -> Response:
    payload = build_portability_export(db, user_id)
    if not payload.get("user"):
        raise HTTPException(status_code=404, detail="User not found")
    if format == "zip":
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(
                "portability.json",
                json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8"),
            )
            zf.writestr("README.txt", b"Laura AI GDPR portability export (JSON + manifest).\n")
        data = buf.getvalue()
        return Response(
            content=data,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="gdpr-portability-{user_id}.zip"'},
        )
    return JSONResponse(
        content=payload,
        headers={"Content-Disposition": f'attachment; filename="gdpr-portability-{user_id}.json"'},
    )


@router.post("/users/{user_id}/gdpr-erase", status_code=status.HTTP_204_NO_CONTENT)
def admin_gdpr_erase_user(
    user_id: UUID,
    body: GdprEraseBody,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> Response:
    if body.confirm != "DELETE_ALL_USER_DATA":
        raise HTTPException(status_code=400, detail="Invalid confirmation")
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot erase own account")
    if u.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot erase admin users")
    purge_user_dependencies(db, user_id)
    db.delete(u)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/plans", response_model=List[AdminPlanOut])
def admin_list_plans(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[AdminPlanOut]:
    plans = list(db.scalars(select(Plan).order_by(Plan.id)).all())
    out: List[AdminPlanOut] = []
    for p in plans:
        cnt = db.scalar(select(func.count()).select_from(User).where(User.plan_id == p.id)) or 0
        feats = _plan_features_as_strings(p.features)
        out.append(
            AdminPlanOut(
                id=p.id,
                name=p.name,
                price=float(p.price or 0),
                storageGb=int(p.storage_gb),
                maxScans=int(p.max_scans),
                aiQuota=int(p.ai_quota),
                features=feats,
                active=bool(p.active),
                userCount=int(cnt),
            )
        )
    return out


@router.put("/plans/{plan_id}", response_model=AdminPlanOut)
def admin_put_plan(
    plan_id: str,
    body: AdminPlanUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminPlanOut:
    p = db.get(Plan, plan_id)
    if not p:
        raise HTTPException(status_code=404, detail="Plan not found")
    p.name = body.name
    p.price = body.price
    p.storage_gb = body.storageGb
    p.max_scans = body.maxScans
    p.ai_quota = body.aiQuota
    p.features = body.features or []
    p.active = body.active
    p.updated_at = _utcnow()
    db.commit()
    db.refresh(p)
    cnt = db.scalar(select(func.count()).select_from(User).where(User.plan_id == p.id)) or 0
    feats = _plan_features_as_strings(p.features)
    return AdminPlanOut(
        id=p.id,
        name=p.name,
        price=float(p.price or 0),
        storageGb=int(p.storage_gb),
        maxScans=int(p.max_scans),
        aiQuota=int(p.ai_quota),
        features=feats,
        active=bool(p.active),
        userCount=int(cnt),
    )


@router.get("/storage", response_model=AdminStorageOut)
def admin_storage(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminStorageOut:
    users = list(db.scalars(select(User).order_by(User.name)).all())
    rows: List[AdminStorageUserRow] = []
    total_used = 0.0
    total_alloc = 0.0
    for u in users:
        su = db.scalar(select(StorageUsage).where(StorageUsage.user_id == u.id))
        used = float(su.used_gb) if su else 0.0
        plan = db.get(Plan, u.plan_id)
        raw_alloc = allocated_storage_gb(plan)
        alloc = 999999.0 if raw_alloc == float("inf") else raw_alloc
        if alloc >= 999999:
            display_alloc = 999.0
        else:
            display_alloc = alloc
            total_alloc += display_alloc
        total_used += used
        rows.append(
            AdminStorageUserRow(
                userId=str(u.id),
                name=u.name,
                email=u.email,
                role=_role_str(u.role),
                planId=u.plan_id,
                usedGb=used,
                allocatedGb=display_alloc,
            )
        )
    summary = AdminStorageSummaryOut(
        totalUsedGb=round(total_used, 3),
        totalAllocatedGb=round(total_alloc, 3),
        userCount=len(users),
    )
    return AdminStorageOut(summary=summary, users=rows)


@router.get("/gdpr/requests", response_model=List[AdminGdprRequestOut])
def admin_gdpr_requests(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> List[AdminGdprRequestOut]:
    reqs = list(db.scalars(select(GdprRequest).order_by(GdprRequest.created_at.desc())).all())
    return [
        AdminGdprRequestOut(
            id=str(r.id),
            userId=str(r.user_id) if r.user_id else None,
            userName=r.user_name,
            type=r.type,
            status=_gdpr_status_str(r.status),
            notes=r.notes,
            createdAt=r.created_at,
            updatedAt=r.updated_at,
        )
        for r in reqs
    ]


@router.patch("/gdpr/requests/{request_id}", response_model=AdminGdprRequestOut)
def admin_patch_gdpr_request(
    request_id: UUID,
    body: AdminGdprRequestPatch,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> AdminGdprRequestOut:
    r = db.get(GdprRequest, request_id)
    if not r:
        raise HTTPException(status_code=404, detail="GDPR request not found")
    r.status = GdprRequestStatus(body.status)
    if body.notes is not None:
        r.notes = body.notes
    r.updated_at = _utcnow()
    db.commit()
    db.refresh(r)
    return AdminGdprRequestOut(
        id=str(r.id),
        userId=str(r.user_id) if r.user_id else None,
        userName=r.user_name,
        type=r.type,
        status=_gdpr_status_str(r.status),
        notes=r.notes,
        createdAt=r.created_at,
        updatedAt=r.updated_at,
    )


@router.get("/gdpr/export/{user_id}")
def admin_gdpr_export_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> Response:
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["field", "value"])
    w.writerow(["id", str(u.id)])
    w.writerow(["email", u.email])
    w.writerow(["name", u.name])
    w.writerow(["role", _role_str(u.role)])
    w.writerow(["plan", u.plan_id])
    w.writerow(["status", _status_str(u.status)])
    w.writerow(["country", u.country])
    w.writerow(["created_at", u.created_at.isoformat()])
    w.writerow(["updated_at", u.updated_at.isoformat()])
    su = db.scalar(select(StorageUsage).where(StorageUsage.user_id == u.id))
    if su:
        w.writerow(["storage_used_gb", str(su.used_gb)])
    return Response(
        content=buf.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="user-export-{user_id}.csv"'},
    )


@router.get("/gdpr/compliance", response_model=AdminComplianceOut)
def admin_gdpr_compliance(_: User = Depends(get_current_admin)) -> AdminComplianceOut:
    items = [
        ComplianceItemOut(label="Chiffrement des données (AES-256)", ok=True),
        ComplianceItemOut(label="Hébergement HDS certifié (France)", ok=True),
        ComplianceItemOut(label="Journal des accès activé", ok=True),
        ComplianceItemOut(label="Politique de confidentialité à jour", ok=True),
        ComplianceItemOut(label="Registre des traitements tenu", ok=True),
        ComplianceItemOut(label="DPO désigné", ok=True),
        ComplianceItemOut(label="Procédure de notification de violation (72h)", ok=True),
        ComplianceItemOut(label="Analyse PIA réalisée", ok=False),
        ComplianceItemOut(label="Contrats sous-traitants signés", ok=False),
    ]
    okc = sum(1 for i in items if i.ok)
    return AdminComplianceOut(items=items, compliantCount=okc, totalCount=len(items))


@router.get("/overview")
async def admin_overview_legacy() -> dict[str, str]:
    return {"scope": "admin", "status": "ok"}
