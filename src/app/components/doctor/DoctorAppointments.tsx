import { useState } from 'react';
import { 
  Calendar, Clock, User, Check, X, Phone, Video, Building,
  ChevronRight, Filter, Search, FileText
} from 'lucide-react';

export function DoctorAppointments({ onViewPatient }: { onViewPatient?: (patientId: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const appointments = [
    {
      id: '1',
      patient: {
        id: 'p1',
        name: 'Amira Ben Salah',
        age: 42,
        gender: 'F',
        phone: '+216 98 765 432',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
      },
      date: '2026-02-05',
      time: '09:00',
      duration: 30,
      type: 'in-person',
      status: 'pending',
      reason: 'Suivi kyste rénal Bosniak IIF',
      notes: 'Demande de consultation pour résultats IRM récents',
      createdAt: '2026-02-01'
    },
    {
      id: '2',
      patient: {
        id: 'p2',
        name: 'Mohamed Trabelsi',
        age: 58,
        gender: 'M',
        phone: '+216 97 123 456',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      },
      date: '2026-02-05',
      time: '10:00',
      duration: 30,
      type: 'video',
      status: 'confirmed',
      reason: 'Contrôle tension artérielle',
      notes: 'Patient hypertendu, contrôle mensuel',
      createdAt: '2026-01-28'
    },
    {
      id: '3',
      patient: {
        id: 'p3',
        name: 'Leila Gharbi',
        age: 35,
        gender: 'F',
        phone: '+216 99 234 567',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
      },
      date: '2026-02-05',
      time: '14:00',
      duration: 30,
      type: 'in-person',
      status: 'confirmed',
      reason: 'Bilan annuel',
      notes: '',
      createdAt: '2026-01-30'
    }
  ];

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const todayCount = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch = !searchQuery || 
      apt.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAccept = (id: string) => {
    alert(`Rendez-vous ${id} accepté`);
  };

  const handleReject = (id: string) => {
    alert(`Rendez-vous ${id} refusé`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mes rendez-vous</h1>
        <p className="text-sm sm:text-base text-gray-600">Gérez vos consultations et confirmez les demandes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Aujourd'hui"
          value={todayCount}
          color="blue"
        />
        <StatCard
          label="En attente"
          value={pendingCount}
          color="orange"
          highlight
        />
        <StatCard
          label="Cette semaine"
          value={12}
          color="green"
        />
        <StatCard
          label="Ce mois"
          value={48}
          color="purple"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un patient ou motif..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <FilterButton
              label="Tous"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              count={appointments.length}
            />
            <FilterButton
              label="En attente"
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              count={pendingCount}
              color="orange"
            />
            <FilterButton
              label="Confirmés"
              active={filter === 'confirmed'}
              onClick={() => setFilter('confirmed')}
              count={appointments.filter(a => a.status === 'confirmed').length}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
            <p className="text-gray-600">Aucun rendez-vous ne correspond à vos critères</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onAccept={handleAccept}
              onReject={handleReject}
              onViewPatient={onViewPatient}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, highlight }: {
  label: string;
  value: number;
  color: 'blue' | 'orange' | 'green' | 'purple';
  highlight?: boolean;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-white ${highlight ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}>
      <div className="text-sm opacity-90 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick, count, color = 'blue' }: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  color?: 'blue' | 'orange' | 'green';
}) {
  const colors = {
    blue: 'bg-blue-600 text-white',
    orange: 'bg-orange-600 text-white',
    green: 'bg-green-600 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
        active 
          ? colors[color]
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        active ? 'bg-white/20' : 'bg-gray-200'
      }`}>
        {count}
      </span>
    </button>
  );
}

function AppointmentCard({ appointment, onAccept, onReject, onViewPatient }: {
  appointment: any;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewPatient?: (patientId: string) => void;
}) {
  const statusColors = {
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé'
  };

  const typeIcons = {
    'in-person': <Building className="w-4 h-4" />,
    'video': <Video className="w-4 h-4" />,
    'phone': <Phone className="w-4 h-4" />
  };

  const typeLabels = {
    'in-person': 'Cabinet',
    'video': 'Vidéo',
    'phone': 'Téléphone'
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all ${
      appointment.status === 'pending' ? 'border-orange-300' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        {/* Patient Photo */}
        <img
          src={appointment.patient.photo}
          alt={appointment.patient.name}
          className="w-16 h-16 rounded-full object-cover"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {appointment.patient.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{appointment.patient.age} ans • {appointment.patient.gender === 'F' ? 'Femme' : 'Homme'}</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {appointment.patient.phone}
                </span>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[appointment.status as keyof typeof statusColors]}`}>
              {statusLabels[appointment.status as keyof typeof statusLabels]}
            </span>
          </div>

          {/* Appointment Details */}
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {new Date(appointment.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{appointment.time} ({appointment.duration}min)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {typeIcons[appointment.type as keyof typeof typeIcons]}
              <span className="font-medium">{typeLabels[appointment.type as keyof typeof typeLabels]}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-1">Motif de consultation :</p>
            <p className="text-sm text-gray-700">{appointment.reason}</p>
            {appointment.notes && (
              <>
                <p className="text-sm font-medium text-gray-900 mt-2 mb-1">Notes du patient :</p>
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {appointment.status === 'pending' && (
              <>
                <button
                  onClick={() => onAccept(appointment.id)}
                  className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Accepter</span>
                </button>
                <button
                  onClick={() => onReject(appointment.id)}
                  className="flex-1 sm:flex-none px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Refuser</span>
                </button>
              </>
            )}
            
            {/* Show button for all appointments */}
            {appointment.status === 'confirmed' ? (
              <button
                onClick={() => onViewPatient && onViewPatient(appointment.patient.id)}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Voir dossier médical</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                className="px-6 py-2 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed flex items-center gap-2"
                disabled
                title="Acceptez d'abord le rendez-vous pour accéder au dossier"
              >
                <User className="w-4 h-4" />
                <span>Voir dossier</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
