/**
 * PacsImportModal — Workflow d'import depuis un système PACS.
 * Étapes : Sélection serveur → Query C-FIND → Résultats → Import C-MOVE → Succès
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAsyncJob, queryPacsStudies, retrievePacsStudies } from '../../lib/api/pacs';
import type { PacsStudyApi } from '../../types/api';
import {
  X, Server, Search, CheckCircle, AlertCircle, RefreshCw,
  FileText, User, Calendar, Layers, Hash, HardDrive,
  ChevronRight, Download, Wifi, WifiOff, Clock, Filter,
  Stethoscope, Building2, Check, ArrowRight, Package,
  ImageIcon, ScanLine, Activity,
} from 'lucide-react';
import { usePacs, PacsServer } from '../../context/PacsContext';
import { notify, notifyApiError } from '../../lib/notifications';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PacsStudy = PacsStudyApi;

// ── Helper ────────────────────────────────────────────────────────────────────

function modalityIcon(m: string) {
  if (m === 'IRM')           return '🧲';
  if (m === 'Scanner/TDM')   return '🌀';
  if (m === 'Radiographie')  return '🩻';
  if (m === 'Échographie')   return '🔊';
  if (m === 'PET Scan')      return '⚛️';
  if (m === 'Mammographie')  return '🎗️';
  return '📷';
}

function formatDicomDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ServerBadge({ server }: { server: PacsServer }) {
  const status = server.connectionStatus;
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border bg-white">
      {status === 'connected' ? <Wifi className="w-3 h-3 text-green-500" /> : status === 'error' ? <WifiOff className="w-3 h-3 text-red-400" /> : <Wifi className="w-3 h-3 text-gray-400" />}
      <span className={status === 'connected' ? 'text-green-700' : status === 'error' ? 'text-red-600' : 'text-gray-500'}>
        {server.aeTitle}
      </span>
      <span className="text-gray-300">·</span>
      <span className="text-gray-500 font-mono">{server.host}:{server.port}</span>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

interface PacsImportModalProps {
  onClose: () => void;
  onImportComplete?: () => void;
}

type Step = 'server' | 'pickServer' | 'query' | 'searching' | 'results' | 'jobWait' | 'success';

interface QueryForm {
  patientName: string;
  patientId:   string;
  modality:    string;
  dateFrom:    string;
  dateTo:      string;
}

export function PacsImportModal({ onClose, onImportComplete }: PacsImportModalProps) {
  const { servers, reloadServers } = usePacs();

  const [step, setStep]               = useState<Step>('server');
  const [selectedServer, setSelectedServer] = useState<PacsServer | null>(null);
  const [query, setQuery]             = useState<QueryForm>({ patientName: '', patientId: '', modality: '', dateFrom: '', dateTo: '' });
  const [results, setResults]         = useState<PacsStudy[]>([]);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [searchProgress, setSearchProgress] = useState(0);
  const [queryError, setQueryError]   = useState<string | null>(null);
  const [jobId, setJobId]             = useState<string | null>(null);
  const [jobStatus, setJobStatus]     = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobError, setJobError]       = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const importNotifiedRef = useRef(false);

  useEffect(() => {
    if (servers.length === 0) {
      setStep('server');
      setSelectedServer(null);
      return;
    }
    const def = servers.find(s => s.active) || servers[0] || null;
    setSelectedServer(def);
    setStep(servers.length === 1 ? 'query' : 'pickServer');
  }, [servers]);

  const handleSearch = async () => {
    if (!selectedServer) return;
    setQueryError(null);
    setStep('searching');
    setSearchProgress(0);
    const interval = setInterval(() => {
      setSearchProgress(p => (p >= 95 ? p : p + 12));
    }, 120);
    try {
      const data = await queryPacsStudies(selectedServer.id, {
        patientName: query.patientName.trim() || undefined,
        patientId: query.patientId.trim() || undefined,
        studyDateFrom: query.dateFrom.trim() || undefined,
        studyDateTo: query.dateTo.trim() || undefined,
        modality: query.modality.trim() || undefined,
      });
      clearInterval(interval);
      setSearchProgress(100);
      setResults(data);
      setSelected(new Set());
      setStep('results');
    } catch (e) {
      clearInterval(interval);
      notifyApiError(e, 'Échec de la requête C-FIND');
      setQueryError(e instanceof Error ? e.message : 'Échec de la requête C-FIND');
      setStep('query');
    }
  };

  const pollJobOnce = useCallback(async () => {
    if (!jobId) return;
    try {
      const j = await getAsyncJob(jobId);
      setJobStatus(j.status);
      setJobProgress(j.progress);
      setJobError(j.errorMessage ?? null);
      if (j.status === 'completed') {
        const n = j.resultData?.createdFolderIds?.length ?? 0;
        setImportedCount(n);
        if (!importNotifiedRef.current) {
          importNotifiedRef.current = true;
          void reloadServers();
          onImportComplete?.();
          notify.pacsImportCompleted(n > 0 ? n : undefined);
        }
        setJobId(null);
        setStep('success');
      } else if (j.status === 'failed') {
        if (!importNotifiedRef.current) {
          importNotifiedRef.current = true;
          notify.pacsImportFailed(j.errorMessage ?? undefined);
        }
        setJobId(null);
        setStep('results');
      }
    } catch {
      /* retry on next tick */
    }
  }, [jobId, onImportComplete, reloadServers]);

  useEffect(() => {
    if (step !== 'jobWait' || !jobId) return;
    void pollJobOnce();
    const iv = setInterval(() => { void pollJobOnce(); }, 2000);
    return () => clearInterval(iv);
  }, [step, jobId, pollJobOnce]);

  const handleImport = async () => {
    if (!selectedServer) return;
    const uids = results.filter(s => selected.has(s.studyUID)).map(s => s.studyUID);
    if (!uids.length) return;
    importNotifiedRef.current = false;
    setJobError(null);
    setJobStatus('queued');
    setJobProgress(0);
    try {
      const { jobId: jid } = await retrievePacsStudies(selectedServer.id, uids);
      setJobId(jid);
      setImportedCount(uids.length);
      setStep('jobWait');
    } catch (e) {
      notifyApiError(e, 'Impossible de lancer le C-MOVE');
      setQueryError(e instanceof Error ? e.message : 'Impossible de lancer le C-MOVE');
      setStep('results');
    }
  };

  const toggleSelect = (uid: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(results.map(s => s.studyUID)));
  const clearAll  = () => setSelected(new Set());

  const MODALITIES = ['IRM', 'Scanner/TDM', 'Radiographie', 'Échographie', 'PET Scan', 'Mammographie'];

  // ── Steps indicator
  const STEPS = [
    { key: 'pickServer', label: 'Serveur' },
    { key: 'query',    label: 'Recherche' },
    { key: 'results',  label: 'Sélection' },
    { key: 'success',  label: 'Importé' },
  ];
  const stepIdx =
    step === 'success' ? STEPS.length
    : step === 'pickServer' ? 0
    : step === 'query' || step === 'searching' ? 1
    : step === 'results' || step === 'jobWait' ? 2
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Import depuis PACS</h2>
              <p className="text-xs text-gray-500">
                {selectedServer
                  ? <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-green-500" />{selectedServer.name}</span>
                  : 'Aucun serveur configuré'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Step bar ── */}
        {(step !== 'server' && servers.length > 0) && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
                  i < stepIdx ? 'bg-green-100 text-green-700' :
                  i === stepIdx ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIdx ? <Check className="w-3 h-3" /> : <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">{i + 1}</span>}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
              </div>
            ))}

            {selectedServer && (
              <div className="ml-auto">
                <ServerBadge server={selectedServer} />
              </div>
            )}
          </div>
        )}

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* No server */}
          {step === 'server' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Server className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Aucun serveur PACS configuré</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed max-w-xs mx-auto">
                Configurez d'abord un serveur PACS depuis l'onglet <strong>PACS</strong> de votre compte.
              </p>
              <button onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl text-sm font-medium hover:opacity-90">
                Configurer un serveur PACS
              </button>
            </div>
          )}

          {step === 'pickServer' && (
            <div className="p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Étape 1 · Serveur PACS</p>
              <div className="space-y-2">
                {servers.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServer(s)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedServer?.id === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.connectionStatus === 'connected' ? 'bg-green-400' : s.connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{s.host}:{s.port} · AE: {s.aeTitle}</p>
                    </div>
                    {selectedServer?.id === s.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query form */}
          {step === 'query' && (
            <div className="p-5 space-y-5">
              {queryError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{queryError}</span>
                </div>
              )}

              {/* Query fields */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Critères de recherche (C-FIND)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Nom du patient
                    </label>
                    <input type="text" value={query.patientName}
                      onChange={e => setQuery(p => ({ ...p, patientName: e.target.value }))}
                      placeholder="Ex : Dupont, Ben*"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> ID Patient
                    </label>
                    <input type="text" value={query.patientId}
                      onChange={e => setQuery(p => ({ ...p, patientId: e.target.value }))}
                      placeholder="PAT-2026-XXX"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date d'examen (début)
                    </label>
                    <input type="date" value={query.dateFrom}
                      onChange={e => setQuery(p => ({ ...p, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date d'examen (fin)
                    </label>
                    <input type="date" value={query.dateTo}
                      onChange={e => setQuery(p => ({ ...p, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <ScanLine className="w-3 h-3" /> Modalité
                    </label>
                    <select value={query.modality}
                      onChange={e => setQuery(p => ({ ...p, modality: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Toutes les modalités</option>
                      {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* DICOM info panel */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Paramètres DICOM actifs
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                  {[
                    ['Calling AE', selectedServer?.callingAeTitle || 'LAURA_AI'],
                    ['Called AE', selectedServer?.aeTitle || '—'],
                    ['Host', selectedServer ? `${selectedServer.host}:${selectedServer.port}` : '—'],
                    ['Protocole', selectedServer?.protocol || 'DICOM'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-1.5">
                      <span className="text-xs text-blue-500 min-w-[80px]">{k} :</span>
                      <span className="text-xs text-blue-900 font-mono font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Searching */}
          {step === 'searching' && (
            <div className="p-8 flex flex-col items-center justify-center gap-5 min-h-[280px]">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
                <div className="absolute inset-3 flex items-center justify-center">
                  <Server className="w-7 h-7 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Requête C-FIND en cours…</p>
                <p className="text-sm text-gray-500 mt-1">Interrogation du PACS — {selectedServer?.aeTitle}</p>
              </div>
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progression</span>
                  <span>{Math.min(100, Math.round(searchProgress))}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, searchProgress)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-400 text-center">
                {searchProgress > 20  && <p className="animate-fade-in">✓ Connexion établie</p>}
                {searchProgress > 45  && <p>✓ Association DICOM ouverte</p>}
                {searchProgress > 70  && <p>✓ C-FIND request envoyé</p>}
                {searchProgress > 90  && <p>⏳ Réception des résultats…</p>}
              </div>
            </div>
          )}

          {/* Results */}
          {step === 'results' && (
            <div className="p-4 space-y-4">
              {/* Results header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-gray-700">
                  {results.length} étude{results.length !== 1 ? 's' : ''} trouvée{results.length !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Tout sélectionner</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={clearAll} className="text-xs text-gray-400 hover:underline">Effacer</button>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-10">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune étude trouvée avec ces critères</p>
                  <button onClick={() => setStep('query')} className="mt-3 text-xs text-blue-600 hover:underline">
                    Modifier la recherche
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map(study => {
                    const isSel = selected.has(study.studyUID);
                    return (
                      <button key={study.studyUID} onClick={() => toggleSelect(study.studyUID)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${isSel ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isSel ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {isSel && <Check className="w-3 h-3 text-white" />}
                          </div>

                          {/* Modality icon */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                            {modalityIcon(study.modality)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{study.patientName}</p>
                                <p className="text-xs text-gray-500 truncate">{study.studyDescription}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${study.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                  {study.status === 'available' ? 'Disponible' : 'Archivé'}
                                </span>
                                {study.hasReport && (
                                  <span className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs">
                                    <FileText className="w-2.5 h-2.5" /> CR inclus
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Hash className="w-2.5 h-2.5" />{study.patientId}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />{formatDicomDate(study.studyDate)} {study.studyTime}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Layers className="w-2.5 h-2.5" />{study.seriesCount} séries · {study.imagesCount} images
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Stethoscope className="w-2.5 h-2.5" />{study.referringPhysician}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5" />{study.institutionName}
                              </span>
                            </div>

                            {/* UID */}
                            <p className="text-xs text-gray-300 font-mono mt-1 truncate">UID: {study.studyUID.substring(0, 42)}…</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 'jobWait' && (
            <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[240px]">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">Récupération DICOM (C-MOVE)…</p>
                <p className="text-sm text-gray-500 mt-1">
                  Job {jobStatus ?? '…'} · {jobProgress}%
                </p>
                {jobError && (
                  <p className="text-xs text-red-600 mt-2">{jobError}</p>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center max-w-sm">
                Import simulé si aucun Orthanc n&apos;est configuré. Les dossiers apparaîtront automatiquement.
              </p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Import réussi !</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {importedCount} dossier{importedCount > 1 ? 's' : ''} créé{importedCount > 1 ? 's' : ''} depuis {selectedServer?.name}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Les dossiers PACS sont disponibles dans la liste des dossiers patients (badge PACS).
                  Vous pouvez générer ou valider un compte-rendu pour chaque import.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between gap-3 bg-white rounded-b-2xl">
          {step === 'pickServer' && (
            <>
              <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">Annuler</button>
              <button
                type="button"
                disabled={!selectedServer}
                onClick={() => setStep('query')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:opacity-90"
              >
                Continuer
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'query' && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (servers.length > 1) setStep('pickServer');
                  else setQuery({ patientName: '', patientId: '', modality: '', dateFrom: '', dateTo: '' });
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {servers.length > 1 ? '← Serveur' : 'Réinitialiser'}
              </button>
              <button
                type="button"
                data-testid="pacs-cfind-submit"
                onClick={() => void handleSearch()}
                disabled={!selectedServer}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <Search className="w-4 h-4" />
                Lancer la recherche C-FIND
              </button>
            </>
          )}

          {step === 'results' && (
            <>
              <button type="button" onClick={() => setStep('query')} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                ← Modifier
              </button>
              <div className="flex items-center gap-3">
                {selected.size > 0 && (
                  <span className="text-xs text-gray-500">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
                )}
                <button
                  type="button"
                  data-testid="pacs-import-submit"
                  onClick={() => void handleImport()}
                  disabled={selected.size === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Importer ({selected.size})
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <button
                type="button"
                onClick={() => { setStep('query'); setSelected(new Set()); setResults([]); setQueryError(null); }}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
              >
                Nouvelle recherche
              </button>
              <button
                type="button"
                data-testid="pacs-success-close"
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700"
              >
                <ArrowRight className="w-4 h-4" />
                Fermer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
