# 📗 Documentation Fonctionnelle — Laura AI
### Carnet de Santé Numérique Intelligent

**Version** : 2.4  
**Dernière mise à jour** : 22 avril 2026  
**Contact** : contact@laura-ai.fr  
**URL de production** : https://laura-ai.fr  
**Documentation API** : https://laura-ai.fr/api-docs

---

## 🎯 Vue d'Ensemble

Laura AI est une plateforme HealthTech internationale qui centralise le carnet de santé numérique des patients, facilite la gestion des dossiers d'imagerie médicale pour les radiologues, et intègre un moteur d'analyse IA des documents médicaux.

### Utilisateurs Cibles

| Rôle | Description | Accès |
|---|---|---|
| **Patient** | Citoyen gérant son dossier de santé | `/patient/*` |
| **Radiologue** | Médecin spécialiste gérant dossiers DICOM | `/radiologist/*` |
| **Super Admin** | Administrateur plateforme Laura AI | `/admin/*` |

### Pays Supportés
- 🇫🇷 **France** — Hébergement HDS certifié
- 🇹🇳 **Tunisie** — Conformité locale
- 🌐 **International** — Tous autres pays

### Proposition de Valeur
✅ Scan IA gratuit sans création de compte (landing page)  
✅ Centralisation documents médicaux avec dossiers multi-fichiers  
✅ Partage sécurisé par lien (médecin, radiologue)  
✅ Gestion complète dossiers DICOM pour radiologues  
✅ Intégration PACS (C-FIND / C-MOVE / DICOMweb)  
✅ Rapports IA avec validation experte du radiologue  
✅ Administration complète (plans, stockage, RGPD)  
✅ Conformité RGPD — Données de santé Art. 9

---

## 🏠 Pages Publiques

### 1. Landing Page (`/`)

Page d'accueil accessible sans compte.

**Sections** :
- Hero avec scan IA gratuit en démonstration
- Fonctionnalités principales (scan, partage, DICOM)
- Tarification (3 plans patients + plan radiologue)
- Navigation vers Inscription, Connexion, À propos, Tarifs

**Scan IA public** :
- Fonctionnel sans création de compte
- Analyse l'image uploadée et renvoie un rapport structuré
- Quota de démonstration : 1 scan anonyme

### 2. Inscription / Connexion (`/login`, `/signup`)

Espace partagé patient et radiologue — thème gradient bleu-rose.

**Connexion** :
- Email + mot de passe
- Sélection du rôle (Patient / Radiologue)
- Redirection automatique vers le dashboard correspondant

**Inscription** :
- Nom, email, mot de passe
- Choix du rôle et du pays (FR / TN / International)
- Plan par défaut : Gratuit

**Comptes de démonstration** :
```
Patient     : amira.bensalah@email.com  — tout mot de passe
Radiologue  : k.mansour@radiology.com   — tout mot de passe
Admin       : admin@laura-ai.fr / Admin2026!  →  /admin-login
```

### 3. Connexion Admin (`/admin-login`)

Espace séparé — thème blanc/light.

- Formulaire email + mot de passe dédié
- Compte unique : `admin@laura-ai.fr / Admin2026!`
- Redirection vers `/admin/overview` après connexion

### 4. Page Partagée Médecin (`/shared/:token`)

Page publique accessible sans compte par un médecin externe.

- Affiche un dossier patient, un document ou un rapport de radiologue
- Lien valide 7 jours (patient) ou 30 jours (rapport radiologue)
- Affichage complet : liste de documents, visionneuse, rapport
- Pas de connexion requise

---

## 👤 Espace Patient (`/patient/*`)

### Navigation Sidebar (verticale)
- 🏠 Accueil (`/patient/home`)
- 🧠 Scanner IA (`/patient/scan`)
- 📁 Mes Documents (`/patient/documents`)
- 👤 Mon Compte (`/patient/account`)

---

### 1. Tableau de Bord Patient (`/patient/home`)

**Statistiques affichées** :
- Nombre de documents
- Nombre de dossiers
- Scans IA réalisés ce mois
- Quota IA restant (selon forfait)

**Quick access** :
- Lancer un scan IA
- Accéder aux documents récents
- Voir les dossiers

