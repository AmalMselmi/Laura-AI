# 📖 Documentation Fonctionnelle - Laura AI

## 🎯 Vue d'ensemble

**Laura AI** est une plateforme de santé numérique intelligente qui permet aux patients de gérer leurs données médicales et aux radiologues de visualiser des images DICOM. La plateforme utilise l'intelligence artificielle pour analyser automatiquement les documents médicaux et fournir des recommandations personnalisées.

### Plateformes Disponibles
- 🌐 **Web** : Application web responsive (mobile-first)
- 📱 **iOS** : Application native (App Store - Production)
- 🤖 **Android** : Application native (Google Play - Production)

---

## 👥 Types d'Utilisateurs

### 1. **Patient** (Gratuit / Premium)
Utilisateur principal qui gère son dossier médical personnel.

**Accès :**
- Scan IA illimité de documents
- Chat IA médical 24/7
- Stockage documents (5GB gratuit / illimité premium)
- Gestion assurance et remboursements
- Historique médical

### 2. **Radiologue** (Professionnel - 49€/mois)
Professionnel de santé qui visualise et analyse des images médicales DICOM.

**Accès :**
- Visualiseur DICOM 3 vues (Coronal, Sagittal, Axial)
- Outils de mesure avancés
- PACS Cloud multi-sites
- Support IA pour détection anomalies
- Partage sécurisé avec patients

---

## 🔐 Authentification et Inscription

### Inscription Patient

**Étapes :**
1. Cliquer sur "Commencer" ou "Créer un compte"
2. Remplir le formulaire :
   - Prénom et nom
   - Email
   - Mot de passe (min 8 caractères, majuscule, chiffre, caractère spécial)
   - Confirmation mot de passe
   - Téléphone (optionnel)
   - Date de naissance
3. Accepter les CGU et politique de confidentialité
4. Valider l'email (lien envoyé)
5. Accès immédiat au dashboard patient

### Inscription Radiologue

**Étapes :**
1. Sélectionner "Compte Professionnel - Radiologue"
2. Remplir le formulaire professionnel :
   - Titre (Dr. / Pr.)
   - Nom complet
   - Spécialité médicale
   - **N° RPPS** (Répertoire Partagé des Professionnels de Santé)
   - Email professionnel
   - Mot de passe sécurisé
   - Nom de la clinique/hôpital
   - Adresse professionnelle complète
3. Cocher l'engagement au secret médical
4. Validation manuelle du compte (24-48h)
5. Accès au dashboard radiologue après validation

### Connexion

**Méthodes :**
- Email + Mot de passe
- Connexion OAuth (Google, Apple - à venir)
- Authentification biométrique sur mobile (Face ID, Touch ID, empreinte digitale)

---

## 📄 Fonctionnalités Patient

### 1. Scanner un Document Médical (IA)

**Objectif :** Extraire automatiquement les informations clés d'un document médical.

**Types de documents supportés :**
- 📋 Ordonnances
- 🩺 Comptes-rendus médicaux (scanner, IRM, radiographie)
- 💉 Résultats d'analyses de sang
- 📝 Courriers médicaux
- 📄 Bulletins d'hospitalisation
- 💊 Notices de médicaments

**Processus :**
1. Cliquer sur "Scanner" dans le menu
2. Choisir un fichier (JPG, PNG, PDF) ou prendre une photo
3. L'IA analyse le document (2-5 secondes)
4. Résultats affichés :
   - **Type d'examen** détecté automatiquement
   - **Région anatomique** identifiée
   - **Résultats détaillés** avec mesures exactes
   - **Classification médicale** (ex: Bosniak IIF pour un kyste rénal)
   - **Niveau de sévérité** (Normal, Attention, Important, Urgent)
   - **Résultats normaux** listés
   - **Recommandations médicales** avec délais et priorités

