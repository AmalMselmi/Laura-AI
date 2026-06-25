/** @deprecated Legacy dashboard component not used by routed app (`routes.tsx`). */
import { useState } from 'react';
import { User } from '../App';
import { Upload, FileText, LogOut, Home, Settings, Activity } from 'lucide-react';
import { ScanDocument } from './patient/ScanDocument';
import { PatientDocuments } from './patient/PatientDocuments';
import { AccountManagement } from './account/AccountManagement';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'home' | 'scan' | 'documents' | 'account';

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [currentView, setCurrentView] = useState<View>('home');

  const menuItems = [
    { id: 'home' as View, label: 'Accueil', icon: Home },
    { id: 'scan' as View, label: 'Scanner', icon: Upload },
    { id: 'documents' as View, label: 'Documents', icon: FileText },
    { id: 'account' as View, label: 'Compte', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-rose-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent">
                  Laura AI
                </span>
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
                          ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white shadow-md'
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
                <p className="text-xs text-gray-500">Patient</p>
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
        {currentView === 'home' && <HomeView user={user} onNavigate={setCurrentView} />}
        {currentView === 'scan' && <ScanDocument />}
        {currentView === 'documents' && <PatientDocuments />}
        {currentView === 'account' && <AccountManagement user={user} onLogout={onLogout} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
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
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeView({ user, onNavigate }: { user: User; onNavigate: (view: View) => void }) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Bienvenue, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-blue-50 text-lg">
          Votre carnet de santé numérique sécurisé et intelligent
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('scan')}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-left group border border-gray-100"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Scanner un document</h3>
          <p className="text-gray-600">
            Analysez vos ordonnances et examens médicaux avec l'IA
          </p>
        </button>

        <button
          onClick={() => onNavigate('documents')}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-left group border border-gray-100"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mes documents</h3>
          <p className="text-gray-600">
            Classés par date, médecin et pathologie
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
            Profil, stockage et abonnement
          </p>
        </button>
      </div>

      {/* Storage Quick View */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Stockage utilisé
            </h3>
            <button onClick={() => onNavigate('account')} className="text-sm text-blue-600 hover:underline">Gérer →</button>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1.5">
              <span>1.2 GB utilisés</span>
              <span>5 GB total</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full">
              <div className="h-full bg-gradient-to-r from-blue-500 to-rose-500 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Plan Starter actif • 24% utilisé</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 text-lg">🔒 Sécurité & RGPD</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Chiffrement AES-256 end-to-end</li>
            <li>✓ Hébergement HDS certifié (France)</li>
            <li>✓ Conformité RGPD complète</li>
            <li>✓ Vous contrôlez 100% de vos données</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
