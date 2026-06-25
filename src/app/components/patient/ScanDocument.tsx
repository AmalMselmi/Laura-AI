import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Share2,
  Eye,
  ArrowRight,
  Brain,
  Camera,
  Activity,
  ShieldCheck,
  FilePlus,
  FolderOpen,
  Tag,
  Stethoscope,
  Sparkles,
  ImagePlus,
  ScanLine,
  MapPin,
  Layers,
  Contrast,
  Hash,
  CircleCheck,
  CircleAlert,
} from 'lucide-react';
import { usePatientDocuments, type DocumentType } from '../../context/PatientDocumentsContext';
import { useAuth } from '../../context/AuthContext';
import { analyzeScan, analyzeScanMultipart, getScanQuota } from '../../lib/api/scan';
import { ApiError } from '../../lib/api/client';
import { notify, notifyApiError } from '../../lib/notifications';
import { downloadScanAsPdf } from '../../utils/downloadUtils';
import { ScanDocumentCameraModal } from './ScanDocumentCameraModal';

interface AnalysisResult {
  type: 'scanner' | 'irm' | 'radiographie' | 'ordonnance' | 'analyse' | 'autre';
  examType?: string;
  anatomicalRegion?: string;
  confidence: number;
  findings: Finding[];
  normalFindings?: string[];
  recommendations: Recommendation[];
  technicalDetails?: TechnicalDetails;
  disclaimer: string;
  suggestedName: string;
  suggestedPathology?: string;
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

interface TechnicalDetails {
  modality?: string;
  bodyPart?: string;
  slices?: number;
  contrast?: boolean;
  acquisitionDate?: string;
}

interface FileItem {
  file: File;
  preview?: string;
}

const DOC_TYPE_CONFIG: Record<
  DocumentType,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
  }
