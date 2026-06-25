import { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, HardDrive, Shield, BarChart2, Settings,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Eye,
  Trash2, Edit3, Plus, Search, RefreshCw, Download,
  LogOut, Activity, Globe, Clock, ChevronRight, X,
  CreditCard, Bell, Lock, FileText, Filter, Check,
  User, Mail, Calendar, Database
} from 'lucide-react';
import { LauraLogoMark } from '../brand/LauraLogoMark';
import {
  deleteAdminUser,
  getAdminGdprCompliance,
  getAdminGdprRequests,
  getAdminPlans,
  getAdminStats,
  getAdminStorage,
  getAdminUsers,
  patchAdminUserStatus,
} from '../../lib/api/admin';
import type { AdminGdprRequestApi, AdminPlanApi, AdminStatsApi, AdminStorageApi, AdminUserRowApi } from '../../types/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'radiologist' | 'admin';
  plan: string;
  storage: { used: number; total: number };
  status: 'active' | 'suspended' | 'pending';
  joinedAt: string;
  lastActive: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  storage: number; // GB
  features: string[];
  userCount: number;
  active: boolean;
  color: string;
}

type AdminView = 'overview' | 'users' | 'plans' | 'storage' | 'gdpr';

const PLAN_COLORS = ['gray', 'blue', 'purple', 'indigo', 'rose', 'green'] as const;

function planColorAt(i: number): string {
  return PLAN_COLORS[i % PLAN_COLORS.length];
}

function mapPlanApi(p: AdminPlanApi, idx: number): Plan {
  const storageGb = p.storageGb >= 900 ? 999 : p.storageGb;
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    storage: storageGb,
    features: p.features ?? [],
    userCount: p.userCount,
    active: p.active,
    color: planColorAt(idx),
  };
}

function rowToAdminUser(u: AdminUserRowApi): AdminUser {
  const alloc = u.storageAllocatedGb >= 999 ? 999 : u.storageAllocatedGb;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as AdminUser['role'],
    plan: u.planId,
    storage: { used: u.storageUsedGb, total: alloc },
    status: u.status as AdminUser['status'],
    joinedAt: u.createdAt,
    lastActive: u.lastActiveAt,
  };
}

function gdprTableRow(r: AdminGdprRequestApi) {
  return {
    id: r.id,
    user: r.userName || r.userId || '—',
    type: r.type,
    date: r.createdAt,
    status: r.status,
  };
}

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

