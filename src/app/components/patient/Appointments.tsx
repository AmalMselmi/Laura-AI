import { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, Plus,
  ChevronLeft, ChevronRight, Video, Phone, Building,
  Grid3x3, List
} from 'lucide-react';
import { BookAppointment } from './BookAppointment';

export function Appointments() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBooking, setShowBooking] = useState(false);

  const upcomingAppointments = [
    {
      id: '1',
      date: '2026-01-25',
      time: '14:30',
      doctor: 'Dr. Leila Gharbi',
      specialty: 'Radiologie',
      location: 'Clinique El Manar, Tunis',
      address: '15 Avenue de la République, Tunis',
      type: 'IRM de contrôle',
      mode: 'in-person',
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2026-02-12',
      time: '10:00',
      doctor: 'Dr. Mohamed Trabelsi',
      specialty: 'Néphrologie',
      location: 'Cabinet privé, Sousse',
      address: '23 Rue Habib Bourguiba, Sousse',
      type: 'Consultation de suivi',
      mode: 'in-person',
      status: 'confirmed'
    }
  ];

  const pastAppointments = [
    {
      id: '3',
      date: '2025-12-28',
      time: '11:00',
      doctor: 'Dr. Mohamed Trabelsi',
      specialty: 'Néphrologie',
      location: 'Cabinet privé, Sousse',
      type: 'Consultation',
      mode: 'in-person',
      status: 'completed'
    },
    {
      id: '4',
      date: '2025-12-15',
      time: '09:30',
      doctor: 'Dr. Leila Gharbi',
      specialty: 'Radiologie',
      location: 'Clinique El Manar, Tunis',
      type: 'Scanner abdominal',
      mode: 'in-person',
      status: 'completed'
    }
  ];

  // Générer les jours du calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -i);
      days.unshift({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const hasAppointment = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return [...upcomingAppointments, ...pastAppointments].some(
      apt => apt.date === dateStr
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                     'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      {/* Booking Modal */}
      {showBooking && (
        <BookAppointment
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            setShowBooking(false);
            // Refresh appointments list
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mes rendez-vous</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez vos consultations et examens médicaux</p>
        </div>
        <button 
          onClick={() => setShowBooking(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau rendez-vous</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'list' 
              ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">Liste</span>
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'calendar' 
              ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          <span className="hidden sm:inline">Calendrier</span>
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Day names */}
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-xs sm:text-sm py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth(currentMonth).map((day, index) => {
              const hasApt = hasAppointment(day.date);
              const today = isToday(day.date);

              return (
                <button
                  key={index}
                  className={`aspect-square p-1 sm:p-2 rounded-lg text-xs sm:text-sm transition-all relative ${
                    !day.isCurrentMonth
                      ? 'text-gray-300'
                      : today
                      ? 'bg-blue-600 text-white font-bold'
                      : hasApt
                      ? 'bg-rose-100 text-rose-700 font-semibold hover:bg-rose-200'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {day.date.getDate()}
                  {hasApt && (
                    <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      today ? 'bg-white' : 'bg-rose-600'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Aujourd'hui</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-100 rounded"></div>
              <span className="text-gray-600">Rendez-vous</span>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Rendez-vous à venir</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} upcoming={true} />
              ))}
            </div>
          </div>

          {/* Past Appointments */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Historique</h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} upcoming={false} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">💡 Rappels importants</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
          <li>• Vous recevrez une notification 24h avant chaque rendez-vous</li>
          <li>• Pensez à apporter vos documents médicaux et votre carte CNAM</li>
          <li>• Pour annuler ou reporter, contactez le cabinet au moins 48h à l'avance</li>
        </ul>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, upcoming }: { appointment: any; upcoming: boolean }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{appointment.doctor}</h3>
            <p className="text-gray-600 mb-2">{appointment.specialty}</p>
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
              {appointment.type}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3 text-gray-700">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium capitalize">{formatDate(appointment.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Heure</p>
            <p className="font-medium">{appointment.time}</p>
          </div>
        </div>
      </div>

      {appointment.address && (
        <div className="flex items-start gap-3 text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Lieu</p>
            <p className="font-medium">{appointment.location}</p>
            <p className="text-sm text-gray-600">{appointment.address}</p>
          </div>
        </div>
      )}

      {upcoming && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Voir les détails
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Reporter
          </button>
          <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
            Annuler
          </button>
        </div>
      )}

      {!upcoming && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Voir le compte-rendu
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Reprendre RDV
          </button>
        </div>
      )}
    </div>
  );
}