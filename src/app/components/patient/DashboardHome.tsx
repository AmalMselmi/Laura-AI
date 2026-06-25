import { User } from '../../App';
import { 
  Calendar, FileText, Activity, TrendingUp, AlertCircle, 
  Heart, Pill, FileCheck, ChevronRight, Clock, User as UserIcon,
  Sparkles, MessageCircle, HardDrive
} from 'lucide-react';

interface DashboardHomeProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export function DashboardHome({ user, onNavigate }: DashboardHomeProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bonjour' : currentHour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-600">Voici un aperçu de votre santé aujourd'hui</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          label="Documents"
          value="24"
          bgColor="bg-blue-50"
          onClick={() => onNavigate('records')}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-green-600" />}
          label="Prochains RDV"
          value="2"
          bgColor="bg-green-50"
          onClick={() => onNavigate('appointments')}
        />
        <StatCard
          icon={<Heart className="w-6 h-6 text-red-600" />}
          label="Suivi actif"
          value="Bosniak IIF"
          bgColor="bg-red-50"
          onClick={() => onNavigate('carnet')}
        />
        <StatCard
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          label="Dernier examen"
          value="Il y a 14j"
          bgColor="bg-purple-50"
          onClick={() => onNavigate('records')}
        />
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">Rappel : Contrôle médical à planifier</h3>
          <p className="text-sm text-amber-800 mb-3">
            Votre suivi Bosniak IIF nécessite un contrôle par imagerie dans les 2 prochaines semaines.
          </p>
          <button 
            onClick={() => onNavigate('appointments')}
            className="text-sm font-medium text-amber-900 hover:text-amber-700 underline"
          >
            Prendre rendez-vous maintenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Rendez-vous à venir</h2>
              <button 
                onClick={() => onNavigate('appointments')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <AppointmentCard
                date="25 Jan 2026"
                time="14:30"
                doctor="Dr. Leila Gharbi"
                specialty="Radiologie"
                location="Clinique El Manar, Tunis"
                type="IRM de contrôle"
              />
              <AppointmentCard
                date="12 Fév 2026"
                time="10:00"
                doctor="Dr. Mohamed Trabelsi"
                specialty="Néphrologie"
                location="Cabinet privé, Sousse"
                type="Consultation de suivi"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-2">
            <QuickAction
              icon={<Calendar className="w-5 h-5" />}
              label="Nouveau rendez-vous"
              onClick={() => onNavigate('appointments')}
            />
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label="Ajouter un document"
              onClick={() => onNavigate('records')}
            />
            <QuickAction
              icon={<Activity className="w-5 h-5" />}
              label="Scanner un document"
              onClick={() => onNavigate('scan')}
            />
            <QuickAction
              icon={<Heart className="w-5 h-5" />}
              label="Voir mon carnet"
              onClick={() => onNavigate('carnet')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Documents récents</h2>
            <button 
              onClick={() => onNavigate('records')}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <DocumentItem
              title="IRM abdominale"
              date="10 Jan 2026"
              type="Imagerie"
              doctor="Dr. Gharbi"
            />
            <DocumentItem
              title="Bilan sanguin complet"
              date="05 Jan 2026"
              type="Analyses"
              doctor="Dr. Ben Ahmed"
            />
            <DocumentItem
              title="Compte-rendu consultation"
              date="28 Déc 2025"
              type="Rapport"
              doctor="Dr. Trabelsi"
            />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-base sm:text-lg font-semibold">Recommandations IA</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Suivi médical</h3>
              <p className="text-xs sm:text-sm text-blue-100">
                Votre traitement Bosniak IIF est bien suivi. Pensez à planifier votre IRM de contrôle tous les 6 mois comme recommandé.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Prévention</h3>
              <p className="text-xs sm:text-sm text-blue-100">
                Vos bilans sanguins montrent de bons résultats. Continuez votre hygiène de vie actuelle.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('ai-recommendations')}
              className="w-full py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
            >
              Voir toutes les recommandations
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Outils & Services</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <QuickAccessCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="Assistant IA Médical"
            description="Posez vos questions santé 24/7"
            gradient="from-blue-600 to-blue-700"
            onClick={() => onNavigate('ai-chat')}
          />
          <QuickAccessCard
            icon={<HardDrive className="w-6 h-6" />}
            title="Augmenter stockage"
            description="Plus d'espace pour vos documents"
            gradient="from-rose-600 to-rose-700"
            onClick={() => onNavigate('storage')}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  bgColor,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  bgColor: string;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all text-left"
    >
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </button>
  );
}

function AppointmentCard({ 
  date, 
  time, 
  doctor, 
  specialty, 
  location, 
  type 
}: { 
  date: string; 
  time: string; 
  doctor: string; 
  specialty: string; 
  location: string; 
  type: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor}</h3>
            <p className="text-sm text-gray-600">{specialty}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{date}</p>
          <p className="text-sm text-gray-600">{time}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>{location}</span>
      </div>
      <div className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
        {type}
      </div>
    </div>
  );
}

function QuickAction({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
    >
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <span className="text-gray-900">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
    </button>
  );
}

function DocumentItem({ 
  title, 
  date, 
  type, 
  doctor 
}: { 
  title: string; 
  date: string; 
  type: string; 
  doctor: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <FileCheck className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{title}</h3>
        <p className="text-sm text-gray-600">{doctor} • {date}</p>
      </div>
      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">{type}</span>
    </div>
  );
}

function QuickAccessCard({ 
  icon, 
  title, 
  description,
  gradient,
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white text-left hover:shadow-lg transition-all group`}
    >
      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold mb-2 text-base sm:text-lg">{title}</h3>
      <p className="text-xs sm:text-sm text-white/80">{description}</p>
      <div className="mt-4 text-sm font-medium flex items-center gap-1">
        Découvrir
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
}
