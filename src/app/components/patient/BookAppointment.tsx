import { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Video, Phone, Building,
  Search, ChevronRight, Check, CreditCard, User, Stethoscope
} from 'lucide-react';

interface BookAppointmentProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BookAppointment({ onClose, onSuccess }: BookAppointmentProps) {
  const [step, setStep] = useState<'search' | 'doctor' | 'datetime' | 'confirm' | 'payment' | 'success'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentMode, setAppointmentMode] = useState<'in-person' | 'video' | 'phone'>('in-person');
  const [notes, setNotes] = useState('');

  const specialties = [
    'Cardiologie',
    'Néphrologie',
    'Radiologie',
    'Médecine générale',
    'Pédiatrie',
    'Dermatologie',
    'Orthopédie',
    'ORL'
  ];

  const doctors = [
    {
      id: '1',
      name: 'Dr. Mohamed Trabelsi',
      specialty: 'Néphrologie',
      location: 'Sousse',
      address: '23 Rue Habib Bourguiba',
      rating: 4.8,
      reviews: 156,
      languages: ['Français', 'Arabe'],
      availableToday: true,
      nextAvailable: '2026-01-20',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'
    },
    {
      id: '2',
      name: 'Dr. Leila Gharbi',
      specialty: 'Radiologie',
      location: 'Tunis',
      address: 'Clinique El Manar',
      rating: 4.9,
      reviews: 203,
      languages: ['Français', 'Arabe', 'Anglais'],
      availableToday: false,
      nextAvailable: '2026-01-22',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400'
    },
    {
      id: '3',
      name: 'Dr. Karim Mansour',
      specialty: 'Cardiologie',
      location: 'Tunis',
      address: '45 Avenue de Paris',
      rating: 4.7,
      reviews: 189,
      languages: ['Français', 'Arabe'],
      availableToday: true,
      nextAvailable: '2026-01-20',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'
    }
  ];

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep('datetime');
  };

  const handleConfirm = () => {
    // Aller directement à la confirmation
    setStep('success');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  const handlePayment = () => {
    // Simulation paiement
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Prendre rendez-vous</h2>
            <p className="text-sm text-gray-600">Trouvez et réservez votre consultation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <StepIndicator
              number={1}
              label="Recherche"
              active={step === 'search'}
              completed={['doctor', 'datetime', 'confirm', 'payment', 'success'].includes(step)}
            />
            <div className="flex-1 h-0.5 bg-gray-300 mx-2">
              <div className={`h-full bg-blue-600 transition-all ${
                ['datetime', 'confirm', 'payment', 'success'].includes(step) ? 'w-full' : 'w-0'
              }`} />
            </div>
            <StepIndicator
              number={2}
              label="Date & Heure"
              active={step === 'datetime'}
              completed={['confirm', 'payment', 'success'].includes(step)}
            />
            <div className="flex-1 h-0.5 bg-gray-300 mx-2">
              <div className={`h-full bg-blue-600 transition-all ${
                ['confirm', 'payment', 'success'].includes(step) ? 'w-full' : 'w-0'
              }`} />
            </div>
            <StepIndicator
              number={3}
              label="Confirmation"
              active={['confirm', 'payment'].includes(step)}
              completed={step === 'success'}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Step 1: Search */}
          {step === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un médecin par nom, spécialité, ville..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Specialty Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Spécialités</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSpecialty('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSpecialty === ''
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Toutes
                  </button>
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSpecialty === spec
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctors List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Médecins disponibles ({doctors.length})
                </h3>
                <div className="space-y-4">
                  {doctors
                    .filter(doc => !selectedSpecialty || doc.specialty === selectedSpecialty)
                    .filter(doc => !searchQuery || 
                      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.location.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        onSelect={() => handleDoctorSelect(doctor)}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'datetime' && selectedDoctor && (
            <div className="space-y-6">
              {/* Selected Doctor Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedDoctor.name}</h3>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedDoctor.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('search')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Changer
                  </button>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Type de consultation</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setAppointmentMode('in-person')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      appointmentMode === 'in-person'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Building className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Cabinet</p>
                  </button>
                  <button
                    onClick={() => setAppointmentMode('video')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      appointmentMode === 'video'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Vidéo</p>
                  </button>
                  <button
                    onClick={() => setAppointmentMode('phone')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      appointmentMode === 'phone'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Phone className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Téléphone</p>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Choisir une date</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Créneaux disponibles</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Notes (optionnel)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Motif de consultation, symptômes, questions..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('search')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedDoctor && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Récapitulatif de votre rendez-vous</h3>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedDoctor.name}</h4>
                    <p className="text-gray-600">{selectedDoctor.specialty}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedDoctor.address}, {selectedDoctor.location}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Heure</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">
                      {appointmentMode === 'in-person' ? 'Cabinet' : 
                       appointmentMode === 'video' ? 'Téléconsultation vidéo' : 'Consultation téléphonique'}
                    </span>
                  </div>
                </div>

                {notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-1">Notes :</p>
                    <p className="text-gray-900">{notes}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Rappel :</strong> Vous recevrez une confirmation par email et SMS. 
                  Pour annuler ou modifier, contactez le cabinet au moins 48h à l'avance.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('datetime')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors"
                >
                  Confirmer le rendez-vous
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 'payment' && selectedDoctor && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Paiement sécurisé</h3>

              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-gray-700">Montant à payer</span>
                <span className="text-2xl font-bold text-gray-900">{selectedDoctor.price} TND</span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Méthode de paiement</h4>
                <div className="space-y-3">
                  <button className="w-full p-4 border-2 border-blue-600 bg-blue-50 rounded-lg text-left flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Carte bancaire</p>
                      <p className="text-sm text-gray-600">Paiement sécurisé via Konnect</p>
                    </div>
                    <Check className="w-6 h-6 text-blue-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors"
                >
                  Payer {selectedDoctor.price} TND
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Rendez-vous confirmé !
              </h3>
              <p className="text-gray-600 mb-6">
                Votre rendez-vous a été enregistré avec succès
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  ✓ Confirmation envoyée par email<br />
                  ✓ Rappel programmé 24h avant<br />
                  ✓ Ajouté à votre agenda
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ number, label, active, completed }: { 
  number: number; 
  label: string; 
  active: boolean; 
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all ${
        completed ? 'bg-green-600 text-white' :
        active ? 'bg-blue-600 text-white' :
        'bg-gray-200 text-gray-600'
      }`}>
        {completed ? <Check className="w-5 h-5" /> : number}
      </div>
      <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
        active ? 'text-blue-600' : 'text-gray-600'
      }`}>
        {label}
      </span>
    </div>
  );
}

function DoctorCard({ doctor, onSelect }: { doctor: any; onSelect: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="flex gap-4">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{doctor.rating}</span>
              </div>
              <p className="text-xs text-gray-500">({doctor.reviews} avis)</p>
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{doctor.address}, {doctor.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {doctor.availableToday ? (
                  <span className="text-green-600 font-medium">Disponible aujourd'hui</span>
                ) : (
                  <span>Prochain créneau: {new Date(doctor.nextAvailable).toLocaleDateString('fr-FR')}</span>
                )}
              </span>
            </div>
          </div>

          <button
            onClick={onSelect}
            className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors flex items-center justify-center gap-2"
          >
            Réserver
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}