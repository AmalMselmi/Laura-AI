"""
NLP service adapted for backend package imports.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Optional


class MedicalNLPService:
    def __init__(self) -> None:
        # Keep dependencies optional so backend can boot in minimal environments.
        self.model_loaded = False
        try:
            import spacy  # type: ignore

            self._spacy = spacy
            self.nlp = spacy.load("fr_core_news_md")
            self.model_loaded = True
        except Exception:
            self.nlp = None

    async def extract_medical_entities(
        self, text: str, extract_relationships: bool = True
    ) -> dict:
        if not self.model_loaded:
            return {
                "entities": [],
                "relationships": [],
                "structured_data": self._extract_basic_structured_data(text),
                "model": "fallback-regex",
            }

        doc = self.nlp(text)
        entities = [
            {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "confidence": 0.85,
            }
            for ent in doc.ents
        ]
        return {
            "entities": entities,
            "relationships": [],
            "structured_data": self._extract_basic_structured_data(text),
            "model": "spacy_fr_core_news_md",
        }

    async def classify_document_type(self, text: str, filename: str = "") -> dict:
        payload = f"{text}\n{filename}".lower()
        if "ordonnance" in payload:
            doc_type = "prescription"
        elif "irm" in payload or "scanner" in payload or "radiographie" in payload:
            doc_type = "imaging"
        elif "bilan" in payload or "laboratoire" in payload or "analyses" in payload:
            doc_type = "lab_report"
        else:
            doc_type = "consultation_note"
        return {"document_type": doc_type, "confidence": 0.75, "alternatives": []}

    def _normalize_date(self, date_str: str) -> Optional[str]:
        for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y"):
            try:
                return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
        return None

    def _extract_basic_structured_data(self, text: str) -> dict:
        date_pattern = r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b"
        dates = [self._normalize_date(d) or d for d in re.findall(date_pattern, text)]
        return {
            "conditions": [],
            "medications": [],
            "lab_results": [],
            "procedures": [],
            "dates": dates,
            "vital_signs": {},
        }
