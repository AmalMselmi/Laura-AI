# Agent IA Autonome - Architecture & Design

## Vue d'ensemble

L'agent IA de Laura est un système autonome multi-agents utilisant **LangGraph** pour l'orchestration, capable de :
- Analyser automatiquement les documents médicaux sans intervention utilisateur
- Planifier et exécuter des workflows complexes
- Maintenir une mémoire contextuelle (court + long terme)
- Prendre des décisions intelligentes sur quand demander des clarifications
- Générer des rapports médicaux structurés
- Détecter les données manquantes et anomalies

## Architecture Agent

```
┌────────────────────────────────────────────────────────────────┐
│                     PATIENT INTERFACE                          │
│  Upload Document / View Reports / Chat with Agent              │
└───────────────────────────┬────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                   AGENT ORCHESTRATOR                           │
│                     (LangGraph)                                │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Task Planner │→ │ Tool Router  │→ │State Manager │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────┬───────────────┬───────────────┬──────────────────┘
             │               │               │
    ┌────────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
    │ Document Tool │ │ Memory Tool│ │ Report Tool │
    └────────┬──────┘ └─────┬──────┘ └──────┬──────┘
             │               │               │
    ┌────────▼───────────────▼───────────────▼──────┐
    │              TOOL LAYER                        │
    │  OCR | NLP | Database | Scheduler | Generator │
    └────────────────────────────────────────────────┘
```

## Composants de l'Agent

### 1. Agent Orchestrator (LangGraph Core)

Le cerveau central qui coordonne tous les workflows.

**Graph States**:
```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    # Input
    patient_id: str
    task_type: str  # "analyze_document", "generate_report", "detect_gaps"
    document_id: str | None
    
    # Processing
    current_step: str
    extracted_data: dict
    entities: List[dict]
    analysis_results: dict
    
    # Memory
    conversation_history: List[dict]
    medical_context: dict
    
    # Output
    report: dict | None
    questions: List[str]
    confidence_score: float
    next_actions: List[dict]
```

**Workflow Graph**:
```python
workflow = StateGraph(AgentState)

# Nodes (étapes de traitement)
workflow.add_node("classify_task", classify_task_node)
workflow.add_node("load_context", load_patient_context)
workflow.add_node("analyze_document", analyze_document_node)
workflow.add_node("extract_entities", extract_medical_entities)
workflow.add_node("detect_gaps", detect_data_gaps)
workflow.add_node("generate_report", generate_medical_report)
workflow.add_node("schedule_followup", schedule_followup_analysis)
workflow.add_node("ask_clarification", ask_user_questions)

# Edges (transitions conditionnelles)
workflow.add_conditional_edges(
    "classify_task",
    route_task,
    {
        "document_analysis": "load_context",
        "report_generation": "load_context",
        "gap_detection": "load_context"
    }
)

workflow.add_edge("load_context", "analyze_document")

workflow.add_conditional_edges(
    "analyze_document",
    check_confidence,
    {
        "high_confidence": "extract_entities",
        "low_confidence": "ask_clarification",
        "error": END
    }
)

workflow.add_edge("extract_entities", "detect_gaps")

workflow.add_conditional_edges(
    "detect_gaps",
    check_gaps,
    {
        "gaps_found": "ask_clarification",
        "complete": "generate_report"
    }
)

workflow.add_edge("generate_report", "schedule_followup")
workflow.add_edge("schedule_followup", END)

# Point d'entrée
workflow.set_entry_point("classify_task")

# Compiler le graph
app = workflow.compile()
```

### 2. Task Planner

Décompose les tâches complexes en sous-tâches.

**Logique de Planification**:
```python
from typing import List, Dict

class TaskPlanner:
    def __init__(self, llm):
        self.llm = llm
    
    async def plan_task(self, task_description: str, patient_context: dict) -> List[Dict]:
        """
        Planifie une séquence de sous-tâches pour accomplir l'objectif.
        
        Example:
        Input: "Analyser le nouveau document IRM et mettre à jour le rapport"
        Output: [
            {"step": 1, "action": "ocr_extract", "target": "document_123"},
            {"step": 2, "action": "nlp_analyze", "depends_on": 1},
            {"step": 3, "action": "compare_with_history", "depends_on": 2},
            {"step": 4, "action": "detect_changes", "depends_on": 3},
            {"step": 5, "action": "update_report", "depends_on": 4}
        ]
        """
        prompt = f"""
        Patient Context:
        - Medical History: {patient_context.get('history')}
        - Recent Documents: {patient_context.get('recent_docs')}
        - Last Analysis: {patient_context.get('last_analysis')}
        
        Task: {task_description}
        
        Create a step-by-step execution plan with dependencies.
        Output JSON format: [{{"step": int, "action": str, "depends_on": int|null, "params": dict}}]
        """
        
        response = await self.llm.ainvoke(prompt)
        plan = parse_json(response.content)
        
        return plan
```

