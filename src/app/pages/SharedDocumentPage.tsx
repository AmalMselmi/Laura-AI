import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Shield, Clock, Download, Eye, ChevronDown, ChevronUp,
  FolderOpen, FileText, User, Tag, Calendar, HardDrive,
  AlertTriangle, CheckCircle, Link, ExternalLink, Building2,
} from 'lucide-react';
import { LauraLogoMark } from '../components/brand/LauraLogoMark';
import { MedicalDocument } from '../context/PatientDocumentsContext';
import { renderDocumentContent } from '../components/patient/DocumentContent';
import { ReportPreview } from '../components/radiologist/ReportPreview';
import { getSharedLink } from '../lib/api/shared';
import { ApiError } from '../lib/api/client';
import type { MedicalDocumentApi, SharedLinkPublicResponseApi, SharedReportApi } from '../types/api';

const DOC_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  ordonnance: { label: 'Ordonnance',       icon: '💊', color: 'text-blue-700',   bg: 'bg-blue-50' },
  analyse:    { label: 'Analyse',          icon: '🔬', color: 'text-green-700',  bg: 'bg-green-50' },
  imagerie:   { label: 'Imagerie médicale',icon: '🩻', color: 'text-purple-700', bg: 'bg-purple-50' },
  rapport:    { label: 'Rapport médical',  icon: '📋', color: 'text-orange-700', bg: 'bg-orange-50' },
  certificat: { label: 'Certificat',       icon: '📜', color: 'text-teal-700',   bg: 'bg-teal-50' },
  autre:      { label: 'Document',         icon: '📄', color: 'text-gray-700',   bg: 'bg-gray-50' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

function mapSharedDoc(d: MedicalDocumentApi): MedicalDocument {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    date: d.date.slice(0, 10),
    size: d.size ?? '—',
    doctor: d.doctor ?? undefined,
    pathology: d.pathology ?? undefined,
    notes: d.notes ?? undefined,
    aiAnalyzed: d.aiAnalyzed,
    fromScan: d.fromScan,
    folderId: d.folderId ?? undefined,
    shareToken: d.shareToken ?? undefined,
    fileUrl: d.fileUrl ?? undefined,
    imageDataUrl: d.imageDataUrl ?? undefined,
    reportContent: d.reportContent ?? undefined,
  };
}

