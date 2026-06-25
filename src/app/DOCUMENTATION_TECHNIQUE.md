# 📘 Documentation Technique — Laura AI Platform

**Version** : 2.4  
**Dernière mise à jour** : 22 avril 2026  
**Mainteneur** : Équipe Laura AI  
**Repo** : github.com/laura-ai/platform

---

## 🏗️ Architecture Générale

### Stack Frontend (Production actuelle)

| Composant | Technologie | Version |
|---|---|---|
| Framework | React | 18.x |
| Langage | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.0 |
| Routing | React Router (Data Mode) | v7 |
| State | React Context API + useState | — |
| Icons | Lucide React | latest |
| PDF/Print | window.print() natif | — |
| Build | Vite + ESBuild | — |

### Stack Backend (À implémenter)

| Composant | Technologie recommandée |
|---|---|
| API | Python FastAPI ou Node.js (Express/Fastify) |
| Base de données | PostgreSQL 15+ |
| ORM | SQLAlchemy (Python) ou Prisma (Node) |
| Cache | Redis 7 |
| File Storage | AWS S3, MinIO ou OVH Object Storage |
| Auth | JWT HS256 + Refresh Token (HttpOnly Cookie) |
| Queue | Celery (Python) ou BullMQ (Node) — pour PACS async |
| DICOM | Orthanc (open-source PACS server) |
| IA | OpenAI GPT-4o Vision ou modèle custom fine-tuné |

---

## 📁 Structure du Projet Frontend

```
/src/
├── app/
│   ├── App.tsx                          # Point d'entrée — RouterProvider + Providers
│   ├── routes.tsx                       # createBrowserRouter (React Router Data Mode)
│   │
│   ├── context/                         # État global (React Context)
│   │   ├── AuthContext.tsx              # Session utilisateur (non persistante)
│   │   ├── PatientDocumentsContext.tsx  # Documents + dossiers patient
│   │   ├── SharedLinksContext.tsx       # Tokens de partage (folder/document/report)
│   │   ├── LabContext.tsx               # Infos cabinet radiologue
│   │   ├── PacsContext.tsx              # Serveurs PACS configurés
│   │   └── PlansContext.tsx             # Forfaits configurables
│   │
│   ├── layouts/
│   │   ├── PatientLayout.tsx            # Guard + sidebar patient
│   │   ├── RadiologistLayout.tsx        # Guard + sidebar radiologue
│   │   └── AdminLayout.tsx             # Guard admin + sidebar blanche + INITIAL_USERS
│   │
│   ├── pages/
│   │   ├── ApiDocumentation.tsx         # Documentation API interactive (/api-docs)
│   │   ├── SharedDocumentPage.tsx       # Page publique médecin (/shared/:token)
│   │   ├── NotFound.tsx                 # 404
│   │   ├── patient/
│   │   │   ├── PatientHome.tsx          # Dashboard patient
│   │   │   ├── PatientAccountPage.tsx   # Mon compte patient
│   │   │   ├── DocumentViewer.tsx       # Visionneuse document (/documents/:id)
│   │   │   └── FolderView.tsx           # Vue dossier (/documents/folder/:folderId)
│   │   ├── radiologist/
│   │   │   ├── RadiologistHome.tsx      # Dashboard radiologue
│   │   │   └── RadiologistAccountPage.tsx  # Profil + Cabinet + PACS
│   │   └── admin/
│   │       ├── AdminLogin.tsx           # /admin-login
│   │       ├── AdminOverview.tsx        # KPIs plateforme
│   │       ├── AdminUsers.tsx           # Gestion utilisateurs
│   │       ├── AdminPlans.tsx           # Offres & Quotas
│   │       ├── AdminStorage.tsx         # Usage stockage
│   │       └── AdminGdpr.tsx            # Conformité RGPD
│   │
│   ├── components/
│   │   ├── LandingPage.tsx              # Page d'accueil publique
│   │   ├── PricingPage.tsx              # Tarification
│   │   ├── AboutPage.tsx                # À propos
│   │   ├── auth/
│   │   │   ├── Login.tsx                # Connexion patient/radiologue
│   │   │   └── SignUp.tsx               # Inscription
│   │   ├── patient/
│   │   │   ├── ScanDocument.tsx         # Scanner IA + sauvegarde auto
│   │   │   ├── PatientDocuments.tsx     # Liste documents + dossiers
│   │   │   ├── DocumentContent.tsx      # Rendu contenu document
│   │   │   └── ShareModal.tsx           # Modal partage lien 7j
│   │   ├── radiologist/
│   │   │   ├── DicomFolderManager.tsx   # Gestionnaire dossiers DICOM principal
│   │   │   ├── DicomViewer.tsx          # Visionneuse DICOM
│   │   │   ├── ReportPreview.tsx        # Prévisualisation rapport PDF
│   │   │   └── PacsImportModal.tsx      # Workflow import PACS 3 étapes
│   │   └── figma/
│   │       └── ImageWithFallback.tsx    # Composant image sécurisé (protégé)
│   │
│   └── utils/
│       └── downloadUtils.ts             # Génération PDF (patient + radiologue)
│
└── styles/
    ├── theme.css                        # Variables CSS + tokens Tailwind v4
    └── fonts.css                        # Imports Google Fonts
```