### 3. Memory System

**Short-term Memory (Redis)**:
- Conversation dans la session active
- État de la tâche en cours
- Cache résultats intermédiaires
- TTL: 24 heures

**Long-term Memory (Vector DB - Pinecone)**:
```python
from pinecone import Pinecone
from langchain.embeddings import OpenAIEmbeddings

class AgentMemory:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index("laura-medical-memory")
        self.embeddings = OpenAIEmbeddings()
    
    async def store_interaction(
        self, 
        patient_id: str, 
        interaction_type: str,
        content: str,
        metadata: dict
    ):
        """Stocker une interaction dans la mémoire long-terme."""
        embedding = await self.embeddings.aembed_query(content)
        
        self.index.upsert([{
            "id": f"{patient_id}_{interaction_type}_{timestamp()}",
            "values": embedding,
            "metadata": {
                "patient_id": patient_id,
                "type": interaction_type,
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
                **metadata
            }
        }])
    
    async def retrieve_relevant_context(
        self,
        patient_id: str,
        query: str,
        top_k: int = 5
    ) -> List[dict]:
        """Récupérer le contexte pertinent pour une requête."""
        query_embedding = await self.embeddings.aembed_query(query)
        
        results = self.index.query(
            vector=query_embedding,
            filter={"patient_id": {"$eq": patient_id}},
            top_k=top_k,
            include_metadata=True
        )
        
        return [match.metadata for match in results.matches]
```

### 4. Decision Logic

L'agent décide quand agir de manière autonome vs demander clarification.

**Règles de Décision**:
```python
class DecisionEngine:
    # Seuils de confiance
    HIGH_CONFIDENCE = 0.85
    MEDIUM_CONFIDENCE = 0.65
    
    def should_ask_clarification(self, analysis_result: dict) -> bool:
        """Détermine si des questions de clarification sont nécessaires."""
        
        # 1. Confiance OCR faible
        if analysis_result.get('ocr_confidence', 1.0) < self.MEDIUM_CONFIDENCE:
            return True
        
        # 2. Entités médicales ambiguës
        entities = analysis_result.get('entities', [])
        ambiguous = [e for e in entities if e.get('confidence', 1.0) < self.HIGH_CONFIDENCE]
        if len(ambiguous) > 3:
            return True
        
        # 3. Données critiques manquantes
        required_fields = ['diagnosis', 'date', 'prescribing_doctor']
        missing = [f for f in required_fields if f not in analysis_result.get('extracted_data', {})]
        if missing:
            return True
        
        # 4. Contradiction avec historique médical
        if self.detect_contradiction(analysis_result):
            return True
        
        return False
    
    def detect_contradiction(self, analysis_result: dict) -> bool:
        """Détecte les contradictions avec l'historique médical."""
        # Exemple: nouveau médicament incompatible avec allergies connues
        new_medications = analysis_result.get('medications', [])
        known_allergies = analysis_result.get('patient_allergies', [])
        
        for med in new_medications:
            if any(allergy in med for allergy in known_allergies):
                return True
        
        return False
    
    def generate_clarification_questions(self, analysis_result: dict) -> List[str]:
        """Génère des questions de clarification ciblées."""
        questions = []
        
        # OCR incertain
        if analysis_result.get('ocr_confidence', 1.0) < self.MEDIUM_CONFIDENCE:
            uncertain_text = analysis_result.get('uncertain_text', [])
            questions.append(
                f"Le texte suivant n'est pas clair dans le document : '{uncertain_text[0]}'. "
                f"Pouvez-vous confirmer ce qui est écrit ?"
            )
        
        # Entités ambiguës
        ambiguous_entities = [
            e for e in analysis_result.get('entities', [])
            if e.get('confidence', 1.0) < self.HIGH_CONFIDENCE
        ]
        if ambiguous_entities:
            entity = ambiguous_entities[0]
            questions.append(
                f"J'ai détecté '{entity['text']}' comme {entity['label']}, est-ce correct ?"
            )
        
        # Données manquantes critiques
        missing = analysis_result.get('missing_fields', [])
        if 'date' in missing:
            questions.append("Quelle est la date de ce document médical ?")
        if 'prescribing_doctor' in missing:
            questions.append("Quel médecin a prescrit ce document ?")
        
        return questions
```

