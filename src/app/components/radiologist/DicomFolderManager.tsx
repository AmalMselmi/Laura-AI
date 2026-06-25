import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  FolderOpen, Plus, Upload, FileText, User, Tag, Clock,
  Brain, Edit3, Check, Download, Trash2, X, ChevronRight,
  AlertCircle, CheckCircle, Eye, Save, RefreshCw,
  Printer, Search, Share2, Link2, Copy, Send,
  Building2, ExternalLink, Shield, PenLine, Sparkles,
  Server,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import {
  shareRadiologistDicomFolder,
  listRadiologistDicomFolders,
  createRadiologistDicomFolder,
  uploadRadiologistDicomFiles,
  generateRadiologistDicomReport,
  updateRadiologistDicomReport,
  deleteRadiologistDicomFile,
  getRadiologistStorageQuota,
} from '../../lib/api/radiologist';
import { notify, notifyApiError } from '../../lib/notifications';
import type { DicomFolderApi } from '../../types/api';
import { ReportPreview, ReportData } from './ReportPreview';
import { PacsImportModal } from './PacsImportModal';
import { downloadReportAsPdf } from '../../utils/downloadUtils';

interface DicomFile {
  id: string; name: string; size: number; uploadDate: Date; modality: string;
}

interface PatientFolder {
  id: string;
  patientName: string;
  patientId: string;
  pathology: string;
  createdAt: Date;
  modality: string;
  files: DicomFile[];
  reportContent?: string;
  reportStatus: 'none' | 'generating' | 'ai_generated' | 'in_review' | 'finalized';
  shareToken?: string;
  pacsImported?: boolean;
  pacsStudyUID?: string;
  finalizedAt?: string;
  updatedAt?: string;
}

const MODALITIES = ['IRM', 'Scanner/TDM', 'Radiographie', 'Échographie', 'PET Scan', 'Mammographie'];

function mapDicomFolderFromApi(api: DicomFolderApi): PatientFolder {
  return {
    id: api.id,
    patientName: api.patientName,
    patientId: api.patientId ?? '',
    pathology: api.pathology ?? '',
    modality: api.modality ?? '',
    createdAt: new Date(api.createdAt),
    files: (api.files ?? []).map(f => ({
      id: f.id,
      name: f.name,
      size: f.sizeBytes ?? 0,
      uploadDate: new Date(f.uploadDate),
      modality: f.modality ?? '',
    })),
    reportContent: api.reportContent ?? undefined,
    reportStatus: api.reportStatus,
    shareToken: api.shareToken ?? undefined,
    pacsImported: api.pacsImported,
    pacsStudyUID: api.pacsStudyUID ?? undefined,
    finalizedAt: api.finalizedAt ?? undefined,
    updatedAt: api.updatedAt,
  };
}

const formatSize = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

// ── Share Modal (rapport) ────────────────────────────────────────────────────

