"""
AI agent orchestration service adapted for backend package imports.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, TypedDict

from app.services.nlp_service import MedicalNLPService
from app.services.ocr_service import OCRService
from app.services.report_generator import MedicalReportGenerator


class AgentState(TypedDict, total=False):
    patient_id: str
    task_type: str
    document_id: str | None
    trigger: str
    started_at: str
    completed_at: str | None
    confidence_score: float
    ocr_result: dict[str, Any] | None
    nlp_result: dict[str, Any] | None
    report: dict[str, Any] | None
    error: str | None


class MedicalAIAgent:
    def __init__(self) -> None:
        self.ocr_service = OCRService()
        self.nlp_service = MedicalNLPService()
        self.report_generator = MedicalReportGenerator()

    async def execute_workflow(self, initial_state: AgentState) -> AgentState:
        state: AgentState = dict(initial_state)
        state["started_at"] = datetime.utcnow().isoformat()
        state["confidence_score"] = 0.0

        try:
            file_path = "/tmp/placeholder-document.txt"
            ocr_result = await self.ocr_service.process_document(file_path=file_path)
            state["ocr_result"] = ocr_result

            nlp_result = await self.nlp_service.extract_medical_entities(
                text=ocr_result["full_text"]
            )
            state["nlp_result"] = nlp_result

            report_bytes = await self.report_generator.generate_comprehensive_report(
                patient_data={"id": state.get("patient_id", "unknown")},
                analysis_result={"summary": "Auto-generated placeholder summary"},
                timeline=[],
                lab_results=[],
                risk_factors=[],
            )
            state["report"] = {
                "id": f"rpt_{int(datetime.utcnow().timestamp())}",
                "size_bytes": len(report_bytes),
            }
            state["confidence_score"] = 0.75
        except Exception as exc:
            state["error"] = str(exc)

        state["completed_at"] = datetime.utcnow().isoformat()
        return state