## Workflows Autonomes

### Workflow 1: Analyse Automatique de Document

Déclenché automatiquement à l'upload d'un document.

```python
async def analyze_document_workflow(document_id: str, patient_id: str):
    """
    Workflow complet d'analyse de document médical.
    S'exécute de manière autonome sans intervention utilisateur.
    """
    
    # Étape 1: OCR Processing
    ocr_result = await ocr_service.process_document(document_id)
    
    # Étape 2: Classification du type de document
    doc_type = await classify_document_type(ocr_result['text'])
    
    # Étape 3: Extraction d'entités médicales (NER)
    entities = await nlp_service.extract_medical_entities(
        text=ocr_result['text'],
        doc_type=doc_type
    )
    
    # Étape 4: Structuration des données
    structured_data = await structure_medical_data(entities, doc_type)
    
    # Étape 5: Chargement du contexte patient
    patient_context = await load_patient_context(patient_id)
    
    # Étape 6: Analyse avec LLM
    analysis = await llm_analyze(
        document_text=ocr_result['text'],
        entities=entities,
        patient_context=patient_context
    )
    
    # Étape 7: Détection d'anomalies
    anomalies = await detect_anomalies(analysis, patient_context)
    
    # Étape 8: Décision - clarification nécessaire ?
    decision_engine = DecisionEngine()
    if decision_engine.should_ask_clarification(analysis):
        questions = decision_engine.generate_clarification_questions(analysis)
        await notification_service.send_questions(patient_id, questions)
    else:
        # Continuer de manière autonome
        pass
    
    # Étape 9: Mise à jour de la timeline médicale
    await update_medical_timeline(patient_id, structured_data)
    
    # Étape 10: Génération de rapport
    report = await generate_medical_report(patient_id, analysis)
    
    # Étape 11: Stockage des résultats
    await store_analysis_results(document_id, analysis, report)
    
    # Étape 12: Planification du follow-up
    followup_tasks = await schedule_followup_analysis(patient_id, analysis)
    
    # Étape 13: Notification au patient
    await notification_service.send_report_ready(patient_id, report['id'])
    
    return {
        "document_id": document_id,
        "analysis_id": analysis['id'],
        "report_id": report['id'],
        "confidence": analysis['confidence_score'],
        "anomalies_detected": len(anomalies),
        "followup_scheduled": len(followup_tasks)
    }
```

### Workflow 2: Détection Automatique de Données Manquantes

S'exécute périodiquement (quotidien) pour chaque patient.

```python
async def detect_data_gaps_workflow(patient_id: str):
    """
    Analyse le dossier médical du patient pour identifier les données manquantes.
    """
    
    # Charger le profil complet du patient
    patient = await db.patients.find_one({"id": patient_id})
    documents = await db.documents.find({"patient_id": patient_id}).to_list(1000)
    
    gaps = {
        "missing_data": [],
        "outdated_data": [],
        "recommended_actions": []
    }
    
    # Vérifier les données de base
    if not patient.get('blood_type'):
        gaps['missing_data'].append({
            "field": "blood_type",
            "severity": "high",
            "message": "Groupe sanguin non renseigné"
        })
    
    if not patient.get('allergies'):
        gaps['missing_data'].append({
            "field": "allergies",
            "severity": "high",
            "message": "Allergies non documentées"
        })
    
    # Vérifier les bilans périodiques
    last_blood_test = await get_last_document_by_type(patient_id, "blood_test")
    if not last_blood_test or days_since(last_blood_test['date']) > 365:
        gaps['outdated_data'].append({
            "type": "blood_test",
            "last_date": last_blood_test['date'] if last_blood_test else None,
            "recommendation": "Bilan sanguin annuel recommandé"
        })
    
    # Analyser les conditions chroniques
    if patient.get('chronic_conditions'):
        for condition in patient['chronic_conditions']:
            followup_frequency = get_recommended_followup(condition['name'])
            last_checkup = await get_last_checkup(patient_id, condition['name'])
            
            if not last_checkup or days_since(last_checkup['date']) > followup_frequency:
                gaps['recommended_actions'].append({
                    "condition": condition['name'],
                    "action": "schedule_checkup",
                    "urgency": "medium",
                    "message": f"Suivi {condition['name']} recommandé"
                })
    
    # Si des lacunes critiques sont détectées
    if any(g['severity'] == 'high' for g in gaps['missing_data']):
        await notification_service.send_data_gap_alert(patient_id, gaps)
    
    return gaps
```

