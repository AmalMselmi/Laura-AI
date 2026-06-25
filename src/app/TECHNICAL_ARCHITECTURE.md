# Laura HealthTech Platform - Technical Architecture

## 🏗️ System Overview

Laura is a production-ready HealthTech platform with autonomous AI medical assistant, bidirectional appointment system, and secure medical data processing.

### Core Technologies

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + PostgreSQL + Redis
- **AI Stack**: LangChain + GPT-4 + Azure Document Intelligence
- **Infrastructure**: AWS (S3, Lambda, RDS, ElastiCache)
- **Security**: JWT + AES-256 + RBAC

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Patient    │  │ Professional │  │   AI Agent   │          │
│  │  Dashboard   │  │  Dashboard   │  │  Interface   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (FastAPI)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication  │  Rate Limiting  │  Request Logging    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌────────────────────────┐         ┌────────────────────────┐
│   BUSINESS SERVICES    │         │    AI SERVICES LAYER   │
│                        │         │                        │
│ ┌────────────────────┐ │         │ ┌────────────────────┐ │
│ │ User Service       │ │         │ │ AI Agent Orchestr. │ │
│ │ Appointment Svc    │ │         │ │ Document OCR       │ │
│ │ Medical Records    │ │         │ │ NLP Extraction     │ │
│ │ Insurance Service  │ │         │ │ Report Generator   │ │
│ │ Notification Svc   │ │         │ │ Risk Analyzer      │ │
│ └────────────────────┘ │         │ └────────────────────┘ │
└────────┬───────────────┘         └────────┬───────────────┘
         │                                   │
         └───────────────┬───────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │  Redis Cache │  │  S3 Storage  │          │
│  │  (Medical    │  │  (Sessions,  │  │  (Documents, │          │
│  │   Records)   │  │   AI Memory) │  │   Reports)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agent Architecture

### Autonomous Agent Components

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTONOMOUS AI AGENT                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    ORCHESTRATOR                         │ │
│  │  - Task Planning & Execution                           │ │
│  │  - Decision Tree Logic                                 │ │
│  │  │  - Memory Management                                │ │
│  └────┬───────────────────────────────────────────────────┘ │
│       │                                                      │
│  ┌────┴───────────────────────────────────────────────┐    │
│  │                                                      │    │
│  ▼                    ▼                    ▼           │    │
│ ┌───────────┐   ┌───────────┐   ┌──────────────┐    │    │
│ │  TOOLS    │   │  MEMORY   │   │  REASONING   │    │    │
│ │           │   │           │   │              │    │    │
│ │ - OCR     │   │ Short-term│   │ - LLM Core   │    │    │
│ │ - NLP     │   │ - Session │   │ - Chain of   │    │    │
│ │ - Search  │   │ - Context │   │   Thought    │    │    │
│ │ - Generate│   │           │   │ - Self-      │    │    │
│ │           │   │ Long-term │   │   Reflection │    │    │
│ │           │   │ - Vector  │   │              │    │    │
│ │           │   │   DB      │   │              │    │    │
│ │           │   │ - Patient │   │              │    │    │
│ │           │   │   History │   │              │    │    │
│ └───────────┘   └───────────┘   └──────────────┘    │    │
│                                                      │    │
│  ┌──────────────────────────────────────────────────┘    │
│  │                                                         │
│  ▼                                                         │
│ ┌───────────────────────────────────────────────────────┐ │
│ │              EXECUTION WORKFLOWS                       │ │
│ │                                                        │ │
│ │  1. Document Analysis Workflow                        │ │
│ │     Upload → OCR → Extract → Analyze → Store          │ │
│ │                                                        │ │
│ │  2. Medical Summary Generation                        │ │
│ │     Query History → Aggregate → Analyze → Generate    │ │
│ │                                                        │ │
│ │  3. Risk Assessment Workflow                          │ │
│ │     Analyze Data → Pattern Match → Score → Alert      │ │
│ │                                                        │ │
│ │  4. Timeline Construction                             │ │
│ │     Extract Events → Order → Visualize → Export       │ │
│ │                                                        │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Agent Decision Logic