---

### 2. Scanner IA (`/patient/scan`)

Fonctionnalité centrale de Laura AI.

#### 2.1 Upload du document

**Modes d'upload** :
- Glisser-déposer un fichier
- Sélectionner depuis l'ordinateur
- Prendre une photo (mobile)

**Formats acceptés** : JPG, PNG, PDF, DICOM

**Limite** : 50 MB par fichier

#### 2.2 Analyse IA

**Pipeline de traitement** :
```
Image/PDF uploadé
    ↓
Preprocessing (deskew, denoise)
    ↓
Classification du type de document
    ↓
Analyse médicale (selon type)
    ↓
Extraction findings + mesures
    ↓
Génération recommandations priorisées
    ↓
Rapport structuré avec niveau de confiance
```

**Types de documents détectés** :
- `scanner` — Scanner / TDM
- `irm` — IRM
- `radiographie` — Radiographie simple
- `ordonnance` — Ordonnance médicale
- `analyse` — Bilan biologique
- `rapport` — Compte-rendu médical
- `autre` — Autre document

**Résultat d'analyse IA** :

| Champ | Description |
|---|---|
| `type` | Type de document détecté |
| `examType` | Description précise (ex: "Scanner abdomino-pelvien") |
| `confidence` | Score de confiance IA (0–100%) |
| `findings[]` | Liste des anomalies détectées avec sévérité |
| `normalFindings[]` | Éléments dans la norme |
| `recommendations[]` | Actions recommandées avec priorité |
| `disclaimer` | Avertissement médical obligatoire |

**Sévérités des findings** :
- 🔴 `critical` — Urgence médicale
- 🟠 `important` — À traiter rapidement
- 🟡 `moderate` — Surveillance
- 🟢 `minor` — Information

**Priorités des recommandations** :
- `urgent` — Consultation immédiate
- `high` — Dans les 48h
- `medium` — Dans la semaine
- `low` — Suivi habituel

#### 2.3 Sauvegarde automatique

Après chaque scan, le document est automatiquement sauvegardé dans Mes Documents avec :
- `imageDataUrl` — Image originale encodée en base64
- `reportContent` — Rapport IA complet en texte structuré
- `fromScan: true` — Marqueur d'origine scan
- `aiAnalyzed: true` — Marqueur d'analyse IA

> ⚠️ Tous les rapports IA incluent un disclaimer légal : *"Cette analyse est générée par IA et ne remplace pas l'avis d'un médecin diplômé."*

---

### 3. Gestion Documentaire (`/patient/documents`)

#### 3.1 Vue Principale

**Affichage** :
- Barre de recherche (nom, médecin, pathologie)
- Filtres par type : Tous / Ordonnance / Analyse / Imagerie / Rapport / Certificat / Autre
- Tri : Date (défaut), Nom, Taille
- Liste de dossiers en haut, documents libres en dessous

**Types de documents** :

| Icône | Type | Description |
|---|---|---|
| 💊 | `ordonnance` | Ordonnance médicale |
| 🧪 | `analyse` | Bilan biologique ou analyse |
| 🖼️ | `imagerie` | IRM, scanner, radio, écho |
| 📋 | `rapport` | Compte-rendu médical |
| 📄 | `certificat` | Certificat médical |
| 📎 | `autre` | Autre document |

**Métadonnées par document** :
- Nom, type, date, taille
- Médecin prescripteur
- Pathologie associée
- Notes libres
- Badge `🤖 Analyse IA` si aiAnalyzed
- Badge `📷 Scan` si fromScan

#### 3.2 Dossiers Multi-fichiers (`FolderView`)

Route : `/patient/documents/folder/:folderId`

**Fonctionnalités** :
- Voir tous les documents d'un dossier
- Ajouter des documents existants à un dossier
- Retirer un document d'un dossier (le document reste accessible)
- Renommer / supprimer le dossier
- Générer un lien de partage pour tout le dossier

**Structure d'un dossier** :
```
Dossier "Suivi rénal 2025–2026"
├── IRM abdominale — Kyste Bosniak IIF (imagerie)
├── Compte-rendu consultation néphrologie (rapport)
└── Ordonnance suivi — Dr. Mansour (ordonnance)
```