**Exemple de résultat :**
```
Type : Scanner Abdomino-Pelvien avec injection
Confiance IA : 96%
Région : Abdomen et Pelvis

Résultats Détaillés :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟠 IMPORTANT | Rein gauche
Kyste rénal complexe - Bosniak IIF

Description :
Présence d'un kyste rénal au niveau du rein gauche,
classification Bosniak IIF nécessitant une surveillance.

Localisation : Pôle supérieur du rein gauche
Taille : 2.3 cm (23 x 19 x 21 mm)
Classification : Bosniak IIF

Caractéristiques :
• Kyste légèrement complexe
• Parois fines avec quelques septas
• Légère prise de contraste
• Pas de composante solide

Résultats Normaux :
✓ Reins de taille normale
✓ Voies urinaires non dilatées
✓ Foie, rate, pancréas normaux
✓ Pas d'adénopathie
✓ Absence de lithiase

Recommandations Médicales :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 PRIORITÉ HAUTE
Surveillance radiologique recommandée
Contrôle IRM ou Scanner dans 6 mois pour
s'assurer de la stabilité du kyste Bosniak IIF.
Délai : 6 mois

🟡 PRIORITÉ MOYENNE
Consultation néphrologique
Consulter un néphrologue pour discuter du suivi.
Délai : 4-6 semaines
```

**Actions possibles :**
- 💾 Sauvegarder dans "Mes documents"
- 📤 Partager avec un médecin
- 💬 Discuter avec l'IA
- 📥 Télécharger le rapport (PDF)
- 🗑️ Supprimer

---

### 2. Chat IA Médical 24/7

**Objectif :** Poser des questions sur sa santé et obtenir des réponses basées sur son dossier médical.

**Fonctionnalités :**
- 💬 Conversation naturelle en français
- 🧠 Contexte médical pris en compte (documents scannés)
- ⚡ Réponses instantanées
- 🔒 100% confidentiel et sécurisé
- 📚 Sources médicales citées

**Cas d'usage :**
```
👤 Patient : "C'est quoi un kyste Bosniak IIF ?"

🤖 Laura AI : "Un kyste rénal Bosniak IIF est un kyste
légèrement complexe du rein qui présente quelques 
caractéristiques inhabituelles mais reste probablement 
bénin. La classification Bosniak IIF signifie :

• IIF = catégorie intermédiaire à faible risque
• Nécessite une surveillance tous les 6-12 mois
• 5-10% de risque de malignité
• Pas de chirurgie immédiate nécessaire

Dans votre cas (scan du 15/01/2026), le kyste mesure
2.3 cm avec quelques septas mais sans composante solide,
ce qui est rassurant. Une surveillance IRM dans 6 mois
est recommandée pour confirmer la stabilité."

📚 Sources : Bosniak Classification (2019), 
Radiological Society Guidelines
```

**Exemples de questions :**
- "Quand dois-je refaire mes analyses de sang ?"
- "Quels sont les effets secondaires de mon traitement ?"
- "C'est normal d'avoir encore mal après l'opération ?"
- "Dois-je m'inquiéter de ce résultat ?"

⚠️ **Avertissement :** L'IA ne remplace pas un médecin. En cas d'urgence, contactez le 15 (SAMU).

---

### 3. Mes Documents

**Objectif :** Organiser et retrouver facilement tous ses documents médicaux.

**Fonctionnalités :**
- 📁 Organisation par catégories (Analyses, Imagerie, Ordonnances, Comptes-rendus)
- 🔍 Recherche par mot-clé, date, médecin
- 🏷️ Tags personnalisés
- 📊 Timeline chronologique
- 📤 Partage sécurisé avec médecins
- 📥 Export en PDF ou ZIP
- 🔄 Synchronisation cloud (Web + Mobile)

**Catégories automatiques :**
- 🩸 **Analyses de sang**
- 📸 **Imagerie médicale** (Scanner, IRM, Radio)
- 💊 **Ordonnances**
- 🏥 **Comptes-rendus**
- 💉 **Vaccinations**
- 🦷 **Dentaire**
- 👁️ **Ophtalmologie**
- ➕ **Autres**

**Stockage :**
- Gratuit : 5 GB
- Premium : Illimité

---

### 4. Assurance & Remboursements

**Objectif :** Gérer ses cartes d'assurance et suivre les remboursements en temps réel.

#### 4.1 Cartes d'Assurance

**Ajout d'une carte :**
1. Cliquer sur "Ajouter une carte"
2. Sélectionner le type :
   - 🏛️ Sécurité Sociale (CPAM, CNAM)
   - 🏥 Mutuelle
   - 🏢 Assurance Privée
3. Renseigner les informations :
   - Nom de l'organisme
   - Numéro de carte
   - Taux de couverture
   - Date d'expiration