```python
# Simplified Agent Logic
class MedicalAIAgent:
    def process_task(self, task_type, input_data):
        # 1. Task Planning
        plan = self.create_execution_plan(task_type)

        # 2. Execute with Memory
        context = self.memory.get_relevant_context(input_data)

        # 3. Decision Tree
        for step in plan:
            if step.requires_human_input():
                return self.request_clarification(step)

            result = self.execute_step(step, context)

            if step.is_final():
                self.memory.store_long_term(result)
                return result

            context.update(result)
```

---

## 💾 Database Schema

### PostgreSQL Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'patient' or 'doctor'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    insurance_number VARCHAR(50),
    insurance_provider VARCHAR(100),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20)
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    clinic_address TEXT,
    consultation_fee DECIMAL(10, 2),
    bio TEXT
);

-- Medical Records
CREATE TABLE medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL, -- 'lab_result', 'prescription', 'imaging', etc.
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(50),
    upload_date TIMESTAMP DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_analysis JSONB, -- Structured AI analysis results
    metadata JSONB -- OCR text, extracted entities, etc.
);

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    visit_date DATE NOT NULL,
    diagnosis TEXT,
    symptoms TEXT[],
    medications JSONB, -- [{name, dosage, frequency, duration}]
    lab_results JSONB,
    vital_signs JSONB, -- {bp, hr, temp, weight, height}
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type VARCHAR(20) NOT NULL, -- 'in-person', 'video', 'phone'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    reason TEXT,
    notes TEXT,
    patient_notes TEXT,
    doctor_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Monday, 6=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(doctor_id, day_of_week, start_time)
);

CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    booked_by UUID REFERENCES patients(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Processing
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type VARCHAR(50) NOT NULL, -- 'document_analysis', 'report_generation', 'risk_assessment'
    patient_id UUID REFERENCES patients(id),
    input_data JSONB,
    status VARCHAR(20) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    progress INTEGER DEFAULT 0,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'summary', 'timeline', 'risk_assessment'
    generated_by VARCHAR(50) DEFAULT 'ai_agent',
    report_data JSONB NOT NULL,
    file_url TEXT, -- PDF export
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit & Compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    details JSONB
);

-- Indexes for Performance
CREATE INDEX idx_appointments_patient ON appointments(patient_id, appointment_date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_medical_documents_patient ON medical_documents(patient_id, upload_date DESC);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status, created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC);
```

---

## 🔌 API Endpoints

### Authentication & Users

```
POST   /api/v1/auth/register           - Register new user
POST   /api/v1/auth/login              - Login
POST   /api/v1/auth/logout             - Logout
POST   /api/v1/auth/refresh            - Refresh JWT token
GET    /api/v1/users/me                - Get current user profile
PUT    /api/v1/users/me                - Update profile
```

### Appointments (Bidirectional)

```
# Patient Actions
GET    /api/v1/appointments/patient    - Get patient's appointments
POST   /api/v1/appointments/search     - Search available doctors
GET    /api/v1/appointments/slots      - Get available slots for a doctor
POST   /api/v1/appointments             - Book new appointment
PUT    /api/v1/appointments/{id}       - Update appointment
DELETE /api/v1/appointments/{id}       - Cancel appointment

