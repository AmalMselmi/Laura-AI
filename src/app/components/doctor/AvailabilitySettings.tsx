import { useState } from 'react';
import { Clock, Plus, Trash2, Calendar, Check } from 'lucide-react';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export function AvailabilitySettings() {
  const [availability, setAvailability] = useState<TimeSlot[]>([
    {
      id: '1',
      dayOfWeek: 1, // Lundi
      startTime: '09:00',
      endTime: '12:00',
      slotDuration: 30,
      isActive: true
    },
    {
      id: '2',
      dayOfWeek: 1,
      startTime: '14:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: true
    },
    {
      id: '3',
      dayOfWeek: 3, // Mercredi
      startTime: '09:00',
      endTime: '12:00',
      slotDuration: 30,
      isActive: true
    },
    {
      id: '4',
      dayOfWeek: 5, // Vendredi
      startTime: '09:00',
      endTime: '13:00',
      slotDuration: 30,
      isActive: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '12:00',
    slotDuration: 30
  });

  const daysOfWeek = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ];

  const handleAddSlot = () => {
    const slot: TimeSlot = {
      id: Date.now().toString(),
      ...newSlot,
      isActive: true
    };
    setAvailability([...availability, slot]);
    setShowAddForm(false);
    setNewSlot({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      slotDuration: 30
    });
  };

  const handleDeleteSlot = (id: string) => {
    setAvailability(availability.filter(s => s.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setAvailability(availability.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const groupByDay = () => {
    const grouped: { [key: number]: TimeSlot[] } = {};
    availability.forEach(slot => {
      if (!grouped[slot.dayOfWeek]) {
        grouped[slot.dayOfWeek] = [];
      }
      grouped[slot.dayOfWeek].push(slot);
    });
    return grouped;
  };

  const groupedAvailability = groupByDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Disponibilités</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Configurez vos horaires de consultation
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Ajouter un créneau</span>
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ajouter un créneau</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour de la semaine
                </label>
                <select
                  value={newSlot.dayOfWeek}
                  onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index + 1}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée des créneaux (minutes)
                </label>
                <select
                  value={newSlot.slotDuration}
                  onChange={(e) => setNewSlot({ ...newSlot, slotDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Calendar View */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Planning hebdomadaire</h2>
        <div className="space-y-4">
          {daysOfWeek.map((day, index) => (
            <DaySchedule
              key={index}
              day={day}
              dayIndex={index + 1}
              slots={groupedAvailability[index + 1] || []}
              onToggle={handleToggleActive}
              onDelete={handleDeleteSlot}
            />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-sm text-blue-600 mb-1">Jours actifs</div>
          <div className="text-2xl font-bold text-blue-900">
            {Object.keys(groupedAvailability).length}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-600 mb-1">Créneaux/semaine</div>
          <div className="text-2xl font-bold text-green-900">
            {availability.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-sm text-purple-600 mb-1">Heures/semaine</div>
          <div className="text-2xl font-bold text-purple-900">
            {calculateWeeklyHours(availability)}h
          </div>
        </div>
        <div className="bg-rose-50 rounded-xl p-4">
          <div className="text-sm text-rose-600 mb-1">Capacité/semaine</div>
          <div className="text-2xl font-bold text-rose-900">
            {calculateWeeklyCapacity(availability)}
          </div>
        </div>
      </div>
    </div>
  );
}

function DaySchedule({ day, dayIndex, slots, onToggle, onDelete }: {
  day: string;
  dayIndex: number;
  slots: TimeSlot[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0">
      <div className="w-24 flex-shrink-0">
        <div className={`text-sm font-semibold ${slots.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
          {day}
        </div>
        {slots.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {slots.length} créneau{slots.length > 1 ? 'x' : ''}
          </div>
        )}
      </div>

      <div className="flex-1">
        {slots.length === 0 ? (
          <div className="text-sm text-gray-400 italic py-2">Aucun créneau défini</div>
        ) : (
          <div className="space-y-2">
            {slots.map(slot => (
              <div
                key={slot.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  slot.isActive
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <Clock className="w-4 h-4 text-gray-600" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                  <span className="text-gray-600 ml-2">
                    (créneaux de {slot.slotDuration}min)
                  </span>
                </div>
                <button
                  onClick={() => onToggle(slot.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    slot.isActive
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(slot.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function calculateWeeklyHours(slots: TimeSlot[]): number {
  let totalMinutes = 0;
  slots.filter(s => s.isActive).forEach(slot => {
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    totalMinutes += minutes;
  });
  return Math.round(totalMinutes / 60 * 10) / 10;
}

function calculateWeeklyCapacity(slots: TimeSlot[]): number {
  let totalSlots = 0;
  slots.filter(s => s.isActive).forEach(slot => {
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    totalSlots += Math.floor(minutes / slot.slotDuration);
  });
  return totalSlots;
}