4. Scanner la carte (recto/verso)
5. Validation automatique des informations (OCR)

**Visualisation :**
- Cartes affichées en format "carte bancaire"
- Couleur par type (Bleu = Sécu, Violet = Mutuelle)
- Statut (Active, Expirée, En attente)
- Taux de couverture visible

**Exemple :**
```
┌─────────────────────────────────┐
│ Sécurité Sociale                │
│ CPAM Paris                      │
│                                 │
│ N° : 1 75 03 75 123 456 78     │
│                                 │
│ Couverture : 70%       [Active] │
└─────────────────────────────────┘
```

#### 4.2 Demandes de Remboursement

**Processus complet :**
1. Cliquer sur "Nouvelle demande"
2. Remplir le formulaire :
   - Type de soins (Consultation, Examen, Médicaments, Hospitalisation)
   - Date des soins
   - Montant payé
   - Description
3. Uploader les documents justificatifs :
   - Feuille de soins
   - Ordonnance
   - Facture
   - Prescription
4. Sélectionner les cartes d'assurance
5. Soumettre la demande

**Traitement automatique :**
- L'IA extrait les informations des documents
- Demande envoyée automatiquement aux organismes
- Suivi en temps réel du statut

**Statuts possibles :**
- 🟡 **En attente** : Demande créée, pas encore envoyée
- 🟠 **En traitement** : Organisme examine la demande
- 🟢 **Remboursé** : Montant versé
- 🔴 **Rejeté** : Demande refusée (raison indiquée)

**Dashboard statistiques :**
```
┌─────────────────────────────────┐
│ Total remboursé ce mois         │
│       171.85€                   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ En attente de traitement        │
│       105.00€                   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Taux de couverture moyen        │
│       85%                       │
└─────────────────────────────────┘
```

**Forfait Premium - Remboursement automatique :**
- Connexion directe Carte Vitale + Mutuelle
- Demandes automatiques après chaque soin
- Remboursement 2x plus rapide
- Notifications push

---

## 🩻 Fonctionnalités Radiologue

### 1. Visualiseur DICOM Professionnel

**Objectif :** Visualiser et analyser des images médicales au format DICOM.

#### Interface 3 Vues

**Layout inspiré de IMAIOS :**
```
┌──────────────────────────────────────────────┐
│ [TOOLBAR] Outils professionnels              │
├──────────┬──────────┬─────────────────────────┤
│ CORONAL  │ SAGITTAL │    AXIAL (MPR)         │
│  VIEW    │   VIEW   │      VIEW              │
│ [Bleu]   │ [Gris]   │    [Vert]              │
│          │          │                         │
│ WW: 400  │ WW: 400  │    WW: 400             │
│ WL: 40   │ WL: 40   │    WL: 40              │
│ SE: 2    │ SE: 3    │    SE: 1               │
│ IM:13/25 │ IM: 1/24 │    IM: 54/307          │
└──────────┴──────────┴─────────────────────────┘
│ [Patient Info] [Modality] [Layout 1x1 2x2 3x3]│
└──────────────────────────────────────────────┘
```

**3 Vues simultanées :**
- **Coronal** : Vue de face (bordure bleue quand sélectionné)
- **Sagittal** : Vue de profil (bordure grise)
- **Axial** : Vue en coupe transversale avec MPR (bordure verte)

**Informations affichées :**
- Nom de la série
- Window Width (WW) et Window Level (WL)
- Numéro de série (SE)
- Position image (IM: x/total)

#### Outils de la Toolbar

**Navigation :**
- 🔍 **Zoom +/-** : Agrandir/réduire l'image
- 🔄 **Rotation** : Pivoter l'image
- ↔️ **Déplacement** : Pan (déplacer dans le viewport)
- 📏 **Scroll** : Naviguer entre les coupes

**Mesures :**
- 📐 **Distance** : Mesurer une distance en mm
- 📐 **Angle** : Mesurer un angle en degrés
- ⭕ **ROI** : Région d'intérêt (calcul densité HU)
- ✏️ **Annotations** : Ajouter du texte
- 🎨 **Dessiner** : Flèches, formes

**Fenêtrage (Window/Level) :**
- Préréglages rapides :
  - Poumon : WW=1500, WL=-600
  - Médiastin : WW=400, WL=40
  - Os : WW=2000, WL=300
  - Cerveau : WW=80, WL=40
