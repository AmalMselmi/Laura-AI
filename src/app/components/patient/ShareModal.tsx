import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Link2, Copy, Check, Clock, Eye, Shield, RefreshCw, ExternalLink } from 'lucide-react';
import { usePatientDocuments } from '../../context/PatientDocumentsContext';
import { notify, notifyApiError } from '../../lib/notifications';

interface ShareModalProps {
  type: 'folder' | 'document';
  id: string;
  label: string;
  onClose: () => void;
}

export function ShareModal({ type, id, label, onClose }: ShareModalProps) {
  const { documents, folders, shareDocument, shareFolder } = usePatientDocuments();
  const navigate = useNavigate();

  const existingToken =
    type === 'folder' ? folders.find(f => f.id === id)?.shareToken : documents.find(d => d.id === id)?.shareToken;

  const [token, setToken] = useState<string>(existingToken || '');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = token ? `${window.location.origin}/shared/${token}` : '';
  const expiresLabel = expiresAt
    ? new Date(expiresAt.replace('Z', '+00:00')).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = type === 'folder' ? await shareFolder(id) : await shareDocument(id);
      setToken(res.token);
      setExpiresAt(res.expiresAt);
      notify.shareLinkCreated();
    } catch (e) {
      notifyApiError(e, 'Impossible de créer le lien');
      setError(e instanceof Error ? e.message : 'Impossible de créer le lien');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpen = () => {
    onClose();
    navigate(`/shared/${token}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 text-base">
                Partager {type === 'folder' ? 'le dossier' : 'le document'}
              </h2>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          {!token ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Générer un lien de partage</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Un lien sécurisé sera créé, donnant accès en lecture seule
                à ce {type === 'folder' ? 'dossier' : 'document'} à tout médecin qui le reçoit.
              </p>
              <button
                onClick={() => void handleGenerate()}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Link2 className="w-4 h-4" />
                {loading ? 'Génération…' : 'Générer le lien de partage'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800 font-medium">Lien de partage actif</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Lien à envoyer au médecin
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 overflow-hidden">
                    <p className="text-xs text-gray-700 truncate font-mono">{shareUrl}</p>
                  </div>
                  <button
                    onClick={() => void handleCopy()}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      copied
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-900 text-white hover:bg-gray-700'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Expiration
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{expiresLabel || '—'}</p>
                  <p className="text-xs text-gray-400">7 jours</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    Permissions
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">Lecture seule</p>
                  <p className="text-xs text-gray-400">Sans compte requis</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleOpen}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Aperçu médecin
                </button>
                <button
                  onClick={() => void handleGenerate()}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Nouveau lien
                </button>
              </div>
            </>
          )}

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Le médecin accède uniquement en <strong>lecture</strong>. Aucun compte n'est requis.
              Le lien peut être révoqué à tout moment. Conforme RGPD Art. 9.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
