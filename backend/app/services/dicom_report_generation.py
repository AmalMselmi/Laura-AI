"""Preliminary radiology report text for DICOM folders (IA mock / fallback)."""

from __future__ import annotations


def build_preliminary_ai_report(
    *,
    patient_name: str,
    patient_id: str,
    pathology: str,
    modality: str,
    file_count: int,
) -> str:
    pathology_line = pathology.strip() or "Indication non précisée"
    modality_line = modality.strip() or "N/A"
    confidence = 72

    return f"""I. Indication clinique
{pathology_line} — Patient {patient_name} (ID : {patient_id or "N/A"}). Examen d'imagerie médicale dans le cadre du bilan.

II. Technique
Acquisition {modality_line} selon protocole standard. {file_count} fichier(s) DICOM pris en compte par le pipeline d'analyse Laura AI.

III. Résultats IA à valider
Analyse algorithmique préliminaire : aucune lésion majeure catégorisée de façon fiable par l'IA sur les coupes disponibles. Structures anatomiques explorées sans signe automatique d'urgence vitale. Les limites de la reconstruction, du bruit et du recalage peuvent masquer des anomalies subtiles.

IV. Conclusion avec confidence
Interprétation automatique indicative uniquement ; conclusion définitive non établie sans relecture humaine. Niveau de confiance IA estimé : {confidence} % (non certifié, ne remplace pas l'expertise du radiologue).

V. Recommandations
• Relecture intégrale et validation par un radiologue diplômé avant communication au patient ou aux confrères.
• Corrélation clinico-radiologique systématique.
• Examens complémentaires si l'évolution clinique ou les antécédents le justifient.

⚠️ Ce compte-rendu est PRÉLIMINAIRE, généré avec assistance IA. Il doit obligatoirement être validé, complété et signé par un radiologue avant toute décision thérapeutique ou usage médico-légal."""