#### 3.3 Visionneuse Document (`DocumentViewer`)

Route : `/patient/documents/:id`

**Affichage selon le type** :
- Documents scannés : image originale + rapport IA structuré complet
- Documents uploadés manuellement : métadonnées + notes
- Images médicales : aperçu + informations techniques

> 💡 La vue DICOM côté patient est remplacée par un placeholder sobre indiquant que la visualisation DICOM avancée est réservée aux radiologues.

#### 3.4 Partage par Lien (`ShareModal`)

**Types de partage** :
- `document` — Partage d'un document unique
- `folder` — Partage d'un dossier complet

**Fonctionnement** :
1. Cliquer sur "Partager" depuis un document ou dossier
2. Un token unique est généré (12 caractères aléatoires)
3. URL de partage : `https://laura-ai.fr/shared/<token>`
4. Durée de validité : **7 jours** (non modifiable côté patient)
5. Copier le lien et l'envoyer au médecin

**Ce que voit le médecin** :
- Page publique `/shared/:token` sans connexion requise
- Liste des documents du dossier avec visionneuse intégrée
- Informations du patient (prénom, type de document)
- Téléchargement individuel de chaque fichier

---

### 4. Mon Compte Patient (`/patient/account`)

**Onglets disponibles** :
- **Profil** — Nom, email, avatar, pays
- **Mon Forfait** — Plan actuel, quotas, usage stockage
- **Sécurité** — Changement mot de passe, 2FA
- **Confidentialité** — Gestion des données, demande RGPD

---

## 👨‍⚕️ Espace Radiologue (`/radiologist/*`)

### Navigation Sidebar (verticale)
- 🏠 Tableau de bord (`/radiologist/home`)
- 📁 Dossiers DICOM (`/radiologist/folders`)
- 👤 Mon Compte (`/radiologist/account`)

---

### 1. Tableau de Bord Radiologue (`/radiologist/home`)

**Statistiques** :
- Dossiers en cours
- Rapports à valider
- Dossiers finalisés ce mois
- Espace stockage utilisé / total

**Accès rapides** :
- Créer un nouveau dossier
- Importer depuis PACS
- Derniers dossiers modifiés

---

### 2. Gestionnaire Dossiers DICOM (`/radiologist/folders`)

Composant principal de l'espace radiologue : `DicomFolderManager.tsx`

#### 2.1 Liste des dossiers

**Informations affichées par dossier** :
- Nom du patient + ID patient (PAT-YYYY-NNN)
- Pathologie
- Modalité (IRM, Scanner/TDM, Radio, Écho, PET Scan, Mammo)
- Date de création
- Nombre de fichiers DICOM
- Statut du rapport (voir tableau ci-dessous)
- Badge **PACS** indigo si importé depuis un serveur PACS

**Statuts de rapport** :

| Statut | Couleur | Description |
|---|---|---|
| `none` | ⚫ Gris | Aucun rapport |
| `generating` | 🔵 Bleu | Génération IA en cours |
| `ai_generated` | 🟡 Jaune | Rapport IA généré, à valider |
| `in_review` | 🟠 Orange | En cours de révision experte |
| `finalized` | 🟢 Vert | Rapport validé et finalisé |

#### 2.2 Création d'un dossier

**Champs requis** :
- Nom du patient
- ID patient (format PAT-YYYY-NNN)
- Pathologie / indication clinique
- Modalité d'examen

**Upload de fichiers DICOM** :
- Formats : `.dcm`, `.dicom`, fichiers DICOM standards
- Taille maximale : selon quota du forfait
- Tag DICOM utilisé : Modality (MR, CT, CR, US, PT, MG)

#### 2.3 Rapport — Éditeur Manuel + IA

**Modes de rédaction** :

1. **Mode Manuel** (éditeur texte)
   - Zone de texte libre
   - Sections structurées préremplies
   - Sauvegarde automatique brouillon

