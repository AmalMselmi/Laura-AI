import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, FolderOpen, Share2, Plus, Trash2, Eye, Upload, X,
  User, Tag, Clock, CheckCircle, Brain, Link2, FileText,
  FolderX, AlertTriangle, Download,
} from 'lucide-react';
import { usePatientDocuments, MedicalDocument, DocumentType } from '../../context/PatientDocumentsContext';
import { ShareModal } from '../../components/patient/ShareModal';

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

// ── Multi-file Upload Modal ───────────────────────────────────────────────────

interface FileEntry {
  file: File;
  name: string;
  type: DocumentType;
}

function MultiUploadModal({ onClose, onUpload }: {
  onClose: () => void;
  onUpload: (docs: Omit<MedicalDocument, 'id'>[]) => void;
}) {
  const [files, setFiles]         = useState<FileEntry[]>([]);
  const [doctor, setDoctor]       = useState('');
  const [pathology, setPathology] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const guessType = (filename: string): DocumentType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['dcm', 'dicom', 'nii', 'gz'].includes(ext)) return 'imagerie';
    if (['jpg', 'jpeg', 'png', 'bmp', 'tiff'].includes(ext)) return 'imagerie';
    if (filename.toLowerCase().includes('ordonnance')) return 'ordonnance';
    if (filename.toLowerCase().includes('analyse') || filename.toLowerCase().includes('bilan')) return 'analyse';
    if (filename.toLowerCase().includes('rapport') || filename.toLowerCase().includes('compte')) return 'rapport';
    if (filename.toLowerCase().includes('certificat')) return 'certificat';
    return 'autre';
  };

  const addFiles = (fileList: FileList) => {
    const newEntries: FileEntry[] = Array.from(fileList).map(f => ({
      file: f,
      name: f.name.replace(/\.[^.]+$/, ''),
      type: guessType(f.name),
    }));
    setFiles(prev => [...prev, ...newEntries]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));
  const updateEntry = (idx: number, patch: Partial<FileEntry>) =>
    setFiles(prev => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  const handleSubmit = () => {
    const docs: Omit<MedicalDocument, 'id'>[] = files.map(entry => ({
      name: entry.name,
      type: entry.type,
      date: new Date().toISOString().slice(0, 10),
      size: `${(entry.file.size / (1024 * 1024)).toFixed(1)} MB`,
      doctor: doctor.trim() || undefined,
      pathology: pathology.trim() || undefined,
    }));
    onUpload(docs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900">Ajouter des fichiers</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.dcm,.doc,.docx,.nii"
              className="hidden"
              onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-700 text-sm">Glissez vos fichiers ici</p>
            <p className="text-xs text-gray-500 mt-1">Sélection multiple · PDF, JPG, PNG, DICOM</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              </p>
              {files.map((entry, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{typeInfo(entry.type)?.icon || '📄'}</span>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={e => updateEntry(idx, { name: e.target.value })}
                        className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {DOC_TYPES.map(t => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => updateEntry(idx, { type: t.value })}
                            className={`px-2 py-0.5 rounded-lg text-xs transition-all ${
                              entry.type === t.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="p-1 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 pl-7">
                    {(entry.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Shared metadata */}
          {files.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Métadonnées communes (optionnel)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Médecin</label>
                  <input type="text" value={doctor} onChange={e => setDoctor(e.target.value)}
                    placeholder="Dr. Martin" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Pathologie</label>
                  <input type="text" value={pathology} onChange={e => setPathology(e.target.value)}
                    placeholder="ex: Diabète" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex-shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Ajouter {files.length > 0 ? `${files.length} fichier${files.length > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main FolderView ───────────────────────────────────────────────────────────

export function FolderView() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate     = useNavigate();
  const { documents, folders, addDocument, deleteDocument, removeDocumentFromFolder } = usePatientDocuments();

  const [showUpload, setShowUpload]   = useState(false);
  const [showShare, setShowShare]     = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  const folder = folders.find(f => f.id === folderId);
  const folderDocs = documents.filter(d => d.folderId === folderId);

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderX className="w-14 h-14 text-gray-300 mb-4" />
        <h2 className="font-bold text-gray-900 mb-2">Dossier introuvable</h2>
        <p className="text-gray-500 text-sm mb-5">Ce dossier n'existe pas ou a été supprimé.</p>
        <button onClick={() => navigate('/patient/documents')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          Retour aux documents
        </button>
      </div>
    );
  }

  const handleMultiUpload = (docs: Omit<MedicalDocument, 'id'>[]) => {
    void (async () => {
      for (const doc of docs) {
        await addDocument({ ...doc, folderId: folder.id });
      }
    })();
  };

  return (
    <div className="space-y-5">

      {/* ── Modals ── */}
      {showUpload && (
        <MultiUploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleMultiUpload}
        />
      )}
      {showShare && (
        <ShareModal type="folder" id={folder.id} label={folder.name} onClose={() => setShowShare(false)} />
      )}
      {deletingDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Supprimer ce document ?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible. Le document sera définitivement supprimé.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingDoc(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button
                onClick={() => { void deleteDocument(deletingDoc).finally(() => setDeletingDoc(null)); }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back + actions ── */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate('/patient/documents')}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes documents
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowShare(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
              folder.shareToken
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {folder.shareToken ? <Link2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {folder.shareToken ? 'Partagé' : 'Partager'}
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* ── Folder header ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{folder.name}</h1>
            {folder.description && (
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{folder.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {folderDocs.length} document{folderDocs.length > 1 ? 's' : ''}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Créé le {formatDate(folder.createdAt)}
              </span>
              {folder.shareToken && (
                <span className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <Link2 className="w-3.5 h-3.5" />
                  Lien de partage actif
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Documents list ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-bold text-gray-900 text-sm">Contenu du dossier</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{folderDocs.length}</span>
        </div>

        {folderDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Dossier vide</h3>
            <p className="text-gray-400 text-xs mb-4">Ajoutez des fichiers à ce dossier</p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-sm font-medium hover:opacity-90"
            >
              Ajouter des fichiers
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {folderDocs.map(doc => {
              const tInfo = typeInfo(doc.type);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="p-4 flex items-start gap-3">
                    {/* Icon — clickable */}
                    <button
                      onClick={() => navigate(`/patient/documents/${doc.id}`)}
                      className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl flex-shrink-0 hover:scale-105 transition-transform"
                    >
                      {tInfo?.icon || '📄'}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/patient/documents/${doc.id}`)}
                        className="text-left w-full"
                      >
                        <h4 className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors truncate">
                          {doc.name}
                        </h4>
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
                            <CheckCircle className="w-2.5 h-2.5" /> Analysé IA
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/patient/documents/${doc.id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ouvrir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void removeDocumentFromFolder(folder.id, doc.id)}
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Retirer du dossier"
                      >
                        <FolderX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingDoc(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add more CTA ── */}
      {folderDocs.length > 0 && (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter d'autres fichiers à ce dossier
        </button>
      )}
    </div>
  );
}
