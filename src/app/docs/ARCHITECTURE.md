# Laura HealthTech - Architecture Technique Complète

## Vue d'ensemble du système

Laura est une plateforme HealthTech full-stack avec IA autonome pour l'analyse médicale, la gestion de dossiers, et l'assistance aux patients en Tunisie.

## Stack Technique

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + useState/useReducer
- **Real-time**: WebSocket pour notifications IA
- **File Upload**: Multipart upload avec progress tracking

### Backend API Layer
- **Framework**: Python FastAPI (async)
- **Database**: PostgreSQL 15 (données structurées) + MongoDB (documents JSON)
- **Cache**: Redis (sessions, task queue)
- **Storage**: S3-compatible (MinIO/AWS S3) pour documents médicaux
- **Message Queue**: Celery + Redis (tâches asynchrones IA)

### AI & ML Services
- **OCR**: Tesseract OCR + Azure Computer Vision API
- **NLP Medical**: spaCy + scispaCy (modèle médical français)
- **LLM**: OpenAI GPT-4 / Azure OpenAI (analyse médicale)
- **Agent Framework**: LangGraph (orchestration agent autonome)
- **Vector DB**: Pinecone / Weaviate (mémoire long-terme agent)

### Infrastructure & DevOps
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Security**: Vault (secrets), Let's Encrypt (SSL)

## Architecture Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  React SPA (Web) + React Native (Mobile iOS/Android)            │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/WSS
┌────────────────────────▼────────────────────────────────────────┐
│                    API GATEWAY (Kong/Nginx)                      │
│  - Rate Limiting  - Authentication  - Load Balancing             │
└───┬─────────┬─────────┬──────────┬──────────┬───────────────────┘
    │         │         │          │          │
    ▼         ▼         ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────────┐
│ User   │ │Medical │ │AI Agent │ │Payment │ │Notification  │
│Service │ │Records │ │Service  │ │Service │ │Service       │
└───┬────┘ └───┬────┘ └────┬────┘ └───┬────┘ └──────┬───────┘
    │          │           │          │             │
    ▼          ▼           ▼          ▼             ▼
┌──────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                │
│  PostgreSQL    MongoDB    Redis    S3 Storage    Vector DB   │
└──────────────────────────────────────────────────────────────┘
```

## Services Détaillés

### 1. User Service (Port 8001)
**Responsabilités**:
- Authentification JWT (access + refresh tokens)
- Gestion profils patients/médecins
- RBAC (Role-Based Access Control)
- 2FA (authentification à deux facteurs)

**API Endpoints**:
- `POST /api/v1/auth/register` - Création compte
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/users/me` - Profil utilisateur
- `PATCH /api/v1/users/me` - Mise à jour profil

### 2. Medical Records Service (Port 8002)
**Responsabilités**:
- CRUD dossiers médicaux
- Upload documents (PDF, DICOM, images)
- Gestion métadonnées documents
- Historique consultations
- Partage sécurisé avec médecins

**API Endpoints**:
- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents/{id}` - Récupérer document
- `GET /api/v1/patients/{id}/timeline` - Timeline médical
- `POST /api/v1/documents/{id}/share` - Partager avec médecin

### 3. AI Agent Service (Port 8003) ⭐ CORE
**Responsabilités**:
- Orchestration agent IA autonome
- Analyse automatique documents
- Génération rapports médicaux
- Détection anomalies
- Scheduling analyses follow-up
- Gestion mémoire agent (court + long terme)

**API Endpoints**:
- `POST /api/v1/ai/analyze-document` - Déclencher analyse
- `GET /api/v1/ai/reports/{patient_id}` - Récupérer rapports
- `POST /api/v1/ai/chat` - Interaction avec agent
- `GET /api/v1/ai/tasks/{patient_id}` - Tâches planifiées
- `POST /api/v1/ai/schedule-analysis` - Programmer analyse

**Workflows Agent**:
1. **Document Analysis Workflow**
2. **Follow-up Scheduling Workflow**
3. **Data Gap Detection Workflow**
4. **Report Generation Workflow**

### 4. OCR & NLP Service (Port 8004)
**Responsabilités**:
- OCR multi-langue (français, arabe)
- Extraction entités médicales (NER)
- Normalisation terminologie médicale
- Classification type document

**API Endpoints**:
- `POST /api/v1/ocr/process` - OCR sur image/PDF
- `POST /api/v1/nlp/extract-entities` - Extraction NER
- `POST /api/v1/nlp/classify-document` - Classification

### 5. Payment Service (Port 8005)
**Responsabilités**:
- Intégration Konnect (payment gateway tunisien)
- Gestion transactions
- Facturation consultations
- Abonnements professionnels

### 6. Notification Service (Port 8006)
**Responsabilités**:
- WebSocket real-time
- Push notifications mobile
- Email (SendGrid/Mailgun)
- SMS (Twilio)

## Sécurité & Conformité

### HIPAA / GDPR Compliance

**1. Encryption at Rest**
- PostgreSQL: Transparent Data Encryption (TDE)
- S3: AES-256 encryption
- MongoDB: Encrypted storage engine

**2. Encryption in Transit**
- TLS 1.3 pour toutes communications
- Certificate pinning mobile apps

**3. Access Control**
- JWT avec expiration courte (15min access, 7d refresh)
- RBAC avec scopes granulaires
- Audit logs complets

**4. Data Privacy**
- Anonymization pour analytics
- Right to erasure (GDPR Article 17)
- Data portability (export JSON/PDF)
- Consent management

**5. Audit & Compliance**
- Tous accès aux dossiers médicaux loggés
- Retention policy configurable
- Compliance reports automatiques

### Sécurité API

```python
# Exemple middleware de sécurité
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # Vérifier JWT signature
    # Vérifier expiration
    # Vérifier scope RBAC
    # Log accès
    return decoded_payload