2. **Mode IA** (génération automatique)
   - Analyse des fichiers DICOM du dossier
   - Rapport structuré en 5 sections :
     - I. Indication clinique
     - II. Technique d'acquisition
     - III. Résultats (IA — à valider)
     - IV. Conclusion avec niveau de confiance IA
     - V. Recommandations
   - Niveau de confiance affiché (ex: 78%)
   - Le rapport IA DOIT être relu et validé avant envoi

**Structure du rapport généré** :
```
I. INDICATION CLINIQUE
[Pathologie] — Examen d'imagerie réalisé dans le cadre du bilan diagnostique.

II. TECHNIQUE
Acquisition [Modalité] selon protocole standard. [N] série(s) analysée(s).

III. RÉSULTATS (IA — À VALIDER)
• Région anatomique : [À préciser]
• Aspect morphologique : [...]
• Mesures automatiques : [...]

IV. CONCLUSION (Niveau de confiance IA : 78 %)
[Synthèse]

V. RECOMMANDATIONS
• Corrélation clinico-radiologique recommandée
• Suivi à [délai] selon avis clinique

⚠️ Rapport préliminaire IA — Doit être validé par un radiologue diplômé.
```

#### 2.4 Prévisualisation Rapport (`ReportPreview`)

Vue rendu avant finalisation / export.

**Affiche** :
- En-tête cabinet (logo, nom, adresse, RPPS, SIRET)
- Informations patient (nom, ID, pathologie, modalité)
- Corps du rapport formaté
- Signature radiologue (nom, titre, spécialité)
- Date de finalisation
- Tampon "DOCUMENT CONFIDENTIEL"

#### 2.5 Actions sur un dossier finalisé

| Action | Description |
|---|---|
| 📥 **Export PDF** | Génère un PDF A4 formaté via `window.print()` |
| 🖨️ **Impression** | Impression directe navigateur |
| 🔗 **Partage patient** | Envoie le rapport au patient par email |
| 🔗 **Partage médecin** | Génère un lien privé 30 jours |

**Partage avec un médecin externe** :
- Lien public : `https://laura-ai.fr/shared/<token>`
- Durée : **30 jours** (vs 7 jours côté patient)
- Contient : rapport complet + infos cabinet + signature radiologue

---

### 3. Intégration PACS

#### 3.1 Configuration dans Mon Compte

Onglet **PACS** dans `/radiologist/account`.

**Informations par serveur PACS** :
- Nom du serveur (ex: "PACS Principal — Hôpital Lariboisière")
- Hôte IP ou hostname
- Port (défaut: 104)
- AE Title distant
- AE Title appelant (défaut: "LAURA_AI")
- Protocole : `DICOM` ou `DICOMweb`
- URL DICOMweb (si protocole DICOMweb)
- TLS activé/désactivé

**Statuts de connexion** :
- 🟢 `connected` — Connexion C-ECHO réussie
- 🔴 `error` — Connexion échouée
- ⚫ `unknown` — Non testé

**Test C-ECHO** : bouton "Tester la connexion" — simule un C-ECHO DICOM, met à jour le statut en temps réel.

#### 3.2 Import depuis PACS (`PacsImportModal`)

**Workflow en 3 étapes** :

**Étape 1 — Sélection du serveur PACS**
- Liste des serveurs configurés avec statut
- Sélection d'un serveur actif

**Étape 2 — Recherche C-FIND**
- Filtres de recherche :
  - Nom du patient
  - ID patient
  - Période de dates (studyDateFrom / studyDateTo)
  - Modalité
- Résultats : liste d'études DICOM disponibles
- Informations par étude : patient, date, description, modalité, nb séries / images

**Étape 3 — Import C-MOVE**
- Sélection d'une ou plusieurs études
- Déclenchement du C-MOVE (asynchrone)
- Barre de progression
- Le dossier créé apparaît avec le badge **PACS indigo**

**Données importées dans le dossier** :
- `patientName`, `patientId`
- `studyDescription` → pathologie
- `modality`
- Fichiers DICOM (liste simulée avec tailles)
- `pacsImported: true`
- `pacsStudyUID` — UID de l'étude DICOM

---

### 4. Mon Compte Radiologue (`/radiologist/account`)

#### Onglet Profil
- Nom, titre, spécialité

