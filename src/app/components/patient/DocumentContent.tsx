/**
 * DocumentContent — renderers réutilisables pour afficher le contenu
 * des différents types de documents médicaux.
 * Utilisé dans DocumentViewer (patient) et SharedDocumentPage (médecin).
 */
import { Brain, AlertTriangle, CheckCircle, Camera, Layers } from 'lucide-react';
import { useSecureFileSrc } from '../../hooks/useSecureFileSrc';
import { MedicalDocument } from '../../context/PatientDocumentsContext';
import { isPdfLikeUrl } from '../../utils/medicalMediaUrl';

// ── Ordonnance ───────────────────────────────────────────────────────────────

export function OrdonnanceContent({ doctor, pathology, notes }: {
  doctor?: string; pathology?: string; notes?: string;
}) {
  return (
    <div className="font-mono text-sm text-gray-800 space-y-5">
      <div className="border-b-2 border-gray-900 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div>
            <p className="font-bold text-base">{doctor || 'Dr. Médecin Prescripteur'}</p>
            <p className="text-xs text-gray-500">N° RPPS : 10001234567</p>
            <p className="text-xs text-gray-500">Cabinet médical — 12 rue de la Santé, 75014 Paris</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-500">Date : {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="text-xs text-gray-500">Ordonnance N° 2026-{Math.floor(Math.random() * 9000) + 1000}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Patient(e)</p>
        <p className="font-semibold">Amira Ben Salah</p>
        <p className="text-xs text-gray-500">Née le 15/06/1990 · Sécu. 2 90 06 75 123 456 78</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Motif : {pathology || 'Traitement médical'}</p>
        {notes ? (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="whitespace-pre-wrap">{notes}</p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3">
            <div>
              <p className="font-semibold">Rp/</p>
              <p className="ml-4">Paracétamol 1000 mg — 1 comprimé 3x/j pendant 5 jours</p>
              <p className="ml-4 text-xs text-gray-500">Qté : 1 boîte · Non renouvelable</p>
            </div>
            <div>
              <p className="ml-4">Amoxicilline 500 mg — 1 gélule 3x/j pendant 7 jours</p>
              <p className="ml-4 text-xs text-gray-500">Qté : 1 boîte · Non renouvelable</p>
            </div>
          </div>
        )}
      </div>
      <div className="pt-4 border-t border-gray-300 flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-400">Signature et cachet du médecin</p>
          <div className="w-32 h-12 border border-dashed border-gray-300 rounded mt-2 flex items-center justify-center">
            <p className="text-xs text-gray-300">Signature</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Document numérique · Valable 3 mois</p>
      </div>
    </div>
  );
}

// ── Imagerie — placeholder ────────────────────────────────────────────────────

export function ImagingContent({ pathology }: { pathology?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <span className="text-5xl mb-4">🩻</span>
      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Document d'imagerie médicale</h3>
      {pathology && (
        <p className="text-xs text-gray-500 mb-3">{pathology}</p>
      )}
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        La visualisation DICOM est réservée aux radiologues. Téléchargez le fichier pour l'ouvrir dans votre logiciel d'imagerie.
      </p>
    </div>
  );
}

// ── Rapport IA (depuis scan) ──────────────────────────────────────────────────