### Workflow 3: Génération Automatique de Rapport Médical

```python
async def generate_medical_report_workflow(patient_id: str, trigger: str = "manual"):
    """
    Génère un rapport médical complet en synthétisant toutes les données.
    
    trigger: "manual", "scheduled", "new_document", "anomaly_detected"
    """
    
    # 1. Collecter toutes les données patient
    patient = await db.patients.find_one({"id": patient_id})
    documents = await db.documents.find(
        {"patient_id": patient_id}
    ).sort("date", -1).to_list(100)
    
    consultations = await db.consultations.find(
        {"patient_id": patient_id}
    ).sort("date", -1).to_list(50)
    
    # 2. Analyser la timeline médicale
    timeline = await build_medical_timeline(patient_id)
    
    # 3. Identifier les tendances
    trends = await analyze_medical_trends(timeline)
    
    # 4. Calculer les scores de risque
    risk_scores = await calculate_risk_scores(patient, documents, consultations)
    
    # 5. Générer le rapport avec LLM
    llm_prompt = f"""
    Générer un rapport médical complet pour le patient.
    
    Informations Patient:
    - Âge: {patient['age']} ans
    - Sexe: {patient['gender']}
    - Conditions chroniques: {patient.get('chronic_conditions', [])}
    - Allergies: {patient.get('allergies', [])}
    
    Documents récents (3 derniers mois):
    {format_recent_documents(documents[:10])}
    
    Timeline médicale:
    {format_timeline(timeline)}
    
    Tendances détectées:
    {format_trends(trends)}
    
    Scores de risque:
    {format_risk_scores(risk_scores)}
    
    Générer un rapport structuré en JSON avec les sections:
    - executive_summary (résumé exécutif)
    - current_health_status (état de santé actuel)
    - medical_history_summary (résumé historique)
    - risk_factors (facteurs de risque identifiés)
    - recommendations (recommandations)
    - followup_plan (plan de suivi)
    
    Le rapport doit être en français médical clair et précis.
    """
    
    llm_response = await llm.ainvoke(llm_prompt)
    report_data = parse_json(llm_response.content)
    
    # 6. Enrichir avec des visualisations
    report_data['visualizations'] = await generate_report_visualizations(timeline, trends)
    
    # 7. Générer le PDF
    pdf_bytes = await generate_pdf_report(report_data)
    pdf_url = await storage_service.upload(
        file=pdf_bytes,
        path=f"reports/{patient_id}/report_{timestamp()}.pdf"
    )
    
    # 8. Sauvegarder le rapport
    report = {
        "id": generate_id(),
        "patient_id": patient_id,
        "type": "comprehensive",
        "trigger": trigger,
        "generated_at": datetime.utcnow(),
        "data": report_data,
        "pdf_url": pdf_url,
        "version": "1.0"
    }
    
    await db.reports.insert_one(report)
    
    # 9. Notifier le patient
    await notification_service.send_report_ready(patient_id, report['id'])
    
    return report
```

### Workflow 4: Planification Intelligente de Suivi

```python
async def schedule_followup_analysis(patient_id: str, analysis_result: dict):
    """
    Planifie automatiquement les analyses de suivi en fonction des résultats.
    """
    
    followup_tasks = []
    
    # Analyser les conditions détectées
    detected_conditions = analysis_result.get('conditions', [])
    
    for condition in detected_conditions:
        # Obtenir la fréquence de suivi recommandée
        followup_config = MEDICAL_FOLLOWUP_RULES.get(condition['name'])
        
        if followup_config:
            task = {
                "patient_id": patient_id,
                "type": "scheduled_analysis",
                "condition": condition['name'],
                "scheduled_date": datetime.utcnow() + timedelta(days=followup_config['days']),
                "priority": followup_config['priority'],
                "actions": followup_config['actions']
            }
            
            # Créer une tâche Celery planifiée
            await celery.send_task(
                "ai_agent.scheduled_analysis",
                args=[task],
                eta=task['scheduled_date']
            )
            
            followup_tasks.append(task)
    
    # Analyser les résultats de laboratoire
    lab_results = analysis_result.get('lab_results', [])
    for result in lab_results:
        if result['value'] > result['normal_range']['max']:
            # Valeur anormale détectée - programmer une vérification
            task = {
                "patient_id": patient_id,
                "type": "recheck_lab_value",
                "lab_test": result['test_name'],
                "scheduled_date": datetime.utcnow() + timedelta(days=30),
                "priority": "medium"
            }
            
            await celery.send_task(
                "ai_agent.recheck_analysis",
                args=[task],
                eta=task['scheduled_date']
            )
            
            followup_tasks.append(task)
    
    return followup_tasks

# Configuration des règles de suivi médical
MEDICAL_FOLLOWUP_RULES = {
    "hypertension": {
        "days": 90,  # Contrôle tous les 3 mois
        "priority": "medium",
        "actions": ["check_blood_pressure", "review_medications"]
    },
    "diabetes_type_2": {
        "days": 90,
        "priority": "high",
        "actions": ["hba1c_test", "glucose_monitoring", "review_diet"]
    },
    "kidney_cyst_bosniak_2f": {
        "days": 180,  # Contrôle tous les 6 mois
        "priority": "medium",
        "actions": ["imaging_mri", "renal_function_test"]
    },
    "chronic_kidney_disease": {
        "days": 60,
        "priority": "high",
        "actions": ["creatinine_test", "gfr_calculation", "nephrology_consult"]
    }
}
```

