import { useState } from 'react';
import { User } from '../../context/AuthContext';
import { createGdprRequest } from '../../lib/api/gdpr';
import { notify, notifyApiError } from '../../lib/notifications';
import {
  User as UserIcon, Mail, Phone, MapPin, Calendar, Shield,
  Bell, Globe, Lock, Eye, Download, Trash2, HardDrive, CreditCard,
  CheckCircle, AlertCircle, ChevronRight, Save, Camera, FileText,
  BarChart2, Package, RefreshCw, LogOut, Check
} from 'lucide-react';

interface AccountManagementProps {
  user: User;
  onLogout?: () => void;
}

type Tab = 'profile' | 'storage' | 'subscription' | 'gdpr';

interface StorageItem {
  label: string;
  used: number;
  color: string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    storage: '500 MB',
    features: ['Scan IA limité (5/mois)', 'Documents basiques', 'Support email'],
    color: 'gray',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '4,99€/mois',
    storage: '5 GB',
    features: ['Scan IA illimité', 'Gestion documents avancée', 'Partage sécurisé', 'Support prioritaire'],
    color: 'blue',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9,99€/mois',
    storage: '20 GB',
    features: ['Tout Starter', 'IA rapports avancés', 'Export multi-formats', 'Accès API', 'Support dédié'],
    color: 'purple',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: 'Sur devis',
    storage: 'Illimité',
    features: ['Tout Pro', 'Stockage illimité', 'Multi-utilisateurs', 'SLA garanti 99.9%', 'Onboarding dédié'],
    color: 'rose',
  },
];