---

## 🧠 Architecture des Contexts

### Hiérarchie des Providers (`App.tsx`)

```tsx
<AuthProvider>                      // Session utilisateur
  <PlansProvider>                   // Forfaits configurables
    <SharedLinksProvider>           // Tokens partage
      <PatientDocumentsProvider>    // Documents + dossiers patient
        <LabProvider>               // Cabinet radiologue
          <PacsProvider>            // Serveurs PACS
            <RouterProvider router={router} />
          </PacsProvider>
        </LabProvider>
      </PatientDocumentsProvider>
    </SharedLinksProvider>
  </PlansProvider>
</AuthProvider>
```

> ⚠️ `PatientDocumentsProvider` est centralisé dans `App.tsx` et NON dans `PatientLayout.tsx` pour éviter la réinitialisation des données lors de la navigation.

---

### AuthContext

**Fichier** : `context/AuthContext.tsx`

```typescript
export type UserRole = 'patient' | 'radiologist' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}
```

**Comportement** :
- État en mémoire uniquement (pas de localStorage)
- `login(role)` → charge un utilisateur demo depuis `DEMO_USERS`
- `logout()` → remet `user` à `null`
- `getDashboardPath(role)` → renvoie la route du dashboard correspondant

**Redirection après login** :
```typescript
patient     → /patient/home
radiologist → /radiologist/home
admin       → /admin/overview
```

---

### PatientDocumentsContext

**Fichier** : `context/PatientDocumentsContext.tsx`

```typescript
export interface MedicalDocument {
  id: string;
  name: string;
  type: 'ordonnance' | 'analyse' | 'imagerie' | 'rapport' | 'certificat' | 'autre';
  date: string;           // YYYY-MM-DD
  size: string;           // ex: "2.3 MB"
  doctor?: string;
  pathology?: string;
  notes?: string;
  aiAnalyzed?: boolean;
  fromScan?: boolean;
  folderId?: string;
  shareToken?: string;
  imageDataUrl?: string;  // base64 — image originale du scan
  reportContent?: string; // Rapport IA complet en texte structuré
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;       // YYYY-MM-DD
  documentIds: string[];
  shareToken?: string;
  sharedAt?: string;
}
```

**Méthodes exposées** :

| Méthode | Signature | Description |
|---|---|---|
| `addDocument` | `(doc: Omit<MedicalDocument, 'id'>) => string` | Ajoute et retourne l'id généré |
| `deleteDocument` | `(id: string) => void` | Supprime, détache du dossier |
| `createFolder` | `(folder: Pick<..., 'name'\|'description'>) => string` | Crée un dossier vide |
| `deleteFolder` | `(id: string) => void` | Supprime le dossier, détache les docs |
| `addDocumentsToFolder` | `(folderId: string, docIds: string[]) => void` | Ajoute docs au dossier |
| `removeDocumentFromFolder` | `(folderId: string, docId: string) => void` | Retire un doc du dossier |
| `generateShareLink` | `(type: 'folder'\|'document', id: string) => string` | Génère token 7j |
| `getExistingShareToken` | `(type, id) => string \| undefined` | Récupère token existant |

---

### SharedLinksContext

**Fichier** : `context/SharedLinksContext.tsx`

```typescript
export interface SharedLink {
  token: string;
  type: 'folder' | 'document' | 'report';
  label: string;
  createdAt: string;   // ISO
  expiresAt: string;   // ISO — +7j (patient) ou +30j (radiologue)
  folder?: SharedFolder;
  document?: MedicalDocument;
  report?: SharedReport;
}

export interface SharedReport {
  patientName: string;
  patientId: string;
  pathology: string;
  modality: string;
  content: string;
  finalizedAt: string;
  radiologistName: string;
  radiologistTitle: string;
  radiologistSpecialty: string;
  lab: LabInfo;        // En-tête cabinet complet
}
```

