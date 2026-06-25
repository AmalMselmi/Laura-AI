/** @deprecated Legacy dashboard component not used by routed app (`routes.tsx`). */
import { useState } from 'react';
import { User } from '../App';
import { Activity, LogOut, Home, Settings, FolderOpen, FileText, Clock } from 'lucide-react';
import { DicomFolderManager } from './radiologist/DicomFolderManager';
import { AccountManagement } from './account/AccountManagement';

interface RadiologistDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'home' | 'folders' | 'account';

export function RadiologistDashboard({ user, onLogout }: RadiologistDashboardProps) {
  const [currentView, setCurrentView] = useState<View>('home');

  const menuItems = [
    { id: 'home' as View, label: 'Accueil', icon: Home },
    { id: 'folders' as View, label: 'Dossiers', icon: FolderOpen },
    { id: 'account' as View, label: 'Compte', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent block">
                    Laura AI
                  </span>
                  <span className="text-xs text-gray-500">Radiologue Pro</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2 ml-8">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-500 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Radiologue</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && <RadiologistHome user={user} onNavigate={setCurrentView} />}
        {currentView === 'folders' && <DicomFolderManager />}
        {currentView === 'account' && <AccountManagement user={user} onLogout={onLogout} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${
                  currentView === item.id ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${currentView === item.id ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
                {currentView === item.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function RadiologistHome({ user, onNavigate }: { user: User; onNavigate: (v: View) => void }) {
  const stats = [
    { label: 'Dossiers actifs', value: 3, icon: '📁', color: 'blue' },
    { label: 'Rapports IA générés', value: 2, icon: '🧠', color: 'purple' },
    { label: 'Rapports finalisés', value: 1, icon: '✅', color: 'green' },
    { label: 'En attente validation', value: 1, icon: '⏳', color: 'orange' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Bienvenue, {user.name} 👋</h1>
        <p className="text-blue-50 text-lg">
          Plateforme de gestion DICOM professionnelle avec assistance IA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('folders')}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-left group border border-gray-100"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Dossiers patients DICOM</h3>
          <p className="text-gray-600">
            Organisez vos examens par patient et pathologie. Générez et éditez des rapports IA.
          </p>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-left group border border-gray-100"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mon compte</h3>
          <p className="text-gray-600">
            Gérez votre profil, votre stockage DICOM et votre abonnement professionnel.
          </p>
        </button>
      </div>

      {/* Workflow */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="font-bold text-gray-900 text-xl mb-6">🔄 Flux de travail Laura AI</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { step: '1', icon: '📁', title: 'Créer dossier', desc: 'Patient + Pathologie + Modalité' },
            { step: '2', icon: '📤', title: 'Importer DICOM', desc: 'Drag & drop multi-formats' },
            { step: '3', icon: '🧠', title: 'Rapport IA', desc: "Analyse automatique Laura AI" },
            { step: '4', icon: '✅', title: 'Valider', desc: 'Éditer, finaliser et exporter PDF' },
          ].map((s, i) => (
            <div key={s.step} className="relative">
              {i < 3 && <div className="hidden sm:block absolute top-5 left-full w-full h-0.5 bg-gray-200 z-0" style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem' }} />}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3">
                  {s.step}
                </div>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Formats acceptés</h3>
          <ul className="space-y-1.5 text-sm text-blue-800">
            <li>• DICOM (.dcm, .dicom) — IRM, Scanner, Radio</li>
            <li>• Images médicales (JPG, PNG haute résolution)</li>
            <li>• NIfTI (.nii, .gz) — Neuroimagerie</li>
            <li>• PDF — Comptes-rendus, notes cliniques</li>
          </ul>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-3">🔒 Sécurité & RGPD</h3>
          <ul className="space-y-1.5 text-sm text-purple-800">
            <li>✓ Hébergement HDS certifié (France)</li>
            <li>✓ Chiffrement AES-256 bout en bout</li>
            <li>✓ Conformité RGPD Art. 9 (données santé)</li>
            <li>✓ Journalisation des accès complète</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