```

## Scalabilité

### Horizontal Scaling
- Services stateless (scale pods Kubernetes)
- Load balancing avec session affinity (sticky sessions)
- Database read replicas
- CDN pour assets statiques

### Caching Strategy
- Redis cache pour:
  - Sessions utilisateurs (TTL: 7 jours)
  - Résultats OCR récents (TTL: 24h)
  - Rapports IA (TTL: 1h)
  - Métadonnées documents (TTL: 6h)

### Queue Management
- Celery workers pour tâches asynchrones:
  - Priority queue: analyse IA urgente
  - Standard queue: analyses programmées
  - Low priority: cleanup, aggregation

## Monitoring & Observability

### Metrics (Prometheus)
- Request rate, latency, error rate (RED)
- Database connections, query time
- AI model inference time
- Storage usage

### Distributed Tracing (Jaeger)
- Trace complet upload → OCR → NLP → AI → rapport
- Performance bottleneck detection

### Alerting
- Slack/PagerDuty pour incidents
- Alertes:
  - API latency > 2s
  - Error rate > 5%
  - Database connections > 80%
  - Disk usage > 85%

## Disaster Recovery

### Backup Strategy
- PostgreSQL: WAL continuous archiving (PITR)
- MongoDB: Daily snapshots
- S3: Versioning + cross-region replication
- Redis: RDB + AOF persistence

### Recovery Time Objective (RTO)
- Critical services: < 15 minutes
- Data recovery: < 1 hour

### Recovery Point Objective (RPO)
- Database: < 5 minutes data loss
- Documents: 0 data loss (replication)

## Coûts Estimatifs (Production - 10,000 utilisateurs actifs)

### Infrastructure Cloud (AWS/Azure)
- Compute (EKS/AKS): 800 TND/mois
- Database (RDS PostgreSQL): 400 TND/mois
- Storage (S3): 150 TND/mois
- Cache (ElastiCache Redis): 200 TND/mois
- Load Balancer: 100 TND/mois

### AI Services
- OpenAI API (GPT-4): 600 TND/mois
- Azure OCR: 150 TND/mois
- Vector DB (Pinecone): 200 TND/mois

### Third-party
- SendGrid (emails): 50 TND/mois
- Twilio (SMS): 100 TND/mois
- Monitoring (Datadog): 300 TND/mois

**Total mensuel**: ~3,050 TND/mois (~$1,000 USD)

## Roadmap Technique

### Phase 1 (MVP - 3 mois)
- ✅ User authentication
- ✅ Document upload & storage
- ✅ Basic OCR processing
- ✅ Simple AI chat interface
- ✅ Patient dashboard

### Phase 2 (Production - 6 mois)
- 🚧 Autonomous AI agent (LangGraph)
- 🚧 Advanced NLP medical entity extraction
- 🚧 Automated report generation
- 🚧 DICOM viewer intégration
- 🚧 Payment integration (Konnect)

### Phase 3 (Scale - 12 mois)
- 📋 Mobile apps (React Native)
- 📋 Telemedicine video calls
- 📋 Multi-tenant pour cliniques
- 📋 BI dashboard pour médecins
- 📋 API publique pour partenaires

## Contact & Support

- **Architecture Lead**: architecture@laura.tn
- **DevOps**: devops@laura.tn
- **Security**: security@laura.tn
