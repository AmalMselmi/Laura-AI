# API Contracts - Laura HealthTech

Version: 1.0  
Base URL: `https://api.laura.tn/api/v1`  
Authentication: Bearer JWT Token

## Table des matières

1. [Authentication](#authentication)
2. [User Service](#user-service)
3. [Medical Records Service](#medical-records-service)
4. [AI Agent Service](#ai-agent-service)
5. [OCR & NLP Service](#ocr--nlp-service)
6. [Payment Service](#payment-service)
7. [WebSocket Events](#websocket-events)

---

## Authentication

### POST /auth/register

Créer un nouveau compte patient ou professionnel.

**Request:**
```json
{
  "email": "amira.bensalah@email.tn",
  "password": "SecurePass123!",
  "user_type": "patient",  // "patient" | "doctor"
  "profile": {
    "first_name": "Amira",
    "last_name": "Ben Salah",
    "date_of_birth": "1984-03-15",
    "gender": "F",
    "phone": "+216 98 765 432",
    "address": {
      "street": "45 Avenue Habib Bourguiba",
      "city": "Sousse",
      "postal_code": "4000",
      "country": "TN"
    }
  },
  // Si user_type == "doctor"
  "professional_info": {
    "specialty": "Néphrologie",
    "license_number": "TN123456789",
    "clinic_name": "Cabinet Dr. Mansour",
    "clinic_address": "..."
  }
}
```

**Response: 201 Created**
```json
{
  "user_id": "usr_abc123",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,  // 15 minutes
  "user": {
    "id": "usr_abc123",
    "email": "amira.bensalah@email.tn",
    "user_type": "patient",
    "profile": { ... }
  }
}
```

### POST /auth/login

Authentification utilisateur.

**Request:**
```json
{
  "email": "amira.bensalah@email.tn",
  "password": "SecurePass123!"
}
```

**Response: 200 OK**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": { ... }
}
```

### POST /auth/refresh

Rafraîchir le token d'accès.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response: 200 OK**
```json
{
  "access_token": "...",
  "expires_in": 900
}
```

---

## User Service

### GET /users/me

Récupérer le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response: 200 OK**
```json
{
  "id": "usr_abc123",
  "email": "amira.bensalah@email.tn",
  "user_type": "patient",
  "profile": {
    "first_name": "Amira",
    "last_name": "Ben Salah",
    "date_of_birth": "1984-03-15",
    "age": 42,
    "gender": "F",
    "blood_type": "A+",
    "phone": "+216 98 765 432",
    "address": { ... },
    "allergies": ["Pénicilline", "Fruits de mer"],
    "chronic_conditions": [
      {
        "name": "Kyste rénal Bosniak IIF",
        "diagnosed_date": "2023-06-15",
        "status": "Sous surveillance"
      }
    ]
  },
  "created_at": "2023-05-10T10:30:00Z",
  "updated_at": "2026-01-15T14:20:00Z"
}
```

### PATCH /users/me

Mettre à jour le profil utilisateur.

**Request:**
```json
{
  "profile": {
    "phone": "+216 99 123 456",
    "allergies": ["Pénicilline", "Fruits de mer", "Arachides"]
  }
}
```

**Response: 200 OK**
```json
{
  "id": "usr_abc123",
  "profile": { ... },  // Profil mis à jour
  "updated_at": "2026-02-01T10:00:00Z"
}
```

---

## Medical Records Service

### POST /documents/upload

Upload d'un document médical (PDF, image, DICOM).

**Request: Multipart Form Data**
```
file: [binary file data]
metadata: {
  "document_type": "lab_report",  // "lab_report" | "imaging" | "prescription" | "consultation_note" | "dicom"
  "date": "2026-01-15",
  "title": "Bilan rénal complet",
  "description": "Résultats analyses de sang",
  "tags": ["néphrologie", "analyses"],
  "auto_analyze": true  // Déclencher l'analyse IA automatiquement
}
```

**Response: 201 Created**
```json
{
  "document_id": "doc_xyz789",
  "patient_id": "usr_abc123",
  "filename": "bilan_renal_2026-01-15.pdf",
  "file_size": 245678,
  "mime_type": "application/pdf",
  "document_type": "lab_report",
  "date": "2026-01-15",
  "upload_url": "https://storage.laura.tn/documents/usr_abc123/doc_xyz789.pdf",
  "thumbnail_url": "https://storage.laura.tn/thumbnails/doc_xyz789.jpg",
  "status": "processing",  // "uploaded" | "processing" | "analyzed" | "error"
  "created_at": "2026-02-01T10:00:00Z",
  
  // Si auto_analyze = true
  "analysis": {
    "status": "queued",
    "job_id": "job_123",
    "estimated_completion": "2026-02-01T10:05:00Z"
  }
}
```

### GET /documents/{document_id}

Récupérer un document et ses métadonnées.

**Response: 200 OK**
```json
{
  "document_id": "doc_xyz789",
  "patient_id": "usr_abc123",
  "filename": "bilan_renal_2026-01-15.pdf",
  "document_type": "lab_report",
  "date": "2026-01-15",
  "title": "Bilan rénal complet",
  "description": "Résultats analyses de sang",
  "tags": ["néphrologie", "analyses"],
  "upload_url": "...",
  "thumbnail_url": "...",
  "status": "analyzed",
  "created_at": "2026-02-01T10:00:00Z",
  
  // Résultats de l'analyse IA
  "ai_analysis": {
    "status": "completed",
    "completed_at": "2026-02-01T10:04:30Z",
    "confidence_score": 0.92,
    "summary": "Fonction rénale normale. Créatinine: 0.9 mg/dL (normale). Urée: 32 mg/dL (normale).",
    "extracted_data": {
      "lab_results": [
        {
          "test_name": "Créatinine",
          "value": 0.9,
          "unit": "mg/dL",
          "normal_range": { "min": 0.6, "max": 1.2 },
          "status": "normal"
        },
        {
          "test_name": "Urée",
          "value": 32,
          "unit": "mg/dL",
          "normal_range": { "min": 10, "max": 50 },
          "status": "normal"
        }
      ],
      "date": "2026-01-10",
      "lab_name": "Laboratoire Central Sousse",
      "prescribing_doctor": "Dr. Karim Mansour"
    },
    "entities": [
      {
        "text": "Créatinine",
        "label": "LAB_TEST",
        "confidence": 0.98
      },
      {
        "text": "0.9 mg/dL",
        "label": "LAB_VALUE",
        "confidence": 0.95
      }
    ],
    "anomalies": [],
    "recommendations": [
      "Fonction rénale stable, poursuivre surveillance semestrielle"
    ]
  }
}
```

### GET /patients/{patient_id}/timeline

Récupérer la timeline médicale complète d'un patient.

**Query Parameters:**
- `start_date` (optional): ISO date
- `end_date` (optional): ISO date
- `event_types` (optional): comma-separated list

**Response: 200 OK**
```json
{
  "patient_id": "usr_abc123",
  "timeline": [
    {
      "id": "evt_001",
      "type": "diagnosis",
      "date": "2023-06-15",
      "title": "Diagnostic kyste rénal Bosniak IIF",
      "description": "Découverte d'un kyste rénal droit de 3.0cm lors d'une IRM abdominale",
      "source": {
        "type": "imaging",
        "document_id": "doc_001",
        "doctor": "Dr. Leila Gharbi (Radiologue)"
      },
      "severity": "moderate"
    },
    {
      "id": "evt_002",
      "type": "treatment",
      "date": "2023-06-20",
      "title": "Début traitement Losartan",
      "description": "Prescription de Losartan 50mg pour contrôle tensionnel",
      "source": {
        "type": "prescription",
        "document_id": "doc_002",
        "doctor": "Dr. Karim Mansour"
      },
      "medications": ["Losartan 50mg"]
    },
    {
      "id": "evt_003",
      "type": "lab_test",
      "date": "2026-01-10",
      "title": "Bilan rénal complet",
      "description": "Fonction rénale normale",
      "source": {
        "type": "lab_report",
        "document_id": "doc_xyz789"
      },
      "results": {
        "creatinine": { "value": 0.9, "unit": "mg/dL", "status": "normal" },
        "urea": { "value": 32, "unit": "mg/dL", "status": "normal" }
      }
    }
  ],
  "stats": {
    "total_events": 15,
    "diagnoses": 1,
    "treatments": 3,
    "lab_tests": 6,
    "imaging": 5
  }
}
```

### POST /documents/{document_id}/share

Partager un document avec un médecin.

**Request:**
```json
{
  "doctor_id": "usr_doc456",
  "access_level": "read",  // "read" | "comment" | "edit"
  "expires_at": "2026-03-01T00:00:00Z",  // optional
  "message": "Merci de consulter mon dernier bilan rénal"
}
```

**Response: 200 OK**
```json
{
  "share_id": "shr_abc123",
  "document_id": "doc_xyz789",
  "shared_with": {
    "doctor_id": "usr_doc456",
    "name": "Dr. Karim Mansour",
    "specialty": "Néphrologie"
  },
  "access_level": "read",
  "shared_at": "2026-02-01T10:00:00Z",
  "expires_at": "2026-03-01T00:00:00Z"
}
```

---

## AI Agent Service

### POST /ai/analyze-document

Déclencher une analyse IA d'un document (peut être automatique ou manuel).

**Request:**
```json
{
  "document_id": "doc_xyz789",
  "analysis_type": "comprehensive",  // "comprehensive" | "quick" | "specific"
  "options": {
    "extract_entities": true,
    "detect_anomalies": true,
    "generate_summary": true,
    "compare_with_history": true
  }
}
```

**Response: 202 Accepted**
```json
{
  "job_id": "job_ai_123",
  "document_id": "doc_xyz789",
  "status": "queued",
  "estimated_completion": "2026-02-01T10:05:00Z",
  "websocket_channel": "ai-analysis-job_ai_123"  // Pour recevoir updates en temps réel
}
```

### GET /ai/analysis/{job_id}

Vérifier le statut d'une analyse IA.

**Response: 200 OK**
```json
{
  "job_id": "job_ai_123",
  "status": "completed",  // "queued" | "processing" | "completed" | "failed"
  "started_at": "2026-02-01T10:00:30Z",
  "completed_at": "2026-02-01T10:04:30Z",
  "duration_seconds": 240,
  
  "result": {
    "confidence_score": 0.92,
    "summary": "Fonction rénale normale...",
    "extracted_data": { ... },
    "entities": [ ... ],
    "anomalies": [],
    "recommendations": [ ... ]
  }
}
```

### POST /ai/chat

Interagir avec l'agent IA conversationnel.

**Request:**
```json
{
  "message": "Peux-tu m'expliquer mes derniers résultats de laboratoire ?",
  "session_id": "sess_abc123",  // optional, pour continuité conversation
  "context": {
    "document_ids": ["doc_xyz789"],  // Documents de référence
    "patient_id": "usr_abc123"
  }
}
```

**Response: 200 OK**
```json
{
  "session_id": "sess_abc123",
  "message_id": "msg_001",
  "response": {
    "text": "D'après votre bilan rénal du 10 janvier 2026, votre fonction rénale est normale. Voici les détails :\n\n- **Créatinine**: 0.9 mg/dL (normale, entre 0.6 et 1.2)\n- **Urée**: 32 mg/dL (normale, entre 10 et 50)\n\nCes résultats sont rassurants et montrent que vos reins fonctionnent bien. C'est important de continuer votre surveillance semestrielle comme recommandé par votre médecin.",
    "sources": [
      {
        "document_id": "doc_xyz789",
        "title": "Bilan rénal complet",
        "date": "2026-01-10"
      }
    ],
    "suggested_questions": [
      "Dois-je modifier mon traitement ?",
      "Quand dois-je faire mon prochain bilan ?",
      "Y a-t-il des précautions à prendre ?"
    ],
    "confidence": 0.95
  },
  "metadata": {
    "model": "gpt-4-turbo",
    "tokens_used": 450,
    "processing_time_ms": 1200
  }
}
```

### GET /ai/reports/{patient_id}

Récupérer tous les rapports IA générés pour un patient.

**Query Parameters:**
- `report_type` (optional): "comprehensive" | "summary" | "timeline"
- `start_date` (optional): ISO date
- `limit` (optional): int, default 10

**Response: 200 OK**
```json
{
  "patient_id": "usr_abc123",
  "reports": [
    {
      "report_id": "rpt_001",
      "type": "comprehensive",
      "generated_at": "2026-01-20T10:00:00Z",
      "trigger": "scheduled",  // "manual" | "scheduled" | "new_document" | "anomaly"
      "title": "Rapport médical complet - Janvier 2026",
      "summary": {
        "health_status": "Stable",
        "risk_score": 35,
        "risk_level": "Faible-Modéré"
      },
      "sections": {
        "executive_summary": "État de santé stable avec kyste rénal sous surveillance...",
        "current_health_status": { ... },
        "risk_factors": [ ... ],
        "recommendations": [ ... ],
        "followup_plan": {
          "next_checkup": "2026-07-20",
          "tests_recommended": ["IRM abdominale", "Bilan rénal"]
        }
      },
      "pdf_url": "https://storage.laura.tn/reports/usr_abc123/rpt_001.pdf",
      "json_url": "https://api.laura.tn/api/v1/ai/reports/rpt_001/data"
    }
  ],
  "total": 12,
  "page": 1
}
```

### POST /ai/schedule-analysis

Programmer une analyse IA future (follow-up).

**Request:**
```json
{
  "patient_id": "usr_abc123",
  "analysis_type": "followup_checkup",
  "scheduled_date": "2026-07-20T09:00:00Z",
  "parameters": {
    "condition": "kyste_renal_bosniak_2f",
    "actions": ["review_imaging", "compare_progression"]
  },
  "notifications": {
    "remind_patient": true,
    "remind_before_days": 7
  }
}
```

**Response: 201 Created**
```json
{
  "scheduled_task_id": "task_sch_001",
  "patient_id": "usr_abc123",
  "scheduled_date": "2026-07-20T09:00:00Z",
  "status": "scheduled",
  "notifications": {
    "patient_reminder_date": "2026-07-13T09:00:00Z"
  }
}
```

### GET /ai/tasks/{patient_id}

Récupérer toutes les tâches IA planifiées pour un patient.

**Response: 200 OK**
```json
{
  "patient_id": "usr_abc123",
  "tasks": [
    {
      "task_id": "task_sch_001",
      "type": "followup_checkup",
      "scheduled_date": "2026-07-20T09:00:00Z",
      "status": "scheduled",
      "description": "Contrôle semestriel kyste rénal - IRM + bilan",
      "priority": "medium"
    },
    {
      "task_id": "task_auto_002",
      "type": "data_gap_check",
      "scheduled_date": "2026-02-08T00:00:00Z",
      "status": "scheduled",
      "description": "Vérification automatique des données manquantes",
      "priority": "low"
    }
  ]
}
```

---

## OCR & NLP Service

### POST /ocr/process

Extraire le texte d'un document image ou PDF.

**Request:**
```json
{
  "document_id": "doc_xyz789",
  "language": "fra+ara",  // Tesseract language codes
  "options": {
    "preprocess": true,  // Amélioration image avant OCR
    "detect_orientation": true,
    "extract_tables": true
  }
}
```

**Response: 200 OK**
```json
{
  "document_id": "doc_xyz789",
  "status": "completed",
  "pages": [
    {
      "page_number": 1,
      "text": "LABORATOIRE CENTRAL SOUSSE\nBilan Biologique\n\nPatient: Ben Salah Amira\nDate: 10/01/2026\n\nCréatinine: 0.9 mg/dL\nUrée: 32 mg/dL\n...",
      "confidence": 0.94,
      "language_detected": "fra",
      "tables": [
        {
          "rows": 3,
          "columns": 3,
          "data": [
            ["Test", "Valeur", "Norme"],
            ["Créatinine", "0.9 mg/dL", "0.6-1.2"],
            ["Urée", "32 mg/dL", "10-50"]
          ]
        }
      ]
    }
  ],
  "full_text": "...",
  "processing_time_ms": 2300
}
```

### POST /nlp/extract-entities

Extraire les entités médicales d'un texte (NER).

**Request:**
```json
{
  "text": "Patient atteint d'hypertension artérielle traité par Losartan 50mg. Créatinine à 0.9 mg/dL.",
  "entity_types": [
    "CONDITION",
    "MEDICATION",
    "LAB_TEST",
    "LAB_VALUE",
    "DOSAGE"
  ],
  "language": "fr"
}
```

**Response: 200 OK**
```json
{
  "entities": [
    {
      "text": "hypertension artérielle",
      "label": "CONDITION",
      "start": 16,
      "end": 39,
      "confidence": 0.98,
      "cui": "C0020538",  // UMLS Concept Unique Identifier
      "preferred_term": "Hypertension"
    },
    {
      "text": "Losartan",
      "label": "MEDICATION",
      "start": 53,
      "end": 61,
      "confidence": 0.99,
      "cui": "C0126174",
      "preferred_term": "Losartan"
    },
    {
      "text": "50mg",
      "label": "DOSAGE",
      "start": 62,
      "end": 66,
      "confidence": 0.95,
      "normalized": {
        "value": 50,
        "unit": "mg"
      }
    },
    {
      "text": "Créatinine",
      "label": "LAB_TEST",
      "start": 68,
      "end": 78,
      "confidence": 0.97,
      "cui": "C0010294"
    },
    {
      "text": "0.9 mg/dL",
      "label": "LAB_VALUE",
      "start": 81,
      "end": 90,
      "confidence": 0.96,
      "normalized": {
        "value": 0.9,
        "unit": "mg/dL",
        "test": "Créatinine"
      }
    }
  ],
  "model": "scispacy-fr-medical",
  "processing_time_ms": 150
}
```

### POST /nlp/classify-document

Classifier le type d'un document médical.

**Request:**
```json
{
  "text": "LABORATOIRE CENTRAL...",
  "filename": "bilan_2026.pdf"
}
```

**Response: 200 OK**
```json
{
  "document_type": "lab_report",
  "confidence": 0.96,
  "alternatives": [
    { "type": "lab_report", "confidence": 0.96 },
    { "type": "consultation_note", "confidence": 0.03 },
    { "type": "prescription", "confidence": 0.01 }
  ],
  "detected_subtypes": [
    "blood_test",
    "renal_function"
  ]
}
```

---

## Payment Service

### POST /payments/create-session

Créer une session de paiement Konnect.

**Request:**
```json
{
  "amount": 50.00,
  "currency": "TND",
  "description": "Consultation Dr. Karim Mansour - 05/02/2026",
  "appointment_id": "apt_123",
  "success_url": "https://laura.tn/payments/success",
  "cancel_url": "https://laura.tn/payments/cancel"
}
```

**Response: 200 OK**
```json
{
  "session_id": "pay_sess_abc123",
  "payment_url": "https://api.konnect.network/pay/sess_abc123",
  "amount": 50.00,
  "currency": "TND",
  "status": "pending",
  "expires_at": "2026-02-01T11:00:00Z"
}
```

### GET /payments/{payment_id}

Vérifier le statut d'un paiement.

**Response: 200 OK**
```json
{
  "payment_id": "pay_abc123",
  "session_id": "pay_sess_abc123",
  "amount": 50.00,
  "currency": "TND",
  "status": "succeeded",  // "pending" | "succeeded" | "failed" | "cancelled"
  "paid_at": "2026-02-01T10:15:30Z",
  "appointment_id": "apt_123",
  "receipt_url": "https://storage.laura.tn/receipts/pay_abc123.pdf"
}
```

---

## WebSocket Events

### Connection

```javascript
const ws = new WebSocket('wss://api.laura.tn/ws?token={access_token}');
```

### Events Émis par le Serveur

**Document Analysis Progress:**
```json
{
  "event": "ai.analysis.progress",
  "data": {
    "job_id": "job_ai_123",
    "document_id": "doc_xyz789",
    "status": "processing",
    "progress": 45,  // 0-100
    "current_step": "extracting_entities",
    "estimated_time_remaining": 120  // seconds
  }
}
```

**Document Analysis Completed:**
```json
{
  "event": "ai.analysis.completed",
  "data": {
    "job_id": "job_ai_123",
    "document_id": "doc_xyz789",
    "confidence_score": 0.92,
    "summary": "...",
    "anomalies_detected": 0
  }
}
```

**New Report Available:**
```json
{
  "event": "ai.report.ready",
  "data": {
    "report_id": "rpt_001",
    "type": "comprehensive",
    "title": "Rapport médical complet - Janvier 2026",
    "pdf_url": "..."
  }
}
```

**Appointment Status Changed:**
```json
{
  "event": "appointment.status_changed",
  "data": {
    "appointment_id": "apt_123",
    "status": "confirmed",
    "doctor": {
      "id": "usr_doc456",
      "name": "Dr. Karim Mansour"
    },
    "date": "2026-02-05T09:00:00Z"
  }
}
```

**AI Agent Question:**
```json
{
  "event": "ai.clarification_needed",
  "data": {
    "job_id": "job_ai_123",
    "document_id": "doc_xyz789",
    "questions": [
      {
        "id": "q1",
        "question": "Quelle est la date de ce document médical ?",
        "type": "date",
        "field": "document_date"
      }
    ]
  }
}
```

### Events Émis par le Client

**Answer Clarification:**
```json
{
  "event": "ai.answer_question",
  "data": {
    "job_id": "job_ai_123",
    "answers": [
      {
        "question_id": "q1",
        "answer": "2026-01-10"
      }
    ]
  }
}
```

---

## Error Responses

Tous les endpoints peuvent retourner les erreurs suivantes :

**400 Bad Request:**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation error",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**403 Forbidden:**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**429 Too Many Requests:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60  // seconds
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "req_abc123"  // Pour support debugging
  }
}
```

---

## Rate Limiting

- **Authenticated users**: 1000 requests / hour
- **Document upload**: 20 files / hour
- **AI analysis**: 50 requests / hour
- **Chat messages**: 100 messages / hour

Headers inclus dans chaque réponse :
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 856
X-RateLimit-Reset: 1643723400
```