**Stockage** : `Record<string, SharedLink>` indexé par `token`.

---

### LabContext

**Fichier** : `context/LabContext.tsx`

```typescript
export interface LabInfo {
  name: string;         // Raison sociale
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  rpps: string;         // N° RPPS professionnel
  siret: string;        // N° SIRET entreprise
  logoDataUrl: string;  // base64 PNG/JPG, utilisé dans les rapports PDF
}

export interface RadiologistProfile {
  name: string;
  title: string;      // ex: "Médecin Radiologue"
  specialty: string;  // ex: "Imagerie médicale & IRM"
}
```

---

### PacsContext

**Fichier** : `context/PacsContext.tsx`

```typescript
export interface PacsServer {
  id: string;
  name: string;
  host: string;
  port: number;           // 104 par défaut
  aeTitle: string;        // AE Title du PACS distant
  callingAeTitle: string; // AE Title de Laura AI (défaut: "LAURA_AI")
  protocol: 'DICOM' | 'DICOMweb';
  webUrl: string;         // URL base DICOMweb si protocol = DICOMweb
  tls: boolean;
  active: boolean;
  lastConnected?: string; // ISO
  connectionStatus?: 'connected' | 'error' | 'unknown';
}
```

**Méthodes** : `addServer`, `updateServer`, `deleteServer`, `setStatus`

---

### PlansContext

**Fichier** : `context/PlansContext.tsx`

```typescript
export interface Plan {
  id: string;
  name: string;
  price: number;      // €/mois
  storageGB: number;  // -1 = illimité
  maxScans: number;   // -1 = illimité
  aiQuota: number;    // -1 = illimité
  features: string[];
  userCount: number;  // nb abonnés actuels
  active: boolean;
}
```

**Plans initiaux** : `free`, `starter`, `pro`, `radpro`, `enterprise`

---

## 🛣️ Routing (React Router Data Mode)

**Fichier** : `routes.tsx`  
**Pattern** : `createBrowserRouter` avec composants enfants imbriqués.

```typescript
// Structure complète des routes
createBrowserRouter([
  // Public
  { path: '/', Component: LandingRoute },
  { path: '/login', Component: LoginRoute },
  { path: '/signup', Component: SignUpRoute },
  { path: '/about', Component: AboutRoute },
  { path: '/pricing', Component: PricingRoute },
  { path: '/admin-login', Component: AdminLogin },
  { path: '/shared/:token', Component: SharedDocumentPage },
  { path: '/api-docs', Component: ApiDocumentation },

  // Patient (layout + guard)
  {
    path: '/patient',
    Component: PatientLayout,        // Guard: redirect → /login si non auth
    children: [
      { index: true, element: <Navigate to="/patient/home" /> },
      { path: 'home', Component: PatientHome },
      { path: 'scan', Component: ScanDocument },
      { path: 'documents', Component: PatientDocuments },
      { path: 'documents/folder/:folderId', Component: FolderView },
      { path: 'documents/:id', Component: DocumentViewer },
      { path: 'account', Component: PatientAccountPage },
    ],
  },

  // Radiologist (layout + guard)
  {
    path: '/radiologist',
    Component: RadiologistLayout,
    children: [
      { index: true, element: <Navigate to="/radiologist/home" /> },
      { path: 'home', Component: RadiologistHome },
      { path: 'folders', Component: DicomFolderManager },
      { path: 'account', Component: RadiologistAccountPage },
    ],
  },

  // Admin (layout + guard)
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, element: <Navigate to="/admin/overview" /> },
      { path: 'overview', Component: AdminOverview },
      { path: 'users', Component: AdminUsers },
      { path: 'plans', Component: AdminPlans },
      { path: 'storage', Component: AdminStorage },
      { path: 'gdpr', Component: AdminGdpr },
    ],
  },

  { path: '*', Component: NotFound },
]);
```

**Guards** : Chaque layout vérifie `user` depuis `useAuth()`.
- Pas de user → `<Navigate to="/login" replace />`
- Mauvais rôle → redirection appropriée

---

## 🤖 Moteur IA — Analyse de Documents

### Pipeline Frontend (ScanDocument.tsx)

