/** @deprecated Legacy dashboard component not used by routed app (`routes.tsx`). */
import { useState } from 'react';
import { User } from '../App';
import {
  Home, Calendar, Users, Settings, LogOut, Bell, Search,
  Menu, X, Heart, Clock, Image as ImageIcon, FileText, BarChart,
  Stethoscope, Activity, ClipboardList
} from 'lucide-react';
import { DoctorHome } from './doctor/DoctorHome';
import { DoctorAppointments } from './doctor/DoctorAppointments';
import { AvailabilitySettings } from './doctor/AvailabilitySettings';
import { PatientMedicalRecord } from './doctor/PatientMedicalRecord';
import { DoctorPatients } from './doctor/DoctorPatients';
import { DicomViewer } from './doctor/DicomViewer';
import { DoctorSettings } from './doctor/DoctorSettings';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

type DoctorTabType = 'home' | 'appointments' | 'patients' | 'availability' | 'dicom' | 'reports' | 'settings';

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<DoctorTabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const menuItems = [
    { id: 'home' as DoctorTabType, label: 'Accueil', icon: Home },
    { id: 'appointments' as DoctorTabType, label: 'RDV', icon: Calendar, badge: 3 },
    { id: 'patients' as DoctorTabType, label: 'Patients', icon: Users },
    { id: 'dicom' as DoctorTabType, label: 'DICOM', icon: ImageIcon },
    { id: 'settings' as DoctorTabType, label: 'Réglages', icon: Settings },
  ];

  const handleTabChange = (tab: DoctorTabType) => {
    setActiveTab(tab);
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  const handleBackToAppointments = () => {
    setSelectedPatientId(null);
    setActiveTab('appointments');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-rose-700 bg-clip-text text-transparent">
                  Laura AI
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2 ml-8">
                <button
                  onClick={() => handleTabChange('home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'home'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Accueil</span>
                </button>
                <button
                  onClick={() => handleTabChange('appointments')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'appointments'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Rendez-vous</span>
                  <span className="ml-1 bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full">3</span>
                </button>
                <button
                  onClick={() => handleTabChange('availability')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'availability'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-sm font-medium">Disponibilités</span>
                </button>
                <button
                  onClick={() => handleTabChange('patients')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'patients'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Patients</span>
                </button>
                <button
                  onClick={() => handleTabChange('dicom')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'dicom'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">DICOM</span>
                </button>
                <button
                  onClick={() => handleTabChange('reports')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'reports'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Rapports</span>
                </button>
                <button
                  onClick={() => handleTabChange('settings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Paramètres</span>
                </button>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Médecin</p>
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
        <div className="flex-1 overflow-auto">
          {activeTab === 'home' && <DoctorHome user={user} onNavigate={setActiveTab} />}
          {activeTab === 'appointments' && <DoctorAppointments onViewPatient={handleViewPatient} />}
          {activeTab === 'availability' && <AvailabilitySettings />}
          {activeTab === 'patients' && (
            selectedPatientId ? (
              <PatientMedicalRecord 
                patientId={selectedPatientId} 
                onBack={handleBackToAppointments}
              />
            ) : (
              <DoctorPatients onViewPatient={handleViewPatient} />
            )
          )}
          {activeTab === 'dicom' && <DicomViewer />}
          {activeTab === 'reports' && <ReportsPlaceholder />}
          {activeTab === 'settings' && <DoctorSettings />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'text-rose-600'
                    : 'text-gray-600'
                }`}
              >
                {item.badge && (
                  <span className="absolute top-1 right-2 w-4 h-4 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
                <Icon className={`w-6 h-6 ${activeTab === item.id ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
                {activeTab === item.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-rose-600 to-rose-700 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function StatCard({ label, value, color, onClick }: {
  label: string;
  value: string;
  color: 'rose' | 'orange' | 'blue' | 'green';
  onClick?: () => void;
}) {
  const colors = {
    rose: 'from-rose-500 to-rose-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-white text-left hover:scale-105 transition-transform`}
    >
      <div className="text-sm opacity-90 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </button>
  );
}

function QuickActionButton({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors text-left"
    >
      <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
        {icon}
      </div>
      <span className="font-medium text-gray-900 text-sm">{label}</span>
    </button>
  );
}

function AppointmentPreview({ time, patient, reason, status }: {
  time: string;
  patient: string;
  reason: string;
  status: 'pending' | 'confirmed';
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center min-w-[60px]">
        <div className="text-lg font-bold text-gray-900">{time}</div>
        <div className="text-xs text-gray-500">30min</div>
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{patient}</div>
        <div className="text-sm text-gray-600">{reason}</div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === 'pending' 
          ? 'bg-orange-100 text-orange-700' 
          : 'bg-green-100 text-green-700'
      }`}>
        {status === 'pending' ? 'En attente' : 'Confirmé'}
      </div>
    </div>
  );
}

function ReportsPlaceholder() {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapports médicaux</h3>
      <p className="text-gray-600">Fonctionnalité en cours de développement</p>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  badge 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors mb-1 text-sm ${
        active 
          ? 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function MobileNavItem({ 
  icon, 
  label, 
  active, 
  onClick,
  badge
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative ${
        active 
          ? 'text-rose-600' 
          : 'text-gray-600'
      }`}
    >
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}