> = {
  ordonnance: {
    label: 'Ordonnance',
    description: 'Prescription médicale',
    icon: FileText,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  analyse: {
    label: 'Analyse',
    description: 'Résultats biologiques',
    icon: Activity,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  imagerie: {
    label: 'Imagerie',
    description: 'Scanner, IRM, Radio',
    icon: Camera,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  rapport: {
    label: 'Rapport',
    description: 'Compte-rendu médical',
    icon: FolderOpen,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  certificat: {
    label: 'Certificat',
    description: 'Certificat médical',
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  autre: {
    label: 'Autre',
    description: 'Autre document',
    icon: FilePlus,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
};

const ANALYSIS_STEPS = [
  { threshold: 15, text: "Réception et prétraitement de l'image" },
  { threshold: 32, text: 'Identification du type de document' },
  { threshold: 52, text: 'Détection de la région anatomique et modalité' },
  { threshold: 68, text: 'Analyse clinique détaillée des structures' },
  { threshold: 82, text: 'Génération des recommandations médicales' },
  { threshold: 93, text: 'Compilation du rapport final' },
];

function docTypeMatchesApi(sel: DocumentType, api: AnalysisResult['type']): boolean {
  if (sel === 'imagerie') return api === 'scanner' || api === 'irm' || api === 'radiographie';
  if (sel === 'ordonnance') return api === 'ordonnance';
  if (sel === 'analyse') return api === 'analyse';
  if (sel === 'rapport' || sel === 'certificat' || sel === 'autre') return true;
  return false;
}

export function ScanDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addDocument, refresh } = usePatientDocuments();

  const preferMultipart =
    import.meta.env.PROD || import.meta.env.VITE_USE_MULTIPART_SCAN === 'true';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [scanPhase, setScanPhase] = useState<'configure' | 'analyzing' | 'result'>('configure');
  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [pathologyHint, setPathologyHint] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(-1);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const patientLoggedIn = Boolean(user && user.role === 'patient');

  useEffect(() => {
    if (!patientLoggedIn) return;
    const key = 'laura_warn_scan_quota_v1';
    if (sessionStorage.getItem(key)) return;
    void (async () => {
      try {
        const q = await getScanQuota();
        let shown = false;
        if (q.maxScans > 0) {
          const usedRatio = q.scansUsed / q.maxScans;
          if (usedRatio >= 0.8) {
            notify.quotaWarning(
              `Quota scans : environ ${Math.round(usedRatio * 100)} % du mois utilisé (${q.scansUsed} / ${q.maxScans}).`,
            );
            shown = true;
          }
        }
        if (q.aiQuota > 0) {
          const aiRatio = q.aiUsed / q.aiQuota;
          if (aiRatio >= 0.8) {
            notify.quotaWarning(
              `Quota analyses IA : environ ${Math.round(aiRatio * 100)} % utilisé (${q.aiUsed} / ${q.aiQuota}).`,
            );
            shown = true;
          }
        }
        if (shown) sessionStorage.setItem(key, '1');
      } catch {
        /* ignore */
      }
    })();
  }, [patientLoggedIn]);

  const readFileDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result;
        if (typeof res !== 'string') {
          reject(new Error('Lecture fichier impossible'));
          return;
        }
        resolve(res);
      };
      reader.onerror = () => reject(new Error('Lecture fichier impossible'));
      reader.readAsDataURL(file);
    });

  const stripDataUrl = (dataUrl: string): string => {
    const comma = dataUrl.indexOf(',');
    return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  };

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const items: FileItem[] = await Promise.all(
      Array.from(newFiles).map(
        (file) =>
          new Promise<FileItem>((resolve) => {
            if (file.type.startsWith('image/')) {
              const r = new FileReader();
              r.onload = (e) => resolve({ file, preview: e.target?.result as string });
              r.readAsDataURL(file);
            } else {
              resolve({ file });
            }
          }),
      ),
    );
    setFiles((prev) => [...prev, ...items]);
    setAnalysisError(null);
  }, []);

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, j) => j !== i));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const list = e.dataTransfer.files;
    if (list.length) void addFiles(list);
  };

  const mapApiToAnalysis = (raw: {
    type: string;
    examType?: string | null;
    anatomicalRegion?: string | null;
    confidence: number;
    findings: AnalysisResult['findings'];
    normalFindings?: string[] | null;
    recommendations: AnalysisResult['recommendations'];
    technicalDetails?: AnalysisResult['technicalDetails'];
    disclaimer: string;
    suggestedName: string;
    suggestedPathology?: string | null;
  }): AnalysisResult => {
    const t = raw.type.toLowerCase();
    let mapped: AnalysisResult['type'] = 'autre';
    if (t.includes('ordonnance')) mapped = 'ordonnance';
    else if (t.includes('analyse')) mapped = 'analyse';
    else if (t.includes('irm')) mapped = 'irm';
    else if (t.includes('radio')) mapped = 'radiographie';
    else if (t.includes('scanner') || t.includes('ct')) mapped = 'scanner';
    return {
      ...raw,
      type: mapped,
      examType: raw.examType ?? undefined,
      anatomicalRegion: raw.anatomicalRegion ?? undefined,
      normalFindings: raw.normalFindings ?? undefined,
      technicalDetails: raw.technicalDetails ?? undefined,
      suggestedPathology: raw.suggestedPathology ?? undefined,
    };
  };

  const docTypeForSave = (result: AnalysisResult): AnalysisResult['type'] | 'rapport' | 'imagerie' => {
    if (result.type === 'ordonnance') return 'ordonnance';
    if (result.type === 'analyse') return 'analyse';
    if (result.type === 'scanner' || result.type === 'irm' || result.type === 'radiographie')
      return 'imagerie';
    return 'rapport';
  };

  function buildReportContent(result: AnalysisResult, pathologyNote: string): string {
    const lines: string[] = [];
    if (pathologyNote.trim()) {
      lines.push('Contexte saisi par le patient :');
      lines.push(pathologyNote.trim());
      lines.push('');
    }
    lines.push(`Examen : ${result.examType || 'Document médical'}`);
    if (result.anatomicalRegion) lines.push(`Région anatomique : ${result.anatomicalRegion}`);
    lines.push(`Confiance IA : ${result.confidence}%`);
    lines.push(`Date d'analyse : ${new Date().toLocaleDateString('fr-FR')}`);

    if (result.technicalDetails) {
      const td = result.technicalDetails;
      lines.push('');
      lines.push('Détails techniques:');
      if (td.modality) lines.push(`  Modalité : ${td.modality}`);
      if (td.bodyPart) lines.push(`  Région : ${td.bodyPart}`);
      if (td.slices) lines.push(`  Coupes : ${td.slices}`);
      if (td.contrast !== undefined)
        lines.push(`  Produit de contraste : ${td.contrast ? 'Oui' : 'Non'}`);
    }

    lines.push('');
    lines.push('Résultats détaillés:');
    result.findings.forEach((f) => {
      lines.push('');
      lines.push(`[${f.severity.toUpperCase()}] ${f.category} — ${f.title}`);
      lines.push(f.description);
      if (f.location) lines.push(`Localisation : ${f.location}`);
      if (f.measurements) {
        const m = f.measurements;
        const parts = [
          m.size && `Taille : ${m.size}`,
          m.dimension && `Dimensions : ${m.dimension}`,
          m.volume && `Volume : ${m.volume}`,
        ].filter(Boolean);
        if (parts.length) lines.push(`Mesures : ${parts.join(' · ')}`);
      }
      if (f.classification) lines.push(`Classification : ${f.classification}`);
      if (f.characteristics?.length) {
        lines.push('Caractéristiques :');
        f.characteristics.forEach((c) => lines.push(`  • ${c}`));
      }
    });

    if (result.normalFindings?.length) {
      lines.push('');
      lines.push('Résultats normaux:');
      result.normalFindings.forEach((f) => lines.push(`✓ ${f}`));
    }

    lines.push('');
    lines.push('Recommandations médicales:');
    result.recommendations.forEach((r) => {
      lines.push('');
      lines.push(`[${r.priority.toUpperCase()}] ${r.title}`);
      lines.push(r.description);
      if (r.timeframe) lines.push(`Délai : ${r.timeframe}`);
      if (r.action) lines.push(`Action : ${r.action}`);
    });

    lines.push('');
    lines.push('Avertissement médical important:');
    lines.push(result.disclaimer);

    return lines.join('\n');
  };

  const analyzeImage = async (file: File, existingPreview?: string) => {
    setIsAnalyzing(true);
    setScanPhase('analyzing');
    setAnalysisProgress(0);
    setAnalysisStepIndex(-1);
    setAnalysisError(null);
    setPrimaryFile(file);

    const pathologyNote = pathologyHint;

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev >= 92 ? 92 : prev + 4;
        const si = ANALYSIS_STEPS.findIndex((s) => next < s.threshold);
        setAnalysisStepIndex(si === -1 ? ANALYSIS_STEPS.length - 1 : si - 1);
        if (next >= 92) clearInterval(interval);
        return next;
      });
    }, 120);

    try {
      let apiResult: Awaited<ReturnType<typeof analyzeScan>>;
      let dataUrl: string;

      if (patientLoggedIn && preferMultipart) {
        apiResult = await analyzeScanMultipart(file, { auth: true, userId: user!.id });
        dataUrl = existingPreview ?? (await readFileDataUrl(file));
      } else {
        dataUrl = existingPreview ?? (await readFileDataUrl(file));
        const b64 = stripDataUrl(dataUrl);
        apiResult = await analyzeScan(
          {
            fileBase64: b64,
            mimeType: file.type || 'application/octet-stream',
            fileName: file.name,
            userId: patientLoggedIn ? user?.id : undefined,
          },
          { auth: patientLoggedIn },
        );
      }

      const result = mapApiToAnalysis(apiResult);
      setAnalysisResult(result);
      clearInterval(interval);
      setAnalysisProgress(100);
      setAnalysisStepIndex(ANALYSIS_STEPS.length - 1);
      setPreviewUrl(dataUrl);

      const today = new Date().toISOString().slice(0, 10);
      const docName = `Rapport IA — ${result.suggestedName} — ${new Date().toLocaleDateString('fr-FR')}`;
      const reportContent = buildReportContent(result, pathologyNote);
      const imageDataUrl = file.type.startsWith('image/') ? dataUrl : undefined;

      if (patientLoggedIn) {
        if (apiResult.documentId) {
          setSavedDocId(apiResult.documentId);
          void refresh();
          notify.scanSaved();
        } else {
          const id = await addDocument({
            name: docName,
            type: docTypeForSave(result),
            date: today,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            pathology: result.suggestedPathology ?? (pathologyNote.trim() || undefined),
            notes:
              [result.examType || result.type, files.length > 1 ? `${files.length} fichiers (analysé : ${file.name})` : '']
                .filter(Boolean)
                .join(' · '),
            aiAnalyzed: true,
            fromScan: true,
            imageDataUrl,
            fileUrl: file.type === 'application/pdf' ? dataUrl : undefined,
            reportContent,
          });
          setSavedDocId(id);
          notify.scanSaved();
        }
      } else {
        setSavedDocId(null);
      }

      await new Promise((r) => setTimeout(r, 200));
      setScanPhase('result');
    } catch (err) {
      clearInterval(interval);
      notifyApiError(err, 'Analyse impossible');
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Analyse impossible';
      setAnalysisError(msg);
      setAnalysisResult(null);
      setSavedDocId(null);
      setScanPhase('configure');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAnalysis = async () => {
    if (!docType || files.length === 0) return;
    const first = files[0];
    if (files.length > 1) {
      toast.info(
        `L'analyse IA porte sur « ${first.file.name} ». Les autres fichiers servent de référence visuelle dans cette session.`,
      );
    }
    await analyzeImage(first.file, first.preview);
  };

  const handleReset = () => {
    setScanPhase('configure');
    setFiles([]);
    setPreviewUrl(null);
    setPrimaryFile(null);
    setAnalysisResult(null);
    setSavedDocId(null);
    setAnalysisProgress(0);
    setAnalysisStepIndex(-1);
    setAnalysisError(null);
    setDocType(null);
    setPathologyHint('');
  };

  const severityConfig = {
    critical: { border: 'border-red-500', bg: 'bg-red-100', icon: 'text-red-600' },
    important: { border: 'border-orange-500', bg: 'bg-orange-100', icon: 'text-orange-600' },
    moderate: { border: 'border-yellow-500', bg: 'bg-yellow-100', icon: 'text-yellow-600' },
    minor: { border: 'border-blue-500', bg: 'bg-blue-100', icon: 'text-blue-600' },
  };

  const priorityConfig = {
    urgent: { border: 'border-red-500', badge: 'bg-red-100 text-red-800', label: 'URGENT' },
    high: { border: 'border-orange-500', badge: 'bg-orange-100 text-orange-800', label: 'IMPORTANT' },
    medium: { border: 'border-blue-500', badge: 'bg-blue-100 text-blue-800', label: 'MODÉRÉ' },
    low: { border: 'border-gray-300', badge: 'bg-gray-100 text-gray-800', label: 'INFO' },
  };

  const typeMismatch =
    analysisResult && docType && !docTypeMatchesApi(docType, analysisResult.type);

  const watchFindingSummaries =
    analysisResult?.findings.filter((f) => f.severity !== 'minor') ?? [];

  const preventionTips = analysisResult?.recommendations.filter((r) => r.priority === 'low') ?? [];

  const aiStyleRecs = analysisResult?.recommendations.filter((r) => r.priority === 'medium') ?? [];

  const pathologyAuto =
    analysisResult &&
    !pathologyHint.trim() &&
    Boolean(analysisResult.suggestedPathology?.trim());

  // ── Configure (Figma Make flow) ───────────────────────────────────────────
  if (scanPhase === 'configure') {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {showCamera && (
          <ScanDocumentCameraModal
            onCapture={async (f) => {
              setShowCamera(false);
              await addFiles([f]);
            }}
            onClose={() => setShowCamera(false)}
          />
        )}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,application/dicom"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = '';
          }}
          data-testid="patient-scan-file-input"
        />

        <div>
          <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
            Scanner &amp; IA médical
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            Numérisez vos ordonnances et documents médicaux pour une analyse IA. Les résultats sont produits par notre
            modèle connecté (pas une démo statique).
            {patientLoggedIn
              ? ' Connecté : le rapport est enregistré automatiquement après analyse.'
              : ' Sans compte, l’analyse s’affiche mais n’est pas enregistrée.'}
          </p>
        </div>

        {analysisError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{analysisError}</p>
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Tag className="h-4 w-4 text-blue-500" strokeWidth={2} />
            Type de document
            <span className="text-red-500">*</span>
          </h2>
          <p className="mb-4 text-xs text-gray-400">Sélectionnez la catégorie qui correspond le mieux — l’IA affinera le type réel.</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {(Object.keys(DOC_TYPE_CONFIG) as DocumentType[]).map((type) => {
              const cfg = DOC_TYPE_CONFIG[type];
              const Icon = cfg.icon;
              const sel = docType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                    sel
                      ? `${cfg.bg} ${cfg.border}`
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${sel ? cfg.bg : 'bg-white'}`}
                  >
                    <Icon className={`h-4 w-4 ${sel ? cfg.color : 'text-gray-400'}`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-semibold ${sel ? cfg.color : 'text-gray-700'}`}>{cfg.label}</p>
                    <p className="truncate text-xs text-gray-400">{cfg.description}</p>
                  </div>
                  {sel && <CheckCircle className={`ml-auto h-4 w-4 flex-shrink-0 ${cfg.color}`} strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Stethoscope className="h-4 w-4 text-blue-500" strokeWidth={2} />
              Pathologie / motif
            </label>
            <span className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              Optionnel
            </span>
          </div>
          <p className="mb-3 text-xs text-gray-400">
            Ex. : kyste rénal, hernie discale… Laissez vide pour laisser l’IA proposer une piste à partir du document.
          </p>
          <div className="relative">
            <input
              type="text"
              value={pathologyHint}
              onChange={(e) => setPathologyHint(e.target.value)}
              placeholder="Laisser vide pour détection automatique par l’IA…"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {pathologyHint ? (
                <button type="button" onClick={() => setPathologyHint('')} aria-label="Effacer">
                  <X className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                </button>
              ) : (
                <Brain className="h-4 w-4 text-blue-300" strokeWidth={2} />
              )}
            </div>
          </div>
          {!pathologyHint && (
            <p className="mt-2 flex items-center gap-1 text-xs text-blue-500">
              <Brain className="h-3 w-3" strokeWidth={2} />
              L’IA analysera le document et proposera une interprétation structurée.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ImagePlus className="h-4 w-4 text-blue-500" strokeWidth={2} />
            Images / documents
            <span className="text-red-500">*</span>
          </h2>
          <p className="mb-4 text-xs text-gray-400">Importez des images médicales ou des PDF — ou prenez une photo.</p>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100">
                <Upload className="h-5 w-5 text-blue-500" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">Importer des fichiers</p>
                <p className="text-xs text-gray-400">JPG, PNG, PDF, DICOM</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) cameraInputRef.current?.click();
                else setShowCamera(true);
              }}
              className="group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-4 transition-all hover:border-rose-300 hover:bg-rose-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 group-hover:bg-rose-100">
                <Camera className="h-5 w-5 text-rose-500" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">Prendre une photo</p>
                <p className="text-xs text-gray-400">Caméra / Webcam</p>
              </div>
            </button>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <p className="text-xs text-gray-400">
              {isDragging ? '📥 Déposez ici…' : 'Ou glissez-déposez vos fichiers ici'}
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-gray-500">
                {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {files.map((item, idx) => (
                  <div
                    key={`${item.file.name}-${idx}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  >
                    {item.preview ? (
                      <img src={item.preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
                        <FileText className="h-6 w-6 text-gray-400" strokeWidth={2} />
                        <p className="w-full truncate text-center text-xs text-gray-500">{item.file.name}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                      aria-label="Retirer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 transition-all hover:border-blue-300 hover:bg-blue-50"
                >
                  <FilePlus className="h-5 w-5 text-gray-400" strokeWidth={2} />
                  <span className="text-xs text-gray-400">Ajouter</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => void startAnalysis()}
          disabled={!docType || files.length === 0}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-rose-500 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Brain className="h-5 w-5" strokeWidth={2} />
          Analyser avec l’IA
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
        {(!docType || files.length === 0) && (
          <p className="text-center text-xs text-gray-400">
            {!docType ? '↑ Choisissez un type de document' : '↑ Ajoutez au moins un fichier'} pour lancer l’analyse.
          </p>
        )}
      </div>
    );
  }

  // ── Analyzing ─────────────────────────────────────────────────────────────
  if (scanPhase === 'analyzing' && isAnalyzing) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto max-w-md text-center">
            <div className="relative mx-auto mb-6 h-20 w-20">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-blue-600 to-rose-500" />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-rose-500 shadow-lg">
                <Brain className="h-10 w-10 text-white" strokeWidth={2} />
              </div>
              <div
                className="absolute inset-[-6px] animate-spin rounded-[18px] border-2 border-dashed border-blue-300/50"
                style={{ animationDuration: '3s' }}
              />
            </div>

            <h3 className="mb-1 text-lg font-bold text-gray-900">Analyse IA en cours…</h3>
            <p className="mb-6 text-sm text-gray-500">
              {docType && (
                <>
                  Analyse de votre <strong>{DOC_TYPE_CONFIG[docType].label.toLowerCase()}</strong> —{' '}
                  {files.length} fichier{files.length > 1 ? 's' : ''}
                </>
              )}
            </p>

            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-gray-500">Progression</span>
                <span className="font-bold text-blue-600">{analysisProgress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-rose-500 transition-all duration-200"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 text-left text-sm">
              {ANALYSIS_STEPS.map((s, idx) => {
                const done = idx <= analysisStepIndex;
                const active = idx === analysisStepIndex + 1;
                return (
                  <div
                    key={s.threshold}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-300'
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                    ) : active ? (
                      <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    ) : (
                      <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-200" />
                    )}
                    <span>{s.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-left">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-blue-500" strokeWidth={2} />
              <p className="text-xs text-blue-700">
                Vérification et sauvegarde <strong>automatiques</strong> à la fin de l’analyse (compte patient).
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (scanPhase === 'result' && analysisResult && !isAnalyzing) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" data-testid="patient-scan-result">
        {savedDocId && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5"
            data-testid="patient-scan-saved-banner"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-900">Rapport sauvegardé dans vos documents</p>
              <p className="mt-0.5 text-xs text-green-700">Retrouvez-le dans « Mes documents ».</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/patient/documents')}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
            >
              Voir <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        )}

        {typeMismatch && docType && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" strokeWidth={2} />
            <p className="text-xs text-amber-900">
              Vous aviez indiqué « {DOC_TYPE_CONFIG[docType].label} », alors que l’IA classe ce document comme une analyse
              de type <strong>{analysisResult.examType || analysisResult.type}</strong>. Les sections ci-dessous suivent
              l’analyse IA.
            </p>
          </div>
        )}

        {pathologyAuto && analysisResult.suggestedPathology && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <Brain className="h-4 w-4 flex-shrink-0 text-blue-600" strokeWidth={2} />
            <p className="flex-1 text-xs text-blue-700">
              Piste clinique proposée par l’IA : <strong>« {analysisResult.suggestedPathology} »</strong>
            </p>
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              Auto
            </span>
          </div>
        )}

        {previewUrl && primaryFile && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#101828]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0 text-blue-400" strokeWidth={2} />
                <span className="truncate text-sm font-medium text-white">{primaryFile.name}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                aria-label="Fermer l’aperçu"
              >
                <X className="h-4 w-4 text-gray-400" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center justify-center p-4" style={{ minHeight: '200px', maxHeight: '320px' }}>
              {primaryFile.type === 'application/pdf' ? (
                <iframe title="Aperçu PDF" src={previewUrl} className="h-72 w-full rounded-lg bg-white" />
              ) : (
                <img
                  src={previewUrl}
                  alt="Document analysé"
                  className="max-h-72 w-auto rounded-lg object-contain"
                />
              )}
            </div>
          </div>
        )}

        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #155DFC 0%, #FF2056 100%)' }}
        >
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-lg font-bold text-white">Analyse IA complète</span>
                </div>
                <p className="text-sm text-blue-100">
                  {analysisResult.examType || 'Document médical analysé'}
                  {analysisResult.anatomicalRegion ? ` — ${analysisResult.anatomicalRegion}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-4xl font-black leading-none text-white">{analysisResult.confidence}%</div>
                <div className="mt-1 text-xs text-blue-200">Confiance IA</div>
              </div>
            </div>
          </div>
        </div>

        {analysisResult.technicalDetails && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Info className="h-4 w-4 text-blue-600" strokeWidth={2} />
              Détails techniques
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              {analysisResult.technicalDetails.modality && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Layers className="h-3 w-3" strokeWidth={2} />
                    Modalité
                  </p>
                  <p className="font-semibold text-gray-900">{analysisResult.technicalDetails.modality}</p>
                </div>
              )}
              {analysisResult.technicalDetails.bodyPart && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" strokeWidth={2} />
                    Région
                  </p>
                  <p className="font-semibold text-gray-900">{analysisResult.technicalDetails.bodyPart}</p>
                </div>
              )}
              {analysisResult.technicalDetails.slices != null && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Hash className="h-3 w-3" strokeWidth={2} />
                    Coupes
                  </p>
                  <p className="font-semibold text-gray-900">{analysisResult.technicalDetails.slices}</p>
                </div>
              )}
              {analysisResult.technicalDetails.contrast !== undefined && (
                <div>
                  <p className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Contrast className="h-3 w-3" strokeWidth={2} />
                    Contraste
                  </p>
                  <p className="font-semibold text-gray-900">
                    {analysisResult.technicalDetails.contrast ? 'Oui' : 'Non'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {analysisResult.normalFindings && analysisResult.normalFindings.length > 0 && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-green-700" strokeWidth={2} />
              <h4 className="text-sm font-semibold text-green-800">Résultats normaux (extraits)</h4>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {analysisResult.normalFindings.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" strokeWidth={2} />
                  <p className="text-xs text-green-800">{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchFindingSummaries.length > 0 && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-orange-700" strokeWidth={2} />
              <h4 className="text-sm font-semibold text-orange-800">Points à surveiller (résumé)</h4>
            </div>
            <div className="space-y-2">
              {watchFindingSummaries.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-orange-500" strokeWidth={2} />
                  <p className="text-xs font-medium text-orange-800">{f.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 font-bold text-gray-900">Résultats détaillés</h3>
          <div className="space-y-4">
            {analysisResult.findings.map((finding, index) => {
              const sc = severityConfig[finding.severity];
              return (
                <div
                  key={index}
                  className={`rounded-xl border-l-4 ${sc.border} bg-white p-5 shadow-sm`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${sc.bg}`}
                    >
                      <AlertTriangle className={`h-5 w-5 ${sc.icon}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="mb-0.5 text-xs font-medium text-gray-500">{finding.category}</p>
                          <h4 className="font-bold text-gray-900">{finding.title}</h4>
                        </div>
                        {finding.classification && (
                          <span className="flex-shrink-0 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800">
                            {finding.classification}
                          </span>
                        )}
                      </div>
                      <p className="mb-3 text-sm text-gray-700">{finding.description}</p>
                      {finding.location && (
                        <p className="mb-2 text-xs text-gray-600">
                          <span className="font-semibold">Localisation : </span>
                          {finding.location}
                        </p>
                      )}
                      {finding.measurements && (
                        <div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs">
                          <p className="mb-1 font-semibold text-gray-900">Mesures</p>
                          <div className="flex flex-wrap gap-4">
                            {finding.measurements.size && (
                              <span>
                                <span className="text-gray-500">Taille : </span>
                                <strong>{finding.measurements.size}</strong>
                              </span>
                            )}
                            {finding.measurements.dimension && (
                              <span>
                                <span className="text-gray-500">Dimensions : </span>
                                <strong>{finding.measurements.dimension}</strong>
                              </span>
                            )}
                            {finding.measurements.volume && (
                              <span>
                                <span className="text-gray-500">Volume : </span>
                                <strong>{finding.measurements.volume}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {finding.characteristics && finding.characteristics.length > 0 && (
                        <ul className="space-y-1">
                          {finding.characteristics.map((c, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="mt-0.5 text-blue-500">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {aiStyleRecs.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-gray-800">Recommandations IA (priorité modérée)</h3>
            </div>
            <div className="space-y-2">
              {aiStyleRecs.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5"
                >
                  <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-semibold text-blue-900">{rec.title}</p>
                    <p className="text-xs text-blue-800">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysisResult.recommendations.some((r) => r.priority === 'urgent' || r.priority === 'high') && (
          <div>
            <h3 className="mb-3 font-bold text-gray-900">Recommandations médicales (priorité élevée)</h3>
            <div className="space-y-3">
              {analysisResult.recommendations
                .filter((r) => r.priority === 'urgent' || r.priority === 'high')
                .map((rec, index) => {
                  const pc = priorityConfig[rec.priority];
                  return (
                    <div key={index} className={`rounded-xl border-l-4 ${pc.border} bg-white p-5 shadow-sm`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${pc.badge}`}>
                          {pc.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 font-bold text-gray-900">{rec.title}</h4>
                          <p className="mb-2 text-sm text-gray-700">{rec.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs">
                            {rec.timeframe && (
                              <span className="text-gray-500">
                                <strong>Délai :</strong> {rec.timeframe}
                              </span>
                            )}
                            {rec.action && (
                              <span className="text-blue-600">
                                <strong>Action :</strong> {rec.action}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {preventionTips.length > 0 && (
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                💡
              </span>
              <h3 className="text-sm font-semibold">Conseils de prévention & suivi</h3>
            </div>
            <ul className="space-y-1.5">
              {preventionTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-purple-100">
                  <span className="mt-0.5 text-purple-300">•</span>
                  <span>
                    <strong className="text-white">{tip.title}</strong> — {tip.description}
                    {tip.action ? ` (${tip.action})` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" strokeWidth={2} />
            <div>
              <h3 className="mb-1.5 text-sm font-bold text-amber-900">Avertissement médical important</h3>
              <p className="text-xs leading-relaxed text-amber-800">{analysisResult.disclaimer}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() =>
              analysisResult && downloadScanAsPdf(analysisResult, previewUrl, primaryFile?.name || 'rapport')
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-rose-500 px-5 py-3 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            Télécharger PDF
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4" strokeWidth={2} />
            Partager
          </button>
          {savedDocId && (
            <button
              type="button"
              onClick={() => navigate(`/patient/documents/${savedDocId}`)}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <Eye className="h-4 w-4" strokeWidth={2} />
              Voir le rapport complet
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ScanLine className="h-4 w-4" strokeWidth={2} />
            Nouvelle analyse
          </button>
        </div>
      </div>
    );
  }

  return null;
}