export function AccountManagement({ user, onLogout }: AccountManagementProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '+216 98 765 432',
    dateOfBirth: '15/03/1985',
    address: '12 Avenue Habib Bourguiba',
    city: 'Tunis',
    country: 'Tunisie',
    language: 'Français',
    timezone: 'UTC+1 (Tunis)',
    notifications: {
      results: true,
      appointments: true,
      newsletter: false,
      security: true,
    }
  });
  const [currentPlan] = useState('starter');
  const [gdprConsents, setGdprConsents] = useState({
    analytics: true,
    marketing: false,
    thirdParty: false,
    medicalResearch: false,
  });
  const [gdprSubmitting, setGdprSubmitting] = useState(false);

  const submitPortabilityRequest = async () => {
    setGdprSubmitting(true);
    try {
      await createGdprRequest({
        type: 'Portabilité — export des données',
        notes: `Demandé depuis le compte ${user.email}`,
      });
      notify.gdprRequestCreated();
    } catch (e) {
      notifyApiError(e, 'Envoi de la demande impossible');
    } finally {
      setGdprSubmitting(false);
    }
  };

  const totalStorage = 5 * 1024; // 5 GB in MB
  const usedStorage = 1240; // MB
  const storagePercent = (usedStorage / totalStorage) * 100;

  const storageBreakdown: StorageItem[] = [
    { label: 'Imagerie médicale', used: 780, color: 'bg-blue-500' },
    { label: 'Documents PDF', used: 280, color: 'bg-purple-500' },
    { label: 'Ordonnances', used: 120, color: 'bg-rose-500' },
    { label: 'Autres', used: 60, color: 'bg-gray-400' },
  ];

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profil', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'storage', label: 'Stockage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'subscription', label: 'Abonnement', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'gdpr', label: 'RGPD & Vie privée', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">Mon compte</h1>
        <p className="text-sm text-gray-500">Profil, stockage et abonnement</p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 text-green-800">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="font-medium text-sm">Modifications enregistrées</p>
        </div>
      )}

      {/* Tabs — scrollable sur mobile */}
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all font-medium text-xs flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                <UserIcon className="w-4 h-4 text-blue-600" />
                Informations personnelles
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium"
                >
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity text-xs font-medium flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Enregistrer
                  </button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {formData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md">
                    <Camera className="w-3 h-3 text-gray-600" />
                  </button>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{formData.name}</p>
                <p className="text-gray-500 text-xs capitalize">{user.role === 'patient' ? 'Patient' : 'Radiologue'}</p>
                <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Compte vérifié
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Nom complet', field: 'name' as const, icon: <UserIcon className="w-4 h-4" />, type: 'text' },
                { label: 'Email', field: 'email' as const, icon: <Mail className="w-4 h-4" />, type: 'email' },
                { label: 'Téléphone', field: 'phone' as const, icon: <Phone className="w-4 h-4" />, type: 'tel' },
                { label: 'Date de naissance', field: 'dateOfBirth' as const, icon: <Calendar className="w-4 h-4" />, type: 'text' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</div>
                    <input
                      type={f.type}
                      value={formData[f.field]}
                      onChange={e => isEditing && setFormData({ ...formData, [f.field]: e.target.value })}
                      readOnly={!isEditing}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors ${
                        isEditing
                          ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    />
                  </div>
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => isEditing && setFormData({ ...formData, address: e.target.value })}
                    readOnly={!isEditing}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors ${
                      isEditing
                        ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => isEditing && setFormData({ ...formData, city: e.target.value })}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                    isEditing ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <select
                  value={formData.country}
                  onChange={e => isEditing && setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                    isEditing ? 'border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                >
                  <option>Tunisie</option>
                  <option>France</option>
                  <option>Maroc</option>
                  <option>Algérie</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Sécurité
            </h2>
            <div className="space-y-3">
              {[
                { icon: <Lock className="w-5 h-5" />, title: 'Mot de passe', desc: 'Dernière modification il y a 3 mois', action: 'Modifier' },
                { icon: <Shield className="w-5 h-5" />, title: 'Authentification 2FA', desc: 'Sécurité renforcée recommandée', action: 'Activer' },
                { icon: <Eye className="w-5 h-5" />, title: "Historique d'accès", desc: 'Voir qui a accédé à votre compte', action: 'Voir' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Notifications
            </h2>
            <div className="space-y-3">
              {[
                { key: 'results' as const, label: 'Résultats examens', desc: 'Nouvelles analyses disponibles' },
                { key: 'appointments' as const, label: 'Rappels rendez-vous', desc: 'Notification 24h avant' },
                { key: 'security' as const, label: 'Alertes sécurité', desc: 'Connexions et accès inhabituels' },
                { key: 'newsletter' as const, label: 'Newsletter', desc: 'Actualités et conseils santé' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{n.label}</p>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      notifications: { ...formData.notifications, [n.key]: !formData.notifications[n.key] }
                    })}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      formData.notifications[n.key] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.notifications[n.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              Utilisation du stockage
            </h2>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-600 text-sm">Espace utilisé</span>
                <span className="font-bold text-gray-900">{(usedStorage / 1024).toFixed(2)} GB / 5 GB</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    storagePercent > 80 ? 'bg-red-500' : storagePercent > 60 ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-500 to-rose-500'
                  }`}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{storagePercent.toFixed(1)}% utilisé</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mt-6">
              {storageBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900">{item.used} MB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.used / usedStorage) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage by plan */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Documents', count: 24, size: '280 MB', icon: '📄', color: 'blue' },
              { title: 'Imagerie médicale', count: 8, size: '780 MB', icon: '🩻', color: 'purple' },
              { title: 'Ordonnances', count: 12, size: '120 MB', icon: '💊', color: 'rose' },
            ].map(item => (
              <div key={item.title} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-xl p-5`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600 mt-1">{item.count} fichiers • {item.size}</p>
              </div>
            ))}
          </div>

          {storagePercent > 70 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Stockage bientôt plein</p>
                <p className="text-sm text-amber-700 mt-1">Vous avez utilisé {storagePercent.toFixed(0)}% de votre espace. Pensez à mettre à niveau votre abonnement.</p>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="mt-2 text-sm text-amber-800 font-medium underline hover:no-underline"
                >
                  Voir les options →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Abonnement actuel
            </h2>
            <div className="flex items-center gap-3 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">⚡</div>
              <div className="flex-1">
                <p className="font-bold text-blue-900">Plan Starter</p>
                <p className="text-sm text-blue-700">4,99€/mois • 5 GB stockage</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Actif</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Prochaine facturation</p>
                <p className="font-semibold text-gray-900">1 Mai 2026</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Moyen de paiement</p>
                <p className="font-semibold text-gray-900">•••• 4242</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <RefreshCw className="w-4 h-4" />
                Modifier le paiement
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                Résilier l'abonnement
              </button>
            </div>
          </div>

          {/* Plans */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Changer de formule</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
                    plan.id === currentPlan
                      ? 'border-blue-500 shadow-lg shadow-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-rose-500 text-white text-xs rounded-full font-medium whitespace-nowrap">
                      ⭐ Populaire
                    </span>
                  )}
                  {plan.id === currentPlan && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 text-blue-600 text-xs font-medium">
                      <Check className="w-4 h-4" /> Actuel
                    </span>
                  )}
                  <h4 className="font-bold text-gray-900 text-lg">{plan.name}</h4>
                  <p className="text-2xl font-bold mt-2 mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{plan.price}</p>
                  <p className="text-sm text-gray-500 mb-4">💾 {plan.storage}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={plan.id === currentPlan}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                      plan.id === currentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-rose-500 text-white hover:opacity-90 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {plan.id === currentPlan ? 'Plan actuel' : plan.id === 'enterprise' ? 'Contacter' : 'Choisir ce plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GDPR Tab */}
      {activeTab === 'gdpr' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Conformité RGPD — Règlement Général sur la Protection des Données</h3>
                <p className="text-sm text-blue-700">
                  Laura AI respecte le RGPD (UE 2016/679). Vos données médicales sont hébergées sur des serveurs certifiés HDS (Hébergeur de Données de Santé) en France. Vous disposez de droits étendus sur vos données personnelles.
                </p>
              </div>
            </div>
          </div>

          {/* Consents */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Gestion des consentements</h2>
            <div className="space-y-4">
              {[
                {
                  key: 'analytics' as const,
                  label: 'Analyses et statistiques',
                  desc: 'Données anonymisées pour améliorer le service',
                  required: false,
                },
                {
                  key: 'marketing' as const,
                  label: 'Communications marketing',
                  desc: 'Offres et nouveautés Laura AI',
                  required: false,
                },
                {
                  key: 'thirdParty' as const,
                  label: 'Partage avec partenaires',
                  desc: 'Partage avec des prestataires tiers sélectionnés',
                  required: false,
                },
                {
                  key: 'medicalResearch' as const,
                  label: 'Recherche médicale anonymisée',
                  desc: 'Contribution aux avancées médicales (données anonymisées)',
                  required: false,
                },
              ].map(c => (
                <div key={c.key} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{c.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                  <button
                    onClick={() => setGdprConsents({ ...gdprConsents, [c.key]: !gdprConsents[c.key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                      gdprConsents[c.key] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      gdprConsents[c.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900 text-sm">Données médicales (obligatoire)</p>
                  <p className="text-xs text-green-700 mt-0.5">Nécessaire au fonctionnement du service</p>
                </div>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">Obligatoire</span>
              </div>
            </div>
          </div>

          {/* Rights */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Vos droits RGPD</h2>
            <div className="space-y-3">
              {[
                {
                  icon: <Download className="w-5 h-5 text-blue-600" />,
                  title: 'Droit d\'accès et portabilité',
                  desc: 'Télécharger toutes vos données personnelles au format JSON/PDF',
                  action: 'Exporter mes données',
                  color: 'blue',
                },
                {
                  icon: <RefreshCw className="w-5 h-5 text-purple-600" />,
                  title: 'Droit de rectification',
                  desc: 'Demander la correction de données inexactes',
                  action: 'Demander rectification',
                  color: 'purple',
                },
                {
                  icon: <Eye className="w-5 h-5 text-gray-600" />,
                  title: "Droit d'opposition",
                  desc: 'Vous opposer au traitement de vos données',
                  action: "M'opposer",
                  color: 'gray',
                },
                {
                  icon: <Trash2 className="w-5 h-5 text-red-600" />,
                  title: "Droit à l'effacement",
                  desc: 'Supprimer définitivement votre compte et toutes vos données',
                  action: 'Supprimer mon compte',
                  color: 'red',
                },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-4 border border-${item.color === 'red' ? 'red' : 'gray'}-200 rounded-xl hover:bg-gray-50 transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={gdprSubmitting}
                    onClick={i === 0 ? () => void submitPortabilityRequest() : undefined}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    item.color === 'red'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}>
                    {i === 0 && gdprSubmitting ? 'Envoi…' : item.action}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
              <p>🔒 Vos données sont chiffrées avec AES-256 et stockées sur des serveurs HDS certifiés.</p>
              <p>📋 DPO (Délégué à la Protection des Données) : dpo@laura-ai.fr</p>
              <p>📞 Pour toute demande RGPD, délai de réponse : 30 jours max (conformément à l'article 12 du RGPD).</p>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-gray-600" />
              Journal d'activité (30 derniers jours)
            </h2>
            <div className="space-y-2">
              {[
                { date: '01/04/2026 09:23', action: 'Connexion', ip: '41.229.x.x', device: 'Chrome / macOS' },
                { date: '31/03/2026 14:45', action: 'Document ajouté', ip: '41.229.x.x', device: 'Safari / iPhone' },
                { date: '28/03/2026 11:02', action: 'Profil modifié', ip: '41.229.x.x', device: 'Chrome / Windows' },
                { date: '25/03/2026 16:30', action: 'Export données', ip: '41.229.x.x', device: 'Firefox / Linux' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className="text-gray-400 ml-2 text-xs">{log.device}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">{log.date}</p>
                    <p className="text-gray-400 text-xs">{log.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Zone de danger</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}