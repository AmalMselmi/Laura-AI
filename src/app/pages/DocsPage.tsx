import { useState } from 'react';
import { BookOpen, Code2, ExternalLink, ChevronRight, FileText, Shield, Server, Database, Users, Zap, Settings, Map } from 'lucide-react';
import { LauraLogoMark } from '../components/brand/LauraLogoMark';

// ── Section composants ────────────────────────────────────────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold text-gray-900 mb-1 mt-0">{children}</h1>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-200">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-gray-800 mt-5 mb-2">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 text-sm leading-relaxed mb-3">{children}</p>;
}
function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
}
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    green:  'bg-green-100 text-green-800',
    blue:   'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red:    'bg-red-100 text-red-800',
    gray:   'bg-gray-100 text-gray-700',
    teal:   'bg-teal-100 text-teal-800',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

function InfoBox({ type, children }: { type: 'info' | 'warning' | 'success'; children: React.ReactNode }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm leading-relaxed mb-4 ${styles[type]}`}>
      {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left font-semibold text-gray-700 border border-gray-200 text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border border-gray-200 text-gray-700 text-xs align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Documentation Fonctionnelle ───────────────────────────────────────────────

function FunctionalDoc() {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-2 mb-1 opacity-80 text-sm">
          <BookOpen className="w-4 h-4" /> Documentation Fonctionnelle
        </div>
        <H1>Laura AI — Carnet de Santé Numérique Intelligent</H1>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge color="green">v2.4</Badge>
          <span className="text-white/70 text-xs">Avril 2026</span>
          <span className="text-white/70 text-xs">·</span>
          <span className="text-white/70 text-xs">contact@laura-ai.fr</span>
        </div>
      </div>

      {/* Utilisateurs */}
      <H2>🎯 Vue d'Ensemble</H2>
      <P>Laura AI est une plateforme HealthTech internationale qui centralise le carnet de santé numérique des patients, facilite la gestion des dossiers DICOM pour les radiologues, et intègre un moteur d'analyse IA des documents médicaux.</P>

      <Table
        headers={['Rôle', 'Description', 'Route de base']}
        rows={[
          ['Patient', 'Citoyen gérant son dossier de santé', <Code>/patient/*</Code>],
          ['Radiologue', 'Médecin gérant dossiers DICOM', <Code>/radiologist/*</Code>],
          ['Super Admin', 'Administrateur plateforme', <Code>/admin/*</Code>],
        ]}
      />

      <H3>Pays supportés</H3>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Badge color="blue">🇫🇷 France — Hébergement HDS</Badge>
        <Badge color="teal">🇹🇳 Tunisie</Badge>
        <Badge color="gray">🌐 International</Badge>
      </div>

      {/* Pages Publiques */}
      <H2>🏠 Pages Publiques</H2>
      <H3>Landing Page (<Code>/</Code>)</H3>
      <P>Page d'accueil avec scan IA public (sans compte), présentation des fonctionnalités, tarification, navigation vers inscription/connexion.</P>

      <H3>Connexion / Inscription (<Code>/login</Code>, <Code>/signup</Code>)</H3>
      <P>Espace partagé patient et radiologue — thème gradient bleu-rose. Sélection du rôle lors de la connexion.</P>

      <H3>Connexion Admin (<Code>/admin-login</Code>)</H3>
      <P>Espace séparé avec thème blanc/light. Compte unique : <Code>admin@laura-ai.fr / Admin2026!</Code></P>

      <H3>Page Médecin Partagée (<Code>/shared/:token</Code>)</H3>
      <P>Accessible sans compte. Affiche un dossier, document ou rapport partagé. Validité : 7 jours (patient) ou 30 jours (rapport radiologue).</P>

      {/* Espace Patient */}
      <H2>👤 Espace Patient</H2>
      <H3>Scanner IA (<Code>/patient/scan</Code>)</H3>
      <P>Fonctionnalité centrale. Upload image/PDF → analyse IA → rapport structuré avec findings, mesures, recommandations et niveau de confiance.</P>
      <InfoBox type="success">
        Sauvegarde automatique après scan : l'image originale (<Code>imageDataUrl</Code>) et le rapport structuré (<Code>reportContent</Code>) sont enregistrés avec le document.
      </InfoBox>

      <Table
        headers={['Sévérité', 'Couleur', 'Description']}
        rows={[
          ['critical', <Badge color="red">Rouge</Badge>, 'Urgence médicale'],
          ['important', <Badge color="orange">Orange</Badge>, 'À traiter rapidement'],
          ['moderate', <Badge color="gray">Jaune</Badge>, 'Surveillance'],
          ['minor', <Badge color="green">Vert</Badge>, 'Information'],
        ]}
      />

      <H3>Gestion Documentaire (<Code>/patient/documents</Code>)</H3>
      <P>Liste de documents avec filtres par type, recherche, tri. Dossiers multi-fichiers avec <Code>FolderView</Code>. Visionneuse <Code>DocumentViewer</Code> avec affichage image + rapport.</P>

      <H3>Partage par Lien</H3>
      <P>Génération d'un token unique via <Code>ShareModal</Code>. URL : <Code>laura-ai.fr/shared/&#123;token&#125;</Code>. Durée : 7 jours. Partage de dossier ou document individuel.</P>

      {/* Espace Radiologue */}
      <H2>👨‍⚕️ Espace Radiologue</H2>
      <H3>Dossiers DICOM (<Code>/radiologist/folders</Code>)</H3>
      <P>Gestionnaire complet via <Code>DicomFolderManager.tsx</Code>. Création dossiers, upload fichiers DICOM, génération rapport IA ou saisie manuelle, prévisualisation, export PDF, impression, partage.</P>

      <Table
        headers={['Statut', 'Description']}
        rows={[
          [<Badge color="gray">none</Badge>, 'Aucun rapport'],
          [<Badge color="blue">generating</Badge>, 'Génération IA en cours'],
          [<Badge color="orange">ai_generated</Badge>, 'Rapport IA — à valider'],
          [<Badge color="orange">in_review</Badge>, 'En révision experte'],
          [<Badge color="green">finalized</Badge>, 'Rapport validé'],
        ]}
      />

      <H3>Intégration PACS</H3>
      <P>Onglet PACS dans Mon Compte. Configuration multi-serveurs (DICOM / DICOMweb). Test C-ECHO. Import via <Code>PacsImportModal</Code> en 3 étapes : sélection serveur → C-FIND → C-MOVE. Badge PACS indigo sur les dossiers importés.</P>

      <H3>Mon Cabinet (<Code>LabContext</Code>)</H3>
      <P>Nom, adresse, RPPS, SIRET, logo (base64). Ces données apparaissent dans l'en-tête de chaque rapport PDF exporté.</P>

      {/* Espace Admin */}
      <H2>🛡️ Espace Administration</H2>
      <Table
        headers={['Page', 'Route', 'Fonctionnalités']}
        rows={[
          ['Vue d\'ensemble', <Code>/admin/overview</Code>, 'KPIs : users, revenus, stockage, RGPD'],
          ['Utilisateurs', <Code>/admin/users</Code>, 'CRUD, suspension, CSV export, filtres'],
          ['Offres & Quotas', <Code>/admin/plans</Code>, 'Modifier prix, quotas, features (PlansContext)'],
          ['Stockage', <Code>/admin/storage</Code>, 'Usage par utilisateur, alertes 80%'],
          ['RGPD', <Code>/admin/gdpr</Code>, 'Demandes droits, statuts, tableau conformité'],
        ]}
      />

      {/* Plans */}
      <H2>📦 Forfaits</H2>
      <Table
        headers={['ID', 'Nom', 'Prix', 'Stockage', 'Scans IA', 'Analyses IA']}
        rows={[
          ['free', 'Gratuit', '0€', '0,5 GB', '5/mois', '5/mois'],
          ['starter', 'Starter', '4,99€', '5 GB', '50/mois', '50/mois'],
          ['pro', 'Pro', '9,99€', '20 GB', 'Illimité', '200/mois'],
          ['radpro', 'Radiologue Pro', '29,99€', '100 GB', 'Illimité', 'Illimité'],
          ['enterprise', 'Entreprise', 'Sur devis', 'Illimité', 'Illimité', 'Illimité'],
        ]}
      />
      <InfoBox type="info">La valeur <Code>-1</Code> dans les quotas signifie "illimité". Le backend doit gérer ce cas en ne bloquant pas les requêtes.</InfoBox>

      {/* Routes */}
      <H2>🗺️ Plan des Routes</H2>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-7 overflow-x-auto mb-5">
        {[
          ['/', 'Landing Page'],
          ['/login', 'Connexion Patient / Radiologue'],
          ['/signup', 'Inscription'],
          ['/admin-login', 'Connexion Super Admin'],
          ['/shared/:token', 'Page médecin (publique)'],
          ['/api-docs', 'Documentation API'],
          ['---', ''],
          ['/patient/home', 'Dashboard patient'],
          ['/patient/scan', 'Scanner IA'],
          ['/patient/documents', 'Mes documents'],
          ['/patient/documents/:id', 'Visionneuse document'],
          ['/patient/documents/folder/:id', 'Vue dossier'],
          ['/patient/account', 'Mon compte patient'],
          ['---', ''],
          ['/radiologist/home', 'Dashboard radiologue'],
          ['/radiologist/folders', 'Dossiers DICOM'],
          ['/radiologist/account', 'Profil + Cabinet + PACS'],
          ['---', ''],
          ['/admin/overview', 'KPIs plateforme'],
          ['/admin/users', 'Gestion utilisateurs'],
          ['/admin/plans', 'Offres & Quotas'],
          ['/admin/storage', 'Stockage'],
          ['/admin/gdpr', 'Conformité RGPD'],
        ].map(([route, label], i) =>
          route === '---'
            ? <div key={i} className="border-t border-gray-700 my-1" />
            : <div key={i} className="flex gap-4">
                <span className="text-blue-400 flex-shrink-0 w-64">{route}</span>
                <span className="text-gray-400"># {label}</span>
              </div>
        )}
      </div>

      {/* RGPD */}
      <H2>🔐 Conformité RGPD</H2>
      <Table
        headers={['Critère', 'Statut']}
        rows={[
          ['Chiffrement AES-256', <Badge color="green">✅ Conforme</Badge>],
          ['Hébergement HDS France', <Badge color="green">✅ Conforme</Badge>],
          ['Journal des accès', <Badge color="green">✅ Conforme</Badge>],
          ['Politique de confidentialité', <Badge color="green">✅ Conforme</Badge>],
          ['DPO désigné', <Badge color="green">✅ Conforme</Badge>],
          ['Analyse PIA', <Badge color="orange">⏳ En cours</Badge>],
          ['Contrats sous-traitants', <Badge color="orange">⏳ En cours</Badge>],
        ]}
      />

      <InfoBox type="warning">
        <strong>Session non persistante</strong> — comportement intentionnel : pas de localStorage. Le backend doit gérer la persistance via cookies HttpOnly sécurisés (refresh token rotation).
      </InfoBox>
    </div>
  );
}

// ── Documentation Technique ───────────────────────────────────────────────────

function TechnicalDoc() {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-2 mb-1 opacity-80 text-sm">
          <Code2 className="w-4 h-4" /> Documentation Technique
        </div>
        <H1>Architecture & Implémentation</H1>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge color="green">v2.4</Badge>
          <Badge color="blue">React 18 + TypeScript</Badge>
          <Badge color="purple">Tailwind v4</Badge>
          <Badge color="gray">React Router v7</Badge>
        </div>
      </div>

      {/* Stack */}
      <H2>🏗️ Stack Technologique</H2>
      <H3>Frontend (Production)</H3>
      <Table
        headers={['Composant', 'Technologie', 'Version']}
        rows={[
          ['Framework', 'React', '18.x'],
          ['Langage', 'TypeScript', '5.x'],
          ['Styling', 'Tailwind CSS', '4.0'],
          ['Routing', 'React Router (Data Mode)', 'v7'],
          ['State', 'React Context API + useState', '—'],
          ['Icons', 'Lucide React', 'latest'],
          ['PDF/Print', 'window.print() natif', '—'],
          ['Build', 'Vite + ESBuild', '—'],
        ]}
      />

      <H3>Backend (À implémenter)</H3>
      <Table
        headers={['Composant', 'Technologie recommandée']}
        rows={[
          ['API', 'Python FastAPI ou Node.js Fastify'],
          ['Base de données', 'PostgreSQL 15+'],
          ['ORM', 'SQLAlchemy (Python) ou Prisma (Node)'],
          ['Cache', 'Redis 7'],
          ['File Storage', 'AWS S3, MinIO ou OVH Object Storage'],
          ['Auth', 'JWT HS256 + Refresh Token HttpOnly Cookie'],
          ['Queue async', 'Celery (Python) ou BullMQ (Node)'],
          ['DICOM Server', 'Orthanc open-source'],
          ['IA', 'OpenAI GPT-4o Vision ou modèle fine-tuné'],
        ]}
      />

      {/* Contexts */}
      <H2>🧠 Architecture des Contexts</H2>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-6 mb-5 overflow-x-auto">
        {`<AuthProvider>                    // Session utilisateur (non persistante)
  <PlansProvider>                 // Forfaits configurables
    <SharedLinksProvider>         // Tokens partage (7j / 30j)
      <PatientDocumentsProvider>  // Documents + dossiers patient
        <LabProvider>             // Cabinet radiologue
          <PacsProvider>          // Serveurs PACS multi
            <RouterProvider />
          </PacsProvider>
        </LabProvider>
      </PatientDocumentsProvider>
    </SharedLinksProvider>
  </PlansProvider>
</AuthProvider>`}
      </div>
      <InfoBox type="warning">
        <Code>PatientDocumentsProvider</Code> est centralisé dans <Code>App.tsx</Code> et NON dans <Code>PatientLayout.tsx</Code> pour éviter la réinitialisation lors de la navigation.
      </InfoBox>

      {/* Modèles */}
      <H2>📋 Modèles de Données Principaux</H2>
      <H3>MedicalDocument</H3>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-6 mb-4 overflow-x-auto">
        {`interface MedicalDocument {
  id:             string;
  name:           string;
  type:           'ordonnance'|'analyse'|'imagerie'|'rapport'|'certificat'|'autre';
  date:           string;           // YYYY-MM-DD
  size:           string;           // ex: "2.3 MB"
  doctor?:        string;
  pathology?:     string;
  notes?:         string;
  aiAnalyzed?:    boolean;
  fromScan?:      boolean;
  folderId?:      string;
  shareToken?:    string;
  imageDataUrl?:  string;           // base64 — image scannée originale
  reportContent?: string;           // Rapport IA structuré complet
}`}
      </div>

      <H3>PacsServer</H3>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-6 mb-4 overflow-x-auto">
        {`interface PacsServer {
  id:                string;
  name:              string;
  host:              string;           // IP ou hostname
  port:              number;           // 104 par défaut
  aeTitle:           string;           // AE Title PACS distant
  callingAeTitle:    string;           // AE Title Laura AI → "LAURA_AI"
  protocol:          'DICOM' | 'DICOMweb';
  webUrl:            string;
  tls:               boolean;
  active:            boolean;
  connectionStatus?: 'connected' | 'error' | 'unknown';
  lastConnected?:    string;           // ISO
}`}
      </div>

      {/* Base de données */}
      <H2>🗄️ Schéma Base de Données</H2>
      <Table
        headers={['Table', 'Description', 'Clé primaire']}
        rows={[
          ['users', 'Comptes patient / radiologue / admin', 'UUID'],
          ['plans', 'Forfaits configurables (free → enterprise)', 'VARCHAR(50)'],
          ['storage_usage', 'Usage stockage par utilisateur', 'UUID'],
          ['scan_usage', 'Compteur scans IA par mois', 'UUID + (user_id, month)'],
          ['medical_documents', 'Documents patient (avec imageDataUrl, reportContent)', 'UUID'],
          ['document_folders', 'Dossiers multi-fichiers patient', 'UUID'],
          ['shared_links', 'Tokens partage avec expiration', 'token VARCHAR(50)'],
          ['lab_info', 'Infos cabinet radiologue (logo inclus)', 'UUID'],
          ['dicom_folders', 'Dossiers patients radiologue', 'UUID'],
          ['dicom_files', 'Fichiers DICOM d\'un dossier', 'UUID'],
          ['pacs_servers', 'Serveurs PACS configurés', 'UUID'],
          ['async_jobs', 'Jobs asynchrones (PACS, IA, export)', 'UUID'],
          ['gdpr_requests', 'Demandes de droits RGPD', 'UUID'],
          ['refresh_tokens', 'Tokens de renouvellement JWT', 'UUID'],
        ]}
      />

      {/* Sécurité */}
      <H2>🔐 Sécurité</H2>
      <Table
        headers={['Niveau', 'Technologie']}
        rows={[
          ['Transport', 'TLS 1.3 (HTTPS obligatoire)'],
          ['Mots de passe', 'bcrypt (cost factor 12)'],
          ['Access Token', 'JWT HS256, durée 24h'],
          ['Refresh Token', 'Rotation, cookie HttpOnly Secure SameSite=Strict, 30j'],
          ['Fichiers S3', 'SSE-S3 (Server-Side Encryption)'],
          ['Données sensibles', 'AES-256-GCM'],
        ]}
      />

      <H3>Autorisation par route</H3>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-6 mb-4 overflow-x-auto">
        {`POST /api/auth/*                → Public
GET  /api/shared/:token         → Public (vérif expiration)
POST /api/scan/analyze          → Public (userId optionnel)

/api/patient/*                  → JWT role = 'patient'
/api/radiologist/*              → JWT role = 'radiologist'
/api/admin/*                    → JWT role = 'admin'
/api/gdpr/request               → JWT (any role)`}
      </div>

      {/* PDF */}
      <H2>📄 Génération PDF (downloadUtils.ts)</H2>
      <Table
        headers={['Fonction', 'Usage']}
        rows={[
          ['downloadScanAsPdf(doc)', 'Export PDF document scanné patient'],
          ['downloadDocumentAsPdf(doc)', 'Export PDF document générique'],
          ['downloadReportAsPdf(data, lab, profile)', 'Export PDF rapport radiologue avec en-tête cabinet'],
        ]}
      />
      <P>Technique : <Code>window.open() + document.write() + setTimeout(win.print, 450ms)</Code>. Format A4, marges 18mm/20mm, styles inline. Le navigateur propose "Enregistrer en PDF".</P>

      {/* PACS */}
      <H2>📡 Workflow PACS</H2>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-6 mb-4 overflow-x-auto">
        {`Étape 1 : Sélection serveur
    → usePacs() → servers[]

Étape 2 : C-FIND
    → POST /api/radiologist/pacs/:id/query
    → Body: { patientName, studyDateFrom, studyDateTo, modality }
    → Résultat: PacsStudy[]

Étape 3 : C-MOVE (asynchrone)
    → POST /api/radiologist/pacs/:id/retrieve
    → Retourne: { jobId }
    → Polling GET /api/jobs/:jobId toutes les 2s
    → Complétion: dossier créé avec pacsImported: true`}
      </div>
      <InfoBox type="info">
        Recommandé : implémenter <strong>WebSocket / SSE</strong> pour pousser les mises à jour de progression en temps réel plutôt que du polling.
      </InfoBox>

      {/* Points critiques */}
      <H2>⚠️ Points d'Attention Critiques</H2>
      {[
        {
          title: '1. imageDataUrl en base64',
          text: 'En production, migrer le stockage des images vers S3. Stocker l\'URL S3 dans file_url, ne pas conserver le base64 en base de données.',
          type: 'warning' as const,
        },
        {
          title: '2. Session non persistante',
          text: 'Comportement intentionnel frontend. Le backend DOIT implémenter les refresh tokens via cookies HttpOnly. Jamais de token en localStorage.',
          type: 'warning' as const,
        },
        {
          title: '3. Quota -1 = illimité',
          text: 'La valeur maxScans = -1 signifie illimité. Le backend ne doit pas incrémenter ni bloquer si max_scans = -1 (ou NULL en base).',
          type: 'info' as const,
        },
        {
          title: '4. Disclaimer IA obligatoire',
          text: 'Chaque résultat d\'analyse IA DOIT inclure le disclaimer légal. Obligation RGPD Art. 22 + réglementation dispositifs médicaux IA.',
          type: 'warning' as const,
        },
        {
          title: '5. Hébergement HDS',
          text: 'Les données de santé (catégorie spéciale RGPD Art. 9) nécessitent un hébergement HDS certifié en France. AWS eu-west-3 / OVH / Outscale / Scaleway.',
          type: 'warning' as const,
        },
      ].map(item => (
        <InfoBox key={item.title} type={item.type}>
          <strong>{item.title}</strong> — {item.text}
        </InfoBox>
      ))}

      {/* Déploiement */}
      <H2>🚀 Variables d'Environnement Clés</H2>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-gray-100 leading-6 mb-4 overflow-x-auto">
        {`# Auth
JWT_SECRET=your-256-bit-secret
JWT_EXPIRY_HOURS=24
REFRESH_TOKEN_EXPIRY_DAYS=30

# Storage S3
S3_BUCKET=laura-ai-medical
S3_ENDPOINT=https://s3.eu-west-3.amazonaws.com
S3_REGION=eu-west-3

# IA
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# CORS
CORS_ORIGINS=https://laura-ai.fr

# HDS
HDS_PROVIDER=OVH    # ou AWS Paris, Outscale, Scaleway`}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'functional', label: 'Documentation Fonctionnelle', icon: BookOpen, color: 'from-blue-600 to-rose-500' },
  { id: 'technical',  label: 'Documentation Technique',     icon: Code2,    color: 'from-slate-600 to-slate-900' },
];