- Ajustement manuel par glisser/déposer

**Export & Partage :**
- 📥 **Télécharger** : Export DICOM ou captures PNG
- 📤 **Partager** : Lien sécurisé pour patient/confrère
- 🖨️ **Imprimer** : Rapport avec images sélectionnées
- 💾 **Sauvegarder** : Annotations et mesures

#### Import de Fichiers DICOM

**2 Modes d'import :**

##### Mode 1 : Historique
- Liste de toutes les études DICOM précédemment importées
- Affichage :
  - Nom patient
  - Date de l'étude
  - Modalité (CT, MRI, CR, etc.)
  - Description
  - Nombre de séries
  - Nombre d'images totales
- Tri par date, patient, modalité
- Recherche par nom de patient
- Clic pour ouvrir dans le visualiseur

**Example d'historique :**
```
┌────────────────────────────────────────────────┐
│ [CT] PATIENT, John           15/01/2026        │
│ Abdo-pelv coronal portal                       │
│ 3 séries • 307 images            [Visualiser]  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ [MRI] PATIENT, Sarah         14/01/2026        │
│ Brain MRI with contrast                        │
│ 4 séries • 156 images            [Visualiser]  │
└────────────────────────────────────────────────┘
```

##### Mode 2 : Nouvel Import

**Import local :**
- Glisser/déposer fichiers .dcm ou .dicom
- Multi-fichiers supporté (jusqu'à 500 MB par série)
- Lecture automatique des métadonnées DICOM
- Organisation automatique par série

**Import PACS :**
- Connexion à un serveur PACS externe
- Configuration :
  - Adresse IP:Port
  - AE Title (Application Entity)
  - Authentification (optionnelle)
- Recherche d'études par :
  - Nom patient
  - ID patient
  - Date
  - Modalité
- Import direct depuis le PACS

**Formats supportés :**
- ✅ DICOM standard (.dcm, .dicom)
- ✅ DICOM compressé (JPEG, JPEG2000, RLE)
- ✅ Multi-frame DICOM
- ✅ Toutes modalités : CT, MRI, CR, DX, US, PET, etc.

#### Outils Avancés

**MPR (Multi-Planar Reconstruction) :**
- Génération automatique des vues coronal, sagittal, axial
- Synchronisation entre les 3 vues
- Lignes de référence croisées
- Navigation avec la souris

**IA Intégrée :**
- 🧠 Détection automatique d'anomalies
- 🎯 Segmentation organes
- 📊 Quantification automatique (volumes, densités)
- ⚠️ Alertes sur zones suspectes

**Layouts multiples :**
- 1x1 : Une vue plein écran
- 2x2 : Quatre vues (défaut)
- 3x3 : Neuf vues pour comparaisons
- Personnalisable

---

### 2. PACS Cloud Multi-sites

**Objectif :** Stockage et accès centralisé aux images DICOM.

**Fonctionnalités :**
- ☁️ Stockage illimité dans le cloud
- 🔄 Synchronisation automatique multi-sites
- 🌍 Accès depuis n'importe où (Web, iOS, Android)
- 🔐 Sécurité niveau hospitalier
- 📊 Dashboard d'administration
- 👥 Gestion des droits d'accès
- 🔗 Intégration avec PACS/RIS existants

**Avantages vs PACS traditionnel :**
| Caractéristique | PACS Traditionnel | Laura AI PACS Cloud |
|----------------|-------------------|---------------------|
| Installation | Serveur sur site | Aucune installation |
| Coût initial | 50 000€ - 200 000€ | 49€/mois par praticien |
| Maintenance | Équipe IT dédiée | Incluse |
| Accès distant | VPN complexe | Navigateur web |
| Mise à jour | Manuelle | Automatique |
| Stockage | Limité (disques) | Illimité |

---

## 💰 Forfaits et Tarification

### Patient Gratuit (0€/mois)
✅ Scan IA illimité  
✅ Chat IA médical  
✅ 5 GB de stockage  
✅ Gestion documents  
✅ Remboursement assurance manuel  
✅ Support email  
❌ Stockage illimité  
❌ Partage avec médecins  
❌ Téléconsultation  

### Patient Premium (9.99€/mois)
✅ **Tout du forfait Gratuit**  
✅ **Stockage illimité**  
✅ **Partage sécurisé** avec médecins  
✅ **Téléconsultation** intégrée  
✅ **Remboursement automatique** (Vitale + Mutuelle)  
✅ Analyses IA avancées  
✅ Notifications intelligentes  
✅ Support prioritaire 24/7  
🎁 **14 jours d'essai gratuit**

### Radiologue Professionnel (49€/mois)
✅ **Visualiseur DICOM** complet 3 vues  
✅ **PACS Cloud** multi-sites  
✅ Stockage illimité  
✅ Outils de mesure avancés  
✅ Annotations et rapports  
✅ IA détection d'anomalies  
✅ Partage sécurisé patients  
✅ Support technique dédié  
🎁 **14 jours d'essai gratuit**

### Entreprise (Sur mesure)
Pour hôpitaux, cliniques et centres de radiologie

✅ Déploiement multi-sites  
✅ Intégration PACS/RIS/EMR  
✅ API personnalisée  
✅ Formation sur site  
✅ SLA 99.9%  
✅ Hébergement privatif possible  
✅ Account manager dédié  
🎁 **14 jours d'essai gratuit**

📞 **Contact entreprise** : enterprise@laura-ai.health

---

## 🔒 Sécurité et Confidentialité

### Protection des Données

**Cryptage :**
- 🔐 **End-to-end encryption** (AES-256)
- 🔑 Clés privées jamais stockées côté serveur
- 🛡️ Cryptage des documents au repos et en transit

**Hébergement :**
- 🏥 **Certifié HDS** (Hébergement Données de Santé)
- 🇪🇺 Serveurs en Union Européenne
- ✅ Conformité RGPD totale
- 🔒 ISO 27001 (Sécurité de l'information)

**Accès :**
- 🔐 Authentification forte (2FA disponible)
- 👤 Logs d'accès détaillés
- ⏱️ Sessions expirantes
- 🚫 Aucun partage de données à des tiers

### Droits des Utilisateurs (RGPD)

**Vous avez le droit de :**
- 📖 **Consulter** toutes vos données
- ✏️ **Modifier** vos informations
- 📥 **Télécharger** vos données (format JSON/PDF)
- 🗑️ **Supprimer** votre compte et toutes vos données
- 🚫 **Refuser** le traitement de certaines données
- ⚠️ **Signaler** une violation de données

**Suppression de compte :**
1. Paramètres > Compte > Supprimer mon compte
2. Confirmation par email
3. Suppression immédiate de toutes les données
4. Aucune donnée conservée après 30 jours

---

## 📱 Applications Mobile

### iOS (App Store)

**Fonctionnalités :**
- ✅ Scan documents avec caméra
- ✅ Chat IA médical
- ✅ Notifications push
- ✅ Face ID / Touch ID
- ✅ Mode hors ligne
- ✅ Widget iOS
- ✅ Apple Health Sync

**Téléchargement :**
```
App Store > Rechercher "Laura AI"
ou
https://apps.apple.com/app/laura-ai
```

### Android (Google Play)

**Fonctionnalités :**
- ✅ Scan documents avec caméra
- ✅ Chat IA médical
- ✅ Notifications push
- ✅ Empreinte digitale
- ✅ Mode hors ligne
- ✅ Widget Android
- ✅ Google Fit Sync

**Téléchargement :**
```
Google Play > Rechercher "Laura AI"
ou
https://play.google.com/store/apps/details?id=com.lauraai
```

### Synchronisation Multi-plateformes

**Toutes vos données synchronisées :**
- 📄 Documents scannés
- 💬 Historique chat IA
- 🏥 Cartes d'assurance
- 💰 Demandes de remboursement
- ⚙️ Préférences et paramètres

**Mode hors ligne :**
- Documents récents accessibles sans connexion
- Scan en local, synchronisation automatique à la reconnexion
- Cache intelligent des conversations IA

---

## 🆘 Support et Assistance

### Centre d'Aide

**Accès :**
- Web : https://help.laura-ai.health
- Email : support@laura-ai.health
- Chat en direct (Premium uniquement)

**Base de connaissance :**
- 📚 Plus de 100 articles
- 🎥 Vidéos tutoriels
- ❓ FAQ complète
- 🔍 Recherche intelligente

### Temps de Réponse

| Forfait | Email | Chat en direct | Téléphone |
|---------|-------|---------------|-----------|
| Gratuit | 48h | - | - |
| Premium | 4h | Immédiat | Sur RDV |
| Radiologue | 2h | Immédiat | Ligne dédiée |
| Entreprise | 1h | Immédiat | Account manager |

### Urgences Médicales

⚠️ **IMPORTANT** : Laura AI n'est PAS un service d'urgence.

En cas d'urgence médicale, contactez :
- 🇫🇷 **France** : 15 (SAMU) ou 112
- 🇹🇳 **Tunisie** : 190 (SAMU)
- 🌍 **International** : Numéro d'urgence local

---

## 📊 Cas d'Usage Réels

### Cas 1 : Marie, 35 ans - Suivi grossesse

**Problème :** Marie doit faire plusieurs échographies pendant sa grossesse et a du mal à retrouver les comptes-rendus.

**Solution avec Laura AI :**
1. Scan de chaque compte-rendu d'échographie
2. L'IA extrait automatiquement les mesures du bébé
3. Timeline chronologique du développement
4. Chat IA pour poser des questions sur les résultats
5. Partage facile avec sage-femme et gynécologue

**Résultat :** Toute la grossesse documentée et accessible en un clic.

---

### Cas 2 : Ahmed, 58 ans - Diabète Type 2

**Problème :** Ahmed doit gérer son diabète avec analyses de sang régulières et ajustements de traitement.

**Solution avec Laura AI :**
1. Scan des analyses de sang tous les 3 mois
2. L'IA détecte automatiquement l'HbA1c et la glycémie
3. Graphique d'évolution sur 12 mois
4. Alertes si résultats en dehors des normes
5. Remboursement automatique par la Sécurité Sociale

**Résultat :** Suivi diabète simplifié, pas de papiers perdus.

---

### Cas 3 : Dr. Karim - Radiologue

**Problème :** Dr. Karim travaille dans 3 cliniques différentes et a besoin d'accéder aux images DICOM depuis n'importe où.

**Solution avec Laura AI :**
1. Import de toutes les études DICOM dans le PACS cloud
2. Accès depuis n'importe quelle clinique via navigateur
3. Outils de mesure et annotations professionnels
4. Partage sécurisé des rapports avec patients
5. Backup automatique, aucun risque de perte

**Résultat :** +30% de productivité, plus de déplacements inutiles.

---

## 🚀 Feuille de Route

### T1 2026 (Q1)
- ✅ Lancement version Web
- ✅ Applications iOS et Android
- ✅ Scan IA médical avancé
- ✅ Chat IA 24/7
- ✅ Visualiseur DICOM 3 vues

### T2 2026 (Q2)
- 🔄 Téléconsultation vidéo intégrée
- 🔄 API publique pour développeurs
- 🔄 Intégration Apple Health / Google Fit
- 🔄 Support de 5 langues (EN, AR, IT, ES, DE)

### T3 2026 (Q3)
- 📋 Carnet de vaccination numérique
- 🧬 Intégration résultats génétiques
- 🤖 IA prédictive (risques santé)
- 📊 Dashboard pour médecins traitants

### T4 2026 (Q4)
- 🌍 Expansion internationale (10 pays)
- 🏥 Partenariats hôpitaux publics
- 💊 Suivi médicaments avec alertes
- 📱 Widget smartwatch (Apple Watch, Wear OS)

---

## 📞 Contact

**Support Client**  
📧 Email : support@laura-ai.health  
💬 Chat : Sur l'application (Premium)  
🌐 Web : https://laura-ai.health

**Partenariats et Entreprise**  
📧 Email : enterprise@laura-ai.health  
📞 Tél : +33 (0)1 XX XX XX XX

**Presse et Média**  
📧 Email : press@laura-ai.health

**Réseaux Sociaux**  
🐦 Twitter : @LauraAI_Health  
📘 LinkedIn : Laura AI  
📸 Instagram : @lauraai.health

---

**Version** : 1.0.0  
**Dernière mise à jour** : 3 février 2026  
**Auteur** : Équipe Produit Laura AI

---

© 2026 Laura AI. Tous droits réservés.  
Made with ❤️ for better healthcare.
