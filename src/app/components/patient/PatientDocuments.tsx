import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Download, Trash2, Eye, Calendar, Search,
  Upload, Filter, User, Tag, Plus, X, CheckCircle,
  FolderOpen, FolderPlus, Clock, ChevronDown, Brain,
  Share2, ChevronRight, Link2, Stethoscope,
} from 'lucide-react';
import { usePatientDocuments, MedicalDocument, DocumentType, DocumentFolder } from '../../context/PatientDocumentsContext';
import { ShareModal } from './ShareModal';
import { downloadDocumentAsPdf } from '../../utils/downloadUtils';

type SortBy = 'date' | 'doctor' | 'pathology' | 'type';

const DOC_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'ordonnance', label: 'Ordonnance', icon: '💊' },
  { value: 'analyse',    label: 'Analyse',    icon: '🔬' },
  { value: 'imagerie',   label: 'Imagerie',   icon: '🩻' },
  { value: 'rapport',    label: 'Rapport',    icon: '📋' },
  { value: 'certificat', label: 'Certificat', icon: '📜' },
  { value: 'autre',      label: 'Autre',      icon: '📄' },
];

const typeInfo = (type: DocumentType) => DOC_TYPES.find(t => t.value === type);
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Folder Creation Modal ────────────────────────────────────────────────────

function NewFolderModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName]        = useState('');
  const [description, setDesc] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900">Nouveau dossier</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Nom du dossier *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ex: Suivi cardiologie 2026"
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Description <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="ex: Comptes-rendus et examens liés à mon suivi cardiologique"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button
              onClick={() => { if (name.trim()) { onCreate(name.trim(), description.trim()); } }}
              disabled={!name.trim()}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Créer le dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload Modal (loose document) ────────────────────────────────────────────