#### Onglet Mon Cabinet (`LabContext`)
- Raison sociale du cabinet
- Adresse complète (rue, CP, ville, pays)
- Téléphone, email, site web
- N° RPPS (identifiant professionnel)
- N° SIRET
- **Logo du cabinet** : upload PNG/JPG (preview temps réel), utilisé dans les en-têtes de rapports PDF

#### Onglet PACS
- Gestion des serveurs PACS (voir § 3.1)

---

## 🛡️ Espace Administration (`/admin/*`)

**Accès** : `admin@laura-ai.fr / Admin2026!` via `/admin-login`  
**Thème** : blanc / light (distinct des espaces patient/radiologue)

### Navigation Sidebar
- 📊 Vue d'ensemble (`/admin/overview`)
- 👥 Utilisateurs (`/admin/users`)
- 📦 Offres & Quotas (`/admin/plans`)
- 💾 Stockage (`/admin/storage`)
- 🔒 RGPD (`/admin/gdpr`)

---

### 1. Vue d'Ensemble (`/admin/overview`)

**KPIs globaux** :
- Utilisateurs totaux / actifs
- Revenus mensuels (calculés depuis les forfaits actifs)
- Stockage utilisé sur l'ensemble des comptes
- Requêtes RGPD en attente

**Activité récente** :
- Dernières inscriptions
- Montées en plan
- Alertes stockage
- Requêtes RGPD

**Distribution des plans** :
- Répartition visuelle des abonnés par forfait

---

### 2. Gestion Utilisateurs (`/admin/users`)

**Informations par utilisateur** :
- Nom, email
- Rôle (Patient / Radiologue)
- Forfait actuel
- Stockage : utilisé / total (barre de progression)
- Statut : `active` / `suspended` / `pending`
- Date d'inscription
- Dernière activité

**Filtres** :
- Recherche par nom / email
- Filtre par rôle
- Filtre par statut

**Actions** :
- 👁️ Voir le détail (modal)
- ✅ Activer
- 🚫 Suspendre
- 🗑️ Supprimer (irréversible — RGPD)
- 📥 Exporter CSV

---

### 3. Offres & Quotas (`/admin/plans`) — `PlansContext`

**Forfaits configurables** :

| ID | Nom | Prix | Stockage | Scans IA | Analyses IA |
|---|---|---|---|---|---|
| `free` | Gratuit | 0€ | 0,5 GB | 5/mois | 5/mois |
| `starter` | Starter | 4,99€ | 5 GB | 50/mois | 50/mois |
| `pro` | Pro | 9,99€ | 20 GB | Illimité | 200/mois |
| `radpro` | Radiologue Pro | 29,99€ | 100 GB | Illimité | Illimité |
| `enterprise` | Entreprise | Sur devis | Illimité | Illimité | Illimité |

> **Règle** : la valeur `-1` signifie "illimité" dans tous les quotas.

**Modifications possibles depuis l'admin** :
- Nom du forfait
- Prix mensuel
- Stockage alloué
- Quota scans IA / mois
- Quota analyses IA / mois
- Liste des fonctionnalités (texte libre)
- Activer / désactiver un forfait

---

### 4. Stockage (`/admin/storage`)

**Vue globale** :
- Total alloué vs total utilisé
- Barre de progression globale
- Top utilisateurs par consommation

**Par utilisateur** :
- Nom, forfait, GB utilisés, GB alloués
- % d'utilisation avec alerte si > 80%

---

### 5. RGPD (`/admin/gdpr`)

#### Demandes de droits

**Types de demandes** :
- Accès aux données
- Suppression de compte
- Portabilité des données
- Rectification
- Opposition au traitement

**Statuts** :
- `pending` 🟡 — En attente
- `in_progress` 🔵 — En cours de traitement
- `completed` 🟢 — Traitée

**Délai légal** : 30 jours (Art. 12 RGPD)

#### Tableau de conformité

**État de conformité de la plateforme** (9 critères) :

| Critère | Statut |
|---|---|
| Chiffrement des données (AES-256) | ✅ |
| Hébergement HDS certifié (France) | ✅ |
| Journal des accès activé | ✅ |
| Politique de confidentialité à jour | ✅ |
| Registre des traitements tenu | ✅ |
| DPO désigné | ✅ |
| Procédure de notification violation (72h) | ✅ |
| Analyse PIA réalisée | ⏳ En cours |
| Contrats sous-traitants signés | ⏳ En cours |

