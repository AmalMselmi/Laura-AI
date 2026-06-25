import { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Video, Building, Home,
  Check, AlertCircle, ChevronLeft, ChevronRight, User,
  Phone, Mail, MessageSquare
} from 'lucide-react';

interface BookingModalProps {
  doctor: any;
  onClose: () => void;
}

export function BookingModal({ doctor, onClose }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({
    firstName: 'Amira',
    lastName: 'Mansour',
    phone: '+216 98 123 456',
    email: 'amira.mansour@email.tn',
    reason: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Générer les dates disponibles (7 prochains jours)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        full: date
      });
    }
    return dates;
  };

  // Générer les créneaux horaires disponibles
  const getAvailableSlots = () => {
    const slots = [];
    const morning = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoon = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
    
    return {
      morning: morning.map(time => ({ 
        value: time, 
        available: Math.random() > 0.3 // Simulation de disponibilité
      })),
      afternoon: afternoon.map(time => ({ 
        value: time, 
        available: Math.random() > 0.3 
      }))
    };
  };

  const availableDates = getAvailableDates();
  const timeSlots = getAvailableSlots();

  const consultationTypes = [
    { 
      id: 'Cabinet', 
      label: 'Consultation au cabinet', 
      icon: <Building className="w-6 h-6" />,
      description: 'Rendez-vous au cabinet médical'
    },
    { 
      id: 'Vidéo', 
      label: 'Téléconsultation', 
      icon: <Video className="w-6 h-6" />,
      description: 'Consultation vidéo en ligne'
    },
    { 
      id: 'Domicile', 
      label: 'Visite à domicile', 
      icon: <Home className="w-6 h-6" />,
      description: 'Le médecin se déplace chez vous'
    }
  ];

  const handleConfirmBooking = () => {
    // En production: API call pour créer le RDV
    setTimeout(() => {
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1000);
  };

  const canProceedToStep2 = selectedType !== '';
  const canProceedToStep3 = selectedDate !== '' && selectedTime !== '';
  const canConfirmBooking = patientInfo.reason.trim() !== '';

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-gray-600 mb-6">
            Votre rendez-vous avec {doctor.name} a été confirmé pour le{' '}
            {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} à {selectedTime}.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-900">
              Un email de confirmation avec tous les détails vous a été envoyé.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.city}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                  step >= s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Type</span>
            <span>Date & Heure</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Type de consultation */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choisissez le type de consultation
              </h3>
              <div className="grid gap-4">
                {consultationTypes
                  .filter(type => doctor.consultationTypes.includes(type.id))
                  .map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        selectedType === type.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          selectedType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        {selectedType === type.id && (
                          <Check className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 2: Date et heure */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sélectionnez une date
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        selectedDate === date.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xs text-gray-600 capitalize mb-1">
                        {date.label.split(' ')[0]}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {date.full.getDate()}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {date.label.split(' ').slice(1).join(' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Choisissez un créneau horaire
                  </h3>
                  
                  {/* Morning Slots */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Matin</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {timeSlots.morning.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => slot.available && setSelectedTime(slot.value)}
                          disabled={!slot.available}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === slot.value
                              ? 'bg-blue-600 text-white'
                              : slot.available
                              ? 'bg-gray-50 border border-gray-300 text-gray-900 hover:border-blue-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Après-midi</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {timeSlots.afternoon.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => slot.available && setSelectedTime(slot.value)}
                          disabled={!slot.available}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === slot.value
                              ? 'bg-blue-600 text-white'
                              : slot.available
                              ? 'bg-gray-50 border border-gray-300 text-gray-900 hover:border-blue-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmez vos informations
              </h3>

              {/* Booking Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Heure</p>
                    <p className="font-medium text-gray-900">{selectedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedType === 'Cabinet' && <Building className="w-5 h-5 text-blue-600" />}
                  {selectedType === 'Vidéo' && <Video className="w-5 h-5 text-blue-600" />}
                  {selectedType === 'Domicile' && <Home className="w-5 h-5 text-blue-600" />}
                  <div>
                    <p className="text-sm text-gray-600">Type de consultation</p>
                    <p className="font-medium text-gray-900">
                      {consultationTypes.find(t => t.id === selectedType)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Vos informations</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={patientInfo.firstName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={patientInfo.lastName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de consultation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={patientInfo.reason}
                    onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
                    rows={3}
                    placeholder="Décrivez brièvement la raison de votre consultation..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Veuillez arriver 10 minutes avant votre rendez-vous. En cas d'empêchement, merci de prévenir le cabinet au moins 24h à l'avance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl flex justify-between gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          
          <div className="flex-1" />

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={!canConfirmBooking}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Check className="w-4 h-4" />
              Confirmer le rendez-vous
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