# Doctor Actions
GET    /api/v1/appointments/doctor     - Get doctor's appointments
GET    /api/v1/appointments/pending    - Get pending appointment requests
PUT    /api/v1/appointments/{id}/accept - Accept appointment
PUT    /api/v1/appointments/{id}/reject - Reject appointment
GET    /api/v1/availability             - Get availability schedule
POST   /api/v1/availability             - Set availability
PUT    /api/v1/availability/{id}       - Update availability
DELETE /api/v1/availability/{id}       - Remove availability
```

### Medical Records

```
GET    /api/v1/records/patient/{id}    - Get patient records (doctor only)
POST   /api/v1/records                  - Add medical record (doctor only)
PUT    /api/v1/records/{id}            - Update record
GET    /api/v1/documents               - Get patient documents
POST   /api/v1/documents/upload        - Upload document
GET    /api/v1/documents/{id}          - Get document
DELETE /api/v1/documents/{id}          - Delete document
```

### AI Services

```
POST   /api/v1/ai/analyze-document      - Trigger document analysis
GET    /api/v1/ai/tasks/{id}            - Get AI task status
POST   /api/v1/ai/generate-summary      - Generate medical summary
POST   /api/v1/ai/generate-timeline     - Generate timeline
POST   /api/v1/ai/risk-assessment       - Run risk assessment
GET    /api/v1/ai/reports               - Get AI-generated reports
GET    /api/v1/ai/reports/{id}/pdf      - Download report as PDF
POST   /api/v1/ai/chat                  - AI assistant chat (async)
```

### Insurance

```
GET    /api/v1/insurance/providers      - Get insurance providers
GET    /api/v1/insurance/patient        - Get patient insurance info
POST   /api/v1/insurance                - Add insurance
PUT    /api/v1/insurance/{id}           - Update insurance
GET    /api/v1/insurance/claims         - Get claims history
POST   /api/v1/insurance/claim          - Submit claim
```

---

## 🔄 Document Processing Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                 DOCUMENT PROCESSING FLOW                      │
└──────────────────────────────────────────────────────────────┘

1. UPLOAD
   ┌─────────────┐
   │  User       │
   │  Uploads    │──┐
   │  Document   │  │
   └─────────────┘  │
                    ▼
   ┌──────────────────────────┐
   │  API Gateway             │
   │  - Validate file type    │
   │  - Check file size       │
   │  - Generate UUID         │
   └──────────┬───────────────┘
              ▼
2. STORAGE
   ┌──────────────────────────┐
   │  S3 Bucket               │
   │  - Encrypted upload      │
   │  - Generate presigned    │
   │    URL for retrieval     │
   └──────────┬───────────────┘
              ▼
   ┌──────────────────────────┐
   │  Database Entry          │
   │  - Store metadata        │
   │  - Status: PENDING       │
   └──────────┬───────────────┘
              ▼
3. ASYNC PROCESSING (AWS Lambda / Celery Worker)
   ┌──────────────────────────┐
   │  OCR Service             │
   │  (Azure Document Intel)  │
   │  - Extract text          │
   │  - Detect tables         │
   │  - Parse structure       │
   └──────────┬───────────────┘
              ▼
   ┌──────────────────────────┐
   │  NLP Extraction          │
   │  (GPT-4 + Medical NER)   │
   │  - Extract entities:     │
   │    * Diagnosis           │
   │    * Medications         │
   │    * Lab results         │
   │    * Dates               │
   │    * Doctor names        │
   └──────────┬───────────────┘
              ▼
   ┌──────────────────────────┐
   │  Medical Classification  │
   │  - Document type         │
   │  - Urgency level         │
   │  - Risk indicators       │
   └──────────┬───────────────┘
              ▼
4. STORAGE & INDEXING
   ┌──────────────────────────┐
   │  Update Database         │
   │  - Store extracted data  │
   │  - Status: COMPLETED     │
   │  - AI analysis JSON      │
   └──────────┬───────────────┘
              ▼
   ┌──────────────────────────┐
   │  Vector Database         │
   │  (Pinecone/Weaviate)     │
   │  - Embed document        │
   │  - Enable semantic       │
   │    search                │
   └──────────┬───────────────┘
              ▼
5. NOTIFICATION
   ┌──────────────────────────┐
   │  Notify User             │
   │  - WebSocket update      │
   │  - Email notification    │
   └──────────────────────────┘
```