export function DocsPage() {
  const [activeDoc, setActiveDoc] = useState<'functional' | 'technical'>('functional');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LauraLogoMark size="xs" tone="brand" aria-hidden />
            <span className="font-bold text-gray-900">Laura AI</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 text-sm">Documentation</span>
          </div>
          <a
            href="/api-docs"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Documentation API
          </a>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 pb-0">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveDoc(item.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeDoc === item.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.id === 'functional' ? 'Fonctionnel' : 'Technique'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar Quick Nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sections</p>
              <nav className="space-y-1">
                {activeDoc === 'functional' ? [
                  { icon: Map, label: 'Vue d\'ensemble' },
                  { icon: Shield, label: 'Pages publiques' },
                  { icon: Users, label: 'Espace patient' },
                  { icon: Zap, label: 'Espace radiologue' },
                  { icon: Shield, label: 'Administration' },
                  { icon: Database, label: 'Forfaits' },
                  { icon: Map, label: 'Plan des routes' },
                  { icon: Shield, label: 'RGPD' },
                ] : [
                  { icon: Server, label: 'Stack technique' },
                  { icon: Database, label: 'Contexts' },
                  { icon: FileText, label: 'Modèles de données' },
                  { icon: Database, label: 'Base de données' },
                  { icon: Shield, label: 'Sécurité' },
                  { icon: FileText, label: 'Génération PDF' },
                  { icon: Server, label: 'Workflow PACS' },
                  { icon: Settings, label: 'Déploiement' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-800 mb-1">Référence API</p>
                <p className="text-xs text-blue-600 mb-2">50+ endpoints documentés</p>
                <a href="/api-docs" className="block text-center text-xs bg-blue-600 text-white rounded-lg py-1.5 hover:bg-blue-700 transition-colors">
                  Voir /api-docs
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-6 sm:px-8 py-6">
            {activeDoc === 'functional' ? <FunctionalDoc /> : <TechnicalDoc />}

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
              <span>Laura AI Documentation v2.4 — 22 avril 2026</span>
              <span>Usage interne · Confidentiel</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
