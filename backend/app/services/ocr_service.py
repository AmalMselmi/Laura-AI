"""
OCR service adapted for backend package imports.
"""

from __future__ import annotations

import os
from typing import Any


class OCRService:
    def __init__(self) -> None:
        self.azure_endpoint = os.getenv("AZURE_VISION_ENDPOINT")
        self.azure_key = os.getenv("AZURE_VISION_KEY")

    async def process_document(
        self,
        file_path: str,
        language: str = "fra+ara",
        use_azure: bool = False,
        preprocess: bool = True,
        extract_tables: bool = True,
    ) -> dict[str, Any]:
        # Lightweight placeholder: keep API stable while backend is scaffolded.
        return {
            "status": "completed",
            "pages": [
                {
                    "page_number": 1,
                    "text": f"OCR placeholder for {os.path.basename(file_path)}",
                    "confidence": 0.8,
                    "language_detected": language,
                    "word_count": 5,
                    "engine": "placeholder",
                }
            ],
            "full_text": f"OCR placeholder for {os.path.basename(file_path)}",
            "average_confidence": 0.8,
            "total_pages": 1,
        }

    async def extract_medical_metadata(self, ocr_result: dict[str, Any]) -> dict[str, Any]:
        return {
            "dates": [],
            "doctor_names": [],
            "lab_names": [],
            "patient_info": {},
            "raw_text_preview": (ocr_result.get("full_text") or "")[:200],
        }