```typescript
// 1. Upload + préparation
const fileToBase64 = (file: File): Promise<string>

// 2. Appel API analyse
POST /api/scan/analyze
Body: { fileBase64, mimeType, fileName, userId }

// 3. Sauvegarde automatique dans PatientDocumentsContext
addDocument({
  name:          result.suggestedName,
  type:          mapResultType(result.type),
  date:          new Date().toISOString().slice(0, 10),
  size:          formatFileSize(file.size),
  pathology:     result.suggestedPathology,
  aiAnalyzed:    true,
  fromScan:      true,
  imageDataUrl:  fileBase64,    // ← image originale
  reportContent: formatReport(result), // ← rapport structuré
})
```

### Structure AnalysisResult (interface frontend)

```typescript
interface AnalysisResult {
  type: 'scanner' | 'irm' | 'radiographie' | 'ordonnance' | 'analyse' | 'autre';
  examType?: string;
  anatomicalRegion?: string;
  confidence: number;          // 0–100
  suggestedName: string;
  suggestedPathology?: string;
  technicalDetails?: {
    modality: string;
    bodyPart: string;
    slices?: number;
    contrast?: boolean;
  };
  findings: Finding[];
  normalFindings?: string[];
  recommendations: Recommendation[];
  disclaimer: string;
}

interface Finding {
  severity: 'critical' | 'important' | 'moderate' | 'minor';
  category: string;
  title: string;
  description: string;
  location?: string;
  measurements?: { size?: string; dimension?: string; volume?: string };
  classification?: string;
  characteristics?: string[];
}

interface Recommendation {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timeframe?: string;
  action?: string;
}
```

---

## 📄 Génération PDF (downloadUtils.ts)

**Fichier** : `utils/downloadUtils.ts`

**Fonctions exportées** :

| Fonction | Usage |
|---|---|
| `downloadScanAsPdf(doc)` | Export PDF document scanné patient |
| `downloadDocumentAsPdf(doc)` | Export PDF document générique patient |
| `downloadReportAsPdf(data, lab, profile)` | Export PDF rapport radiologue avec en-tête cabinet |

**Technique** : `window.open() + document.write() + setTimeout(win.print, 450ms)`
- Format A4, marges 18mm/20mm
- Styles inline pour compatibilité maximale
- Le navigateur propose "Enregistrer en PDF"

**ReportData (pour rapports radiologue)** :
```typescript
interface ReportData {
  patientName: string;
  patientId: string;
  pathology: string;
  modality: string;
  content: string;
  reportStatus: string;
  finalizedAt?: string;
}
```

---

## 🏥 Module PACS (PacsImportModal.tsx)

### Workflow d'import 3 étapes

```
Étape 1 : Sélection serveur
    → usePacs() → servers[]
    → Affiche statut connexion de chaque serveur

Étape 2 : Query C-FIND
    → POST /api/radiologist/pacs/:id/query
    → Body: { patientName, patientId, studyDateFrom, studyDateTo, modality }
    → Résultat: PacsStudy[]

Étape 3 : Import C-MOVE
    → POST /api/radiologist/pacs/:id/retrieve
    → Body: { studyInstanceUID, targetFolderId }
    → Renvoie: { jobId } → polling GET /api/jobs/:jobId
    → À la complétion: nouveau dossier avec pacsImported: true
```

### Type PacsStudy

```typescript
interface PacsStudy {
  studyUID: string;
  patientName: string;
  patientId: string;
  patientBirthDate: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  modality: string;
  seriesCount: number;
  imagesCount: number;
  accessionNumber: string;
  referringPhysician: string;
  institutionName: string;
  bodyPart: string;
  status: 'available' | 'archived';
  hasReport: boolean;
  reportContent?: string;
}
```

---

## 🗄️ Schéma Base de Données PostgreSQL