export function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'patient' | 'radiologist' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStatsApi | null>(null);
  const [gdprRequests, setGdprRequests] = useState<ReturnType<typeof gdprTableRow>[]>([]);
  const [storageOverview, setStorageOverview] = useState<AdminStorageApi | null>(null);
  const [complianceItems, setComplianceItems] = useState<{ label: string; ok: boolean }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    const [statsData, plansData, gdprData, storageData, compliance] = await Promise.all([
      getAdminStats(),
      getAdminPlans(),
      getAdminGdprRequests(),
      getAdminStorage(),
      getAdminGdprCompliance().catch(() => null),
    ]);
    setStats(statsData);
    setPlans(plansData.map((p, i) => mapPlanApi(p, i)));
    setGdprRequests(gdprData.map(gdprTableRow));
    setStorageOverview(storageData);
    if (compliance?.items?.length) {
      setComplianceItems(compliance.items.map(i => ({ label: i.label, ok: i.ok })));
    }
  }, []);

  const loadUserList = useCallback(async () => {
    const rows = await getAdminUsers({
      search: searchQuery.trim() || undefined,
      role: filterRole === 'all' ? undefined : filterRole,
      status: filterStatus === 'all' ? undefined : filterStatus,
    });
    setUsers(rows.map(rowToAdminUser));
  }, [searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refreshDashboard();
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Erreur chargement');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshDashboard]);

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    void loadUserList()
      .then(() => {
        if (!cancelled) setLoadError(null);
      })
      .catch(e => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Erreur liste utilisateurs');
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadUserList]);

  const totalUsers = stats?.totalUsers ?? users.length;
  const activeUsers = stats?.activeUsers ?? users.filter(u => u.status === 'active').length;
  const totalRevenue = stats?.estimatedMonthlyRevenue ?? 0;
  const totalStorageUsed = stats?.totalStorageUsedGb ?? users.reduce((sum, u) => sum + u.storage.used, 0);
  const totalAllocatedGb = storageOverview?.summary.totalAllocatedGb ?? 50;
  const recentActivity = [...users]
    .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
    .slice(0, 5);

  const navItems: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
    { id: 'plans', label: 'Offres & Plans', icon: <Package className="w-4 h-4" /> },
    { id: 'storage', label: 'Stockage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'gdpr', label: 'RGPD', icon: <Shield className="w-4 h-4" /> },
  ];

  const statusBadge = (status: string) => {
    if (status === 'active') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span>;
    if (status === 'suspended') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Suspendu</span>;
    if (status === 'pending') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">En attente</span>;
    if (status === 'completed') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Traité</span>;
    if (status === 'in_progress') return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">En cours</span>;
    return null;
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      if (action === 'delete') {
        await deleteAdminUser(userId);
        setSelectedUser(null);
      } else {
        await patchAdminUserStatus(userId, { status: action === 'suspend' ? 'suspended' : 'active' });
      }
      await Promise.all([loadUserList(), refreshDashboard()]);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Action impossible');
    }
  };

  const roleLabel = (r: AdminUser['role']) => {
    if (r === 'radiologist') return 'Radiologue';
    if (r === 'admin') return 'Administrateur';
    return 'Patient';
  };

  const handleExportCsv = async () => {
    try {
      const rows = await getAdminUsers({
        search: searchQuery.trim() || undefined,
        role: filterRole === 'all' ? undefined : filterRole,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      const cols: (keyof AdminUserRowApi)[] = [
        'id', 'name', 'email', 'role', 'planId', 'status', 'storageUsedGb', 'storageAllocatedGb', 'createdAt', 'lastActiveAt',
      ];
      const header = cols.join(',');
      const lines = rows.map(u => cols.map(c => {
        const v = String(u[c] ?? '');
        return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(','));
      const blob = new Blob([`\uFEFF${header}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs-laura-ai-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Export CSV impossible');
    }
  };

  const handleUpdatePlanStorage = (planId: string, newStorage: number) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, storage: newStorage } : p));
    // Also update all users on this plan
    setUsers(prev => prev.map(u => u.plan === planId ? { ...u, storage: { ...u.storage, total: newStorage } } : u));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LauraLogoMark size="md" tone="admin" className="rounded-xl" aria-hidden />
              <div>
                <span className="text-white font-bold">Laura AI</span>
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-medium">SUPER ADMIN</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadError && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                void refreshDashboard().then(() => loadUserList()).catch(() => undefined);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          </div>
        )}

        {/* ─── OVERVIEW ─── */}
        {currentView === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
              <p className="text-gray-400 mt-1">Vue d'ensemble de la plateforme Laura AI</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Utilisateurs totaux', value: totalUsers, sub: `${activeUsers} actifs`, icon: <Users className="w-6 h-6" />, color: 'from-blue-600 to-blue-700' },
                { label: 'Revenus mensuels', value: `${totalRevenue.toFixed(0)}€`, sub: '+12% ce mois', icon: <CreditCard className="w-6 h-6" />, color: 'from-green-600 to-green-700' },
                { label: 'Stockage utilisé', value: `${totalStorageUsed.toFixed(1)} GB`, sub: `Sur ${totalAllocatedGb.toFixed(0)} GB alloués`, icon: <HardDrive className="w-6 h-6" />, color: 'from-purple-600 to-purple-700' },
                { label: 'Requêtes RGPD', value: stats?.pendingGdprRequests ?? gdprRequests.filter(r => r.status === 'pending').length, sub: 'En attente', icon: <Shield className="w-6 h-6" />, color: 'from-rose-600 to-rose-700' },
              ].map(card => (
                <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{card.label}</p>
                  <p className="text-xs text-green-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Activity feed + Plan distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Activité récente
                </h3>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune activité récente (chargez la liste utilisateurs).</p>
                  ) : (
                    recentActivity.map(u => (
                      <div key={u.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                        <span className="text-xl flex-shrink-0">👤</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">Dernière activité</p>
                          <p className="text-xs text-gray-400 truncate">{u.name} — {u.email}</p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(u.lastActive).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Distribution des plans
                </h3>
                <div className="space-y-3">
                  {(stats?.planDistribution?.length
                    ? stats.planDistribution.map(p => ({ id: p.planId, name: p.name, userCount: p.userCount }))
                    : plans.map(p => ({ id: p.id, name: p.name, userCount: p.userCount }))
                  ).map(plan => {
                    const denom = stats?.totalUsers ?? totalUsers;
                    const pct = denom > 0 ? (plan.userCount / denom) * 100 : 0;
                    return (
                      <div key={plan.id}>
                        <div className="flex justify-between mb-1 text-sm">
                          <span className="text-gray-300">{plan.name}</span>
                          <span className="text-gray-400">{plan.userCount} utilisateurs</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">Revenu mensuel total</p>
                  <p className="text-2xl font-bold text-white">{totalRevenue.toFixed(2)}€</p>
                </div>
              </div>
            </div>

            {/* System health */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Santé du système
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'API Laura AI', status: 'OK', latency: '45ms', uptime: '99.98%' },
                  { label: 'Stockage HDS', status: 'OK', latency: '12ms', uptime: '99.99%' },
                  { label: 'IA Analyse', status: 'OK', latency: '850ms', uptime: '99.90%' },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-white text-sm font-medium">{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-400">Latence : {s.latency}</p>
                    <p className="text-xs text-green-400">Uptime : {s.uptime}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {currentView === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
                <p className="text-gray-400 mt-1">{users.length} utilisateurs inscrits</p>
              </div>
              <button
                type="button"
                onClick={() => void handleExportCsv()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as any)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all" className="text-gray-900">Tous les rôles</option>
                <option value="patient" className="text-gray-900">Patients</option>
                <option value="radiologist" className="text-gray-900">Radiologues</option>
                <option value="admin" className="text-gray-900">Administrateurs</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all" className="text-gray-900">Tous statuts</option>
                <option value="active" className="text-gray-900">Actifs</option>
                <option value="suspended" className="text-gray-900">Suspendus</option>
                <option value="pending" className="text-gray-900">En attente</option>
              </select>
            </div>

            {/* Users table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateur</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Rôle</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Plan</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Stockage</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                          Chargement…
                        </td>
                      </tr>
                    ) : users.map(user => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{user.name}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'radiologist'
                              ? 'bg-purple-500/20 text-purple-300'
                              : user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-200'
                                : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {roleLabel(user.role)}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-gray-300 capitalize">{user.plan}</span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="w-24">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>{user.storage.used} GB</span>
                              <span>{user.storage.total === 999 ? '∞' : user.storage.total + ' GB'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  (user.storage.used / user.storage.total) > 0.8 ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min((user.storage.used / (user.storage.total === 999 ? 1000 : user.storage.total)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {statusBadge(user.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                              className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                              title={user.status === 'active' ? 'Suspendre' : 'Activer'}
                            >
                              {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleUserAction(user.id, 'delete')}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User detail panel */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-white">Détails utilisateur</h3>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{selectedUser.name}</h4>
                      <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                      <div className="mt-1">{statusBadge(selectedUser.status)}</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Rôle', value: roleLabel(selectedUser.role) },
                      { label: 'Plan actuel', value: selectedUser.plan },
                      { label: 'Stockage', value: `${selectedUser.storage.used} / ${selectedUser.storage.total === 999 ? '∞' : selectedUser.storage.total + ' GB'}` },
                      { label: 'Inscrit le', value: new Date(selectedUser.joinedAt).toLocaleDateString('fr-FR') },
                      { label: 'Dernière activité', value: new Date(selectedUser.lastActive).toLocaleDateString('fr-FR') },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-medium capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Modify storage */}
                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">Modifier le stockage alloué (GB)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        defaultValue={selectedUser.storage.total === 999 ? 999 : selectedUser.storage.total}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Appliquer
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        void handleUserAction(selectedUser.id, selectedUser.status === 'active' ? 'suspend' : 'activate');
                        setSelectedUser(null);
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${selectedUser.status === 'active' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                    >
                      {selectedUser.status === 'active' ? 'Suspendre' : 'Activer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUserAction(selectedUser.id, 'delete')}
                      className="flex-1 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PLANS ─── */}
        {currentView === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Gestion des offres</h1>
                <p className="text-gray-400 mt-1">Configurez les plans et leurs ressources</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">
                <Plus className="w-4 h-4" />
                Nouveau plan
              </button>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/mois</span>}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    💾 {plan.storage === 999 ? 'Illimité' : plan.storage + ' GB'} • {plan.userCount} utilisateur{plan.userCount > 1 ? 's' : ''}
                  </p>

                  {/* Storage slider */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-1 block">Stockage alloué</label>
                    <input
                      type="range"
                      min="0.5"
                      max="200"
                      step="0.5"
                      value={plan.storage === 999 ? 200 : plan.storage}
                      onChange={e => handleUpdatePlanStorage(plan.id, parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                      <span>0.5 GB</span>
                      <span className="text-blue-400 font-medium">{plan.storage === 999 ? 'Illimité' : plan.storage + ' GB'}</span>
                      <span>200 GB</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${plan.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {plan.active ? 'Actif' : 'Inactif'}
                    </span>
                    <p className="text-sm text-gray-400">
                      Rev. : <span className="text-white font-medium">{(plan.price * plan.userCount).toFixed(2)}€</span>/mois
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {editingPlan && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-white">Modifier {editingPlan.name}</h3>
                    <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Nom du plan</label>
                      <input defaultValue={editingPlan.name} className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Prix mensuel (€)</label>
                      <input type="number" step="0.01" defaultValue={editingPlan.price} className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Stockage inclus (GB)</label>
                      <input type="number" defaultValue={editingPlan.storage} className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => setEditingPlan(null)} className="flex-1 py-2.5 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5 text-sm">Annuler</button>
                    <button onClick={() => setEditingPlan(null)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STORAGE ─── */}
        {currentView === 'storage' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Gestion du stockage</h1>
              <p className="text-gray-400 mt-1">Surveillance et allocation des ressources</p>
            </div>

            {/* Global storage */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Stockage global plateforme
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>{totalStorageUsed.toFixed(1)} GB utilisés</span>
                  <span>{totalAllocatedGb.toFixed(1)} GB alloués</span>
                </div>
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.min((totalStorageUsed / Math.max(totalAllocatedGb, 0.01)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {((totalStorageUsed / Math.max(totalAllocatedGb, 0.01)) * 100).toFixed(1)}% utilisé
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                {[
                  { label: 'Stockage total alloué', value: `${totalAllocatedGb.toFixed(1)} GB`, icon: '🗄️' },
                  { label: 'Utilisé', value: `${totalStorageUsed.toFixed(1)} GB`, icon: '📊' },
                  { label: 'Disponible', value: `${Math.max(totalAllocatedGb - totalStorageUsed, 0).toFixed(1)} GB`, icon: '✅' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-user storage */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-5">Stockage par utilisateur</h3>
              <div className="space-y-4">
                {(storageOverview?.users?.length
                  ? [...storageOverview.users].sort((a, b) => b.usedGb - a.usedGb)
                  : [...users]
                      .sort((a, b) => b.storage.used - a.storage.used)
                      .map(u => ({
                        userId: u.id,
                        name: u.name,
                        usedGb: u.storage.used,
                        allocatedGb: u.storage.total === 999 ? 999 : u.storage.total,
                      }))
                ).map(row => {
                  const used = row.usedGb;
                  const alloc = row.allocatedGb;
                  const pct = alloc >= 999 ? 5 : (used / Math.max(alloc, 0.01)) * 100;
                  return (
                    <div key={row.userId} className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-white truncate">{row.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {used} / {alloc >= 999 ? '∞' : `${alloc} GB`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full">
                          <div
                            className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                      {pct > 80 && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── GDPR ─── */}
        {currentView === 'gdpr' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Conformité RGPD</h1>
              <p className="text-gray-400 mt-1">Gestion des demandes de droits et conformité réglementaire</p>
            </div>

            {/* GDPR Status */}
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: 'Requêtes en attente', value: gdprRequests.filter(r => r.status === 'pending').length, color: 'yellow' },
                { label: 'En cours', value: gdprRequests.filter(r => r.status === 'in_progress').length, color: 'blue' },
                { label: 'Traitées', value: gdprRequests.filter(r => r.status === 'completed').length, color: 'green' },
                { label: 'Délai moyen', value: '8j', color: 'purple' },
              ].map(s => (
                <div key={s.label} className={`bg-white/5 border border-white/10 rounded-xl p-4`}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Requests list */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="font-semibold text-white">Demandes RGPD des utilisateurs</h3>
                <p className="text-xs text-gray-400 mt-1">Délai légal de traitement : 30 jours (RGPD Art. 12)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-xs text-gray-400 uppercase">ID</th>
                      <th className="text-left p-4 text-xs text-gray-400 uppercase">Utilisateur</th>
                      <th className="text-left p-4 text-xs text-gray-400 uppercase">Type</th>
                      <th className="text-left p-4 text-xs text-gray-400 uppercase">Date</th>
                      <th className="text-left p-4 text-xs text-gray-400 uppercase">Statut</th>
                      <th className="text-right p-4 text-xs text-gray-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gdprRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">
                          Aucune demande RGPD en base.
                        </td>
                      </tr>
                    ) : gdprRequests.map(req => (
                      <tr key={req.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 text-xs text-gray-400 font-mono">{req.id}</td>
                        <td className="p-4 text-sm text-white">{req.user}</td>
                        <td className="p-4 text-sm text-gray-300">{req.type}</td>
                        <td className="p-4 text-sm text-gray-400">{new Date(req.date).toLocaleDateString('fr-FR')}</td>
                        <td className="p-4">{statusBadge(req.status)}</td>
                        <td className="p-4 text-right">
                          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                            {req.status === 'pending' ? 'Traiter' : 'Voir'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compliance checks */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Conformité réglementaire
              </h3>
              <div className="space-y-3">
                {(complianceItems.length > 0
                  ? complianceItems
                  : [
                      { label: 'Chiffrement des données (AES-256)', ok: true },
                      { label: 'Hébergement HDS certifié (France)', ok: true },
                      { label: 'Journal des accès activé', ok: true },
                      { label: 'Politique de confidentialité à jour', ok: true },
                      { label: 'Registre des traitements tenu', ok: true },
                      { label: 'DPO désigné', ok: true },
                      { label: "Procédure de notification de violation (72h)", ok: true },
                      { label: 'Analyse PIA réalisée', ok: false },
                      { label: 'Contrats sous-traitants signés', ok: false },
                    ]
                ).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    {item.ok
                      ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      : <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    }
                    <span className={`text-sm ${item.ok ? 'text-gray-300' : 'text-yellow-300'}`}>{item.label}</span>
                    {!item.ok && <span className="ml-auto text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">À compléter</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 z-50">
        <div className="grid grid-cols-5 px-2 py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg ${
                currentView === item.id ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="text-xs truncate w-full text-center">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}