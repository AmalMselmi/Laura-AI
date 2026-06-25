# 🤖 Documentation Complète - Agent IA Autonome Laura

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de l'Agent IA](#architecture-de-lagent-ia)
3. [Types d'Agents](#types-dagents)
4. [Configuration & Déploiement](#configuration--déploiement)
5. [Workflows & Pipelines](#workflows--pipelines)
6. [Modèles IA & NLP](#modèles-ia--nlp)
7. [API & Intégrations](#api--intégrations)
8. [Sécurité & Conformité](#sécurité--conformité)
9. [Performance & Monitoring](#performance--monitoring)

---

## 🎯 Vue d'ensemble

### Philosophie de l'Agent IA Laura

L'Agent IA de Laura est conçu comme un **assistant médical autonome intelligent** qui :

- ✅ Analyse les documents médicaux **automatiquement** sans intervention utilisateur
- ✅ Détecte les données médicales manquantes et sollicite le patient uniquement si nécessaire
- ✅ Programme des analyses de suivi basées sur des protocoles médicaux
- ✅ Génère des rapports de prévention personnalisés
- ✅ Pose des questions de clarification uniquement quand nécessaire
- ✅ Utilise OCR avancé avec lecture d'image data complète

### Caractéristiques Clés

| Fonctionnalité | Description |
|----------------|-------------|
| **Autonomie** | Fonctionne sans prompts utilisateur, analyse proactive |
| **Intelligence** | Modèles NLP médicaux + ML pour détection de patterns |
| **Contexte** | Accès au dossier médical complet du patient |
| **Proactivité** | Détection automatique d'anomalies et recommandations |
| **Sécurité** | Conformité HIPAA/RGPD, cryptage end-to-end |

---

## 🏗️ Architecture de l'Agent IA

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT IA AUTONOME LAURA                  │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │ OCR     │      │ NLP       │     │ ML        │
   │ Engine  │      │ Engine    │     │ Engine    │
   └────┬────┘      └─────┬─────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │Document │      │Knowledge  │     │Patient    │
   │Processor│      │Graph      │     │Context    │
   └────┬────┘      └─────┬─────┘     └─────┬─────┘
        │                  │                  │
        └──────────────────▼──────────────────┘
                    ┌─────────────┐
                    │  Decision   │
                    │  Engine     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │Auto     │      │Scheduled  │     │Interactive│
   │Analysis │      │Tasks      │     │Chat       │
   └─────────┘      └───────────┘     └───────────┘
```

### Composants Principaux

#### 1. **Document Ingestion Layer**
- Upload handler (multi-format)
- Queue management (RabbitMQ/Celery)
- File preprocessing
- Metadata extraction

#### 2. **OCR Engine**
```python
class AdvancedOCREngine:
    """
    Moteur OCR avancé avec support multi-langue et reconnaissance manuscrite
    """
    def __init__(self):
        self.tesseract = TesseractEngine()
        self.google_vision = GoogleVisionAPI()
        self.handwriting_model = HandwritingRecognitionModel()
        self.medical_dict = MedicalDictionary()
        
    def extract_text(self, image: Image) -> OCRResult:
        """
        Extraction de texte avec multiples stratégies
        """
        # Preprocessing
        image = self.preprocess(image)
        
        # Multiple OCR engines for accuracy
        results = []
        results.append(self.tesseract.extract(image))
        results.append(self.google_vision.extract(image))
        
        # Detect handwriting
        if self.detect_handwriting(image):
            results.append(self.handwriting_model.extract(image))
        
        # Consensus algorithm
        final_text = self.consensus(results)
        
        # Medical term correction
        final_text = self.medical_dict.correct(final_text)
        
        return OCRResult(
            text=final_text,
            confidence=self.calculate_confidence(results),
            language='fr',
            regions=self.detect_regions(image)
        )
    
    def preprocess(self, image: Image) -> Image:
        """
        Prétraitement d'image pour améliorer l'OCR
        """
        # Deskew (correction rotation)
        image = self.deskew(image)
        
        # Denoise (réduction bruit)
        image = cv2.fastNlMeansDenoisingColored(image)
        
        # Binarization (seuillage adaptatif)
        image = cv2.adaptiveThreshold(image)
        
        # Contrast enhancement
        image = self.enhance_contrast(image)
        
        return image
```

#### 3. **NLP Medical Engine**
```python
class MedicalNLPEngine:
    """
    Moteur NLP spécialisé médical avec Named Entity Recognition
    """
    def __init__(self):
        self.biobert = BioBERT.load_pretrained()
        self.ner_model = MedicalNER()
        self.drug_db = VIDALDatabase()
        self.icd10_classifier = ICD10Classifier()
        
    def analyze(self, text: str) -> MedicalAnalysis:
        """
        Analyse NLP complète d'un document médical
        """
        # Named Entity Recognition
        entities = self.extract_entities(text)
        
        # Relationship extraction
        relationships = self.extract_relationships(entities)
        
        # Medical classification
        classification = self.classify_document(text)
        
        # Drug interaction check
        interactions = self.check_drug_interactions(entities.medications)
        
        return MedicalAnalysis(
            entities=entities,
            relationships=relationships,
            classification=classification,
            interactions=interactions,
            confidence=self.calculate_confidence()
        )
    
    def extract_entities(self, text: str) -> MedicalEntities:
        """
        Extraction d'entités médicales
        """
        entities = MedicalEntities()
        
        # Medications (with dosage, frequency)
        entities.medications = self.ner_model.extract(
            text, entity_type='MEDICATION'
        )
        
        # Diseases / Conditions
        entities.conditions = self.ner_model.extract(
            text, entity_type='CONDITION'
        )
        
        # Procedures
        entities.procedures = self.ner_model.extract(
            text, entity_type='PROCEDURE'
        )
        
        # Lab results
        entities.lab_results = self.extract_lab_values(text)
        
        # Doctors / Healthcare providers
        entities.providers = self.ner_model.extract(
            text, entity_type='PROVIDER'
        )
        
        # Dates
        entities.dates = self.extract_dates(text)
        
        return entities
```

#### 4. **Knowledge Graph**
```python
class MedicalKnowledgeGraph:
    """
    Graphe de connaissances médicales pour raisonnement contextuel
    """
    def __init__(self):
        self.neo4j = Neo4jConnection()
        self.umls = UMLSIntegration()
        self.pubmed = PubMedAPI()
        
    def build_patient_graph(self, patient_id: str) -> Graph:
        """
        Construction du graphe de connaissances patient
        """
        graph = Graph()
        
        # Patient node
        patient = self.neo4j.get_patient(patient_id)
        graph.add_node(patient)
        
        # Medical documents
        documents = self.neo4j.get_documents(patient_id)
        for doc in documents:
            graph.add_node(doc)
            graph.add_edge(patient, doc, relationship='HAS_DOCUMENT')
        
        # Conditions
        conditions = self.neo4j.get_conditions(patient_id)
        for condition in conditions:
            graph.add_node(condition)
            graph.add_edge(patient, condition, relationship='HAS_CONDITION')
            
            # Link to related research
            research = self.pubmed.search(condition.name)
            for article in research:
                graph.add_node(article)
                graph.add_edge(condition, article, relationship='RELATED_RESEARCH')
        
        # Medications
        medications = self.neo4j.get_medications(patient_id)
        for med in medications:
            graph.add_node(med)
            graph.add_edge(patient, med, relationship='TAKES_MEDICATION')
            
            # Link to conditions
            for condition in med.treats:
                graph.add_edge(med, condition, relationship='TREATS')
        
        # Relationships between entities
        self.add_causal_relationships(graph)
        self.add_temporal_relationships(graph)
        
        return graph
    
    def query_graph(self, query: str, patient_id: str) -> QueryResult:
        """
        Requête sur le graphe de connaissances
        """
        cypher_query = self.translate_to_cypher(query)
        results = self.neo4j.execute(cypher_query)
        
        return QueryResult(
            results=results,
            confidence=self.calculate_confidence(results),
            sources=self.extract_sources(results)
        )
```

#### 5. **Autonomous Decision Engine**
```python
class AutonomousDecisionEngine:
    """
    Moteur de décision autonome avec règles médicales et ML
    """
    def __init__(self):
        self.rules_engine = MedicalRulesEngine()
        self.ml_model = DecisionTreeClassifier()
        self.risk_assessor = RiskAssessmentModel()
        
    def process_document(self, document: Document, patient: Patient) -> Decision:
        """
        Traitement autonome d'un document médical
        """
        # 1. Analyze document
        analysis = self.analyze_document(document)
        
        # 2. Check against patient context
        context = self.get_patient_context(patient)
        
        # 3. Identify missing data
        missing_data = self.identify_missing_data(analysis, context)
        
        # 4. Risk assessment
        risks = self.assess_risks(analysis, context)
        
        # 5. Generate actions
        actions = self.generate_actions(analysis, missing_data, risks)
        
        # 6. Schedule follow-ups
        followups = self.schedule_followups(analysis, context)
        
        return Decision(
            actions=actions,
            followups=followups,
            risks=risks,
            requires_user_input=len(missing_data) > 0,
            clarification_questions=self.generate_questions(missing_data)
        )
    
    def identify_missing_data(self, analysis: Analysis, context: Context) -> List[MissingData]:
        """
        Identification autonome des données manquantes
        """
        missing = []
        
        # Check for missing medication dosage
        for med in analysis.medications:
            if not med.dosage:
                missing.append(MissingData(
                    type='MEDICATION_DOSAGE',
                    medication=med.name,
                    importance='HIGH',
                    question=f"Quelle est la posologie de {med.name}?"
                ))
        
        # Check for missing dates
        if not analysis.document_date:
            missing.append(MissingData(
                type='DOCUMENT_DATE',
                importance='MEDIUM',
                question="À quelle date ce document a-t-il été établi?"
            ))
        
        # Check for missing lab values
        for lab in analysis.lab_tests:
            if not lab.value:
                missing.append(MissingData(
                    type='LAB_VALUE',
                    test=lab.name,
                    importance='HIGH',
                    question=f"Quelle est la valeur de {lab.name}?"
                ))
        
        return missing
    
    def schedule_followups(self, analysis: Analysis, context: Context) -> List[FollowUp]:
        """
        Programmation automatique des suivis
        """
        followups = []
        
        # Bosniak IIF protocol
        if 'bosniak_iif' in analysis.conditions:
            last_exam = context.get_last_exam('IRM')
            months_since = (datetime.now() - last_exam.date).days / 30
            
            if months_since >= 5:
                followups.append(FollowUp(
                    type='EXAM',
                    exam_type='IRM',
                    urgency='HIGH',
                    recommended_date=datetime.now() + timedelta(days=30),
                    protocol='Bosniak IIF surveillance',
                    reason='Contrôle à 6 mois recommandé'
                ))
        
        # Medication renewal
        for med in analysis.medications:
            if med.end_date and (med.end_date - datetime.now()).days <= 7:
                followups.append(FollowUp(
                    type='PRESCRIPTION_RENEWAL',
                    medication=med.name,
                    urgency='MEDIUM',
                    recommended_date=med.end_date - timedelta(days=3),
                    reason='Renouvellement ordonnance'
                ))
        
        # Preventive screenings
        age = context.patient.age
        if age >= 50 and not context.has_recent_exam('COLONOSCOPY', years=5):
            followups.append(FollowUp(
                type='SCREENING',
                exam_type='COLONOSCOPY',
                urgency='MEDIUM',
                reason='Dépistage cancer colorectal recommandé après 50 ans'
            ))
        
        return followups
```

---

## 🎨 Types d'Agents

### 1. Agent Analyseur de Documents

**Rôle** : Analyse automatique de tout document uploadé

**Workflow** :
```
Document Upload
    ↓
Automatic Trigger
    ↓
OCR Extraction
    ↓
NLP Analysis
    ↓
Entity Extraction
    ↓
Knowledge Graph Update
    ↓
Risk Assessment
    ↓
Generate Recommendations
    ↓
Notify Patient (if needed)
```

**Configuration** :
```yaml
document_analyzer_agent:
  trigger: on_upload
  auto_start: true
  priority: high
  
  ocr_config:
    engines: [tesseract, google_vision, custom_handwriting]
    languages: [fr, ar, en]
    confidence_threshold: 0.85
    
  nlp_config:
    model: biobert_medical_french
    entity_types: [medication, condition, procedure, lab_result, provider]
    relationship_extraction: true
    
  output:
    store_in_db: true
    notify_patient: on_critical_findings
    generate_summary: true
```

### 2. Agent de Prévention

**Rôle** : Surveillance proactive et recommandations préventives

**Workflow** :
```
Scheduled Check (daily)
    ↓
Analyze Patient Timeline
    ↓
Check Medical Protocols
    ↓
Identify Due/Overdue Items
    ↓
Risk Assessment
    ↓
Generate Preventive Recommendations
    ↓
Schedule Follow-ups
    ↓
Notify Patient
```

**Configuration** :
```yaml
prevention_agent:
  schedule: "0 8 * * *"  # Daily at 8am
  enabled: true
  
  checks:
    - type: medication_renewal
      advance_notice_days: 7
      
    - type: exam_followup
      protocols:
        - bosniak_iif: 
            interval_months: 6
            tolerance_days: 14
        - chronic_kidney_disease:
            interval_months: 3
            
    - type: preventive_screening
      age_based_rules:
        - age: 50+
          screening: colonoscopy
          interval_years: 5
        - age: 40+
          screening: mammography
          interval_years: 2
          
  notification:
    channels: [in_app, email]
    urgency_levels:
      high: immediate
      medium: daily_digest
      low: weekly_digest
```

### 3. Agent Conversationnel

**Rôle** : Chat médical intelligent avec accès au dossier complet

**Workflow** :
```
User Query
    ↓
Intent Classification
    ↓
Context Retrieval (Medical Records)
    ↓
Knowledge Graph Query
    ↓
Generate Response (GPT-4)
    ↓
Medical Validation
    ↓
Add Citations & Sources
    ↓
Response + Follow-up Questions
```

**Configuration** :
```yaml
conversational_agent:
  enabled: true
  availability: 24/7
  
  llm_config:
    model: gpt-4-turbo
    temperature: 0.3
    max_tokens: 1000
    
  system_prompt: |
    Tu es un assistant médical IA expert pour Laura Health en Tunisie.
    Tu as accès au dossier médical complet du patient.
    
    RÈGLES STRICTES:
    - Toujours baser tes réponses sur le dossier médical du patient
    - Citer tes sources (documents, examens, prescriptions)
    - Ajouter un disclaimer médical pour tout conseil
    - Ne JAMAIS diagnostiquer ou prescrire
    - Orienter vers consultation médicale si nécessaire
    - Utiliser un langage clair et empathique
    - Mentionner les numéros d'urgence si situation grave
    
  context_retrieval:
    max_documents: 10
    relevance_threshold: 0.7
    include_types: [prescription, lab_result, imaging, consultation_note]
    
  medical_validation:
    enabled: true
    verify_against: [medical_guidelines, drug_database]
    flag_dangerous_advice: true
    
  response_format:
    include_sources: true
    add_disclaimer: true
    suggest_followup_questions: true
    max_length: 500_words
```

### 4. Agent de Détection d'Interactions

**Rôle** : Surveillance en temps réel des interactions médicamenteuses

**Workflow** :
```
New Medication Added
    ↓
Retrieve Active Medications
    ↓
Check Drug Database
    ↓
Identify Interactions
    ↓
Assess Severity
    ↓
Generate Alerts
    ↓
Notify Patient & Doctor
```

**Configuration** :
```yaml
interaction_detection_agent:
  trigger: on_medication_change
  enabled: true
  real_time: true
  
  databases:
    - vidal_france
    - drugbank
    - custom_tunisian_db
    
  severity_levels:
    critical:
      action: block_and_alert
      notify: [patient, prescriber, pharmacist]
      
    major:
      action: warn_strongly
      notify: [patient, prescriber]
      
    moderate:
      action: inform
      notify: [patient]
      
    minor:
      action: log_only
      
  checks:
    - drug_drug_interactions
    - drug_allergy_interactions
    - drug_condition_contraindications
    - dosage_validation
    - duplicate_therapy
    
  alert_format:
    patient_message: simplified_explanation
    doctor_message: clinical_details
    include_recommendations: true
    include_alternatives: true
```

### 5. Agent de Score de Santé

**Rôle** : Calcul et mise à jour quotidienne du score de santé global

**Workflow** :
```
Scheduled Calculation (daily)
    ↓
Retrieve Patient Data
    ↓
Calculate Sub-scores
    ├─ Medical Follow-up (30%)
    ├─ Medication Adherence (25%)
    ├─ Prevention Score (25%)
    └─ Lifestyle Score (20%)
    ↓
Calculate Overall Score
    ↓
Identify Improvements
    ↓
Generate Recommendations
    ↓
Update Dashboard
```

**Configuration** :
```yaml
health_score_agent:
  schedule: "0 9 * * *"  # Daily at 9am
  enabled: true
  
  scoring_algorithm:
    medical_followup:
      weight: 0.30
      factors:
        - recent_checkups
        - specialist_visits
        - exam_compliance
        
    medication_adherence:
      weight: 0.25
      factors:
        - prescription_renewals
        - dosage_compliance
        - interaction_avoidance
        
    prevention:
      weight: 0.25
      factors:
        - screening_completion
        - vaccination_status
        - followup_adherence
        
    lifestyle:
      weight: 0.20
      factors:
        - vitals_tracking
        - exercise_logged
        - nutrition_data
        
  thresholds:
    excellent: 85-100
    good: 70-84
    fair: 50-69
    needs_improvement: 0-49
    
  recommendations:
    enabled: true
    max_per_category: 3
    prioritize_by: impact_score
```

---

## ⚙️ Configuration & Déploiement

### Configuration Globale

```yaml
# config/ai_agent_config.yaml

laura_ai_agent:
  version: "2.0.0"
  environment: production
  
  # Global settings
  global:
    language: fr
    timezone: Africa/Tunis
    log_level: INFO
    monitoring: enabled
    
  # Agent orchestration
  orchestration:
    engine: celery
    broker: redis://localhost:6379/0
    backend: redis://localhost:6379/1
    max_workers: 10
    task_timeout: 300
    
  # Database
  database:
    primary: postgresql://user:pass@localhost/laura
    replica: postgresql://user:pass@localhost/laura_replica
    connection_pool_size: 20
    
  # Storage
  storage:
    type: s3
    bucket: laura-medical-documents
    region: eu-west-1
    encryption: AES256
    
  # Models
  models:
    ocr:
      tesseract:
        version: "5.3.0"
        language_packs: [fra, ara, eng]
      google_vision:
        api_key: ${GOOGLE_VISION_API_KEY}
        
    nlp:
      biobert:
        model_path: models/biobert_french_medical
        device: cuda:0
      ner:
        model_path: models/medical_ner_french
        
    llm:
      provider: openai
      model: gpt-4-turbo
      api_key: ${OPENAI_API_KEY}
      max_tokens: 2000
      temperature: 0.3
      
  # Agents configuration
  agents:
    document_analyzer:
      enabled: true
      priority: high
      auto_start: true
      
    prevention:
      enabled: true
      schedule: "0 8 * * *"
      
    conversational:
      enabled: true
      availability: always
      
    interaction_detection:
      enabled: true
      real_time: true
      
    health_score:
      enabled: true
      schedule: "0 9 * * *"
      
  # Security
  security:
    encryption:
      algorithm: AES-256-GCM
      key_rotation: 90_days
    authentication:
      jwt_secret: ${JWT_SECRET}
      jwt_algorithm: RS256
    rate_limiting:
      enabled: true
      requests_per_minute: 60
      
  # Monitoring & Logging
  monitoring:
    prometheus:
      enabled: true
      port: 9090
    sentry:
      dsn: ${SENTRY_DSN}
      environment: production
    logging:
      level: INFO
      format: json
      output: [stdout, file]
```

### Déploiement Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-ara \
    libtesseract-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download models
RUN python -m spacy download fr_core_news_lg
RUN python download_models.py

# Copy application
COPY . .

# Run as non-root user
RUN useradd -m aiagent
USER aiagent

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python healthcheck.py

# Start agent
CMD ["python", "agent_orchestrator.py"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-agent:
    build:
      context: ./ai-agent
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/laura
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_VISION_API_KEY=${GOOGLE_VISION_API_KEY}
    volumes:
      - ./models:/app/models:ro
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    restart: unless-stopped
    
  celery-worker:
    build: ./ai-agent
    command: celery -A agent_tasks worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/laura
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - db
    deploy:
      replicas: 5
      
  celery-beat:
    build: ./ai-agent
    command: celery -A agent_tasks beat --loglevel=info
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=laura
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### Scripts de Déploiement

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying Laura AI Agent..."

# Pull latest code
git pull origin main

# Build Docker images
docker-compose build

# Run database migrations
docker-compose run --rm ai-agent python manage.py migrate

# Download/update ML models
docker-compose run --rm ai-agent python download_models.py

# Run tests
docker-compose run --rm ai-agent pytest tests/

# Deploy
docker-compose up -d

# Health check
sleep 10
curl -f http://localhost:8000/health || exit 1

echo "✅ Deployment successful!"
```

---

## 🔄 Workflows & Pipelines

### Pipeline Complet d'Analyse

```python
# agent_workflows.py

from celery import chain, group, chord

class DocumentAnalysisPipeline:
    """
    Pipeline complet d'analyse de document
    """
    
    @staticmethod
    def execute(document_id: str):
        """
        Exécute le pipeline d'analyse complet
        """
        workflow = chain(
            # Step 1: Preprocessing
            preprocess_document.si(document_id),
            
            # Step 2: Parallel extraction
            group(
                ocr_extract.s(),
                image_features.s(),
                metadata_extract.s()
            ),
            
            # Step 3: NLP Analysis
            nlp_analyze.s(),
            
            # Step 4: Entity linking
            link_entities.s(),
            
            # Step 5: Knowledge graph update
            update_knowledge_graph.s(),
            
            # Step 6: Parallel checks
            group(
                check_drug_interactions.s(),
                assess_risks.s(),
                identify_missing_data.s(),
                generate_recommendations.s()
            ),
            
            # Step 7: Consolidation
            consolidate_results.s(),
            
            # Step 8: Notification
            notify_patient.s()
        )
        
        return workflow.apply_async()


@celery.task
def preprocess_document(document_id: str):
    """Prétraitement du document"""
    doc = Document.get(document_id)
    
    # Image processing
    if doc.is_image():
        doc.image = deskew(doc.image)
        doc.image = denoise(doc.image)
        doc.image = enhance_contrast(doc.image)
    
    # PDF processing
    elif doc.is_pdf():
        doc.images = pdf_to_images(doc.file)
    
    doc.save()
    return document_id


@celery.task
def ocr_extract(document_id: str):
    """Extraction OCR"""
    doc = Document.get(document_id)
    
    # Multi-engine OCR
    results = []
    results.append(tesseract_extract(doc.image))
    results.append(google_vision_extract(doc.image))
    
    # Handwriting detection
    if detect_handwriting(doc.image):
        results.append(handwriting_extract(doc.image))
    
    # Consensus
    final_text = consensus_algorithm(results)
    
    doc.ocr_text = final_text
    doc.ocr_confidence = calculate_confidence(results)
    doc.save()
    
    return document_id


@celery.task
def nlp_analyze(document_id: str):
    """Analyse NLP"""
    doc = Document.get(document_id)
    
    # Entity extraction
    entities = ner_model.extract(doc.ocr_text)
    
    # Classification
    doc_type = classify_document(doc.ocr_text)
    
    # Relationship extraction
    relationships = extract_relationships(entities)
    
    doc.entities = entities
    doc.document_type = doc_type
    doc.relationships = relationships
    doc.save()
    
    return document_id


@celery.task
def check_drug_interactions(document_id: str):
    """Vérification des interactions médicamenteuses"""
    doc = Document.get(document_id)
    patient = doc.patient
    
    new_meds = doc.entities.medications
    current_meds = patient.active_medications
    
    interactions = []
    for new_med in new_meds:
        for current_med in current_meds:
            interaction = check_interaction(new_med, current_med)
            if interaction:
                interactions.append(interaction)
    
    if interactions:
        Alert.create(
            patient=patient,
            type='DRUG_INTERACTION',
            severity=max(i.severity for i in interactions),
            interactions=interactions
        )
    
    return document_id


@celery.task
def generate_recommendations(document_id: str):
    """Génération de recommandations"""
    doc = Document.get(document_id)
    patient = doc.patient
    
    recommendations = []
    
    # Analyze document in context
    context = build_patient_context(patient)
    
    # Generate recommendations
    if 'bosniak_iif' in doc.entities.conditions:
        recommendations.append(
            generate_bosniak_followup_recommendation(patient, context)
        )
    
    # Check for missing exams
    missing_exams = identify_missing_exams(patient, context)
    for exam in missing_exams:
        recommendations.append(
            generate_exam_recommendation(exam)
        )
    
    # Save recommendations
    for rec in recommendations:
        Recommendation.create(
            patient=patient,
            document=doc,
            **rec
        )
    
    return document_id


@celery.task
def notify_patient(document_id: str):
    """Notification patient"""
    doc = Document.get(document_id)
    patient = doc.patient
    
    # Get high priority items
    alerts = Alert.get_active(patient, priority='HIGH')
    recommendations = Recommendation.get_active(patient, priority='HIGH')
    
    if alerts or recommendations:
        send_notification(
            patient=patient,
            title="Nouvelle analyse disponible",
            message=f"Votre document '{doc.title}' a été analysé. {len(alerts)} alertes et {len(recommendations)} recommandations.",
            type='DOCUMENT_ANALYSIS',
            link=f"/documents/{doc.id}"
        )
    
    return document_id
```

---

## 📊 Performance & Monitoring

### Métriques Clés

```python
# monitoring/metrics.py

from prometheus_client import Counter, Histogram, Gauge

# Document processing metrics
documents_processed = Counter(
    'documents_processed_total',
    'Total documents processed',
    ['document_type', 'status']
)

ocr_duration = Histogram(
    'ocr_processing_duration_seconds',
    'OCR processing duration',
    buckets=[0.1, 0.5, 1, 2, 5, 10]
)

ocr_confidence = Histogram(
    'ocr_confidence_score',
    'OCR confidence score',
    buckets=[0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0]
)

# NLP metrics
entities_extracted = Counter(
    'entities_extracted_total',
    'Total entities extracted',
    ['entity_type']
)

# Recommendations metrics
recommendations_generated = Counter(
    'recommendations_generated_total',
    'Total recommendations generated',
    ['category', 'priority']
)

# Health score metrics
health_scores = Histogram(
    'patient_health_scores',
    'Patient health scores distribution',
    buckets=[0, 25, 50, 75, 85, 95, 100]
)

# Agent performance
active_agents = Gauge(
    'active_agents',
    'Number of active agents',
    ['agent_type']
)

agent_task_duration = Histogram(
    'agent_task_duration_seconds',
    'Agent task duration',
    ['agent_type', 'task_type'],
    buckets=[0.1, 1, 5, 10, 30, 60, 300]
)
```

### Dashboard Monitoring

```yaml
# grafana_dashboard.json
{
  "dashboard": {
    "title": "Laura AI Agent Monitoring",
    "panels": [
      {
        "title": "Documents Processed",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(documents_processed_total[5m])"
          }
        ]
      },
      {
        "title": "OCR Confidence Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, ocr_confidence_score)"
          }
        ]
      },
      {
        "title": "Recommendations by Priority",
        "type": "pie",
        "targets": [
          {
            "expr": "sum(recommendations_generated_total) by (priority)"
          }
        ]
      },
      {
        "title": "Agent Task Duration (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(agent_task_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 Sécurité & Conformité

### Conformité RGPD / HIPAA

```python
# security/compliance.py

class ComplianceManager:
    """
    Gestion de la conformité RGPD/HIPAA
    """
    
    @staticmethod
    def anonymize_data(data: Dict) -> Dict:
        """Anonymisation des données sensibles"""
        sensitive_fields = ['name', 'email', 'phone', 'address', 'ssn']
        
        for field in sensitive_fields:
            if field in data:
                data[field] = hash_sensitive_data(data[field])
        
        return data
    
    @staticmethod
    def audit_access(user_id: str, resource_id: str, action: str):
        """Audit des accès aux données"""
        AuditLog.create(
            timestamp=datetime.now(),
            user_id=user_id,
            resource_id=resource_id,
            resource_type='MEDICAL_DOCUMENT',
            action=action,
            ip_address=get_client_ip(),
            user_agent=get_user_agent()
        )
    
    @staticmethod
    def check_consent(patient_id: str, purpose: str) -> bool:
        """Vérification du consentement"""
        consent = Consent.get(patient_id, purpose)
        
        if not consent:
            raise ConsentNotGrantedError(
                f"Patient {patient_id} has not granted consent for {purpose}"
            )
        
        if consent.is_expired():
            raise ConsentExpiredError(
                f"Consent for {purpose} has expired"
            )
        
        return True
    
    @staticmethod
    def handle_data_deletion_request(patient_id: str):
        """Traitement de la demande de suppression RGPD"""
        # Soft delete - keep for legal purposes
        patient = Patient.get(patient_id)
        patient.mark_deleted()
        
        # Anonymize all data
        documents = Document.get_by_patient(patient_id)
        for doc in documents:
            doc.anonymize()
        
        # Log deletion
        DeletionLog.create(
            patient_id=patient_id,
            requested_at=datetime.now(),
            reason='GDPR_RIGHT_TO_DELETION'
        )
```

---

## 📚 Ressources & Documentation

### API Documentation

Documentation interactive disponible sur : `https://api.laura-health.tn/docs`

### Tutoriels

1. [Démarrage rapide](./tutorials/quickstart.md)
2. [Configuration avancée](./tutorials/advanced_config.md)
3. [Création d'agents personnalisés](./tutorials/custom_agents.md)
4. [Intégration ML models](./tutorials/ml_integration.md)

### Support

- **Email**: ai-support@laura-health.tn
- **Documentation**: https://docs.laura-health.tn
- **GitHub**: https://github.com/laura-health/ai-agent

---

**Version**: 2.0.0  
**Dernière mise à jour**: 2 Février 2026  
**Auteurs**: Équipe IA Laura HealthTech  
**License**: Propriétaire - Laura HealthTech © 2026
