import { Calendar, Users, Clock, TrendingUp, AlertCircle, CheckCircle, FileText, Activity } from 'lucide-react';
import { User } from '../../App';

interface DoctorHomeProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export function DoctorHome({ user, onNavigate }: DoctorHomeProps) {
  // Données de démonstration
  const stats = {
    todayAppointments: 8,
    totalPatients: 142,
    pendingAppointments: 3,
    completedToday: 5
  };

  const todayAppointments = [
    { id: 1, time: '09:00', patient: 'Amira Ben Salah', reason: 'Suivi kyste rénal', status: 'completed' as const },
    { id: 2, time: '09:30', patient: 'Mohamed Trabelsi', reason: 'Contrôle diabète', status: 'completed' as const },
    { id: 3, time: '10:00', patient: 'Leila Gharbi', reason: 'Bilan sanguin', status: 'completed' as const },
    { id: 4, time: '11:00', patient: 'Karim Mansour', reason: 'Consultation générale', status: 'completed' as const },
    { id: 5, time: '11:30', patient: 'Samia Ayari', reason: 'Contrôle tension', status: 'completed' as const },
    { id: 6, time: '14:00', patient: 'Youssef Gharbi', reason: 'Première consultation', status: 'confirmed' as const },
    { id: 7, time: '14:30', patient: 'Nadia Khelifi', reason: 'Suivi traitement', status: 'confirmed' as const },
    { id: 8, time: '15:00', patient: 'Tarek Ben Ahmed', reason: 'Résultats analyses', status: 'pending' as const }
  ];

  const upcomingAppointments = todayAppointments.filter(apt => apt.status !== 'completed');

  const recentActivities = [
    { id: 1, type: 'appointment', message: 'Consultation complétée avec Amira Ben Salah', time: 'Il y a 2 heures' },
    { id: 2, type: 'patient', message: 'Nouveau patient ajouté: Youssef Gharbi', time: 'Il y a 3 heures' },
    { id: 3, type: 'report', message: 'Rapport médical généré pour Mohamed Trabelsi', time: 'Il y a 5 heures' },
    { id: 4, type: 'appointment', message: '3 nouveaux rendez-vous confirmés', time: 'Il y a 6 heures' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bonjour, Dr. {user.name.split(' ')[user.name.split(' ').length - 1]} 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Voici un aperçu de votre journée
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="RDV Aujourd'hui"
          value={stats.todayAppointments}
          color="blue"
          onClick={() => onNavigate('appointments')}
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Patients"
          value={stats.totalPatients}
          color="green"
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="En Attente"
          value={stats.pendingAppointments}
          color="orange"
          onClick={() => onNavigate('appointments')}
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Complétés"
          value={stats.completedToday}
          color="purple"
          onClick={() => onNavigate('appointments')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prochains Rendez-vous</h2>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Voir tout
            </button>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Aucun rendez-vous à venir</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            label="Voir Calendrier"
            onClick={() => onNavigate('appointments')}
          />
          <QuickActionButton
            icon={<Users className="w-5 h-5" />}
            label="Mes Patients"
            onClick={() => onNavigate('patients')}
          />
          <QuickActionButton
            icon={<Clock className="w-5 h-5" />}
            label="Disponibilités"
            onClick={() => onNavigate('availability')}
          />
          <QuickActionButton
            icon={<FileText className="w-5 h-5" />}
            label="Rapports"
            onClick={() => onNavigate('reports')}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick: () => void;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-white text-left hover:scale-105 transition-transform`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm opacity-90">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </button>
  );
}

function AppointmentCard({ appointment }: {
  appointment: {
    id: number;
    time: string;
    patient: string;
    reason: string;
    status: 'pending' | 'confirmed' | 'completed';
  };
}) {
  const statusColors = {
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200'
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Complété'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="text-center min-w-[60px]">
        <div className="text-lg font-bold text-gray-900">{appointment.time}</div>
        <div className="text-xs text-gray-500">30min</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{appointment.patient}</div>
        <div className="text-sm text-gray-600 truncate">{appointment.reason}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[appointment.status]}`}>
        {statusLabels[appointment.status]}
      </span>
    </div>
  );
}

function ActivityItem({ activity }: {
  activity: {
    id: number;
    type: string;
    message: string;
    time: string;
  };
}) {
  const getIcon = () => {
    switch (activity.type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'patient':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'report':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
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
