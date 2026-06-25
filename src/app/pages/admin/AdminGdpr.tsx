import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminUserExportCsv,
  getAdminGdprCompliance,
  getAdminGdprRequests,
  patchAdminGdprRequest,
} from '../../lib/api/admin';
import type { AdminComplianceApi, AdminGdprRequestApi } from '../../types/api';
import { notify, notifyApiError } from '../../lib/notifications';
import { Shield, CheckCircle, AlertCircle, Download } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">En attente</span>;
  if (status === 'in_progress') return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">En cours</span>;
  if (status === 'completed') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Traité</span>;
  return null;
}

export function AdminGdpr() {
  const [requests, setRequests] = useState<AdminGdprRequestApi[]>([]);
  const [compliance, setCompliance] = useState<AdminComplianceApi | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const [reqs, comp] = await Promise.all([getAdminGdprRequests(), getAdminGdprCompliance()]);
      setRequests(reqs);
      setCompliance(comp);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const handleProcess = async (r: AdminGdprRequestApi) => {
    try {
      const next = r.status === 'pending' ? 'in_progress' : 'completed';
      await patchAdminGdprRequest(r.id, { status: next });
      await reload();
      notify.gdprRequestUpdated();
    } catch (e) {
      notifyApiError(e, 'Erreur');
      setErr(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const downloadExport = async (userId: string | null | undefined) => {
    if (!userId) return;
    try {
      const text = await fetchAdminUserExportCsv(userId);
      const blob = new Blob([`\uFEFF${text}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-rgpd-${userId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Export impossible');
    }
  };

  const pending = requests.filter(r => r.status === 'pending').length;
  const inProgress = requests.filter(r => r.status === 'in_progress').length;
  const completed = requests.filter(r => r.status === 'completed').length;
  const items = compliance?.items ?? [];
  const compliant = compliance?.compliantCount ?? 0;
  const totalC = compliance?.totalCount ?? items.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conformité RGPD</h1>
        <p className="text-gray-500 text-sm mt-0.5">Demandes et matrice de conformité (API)</p>
      </div>

      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'En attente', value: pending, bg: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-600' },
          { label: 'En cours', value: inProgress, bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
          { label: 'Traitées', value: completed, bg: 'bg-green-50 border-green-100', text: 'text-green-600' },
          { label: 'Conformité', value: loading ? '…' : `${compliant}/${totalC}`, bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Demandes de droits RGPD</h3>
          <p className="text-xs text-gray-500 mt-0.5">Délai légal : 30 jours (RGPD Art. 12)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-sm text-gray-500">Chargement…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-sm text-gray-500">Aucune demande</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-400 font-mono truncate max-w-[120px]">{req.id}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{req.userName || '—'}</td>
                    <td className="p-4 text-sm text-gray-600 hidden sm:table-cell">{req.type}</td>
                    <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4"><StatusBadge status={req.status} /></td>
                    <td className="p-4 text-right space-x-1">
                      {req.userId && (
                        <button
                          type="button"
                          onClick={() => void downloadExport(req.userId)}
                          className="text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1"
                          title="Export CSV données utilisateur"
                        >
                          <Download className="w-3 h-3" /> CSV
                        </button>
                      )}
                      {req.status !== 'completed' ? (
                        <button
                          type="button"
                          onClick={() => void handleProcess(req)}
                          className="text-xs text-blue-600 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50"
                        >
                          {req.status === 'pending' ? 'Traiter →' : 'Clôturer →'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">✓ Clôturé</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-green-600" />
          Conformité réglementaire
        </h3>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              style={{ width: `${totalC ? (compliant / totalC) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">{compliant}/{totalC}</span>
        </div>
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
              {item.ok
                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              }
              <span className={`text-sm flex-1 ${item.ok ? 'text-gray-700' : 'text-yellow-700'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
        <p>🔒 <strong>Données chiffrées AES-256</strong> — Serveurs HDS certifiés en France</p>
        <p>📋 <strong>DPO :</strong> dpo@laura-ai.fr</p>
        <p>📞 <strong>Délai de réponse RGPD :</strong> 30 jours max (RGPD Art. 12)</p>
      </div>
    </div>
  );
}
