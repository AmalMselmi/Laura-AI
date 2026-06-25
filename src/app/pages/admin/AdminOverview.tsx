import { useEffect, useState } from 'react';
import { getAdminStats } from '../../lib/api/admin';
import type { AdminStatsApi } from '../../types/api';
import { Users, HardDrive, CreditCard, Shield, Activity, Package } from 'lucide-react';

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStatsApi | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await getAdminStats();
        if (!cancelled) setStats(s);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Erreur chargement');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-4">
        {err}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalUsers = stats.totalUsers;
  const activeUsers = stats.activeUsers;
  const totalRevenue = stats.estimatedMonthlyRevenue;
  const totalStorageUsed = stats.totalStorageUsedGb;
  const pendingGdpr = stats.pendingGdprRequests;
  const planRows = stats.planDistribution || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Vue d'ensemble de la plateforme Laura AI</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs totaux', value: totalUsers, sub: `${activeUsers} actifs`, icon: <Users className="w-5 h-5" />, color: 'from-blue-600 to-blue-700', subColor: 'text-blue-600' },
          { label: 'Revenus estimés (plans)', value: `${totalRevenue.toFixed(2)}€`, sub: 'Somme prix × abonnés', icon: <CreditCard className="w-5 h-5" />, color: 'from-green-500 to-green-600', subColor: 'text-green-600' },
          { label: 'Stockage utilisé', value: `${totalStorageUsed.toFixed(2)} GB`, sub: 'Tous comptes', icon: <HardDrive className="w-5 h-5" />, color: 'from-purple-500 to-purple-600', subColor: 'text-purple-600' },
          { label: 'Requêtes RGPD', value: pendingGdpr, sub: 'En attente', icon: <Shield className="w-5 h-5" />, color: 'from-rose-500 to-rose-600', subColor: 'text-rose-600' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-11 h-11 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            <p className={`text-xs ${card.subColor} mt-1 font-medium`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            Rôles
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Patients :</strong> {stats.patients}</p>
            <p><strong>Radiologues :</strong> {stats.radiologists}</p>
            <p><strong>Admins :</strong> {stats.admins}</p>
            <p className="text-xs text-gray-500 pt-2">Suspendus : {stats.suspendedUsers} · En attente : {stats.pendingUsers}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-purple-600" />
            Distribution des plans
          </h3>
          <div className="space-y-3">
            {planRows.length === 0 ? (
              <p className="text-xs text-gray-500">Aucun utilisateur</p>
            ) : (
              planRows.map(row => {
                const pct = totalUsers > 0 ? (row.userCount / totalUsers) * 100 : 0;
                return (
                  <div key={row.planId}>
                    <div className="flex justify-between mb-1.5 text-xs">
                      <span className="font-medium text-gray-700">{row.name}</span>
                      <span className="text-gray-500">{row.userCount} utilisateur{row.userCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Revenu mensuel estimé</p>
            <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-green-600" />
          Santé du système
        </h3>
        <p className="text-xs text-gray-500">Les métriques temps réel (latence, uptime) seront branchées sur l&apos;infra de supervision.</p>
      </div>
    </div>
  );
}