function UploadModal({ onClose, onUpload }: {
  onClose: () => void;
  onUpload: (doc: Omit<MedicalDocument, 'id'>) => void;
}) {
  const [form, setForm] = useState({ name: '', type: 'autre' as DocumentType, doctor: '', pathology: '', notes: '' });
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!form.name) setForm(p => ({ ...p, name: f.name.replace(/\.[^.]+$/, '') })); }
  };

  const handleSubmit = () => {
    if (!form.name) return;
    onUpload({ ...form, date: new Date().toISOString().slice(0, 10), size: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '—' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-lg">Ajouter un document</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
          >
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.dcm,.doc,.docx" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!form.name) setForm(p => ({ ...p, name: f.name.replace(/\.[^.]+$/, '') })); } }} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-7 h-7 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium text-gray-700 text-sm">Glissez votre fichier ici</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DICOM, DOC</p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="ex: Ordonnance Dr. Dupont" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {DOC_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${form.type === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span className="text-base">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Médecin</label>
                <input type="text" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}
                  placeholder="Dr. Martin" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pathologie</label>
                <input type="text" value={form.pathology} onChange={e => setForm({ ...form, pathology: e.target.value })}
                  placeholder="ex: Diabète" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">Annuler</button>
            <button onClick={handleSubmit} disabled={!form.name} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">Ajouter</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Folder Card ──────────────────────────────────────────────────────────────

function FolderCard({ folder, docCount, onOpen, onShare, onDelete }: {
  folder: DocumentFolder;
  docCount: number;
  onOpen: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
      {/* Clickable area */}
      <button onClick={onOpen} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm truncate leading-snug">{folder.name}</h3>
            {folder.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{folder.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {docCount} document{docCount > 1 ? 's' : ''}
              </span>
              {folder.shareToken && (
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  Partagé
                </span>
              )}
              <span className="text-xs text-gray-400">{formatDate(folder.createdAt)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1 transition-colors" />
        </div>
      </button>

      {/* Actions bar */}
      <div className="border-t border-gray-100 flex">
        <button onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors rounded-bl-2xl">
          <Share2 className="w-3.5 h-3.5" />
          Partager
        </button>
        <div className="w-px bg-gray-100" />
        <button onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors rounded-br-2xl">
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
      </div>
    </div>
  );
}

// ── Document Row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc, onView, onShare, onDelete }: {
  doc: MedicalDocument;
  onView: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const tInfo = typeInfo(doc.type);
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      <div className="p-3.5 flex items-start gap-3">
        {/* Icon */}
        <button onClick={onView} className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg flex-shrink-0 hover:scale-105 transition-transform">
          {tInfo?.icon || '📄'}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button onClick={onView} className="text-left w-full">
            <h4 className="font-semibold text-gray-900 text-sm truncate hover:text-blue-600 transition-colors">{doc.name}</h4>
          </button>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tInfo?.label}</span>
            {doc.fromScan && (
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs flex items-center gap-0.5">
                <Brain className="w-2.5 h-2.5" /> IA
              </span>
            )}
            {doc.aiAnalyzed && !doc.fromScan && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> Analysé
              </span>
            )}
            {doc.shareToken && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs flex items-center gap-0.5">
                <Link2 className="w-2.5 h-2.5" /> Partagé
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {doc.doctor && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-2.5 h-2.5" />{doc.doctor}
              </span>
            )}
            {doc.pathology && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Tag className="w-2.5 h-2.5" />{doc.pathology}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-2.5 h-2.5" />{formatDate(doc.date)}
            </span>
            <span className="text-xs text-gray-400">{doc.size}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button onClick={onView} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ouvrir">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => downloadDocumentAsPdf(doc)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Télécharger PDF">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onShare} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Partager">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PatientDocuments() {
  const { documents, folders, addDocument, deleteDocument, createFolder, deleteFolder, refresh, loading, error } = usePatientDocuments();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState<SortBy>('date');
  const [filterType, setFilterType]     = useState<DocumentType | 'all'>('all');
  const [showUpload, setShowUpload]     = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [shareTarget, setShareTarget]   = useState<{ type: 'folder' | 'document'; id: string; label: string } | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refresh({
        search: searchQuery.trim() || undefined,
        type: filterType,
        sort: sortBy,
        order: 'desc',
      });
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchQuery, filterType, sortBy, refresh]);

  const looseDocs = documents.filter(d => !d.folderId);
  const scanCount = documents.filter(d => d.fromScan).length;

  // Filter & sort loose docs
  const filtered = looseDocs.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.doctor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.pathology || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || d.type === filterType;
    return matchSearch && matchType;
  });

  // Group loose docs
  const grouped: Record<string, MedicalDocument[]> = {};
  filtered.forEach(doc => {
    let key = '';
    if (sortBy === 'date') {
      key = new Date(doc.date).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (sortBy === 'doctor') {
      key = doc.doctor || 'Médecin non précisé';
    } else if (sortBy === 'pathology') {
      key = doc.pathology || 'Pathologie non précisée';
    } else {
      key = DOC_TYPES.find(t => t.value === doc.type)?.label || 'Autre';
    }
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(doc);
  });

  const groupIcon = (sb: SortBy) => {
    if (sb === 'date') return <Calendar className="w-3.5 h-3.5 text-gray-400" />;
    if (sb === 'doctor') return <Stethoscope className="w-3.5 h-3.5 text-gray-400" />;
    if (sb === 'pathology') return <Tag className="w-3.5 h-3.5 text-gray-400" />;
    return <FileText className="w-3.5 h-3.5 text-gray-400" />;
  };

  return (
    <div className="space-y-5">

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-xs text-gray-500">Chargement des documents…</div>
      )}

      {/* ── Modals ── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={doc => {
            void addDocument(doc).finally(() => setShowUpload(false));
          }}
        />
      )}
      {showNewFolder && (
        <NewFolderModal
          onClose={() => setShowNewFolder(false)}
          onCreate={(name, description) => {
            void createFolder({ name, description }).finally(() => setShowNewFolder(false));
          }}
        />
      )}
      {shareTarget && (
        <ShareModal type={shareTarget.type} id={shareTarget.id} label={shareTarget.label} onClose={() => setShareTarget(null)} />
      )}
      {deletingFolder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-900 mb-2">Supprimer ce dossier ?</h3>
            <p className="text-sm text-gray-500 mb-5">Les documents seront conservés mais retirés du dossier.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingFolder(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={() => { void deleteFolder(deletingFolder).finally(() => setDeletingFolder(null)); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">Mes documents</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {documents.length} document{documents.length > 1 ? 's' : ''} · {folders.length} dossier{folders.length > 1 ? 's' : ''}
            {scanCount > 0 && <span className="ml-2 inline-flex items-center gap-1 text-purple-700"><Brain className="w-3 h-3" />{scanCount} IA</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1 px-2.5 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Dossier</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl hover:opacity-90 transition-opacity text-xs font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {DOC_TYPES.slice(0, 4).map(t => {
          const count = documents.filter(d => d.type === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setFilterType(filterType === t.value ? 'all' : t.value)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${
                filterType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{t.icon}</span>
              <span className="text-xs">{t.label}</span>
              <span className={`text-xs font-bold ${filterType === t.value ? 'text-blue-700' : 'text-gray-900'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Folders section ── */}
      {folders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-sm">Dossiers</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{folders.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map(folder => {
              const docCount = documents.filter(d => d.folderId === folder.id).length;
              return (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  docCount={docCount}
                  onOpen={() => navigate(`/patient/documents/folder/${folder.id}`)}
                  onShare={() => setShareTarget({ type: 'folder', id: folder.id, label: folder.name })}
                  onDelete={() => setDeletingFolder(folder.id)}
                />
              );
            })}
            {/* Add folder shortcut */}
            <button
              onClick={() => setShowNewFolder(true)}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center gap-3 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-blue-300 flex items-center justify-center flex-shrink-0 transition-colors">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Nouveau dossier</p>
                <p className="text-xs">Regrouper des documents</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Loose docs section ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <h2 className="font-bold text-gray-900 text-sm">
              {folders.length > 0 ? 'Documents non classés' : 'Tous mes documents'}
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{looseDocs.length}</span>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Chercher…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white w-28 sm:w-40"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
                className="appearance-none pl-6 pr-5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white text-gray-700">
                <option value="date">Date</option>
                <option value="doctor">Médecin</option>
                <option value="pathology">Pathologie</option>
                <option value="type">Type</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter chip */}
        {filterType !== 'all' && (
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setFilterType('all')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {typeInfo(filterType)?.icon} {typeInfo(filterType)?.label}
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">
              {searchQuery || filterType !== 'all' ? 'Aucun résultat' : 'Aucun document non classé'}
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              {searchQuery || filterType !== 'all'
                ? 'Essayez de modifier vos filtres'
                : folders.length > 0 ? 'Tous vos documents sont dans des dossiers 🎉' : 'Ajoutez votre premier document médical'}
            </p>
            {!searchQuery && filterType === 'all' && folders.length === 0 && (
              <button onClick={() => setShowUpload(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl hover:opacity-90 text-sm font-medium">
                Ajouter un document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([group, docs]) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  {groupIcon(sortBy)}
                  <h3 className="font-semibold text-gray-600 capitalize text-xs uppercase tracking-wide">{group}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{docs.length}</span>
                </div>
                <div className="space-y-2.5">
                  {docs.map(doc => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      onView={() => navigate(`/patient/documents/${doc.id}`)}
                      onShare={() => setShareTarget({ type: 'document', id: doc.id, label: doc.name })}
                      onDelete={() => void deleteDocument(doc.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}