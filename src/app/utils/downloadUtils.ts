/**
 * downloadUtils — Génération de PDF/impression pour documents patient et rapports radiologues.
 * Utilise window.open + print() : le navigateur propose "Enregistrer en PDF".
 */

import { MedicalDocument } from '../context/PatientDocumentsContext';
import type { LabInfo, RadiologistProfile } from '../context/LabContext';
import type { ReportData } from '../components/radiologist/ReportPreview';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

const PAGE_STYLE = `
  @page { margin: 20mm 22mm; size: A4; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 11.5px; color: #1a1a2e; background: white; line-height: 1.6; }
  h1 { font-size: 15px; } h2 { font-size: 13px; } h3 { font-size: 11px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e2e8f0; padding: 7px 10px; text-align: left; font-size: 11px; }
  th { background: #f8fafc; font-weight: 600; color: #334155; letter-spacing: 0.03em; }
  .section-title { font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
  .section { margin-bottom: 18px; }
  .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 24px; font-size: 8.5px; color: #94a3b8; display: flex; justify-content: space-between; font-family: Arial, sans-serif; }
  .warn { background: #fefce8; border-left: 3px solid #ca8a04; padding: 8px 12px; font-size: 10px; color: #713f12; margin-top: 12px; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
`;
function openPrint(html: string, title: string) {
  const win = window.open('', '_blank', 'width=820,height=960');
  if (!win) {
    alert('Veuillez autoriser les popups pour télécharger ce document.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 450);
}

// ── Patient documents ─────────────────────────────────────────────────────────

function buildOrdonnance(doc: MedicalDocument): string {
  return `
    <div style="font-family: monospace;">
      <div style="border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between;">
        <div>
          <p style="font-weight: bold; font-size: 14px; margin: 0;">${doc.doctor || 'Dr. Médecin Prescripteur'}</p>
          <p style="font-size: 10px; color: #6b7280; margin: 2px 0;">N° RPPS : 10001234567</p>
          <p style="font-size: 10px; color: #6b7280; margin: 0;">Cabinet médical — 12 rue de la Santé, 75014 Paris</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 10px; color: #6b7280; margin: 0;">Date : ${fmt(doc.date)}</p>
          <p style="font-size: 10px; color: #6b7280; margin: 2px 0;">Ordonnance N° 2026-${Math.floor(Math.random() * 9000) + 1000}</p>
        </div>
      </div>
      <div style="margin-bottom: 16px;">
        <p style="font-size: 10px; color: #6b7280; margin: 0 0 4px 0;">Patient(e)</p>
        <p style="font-weight: bold; margin: 0;">Amira Ben Salah</p>
        <p style="font-size: 10px; color: #6b7280; margin: 2px 0;">Née le 15/06/1990 · N° SS : 2 90 06 75 123 456 78</p>
      </div>
      <div style="margin-bottom: 16px;">
        <p style="font-size: 10px; color: #6b7280; margin: 0 0 8px 0;">Motif : ${doc.pathology || 'Traitement médical'}</p>
        <div style="border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; background: #f9fafb;">
          ${doc.notes
            ? `<p style="white-space: pre-wrap; margin: 0;">${doc.notes}</p>`
            : `<p style="margin: 0 0 8px 0;"><strong>Rp/</strong></p>
               <p style="margin-left: 16px; margin-bottom: 4px;">Paracétamol 1000 mg — 1 cp 3x/j pendant 5 jours</p>
               <p style="margin-left: 16px; font-size: 10px; color: #6b7280; margin-bottom: 10px;">Qté : 1 boîte · Non renouvelable</p>
               <p style="margin-left: 16px; margin-bottom: 4px;">Amoxicilline 500 mg — 1 gélule 3x/j pendant 7 jours</p>
               <p style="margin-left: 16px; font-size: 10px; color: #6b7280;">Qté : 1 boîte · Non renouvelable</p>`
          }
        </div>
      </div>
      <div style="border-top: 1px solid #d1d5db; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <p style="font-size: 10px; color: #9ca3af; margin: 0 0 8px 0;">Signature et cachet du médecin</p>
          <div style="width: 120px; height: 48px; border: 1px dashed #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <p style="font-size: 9px; color: #d1d5db; margin: 0;">Signature</p>
          </div>
        </div>
        <p style="font-size: 9px; color: #9ca3af; margin: 0;">Document numérique · Valable 3 mois</p>
      </div>
    </div>
  `;
}

function buildAnalyse(doc: MedicalDocument): string {
  const rows = [
    { param: 'Glycémie à jeun',    val: '5.1',     unit: 'mmol/L', ref: '3.9–6.1',     ok: true },
    { param: 'Hémoglobine',        val: '11.8',    unit: 'g/dL',   ref: '12.0–16.0',   ok: false },
    { param: 'Leucocytes',         val: '7 200',   unit: '/mm³',   ref: '4000–10000',  ok: true },
    { param: 'Plaquettes',         val: '245 000', unit: '/mm³',   ref: '150k–400k',   ok: true },
    { param: 'Créatinine',         val: '72',      unit: 'µmol/L', ref: '44–97',       ok: true },
    { param: 'Cholestérol total',  val: '5.8',     unit: 'mmol/L', ref: '< 5.2',       ok: false },
  ];
  return `
    <div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; color: #6b7280;">
          <span>Laboratoire : BioAnalyse Medical</span>
          <span style="text-align: right;">Date : ${fmt(doc.date)}</span>
          <span>Prescripteur : ${doc.doctor || 'Dr. Médecin'}</span>
          <span style="text-align: right;">Motif : ${doc.pathology || 'Bilan général'}</span>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>Paramètre</th><th>Résultat</th><th>Unité</th><th>Référence</th><th>Statut</th>
        </tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr style="${!r.ok ? 'background: #fef2f2;' : ''}">
              <td style="font-weight: 500;">${r.param}</td>
              <td style="text-align: center; font-weight: bold; color: ${r.ok ? '#15803d' : '#dc2626'};">${r.val}</td>
              <td style="text-align: center; color: #6b7280;">${r.unit}</td>
              <td style="text-align: center; color: #6b7280;">${r.ref}</td>
              <td style="text-align: center; color: ${r.ok ? '#15803d' : '#dc2626'}; font-weight: 500;">${r.ok ? '✓ Normal' : '↓ Bas'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-size: 9px; color: #9ca3af; text-align: center; margin-top: 10px;">Résultats à interpréter par votre médecin dans le contexte clinique global</p>
    </div>
  `;
}

function buildRapportIA(doc: MedicalDocument): string {
  const sections = [
    { title: 'I. Indication clinique', content: `${doc.pathology || 'Examen de contrôle'}.` },
    { title: 'II. Technique', content: 'Acquisition selon protocole standard. Traitement et reconstruction des données selon les paramètres d\'acquisition.' },
    { title: 'III. Résultats', content: 'Structure principale dans les limites de la normale.\nDensité et signal homogènes, sans anomalie focale décelable.\n\n' + (doc.notes || 'Aucune anomalie significative identifiée sur les séquences analysées.') },
    { title: 'IV. Conclusion', content: 'Examen sans particularité notable dans les limites de l\'analyse effectuée. Une corrélation clinique est recommandée.' },
  ];
  return `
    <div>
      ${sections.map(s => `
        <div class="section">
          <p class="section-title">${s.title}</p>
          <p style="white-space: pre-wrap; color: #1e293b; margin: 0; font-size: 11.5px;">${s.content}</p>
        </div>
      `).join('')}
      <hr class="divider" />
      <div class="warn">⚠️ Ce document est fourni à titre informatif. Il ne se substitue pas à l'avis d'un professionnel de santé qualifié.</div>
    </div>
  `;
}
function buildGeneric(doc: MedicalDocument): string {
  return `
    <div>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Médecin : ${doc.doctor || '—'}</p>
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Pathologie : ${doc.pathology || '—'}</p>
        ${doc.notes ? `<p style="font-size: 11px; color: #6b7280; margin: 0;">Notes : ${doc.notes}</p>` : ''}
      </div>
      <p style="font-size: 11px; color: #374151; line-height: 1.6;">
        Document médical généré et archivé dans le dossier de santé numérique Laura AI.
      </p>
    </div>
  `;
}

function buildImagingNotice(doc: MedicalDocument): string {
  return `
    <div style="text-align: center; padding: 32px 16px; border: 2px dashed #e5e7eb; border-radius: 8px;">
      <p style="font-size: 40px; margin: 0 0 12px 0;">🩻</p>
      <p style="font-weight: bold; font-size: 13px; margin: 0 0 6px 0;">Document d'imagerie médicale</p>
      <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0;">${doc.pathology || 'Imagerie diagnostique'}</p>
      <p style="font-size: 10px; color: #9ca3af; max-width: 300px; margin: 0 auto; line-height: 1.5;">
        Le fichier DICOM original est disponible en téléchargement.<br/>
        Ouvrez-le avec votre logiciel d'imagerie médicale (OsiriX, RadiAnt, Horos, etc.)
      </p>
    </div>
  `;
}

const TYPE_ICONS: Record<string, string>  = { ordonnance: '💊', analyse: '🔬', imagerie: '🩻', rapport: '📋', certificat: '📜', autre: '📄' };
const TYPE_LABELS: Record<string, string> = { ordonnance: 'Ordonnance', analyse: 'Analyse Biologique', imagerie: 'Imagerie Médicale', rapport: 'Rapport Médical', certificat: 'Certificat Médical', autre: 'Document Médical' };

export function downloadDocumentAsPdf(doc: MedicalDocument) {
  let bodyContent = '';
  if (doc.type === 'imagerie' && !doc.fromScan) bodyContent = buildImagingNotice(doc);
  else if (doc.type === 'rapport' || doc.fromScan)  bodyContent = buildRapportIA(doc);
  else if (doc.type === 'analyse')                   bodyContent = buildAnalyse(doc);
  else if (doc.type === 'ordonnance')                bodyContent = buildOrdonnance(doc);
  else                                               bodyContent = buildGeneric(doc);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${doc.name}</title>
  <style>${PAGE_STYLE}</style>
</head>
<body>
  <!-- En-tête Laura AI -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
    <div>
      <p style="font-size: 18px; font-weight: bold; color: #2563eb; margin: 0;">${TYPE_ICONS[doc.type] || '📄'} ${doc.name}</p>
      <p style="font-size: 10px; color: #6b7280; margin: 3px 0 0 0;">
        ${TYPE_LABELS[doc.type] || 'Document médical'} · ${fmt(doc.date)}
        ${doc.doctor ? ' · ' + doc.doctor : ''}
        ${doc.pathology ? ' · ' + doc.pathology : ''}
      </p>
    </div>
    <div style="text-align: right;">
      <p style="font-size: 11px; font-weight: bold; color: #2563eb; margin: 0;">Laura AI</p>
      <p style="font-size: 9px; color: #9ca3af; margin: 2px 0 0 0;">Carnet de santé numérique</p>
    </div>
  </div>

  <!-- Contenu -->
  ${bodyContent}

  <!-- Pied de page -->
  <div class="footer">
    <span>Exporté le ${today} · Laura AI v2.4</span>
    <span>Chiffrement AES-256 · HDS France · Conforme RGPD Art. 9</span>
  </div>
</body>
</html>`;

  openPrint(html, doc.name);
}

export function printDocumentDirect(doc: MedicalDocument) {
  downloadDocumentAsPdf(doc);
}

// ── Radiologist report ────────────────────────────────────────────────────────

export function downloadReportAsPdf(
  data: ReportData,
  lab: LabInfo,
  profile: RadiologistProfile,
) {
  const dateFmt = data.finalizedAt
    ? new Date(data.finalizedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : today;

  const logoSrc = lab.logoDataUrl || lab.logoUrl || '';
  const logoHtml = logoSrc
    ? `<img src="${logoSrc.replace(/"/g, '&quot;')}" style="height: 56px; width: auto; object-fit: contain;" />`
    : `<div style="width: 56px; height: 56px; background: linear-gradient(135deg,#2563eb,#7c3aed); border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size:24px;">🏥</div>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>CR — ${data.patientName}</title>
  <style>
    ${PAGE_STYLE}
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 11px; }
    .info-label { color: #6b7280; }
    .info-value { color: #1e3a8a; font-weight: bold; }
  </style>
</head>
<body>

  <!-- En-tête cabinet -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e40af; padding-bottom: 14px; margin-bottom: 16px;">
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      ${logoHtml}
      <div>
        <p style="font-weight: bold; font-size: 15px; color: #1e3a8a; margin: 0;">${lab.name}</p>
        <p style="font-size: 10px; color: #6b7280; margin: 2px 0 0 0;">${lab.address}${lab.city ? `, ${lab.postalCode} ${lab.city}` : ''}</p>
        ${lab.phone ? `<p style="font-size: 10px; color: #6b7280; margin: 1px 0 0 0;">Tél : ${lab.phone}${lab.email ? ' · ' + lab.email : ''}</p>` : ''}
        ${lab.website ? `<p style="font-size: 10px; color: #6b7280; margin: 1px 0 0 0;">${lab.website}</p>` : ''}
        ${lab.rpps ? `<p style="font-size: 9px; color: #9ca3af; margin: 2px 0 0 0;">RPPS : ${lab.rpps}${lab.siret ? ' · SIRET : ' + lab.siret : ''}</p>` : ''}
      </div>
    </div>
    <div style="text-align: right; flex-shrink: 0;">
      <p style="font-weight: bold; font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.04em; margin: 0;">Compte-rendu radiologique</p>
      <p style="font-size: 10px; color: #6b7280; margin: 3px 0 0 0;">Date : ${dateFmt}</p>
      <p style="font-size: 9px; color: #9ca3af; margin: 2px 0 0 0;">Généré via Laura AI v2.4</p>
    </div>
  </div>

  <!-- Infos patient -->
  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px;">
    <div class="info-grid">
      <span class="info-label">Patient :</span>      <span class="info-value">${data.patientName}</span>
      <span class="info-label">ID Patient :</span>   <span class="info-value">${data.patientId || '—'}</span>
      <span class="info-label">Modalité :</span>     <span class="info-value">${data.modality}</span>
      <span class="info-label">Indication :</span>   <span class="info-value">${data.pathology}</span>
    </div>
  </div>

  <!-- Rapport -->
  <div style="margin-bottom: 28px;">
    <p style="font-weight: bold; font-size: 10px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #bfdbfe; padding-bottom: 5px; margin-bottom: 10px;">Rapport</p>
    <div style="font-size: 12px; line-height: 1.7; color: #1f2937; white-space: pre-wrap;">${data.content}</div>
  </div>

  <!-- Signature -->
  <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <p style="font-size: 10px; color: #6b7280; margin: 0;">Fait à ${lab.city || '...'}, le ${dateFmt}</p>
      <div style="margin-top: 20px;">
        <div style="width: 130px; height: 44px; border: 1px dashed #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
          <p style="font-size: 9px; color: #d1d5db; margin: 0;">Signature</p>
        </div>
        <p style="font-weight: bold; font-size: 12px; color: #1e3a8a; margin: 7px 0 0 0;">${profile.name}</p>
        <p style="font-size: 10px; color: #6b7280; margin: 1px 0 0 0;">${profile.title}</p>
        <p style="font-size: 9px; color: #9ca3af; margin: 1px 0 0 0;">${profile.specialty}</p>
      </div>
    </div>
    <div style="text-align: center;">
      <div style="width: 52px; height: 52px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 26px;">⬛</div>
      <p style="font-size: 9px; color: #9ca3af; margin: 3px 0 0 0;">QR Code</p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Laura AI · Chiffrement AES-256 · HDS France · Conforme RGPD Art. 9</span>
    <span>${lab.name} · ${new Date().getFullYear()}</span>
  </div>

</body>
</html>`;

  openPrint(html, `CR_${data.patientName}_${data.modality}`);
}