export function ScanReportContent({ doc }: { doc: MedicalDocument }) {
  const { pathology, notes, imageDataUrl, reportContent, fileUrl } = doc;

  const imageRaw =
    imageDataUrl || (fileUrl && !isPdfLikeUrl(fileUrl) ? fileUrl : undefined);
  const pdfRaw = isPdfLikeUrl(fileUrl) ? fileUrl : undefined;
  const imageSrc = useSecureFileSrc(imageRaw);
  const pdfSrc = useSecureFileSrc(pdfRaw);

  // Parse sections from the structured reportContent
  const sections = parseReportSections(reportContent);

  return (
    <div className="space-y-5">

      {/* Scanned image — prefer stored file URL (S3/local), fallback inline data URL */}
      {imageSrc && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700">
            <Camera className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-300 font-medium">Image scannée — Document original</span>
          </div>
          <div className="p-3 flex justify-center">
            <img
              src={imageSrc}
              alt="Document médical scanné"
              className="max-h-80 w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {pdfSrc && (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
            <Camera className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-700 font-medium">Document PDF — aperçu</span>
          </div>
          <iframe title="PDF" src={pdfSrc} className="w-full h-[28rem]" />
        </div>
      )}

      {/* IA banner */}
      <div className="bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5" />
          <h3 className="font-bold">Rapport généré par Laura AI</h3>
        </div>
        <p className="text-blue-100 text-xs">{pathology || notes || 'Analyse médicale IA'}</p>
      </div>

      {/* Structured report */}
      {reportContent ? (
        <div className="space-y-4">
          {sections.map((section, i) => (
            <SectionBlock key={i} title={section.title} content={section.content} index={i} />
          ))}
        </div>
      ) : (
        // Fallback if no reportContent (old docs)
        <div className="space-y-4">
          {[
            { title: 'I. Indication clinique', content: `${pathology || 'Examen de contrôle'} — Analyse IA réalisée à la demande du patient.` },
            { title: 'II. Technique d\'acquisition', content: 'Acquisition selon protocole standard. Analyse algorithmique avec segmentation automatique.' },
            { title: 'III. Résultats', content: notes || 'Aucune anomalie majeure détectée.' },
            { title: 'IV. Conclusion', content: 'Rapport préliminaire IA — confiance 96 %. Validation radiologique recommandée.' },
          ].map((s, i) => (
            <SectionBlock key={i} title={s.title} content={s.content} index={i} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Ce rapport est généré par IA et <strong>ne remplace pas</strong> l'avis d'un médecin radiologue qualifié (RGPD Art. 22).
        </p>
      </div>
    </div>
  );
}

// ── Section block sub-component ──────────────────────────────────────────────

const SECTION_COLORS = [
  'border-blue-300',
  'border-purple-300',
  'border-green-300',
  'border-orange-300',
  'border-rose-300',
];

function SectionBlock({ title, content, index }: { title: string; content: string; index: number }) {
  return (
    <div className={`border-l-4 ${SECTION_COLORS[index % SECTION_COLORS.length]} pl-4`}>
      <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h4>
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-xs">{content}</p>
    </div>
  );
}

// ── Parser: splits reportContent text into titled sections ────────────────────

function parseReportSections(reportContent?: string): { title: string; content: string }[] {
  if (!reportContent) return [];

  const sections: { title: string; content: string }[] = [];
  const lines = reportContent.split('\n');

  // Group: section headers are lines ending with ":" or lines with "===" markers
  const sectionHeaders = [
    'Détails techniques:', 'Résultats détaillés:', 'Résultats normaux:',
    'Recommandations médicales:', 'Avertissement médical important:',
  ];

  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeader = sectionHeaders.some(h => trimmed === h) || (trimmed.startsWith('===') && trimmed.endsWith('==='));

    if (isHeader) {
      if (currentTitle && currentLines.some(l => l.trim())) {
        sections.push({ title: formatSectionTitle(currentTitle), content: currentLines.join('\n').trim() });
      }
      currentTitle = trimmed.replace(/:/g, '').replace(/===/g, '').trim();
      currentLines = [];
    } else if (trimmed) {
      currentLines.push(line);
    }
  }

  if (currentTitle && currentLines.some(l => l.trim())) {
    sections.push({ title: formatSectionTitle(currentTitle), content: currentLines.join('\n').trim() });
  }

  // If parsing failed, return the whole content as one section
  if (sections.length === 0 && reportContent.trim()) {
    return [{ title: 'Rapport IA complet', content: reportContent.trim() }];
  }

  return sections;
}

function formatSectionTitle(t: string): string {
  const map: Record<string, string> = {
    'Détails techniques': 'I. Détails techniques',
    'Résultats détaillés': 'II. Résultats détaillés',
    'Résultats normaux': 'III. Résultats normaux',
    'Recommandations médicales': 'IV. Recommandations',
    'Avertissement médical important': '⚠️ Avertissement',
  };
  return map[t] || t;
}

// ── Analyse biologique ───────────────────────────────────────────────────────

export function AnalyseContent({ pathology }: { pathology?: string }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-500">
          <span>Laboratoire : BioAnalyse Tunis</span>
          <span className="sm:text-right">Date : {new Date().toLocaleDateString('fr-FR')}</span>
          <span>Médecin prescripteur : Dr. Mehdi Trabelsi</span>
          <span className="sm:text-right">Motif : {pathology || 'Bilan général'}</span>
        </div>
      </div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-collapse text-xs min-w-[400px]">
          <thead>
            <tr className="bg-gray-100">
              {['Paramètre', 'Résultat', 'Unité', 'Référence', 'Statut'].map(h => (
                <th key={h} className="text-left p-2.5 font-semibold text-gray-600 border border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { param: 'Glycémie à jeun', val: '5.1', unit: 'mmol/L', ref: '3.9–6.1', ok: true },
              { param: 'Hémoglobine', val: '11.8', unit: 'g/dL', ref: '12.0–16.0', ok: false },
              { param: 'Leucocytes', val: '7 200', unit: '/mm³', ref: '4000–10000', ok: true },
              { param: 'Plaquettes', val: '245 000', unit: '/mm³', ref: '150k–400k', ok: true },
              { param: 'Créatinine', val: '72', unit: 'µmol/L', ref: '44–97', ok: true },
              { param: 'Cholestérol total', val: '5.8', unit: 'mmol/L', ref: '< 5.2', ok: false },
            ].map(row => (
              <tr key={row.param} className={`border-b border-gray-200 ${!row.ok ? 'bg-red-50' : ''}`}>
                <td className="p-2.5 border border-gray-200 font-medium text-gray-900">{row.param}</td>
                <td className={`p-2.5 border border-gray-200 text-center font-bold ${row.ok ? 'text-green-700' : 'text-red-700'}`}>{row.val}</td>
                <td className="p-2.5 border border-gray-200 text-center text-gray-500">{row.unit}</td>
                <td className="p-2.5 border border-gray-200 text-center text-gray-500">{row.ref}</td>
                <td className="p-2.5 border border-gray-200 text-center">
                  {row.ok
                    ? <span className="text-green-600 font-medium">✓ Normal</span>
                    : <span className="text-red-600 font-medium">↓ Bas</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 text-center">Résultats à interpréter par votre médecin dans le contexte clinique global</p>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

export function renderDocumentContent(doc: MedicalDocument) {
  // Scan documents: show image + full IA report
  if (doc.fromScan || (doc.type === 'rapport' && doc.aiAnalyzed)) {
    return <ScanReportContent doc={doc} />;
  }
  if (doc.type === 'imagerie') {
    return <ImagingContent pathology={doc.pathology} />;
  }
  if (doc.type === 'analyse') {
    return <AnalyseContent pathology={doc.pathology} />;
  }
  return <OrdonnanceContent doctor={doc.doctor} pathology={doc.pathology} notes={doc.notes} />;
}