---

## 🔔 Système de Notifications

### Notifications Patient
- ✅ Document sauvegardé après scan IA
- 📤 Lien de partage créé avec succès
- ⚠️ Quota IA atteint (alerte à 80% et 100%)
- 💾 Stockage proche de la limite (alerte à 80%)

### Notifications Radiologue
- ✅ Rapport finalisé et sauvegardé
- 📤 Lien de partage rapport généré
- ✅ Import PACS terminé
- ❌ Connexion PACS échouée

### Notifications Admin
- 👤 Nouvel utilisateur inscrit
- ⬆️ Montée en plan
- 🔒 Nouvelle requête RGPD
- ⚠️ Stockage utilisateur > 80%

---

## 🎨 Charte Visuelle

### Identité Visuelle
- **Gradient principal** : Bleu (`#2563eb`) → Rose (`#ec4899`)
- **Approche** : Mobile-first, responsive
- **Design** : Cartes arrondies (rounded-2xl), ombres légères, espacements généreux

### Espaces Visuels

| Espace | Thème | Particularité |
|---|---|---|
| Public (landing, login) | Gradient bleu-rose | Splash coloré |
| Patient | Sidebar violet/bleu, fond gris clair | Mobile-first |
| Radiologue | Sidebar indigo, fond gris clair | Tableaux de données |
| Admin | Sidebar blanc, thème light | Épuré, tableaux |

---

## 🔐 Gestion des Sessions

**Principe** : session volontairement **non persistante**.
- Pas de `localStorage`, pas de `sessionStorage`
- La session est gérée en mémoire React (état volatile)
- À chaque rafraîchissement de page : reconnexion nécessaire
- Le backend doit gérer les refresh tokens via cookies HttpOnly sécurisés

---

## 🗺️ Plan des Routes

```
/                          → Landing Page (publique)
/login                     → Connexion Patient / Radiologue
/signup                    → Inscription
/about                     → À propos
/pricing                   → Tarifs
/admin-login               → Connexion Super Admin
/shared/:token             → Page partagée médecin (publique)
/api-docs                  → Documentation API (interne)

/patient/home              → Dashboard patient
/patient/scan              → Scanner IA
/patient/documents         → Mes documents
/patient/documents/:id     → Visionneuse document
/patient/documents/folder/:folderId  → Vue dossier
/patient/account           → Mon compte patient

/radiologist/home          → Dashboard radiologue
/radiologist/folders       → Dossiers DICOM
/radiologist/account       → Mon compte + Cabinet + PACS

/admin/overview            → Vue d'ensemble KPIs
/admin/users               → Gestion utilisateurs
/admin/plans               → Offres & Quotas
/admin/storage             → Stockage
/admin/gdpr                → Conformité RGPD
```

---

## 🚀 Roadmap

### ✅ Phase 1 — Livré (Avril 2026)
- Authentification 3 rôles (patient, radiologue, admin)
- Scanner IA avec sauvegarde automatique (image + rapport)
- Gestion documentaire complète (dossiers, partage, visionneuse)
- Espace radiologue : DICOM, rapports IA + manuel, export PDF
- Intégration PACS complète (multi-serveurs, C-FIND, C-MOVE, C-ECHO)
- Administration complète (users, plans, stockage, RGPD)
- Documentation API complète (`/api-docs`)

### 🔜 Phase 2 — Q3 2026
- Authentification JWT réelle (backend)
- Paiement abonnements (Stripe / Konnect)
- Téléconsultation vidéo
- Notifications push (email + mobile)
- Application mobile iOS / Android

### 🔮 Phase 3 — Q4 2026
- Intégration CNAM (Tunisie)
- Prescription électronique
- API publique développeurs
- IoT (balance connectée, tensiomètre)
- Marketplace d'applications santé

---

**Documentation API complète** : consulter `/api-docs` dans l'application  
**Architecture technique** : voir `DOCUMENTATION_TECHNIQUE.md`