```sql
-- ══════════════════════════════════════════════════════════
-- USERS & AUTH
-- ══════════════════════════════════════════════════════════

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'radiologist', 'admin')),
    name            VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500),
    country         VARCHAR(10) DEFAULT 'FR',  -- FR | TN | INTL
    plan_id         VARCHAR(50) DEFAULT 'free' REFERENCES plans(id),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    last_active_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- PLANS & STORAGE
-- ══════════════════════════════════════════════════════════

CREATE TABLE plans (
    id          VARCHAR(50) PRIMARY KEY,  -- free | starter | pro | radpro | enterprise
    name        VARCHAR(100) NOT NULL,
    price       DECIMAL(10,2) DEFAULT 0,
    storage_gb  INTEGER DEFAULT 1,        -- -1 = illimité
    max_scans   INTEGER DEFAULT 5,        -- -1 = illimité
    ai_quota    INTEGER DEFAULT 5,        -- -1 = illimité
    features    TEXT[],
    active      BOOLEAN DEFAULT true,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE storage_usage (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    used_gb     DECIMAL(10,3) DEFAULT 0,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scan_usage (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    month       DATE NOT NULL,            -- Premier jour du mois
    scans_used  INTEGER DEFAULT 0,
    ai_used     INTEGER DEFAULT 0,
    UNIQUE(user_id, month)
);

-- ══════════════════════════════════════════════════════════
-- PATIENT DOCUMENTS
-- ══════════════════════════════════════════════════════════

CREATE TABLE medical_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN ('ordonnance','analyse','imagerie','rapport','certificat','autre')),
    date            DATE NOT NULL,
    size            VARCHAR(20),               -- ex: "2.3 MB" (string formaté)
    size_bytes      BIGINT,
    doctor          VARCHAR(255),
    pathology       VARCHAR(500),
    notes           TEXT,
    ai_analyzed     BOOLEAN DEFAULT false,
    from_scan       BOOLEAN DEFAULT false,
    folder_id       UUID REFERENCES document_folders(id) ON DELETE SET NULL,
    share_token     VARCHAR(50),
    file_url        VARCHAR(1000),             -- URL S3/MinIO du fichier
    image_data_url  TEXT,                      -- base64 image scannée (migrer vers S3)
    report_content  TEXT,                      -- Rapport IA structuré
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    share_token     VARCHAR(50),
    shared_at       TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- SHARED LINKS
-- ══════════════════════════════════════════════════════════

CREATE TABLE shared_links (
    token           VARCHAR(50) PRIMARY KEY,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('folder', 'document', 'report')),
    label           VARCHAR(255),
    created_by      UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id     UUID REFERENCES medical_documents(id) ON DELETE CASCADE,
    folder_id       UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    dicom_folder_id UUID REFERENCES dicom_folders(id) ON DELETE CASCADE,
    report_data     JSONB,                     -- SharedReport sérialisé
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- RADIOLOGIST — CABINET
-- ══════════════════════════════════════════════════════════

CREATE TABLE lab_info (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255),
    address     TEXT,
    postal_code VARCHAR(20),
    city        VARCHAR(100),
    country     VARCHAR(100),
    phone       VARCHAR(50),
    email       VARCHAR(255),
    website     VARCHAR(255),
    rpps        VARCHAR(50),
    siret       VARCHAR(50),
    logo_url    VARCHAR(1000),           -- URL S3 du logo
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- RADIOLOGIST — DOSSIERS DICOM
-- ══════════════════════════════════════════════════════════

CREATE TABLE dicom_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    radiologist_id  UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_name    VARCHAR(255) NOT NULL,
    patient_id      VARCHAR(50),              -- ex: PAT-2026-001
    pathology       VARCHAR(500),
    modality        VARCHAR(50),              -- IRM | Scanner/TDM | Radiographie...
    report_content  TEXT,
    report_status   VARCHAR(20) DEFAULT 'none' CHECK (report_status IN ('none','generating','ai_generated','in_review','finalized')),
    share_token     VARCHAR(50),
    pacs_imported   BOOLEAN DEFAULT false,
    pacs_study_uid  VARCHAR(200),
    finalized_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dicom_files (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id   UUID REFERENCES dicom_folders(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    size_bytes  BIGINT,
    modality    VARCHAR(20),               -- DICOM tag: MR, CT, CR, US, PT, MG
    file_url    VARCHAR(1000),
    upload_date TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- PACS SERVERS
-- ══════════════════════════════════════════════════════════

CREATE TABLE pacs_servers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    radiologist_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    host                VARCHAR(255) NOT NULL,
    port                INTEGER DEFAULT 104,
    ae_title            VARCHAR(50) NOT NULL,
    calling_ae_title    VARCHAR(50) DEFAULT 'LAURA_AI',
    protocol            VARCHAR(20) DEFAULT 'DICOM' CHECK (protocol IN ('DICOM', 'DICOMweb')),
    web_url             VARCHAR(500),
    tls                 BOOLEAN DEFAULT false,
    active              BOOLEAN DEFAULT true,
    connection_status   VARCHAR(20) DEFAULT 'unknown',
    last_connected      TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- JOBS ASYNCHRONES (PACS retrieve, IA analysis, export)
-- ══════════════════════════════════════════════════════════

CREATE TABLE async_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL,  -- pacs_retrieve | ai_analysis | export
    status          VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','failed')),
    progress        INTEGER DEFAULT 0,     -- 0-100
    user_id         UUID REFERENCES users(id),
    input_data      JSONB,
    result_data     JSONB,
    error_message   TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);

-- ══════════════════════════════════════════════════════════
-- RGPD
-- ══════════════════════════════════════════════════════════

CREATE TABLE gdpr_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name   VARCHAR(255),
    type        VARCHAR(100) NOT NULL,  -- Accès données | Suppression | Portabilité...
    status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════

CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_plan       ON users(plan_id);
CREATE INDEX idx_docs_user        ON medical_documents(user_id);
CREATE INDEX idx_docs_folder      ON medical_documents(folder_id);
CREATE INDEX idx_docs_date        ON medical_documents(date DESC);
CREATE INDEX idx_docs_type        ON medical_documents(type);
CREATE INDEX idx_docs_from_scan   ON medical_documents(from_scan) WHERE from_scan = true;
CREATE INDEX idx_folders_user     ON document_folders(user_id);
CREATE INDEX idx_shared_token     ON shared_links(token);
CREATE INDEX idx_shared_expires   ON shared_links(expires_at);
CREATE INDEX idx_dicom_rad        ON dicom_folders(radiologist_id);
CREATE INDEX idx_dicom_status     ON dicom_folders(report_status);
CREATE INDEX idx_pacs_rad         ON pacs_servers(radiologist_id);
CREATE INDEX idx_jobs_status      ON async_jobs(status);
CREATE INDEX idx_jobs_user        ON async_jobs(user_id);
CREATE INDEX idx_scan_usage_month ON scan_usage(user_id, month);
```