function parseExpiresLabel(iso: string): string {
  const raw = iso.replace('Z', '+00:00');
  return new Date(raw).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Expandable document card (folder list + embedded viewer) ─────────────────

function SharedDocCard({ doc, defaultOpen = false }: { doc: MedicalDocument; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const config = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.autre;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className={`w-11 h-11 ${config.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={`px-2 py-0.5 ${config.bg} ${config.color} rounded-full text-xs font-semibold`}>
              {config.label}
            </span>
            {doc.aiAnalyzed && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle className="w-2.5 h-2.5" /> IA analysé
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{doc.name}</h3>
          <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(doc.date)}</span>
            {doc.doctor && <span className="flex items-center gap-1"><User className="w-3 h-3" />{doc.doctor}</span>}
            {doc.pathology && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{doc.pathology}</span>}
            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{doc.size}</span>
          </div>
          {doc.notes && (
            <p className="text-xs text-gray-500 mt-1 truncate">💬 {doc.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" onClick={e => e.stopPropagation()} title="Télécharger">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-6 h-6 flex items-center justify-center">
            {open
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/30">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu du document</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 italic">Lecture seule</span>
          </div>
          {renderDocumentContent(doc)}
        </div>
      )}
    </div>
  );
}

function SharedContextBanner({ link }: { link: SharedLinkPublicResponseApi }) {
  const expiresLabel = parseExpiresLabel(link.expiresAt);
  const docCount = link.folder?.documents.length ?? 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-2xl p-5 text-white">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          {link.type === 'folder'
            ? <FolderOpen className="w-5 h-5 text-white" />
            : link.type === 'report'
            ? <FileText className="w-5 h-5 text-white" />
            : <FileText className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-blue-100 text-xs mb-0.5">
            {link.type === 'folder'
              ? 'Dossier médical partagé'
              : link.type === 'report'
                ? 'Compte-rendu radiologique'
                : 'Document médical partagé'}
          </p>
          <h1 className="font-bold text-lg leading-snug">{link.label}</h1>
          {link.folder?.description && (
            <p className="text-blue-100 text-sm mt-1 leading-relaxed">{link.folder.description}</p>
          )}
          {link.type === 'report' && link.report && (
            <p className="text-blue-100 text-sm mt-1">
              {link.report.patientName} · {link.report.modality} · {link.report.pathology}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Expire le {expiresLabel}
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Lecture seule
        </div>
        {link.type === 'folder' && link.folder && (
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {docCount} document{docCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

function SharedReportSection({ report }: { report: SharedReportApi }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
        {report.lab.logoDataUrl ? (
          <img src={report.lab.logoDataUrl} alt="Logo" className="h-12 w-auto object-contain flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <p className="font-bold text-gray-900 text-sm">{report.lab.name}</p>
          <p className="text-xs text-gray-500">
            {report.lab.address}{report.lab.city ? `, ${report.lab.postalCode} ${report.lab.city}` : ''}
          </p>
          <p className="text-xs text-gray-500">
            {report.lab.phone}{report.lab.email ? ` · ${report.lab.email}` : ''}
          </p>
          {report.lab.rpps && <p className="text-xs text-gray-400 mt-0.5">RPPS : {report.lab.rpps}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Compte-rendu radiologique</span>
          <span className="ml-auto text-xs text-gray-400 italic">Lecture seule</span>
        </div>
        <div className="p-5">
          <ReportPreview
            data={{
              patientName: report.patientName,
              patientId: report.patientId,
              pathology: report.pathology,
              modality: report.modality,
              content: report.content,
              finalizedAt: report.finalizedAt,
            }}
            lab={report.lab}
            profile={{
              name: report.radiologistName,
              title: report.radiologistTitle,
              specialty: report.radiologistSpecialty,
            }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Télécharger le PDF
        </button>
      </div>
    </div>
  );
}

function SecurityFooter() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Shield className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Sécurité & confidentialité</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />Chiffrement AES-256 en transit</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />Hébergement HDS certifié (France)</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />Accès en lecture seule · Non modifiable</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />Conforme RGPD Art. 9 · Données de santé</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SharedDocumentPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<SharedLinkPublicResponseApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'expired' | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('not_found');
      setLink(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSharedLink(token);
        if (!cancelled) {
          setLink(data);
          setError(null);
        }
      } catch (e) {
        if (cancelled) return;
        setLink(null);
        if (e instanceof ApiError && e.status === 404) {
          const msg = String(e.message || '').toLowerCase();
          setError(msg.includes('expired') ? 'expired' : 'not_found');
        } else {
          setError('not_found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-gray-50" data-testid="shared-document-page">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LauraLogoMark size="xs" tone="brand" aria-hidden />
            <div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent text-sm">
                Laura AI
              </span>
              <span className="text-xs text-gray-400 ml-1.5">Carnet de santé numérique</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span className="hidden sm:inline">Accès sécurisé · Lecture seule</span>
            <span className="sm:hidden">Sécurisé</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500">
            Chargement du lien sécurisé…
          </div>
        )}

        {!loading && error === 'not_found' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Link className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="font-bold text-gray-900 mb-2">Lien introuvable</h1>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Ce lien n’existe pas ou a été révoqué. Demandez une nouvelle URL à la personne qui souhaite partager le document.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Accueil Laura AI
            </button>
          </div>
        )}

        {!loading && error === 'expired' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="font-bold text-gray-900 mb-1">Lien de partage expiré</h2>
            <p className="text-sm text-gray-600 mb-5">
              Ce lien a dépassé sa durée de validité. Demandez un nouveau lien à l’expéditeur.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-white border border-amber-200 text-amber-900 rounded-xl text-sm font-medium hover:bg-amber-100/50 transition-colors"
            >
              Accueil Laura AI
            </button>
          </div>
        )}

        {!loading && link && !error && (
          <>
            <SharedContextBanner link={link} />

            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 leading-relaxed">
                <strong>Accès en lecture seule :</strong> contenu partagé à titre informatif. Il ne remplace pas une consultation médicale. Données sensibles — RGPD Art. 9.
              </div>
            </div>

            {link.type === 'report' && link.report && (
              <SharedReportSection report={link.report} />
            )}

            {link.type === 'document' && link.document && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Document partagé
                </div>
                <SharedDocCard doc={mapSharedDoc(link.document)} defaultOpen />
              </div>
            )}

            {link.type === 'folder' && link.folder && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-gray-900 text-sm">
                    Dossier ({link.folder.documents.length} document{link.folder.documents.length > 1 ? 's' : ''})
                  </h2>
                </div>
                {link.folder.documents.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Ce dossier est vide.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {link.folder.documents.map((doc, idx) => (
                      <SharedDocCard key={doc.id} doc={mapSharedDoc(doc)} defaultOpen={idx === 0} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <SecurityFooter />
          </>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-rose-50 border border-blue-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-700 mb-1">
            Vous êtes médecin ou radiologue ?
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Rejoignez Laura AI pour gérer vos dossiers DICOM et générer des rapports IA.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Découvrir Laura AI Pro
          </button>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
            Propulsé par{' '}
            <button type="button" onClick={() => navigate('/')} className="font-semibold text-gray-500 hover:text-blue-600 transition-colors">
              Laura AI
            </button>
            {' '}· Carnet de santé numérique intelligent
          </p>
        </div>
      </main>
    </div>
  );
}
