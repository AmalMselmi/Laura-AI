# 📘 Documentation Technique - Laura AI

## 🏗️ Architecture Générale

### Vue d'ensemble
Laura AI est une plateforme de santé numérique **mobile-first** disponible sur :
- ✅ **Web** : Application web responsive (React + TypeScript + Tailwind CSS)
- ✅ **iOS** : Application native en production
- ✅ **Android** : Application native en production

### Stack Technique

#### Frontend Web
```typescript
- Framework: React 18.x avec TypeScript
- Styling: Tailwind CSS v4.0
- Build Tool: Vite
- State Management: React Hooks (useState, useEffect)
- Routing: React Router (à implémenter)
- Icons: Lucide React
- HTTP Client: Fetch API / Axios (à configurer)
```

#### Backend (À intégrer)
```
- API: Node.js + Express / Python FastAPI
- Base de données: PostgreSQL (données structurées)
- Storage: AWS S3 / Azure Blob (stockage documents)
- IA/ML: 
  * Modèle OCR médical personnalisé
  * GPT-4 / Claude pour analyse documents
  * Deep Learning pour imagerie DICOM
- Queue: Redis / RabbitMQ (traitement asynchrone)
- Cache: Redis
```

#### Mobile (Production)
```
iOS:
- Swift / SwiftUI
- Minimum iOS 14.0+
- App Store: Production

Android:
- Kotlin / Jetpack Compose
- Minimum Android 8.0 (API 26)+
- Google Play: Production
```

---

## 🗂️ Structure du Projet Web

```
laura-ai/
├── src/
│   ├── App.tsx                          # Point d'entrée principal
│   ├── components/
│   │   ├── LandingPage.tsx             # Page d'accueil publique
│   │   ├── AboutPage.tsx               # Page à propos
│   │   ├── PricingPage.tsx             # Page forfaits
│   │   ├── PatientDashboard.tsx        # Dashboard patient
│   │   ├── RadiologistDashboard.tsx    # Dashboard radiologue
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.tsx               # Authentification
│   │   │   └── SignUp.tsx              # Inscription
│   │   │
│   │   ├── patient/
│   │   │   ├── ScanDocument.tsx        # Scan IA de documents
│   │   │   ├── MedicalAIChat.tsx       # Chat IA médical
│   │   │   ├── MyDocuments.tsx         # Gestion documents
│   │   │   └── InsuranceReimbursement.tsx  # Assurance & remboursements
│   │   │
│   │   └── radiologist/
│   │       └── DicomViewer.tsx         # Visualiseur DICOM 3 vues
│   │
│   ├── styles/
│   │   └── globals.css                 # Styles globaux Tailwind
│   │
│   ├── types/
│   │   └── index.ts                    # Types TypeScript
│   │
│   └── utils/
│       ├── api.ts                      # Fonctions API
│       ├── dicom.ts                    # Utilitaires DICOM
│       └── storage.ts                  # LocalStorage / IndexedDB
│
├── public/
│   ├── imports/                        # Assets importés
│   └── figma:asset/                    # Images Figma
│
├── docs/
│   ├── TECHNICAL_DOCUMENTATION.md      # Ce fichier
│   └── FUNCTIONAL_DOCUMENTATION.md     # Documentation fonctionnelle
│
└── package.json
```

---

## 🔐 Sécurité et Conformité

### Cryptage des Données
```typescript
// Exemple de cryptage end-to-end
import CryptoJS from 'crypto-js';

class EncryptionService {
  private static SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

  static encryptData(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      this.SECRET_KEY
    ).toString();
  }

  static decryptData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
```

### Authentification JWT
```typescript
interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

class AuthService {
  static async login(email: string, password: string): Promise<AuthToken> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Authentication failed');
    return await response.json();
  }
  
  static setToken(token: AuthToken): void {
    localStorage.setItem('access_token', token.access_token);
    localStorage.setItem('refresh_token', token.refresh_token);
  }
  
  static getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
```

### Conformité RGPD
- ✅ Consentement explicite utilisateur
- ✅ Droit à l'oubli (suppression compte)
- ✅ Portabilité des données (export JSON/PDF)
- ✅ Hébergement certifié HDS (Hébergement Données de Santé)
- ✅ Logs d'accès et audit trail

---

## 🤖 Intégration IA

### 1. Analyse de Documents Médicaux

