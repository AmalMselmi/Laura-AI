import { useCallback, useEffect, useState } from 'react';
import {
  deleteAdminUser,
  getAdminPlans,
  getAdminUsers,
  patchAdminUserPlan,
  patchAdminUserStatus,
} from '../../lib/api/admin';
import type { AdminPlanApi, AdminUserRowApi } from '../../types/api';
import { notify, notifyApiError } from '../../lib/notifications';
import { Eye, Trash2, CheckCircle, XCircle, Download, X, Search, AlertTriangle } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span>;
  if (status === 'suspended') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Suspendu</span>;
  if (status === 'pending') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">En attente</span>;
  return null;
}

function escapeCsv(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function downloadUsersCsv(rows: AdminUserRowApi[]) {
  const cols: (keyof AdminUserRowApi)[] = [
    'id', 'name', 'email', 'role', 'planId', 'status', 'storageUsedGb', 'storageAllocatedGb', 'createdAt', 'lastActiveAt',
  ];
  const header = cols.join(',');
  const lines = rows.map(u =>
    cols.map(c => escapeCsv(String(u[c] ?? ''))).join(',')
  );
  const blob = new Blob([`\uFEFF${header}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `utilisateurs-laura-ai-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRowApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'patient' | 'radiologist' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserRowApi | null>(null);
  const [planOptions, setPlanOptions] = useState<AdminPlanApi[]>([]);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUserRowApi | null>(null);

  const reload = useCallback(async () => {
    setListErr(null);
    setLoading(true);
    try {
      const data = await getAdminUsers({
        search: searchQuery.trim() || undefined,
        role: filterRole === 'all' ? undefined : filterRole,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setUsers(data);
    } catch (e) {
      setListErr(e instanceof Error ? e.message : 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!selectedUser) return;
    void getAdminPlans().then(setPlanOptions).catch(() => setPlanOptions([]));
  }, [selectedUser]);

  const toggleSuspend = async (u: AdminUserRowApi) => {
    setActionErr(null);
    try {
      const next = u.status === 'active' ? 'suspended' : 'active';
      await patchAdminUserStatus(u.id, { status: next });
      await reload();
      setSelectedUser(cur => (cur && cur.id === u.id ? { ...cur, status: next } : cur));
      notify.adminUserUpdated();
    } catch (e) {
      notifyApiError(e, 'Erreur');
      setActionErr(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const changePlan = async (userId: string, planId: string) => {
    setActionErr(null);
    try {
      await patchAdminUserPlan(userId, { planId });
      await reload();
      setSelectedUser(cur => (cur && cur.id === userId ? { ...cur, planId } : cur));
      notify.adminUserUpdated();
    } catch (e) {
      notifyApiError(e, 'Erreur');
      setActionErr(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setActionErr(null);
    try {
      await deleteAdminUser(pendingDelete.id);
      setPendingDelete(null);
      setSelectedUser(null);
      await reload();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : 'Erreur suppression');
    }
  };

  const roleLabel = (r: string) => {
    if (r === 'radiologist') return 'Radiologue';
    if (r === 'admin') return 'Admin';
    return 'Patient';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{loading ? '…' : `${users.length} résultat(s)`}</p>
        </div>
        <button
          type="button"
          onClick={() => downloadUsersCsv(users)}
          disabled={users.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
      </div>

      {listErr && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{listErr}</div>
      )}
      {actionErr && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{actionErr}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value as typeof filterRole)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
        >
          <option value="all">Tous les rôles</option>
          <option value="patient">Patients</option>
          <option value="radiologist">Radiologues</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Rôle</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Plan</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Stockage</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">Chargement…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">Aucun utilisateur</td></tr>
              ) : (
                users.map(user => {
                  const total = user.storageAllocatedGb >= 999 ? 999 : user.storageAllocatedGb;
                  const used = user.storageUsedGb;
                  return (
                    <tr key={user.id} data-testid={`admin-user-row-${user.email}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'radiologist' ? 'bg-purple-100 text-purple-700'
                            : user.role === 'admin' ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-gray-700 capitalize">{user.planId}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="w-28">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{used.toFixed(2)} GB</span>
                            <span>{total >= 999 ? '∞' : `${total} GB`}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${(used / (total >= 999 ? 1000 : Math.max(total, 0.01))) > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min((used / (total >= 999 ? 1000 : Math.max(total, 0.01))) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><StatusBadge status={user.status} /></td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setSelectedUser(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Détails">
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <>
                              <button
                                type="button"
                                data-testid={`admin-suspend-${user.id}`}
                                onClick={() => void toggleSuspend(user)}
                                className={`p-1.5 rounded-lg ${user.status === 'active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={user.status === 'active' ? 'Suspendre' : 'Activer'}
                              >
                                {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(user)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">Détails utilisateur</h3>
                <button type="button" onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold">{selectedUser.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                  <div className="mt-1"><StatusBadge status={selectedUser.status} /></div>
                </div>
              </div>
              <div className="space-y-1 mb-5">
                {[
                  { label: 'Rôle', value: roleLabel(selectedUser.role) },
                  { label: 'Plan actuel', value: selectedUser.planId },
                  { label: 'Stockage', value: `${selectedUser.storageUsedGb.toFixed(2)} / ${selectedUser.storageAllocatedGb >= 999 ? '∞' : `${selectedUser.storageAllocatedGb} GB`}` },
                  { label: 'Inscrit le', value: new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') },
                  { label: 'Dernière activité', value: new Date(selectedUser.lastActiveAt).toLocaleDateString('fr-FR') },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm text-gray-900 font-medium capitalize">{item.value}</span>
                  </div>
                ))}
              </div>

              {selectedUser.role !== 'admin' && planOptions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Changer le plan</label>
                  <select
                    value={selectedUser.planId}
                    onChange={e => void changePlan(selectedUser.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    {planOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                {selectedUser.role !== 'admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => void toggleSuspend(selectedUser)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${selectedUser.status === 'active' ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                      {selectedUser.status === 'active' ? 'Suspendre' : 'Activer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(selectedUser)}
                      className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">Supprimer définitivement ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Le compte <strong>{pendingDelete.name}</strong> ({pendingDelete.email}) sera supprimé avec ses données associées. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setPendingDelete(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button type="button" onClick={() => void confirmDelete()} className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
