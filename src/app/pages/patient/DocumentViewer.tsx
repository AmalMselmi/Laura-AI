import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Download, Share2, Printer, FileText, Brain,
  CheckCircle, Calendar, User, Tag, HardDrive, Eye,
  FolderOpen, Link2,
} from 'lucide-react';
import { usePatientDocuments, MedicalDocument } from '../../context/PatientDocumentsContext';
import { ShareModal } from '../../components/patient/ShareModal';
import { renderDocumentContent } from '../../components/patient/DocumentContent';
import { downloadDocumentAsPdf, printDocumentDirect } from '../../utils/downloadUtils';
import { getPatientDocument } from '../../lib/api/patient';
import { useAuth } from '../../context/AuthContext';

const DOC_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  ordonnance: { label: 'Ordonnance',       icon: '💊', color: 'text-blue-700',   bg: 'bg-blue-50' },
  analyse:    { label: 'Analyse',          icon: '🔬', color: 'text-green-700',  bg: 'bg-green-50' },
  imagerie:   { label: 'Imagerie médicale',icon: '🩻', color: 'text-purple-700', bg: 'bg-purple-50' },
  rapport:    { label: 'Rapport médical',  icon: '📋', color: 'text-orange-700', bg: 'bg-orange-50' },
  certificat: { label: 'Certificat',       icon: '📜', color: 'text-teal-700',   bg: 'bg-teal-50' },
  autre:      { label: 'Document',         icon: '📄', color: 'text-gray-700',   bg: 'bg-gray-50' },
};

export function DocumentViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, folders } = usePatientDocuments();
  const [showShare, setShowShare] = useState(false);
  const [doc, setDoc] = useState<MedicalDocument | undefined>(() => documents.find(d => d.id === id));

  useEffect(() => {
    setDoc(documents.find(d => d.id === id));
  }, [documents, id]);

  useEffect(() => {
    if (!id || doc) return;
    if (user?.role !== 'patient') return;
    void (async () => {
      try {
        const apiDoc = await getPatientDocument(id);
        setDoc({
          id: apiDoc.id,
          name: apiDoc.name,
          type: apiDoc.type,
          date: apiDoc.date.slice(0, 10),
          size: apiDoc.size ?? '—',
          doctor: apiDoc.doctor ?? undefined,
          pathology: apiDoc.pathology ?? undefined,
          notes: apiDoc.notes ?? undefined,
          aiAnalyzed: apiDoc.aiAnalyzed,
          fromScan: apiDoc.fromScan,
          folderId: apiDoc.folderId ?? undefined,
          shareToken: apiDoc.shareToken ?? undefined,
          fileUrl: apiDoc.fileUrl ?? undefined,
          imageDataUrl: apiDoc.imageDataUrl ?? undefined,
          reportContent: apiDoc.reportContent ?? undefined,
        });
      } catch {
        setDoc(undefined);
      }
    })();
  }, [id, doc, user?.role]);

  // Back destination: folder if doc belongs to one, else documents list
  const parentFolder = doc?.folderId ? folders.find(f => f.id === doc.folderId) : undefined;
  const backTo = parentFolder
    ? `/patient/documents/folder/${parentFolder.id}`
    : '/patient/documents';
  const backLabel = parentFolder ? parentFolder.name : 'Mes documents';

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="font-bold text-gray-900 mb-2">Document introuvable</h2>
        <p className="text-gray-500 text-sm mb-6">Ce document n'existe pas ou a été supprimé.</p>
        <button onClick={() => navigate('/patient/documents')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm">
          Retour aux documents
        </button>
      </div>
    );
  }

  const typeConfig = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.autre;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">

      {showShare && (
        <ShareModal type="document" id={doc.id} label={doc.name} onClose={() => setShowShare(false)} />
      )}

      {/* ── Top nav ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {parentFolder ? (
            <span className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              {backLabel}
            </span>
          ) : backLabel}
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => printDocumentDirect(doc)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
          <button
            onClick={() => setShowShare(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all border ${
              doc.shareToken
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {doc.shareToken ? <Link2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{doc.shareToken ? 'Partagé' : 'Partager'}</span>
          </button>
          <button
            onClick={() => downloadDocumentAsPdf(doc)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl hover:opacity-90 text-xs font-medium transition-opacity"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
        </div>
      </div>

      {/* ── Document header ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 ${typeConfig.bg} rounded-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
            {typeConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 ${typeConfig.bg} ${typeConfig.color} rounded-full text-xs font-semibold`}>
                {typeConfig.label}
              </span>
              {doc.aiAnalyzed && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" /> Analysé IA
                </span>
              )}
              {doc.fromScan && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                  <Brain className="w-3 h-3" /> Généré par scan
                </span>
              )}
              {parentFolder && (
                <button
                  onClick={() => navigate(backTo)}
                  className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <FolderOpen className="w-3 h-3" /> {parentFolder.name}
                </button>
              )}
            </div>
            <h1 className="font-bold text-gray-900 mb-3 text-lg leading-snug">{doc.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />{formatDate(doc.date)}
              </span>
              {doc.doctor && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />{doc.doctor}
                </span>
              )}
              {doc.pathology && (
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />{doc.pathology}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" />{doc.size}
              </span>
            </div>
            {doc.notes && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                💬 {doc.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Document content ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Aperçu du document</span>
        </div>
        <div className="p-5">
          {renderDocumentContent(doc)}
        </div>
      </div>

      {/* ── RGPD ── */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        Document chiffré AES-256 · Hébergement HDS France · Accès journalisé · RGPD conforme
      </div>
    </div>
  );
}