---

## 🧠 AI Agent Workflows

### Workflow 1: Autonomous Document Analysis

```python
# Pseudocode for Agent Workflow
class DocumentAnalysisWorkflow:
    async def execute(self, document_id: str):
        # 1. Initialize
        self.memory.start_session(document_id)

        # 2. Retrieve Document
        document = await self.tools.get_document(document_id)

        # 3. OCR Extraction
        ocr_result = await self.tools.run_ocr(document.file_url)
        self.memory.store("ocr_text", ocr_result.text)

        # 4. Entity Extraction
        prompt = f"""
        Extract medical entities from this document:
        {ocr_result.text}

        Return JSON with:
        - diagnosis: list of diagnoses
        - medications: list with name, dosage, frequency
        - lab_results: list with test name, value, unit, reference
        - dates: list of relevant dates
        - symptoms: list of symptoms mentioned
        """

        entities = await self.llm.extract_structured(prompt)
        self.memory.store("entities", entities)

        # 5. Classification
        doc_type = await self.classify_document(ocr_result.text)

        # 6. Risk Assessment
        risks = await self.assess_risks(entities)

        # 7. Store Results
        result = {
            "document_type": doc_type,
            "extracted_entities": entities,
            "risk_indicators": risks,
            "confidence_score": self.calculate_confidence(),
            "processed_at": datetime.now()
        }

        await self.storage.save_analysis(document_id, result)

        # 8. Trigger Follow-up Actions
        if risks.has_high_priority:
            await self.notify_doctor(risks)

        return result
```

### Workflow 2: Medical Summary Generation

```python
class MedicalSummaryWorkflow:
    async def execute(self, patient_id: str):
        # 1. Gather Historical Data
        documents = await self.db.get_patient_documents(patient_id)
        records = await self.db.get_medical_records(patient_id)

        # 2. Build Context
        context = {
            "patient_info": await self.db.get_patient(patient_id),
            "document_count": len(documents),
            "records_count": len(records),
            "latest_records": records[:10]
        }

        # 3. Extract Timeline Events
        events = []
        for doc in documents:
            if doc.ai_analysis:
                events.extend(self.extract_timeline_events(doc))

        for record in records:
            events.append({
                "date": record.visit_date,
                "type": "consultation",
                "diagnosis": record.diagnosis,
                "medications": record.medications
            })

        # 4. Sort and Analyze Timeline
        timeline = sorted(events, key=lambda x: x["date"])

        # 5. Generate Summary with LLM
        prompt = f"""
        You are a medical AI assistant. Generate a comprehensive medical summary
        for the patient based on their complete medical history.

        Patient Info: {context["patient_info"]}
        Medical Events: {timeline}

        Generate a summary including:
        1. Current Health Status
        2. Chronic Conditions
        3. Medications History
        4. Major Medical Events
        5. Allergies and Risk Factors
        6. Recommended Follow-ups

        Be factual and do not diagnose. Present information clearly.
        """

        summary = await self.llm.generate(prompt)

        # 6. Store Report
        report = {
            "summary": summary,
            "timeline": timeline,
            "statistics": self.calculate_stats(timeline),
            "generated_at": datetime.now()
        }

        await self.db.save_ai_report(patient_id, "summary", report)

        return report
```

### Workflow 3: Risk Assessment