```typescript
interface DocumentAnalysisRequest {
  document_id: string;
  document_type: 'pdf' | 'image';
  file_url: string;
  patient_id: string;
}

interface AnalysisResult {
  type: string;
  confidence: number;
  examType: string;
  anatomicalRegion: string;
  findings: Finding[];
  normalFindings: string[];
  recommendations: Recommendation[];
  raw_text?: string;
}

class AIAnalysisService {
  static async analyzeDocument(
    file: File
  ): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/v1/ai/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: formData
    });
    
    return await response.json();
  }
}
```

### 2. Chat IA Médical

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  medical_context?: {
    relevant_documents: string[];
    patient_history: boolean;
  };
}

class MedicalChatService {
  static async sendMessage(
    message: string, 
    conversationId: string
  ): Promise<ChatMessage> {
    const response = await fetch('/api/v1/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        include_medical_history: true
      })
    });
    
    return await response.json();
  }
}
```

---

## 🩻 Visualiseur DICOM

### Architecture DICOM

```typescript
interface DicomStudy {
  studyInstanceUID: string;
  patientName: string;
  patientID: string;
  studyDate: string;
  modality: string;
  description: string;
  series: DicomSeries[];
}

interface DicomSeries {
  seriesInstanceUID: string;
  seriesNumber: number;
  modality: string;
  images: DicomImage[];
}

interface DicomImage {
  sopInstanceUID: string;
  instanceNumber: number;
  imageUrl: string;
  windowCenter: number;
  windowWidth: number;
}

class DicomService {
  // Chargement étude DICOM
  static async loadStudy(studyUID: string): Promise<DicomStudy> {
    const response = await fetch(`/api/v1/dicom/study/${studyUID}`, {
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    return await response.json();
  }
  
  // Upload fichiers DICOM
  static async uploadDicomFiles(files: File[]): Promise<string> {
    const formData = new FormData();
    files.forEach(file => formData.append('dicom_files', file));
    
    const response = await fetch('/api/v1/dicom/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: formData
    });
    
    const data = await response.json();
    return data.study_uid;
  }
  
  // Connexion PACS
  static async connectToPACS(
    aeTitle: string, 
    host: string, 
    port: number
  ): Promise<void> {
    await fetch('/api/v1/dicom/pacs/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify({ aeTitle, host, port })
    });
  }
}
```

### Outils de Mesure DICOM

```typescript
interface Measurement {
  type: 'distance' | 'angle' | 'roi';
  value: number;
  unit: string;
  points: Point[];
}

interface Point {
  x: number;
  y: number;
}

class DicomToolsService {
  static calculateDistance(p1: Point, p2: Point, pixelSpacing: number): number {
    const dx = (p2.x - p1.x) * pixelSpacing;
    const dy = (p2.y - p1.y) * pixelSpacing;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  static calculateAngle(p1: Point, vertex: Point, p3: Point): number {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p3.y - vertex.y, p3.x - vertex.x);
    return Math.abs(angle1 - angle2) * (180 / Math.PI);
  }
}
```

---

## 💳 Système de Remboursement

### Gestion des Cartes d'Assurance

```typescript
interface InsuranceCard {
  id: string;
  type: 'securite_sociale' | 'mutuelle' | 'private';
  provider: string;
  number: string;
  coverage_percentage: number;
  valid_until: Date;
  card_image_front?: string;
  card_image_back?: string;
}

interface ReimbursementClaim {
  id: string;
  patient_id: string;
  care_date: Date;
  care_type: string;
  amount: number;
  insurance_cards: string[];
  documents: Document[];
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  reimbursed_amount?: number;
  rejection_reason?: string;
}

