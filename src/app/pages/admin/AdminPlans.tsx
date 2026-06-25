import { useCallback, useEffect, useState } from 'react';
import { usePlans, Plan, formatQuota } from '../../context/PlansContext';
import { getAdminPlans, putAdminPlan } from '../../lib/api/admin';
import type { AdminPlanApi } from '../../types/api';
import {
  Edit3, CheckCircle, X, Save, Scan, Brain, HardDrive,
  CreditCard, Users, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react';

/**
 * Normalize plan.features from API / DB.
 * - JSON array sent as string → parse to string[].
 * - Corrupted list of single-character strings (JSON exploded) → rejoin and parse.
 */
function parsePlanFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    const strs = features.filter((x): x is string => typeof x === 'string');
    if (strs.length >= 8 && strs.every(s => s.length === 1)) {
      const merged = strs.join('').trim();
      if (merged.startsWith('[')) {
        try {
          const parsed = JSON.parse(merged) as unknown;
          if (Array.isArray(parsed)) {
            return parsed.filter((x): x is string => typeof x === 'string');
          }
        } catch {
          /* keep strs */
        }
      }
    }
    return strs;
  }
  if (typeof features === 'string') {
    const t = features.trim();
    if (!t) return [];
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter((x): x is string => typeof x === 'string');
        }
      } catch {
        /* ignore */
      }
    }
    return [t];
  }
  return [];
}

function planFromApi(p: AdminPlanApi): Plan {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    storageGB: p.storageGb,
    maxScans: p.maxScans,
    aiQuota: p.aiQuota,
    features: parsePlanFeatures(p.features as unknown),
    userCount: p.userCount,
    active: p.active,
  };
}

interface EditModalProps {
  plan: Plan;
  onSave: (p: Plan) => void;
  onClose: () => void;
}

function EditModal({ plan, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<Plan>({ ...plan });

  const setField = <K extends keyof Plan>(key: K, val: Plan[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const QuotaField = ({
    label, icon, fieldKey, unit,
  }: {
    label: string;
    icon: React.ReactNode;
    fieldKey: 'maxScans' | 'aiQuota' | 'storageGB';
    unit: string;
  }) => {
    const val = form[fieldKey] as number;
    const unlimited = val === -1;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {icon}
            {label}
          </label>
          <button
            type="button"
            onClick={() => setField(fieldKey, unlimited ? 0 : -1)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              unlimited ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {unlimited ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            Illimité
          </button>
        </div>
        {!unlimited && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={val}
              onChange={e => setField(fieldKey, Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">{unit}</span>
          </div>
        )}
        {unlimited && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
            ∞ Aucune limite appliquée
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Modifier — {plan.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">Enregistrement sur le serveur</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du plan</label>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <CreditCard className="inline w-3.5 h-3.5 mr-1" />Prix mensuel (€)
                </label>
                <input
                  type="number" step="0.01" min={0}
                  value={form.price}
                  onChange={e => setField('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quotas & Ressources</p>
              <QuotaField label="Scans IA / mois" icon={<Scan className="w-4 h-4 text-blue-500" />} fieldKey="maxScans" unit="scans/mois" />
              <QuotaField label="Analyses IA / mois" icon={<Brain className="w-4 h-4 text-purple-500" />} fieldKey="aiQuota" unit="analyses/mois" />
              <QuotaField label="Stockage cloud" icon={<HardDrive className="w-4 h-4 text-green-500" />} fieldKey="storageGB" unit="GB" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Plan actif</p>
                <p className="text-xs text-gray-500">Désactiver pour masquer aux nouveaux utilisateurs</p>
              </div>
              <button
                type="button"
                onClick={() => setField('active', !form.active)}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Les modifications sont enregistrées en base. Vérifiez l&apos;impact sur les utilisateurs existants.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
              Annuler
            </button>
            <button
              type="button"
              onClick={() => { onSave(form); onClose(); }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminPlans() {
  const { setPlans } = usePlans();
  const [plans, setLocalPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const reload = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const raw = await getAdminPlans();
      const mapped = raw.map(planFromApi);
      setLocalPlans(mapped);
      setPlans(mapped);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [setPlans]);

  useEffect(() => { void reload(); }, [reload]);

  const totalRevenue = plans.reduce((sum, p) => sum + (p.active ? p.price * p.userCount : 0), 0);

  const handleSave = async (updated: Plan) => {
    try {
      await putAdminPlan(updated.id, {
        name: updated.name,
        price: updated.price,
        storageGb: updated.storageGB,
        maxScans: updated.maxScans,
        aiQuota: updated.aiQuota,
        features: updated.features,
        active: updated.active,
      });
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur enregistrement');
    }
  };

  if (loading && plans.length === 0) {
    return <div className="text-sm text-gray-500">Chargement des plans…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Offres & Quotas</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Plans synchronisés avec l&apos;API administrateur</p>
      </div>

      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Revenu mensuel', value: `${totalRevenue.toFixed(2)} €`, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Plans actifs', value: plans.filter(p => p.active).length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Total abonnés', value: plans.reduce((s, p) => s + p.userCount, 0), color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${plan.active ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {plan.active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price} €`}
                    {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/mois</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <Users className="inline w-3 h-3 mr-1" />
                    {plan.userCount} utilisateur{plan.userCount !== 1 ? 's' : ''}
                    {plan.userCount > 0 && plan.price > 0 && (
                      <span className="ml-2 text-green-600">· {(plan.price * plan.userCount).toFixed(2)}€/mois</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPlan(plan)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  {
                    Icon: Scan,
                    label: 'Scans',
                    value: formatQuota(plan.maxScans, '/mois'),
                    color: 'bg-blue-50 text-blue-700 border-blue-100',
                  },
                  {
                    Icon: Brain,
                    label: 'IA',
                    value: formatQuota(plan.aiQuota, '/mois'),
                    color: 'bg-purple-50 text-purple-700 border-purple-100',
                  },
                  {
                    Icon: HardDrive,
                    label: 'Stockage',
                    value: formatQuota(plan.storageGB, ' GB'),
                    color: 'bg-green-50 text-green-700 border-green-100',
                  },
                ].map(({ Icon, label, value, color }) => (
                  <div key={label} className={`${color} border rounded-xl p-2.5 text-center`}>
                    <div className="mb-1 flex justify-center">
                      <Icon className="h-4 w-4 opacity-90" strokeWidth={2} aria-hidden />
                    </div>
                    <p className="text-xs font-bold leading-tight">{value}</p>
                    <p className="text-[10px] font-medium opacity-80">{label}</p>
                  </div>
                ))}
              </div>

              <ul className="space-y-2 border-t border-gray-100 pt-4">
                {plan.features.map((f, i) => (
                  <li
                    key={`${plan.id}-feat-${i}-${f.slice(0, 24)}`}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 fill-green-500/15 text-green-600" strokeWidth={2} />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-900 mb-2">ℹ️ Quotas</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>Illimité</strong> = valeur -1 en base</li>
          <li>• Les comptes existants conservent leur plan_id jusqu&apos;à changement manuel</li>
        </ul>
      </div>

      {editingPlan && (
        <EditModal
          plan={editingPlan}
          onSave={p => void handleSave(p)}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
