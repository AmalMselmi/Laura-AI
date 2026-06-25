from __future__ import annotations

import base64
import hashlib
import json
import re
from typing import Any, Dict, List, Tuple

import httpx

from app.core.config import settings
from app.schemas.scan import (
    FindingModel,
    RecommendationModel,
    ScanAnalyzeResponse,
    TechnicalDetailsModel,
)

DISCLAIMER_FR = (
    "Cette analyse est générée par IA et ne remplace pas l'avis d'un médecin diplômé."
)

_ALLOWED_SCAN_MIMES = frozenset(
    {
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/gif",
        "image/bmp",
        "image/heic",
        "image/heif",
        "application/dicom",
        "image/dicom",
        "application/octet-stream",
    }
)


def _scan_mime_allowed(file_name: str, mime_type: str) -> bool:
    mt = mime_type.split(";")[0].strip().lower()
    if mt in _ALLOWED_SCAN_MIMES:
        return True
    fn = file_name.lower()
    if fn.endswith(".pdf"):
        return True
    if fn.endswith((".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".gif", ".bmp", ".heic", ".heif", ".dcm")):
        return True
    return False


def decode_base64_payload(file_base64: str) -> bytes:
    raw = file_base64.strip()
    if "," in raw and raw.lower().startswith("data:"):
        raw = raw.split(",", 1)[1]
    raw = re.sub(r"\s+", "", raw)
    try:
        return base64.b64decode(raw, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Invalid base64 payload") from exc


def _stable_pick(seed: str, options: List[str]) -> str:
    h = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    idx = int(h[:8], 16) % len(options)
    return options[idx]


def build_mock_analysis(
    *,
    file_name: str,
    mime_type: str,
    payload: bytes,
) -> ScanAnalyzeResponse:
    seed = hashlib.sha256(payload + file_name.encode("utf-8") + mime_type.encode("utf-8")).hexdigest()

    is_pdf = "pdf" in mime_type.lower() or file_name.lower().endswith(".pdf")
    if is_pdf:
        doc_type = "ordonnance"
        exam = "Document PDF: analyse textuelle"
        region = None
        suggested = _stable_pick(seed + "name", ["Ordonnance médicale", "Compte-rendu PDF", "Document administratif"])
        pathology = _stable_pick(seed + "path", ["Prescription médicale", "Suivi thérapeutique", "Bilan de santé"])
        findings: List[FindingModel] = [
            FindingModel(
                severity="moderate",
                category="Document",
                title="Extraction structurée (mock)",
                description="Le contenu du PDF est traité comme un document médical générique dans cet environnement de démonstration.",
                characteristics=[
                    f"Empreinte stable: {seed[:12]}",
                    f"Fichier: {file_name}",
                ],
            )
        ]
        recs: List[RecommendationModel] = [
            RecommendationModel(
                priority="medium",
                title="Vérifier avec le prescripteur",
                description="Validez les doses, durées et interactions médicamenteuses avec un professionnel de santé.",
            )
        ]
        tech = None
        confidence = 88 + (int(seed[:2], 16) % 8)
    else:
        doc_type = "scanner"
        exam = "Scanner abdomino-pelvien"
        region = "Abdomen et pelvis"
        suggested = "Scanner abdomino-pelvien"
        pathology = _stable_pick(
            seed + "renal",
            [
                "Kyste rénal Bosniak IIF (surveillance)",
                "Kyste rénal simple Bosniak I",
                "Calcul urinaire non obstructif (à confirmer)",
            ],
        )
        findings = [
            FindingModel(
                severity="important",
                category="Rein",
                title="Lésion kystique (mock)",
                description="Résultat simulé à partir de l'empreinte du fichier — ne constitue pas un diagnostic.",
                location="Rein gauche (mock)",
                measurements=None,
                classification="Bosniak IIF (mock)",
                characteristics=[
                    f"Empreinte stable: {seed[:12]}",
                    f"Fichier: {file_name}",
                ],
            )
        ]
        recs = [
            RecommendationModel(
                priority="high",
                title="Interprétation médicale requise",
                description="Faites interpréter l'examen par un radiologue et corréler avec le contexte clinique.",
                timeframe="Selon urgence clinique",
            )
        ]
        tech = TechnicalDetailsModel(
            modality="CT (mock)",
            bodyPart=region,
            slices=24 + (int(seed[2:4], 16) % 12),
            contrast=True,
        )
        confidence = 90 + (int(seed[2:4], 16) % 9)

    return ScanAnalyzeResponse(
        type=doc_type,
        examType=exam,
        anatomicalRegion=region,
        confidence=min(99, max(70, confidence)),
        findings=findings,
        normalFindings=None if is_pdf else ["Structures adjacentes sans anomalie évidente (mock)"],
        recommendations=recs,
        technicalDetails=tech,
        disclaimer=DISCLAIMER_FR,
        suggestedName=suggested,
        suggestedPathology=pathology,
    )


def _openai_json_prompt(file_name: str, mime_type: str) -> str:
    return (
        "Tu es un assistant médical pour démonstration. "
        "Réponds UNIQUEMENT en JSON compact (sans markdown) avec les clés: "
        "type (string), examType (string|null), anatomicalRegion (string|null), confidence (int 70-99), "
        "findings (liste d'objets {severity, category, title, description, location?, measurements?, classification?, characteristics?}), "
        "normalFindings (liste de string|null), "
        "recommendations (liste d'objets {priority, title, description, timeframe?, action?}), "
        "technicalDetails (objet|null {modality, bodyPart, slices, contrast, acquisitionDate}), "
        "suggestedName (string), suggestedPathology (string|null). "
        f"Le fichier s'appelle {file_name} et le mime est {mime_type}. "
        "N'invente pas de diagnostic définitif; reste prudent."
    )


def maybe_openai_analysis(
    *,
    file_name: str,
    mime_type: str,
    payload: bytes,
) -> ScanAnalyzeResponse | None:
    if not settings.enable_ai_scan or not settings.openai_api_key:
        return None

    try:
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.openai_model,
                    "temperature": 0.2,
                    "messages": [
                        {"role": "system", "content": _openai_json_prompt(file_name, mime_type)},
                        {
                            "role": "user",
                            "content": f"Analyse ce contenu (binaire, {len(payload)} octets). "
                            f"Fournis uniquement le JSON demandé.",
                        },
                    ],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed: Dict[str, Any] = json.loads(content)
            return ScanAnalyzeResponse(
                type=str(parsed.get("type") or "autre"),
                examType=parsed.get("examType"),
                anatomicalRegion=parsed.get("anatomicalRegion"),
                confidence=int(parsed.get("confidence") or 85),
                findings=[FindingModel.model_validate(f) for f in (parsed.get("findings") or [])],
                normalFindings=parsed.get("normalFindings"),
                recommendations=[
                    RecommendationModel.model_validate(r) for r in (parsed.get("recommendations") or [])
                ],
                technicalDetails=(
                    TechnicalDetailsModel.model_validate(parsed["technicalDetails"])
                    if parsed.get("technicalDetails")
                    else None
                ),
                disclaimer=DISCLAIMER_FR,
                suggestedName=str(parsed.get("suggestedName") or file_name),
                suggestedPathology=parsed.get("suggestedPathology"),
            )
    except Exception:
        return None


def analyze_upload_bytes(*, file_name: str, mime_type: str, payload: bytes) -> Tuple[bytes, ScanAnalyzeResponse, bool]:
    max_b = settings.max_scan_upload_bytes
    if len(payload) > max_b:
        raise ValueError(f"File too large (max {settings.max_upload_mb}MB)")
    if not _scan_mime_allowed(file_name, mime_type):
        raise ValueError("Unsupported content type for scan analysis")

    ai = maybe_openai_analysis(file_name=file_name, mime_type=mime_type, payload=payload)
    if ai:
        if DISCLAIMER_FR not in (ai.disclaimer or ""):
            ai = ai.model_copy(update={"disclaimer": DISCLAIMER_FR})
        return payload, ai, True

    return payload, build_mock_analysis(file_name=file_name, mime_type=mime_type, payload=payload), False


def analyze_upload(
    *, file_name: str, mime_type: str, file_base64: str
) -> Tuple[bytes, ScanAnalyzeResponse, bool]:
    payload = decode_base64_payload(file_base64)
    return analyze_upload_bytes(file_name=file_name, mime_type=mime_type, payload=payload)
