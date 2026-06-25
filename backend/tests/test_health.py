import base64
import json
import uuid
from datetime import datetime, timezone

from fastapi.testclient import TestClient

# DB URL + Alembic: see ``tests/conftest.py`` (must run before ``app`` imports).

from app.main import app


client = TestClient(app)

_TINY_PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "connected"
    assert body.get("users", 0) >= 3
    assert body.get("seedPatientPresent") is True
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("Referrer-Policy") == "no-referrer"
    assert "camera=()" in (response.headers.get("Permissions-Policy") or "")


def test_api_health_database_flags() -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["database"] == "connected"
    assert body.get("users", 0) >= 3
    assert body.get("seedPatientPresent") is True
    root = client.get("/health").json()
    assert root["database"] == body["database"]
    assert root["users"] == body["users"]


def test_auth_login() -> None:
    response = client.post(
        "/api/auth/login",
        json={
            "email": "amira.bensalah@email.com",
            "password": "Demo2026!",
            "role": "patient",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["role"] == "patient"
    assert "refresh_token" in response.cookies


def test_auth_me_with_access_token() -> None:
    login = client.post(
        "/api/auth/login",
        json={
            "email": "k.mansour@radiology.com",
            "password": "RadioDemo2026!",
            "role": "radiologist",
        },
    )
    token = login.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["role"] == "radiologist"


def test_shared_unknown_token_returns_404() -> None:
    response = client.get("/api/shared/abc123")
    assert response.status_code == 404
    assert response.json()["detail"] == "Not found"


def test_shared_expired_token_returns_404_expired_detail() -> None:
    from datetime import timedelta
    from uuid import UUID

    from app.core.database import SessionLocal
    from app.models.entities import SharedLink, SharedLinkType

    tok = "test_expired_share_token_phase7"
    db = SessionLocal()
    try:
        db.add(
            SharedLink(
                token=tok,
                type=SharedLinkType.report,
                label="Expired CR",
                created_by=UUID("22222222-2222-2222-2222-222222222222"),
                report_data={
                    "patientName": "X",
                    "patientId": "1",
                    "pathology": "p",
                    "modality": "CT",
                    "content": "c",
                    "finalizedAt": "2026-01-01",
                    "radiologistName": "Dr",
                    "radiologistTitle": "Dr",
                    "radiologistSpecialty": "Imagerie",
                    "lab": {
                        "name": "Lab",
                        "address": "",
                        "postalCode": "",
                        "city": "",
                        "country": "",
                        "phone": "",
                        "email": "",
                        "website": "",
                        "rpps": "",
                        "siret": "",
                        "logoDataUrl": "",
                    },
                },
                expires_at=datetime.utcnow() - timedelta(days=1),
            )
        )
        db.commit()
    finally:
        db.close()

    response = client.get(f"/api/shared/{tok}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Not found"


def test_radiologist_share_report_public_get() -> None:
    login = client.post(
        "/api/auth/login",
        json={
            "email": "k.mansour@radiology.com",
            "password": "RadioDemo2026!",
            "role": "radiologist",
        },
    )
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    res = client.post(
        "/api/radiologist/share/report",
        headers=headers,
        json={
            "report": {
                "patientName": "Public Patient",
                "patientId": "PUB-1",
                "pathology": "Surveillance",
                "modality": "CT",
                "content": "Compte-rendu partagé (test).",
                "finalizedAt": "2026-04-30T12:00:00",
                "radiologistName": "Dr. Karim Mansour",
                "radiologistTitle": "Radiologue",
                "radiologistSpecialty": "Imagerie",
                "lab": {
                    "name": "Centre Laura",
                    "address": "1 rue Test",
                    "postalCode": "75001",
                    "city": "Paris",
                    "country": "FR",
                    "phone": "0102030405",
                    "email": "lab@test.fr",
                    "website": "",
                    "rpps": "",
                    "siret": "",
                    "logoDataUrl": "",
                },
            },
            "label": "CR test partage",
        },
    )
    assert res.status_code == 201
    token = res.json()["token"]
    pub = client.get(f"/api/shared/{token}")
    assert pub.status_code == 200
    body = pub.json()
    assert body["type"] == "report"
    assert body["report"]["patientName"] == "Public Patient"
    assert body["report"]["content"].startswith("Compte-rendu")


def _patient_token() -> str:
    login = client.post(
        "/api/auth/login",
        json={
            "email": "amira.bensalah@email.com",
            "password": "Demo2026!",
            "role": "patient",
        },
    )
    assert login.status_code == 200
    return login.json()["access_token"]


def test_anonymous_scan_analyze_does_not_require_auth() -> None:
    tiny_png = base64.b64encode(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
    ).decode("ascii")
    res = client.post(
        "/api/scan/analyze",
        json={"fileBase64": tiny_png, "mimeType": "image/png", "fileName": "x.png"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["suggestedName"]
    assert "Cette analyse est générée par IA" in body["disclaimer"]


def test_analyze_multipart_anonymous_ok() -> None:
    res = client.post(
        "/api/scan/analyze-multipart",
        files={"file": ("x.png", _TINY_PNG_BYTES, "image/png")},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["suggestedName"]
    assert body.get("documentId") in (None, "")


def test_analyze_multipart_patient_persists_document() -> None:
    token = _patient_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post(
        "/api/scan/analyze-multipart",
        headers=headers,
        files={"file": ("scan.png", _TINY_PNG_BYTES, "image/png")},
    )
    assert res.status_code == 200
    body = res.json()
    assert body.get("documentId")
    doc_id = body["documentId"]
    doc = client.get(f"/api/patient/documents/{doc_id}", headers=headers)
    assert doc.status_code == 200
    assert doc.json().get("fileUrl")


def test_analyze_multipart_rejects_oversize(monkeypatch) -> None:
    from app.core.config import settings

    monkeypatch.setattr(settings, "max_upload_mb", 1)
    cap = 1024 * 1024
    big = b"x" * (cap + 1)
    res = client.post(
        "/api/scan/analyze-multipart",
        files={"file": ("big.pdf", big, "application/pdf")},
    )
    assert res.status_code == 400


def test_patient_gdpr_request_admin_updates_status() -> None:
    suffix = uuid.uuid4().hex[:10]
    email = f"gdpr_flow_{suffix}@example.com"
    reg = client.post(
        "/api/auth/register",
        json={"name": "GDPR Flow", "email": email, "password": "TestGdpr2026!", "role": "patient"},
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    ph = {"Authorization": f"Bearer {token}"}
    req = client.post("/api/gdpr/request", headers=ph, json={"type": "export", "notes": "portability"})
    assert req.status_code == 201
    rid = req.json()["id"]
    ah = _admin_headers()
    patch = client.patch(f"/api/admin/gdpr/requests/{rid}", headers=ah, json={"status": "in_progress"})
    assert patch.status_code == 200
    assert patch.json()["status"] == "in_progress"
    done = client.patch(f"/api/admin/gdpr/requests/{rid}", headers=ah, json={"status": "completed"})
    assert done.status_code == 200
    assert done.json()["status"] == "completed"


def test_admin_gdpr_portability_and_erase_throwaway_user() -> None:
    suffix = uuid.uuid4().hex[:10]
    email = f"gdpr_erase_{suffix}@example.com"
    reg = client.post(
        "/api/auth/register",
        json={"name": "Erase Me", "email": email, "password": "TestErase2026!", "role": "patient"},
    )
    assert reg.status_code == 200
    uid = reg.json()["user"]["id"]
    ah = _admin_headers()
    port = client.get(f"/api/admin/users/{uid}/gdpr-portability", headers=ah, params={"format": "json"})
    assert port.status_code == 200
    payload = port.json()
    assert payload["user"]["email"] == email
    erase = client.post(
        f"/api/admin/users/{uid}/gdpr-erase",
        headers=ah,
        json={"confirm": "DELETE_ALL_USER_DATA"},
    )
    assert erase.status_code == 204
    users = client.get("/api/admin/users", headers=ah, params={"role": "patient"}).json()
    assert not any(u.get("email") == email for u in users)


def test_patient_scan_persists_document_and_share_expires_in_7_days() -> None:
    token = _patient_token()
    headers = {"Authorization": f"Bearer {token}"}

    tiny_png = base64.b64encode(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
    ).decode("ascii")
    scan = client.post(
        "/api/scan/analyze",
        headers=headers,
        json={"fileBase64": tiny_png, "mimeType": "image/png", "fileName": "scan.png"},
    )
    assert scan.status_code == 200
    analysis = scan.json()

    create = client.post(
        "/api/patient/documents",
        headers=headers,
        json={
            "name": f"Rapport IA — {analysis['suggestedName']}",
            "type": "rapport",
            "date": "2026-04-30",
            "size": "0.1 MB",
            "pathology": analysis.get("suggestedPathology"),
            "aiAnalyzed": True,
            "fromScan": True,
            "imageDataUrl": f"data:image/png;base64,{tiny_png}",
            "reportContent": "Examen : test\n",
        },
    )
    assert create.status_code == 201
    doc_id = create.json()["id"]

    share = client.post(f"/api/patient/documents/{doc_id}/share", headers=headers)
    assert share.status_code == 200
    share_body = share.json()
    exp_raw = share_body["expiresAt"].replace("Z", "+00:00")
    exp = datetime.fromisoformat(exp_raw)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    delta = exp - datetime.now(timezone.utc)
    assert 6 * 24 * 3600 < delta.total_seconds() <= 7 * 24 * 3600 + 60

    public = client.get(f"/api/shared/{share_body['token']}")
    assert public.status_code == 200
    pub = public.json()
    assert pub["type"] == "document"
    assert pub["document"]["id"] == doc_id


def _radiologist_headers() -> dict[str, str]:
    login = client.post(
        "/api/auth/login",
        json={
            "email": "k.mansour@radiology.com",
            "password": "RadioDemo2026!",
            "role": "radiologist",
        },
    )
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_patient_cannot_get_job() -> None:
    token = _patient_token()
    res = client.get("/api/jobs/00000000-0000-0000-0000-000000000001", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 404  # unknown job


def test_admin_can_get_any_job() -> None:
    import time

    h = _radiologist_headers()
    cre = client.post(
        "/api/radiologist/pacs",
        headers=h,
        json={
            "name": "PACS Admin Job Read",
            "host": "127.0.0.1",
            "port": 104,
            "aeTitle": "ORTHANC",
            "callingAeTitle": "LAURA_AI",
            "protocol": "DICOM",
            "tls": False,
            "active": True,
        },
    )
    assert cre.status_code == 201
    sid = cre.json()["id"]
    q = client.post(
        f"/api/radiologist/pacs/{sid}/query",
        headers=h,
        json={"patientName": "GHARBI"},
    )
    assert q.status_code == 200
    uid = q.json()[0]["studyUID"]
    ret = client.post(f"/api/radiologist/pacs/{sid}/retrieve", headers=h, json={"studyUIDs": [uid]})
    assert ret.status_code == 202
    job_id = ret.json()["jobId"]
    ah = _admin_headers()
    for _ in range(40):
        time.sleep(0.05)
        r = client.get(f"/api/jobs/{job_id}", headers=ah)
        assert r.status_code == 200
        if r.json()["status"] in ("completed", "failed"):
            break
    else:
        raise AssertionError("admin could not poll job")
    client.delete(f"/api/radiologist/pacs/{sid}", headers=h)


def test_radiologist_pacs_query_retrieve_job() -> None:
    import time

    h = _radiologist_headers()
    assert client.get("/api/radiologist/pacs", headers=h).status_code == 200

    cre = client.post(
        "/api/radiologist/pacs",
        headers=h,
        json={
            "name": "Test PACS",
            "host": "127.0.0.1",
            "port": 104,
            "aeTitle": "ORTHANC",
            "callingAeTitle": "LAURA_AI",
            "protocol": "DICOM",
            "tls": False,
            "active": True,
        },
    )
    assert cre.status_code == 201
    sid = cre.json()["id"]

    test = client.post(f"/api/radiologist/pacs/{sid}/test", headers=h)
    assert test.status_code in (200, 503)
    if test.status_code == 200:
        assert test.json()["connectionStatus"] == "connected"
    else:
        detail = test.json().get("detail") or {}
        assert detail.get("code") == "PACS_CONNECTION_FAILED"

    q = client.post(
        f"/api/radiologist/pacs/{sid}/query",
        headers=h,
        json={"patientName": "GHARBI"},
    )
    assert q.status_code == 200
    studies = q.json()
    assert len(studies) >= 1
    uid = studies[0]["studyUID"]

    ret = client.post(
        f"/api/radiologist/pacs/{sid}/retrieve",
        headers=h,
        json={"studyUIDs": [uid]},
    )
    assert ret.status_code == 202
    job_id = ret.json()["jobId"]

    for _ in range(40):
        time.sleep(0.05)
        job = client.get(f"/api/jobs/{job_id}", headers=h)
        assert job.status_code == 200
        if job.json()["status"] == "completed":
            assert job.json()["resultData"]["folderId"]
            break
        if job.json()["status"] == "failed":
            raise AssertionError(job.json())
    else:
        raise AssertionError("job did not complete")

    ph = {"Authorization": f"Bearer {_patient_token()}"}
    assert client.get(f"/api/jobs/{job_id}", headers=ph).status_code == 403

    client.delete(f"/api/radiologist/pacs/{sid}", headers=h)


def test_patient_cannot_list_radiologist_folders() -> None:
    token = _patient_token()
    res = client.get("/api/radiologist/folders", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


def test_radiologist_dashboard_requires_auth() -> None:
    assert client.get("/api/radiologist/dashboard").status_code == 401


def test_radiologist_lab_and_profile_update() -> None:
    h = _radiologist_headers()
    lab_put = client.put(
        "/api/radiologist/lab",
        headers=h,
        json={
            "name": "Cabinet API Test",
            "address": "1 rue Test",
            "postalCode": "75001",
            "city": "Paris",
            "country": "France",
            "phone": "0102030405",
            "email": "cab@test.fr",
            "website": "cab.test",
            "rpps": "111",
            "siret": "222",
            "clearLogo": False,
        },
    )
    assert lab_put.status_code == 200
    body = lab_put.json()
    assert body["lab"]["name"] == "Cabinet API Test"
    assert body["lab"]["postalCode"] == "75001"

    prof_put = client.put(
        "/api/radiologist/profile",
        headers=h,
        json={"name": "Dr. API Radiologue", "title": "Praticien hospitalier", "specialty": "Neuroradiologie"},
    )
    assert prof_put.status_code == 200
    assert prof_put.json()["title"] == "Praticien hospitalier"

    ctx = client.get("/api/radiologist/lab", headers=h)
    assert ctx.status_code == 200
    assert ctx.json()["profile"]["name"] == "Dr. API Radiologue"
    assert ctx.json()["profile"]["specialty"] == "Neuroradiologie"
    assert ctx.json()["lab"]["name"] == "Cabinet API Test"

    png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    raw_png = base64.b64decode(png_b64)
    payload = {
        "name": "Cabinet API Test",
        "address": "1 rue Test",
        "postalCode": "75001",
        "city": "Paris",
        "country": "France",
        "phone": "0102030405",
        "email": "cab@test.fr",
        "website": "cab.test",
        "rpps": "111",
        "siret": "222",
        "clearLogo": False,
    }
    logo_put = client.put(
        "/api/radiologist/lab",
        headers=h,
        files={"data": (None, json.dumps(payload)), "logo": ("logo.png", raw_png, "image/png")},
    )
    assert logo_put.status_code == 200
    assert logo_put.json()["lab"]["logoDataUrl"].startswith("data:image/png;base64,")


def test_radiologist_dicom_folder_lifecycle() -> None:
    import time

    h = _radiologist_headers()

    lab = client.get("/api/radiologist/lab", headers=h)
    assert lab.status_code == 200
    assert lab.json()["profile"]["name"]

    create = client.post(
        "/api/radiologist/folders",
        headers=h,
        json={
            "patientName": "Test Patient API",
            "patientId": "PAT-API-1",
            "pathology": "Bilan imagerie",
            "modality": "IRM",
            "pacsImported": False,
        },
    )
    assert create.status_code == 201
    folder_id = create.json()["id"]

    up = client.post(
        f"/api/radiologist/folders/{folder_id}/files",
        headers=h,
        files=[("files", ("slice.dcm", b"MOCKDICOM", "application/dicom"))],
    )
    assert up.status_code == 200
    assert len(up.json()["files"]) == 1

    gen = client.post(f"/api/radiologist/folders/{folder_id}/report/generate", headers=h)
    assert gen.status_code == 200
    assert gen.json()["status"] == "generating"

    for _ in range(30):
        time.sleep(0.05)
        lst = client.get("/api/radiologist/folders", headers=h)
        assert lst.status_code == 200
        f = next(x for x in lst.json() if x["id"] == folder_id)
        if f["reportStatus"] == "ai_generated":
            assert "PRÉLIMINAIRE" in (f.get("reportContent") or "")
            assert "III." in (f.get("reportContent") or "")
            break
    else:
        raise AssertionError("report did not complete")

    put = client.put(
        f"/api/radiologist/folders/{folder_id}/report",
        headers=h,
        json={"reportContent": f["reportContent"] + "\n\n[Edited line]", "finalize": True},
    )
    assert put.status_code == 200
    assert put.json()["reportStatus"] == "finalized"
    assert put.json()["finalizedAt"]

    shr = client.post(
        f"/api/radiologist/folders/{folder_id}/share",
        headers=h,
        json={
            "label": "CR partage test",
            "radiologistTitle": "Dr",
            "radiologistSpecialty": "IRM",
            "lab": {
                "name": "Cabinet Test",
                "address": "1 rue X",
                "postalCode": "75001",
                "city": "Paris",
                "country": "FR",
                "phone": "0102030405",
                "email": "t@test.fr",
                "website": "",
                "rpps": "",
                "siret": "",
                "logoDataUrl": "",
            },
        },
    )
    assert shr.status_code == 201
    tok = shr.json()["token"]
    pub = client.get(f"/api/shared/{tok}")
    assert pub.status_code == 200
    assert pub.json()["type"] == "report"

    df = put.json()["files"][0]["id"]
    client.delete(f"/api/radiologist/folders/{folder_id}/files/{df}", headers=h)

    client.delete(f"/api/radiologist/folders/{folder_id}", headers=h)
    gone = client.get("/api/radiologist/folders", headers=h)
    assert all(x["id"] != folder_id for x in gone.json())


def _admin_headers() -> dict[str, str]:
    login = client.post(
        "/api/auth/admin/login",
        json={"email": "admin@laura-ai.fr", "password": "Admin2026!"},
    )
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _patient_auth_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {_patient_token()}"}


def test_non_admin_cannot_access_admin_api() -> None:
    h = _patient_auth_headers()
    assert client.get("/api/admin/stats", headers=h).status_code == 403
    assert client.get("/api/admin/users", headers=h).status_code == 403


def test_admin_stats_and_users() -> None:
    h = _admin_headers()
    s = client.get("/api/admin/stats", headers=h)
    assert s.status_code == 200
    body = s.json()
    assert body["totalUsers"] >= 3
    assert "planDistribution" in body
    u = client.get("/api/admin/users", headers=h)
    assert u.status_code == 200
    assert len(u.json()) >= 3
    filt = client.get("/api/admin/users", headers=h, params={"role": "patient", "status": "active"})
    assert filt.status_code == 200


def test_admin_suspend_plan_quota_gdpr_flow() -> None:
    h = _admin_headers()
    patient_id = "11111111-1111-1111-1111-111111111111"

    sus = client.patch(
        f"/api/admin/users/{patient_id}/status",
        headers=h,
        json={"status": "suspended"},
    )
    assert sus.status_code == 200
    assert sus.json()["status"] == "suspended"

    act = client.patch(f"/api/admin/users/{patient_id}/status", headers=h, json={"status": "active"})
    assert act.status_code == 200

    plan = client.patch(f"/api/admin/users/{patient_id}/plan", headers=h, json={"planId": "free"})
    assert plan.status_code == 200
    assert plan.json()["planId"] == "free"

    plans_before = client.get("/api/admin/plans", headers=h)
    assert plans_before.status_code == 200
    free_row = next(p for p in plans_before.json() if p["id"] == "free")

    putp = client.put(
        "/api/admin/plans/free",
        headers=h,
        json={
            "name": free_row["name"],
            "price": free_row["price"],
            "storageGb": free_row["storageGb"],
            "maxScans": 42,
            "aiQuota": free_row["aiQuota"],
            "features": free_row.get("features") or [],
            "active": free_row["active"],
        },
    )
    assert putp.status_code == 200
    assert putp.json()["maxScans"] == 42

    gr = client.post(
        "/api/gdpr/request",
        headers=_patient_auth_headers(),
        json={"type": "Accès données", "notes": "Test demande"},
    )
    assert gr.status_code == 201
    rid = gr.json()["id"]

    lst = client.get("/api/admin/gdpr/requests", headers=h)
    assert lst.status_code == 200
    assert any(x["id"] == rid for x in lst.json())

    patch = client.patch(
        f"/api/admin/gdpr/requests/{rid}",
        headers=h,
        json={"status": "completed", "notes": "Traité test"},
    )
    assert patch.status_code == 200
    assert patch.json()["status"] == "completed"

    comp = client.get("/api/admin/gdpr/compliance", headers=h)
    assert comp.status_code == 200
    assert comp.json()["totalCount"] >= 1

    exp = client.get(f"/api/admin/gdpr/export/{patient_id}", headers=h)
    assert exp.status_code == 200
    assert "email" in exp.text.lower()

    stor = client.get("/api/admin/storage", headers=h)
    assert stor.status_code == 200
    assert stor.json()["summary"]["userCount"] >= 3

    client.put(
        "/api/admin/plans/free",
        headers=h,
        json={
            "name": free_row["name"],
            "price": free_row["price"],
            "storageGb": free_row["storageGb"],
            "maxScans": free_row["maxScans"],
            "aiQuota": free_row["aiQuota"],
            "features": free_row.get("features") or [],
            "active": free_row["active"],
        },
    )
    client.patch(f"/api/admin/users/{patient_id}/plan", headers=h, json={"planId": "starter"})


def test_patient_scan_quota_unlimited_for_enterprise_plan() -> None:
    h = _admin_headers()
    patient_id = "11111111-1111-1111-1111-111111111111"
    patch = client.patch(f"/api/admin/users/{patient_id}/plan", headers=h, json={"planId": "enterprise"})
    assert patch.status_code == 200
    ph = _patient_auth_headers()
    q = client.get("/api/scan/quota", headers=ph)
    assert q.status_code == 200
    body = q.json()
    assert body["maxScans"] == -1
    assert body["remaining"] == -1
    assert body["aiQuota"] == -1
    client.patch(f"/api/admin/users/{patient_id}/plan", headers=h, json={"planId": "starter"})


def test_scan_analyze_returns_402_when_monthly_quota_zero() -> None:
    import base64

    h = _admin_headers()
    patient_id = "11111111-1111-1111-1111-111111111111"
    plans = client.get("/api/admin/plans", headers=h)
    assert plans.status_code == 200
    free_row = next(p for p in plans.json() if p["id"] == "free")
    putp = client.put(
        "/api/admin/plans/free",
        headers=h,
        json={
            "name": free_row["name"],
            "price": free_row["price"],
            "storageGb": free_row["storageGb"],
            "maxScans": 0,
            "aiQuota": free_row["aiQuota"],
            "features": free_row.get("features") or [],
            "active": free_row["active"],
        },
    )
    assert putp.status_code == 200
    client.patch(f"/api/admin/users/{patient_id}/plan", headers=h, json={"planId": "free"})

    tiny_png = base64.b64encode(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
    ).decode("ascii")
    ph = _patient_auth_headers()
    res = client.post(
        "/api/scan/analyze",
        headers=ph,
        json={"fileBase64": tiny_png, "mimeType": "image/png", "fileName": "q.png"},
    )
    assert res.status_code == 402

    client.put(
        "/api/admin/plans/free",
        headers=h,
        json={
            "name": free_row["name"],
            "price": free_row["price"],
            "storageGb": free_row["storageGb"],
            "maxScans": free_row["maxScans"],
            "aiQuota": free_row["aiQuota"],
            "features": free_row.get("features") or [],
            "active": free_row["active"],
        },
    )
    client.patch(f"/api/admin/users/{patient_id}/plan", headers=h, json={"planId": "starter"})