class InsuranceService {
  static async addInsuranceCard(card: Omit<InsuranceCard, 'id'>): Promise<InsuranceCard> {
    const response = await fetch('/api/v1/insurance/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify(card)
    });
    return await response.json();
  }
  
  static async submitClaim(claim: Omit<ReimbursementClaim, 'id' | 'status'>): Promise<ReimbursementClaim> {
    const response = await fetch('/api/v1/insurance/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify(claim)
    });
    return await response.json();
  }
  
  static async getClaimStatus(claimId: string): Promise<ReimbursementClaim> {
    const response = await fetch(`/api/v1/insurance/claims/${claimId}`, {
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    return await response.json();
  }
}
```

---

## 📱 API Mobile (iOS/Android)

### Endpoints Principaux

```
BASE_URL: https://api.laura-ai.health/v1

# Authentification
POST   /auth/login                 # Connexion
POST   /auth/register              # Inscription
POST   /auth/refresh               # Refresh token
POST   /auth/logout                # Déconnexion

# Patient
GET    /patient/profile            # Profil patient
PUT    /patient/profile            # Mise à jour profil
GET    /patient/documents          # Liste documents
POST   /patient/documents          # Upload document
DELETE /patient/documents/:id      # Supprimer document

# Analyse IA
POST   /ai/analyze                 # Analyser document
POST   /ai/chat                    # Chat médical
GET    /ai/history                 # Historique analyses

# DICOM (Radiologues)
GET    /dicom/studies              # Liste études
POST   /dicom/upload               # Upload DICOM
GET    /dicom/study/:uid           # Détails étude
GET    /dicom/series/:uid          # Images série
POST   /dicom/pacs/connect         # Connexion PACS

# Assurance
GET    /insurance/cards            # Cartes d'assurance
POST   /insurance/cards            # Ajouter carte
GET    /insurance/claims           # Demandes remboursement
POST   /insurance/claims           # Nouvelle demande
GET    /insurance/claims/:id       # Statut demande

# Notifications
GET    /notifications              # Liste notifications
PUT    /notifications/:id/read     # Marquer comme lu
```

### Authentification Mobile

```swift
// iOS - Swift
import Foundation

class APIClient {
    static let shared = APIClient()
    private let baseURL = "https://api.laura-ai.health/v1"
    
    func login(email: String, password: String) async throws -> AuthToken {
        let url = URL(string: "\(baseURL)/auth/login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(AuthToken.self, from: data)
    }
}
```

```kotlin
// Android - Kotlin
import retrofit2.http.*

interface LauraAIApi {
    @POST("auth/login")
    suspend fun login(@Body credentials: LoginRequest): AuthToken
    
    @GET("patient/documents")
    suspend fun getDocuments(
        @Header("Authorization") token: String
    ): List<Document>
    
    @Multipart
    @POST("ai/analyze")
    suspend fun analyzeDocument(
        @Header("Authorization") token: String,
        @Part file: MultipartBody.Part
    ): AnalysisResult
}
```

---

## 🚀 Déploiement

### Web (Production)
```bash
# Build
npm run build

# Variables d'environnement
REACT_APP_API_URL=https://api.laura-ai.health
REACT_APP_ENCRYPTION_KEY=***
REACT_APP_SENTRY_DSN=***

# Hébergement: Vercel / Netlify / AWS Amplify
vercel --prod
```

### Mobile iOS
```bash
# Prérequis
- Xcode 15+
- Apple Developer Account
- Provisioning Profiles

# Build
xcodebuild -workspace LauraAI.xcworkspace \
           -scheme LauraAI \
           -configuration Release \
           -archivePath LauraAI.xcarchive \
           archive

# Upload App Store
xcodebuild -exportArchive \
           -archivePath LauraAI.xcarchive \
           -exportOptionsPlist ExportOptions.plist \
           -exportPath ./build
```

### Mobile Android
```bash
# Build Release
./gradlew assembleRelease

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA \
          -digestalg SHA-256 \
          -keystore lauraai.keystore \
          app-release-unsigned.apk lauraai

# Upload Google Play
fastlane supply --apk app-release.apk
```

---

## 🧪 Tests

### Tests Unitaires
```typescript
// Example: ScanDocument.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanDocument } from './ScanDocument';

describe('ScanDocument', () => {
  test('uploads file and shows analysis', async () => {
    render(<ScanDocument />);
    
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    // Wait for analysis
    const result = await screen.findByText(/Analyse terminée/i);
    expect(result).toBeInTheDocument();
  });
});
```

### Tests E2E (Cypress)
```typescript
// cypress/e2e/patient-flow.cy.ts
describe('Patient Flow', () => {
  it('should register, login, and scan document', () => {
    cy.visit('/');
    cy.contains('Commencer').click();
    
    // Fill registration
    cy.get('input[name="email"]').type('patient@test.com');
    cy.get('input[name="password"]').type('Test123!');
    cy.get('button[type="submit"]').click();
    
    // Upload document
    cy.get('input[type="file"]').attachFile('test-scan.pdf');
    cy.contains('Analyse en cours').should('be.visible');
    cy.contains('Résultats Détaillés', { timeout: 10000 }).should('be.visible');
  });
});
```

---

## 📊 Monitoring et Analytics

### Sentry (Error Tracking)
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Google Analytics
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

// Track page views
ReactGA.send({ hitType: "pageview", page: window.location.pathname });

// Track events
ReactGA.event({
  category: 'Document',
  action: 'Scan',
  label: 'PDF'
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy Laura AI

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📞 Support Technique

**Email** : dev@laura-ai.health  
**Discord** : https://discord.gg/laura-ai  
**Documentation** : https://docs.laura-ai.health

---

**Version** : 1.0.0  
**Dernière mise à jour** : 3 février 2026  
**Auteur** : Équipe Technique Laura AI