```python
class RiskAssessmentWorkflow:
    async def execute(self, patient_id: str):
        # 1. Collect Data
        patient = await self.db.get_patient(patient_id)
        records = await self.db.get_medical_records(patient_id)
        documents = await self.db.get_patient_documents(patient_id)

        # 2. Calculate Age-Based Risks
        age = self.calculate_age(patient.date_of_birth)
        age_risks = self.get_age_related_risks(age, patient.gender)

        # 3. Medication Interaction Analysis
        current_meds = self.extract_current_medications(records)
        interactions = await self.check_drug_interactions(current_meds)

        # 4. Pattern Recognition
        diagnoses = [r.diagnosis for r in records if r.diagnosis]
        patterns = await self.detect_chronic_patterns(diagnoses)

        # 5. Lab Results Analysis
        lab_results = self.extract_lab_results(documents, records)
        abnormal_results = self.identify_abnormal_values(lab_results)

        # 6. LLM-Based Risk Scoring
        prompt = f"""
        Analyze the following patient data and identify potential health risks:

        Patient: {age} year old {patient.gender}
        Chronic conditions: {patterns}
        Current medications: {current_meds}
        Recent abnormal lab results: {abnormal_results}
        Known interactions: {interactions}

        Return JSON with:
        - risk_level: low/medium/high
        - risk_factors: list of identified risks
        - recommendations: list of actions
        - requires_attention: boolean
        """

        ai_analysis = await self.llm.analyze(prompt)

        # 7. Compile Report
        risk_report = {
            "overall_risk_level": ai_analysis["risk_level"],
            "risk_factors": ai_analysis["risk_factors"],
            "age_related_risks": age_risks,
            "medication_interactions": interactions,
            "abnormal_lab_values": abnormal_results,
            "recommendations": ai_analysis["recommendations"],
            "requires_immediate_attention": ai_analysis["requires_attention"],
            "assessed_at": datetime.now()
        }

        # 8. Alert if High Risk
        if risk_report["overall_risk_level"] == "high":
            await self.send_alert_to_doctor(patient_id, risk_report)

        return risk_report
```

---

## 🔐 Security & Compliance

### HIPAA/GDPR Compliance

```
┌──────────────────────────────────────────────────────────────┐
│                  SECURITY MEASURES                            │
└──────────────────────────────────────────────────────────────┘

1. DATA ENCRYPTION
   ├─ At Rest: AES-256 encryption (database + S3)
   ├─ In Transit: TLS 1.3
   └─ Key Management: AWS KMS

2. ACCESS CONTROL
   ├─ Role-Based Access Control (RBAC)
   ├─ Patient: Own data only
   ├─ Doctor: Assigned patients only
   ├─ JWT tokens (15min access, 7day refresh)
   └─ MFA for sensitive operations

3. AUDIT LOGGING
   ├─ All data access logged
   ├─ Immutable audit trail
   ├─ 7-year retention
   └─ Real-time monitoring

4. DATA PRIVACY
   ├─ Patient consent management
   ├─ Right to deletion (GDPR)
   ├─ Data export capability
   └─ Anonymization for AI training

5. COMPLIANCE FEATURES
   ├─ PHI de-identification
   ├─ Access request tracking
   ├─ Breach notification system
   └─ Regular security audits
```

### Authentication Flow

```python
# JWT Authentication
class AuthService:
    def generate_tokens(self, user_id: str, role: str):
        access_token = jwt.encode({
            "sub": user_id,
            "role": role,
            "type": "access",
            "exp": datetime.utcnow() + timedelta(minutes=15)
        }, SECRET_KEY)

        refresh_token = jwt.encode({
            "sub": user_id,
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=7)
        }, SECRET_KEY)

        return access_token, refresh_token

    def verify_access(self, token: str, required_role: str = None):
        try:
            payload = jwt.decode(token, SECRET_KEY)

            if payload["type"] != "access":
                raise InvalidTokenError()

            if required_role and payload["role"] != required_role:
                raise InsufficientPermissionsError()

            return payload["sub"]
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
```

---

## 📦 Backend Implementation Example

### FastAPI Application Structure

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn

app = FastAPI(title="Laura HealthTech API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Routers
from routers import auth, appointments, medical_records, ai_services

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(medical_records.router, prefix="/api/v1/records", tags=["medical_records"])
app.include_router(ai_services.router, prefix="/api/v1/ai", tags=["ai"])

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Appointment Service Implementation

```python
# services/appointment_service.py
from typing import List, Optional
from datetime import datetime, time, timedelta
from models import Appointment, DoctorAvailability, AppointmentSlot
from database import get_db

class AppointmentService:
    async def create_appointment(
        self,
        patient_id: str,
        doctor_id: str,
        appointment_date: date,
        appointment_time: time,
        type: str,
        reason: str
    ) -> Appointment:
        """Patient books an appointment"""

        # 1. Check slot availability
        slot = await self.get_slot(doctor_id, appointment_date, appointment_time)
        if not slot or not slot.is_available:
            raise HTTPException(400, "Slot not available")

        # 2. Create appointment
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            type=type,
            reason=reason,
            status="pending"  # Requires doctor confirmation
        )

        db = get_db()
        await db.appointments.insert(appointment)

        # 3. Mark slot as booked
        slot.is_available = False
        slot.booked_by = patient_id
        await db.appointment_slots.update(slot)

        # 4. Notify doctor
        await self.notification_service.notify_doctor(
            doctor_id,
            f"New appointment request from patient {patient_id}"
        )

        return appointment

    async def accept_appointment(
        self,
        appointment_id: str,
        doctor_id: str
    ) -> Appointment:
        """Doctor accepts appointment"""

        db = get_db()
        appointment = await db.appointments.get(appointment_id)

        if appointment.doctor_id != doctor_id:
            raise HTTPException(403, "Not authorized")

        if appointment.status != "pending":
            raise HTTPException(400, "Appointment already processed")

        appointment.status = "confirmed"
        appointment.updated_at = datetime.utcnow()
        await db.appointments.update(appointment)

        # Notify patient
        await self.notification_service.notify_patient(
            appointment.patient_id,
            f"Your appointment on {appointment.appointment_date} has been confirmed"
        )

        return appointment

    async def get_available_slots(
        self,
        doctor_id: str,
        start_date: date,
        end_date: date
    ) -> List[AppointmentSlot]:
        """Get available slots for a doctor"""

        db = get_db()

        # Get doctor's availability settings
        availability = await db.doctor_availability.filter(
            doctor_id=doctor_id,
            is_active=True
        )

        slots = []
        current_date = start_date

        while current_date <= end_date:
            day_of_week = current_date.weekday()

            # Find availability for this day
            day_availability = [a for a in availability if a.day_of_week == day_of_week]

            for avail in day_availability:
                # Generate slots based on duration
                current_time = avail.start_time
                while current_time < avail.end_time:
                    # Check if slot already exists and is available
                    existing_slot = await db.appointment_slots.get(
                        doctor_id=doctor_id,
                        slot_date=current_date,
                        slot_time=current_time
                    )

                    if existing_slot and existing_slot.is_available:
                        slots.append(existing_slot)

                    # Move to next slot
                    current_time = (
                        datetime.combine(current_date, current_time) +
                        timedelta(minutes=avail.slot_duration_minutes)
                    ).time()

            current_date += timedelta(days=1)

        return slots

    async def set_availability(
        self,
        doctor_id: str,
        day_of_week: int,
        start_time: time,
        end_time: time,
        slot_duration_minutes: int = 30
    ) -> DoctorAvailability:
        """Doctor sets their availability"""

        db = get_db()

        availability = DoctorAvailability(
            doctor_id=doctor_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            slot_duration_minutes=slot_duration_minutes,
            is_active=True
        )

        await db.doctor_availability.insert(availability)

        # Generate slots for next 3 months
        await self.generate_future_slots(doctor_id, availability, months=3)

        return availability

    async def generate_future_slots(
        self,
        doctor_id: str,
        availability: DoctorAvailability,
        months: int = 3
    ):
        """Generate appointment slots based on availability"""

        db = get_db()
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=30 * months)

        current_date = start_date
        while current_date <= end_date:
            if current_date.weekday() == availability.day_of_week:
                current_time = availability.start_time

                while current_time < availability.end_time:
                    slot = AppointmentSlot(
                        doctor_id=doctor_id,
                        slot_date=current_date,
                        slot_time=current_time,
                        is_available=True
                    )

                    await db.appointment_slots.insert(slot)

                    current_time = (
                        datetime.combine(current_date, current_time) +
                        timedelta(minutes=availability.slot_duration_minutes)
                    ).time()

            current_date += timedelta(days=1)
```

### AI Agent Implementation

```python
# services/ai_agent.py
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.tools import Tool
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

class MedicalAIAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        self.memory = ConversationBufferMemory(return_messages=True)
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self) -> List[Tool]:
        return [
            Tool(
                name="extract_medical_entities",
                func=self.extract_medical_entities,
                description="Extract medical entities (diagnosis, medications, lab results) from text"
            ),
            Tool(
                name="classify_document",
                func=self.classify_document,
                description="Classify medical document type"
            ),
            Tool(
                name="assess_risk",
                func=self.assess_risk,
                description="Assess health risks based on patient data"
            ),
            Tool(
                name="generate_summary",
                func=self.generate_summary,
                description="Generate medical summary from patient history"
            ),
            Tool(
                name="search_medical_database",
                func=self.search_medical_database,
                description="Search patient's medical history"
            )
        ]

    def _create_agent(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are Laura, an AI medical assistant. Your role is to:
            1. Analyze medical documents accurately
            2. Extract structured medical information
            3. Generate comprehensive medical summaries
            4. Identify potential health risks (NOT diagnose)
            5. Provide helpful medical information assistance

            Always be factual, cite sources when available, and include disclaimers
            that you are an AI assistant and not a replacement for professional
            medical advice."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])

        agent = create_openai_functions_agent(self.llm, self.tools, prompt)
        return AgentExecutor(agent=agent, tools=self.tools, memory=self.memory)

    async def process_document(self, document_id: str, ocr_text: str):
        """Autonomous document processing"""

        input_text = f"""
        Analyze this medical document and extract all relevant information:

        {ocr_text}

        Tasks:
        1. Classify the document type
        2. Extract all medical entities
        3. Identify any risk indicators
        4. Structure the information in JSON format
        """

        result = await self.agent.ainvoke({"input": input_text})

        return result["output"]

    async def extract_medical_entities(self, text: str) -> dict:
        """Extract structured medical entities"""

        prompt = f"""
        Extract medical entities from the following text and return as JSON:

        {text}

        Required fields:
        - diagnosis: list of diagnoses mentioned
        - medications: list of medications with dosage
        - lab_results: list with test name, value, unit
        - dates: relevant medical dates
        - symptoms: symptoms mentioned
        - doctor_names: any physician names mentioned

        Return only valid JSON.
        """

        response = await self.llm.apredict(prompt)
        return json.loads(response)

    async def generate_medical_summary(self, patient_id: str):
        """Generate comprehensive medical summary"""

        # Get patient data
        history = await self.search_medical_database(patient_id)

        prompt = f"""
        Generate a comprehensive medical summary for this patient:

        {history}

        Include:
        1. Current Health Status Overview
        2. Chronic Conditions and Management
        3. Medication History and Current Prescriptions
        4. Significant Medical Events Timeline
        5. Allergies and Contraindications
        6. Recommended Follow-up Actions

        Be factual and clinical. Do not diagnose. Present information clearly
        for healthcare providers.
        """

        result = await self.agent.ainvoke({"input": prompt})

        return result["output"]
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   CloudFlare    │  ← CDN + DDoS Protection
└────────┬────────┘
         │
┌────────▼────────┐
│  Load Balancer  │  ← AWS ALB
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    │          │          │          │
┌───▼───┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐
│ Web 1 │  │ Web 2│  │ Web 3│  │ Web N│  ← EC2 Auto Scaling
└───┬───┘  └──┬───┘  └──┬───┘  └──┬───┘
    └─────────┴──────────┴──────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼──────┐     ┌──────▼─────┐
│ RDS      │     │  ElastiCache│
│PostgreSQL│     │  (Redis)    │
│Multi-AZ  │     └─────────────┘
└──────────┘
    │
┌───▼──────┐     ┌─────────────┐
│   S3     │     │  Lambda     │  ← Async Processing
│Documents │     │  Workers    │
└──────────┘     └─────────────┘
```

### Infrastructure as Code (Terraform)

```hcl
# terraform/main.tf
provider "aws" {
  region = "eu-west-1"
}

# VPC
resource "aws_vpc" "laura_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "laura-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "laura_db" {
  identifier           = "laura-db"
  engine              = "postgres"
  engine_version      = "15.3"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  storage_encrypted   = true
  multi_az           = true

  db_name  = "laura"
  username = var.db_username
  password = var.db_password

  backup_retention_period = 30
  backup_window          = "03:00-04:00"

  tags = {
    Name = "laura-database"
  }
}

# S3 for Documents
resource "aws_s3_bucket" "medical_documents" {
  bucket = "laura-medical-documents"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule {
    enabled = true

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

# Lambda for Document Processing
resource "aws_lambda_function" "document_processor" {
  filename      = "lambda/document_processor.zip"
  function_name = "laura-document-processor"
  role         = aws_iam_role.lambda_role.arn
  handler      = "index.handler"
  runtime      = "python3.11"
  timeout      = 300

  environment {
    variables = {
      DB_HOST = aws_db_instance.laura_db.endpoint
      S3_BUCKET = aws_s3_bucket.medical_documents.id
    }
  }
}
```

---

## 📊 Monitoring & Observability

```
┌──────────────────────────────────────────────────────────────┐
│                     MONITORING STACK                          │
└──────────────────────────────────────────────────────────────┘

Application Metrics (Prometheus + Grafana)
├─ API Response Times
├─ Request Rate & Error Rate
├─ Database Query Performance
├─ AI Processing Times
└─ User Activity

Logging (ELK Stack)
├─ Application Logs
├─ Audit Logs
├─ Error Tracking
└─ Security Events

Health Checks
├─ /health endpoint
├─ Database connectivity
├─ Redis connectivity
├─ S3 access
└─ External API status

Alerts (PagerDuty / Slack)
├─ High error rate
├─ Slow API responses
├─ Database issues
├─ Security incidents
└─ AI processing failures
```

---

## 💡 Production Readiness Checklist

```
✅ Security
  ├─ HTTPS/TLS 1.3
  ├─ JWT authentication
  ├─ RBAC implemented
  ├─ Data encryption (rest + transit)
  ├─ Input validation & sanitization
  ├─ Rate limiting
  └─ Security headers

✅ Performance
  ├─ Database indexing
  ├─ Query optimization
  ├─ Caching strategy (Redis)
  ├─ CDN for static assets
  ├─ Async processing for heavy tasks
  └─ Connection pooling

✅ Scalability
  ├─ Horizontal scaling (auto-scaling groups)
  ├─ Load balancing
  ├─ Database read replicas
  ├─ Microservices architecture ready
  └─ Queue-based processing (SQS/Celery)

✅ Reliability
  ├─ Multi-AZ deployment
  ├─ Automated backups
  ├─ Disaster recovery plan
  ├─ Health checks & monitoring
  └─ Circuit breakers

✅ Compliance
  ├─ HIPAA compliance measures
  ├─ GDPR compliance (EU)
  ├─ Audit logging
  ├─ Data retention policies
  └─ Consent management

✅ DevOps
  ├─ CI/CD pipeline (GitHub Actions)
  ├─ Infrastructure as Code (Terraform)
  ├─ Automated testing
  ├─ Blue-green deployment
  └─ Rollback procedures
```

This architecture is production-ready and can be deployed to AWS with proper configuration.