// ── Scan report PDF (from ScanDocument page) ──────────────────────────────────

interface ScanAnalysisResult {
  examType?: string;
  anatomicalRegion?: string;
  confidence: number;
  suggestedName: string;
  suggestedPathology?: string;
  findings: Array<{
    severity: string;
    category: string;
    title: string;
    description: string;
    location?: string;
    measurements?: { size?: string; dimension?: string; volume?: string };
    classification?: string;
    characteristics?: string[];
  }>;
  normalFindings?: string[];
  recommendations: Array<{
    priority: string;
    title: string;
    description: string;
    timeframe?: string;
    action?: string;
  }>;
  technicalDetails?: {
    modality?: string;
    bodyPart?: string;
    slices?: number;
    contrast?: boolean;
  };
  disclaimer: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical:  '#dc2626',
  important: '#ea580c',
  moderate:  '#ca8a04',
  minor:     '#2563eb',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'URGENT',
  high: 'IMPORTANT',
  medium: 'MODÉRÉ',
  low: 'INFO',
};

export function downloadScanAsPdf(
  result: ScanAnalysisResult,
  imageDataUrl: string | null,
  fileName: string,
) {
  const titleLabel = result.examType || result.suggestedName || 'Analyse IA';

  const techRows = result.technicalDetails
    ? `
      <tr><td style="color:#6b7280;">Modalité</td><td style="font-weight:600;">${result.technicalDetails.modality || '—'}</td>
          <td style="color:#6b7280;">Région</td><td style="font-weight:600;">${result.technicalDetails.bodyPart || '—'}</td></tr>
      <tr><td style="color:#6b7280;">Coupes</td><td style="font-weight:600;">${result.technicalDetails.slices ?? '—'}</td>
          <td style="color:#6b7280;">Produit de contraste</td><td style="font-weight:600;">${result.technicalDetails.contrast ? 'Oui' : 'Non'}</td></tr>
    `
    : '';

  const findingsHtml = result.findings.map(f => `
    <div style="border-left: 4px solid ${SEVERITY_COLORS[f.severity] || '#6b7280'}; padding: 10px 14px; margin-bottom: 12px; background: #f9fafb; border-radius: 0 6px 6px 0;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <p style="font-size:10px; color:#6b7280; margin:0 0 2px 0;">${f.category}</p>
          <p style="font-weight:bold; font-size:12px; margin:0;">${f.title}</p>
        </div>
        ${f.classification ? `<span style="background:#ede9fe; color:#7c3aed; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600; flex-shrink:0;">${f.classification}</span>` : ''}
      </div>
      <p style="margin:6px 0 0 0; font-size:11px; color:#374151;">${f.description}</p>
      ${f.location ? `<p style="margin:4px 0 0 0; font-size:10px; color:#6b7280;"><strong>Localisation :</strong> ${f.location}</p>` : ''}
      ${f.measurements && (f.measurements.size || f.measurements.dimension) ? `
        <div style="background:#f3f4f6; border-radius:4px; padding:6px 10px; margin-top:6px; font-size:10px;">
          <strong>Mesures :</strong>
          ${f.measurements.size ? ` Taille : <strong>${f.measurements.size}</strong>` : ''}
          ${f.measurements.dimension ? ` &nbsp;·&nbsp; Dimensions : <strong>${f.measurements.dimension}</strong>` : ''}
          ${f.measurements.volume ? ` &nbsp;·&nbsp; Volume : <strong>${f.measurements.volume}</strong>` : ''}
        </div>
      ` : ''}
      ${f.characteristics?.length ? `
        <ul style="margin:6px 0 0 0; padding-left:16px; font-size:10px; color:#4b5563;">
          ${f.characteristics.map(c => `<li style="margin-bottom:2px;">${c}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');

  const normalHtml = result.normalFindings?.length
    ? `
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 16px; margin-bottom:16px;">
        <p style="font-weight:600; color:#166534; font-size:11px; margin:0 0 8px 0;">✓ Résultats normaux</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px 12px;">
          ${result.normalFindings.map(f => `<p style="font-size:10px; color:#15803d; margin:0;">✓ ${f}</p>`).join('')}
        </div>
      </div>
    `
    : '';

  const recoHtml = result.recommendations.map(r => `
    <div style="border-left:4px solid #93c5fd; padding:8px 14px; margin-bottom:10px; background:#f9fafb; border-radius:0 6px 6px 0;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span style="background:#dbeafe; color:#1e40af; padding:1px 7px; border-radius:99px; font-size:9px; font-weight:700;">${PRIORITY_LABELS[r.priority] || r.priority}</span>
        <strong style="font-size:11px;">${r.title}</strong>
      </div>
      <p style="font-size:10px; color:#374151; margin:0;">${r.description}</p>
      ${r.timeframe ? `<p style="font-size:10px; color:#6b7280; margin:3px 0 0 0;"><strong>Délai :</strong> ${r.timeframe}</p>` : ''}
      ${r.action ? `<p style="font-size:10px; color:#2563eb; margin:2px 0 0 0;"><strong>Action :</strong> ${r.action}</p>` : ''}
    </div>
  `).join('');

  const imageHtml = imageDataUrl
    ? `
      <div style="margin-bottom:20px;">
        <p style="font-size:10px; font-weight:600; color:#1e40af; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #bfdbfe; padding-bottom:5px; margin-bottom:10px;">Image scannée — Document original</p>
        <div style="background:#111; border-radius:8px; padding:10px; text-align:center;">
          <img src="${imageDataUrl}" style="max-height:260px; max-width:100%; object-fit:contain; border-radius:4px;" alt="Scan médical" />
        </div>
      </div>
    `
    : '';

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport — ${titleLabel}</title>
  <style>
    ${PAGE_STYLE}
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px 24px; font-size:11px; }
    .info-label { color:#64748b; }
    .info-value { color:#0f172a; font-weight:600; }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:14px; margin-bottom:20px;">
    <div>
      <p style="font-size:18px; font-weight:bold; margin:0; color:#0f172a; letter-spacing:-0.02em;">Rapport d'Analyse Médicale</p>
      <p style="font-size:11px; margin:4px 0 0 0; color:#475569;">${titleLabel}${result.anatomicalRegion ? ' — ' + result.anatomicalRegion : ''}</p>
    </div>
    <div style="text-align:right; flex-shrink:0;">
      <p style="font-weight:bold; color:#0f172a; font-size:11px; margin:0;">Laura AI</p>
      <p style="font-size:9px; color:#94a3b8; margin:3px 0 0 0;">${today}</p>
    </div>
  </div>

  <!-- Technical details -->
  ${techRows ? `
    <div class="section">
      <p class="section-title">Informations techniques</p>
      <div class="info-grid">
        <span class="info-label">Modalité</span><span class="info-value">${result.technicalDetails?.modality || '—'}</span>
        <span class="info-label">Région anatomique</span><span class="info-value">${result.technicalDetails?.bodyPart || '—'}</span>
        <span class="info-label">Nombre de coupes</span><span class="info-value">${result.technicalDetails?.slices ?? '—'}</span>
        <span class="info-label">Produit de contraste</span><span class="info-value">${result.technicalDetails?.contrast ? 'Oui' : 'Non'}</span>
      </div>
    </div>
    <hr class="divider" />
  ` : ''}

  <!-- Scanned image -->
  ${imageHtml}

  <!-- Findings -->
  <div class="section">
    <p class="section-title">Résultats</p>
    ${findingsHtml}
  </div>

  <!-- Normal findings -->
  ${normalHtml}

  <hr class="divider" />

  <!-- Recommendations -->
  <div class="section">
    <p class="section-title">Recommandations</p>
    ${recoHtml}
  </div>

  <!-- Disclaimer -->
  <div class="warn">⚠️ Ce document est fourni à titre informatif. Il ne se substitue pas à l'avis d'un professionnel de santé qualifié.</div>

  <!-- Footer -->
  <div class="footer">
    <span>Rapport généré le ${today} · Laura AI</span>
    <span>Chiffrement AES-256 · HDS France · RGPD Art. 9</span>
  </div>

</body>
</html>`;

  openPrint(html, `Rapport_${result.suggestedName}`);
}