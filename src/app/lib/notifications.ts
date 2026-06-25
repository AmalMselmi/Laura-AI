import { toast } from 'sonner';
import { ApiError } from './api/client';

const CODE_MESSAGES: Record<string, string> = {
  QUOTA_EXCEEDED: 'Quota atteint ou dépassé.',
  STORAGE_EXCEEDED: 'Espace de stockage insuffisant pour votre formule.',
  UNAUTHORIZED_ROLE: 'Action non autorisée pour ce rôle.',
  TOKEN_EXPIRED: 'Session expirée — reconnectez-vous.',
  PACS_CONNECTION_FAILED: 'Connexion au serveur PACS impossible.',
};

export const notify = {
  scanSaved: () => toast.success('Document enregistré dans votre carnet.'),
  shareLinkCreated: () => toast.success('Lien de partage créé.'),
  quotaWarning: (detail: string) => toast.warning(detail, { id: 'quota-warning' }),
  storageWarning: (detail: string) => toast.warning(detail, { id: 'storage-warning' }),
  reportFinalized: () => toast.success('Rapport finalisé.'),
  pacsImportCompleted: (n?: number) =>
    toast.success(n != null && n > 0 ? `Import PACS terminé (${n} étude${n > 1 ? 's' : ''}).` : 'Import PACS terminé.'),
  pacsImportFailed: (msg?: string) => toast.error(msg || "L'import PACS a échoué."),
  pacsConnectionFailed: (msg?: string) =>
    toast.error(msg || CODE_MESSAGES.PACS_CONNECTION_FAILED, { id: 'pacs-conn-fail' }),
  pacsTestOk: () => toast.success('Connexion au serveur PACS réussie.'),
  adminUserUpdated: () => toast.success('Utilisateur mis à jour.'),
  gdprRequestCreated: () => toast.success('Demande RGPD enregistrée.'),
  gdprRequestUpdated: () => toast.success('Demande RGPD mise à jour.'),
};

export function notifyApiError(err: unknown, fallback = 'Une erreur est survenue') {
  if (err instanceof ApiError) {
    const byCode = err.code ? CODE_MESSAGES[err.code] : undefined;
    toast.error(byCode || err.message || fallback);
    return;
  }
  if (err instanceof Error) {
    toast.error(err.message || fallback);
    return;
  }
  toast.error(fallback);
}
