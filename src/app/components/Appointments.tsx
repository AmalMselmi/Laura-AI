import Navigation from './Navigation';
import { Calendar, Clock, MapPin, Plus, Search, ChevronLeft, ChevronRight, Bell, Video, User } from 'lucide-react';
import { useState } from 'react';

type Page = 'dashboard' | 'records' | 'appointments' | 'carnet' | 'dicom';

interface AppointmentsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Appointments({ onNavigate, onLogout }: AppointmentsProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [view, setView] = useState<'calendar' | 'list'>('list');

  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Amira Ben Salem',
      specialty: 'Cardiologue',
      date: '2026-01-25',
      time: '14:30',
      duration: '30 min',
      location: 'Clinique El Manar, Tunis',
      type: 'Consultation',
      status: 'confirmed',
      notes: 'Suivi traitement hypertension',
    },
    {
      id: 2,
      doctor: 'Dr. Mohamed Trabelsi',
      specialty: 'Radiologue',
      date: '2026-01-30',
      time: '10:00',
      duration: '45 min',
      location: 'Centre d\'Imagerie Médicale',
      type: 'Imagerie',
      status: 'confirmed',
      notes: 'IRM abdominale - Suivi Bosniak',
    },
    {
      id: 3,
      doctor: 'Dr. Leila Gharbi',
      specialty: 'Généraliste',
      date: '2026-02-05',
      time: '09:00',
      duration: '20 min',
      location: 'Cabinet médical',
      type: 'Consultation',
      status: 'pending',
      notes: 'Bilan annuel',
    },
    {
      id: 4,
      doctor: 'Dr. Karim Mejri',
      specialty: 'Biologiste',
      date: '2026-01-20',
      time: '08:30',
      duration: '15 min',
      location: 'Laboratoire d\'analyses',
      type: 'Prélèvement',
      status: 'completed',
      notes: 'Analyses sanguines',
    },
  ];

  const upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-700',
      'pending': 'bg-orange-100 text-orange-700',
      'completed': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || colors['pending'];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'confirmed': 'Confirmé',
      'pending': 'En attente',
      'completed': 'Terminé',
      'cancelled': 'Annulé',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen flex">
      <Navigation currentPage="appointments" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0 p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl mb-2">Mes rendez-vous</h1>
                <p className="text-[var(--color-text-light)]">Gérez vos consultations et examens médicaux</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors shadow-md">
                <Plus size={20} />
                <span>Nouveau rendez-vous</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-text-light)]">À venir</span>
                <Calendar className="text-[var(--color-primary)]" size={24} />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">3</div>
              <p className="text-sm text-[var(--color-text-light)] mt-1">Prochains rendez-vous</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-text-light)]">Ce mois</span>
                <Clock className="text-[var(--color-secondary)]" size={24} />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">5</div>
              <p className="text-sm text-[var(--color-text-light)] mt-1">Consultations prévues</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[var(--color-text-light)]">Rappels</span>
                <Bell className="text-[var(--color-accent)]" size={24} />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">2</div>
              <p className="text-sm text-[var(--color-text-light)] mt-1">Notifications actives</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rendez-vous à venir</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'list'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-text-light)]'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'calendar'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-text-light)]'
                }`}
              >
                Calendrier
              </button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-4 mb-12">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Date Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-bold">
                        {new Date(apt.date).getDate()}
                      </span>
                      <span className="text-xs uppercase">
                        {new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-[var(--color-text)]">{apt.doctor}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                        <p className="text-[var(--color-text-light)] mb-1">{apt.specialty}</p>
                        <p className="text-sm text-[var(--color-text-light)]">{apt.type}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-[var(--color-text-light)]">
                        <Clock size={16} />
                        <span className="text-sm">{apt.time} ({apt.duration})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-text-light)]">
                        <MapPin size={16} />
                        <span className="text-sm">{apt.location}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-[var(--color-border)]">
                        <p className="text-sm text-[var(--color-text-light)]">
                          <span className="font-medium text-[var(--color-text)]">Note :</span> {apt.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors text-sm">
                        Modifier
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors text-sm">
                        <Bell size={16} className="inline mr-2" />
                        Rappel
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors text-sm">
                        Ajouter au calendrier
                      </button>
                      <button className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm ml-auto">
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Past Appointments */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Historique</h2>
            <div className="space-y-3">
              {pastAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl border border-[var(--color-border)] p-4 hover:bg-gray-50 transition-colors opacity-75"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--color-text-light)]">
                        {new Date(apt.date).getDate()}
                      </span>
                      <span className="text-xs text-[var(--color-text-light)]">
                        {new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--color-text)] mb-1">{apt.doctor}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-light)]">
                        <span>{apt.specialty}</span>
                        <span>•</span>
                        <span>{apt.time}</span>
                        <span>•</span>
                        <span>{apt.type}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)} whitespace-nowrap`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
