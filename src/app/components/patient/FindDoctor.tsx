import { useState } from 'react';
import {
  Search, MapPin, Filter, Star, Calendar, Phone, Mail,
  Award, Clock, Video, Building, Heart,
  ChevronDown, ChevronRight, X, MessageSquare, CheckCircle,
  TrendingUp, Users, Stethoscope, SlidersHorizontal
} from 'lucide-react';
import { BookingModal } from './BookingModal';

export function FindDoctor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<any>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    availability: 'all',
    consultationType: 'all',
    rating: 0,
    acceptsNewPatients: false,
    hasOnlineBooking: false,
    speaksLanguages: [] as string[]
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'distance'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Données médecins (en production: depuis API)
  const doctors = [
    {
      id: 'doc1',
      name: 'Dr. Karim Mansour',
      specialty: 'Néphrologie',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
      rating: 4.8,
      reviewsCount: 127,
      experience: 15,
      city: 'Sousse',
      address: 'Cabinet Dr. Mansour, 12 Rue de la République',
      phone: '+216 73 123 456',
      email: 'dr.mansour@laura.tn',
      languages: ['Français', 'Arabe', 'Anglais'],
      education: 'Faculté de Médecine de Tunis',
      certifications: ['Néphrologue certifié', 'Dialyse'],
      consultationFee: 70,
      acceptsNewPatients: true,
      hasOnlineBooking: true,
      nextAvailability: '2026-02-05',
      consultationTypes: ['Cabinet', 'Vidéo'],
      specializations: ['Insuffisance rénale', 'Dialyse', 'Transplantation rénale'],
      bio: 'Spécialiste en néphrologie avec 15 ans d\'expérience. Expert en maladies rénales chroniques et dialyse.',
      distance: 2.5
    },
    {
      id: 'doc2',
      name: 'Dr. Leila Gharbi',
      specialty: 'Radiologie',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      rating: 4.9,
      reviewsCount: 203,
      experience: 12,
      city: 'Tunis',
      address: 'Centre d\'Imagerie Médicale, Avenue Habib Bourguiba',
      phone: '+216 71 234 567',
      email: 'dr.gharbi@laura.tn',
      languages: ['Français', 'Arabe'],
      education: 'Faculté de Médecine de Monastir',
      certifications: ['Radiologue certifié', 'IRM', 'Scanner'],
      consultationFee: 80,
      acceptsNewPatients: true,
      hasOnlineBooking: true,
      nextAvailability: '2026-02-03',
      consultationTypes: ['Cabinet'],
      specializations: ['IRM', 'Scanner', 'Échographie'],
      bio: 'Radiologue expérimentée spécialisée en imagerie avancée (IRM, Scanner).',
      distance: 15.2
    },
    {
      id: 'doc3',
      name: 'Dr. Ahmed Ben Ali',
      specialty: 'Cardiologie',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      rating: 4.7,
      reviewsCount: 156,
      experience: 20,
      city: 'Sfax',
      address: 'Clinique Cardio, Rue Hedi Chaker',
      phone: '+216 74 345 678',
      email: 'dr.benali@laura.tn',
      languages: ['Français', 'Arabe', 'Anglais', 'Italien'],
      education: 'Faculté de Médecine de Paris',
      certifications: ['Cardiologue certifié', 'Électrophysiologie'],
      consultationFee: 90,
      acceptsNewPatients: false,
      hasOnlineBooking: false,
      nextAvailability: '2026-03-15',
      consultationTypes: ['Cabinet'],
      specializations: ['Maladies cardiovasculaires', 'Hypertension', 'Arythmie'],
      bio: 'Cardiologue renommé avec 20 ans d\'expérience internationale.',
      distance: 120.5
    },
    {
      id: 'doc4',
      name: 'Dr. Samia Trabelsi',
      specialty: 'Médecine Générale',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
      rating: 4.6,
      reviewsCount: 89,
      experience: 8,
      city: 'Sousse',
      address: 'Cabinet Médical, Avenue Léopold Senghor',
      phone: '+216 73 456 789',
      email: 'dr.trabelsi@laura.tn',
      languages: ['Français', 'Arabe'],
      education: 'Faculté de Médecine de Sousse',
      certifications: ['Médecin généraliste certifié'],
      consultationFee: 50,
      acceptsNewPatients: true,
      hasOnlineBooking: true,
      nextAvailability: '2026-02-02',
      consultationTypes: ['Cabinet', 'Vidéo', 'Domicile'],
      specializations: ['Médecine préventive', 'Soins primaires'],
      bio: 'Médecin généraliste dévouée, disponible pour consultations à domicile.',
      distance: 3.8
    },
    {
      id: 'doc5',
      name: 'Dr. Mohamed Kchaou',
      specialty: 'Orthopédie',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
      rating: 4.9,
      reviewsCount: 178,
      experience: 18,
      city: 'Monastir',
      address: 'Clinique Orthopédique, Route de la Corniche',
      phone: '+216 73 567 890',
      email: 'dr.kchaou@laura.tn',
      languages: ['Français', 'Arabe', 'Anglais'],
      education: 'Faculté de Médecine de Lyon',
      certifications: ['Orthopédiste certifié', 'Chirurgie du genou', 'Traumatologie'],
      consultationFee: 100,
      acceptsNewPatients: true,
      hasOnlineBooking: true,
      nextAvailability: '2026-02-08',
      consultationTypes: ['Cabinet'],
      specializations: ['Chirurgie orthopédique', 'Traumatologie sportive', 'Prothèses'],
      bio: 'Orthopédiste expert en chirurgie du genou et traumatologie sportive.',
      distance: 25.3
    }
  ];

  // Villes disponibles
  const cities = ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul', 'Bizerte', 'Gabès'];

  // Spécialités disponibles
  const specialties = [
    'Médecine Générale',
    'Néphrologie',
    'Cardiologie',
    'Radiologie',
    'Orthopédie',
    'Pédiatrie',
    'Gynécologie',
    'Dermatologie',
    'Ophtalmologie',
    'ORL',
    'Dentiste',
    'Orthodontiste'
  ];

  // Langues disponibles
  const languages = ['Français', 'Arabe', 'Anglais', 'Italien', 'Allemand'];

  // Filtrer les médecins
  const filteredDoctors = doctors.filter(doctor => {
    // Recherche
    const matchesSearch = !searchQuery || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Ville
    const matchesCity = selectedCity === 'all' || doctor.city === selectedCity;

    // Spécialité
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;

    // Disponibilité
    let matchesAvailability = true;
    if (selectedFilters.availability !== 'all') {
      const nextDate = new Date(doctor.nextAvailability);
      const now = new Date();
      const daysDiff = Math.floor((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (selectedFilters.availability === 'today') matchesAvailability = daysDiff === 0;
      else if (selectedFilters.availability === 'week') matchesAvailability = daysDiff <= 7;
      else if (selectedFilters.availability === 'month') matchesAvailability = daysDiff <= 30;
    }

    // Type de consultation
    const matchesConsultationType = selectedFilters.consultationType === 'all' || 
      doctor.consultationTypes.includes(selectedFilters.consultationType);

    // Note minimale
    const matchesRating = selectedFilters.rating === 0 || doctor.rating >= selectedFilters.rating;

    // Accepte nouveaux patients
    const matchesNewPatients = !selectedFilters.acceptsNewPatients || doctor.acceptsNewPatients;

    // Réservation en ligne
    const matchesOnlineBooking = !selectedFilters.hasOnlineBooking || doctor.hasOnlineBooking;

    // Langues
    const matchesLanguages = selectedFilters.speaksLanguages.length === 0 ||
      selectedFilters.speaksLanguages.every(lang => doctor.languages.includes(lang));

    return matchesSearch && matchesCity && matchesSpecialty && matchesAvailability &&
           matchesConsultationType && matchesRating && matchesNewPatients &&
           matchesOnlineBooking && matchesLanguages;
  });

  // Trier les résultats
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return a.distance - b.distance;
    return 0; // relevance (par défaut)
  });

  const activeFiltersCount = Object.values(selectedFilters).filter(v => 
    typeof v === 'boolean' ? v : (Array.isArray(v) ? v.length > 0 : v !== 'all')
  ).length;

  const handleLanguageToggle = (lang: string) => {
    setSelectedFilters({
      ...selectedFilters,
      speaksLanguages: selectedFilters.speaksLanguages.includes(lang)
        ? selectedFilters.speaksLanguages.filter(l => l !== lang)
        : [...selectedFilters.speaksLanguages, lang]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trouver un Médecin</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Recherchez et prenez rendez-vous avec des professionnels de santé en Tunisie
        </p>
      </div>

      {/* Quick Filters */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les spécialités</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, spécialité..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`px-4 py-2.5 border rounded-lg font-medium transition-colors flex items-center gap-2 relative ${
                filterOpen || activeFiltersCount > 0
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Pertinence</option>
              <option value="rating">Note la plus élevée</option>
              <option value="distance">Plus proche</option>
            </select>

            <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grille
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
                <select
                  value={selectedFilters.availability}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de consultation</label>
                <select
                  value={selectedFilters.consultationType}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, consultationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous types</option>
                  <option value="Cabinet">Cabinet</option>
                  <option value="Vidéo">Vidéo</option>
                  <option value="Domicile">Domicile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note minimale</label>
                <select
                  value={selectedFilters.rating}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Toutes notes</option>
                  <option value={4.5}>4.5+ ⭐</option>
                  <option value={4.0}>4.0+ ⭐</option>
                  <option value={3.5}>3.5+ ⭐</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.acceptsNewPatients}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, acceptsNewPatients: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Accepte nouveaux patients</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.hasOnlineBooking}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, hasOnlineBooking: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Réservation en ligne</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Langues parlées</label>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageToggle(lang)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilters.speaksLanguages.includes(lang)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedFilters({
                  availability: 'all',
                  consultationType: 'all',
                  rating: 0,
                  acceptsNewPatients: false,
                  hasOnlineBooking: false,
                  speaksLanguages: []
                })}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Réinitialiser filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {sortedDoctors.length} médecin{sortedDoctors.length > 1 ? 's' : ''} trouvé{sortedDoctors.length > 1 ? 's' : ''}
          </p>
        </div>

        {sortedDoctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Stethoscope className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun médecin trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche ou filtres</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {sortedDoctors.map((doctor) => (
              <DoctorListCard 
                key={doctor.id} 
                doctor={doctor}
                onBookAppointment={(doc) => {
                  setSelectedDoctorForBooking(doc);
                  setBookingModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDoctors.map((doctor) => (
              <DoctorGridCard 
                key={doctor.id} 
                doctor={doctor}
                onBookAppointment={(doc) => {
                  setSelectedDoctorForBooking(doc);
                  setBookingModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
}

function DoctorListCard({ doctor, onBookAppointment }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={doctor.photo}
          alt={doctor.name}
          className="w-20 h-20 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{doctor.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  {doctor.specialty}
                </span>
                {doctor.acceptsNewPatients && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Nouveaux patients
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">{doctor.rating}</span>
                <span className="text-sm text-gray-600">({doctor.reviewsCount})</span>
              </div>
              <div className="text-sm text-gray-600">{doctor.experience} ans d'exp.</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{doctor.city} • {doctor.distance} km</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                Dispo: {new Date(doctor.nextAvailability).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{doctor.education}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {doctor.consultationTypes.map((type: string) => (
              <span key={type} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                {type === 'Cabinet' && <Building className="w-3 h-3" />}
                {type === 'Vidéo' && <Video className="w-3 h-3" />}
                {type}
              </span>
            ))}
            {doctor.hasOnlineBooking && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Réservation en ligne
              </span>
            )}
          </div>

          {expanded && (
            <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Bio:</p>
                <p className="text-sm text-gray-700">{doctor.bio}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Spécialisations:</p>
                <div className="flex flex-wrap gap-2">
                  {doctor.specializations.map((spec: string) => (
                    <span key={spec} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Langues:</p>
                <p className="text-sm text-gray-700">{doctor.languages.join(', ')}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Certifications:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {doctor.certifications.map((cert: string) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Adresse:</p>
                <p className="text-sm text-gray-700">{doctor.address}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{doctor.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onBookAppointment(doctor)}
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Prendre RDV</span>
            </button>

            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Contacter</span>
            </button>

            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Favoris</span>
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              <span>{expanded ? 'Moins' : 'Plus'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorGridCard({ doctor, onBookAppointment }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="text-center mb-4">
        <img
          src={doctor.photo}
          alt={doctor.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
        />
        <h3 className="font-semibold text-gray-900 mb-1">{doctor.name}</h3>
        <p className="text-sm text-blue-600 font-medium mb-2">{doctor.specialty}</p>

        <div className="flex items-center justify-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-gray-900">{doctor.rating}</span>
          <span className="text-xs text-gray-600">({doctor.reviewsCount})</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Ville:</span>
          <span className="font-medium text-gray-900">{doctor.city}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Disponible:</span>
          <span className="font-medium text-gray-900">
            {new Date(doctor.nextAvailability).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      </div>

      {doctor.acceptsNewPatients && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-green-900">
            <CheckCircle className="w-3 h-3" />
            <span>Accepte nouveaux patients</span>
          </div>
        </div>
      )}

      <button
        onClick={() => onBookAppointment(doctor)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        <span>Prendre RDV</span>
      </button>
    </div>
  );
}