function ShareReportModal({ folder, reportContent, onClose, onShareToken }: {
  folder: PatientFolder;
  reportContent: string;
  onClose: () => void;
  onShareToken?: (token: string) => void;
}) {
  const { lab, profile }  = useLab();
  const navigate          = useNavigate();

  const existingToken = folder.shareToken;
  const [token, setToken]     = useState(existingToken || '');
  const [audience, setAudience] = useState<'patient' | 'doctor'>('patient');
  const [copied, setCopied]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const shareUrl = token ? `${window.location.origin}/shared/${token}` : '';

  const handleGenerate = async () => {
    setGenerateError(null);
    setGenerating(true);
    try {
      const res = await shareRadiologistDicomFolder(folder.id, {
        label: `CR ${folder.patientName} — ${folder.pathology}`,
        lab: {
          name: lab.name,
          address: lab.address,
          postalCode: lab.postalCode,
          city: lab.city,
          country: lab.country,
          phone: lab.phone,
          email: lab.email,
          website: lab.website,
          rpps: lab.rpps,
          siret: lab.siret,
          logoDataUrl: lab.logoDataUrl,
          logoUrl: lab.logoUrl,
        },
        radiologistTitle: profile.title,
        radiologistSpecialty: profile.specialty,
      });
      setToken(res.token);
      onShareToken?.(res.token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Impossible de créer le lien.';
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); }
    catch { const el = document.createElement('textarea'); el.value = shareUrl; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePreview = () => { onClose(); navigate(`/shared/${token}`); };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-500 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Partager le rapport</h2>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{folder.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Audience selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destinataire</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAudience('patient')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${audience === 'patient' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <User className="w-4 h-4" />
                Patient
              </button>
              <button
                onClick={() => setAudience('doctor')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${audience === 'doctor' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <Send className="w-4 h-4" />
                Médecin externe
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              {audience === 'patient'
                ? 'Le patient recevra un lien pour consulter son compte-rendu de manière sécurisée.'
                : 'Le médecin traitant pourra consulter le rapport complet avec l\'en-tête du cabinet.'}
            </p>
          </div>

          {generateError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{generateError}</span>
            </div>
          )}

          {!token ? (
            <button
              type="button"
              disabled={generating}
              onClick={() => void handleGenerate()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {generating ? 'Création…' : 'Générer le lien de partage'}
            </button>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">Lien actif — valable 30 jours</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lien à envoyer</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 overflow-hidden">
                    <p className="text-xs font-mono text-gray-700 truncate">{shareUrl}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handlePreview}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Aperçu
                </button>
                <button
                  type="button"
                  disabled={generating}
                  onClick={() => void handleGenerate()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} /> Nouveau lien
                </button>
              </div>
            </>
          )}

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Accès <strong>lecture seule</strong>. Le rapport inclut l'en-tête du cabinet avec logo. Conforme RGPD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Folder Detail ─────────────────────────────────────────────────────────────

function FolderDetail({ folder, onBack, onUpdate, pullFolderState }: {
  folder: PatientFolder;
  onBack: () => void;
  onUpdate: (f: PatientFolder) => void;
  pullFolderState: (id: string) => Promise<PatientFolder | null>;
}) {
  const { lab, profile }  = useLab();
  const [cur, setCur]     = useState(folder);
  const [draft, setDraft] = useState(cur.reportContent || '');
  const [mode, setMode]   = useState<'view' | 'edit' | 'manual'>('view');
  const [aiLoading, setAiLoading] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [saveErr, setSaveErr]   = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showShare, setShowShare]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyMapped = (m: PatientFolder) => {
    setCur(m);
    onUpdate(m);
  };

  useEffect(() => {
    if (mode === 'edit' || mode === 'manual') return;
    setCur(folder);
    setDraft(folder.reportContent || '');
  }, [folder.id, folder.updatedAt, folder.reportStatus, mode]);

  useEffect(() => {
    if (cur.reportStatus !== 'generating') return;
    const t = setInterval(() => { void pullFolderState(cur.id).then(u => { if (u) applyMapped(u); }); }, 1000);
    return () => clearInterval(t);
  }, [cur.reportStatus, cur.id, pullFolderState]);

  const handleGenerateAI = async () => {
    setSaveErr(null);
    setAiLoading(true);
    try {
      await generateRadiologistDicomReport(cur.id);
      const u = await pullFolderState(cur.id);
      if (u) applyMapped(u);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Échec génération IA');
      const u = await pullFolderState(cur.id);
      if (u) applyMapped(u);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaveErr(null);
    try {
      const api = await updateRadiologistDicomReport(cur.id, { reportContent: draft, finalize: false });
      applyMapped(mapDicomFolderFromApi(api));
      setMode('view');
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Sauvegarde impossible');
    }
  };

  const handleFinalize = async () => {
    setSaveErr(null);
    try {
      const api = await updateRadiologistDicomReport(cur.id, { reportContent: draft, finalize: true });
      applyMapped(mapDicomFolderFromApi(api));
      setMode('view');
      notify.reportFinalized();
    } catch (e) {
      notifyApiError(e, 'Finalisation impossible');
      setSaveErr(e instanceof Error ? e.message : 'Finalisation impossible');
    }
  };

  const finalizeFromView = async () => {
    setSaveErr(null);
    try {
      const content = cur.reportContent || '';
      const api = await updateRadiologistDicomReport(cur.id, { reportContent: content, finalize: true });
      applyMapped(mapDicomFolderFromApi(api));
      notify.reportFinalized();
    } catch (e) {
      notifyApiError(e, 'Finalisation impossible');
      setSaveErr(e instanceof Error ? e.message : 'Finalisation impossible');
    }
  };

  const addFiles = async (files: File[]) => {
    const picked = files.filter(f => /\.(dcm|dicom|jpg|jpeg|png|pdf|nii|gz)$/i.test(f.name));
    if (!picked.length) return;
    setFileBusy(true);
    setSaveErr(null);
    try {
      const api = await uploadRadiologistDicomFiles(cur.id, picked);
      applyMapped(mapDicomFolderFromApi(api));
    } catch (e) {
      notifyApiError(e, 'Envoi des fichiers échoué');
      setSaveErr(e instanceof Error ? e.message : 'Envoi des fichiers échoué');
    } finally {
      setFileBusy(false);
    }
  };

  const removeFile = async (fileId: string) => {
    setFileBusy(true);
    setSaveErr(null);
    try {
      const api = await deleteRadiologistDicomFile(cur.id, fileId);
      applyMapped(mapDicomFolderFromApi(api));
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Suppression impossible');
    } finally {
      setFileBusy(false);
    }
  };

  const statusBadge = () => {
    const s = cur.reportStatus;
    if (s === 'none')         return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Aucun rapport</span>;
    if (s === 'generating')   return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Génération IA...</span>;
    if (s === 'ai_generated') return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"><Brain className="w-3 h-3" />IA généré</span>;
    if (s === 'in_review')    return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs flex items-center gap-1"><Edit3 className="w-3 h-3" />En révision</span>;
    if (s === 'finalized')    return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />Finalisé</span>;
  };

  const reportData: ReportData = {
    patientName: cur.patientName,
    patientId: cur.patientId,
    pathology: cur.pathology,
    modality: cur.modality,
    content: cur.reportContent || draft,
    finalizedAt: cur.reportStatus === 'finalized' ? (cur.finalizedAt || new Date().toISOString()) : undefined,
  };

  const hasReport = cur.reportStatus !== 'none' && cur.reportStatus !== 'generating';

  return (
    <div className="space-y-5">
      {showPreview && (
        <ReportPreview
          data={reportData}
          lab={lab}
          profile={profile}
          asModal
          onClose={() => setShowPreview(false)}
        />
      )}
      {showShare && (
        <ShareReportModal
          folder={cur}
          reportContent={cur.reportContent || draft}
          onClose={() => setShowShare(false)}
          onShareToken={(t) => update({ shareToken: t })}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-0.5 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex-shrink-0 text-sm">
          ← Retour
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-gray-900">{cur.patientName}</h2>
            {statusBadge()}
          </div>
          <p className="text-xs text-gray-500 truncate">{cur.patientId} · {cur.pathology} · {cur.modality}</p>
        </div>
      </div>

      {saveErr && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{saveErr}</span>
        </div>
      )}

      {/* ── Files ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4 text-blue-600" />
          Fichiers du dossier
          <span className="text-xs font-normal text-gray-400">({cur.files.length})</span>
        </h3>
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); void addFiles(Array.from(e.dataTransfer.files)); }}
          onClick={() => !fileBusy && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all mb-3 ${fileBusy ? 'opacity-60 pointer-events-none' : 'cursor-pointer'} ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
        >
          <input
            ref={fileRef}
            data-testid="dicom-file-input"
            type="file"
            multiple
            accept=".dcm,.dicom,.jpg,.jpeg,.png,.pdf,.nii,.gz"
            className="hidden"
            disabled={fileBusy}
            onChange={e => { const fl = e.target.files; if (fl) void addFiles(Array.from(fl)); e.target.value = ''; }}
          />
          <Upload className={`w-6 h-6 mx-auto mb-1.5 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-xs font-medium text-gray-600">{isDragging ? 'Déposez ici' : 'Ajouter des fichiers DICOM'}</p>
          <p className="text-xs text-gray-400 mt-0.5">DCM, IMG, PDF, NIfTI</p>
        </div>
        {cur.files.length > 0 ? (
          <div className="space-y-2">
            {cur.files.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.modality} · {formatSize(f.size)}</p>
                </div>
                <button type="button" disabled={fileBusy} onClick={() => void removeFile(f.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">Aucun fichier importé</p>
        )}
      </div>

      {/* ── Report section ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-purple-600" />
            Compte-rendu radiologique
          </h3>
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {cur.reportStatus === 'none' && (
              <>
                <button
                  onClick={() => { setMode('manual'); setDraft(''); }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 text-xs font-medium transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Rédiger
                </button>
                <button
                  type="button"
                  data-testid="dicom-generate-ai-btn"
                  onClick={() => void handleGenerateAI()}
                  disabled={cur.files.length === 0 || aiLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 text-xs font-medium disabled:opacity-50 transition-opacity shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLoading ? 'Démarrage…' : 'Générer IA'}
                </button>
                {cur.files.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Importez des fichiers pour l'IA</p>
                )}
              </>
            )}
            {hasReport && mode === 'view' && (
              <button
                onClick={() => { setMode('edit'); setDraft(cur.reportContent || ''); }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Generating state */}
        {cur.reportStatus === 'generating' && (
          <div className="flex flex-col items-center py-12 text-purple-600">
            <Brain className="w-12 h-12 mb-3 animate-pulse" />
            <p className="font-semibold text-sm">Analyse IA en cours...</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">Traitement des images par Laura AI</p>
            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {cur.reportStatus === 'none' && mode !== 'manual' && (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun rapport</p>
            <p className="text-xs mt-1">Rédigez manuellement ou générez avec l'IA</p>
          </div>
        )}

        {/* Manual / Edit editor */}
        {(mode === 'manual' || mode === 'edit') && cur.reportStatus !== 'generating' && (
          <div className="space-y-3">
            {cur.reportStatus === 'ai_generated' && mode === 'edit' && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Rapport IA — relisez et corrigez avant de finaliser.</p>
              </div>
            )}
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={16}
              placeholder="Rédigez votre compte-rendu radiologique ici...

I. INDICATION CLINIQUE
...

II. TECHNIQUE
...

III. RÉSULTATS
...

IV. CONCLUSION
..."
              className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-y bg-white font-mono leading-relaxed"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setMode('view'); if (cur.reportStatus === 'none') { /* stay none */ } }}
                className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={!draft.trim()}
                className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Sauvegarder
              </button>
              <button
                type="button"
                data-testid="dicom-finalize-btn"
                onClick={() => void handleFinalize()}
                disabled={!draft.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Finaliser le rapport
              </button>
            </div>
          </div>
        )}

        {/* Report view */}
        {hasReport && mode === 'view' && (
          <>
            {cur.reportStatus === 'ai_generated' && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 text-xs">Rapport IA — Validation requise</p>
                  <p className="text-xs text-amber-700 mt-0.5">Relisez, corrigez si nécessaire, puis finalisez avant transmission.</p>
                </div>
              </div>
            )}
            {cur.reportStatus === 'finalized' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-green-900">Rapport finalisé et validé</p>
              </div>
            )}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono leading-relaxed">{cur.reportContent}</pre>
            </div>

            {/* Finalize CTA if in_review */}
            {cur.reportStatus === 'in_review' && (
              <button
                type="button"
                data-testid="dicom-finalize-view-btn"
                onClick={() => void finalizeFromView()}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700"
              >
                <Check className="w-3.5 h-3.5" />
                Finaliser le rapport
              </button>
            )}
          </>
        )}

        {/* ── Export bar ── */}
        {hasReport && mode === 'view' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Export & Partage</p>
            <div className="flex flex-wrap gap-2">
              {/* Preview PDF */}
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Aperçu
              </button>

              {/* Print */}
              <button
                onClick={() => downloadReportAsPdf(reportData, lab, profile)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-xs font-medium transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-gray-600" />
                Imprimer
              </button>

              {/* Export PDF */}
              <button
                type="button"
                data-testid="dicom-export-pdf-btn"
                onClick={() => downloadReportAsPdf(reportData, lab, profile)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-medium transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>

              {/* Share */}
              <button
                onClick={() => setShowShare(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors shadow-sm border ${
                  cur.shareToken
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent hover:opacity-90'
                }`}
              >
                {cur.shareToken ? <Link2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {cur.shareToken ? 'Partagé' : 'Partager'}
              </button>

              {/* Lab branding indicator */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                {(lab.logoDataUrl || lab.logoUrl) ? 'Logo inclus' : 'En-tête cabinet'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main List ─────────────────────────────────────────────────────────────────

export function DicomFolderManager() {
  const [folders, setFolders]         = useState<PatientFolder[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]     = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [selected, setSelected]       = useState<PatientFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPacsImport, setShowPacsImport] = useState(false);

  const loadFolders = useCallback(async () => {
    setListError(null);
    try {
      const raw = await listRadiologistDicomFolders();
      setFolders(raw.map(mapDicomFolderFromApi));
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { void loadFolders(); }, [loadFolders]);

  useEffect(() => {
    const key = 'laura_warn_rad_storage_v1';
    if (sessionStorage.getItem(key)) return;
    void (async () => {
      try {
        const s = await getRadiologistStorageQuota();
        if (s.unlimited) return;
        const cap = s.allocatedGb;
        if (cap <= 0) return;
        const ratio = s.usedGb / cap;
        if (ratio >= 0.8) {
          notify.storageWarning(
            `Stockage DICOM : environ ${Math.round(ratio * 100)} % utilisé (${s.usedGb.toFixed(2)} / ${cap} Go).`,
          );
          sessionStorage.setItem(key, '1');
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const pullFolderState = useCallback(async (id: string) => {
    try {
      const raw = await listRadiologistDicomFolders();
      const mapped = raw.map(mapDicomFolderFromApi);
      setFolders(mapped);
      return mapped.find(f => f.id === id) ?? null;
    } catch {
      return null;
    }
  }, []);

  const handleCreate = async (data: Partial<PatientFolder>) => {
    await createRadiologistDicomFolder({
      patientName: data.patientName || '',
      patientId: data.patientId || undefined,
      pathology: data.pathology || '',
      modality: data.modality || 'IRM',
    });
    await loadFolders();
  };

  const handleUpdate = (updated: PatientFolder) => {
    setFolders(prev => prev.map(f => f.id === updated.id ? updated : f));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const filtered = folders.filter(f => {
    const q = searchQuery.toLowerCase();
    return (f.patientName.toLowerCase().includes(q) || f.pathology.toLowerCase().includes(q) || f.patientId.toLowerCase().includes(q))
      && (filterStatus === 'all' || f.reportStatus === filterStatus);
  });

  const statusColor: Record<PatientFolder['reportStatus'], string> = {
    none: 'bg-gray-100 text-gray-600',
    generating: 'bg-yellow-100 text-yellow-700',
    ai_generated: 'bg-blue-100 text-blue-700',
    in_review: 'bg-orange-100 text-orange-700',
    finalized: 'bg-green-100 text-green-700',
  };
  const statusLabel: Record<PatientFolder['reportStatus'], string> = {
    none: 'Sans rapport', generating: 'Génération...', ai_generated: 'IA généré',
    in_review: 'En révision', finalized: 'Finalisé',
  };

  if (selected) {
    return (
      <FolderDetail
        folder={selected}
        onBack={() => { setSelected(null); void loadFolders(); }}
        onUpdate={handleUpdate}
        pullFolderState={pullFolderState}
      />
    );
  }

  return (
    <div className="space-y-5">
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <CreateFolderModal
            onClose={() => setShowCreate(false)}
            onCreate={async data => {
              try {
                await handleCreate(data);
                setShowCreate(false);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>
      )}

      {showPacsImport && (
        <PacsImportModal
          onClose={() => setShowPacsImport(false)}
          onImportComplete={() => void loadFolders()}
        />
      )}

      {listError && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{listError}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dossiers patients</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {listLoading ? 'Chargement…' : `${folders.length} dossier${folders.length > 1 ? 's' : ''} · Gestion DICOM & rapports`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import PACS button */}
          <button
            type="button"
            data-testid="dicom-pacs-import-btn"
            onClick={() => setShowPacsImport(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
          >
            <Server className="w-4 h-4 text-blue-600" />
            Import PACS
          </button>
          <button
            type="button"
            data-testid="dicom-new-folder-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl hover:opacity-90 text-sm font-medium shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouveau dossier
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: folders.length, icon: <FolderOpen className="w-4 h-4" />, color: 'text-blue-600' },
          { label: 'IA généré', value: folders.filter(f => f.reportStatus === 'ai_generated').length, icon: <Brain className="w-4 h-4" />, color: 'text-purple-600' },
          { label: 'En révision', value: folders.filter(f => f.reportStatus === 'in_review').length, icon: <Edit3 className="w-4 h-4" />, color: 'text-orange-600' },
          { label: 'Finalisés', value: folders.filter(f => f.reportStatus === 'finalized').length, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`${s.color} mb-1.5`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Rechercher patient, pathologie, ID..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-700">
          <option value="all">Tous</option>
          <option value="none">Sans rapport</option>
          <option value="ai_generated">IA généré</option>
          <option value="in_review">En révision</option>
          <option value="finalized">Finalisés</option>
        </select>
      </div>

      {/* List */}
      {listLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-sm text-gray-500">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
          Chargement des dossiers…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-semibold text-gray-900 mb-1">Aucun dossier trouvé</h3>
          <p className="text-sm text-gray-400">Modifiez vos filtres, créez un dossier ou importez depuis PACS</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(f => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${f.pacsImported ? 'bg-gradient-to-br from-indigo-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                  {f.pacsImported
                    ? <Server className="w-5 h-5 text-white" />
                    : <FolderOpen className="w-5 h-5 text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{f.patientName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[f.reportStatus]}`}>
                      {statusLabel[f.reportStatus]}
                    </span>
                    {f.pacsImported && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs flex items-center gap-0.5">
                        <Server className="w-2.5 h-2.5" /> PACS
                      </span>
                    )}
                    {f.shareToken && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs flex items-center gap-0.5">
                        <Link2 className="w-2.5 h-2.5" /> Partagé
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{f.pathology}</span>
                    <span className="text-xs text-gray-400">{f.modality}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{f.createdAt.toLocaleDateString('fr-FR')}</span>
                    <span className="text-xs text-gray-400">{f.files.length} fichier{f.files.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create folder modal ───────────────────────────────────────────────────────

function CreateFolderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (f: Partial<PatientFolder>) => Promise<void> }) {
  const [form, setForm] = useState({ patientName: '', patientId: '', pathology: '', modality: 'IRM' });
  const [busy, setBusy] = useState(false);
  return (
    <div className="bg-white rounded-2xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900">Nouveau dossier patient</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Nom du patient *', key: 'patientName', placeholder: 'Nom Prénom' },
          { label: 'ID Patient', key: 'patientId', placeholder: 'PAT-2026-XXX' },
          { label: 'Pathologie / Indication *', key: 'pathology', placeholder: 'ex: Douleurs lombaires...' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input type="text" value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Modalité</label>
          <select value={form.modality} onChange={e => setForm({ ...form, modality: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
            {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Annuler</button>
        <button
          type="button"
          data-testid="dicom-create-folder-submit"
          onClick={() => {
            if (!form.patientName || !form.pathology || busy) return;
            setBusy(true);
            void onCreate(form).finally(() => setBusy(false));
          }}
          disabled={!form.patientName || !form.pathology || busy}
          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90"
        >
          {busy ? 'Création…' : 'Créer'}
        </button>
      </div>
    </div>
  );
}