## Tools (Fonctions Appelables)

L'agent dispose de plusieurs outils qu'il peut invoquer de manière autonome.

```python
from langchain.tools import Tool

# 1. OCR Tool
ocr_tool = Tool(
    name="extract_text_from_document",
    description="Extract text from a medical document image or PDF using OCR",
    func=lambda doc_id: asyncio.run(ocr_service.process_document(doc_id))
)

# 2. NLP Extraction Tool
nlp_tool = Tool(
    name="extract_medical_entities",
    description="Extract medical entities (diagnosis, medications, dates, lab results) from text",
    func=lambda text: asyncio.run(nlp_service.extract_entities(text))
)

# 3. Database Query Tool
db_tool = Tool(
    name="query_medical_history",
    description="Query patient's medical history from database",
    func=lambda query: asyncio.run(db_service.query(query))
)

# 4. Report Generator Tool
report_tool = Tool(
    name="generate_medical_report",
    description="Generate a comprehensive medical report for a patient",
    func=lambda patient_id: asyncio.run(generate_medical_report_workflow(patient_id))
)

# 5. Scheduling Tool
schedule_tool = Tool(
    name="schedule_followup",
    description="Schedule a follow-up analysis or checkup",
    func=lambda params: asyncio.run(scheduler_service.schedule(params))
)

# 6. Notification Tool
notify_tool = Tool(
    name="send_notification",
    description="Send a notification to the patient",
    func=lambda message: asyncio.run(notification_service.send(message))
)

# Liste complète des outils
agent_tools = [
    ocr_tool,
    nlp_tool,
    db_tool,
    report_tool,
    schedule_tool,
    notify_tool
]
```

## Métriques & Monitoring

```python
# Métriques à tracker
AGENT_METRICS = {
    "documents_analyzed_total": Counter,
    "analysis_duration_seconds": Histogram,
    "confidence_score_average": Gauge,
    "clarifications_requested": Counter,
    "reports_generated_total": Counter,
    "anomalies_detected_total": Counter,
    "followup_tasks_scheduled": Counter,
    "agent_errors_total": Counter
}

# Logs structurés
import structlog

logger = structlog.get_logger()

async def log_agent_activity(activity_type: str, details: dict):
    logger.info(
        "agent_activity",
        activity_type=activity_type,
        patient_id=details.get('patient_id'),
        duration=details.get('duration'),
        confidence=details.get('confidence'),
        outcome=details.get('outcome')
    )
```

## Compliance & Safety

### Disclaimers
Tous les rapports générés incluent le disclaimer :

> **⚠️ AVERTISSEMENT MÉDICAL**
> Ce rapport a été généré automatiquement par un système d'intelligence artificielle et est fourni à titre informatif uniquement. Il ne remplace en aucun cas l'avis, le diagnostic ou le traitement d'un professionnel de santé qualifié. Consultez toujours votre médecin pour toute décision médicale.

### Limitations
- L'agent ne fait jamais de diagnostic médical définitif
- Ne prescrit jamais de médicaments
- Ne donne pas de conseils d'urgence (redirige vers 190 SAMU)
- Toujours recommander la consultation d'un médecin

## Évolution Future

### Amélioration Continue
- Fine-tuning de modèles LLM sur données médicales tunisiennes
- Apprentissage par renforcement basé sur feedback médecins
- Expansion des règles de suivi pour plus de pathologies
- Support multilingue (arabe médical)

### Capacités Avancées
- Prédiction de risques avec ML
- Recommandations de traitement basées sur guidelines
- Interaction vocale (speech-to-text)
- Vision computer pour analyse d'imagerie médicale
