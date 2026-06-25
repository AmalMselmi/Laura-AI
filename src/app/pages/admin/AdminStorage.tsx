import { useEffect, useState } from 'react';
import { getAdminStorage } from '../../lib/api/admin';
import type { AdminStorageApi } from '../../types/api';
import { Database, AlertCircle, HardDrive } from 'lucide-react';

export function AdminStorage() {
  const [data, setData] = useState<AdminStorageApi | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getAdminStorage();
        if (!cancelled) setData(s);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Erreur');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) {
    return <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</div>;
  }

  if (!data) {
    return <div className="text-sm text-gray-500">Chargement…</div>;
  }

  const { summary, users } = data;
  const totalStorageUsed = summary.totalUsedGb;
  const totalAllocated = summary.totalAllocatedGb;

  const alertUsers = users.filter(u => {
    const total = u.allocatedGb >= 999 ? 1000 : Math.max(u.allocatedGb, 0.01);
    return (u.usedGb / total) > 0.8;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion du stockage</h1>
        <p className="text-gray-500 text-sm mt-0.5">Données agrégées depuis l&apos;API</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-blue-600" />
          Stockage global plateforme
        </h3>
        <div className="mb-5">
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span><strong>{totalStorageUsed.toFixed(2)} GB</strong> utilisés</span>
            <span>{totalAllocated.toFixed(2)} GB alloués (hors illimité)</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min((totalStorageUsed / Math.max(totalAllocated, 0.01)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {summary.userCount} compte(s) · {((totalStorageUsed / Math.max(totalAllocated, 0.01)) * 100).toFixed(1)}% des quotas alloués
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Stockage total alloué', value: `${totalAllocated.toFixed(2)} GB`, icon: '🗄️', color: 'bg-blue-50 border-blue-100' },
            { label: 'Utilisé', value: `${totalStorageUsed.toFixed(2)} GB`, icon: '📊', color: 'bg-purple-50 border-purple-100' },
            { label: 'Disponible', value: `${Math.max(totalAllocated - totalStorageUsed, 0).toFixed(2)} GB`, icon: '✅', color: 'bg-green-50 border-green-100' },
          ].map(item => (
            <div key={item.label} className={`${item.color} border rounded-xl p-4`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {alertUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-2 text-sm">Alertes de stockage ({alertUsers.length})</h4>
              <ul className="space-y-1">
                {alertUsers.map(u => {
                  const total = u.allocatedGb >= 999 ? 1000 : Math.max(u.allocatedGb, 0.01);
                  return (
                    <li key={u.userId} className="text-sm text-red-700">
                      <strong>{u.name}</strong> — {((u.usedGb / total) * 100).toFixed(0)}% utilisé ({u.usedGb.toFixed(2)} / {u.allocatedGb >= 999 ? '∞' : `${u.allocatedGb} GB`})
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2 text-sm">
          <HardDrive className="w-4 h-4 text-purple-600" />
          Stockage par utilisateur
        </h3>
        <div className="space-y-4">
          {[...users].sort((a, b) => b.usedGb - a.usedGb).map(user => {
            const total = user.allocatedGb >= 999 ? 1000 : Math.max(user.allocatedGb, 0.01);
            const pct = (user.usedGb / total) * 100;
            return (
              <div key={user.userId} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-900 truncate block">{user.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{user.role} · {user.planId}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {user.usedGb.toFixed(2)} / {user.allocatedGb >= 999 ? '∞' : `${user.allocatedGb} GB`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                {pct > 80 && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
