"""Synthetic PACS study catalog for C-FIND / C-MOVE simulation when no Orthanc is configured."""

from __future__ import annotations

from typing import Any, List, Optional


def _studies() -> List[dict[str, Any]]:
    return [
        {
            "studyUID": "1.2.840.113619.2.5.1762583153.215519.978957063.78",
            "patientName": "BEN YOUSSEF Rania",
            "patientId": "TN-2026-0456",
            "patientBirthDate": "1985-03-12",
            "studyDate": "2026-04-18",
            "studyTime": "09:32",
            "studyDescription": "IRM Genou Gauche — Méniscopathie suspectée",
            "modality": "IRM",
            "seriesCount": 6,
            "imagesCount": 234,
            "accessionNumber": "ACC-20260418-001",
            "referringPhysician": "Dr. Salma Arfaoui",
            "institutionName": "Clinique Les Oliviers",
            "bodyPart": "Genou",
            "status": "available",
            "hasReport": False,
            "reportContent": None,
        },
        {
            "studyUID": "1.2.840.113619.2.5.1762583153.215519.978957063.79",
            "patientName": "GHARBI Mehdi",
            "patientId": "TN-2026-0312",
            "patientBirthDate": "1972-07-24",
            "studyDate": "2026-04-17",
            "studyTime": "14:10",
            "studyDescription": "Scanner Thorax HRCT — Nodule pulmonaire suivi",
            "modality": "Scanner/TDM",
            "seriesCount": 3,
            "imagesCount": 412,
            "accessionNumber": "ACC-20260417-005",
            "referringPhysician": "Dr. Mohamed Jlassi",
            "institutionName": "Hôpital Militaire Tunis",
            "bodyPart": "Thorax",
            "status": "available",
            "hasReport": True,
            "reportContent": "Compte-rendu PACS (synthèse) — Nodule stable.",
        },
        {
            "studyUID": "1.2.840.113619.2.5.1762583153.215519.978957063.80",
            "patientName": "MANSOURI Fatima Zahra",
            "patientId": "MA-2026-1122",
            "patientBirthDate": "1960-11-03",
            "studyDate": "2026-04-16",
            "studyTime": "11:55",
            "studyDescription": "IRM Cérébrale — Bilan de céphalées chroniques",
            "modality": "IRM",
            "seriesCount": 8,
            "imagesCount": 320,
            "accessionNumber": "ACC-20260416-003",
            "referringPhysician": "Dr. Leila Benhamed",
            "institutionName": "Clinique Ibn Khaldoun",
            "bodyPart": "Encéphale",
            "status": "available",
            "hasReport": False,
            "reportContent": None,
        },
        {
            "studyUID": "1.2.840.113619.2.5.1762583153.215519.978957063.81",
            "patientName": "DUPONT Jean-Pierre",
            "patientId": "FR-2026-0789",
            "patientBirthDate": "1955-05-18",
            "studyDate": "2026-04-15",
            "studyTime": "08:20",
            "studyDescription": "Radiographie Rachis Lombaire — Lombalgie chronique",
            "modality": "Radiographie",
            "seriesCount": 2,
            "imagesCount": 4,
            "accessionNumber": "ACC-20260415-002",
            "referringPhysician": "Dr. Claire Martin",
            "institutionName": "Centre Médical Paris 11",
            "bodyPart": "Rachis lombaire",
            "status": "available",
            "hasReport": False,
            "reportContent": None,
        },
    ]


def study_by_uid(uid: str) -> Optional[dict[str, Any]]:
    for s in _studies():
        if s["studyUID"] == uid:
            return dict(s)
    return None


def filter_studies(
    *,
    patient_name: Optional[str] = None,
    patient_id: Optional[str] = None,
    study_date_from: Optional[str] = None,
    study_date_to: Optional[str] = None,
    modality: Optional[str] = None,
) -> List[dict[str, Any]]:
    out = list(_studies())
    if patient_name and patient_name.strip():
        q = patient_name.strip().lower()
        out = [s for s in out if q in s["patientName"].lower()]
    if patient_id and patient_id.strip():
        q = patient_id.strip().lower()
        out = [s for s in out if q in s["patientId"].lower()]
    if modality and modality.strip():
        out = [s for s in out if s["modality"] == modality]
    if study_date_from and study_date_from.strip():
        out = [s for s in out if s["studyDate"] >= study_date_from.strip()]
    if study_date_to and study_date_to.strip():
        out = [s for s in out if s["studyDate"] <= study_date_to.strip()]
    return [dict(s) for s in out]