---

## 🔐 Sécurité & Authentification

### Stratégie JWT

```typescript
// Access token : JWT HS256, durée 24h
// Refresh token : rotation, stocké en cookie HttpOnly Secure SameSite=Strict
// Durée refresh token : 30 jours

// Headers requis pour routes protégées
Authorization: Bearer <access_token>

// Réponse login
{
  "token":        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt":    "2026-04-23T14:00:00Z",
  "user": { "id", "name", "email", "role", "plan" }
  // refresh_token → Set-Cookie: rt=...; HttpOnly; Secure; SameSite=Strict
}
```

### Chiffrement

| Niveau | Technologie |
|---|---|
| Transport | TLS 1.3 (HTTPS obligatoire) |
| Mots de passe | bcrypt (cost factor 12) |
| Données en base | AES-256-GCM (données sensibles) |
| Fichiers S3 | Chiffrement côté serveur SSE-S3 |
| Tokens | HMAC-SHA256 |

### Headers de Sécurité HTTP

```
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Règles d'Autorisation par Route

```
POST /api/auth/*                → Public
GET  /api/shared/:token         → Public (vérification expiration)
POST /api/scan/analyze          → Public ou Auth (userId optionnel)
GET  /api/scan/quota            → Auth (any)

/api/patient/*                  → JWT avec role = 'patient'
/api/radiologist/*              → JWT avec role = 'radiologist'
/api/admin/*                    → JWT avec role = 'admin'

/api/gdpr/request               → JWT (any role)
/api/jobs/:id                   → JWT (owner ou admin)
```

---

## 📦 Déploiement

### Docker Compose (Production)

```yaml
version: '3.9'

services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - VITE_API_URL=https://api.laura-ai.fr/v1
    depends_on: [api]

  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://laura:${DB_PASS}@db:5432/laura_ai
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - S3_BUCKET=${S3_BUCKET}
      - S3_ENDPOINT=${S3_ENDPOINT}
      - OPENAI_API_KEY=${OPENAI_KEY}
    depends_on: [db, redis]

  db:
    image: postgres:15-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: laura_ai
      POSTGRES_USER: laura
      POSTGRES_PASSWORD: ${DB_PASS}

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]

  worker:
    build: ./backend
    command: celery -A app.worker worker -Q pacs,ai,export
    depends_on: [redis, db]

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on: [frontend, api]

volumes:
  postgres_data:
  redis_data:
```

### Variables d'Environnement

```bash
# .env.production

# Database
DATABASE_URL=postgresql://laura:STRONGPASSWORD@db:5432/laura_ai

# Auth
JWT_SECRET=your-256-bit-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24
REFRESH_TOKEN_EXPIRY_DAYS=30

# CORS
CORS_ORIGINS=https://laura-ai.fr,https://www.laura-ai.fr

# Object Storage (S3 compatible)
S3_BUCKET=laura-ai-medical
S3_ENDPOINT=https://s3.eu-west-3.amazonaws.com   # ou MinIO
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=eu-west-3

# AI Analysis
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o                # ou modèle custom fine-tuné

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-key
EMAIL_FROM=noreply@laura-ai.fr

# Redis
REDIS_URL=redis://redis:6379/0

# Hébergement HDS (certificat)
HDS_PROVIDER=OVH                   # ou AWS Paris, Outscale, Scaleway
HDS_REGION=eu-west-par             # eu-west-3 si AWS

# Feature flags
ENABLE_PACS_INTEGRATION=true
ENABLE_AI_SCAN=true
MAX_UPLOAD_MB=50
```

---

## 🔌 Vue d'Ensemble API (résumé)

> Documentation interactive complète : `/api-docs`

```
── AUTH ──────────────────────────────────────────
POST   /api/auth/login                # Connexion patient/radiologue
POST   /api/auth/admin/login          # Connexion admin (route dédiée)
POST   /api/auth/register             # Inscription
POST   /api/auth/logout               # Déconnexion
GET    /api/auth/me                   # Profil + usage quota
POST   /api/auth/refresh              # Rotation refresh token
POST   /api/auth/forgot-password      # Mot de passe oublié

── SCAN IA ───────────────────────────────────────
POST   /api/scan/analyze              # Analyse image médicale (public ou auth)
GET    /api/scan/quota                # Quota IA restant

── PATIENT DOCUMENTS ─────────────────────────────
GET    /api/patient/documents         # Liste avec filtres
POST   /api/patient/documents         # Ajouter document
GET    /api/patient/documents/:id     # Détail (avec imageDataUrl + reportContent)
DELETE /api/patient/documents/:id     # Supprimer

── PATIENT DOSSIERS ──────────────────────────────
GET    /api/patient/folders           # Liste dossiers
POST   /api/patient/folders           # Créer dossier
PUT    /api/patient/folders/:id/documents  # Ajouter docs au dossier
DELETE /api/patient/folders/:id       # Supprimer dossier

── PARTAGE ───────────────────────────────────────
POST   /api/patient/documents/:id/share   # Générer lien 7j
POST   /api/patient/folders/:id/share     # Générer lien 7j
GET    /api/shared/:token             # Accès public (page médecin)
DELETE /api/shared/:token             # Révoquer lien

── RADIOLOGUE DICOM ──────────────────────────────
GET    /api/radiologist/folders                        # Liste dossiers
POST   /api/radiologist/folders                        # Créer dossier
POST   /api/radiologist/folders/:id/files              # Upload DICOM
POST   /api/radiologist/folders/:id/report/generate    # Générer rapport IA
PUT    /api/radiologist/folders/:id/report             # Sauvegarder rapport
POST   /api/radiologist/folders/:id/share              # Partage patient/médecin 30j
DELETE /api/radiologist/folders/:id/files/:fileId      # Supprimer fichier DICOM
DELETE /api/radiologist/folders/:id                    # Supprimer dossier

── PACS ──────────────────────────────────────────
GET    /api/radiologist/pacs          # Liste serveurs
POST   /api/radiologist/pacs          # Ajouter serveur
POST   /api/radiologist/pacs/:id/test     # C-ECHO test connexion
POST   /api/radiologist/pacs/:id/query    # C-FIND recherche études
POST   /api/radiologist/pacs/:id/retrieve # C-MOVE import → jobId
DELETE /api/radiologist/pacs/:id          # Supprimer serveur

── CABINET RADIOLOGUE ────────────────────────────
GET    /api/radiologist/lab           # Infos cabinet + profil
PUT    /api/radiologist/lab           # Mettre à jour cabinet + logo
PUT    /api/radiologist/profile       # Mettre à jour profil

── ADMIN ─────────────────────────────────────────
GET    /api/admin/stats               # KPIs globaux
GET    /api/admin/users               # Liste utilisateurs (avec filtres)
PATCH  /api/admin/users/:id/status    # Activer / suspendre
PATCH  /api/admin/users/:id/plan      # Changer forfait
DELETE /api/admin/users/:id           # Suppression RGPD
GET    /api/admin/plans               # Liste forfaits
PUT    /api/admin/plans/:id           # Modifier forfait
GET    /api/admin/storage             # Rapport stockage

── RGPD ──────────────────────────────────────────
GET    /api/admin/gdpr/requests       # Demandes RGPD
PATCH  /api/admin/gdpr/requests/:id   # Mettre à jour statut
POST   /api/gdpr/request              # Soumettre demande (user)
GET    /api/admin/gdpr/export/:userId # Export portabilité
GET    /api/admin/gdpr/compliance     # État conformité

── JOBS ASYNCHRONES ──────────────────────────────
GET    /api/jobs/:jobId               # Statut job (polling)
```

---

## 🧪 Tests Recommandés

### Tests Unitaires Frontend
```bash
# Vitest
pnpm test

# Coverage
pnpm test:coverage
```

**Priorités de test** :
- Logique `PatientDocumentsContext` (add/delete/folder/share)
- `generateShareLink` — vérifier token unique + expiration 7j
- `PlansContext` — quotas `-1` interprétés comme illimité
- `PacsContext` — setStatus + lastConnected update

### Tests E2E
```bash
# Playwright
pnpm e2e
```

**Scénarios critiques** :
1. Scan IA anonyme → affichage résultat → pas de sauvegarde
2. Scan IA connecté → résultat + document sauvegardé avec imageDataUrl
3. Partage dossier → lien copié → page /shared/:token affiche le dossier
4. Radiologue : créer dossier → générer rapport IA → finaliser → export PDF
5. Import PACS : sélectionner serveur → rechercher étude → importer → badge PACS visible
6. Admin : suspendre utilisateur → statut mis à jour dans la liste

### Tests Backend Recommandés
```bash
# Python (pytest)
pytest tests/ -v --cov=app

# Node.js (Jest/Vitest)
pnpm test:api
```

**Cas critiques backend** :
- Validation quota avant chaque scan (reject si `scans_used >= max_scans`)
- Expiration des liens partagés (retourner 404 si `expires_at < now()`)
- Isolation des données (user ne peut accéder qu'à ses propres documents)
- Vérification rôle avant chaque route protégée

---

## 📊 Monitoring & Observabilité

### Métriques à surveiller

| Métrique | Seuil d'alerte |
|---|---|
| Temps de réponse API scan IA | > 5s |
| Taux d'erreur API | > 1% |
| Usage CPU worker IA | > 80% |
| Espace S3 utilisé | > 80% quota |
| Jobs PACS en attente | > 10 |
| Tokens refresh expirés non renouvelés | > 100 |

### Stack Recommandée
- **Logs** : Loki + Grafana ou Datadog
- **Traces** : OpenTelemetry
- **APM** : Sentry (frontend + backend)
- **Uptime** : Better Uptime ou UptimeRobot

---

## ⚠️ Points d'Attention Critiques

### 1. Stockage imageDataUrl en base64
Les champs `imageDataUrl` dans `MedicalDocument` stockent actuellement l'image en base64 dans le context React (mémoire). En production, **migrer vers S3** : stocker l'URL S3 dans `file_url`, le base64 en base de données uniquement pour rétrocompatibilité.

### 2. Session non persistante
Comportement intentionnel du frontend. Le backend DOIT implémenter les refresh tokens via **cookies HttpOnly** (pas localStorage) pour la persistance de session. Chaque appel API doit inclure l'access token dans le header `Authorization`.

### 3. Opérations PACS asynchrones
Le C-MOVE est une opération longue. Retourner immédiatement un `jobId`, puis utiliser un **WebSocket ou SSE** pour pousser les mises à jour de progression. Le polling toutes les 2s est le fallback frontend actuel.

### 4. Quota `-1` = illimité
La valeur `maxScans = -1` signifie illimité. Le backend DOIT gérer ce cas : ne pas incrémenter / ne pas bloquer si `max_scans = -1`. Stocker `NULL` en base de données pour plus de clarté.

### 5. Conformité RGPD Art. 9
Les données de santé sont des données sensibles (catégorie spéciale). Obligations :
- Consentement explicite à l'inscription
- Base légale documentée
- Registre des traitements tenu
- Hébergement HDS obligatoire en France
- DPO désigné
- PIA (Privacy Impact Assessment) à réaliser

### 6. Disclaimer IA obligatoire
Chaque résultat d'analyse IA DOIT inclure le champ `disclaimer` : *"Cette analyse est générée par IA et ne remplace pas l'avis d'un médecin diplômé."* — Obligation légale (Art. 22 RGPD + réglementation dispositifs médicaux IA).

---

**Documentation fonctionnelle** : voir `DOCUMENTATION_FONCTIONNELLE.md`  
**Documentation API interactive** : `/api-docs`  
**Version** : 2.4 — 22 avril 2026
