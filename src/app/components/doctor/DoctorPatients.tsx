import { useState, useEffect } from 'react';
import {
  Search, Filter, Users, Calendar, FileText, Phone, Mail,
  MapPin, AlertCircle, Clock, Activity, ChevronRight, Download,
  User, Heart, TrendingUp, ChevronDown, X, Eye, MessageSquare,
  Video, Building, SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listRadiologistDicomFolders } from '../../lib/api/radiologist';
import type { DicomFolderApi } from '../../types/api';

type DoctorPatientRow = {
  id: string;
  name: string;
  age: number;
  gender: 'F' | 'M';
  phone: string;
  email: string;
  address: string;
  photo: string;
  bloodType: string;
  status: 'active' | 'inactive';
  riskLevel: 'low' | 'medium' | 'high';
  chronicConditions: string[];
  allergies: string[];
  lastVisit: string;
  nextAppointment: string | null;
  totalVisits: number;
  documentsCount: number;
  pendingResults: number;
  notes: string;
};

function folderToPatientRow(folder: DicomFolderApi): DoctorPatientRow {
  const last = folder.updatedAt || folder.createdAt;
  const patientId = folder.patientId?.trim() || '';
  return {
    id: folder.id,
    name: folder.patientName?.trim() || 'Patient',
    age: 40,
    gender: 'F',
    phone: '—',
    email: patientId || 'Identifiant non renseigné',
    address: '—',
    photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(folder.patientName || folder.id)}`,
    bloodType: '—',
    status: 'active',
    riskLevel: 'low',
    chronicConditions: folder.pathology ? [folder.pathology] : [],
    allergies: [],
    lastVisit: last,
    nextAppointment: null,
    totalVisits: 0,
    documentsCount: folder.files?.length ?? 0,
    pendingResults: folder.reportStatus === 'in_review' || folder.reportStatus === 'generating' ? 1 : 0,
    notes: `Dossier DICOM · ${folder.modality ?? 'modalité N/A'} · rapport: ${folder.reportStatus}`,
  };
}

export function DoctorPatients({ onViewPatient }: { onViewPatient?: (patientId: string) => void }) {
  const { user, token } = useAuth();
  const [patients, setPatients] = useState<DoctorPatientRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    gender: 'all',
    ageRange: 'all',
    riskLevel: 'all',
    hasAppointments: false,
    hasChronicConditions: false,
    lastVisit: 'all'
  });
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'nextAppointment' | 'risk'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (user?.role !== 'radiologist' || !token) {
      setPatients([]);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    void listRadiologistDicomFolders()
      .then(folders => {
        if (!cancelled) {
          setPatients(folders.map(folderToPatientRow));
          setLoadError(null);
        }
      })
      .catch(e => {
        if (!cancelled) {
          setPatients([]);
          setLoadError(e instanceof Error ? e.message : 'Impossible de charger les dossiers');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.role, token]);

  // Appliquer les filtres
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchQuery ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Statut
    const matchesStatus = selectedFilters.status === 'all' || patient.status === selectedFilters.status;

    // Genre
    const matchesGender = selectedFilters.gender === 'all' || patient.gender === selectedFilters.gender;

    // Tranche d'âge
    let matchesAge = true;
    if (selectedFilters.ageRange !== 'all') {
      if (selectedFilters.ageRange === '0-18') matchesAge = patient.age <= 18;
      else if (selectedFilters.ageRange === '19-40') matchesAge = patient.age >= 19 && patient.age <= 40;
      else if (selectedFilters.ageRange === '41-60') matchesAge = patient.age >= 41 && patient.age <= 60;
      else if (selectedFilters.ageRange === '60+') matchesAge = patient.age > 60;
    }

    // Niveau de risque
    const matchesRisk = selectedFilters.riskLevel === 'all' || patient.riskLevel === selectedFilters.riskLevel;

    // A des rendez-vous
    const matchesAppointments = !selectedFilters.hasAppointments || patient.nextAppointment !== null;

    // A des conditions chroniques
    const matchesChronicConditions = !selectedFilters.hasChronicConditions || patient.chronicConditions.length > 0;

    // Dernière visite
    let matchesLastVisit = true;
    if (selectedFilters.lastVisit !== 'all') {
      const lastVisitDate = new Date(patient.lastVisit);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (selectedFilters.lastVisit === '7days') matchesLastVisit = daysDiff <= 7;
      else if (selectedFilters.lastVisit === '30days') matchesLastVisit = daysDiff <= 30;
      else if (selectedFilters.lastVisit === '90days') matchesLastVisit = daysDiff <= 90;
      else if (selectedFilters.lastVisit === '180days+') matchesLastVisit = daysDiff > 180;
    }

    return matchesSearch && matchesStatus && matchesGender && matchesAge && 
           matchesRisk && matchesAppointments && matchesChronicConditions && matchesLastVisit;
  });

  // Appliquer le tri
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'lastVisit') return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    if (sortBy === 'nextAppointment') {
      if (!a.nextAppointment) return 1;
      if (!b.nextAppointment) return -1;
      return new Date(a.nextAppointment).getTime() - new Date(b.nextAppointment).getTime();
    }
    if (sortBy === 'risk') {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.riskLevel as keyof typeof riskOrder] - riskOrder[a.riskLevel as keyof typeof riskOrder];
    }
    return 0;
  });

  const activeFiltersCount = Object.values(selectedFilters).filter(v => 
    typeof v === 'boolean' ? v : v !== 'all'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mes Patients</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Dossiers issus de votre compte radiologue (API). Connectez-vous comme radiologue pour les voir.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<Users className="w-6 h-6" />}
          label="Total Patients"
          value={patients.length}
          color="blue"
        />
        <StatsCard
          icon={<Activity className="w-6 h-6" />}
          label="Patients Actifs"
          value={patients.filter(p => p.status === 'active').length}
          color="green"
        />
        <StatsCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Risque Élevé"
          value={patients.filter(p => p.riskLevel === 'high').length}
          color="red"
        />
        <StatsCard
          icon={<Calendar className="w-6 h-6" />}
          label="RDV à Venir"
          value={patients.filter(p => p.nextAppointment).length}
          color="purple"
        />
      </div>

      {/* Recherche et Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, téléphone, email..."
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
              <option value="name">Trier: Nom</option>
              <option value="lastVisit">Trier: Dernière visite</option>
              <option value="nextAppointment">Trier: Prochain RDV</option>
              <option value="risk">Trier: Niveau risque</option>
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

        {/* Panneau de filtres */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                <select
                  value={selectedFilters.gender}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="M">Hommes</option>
                  <option value="F">Femmes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tranche d'âge</label>
                <select
                  value={selectedFilters.ageRange}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, ageRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="0-18">0-18 ans</option>
                  <option value="19-40">19-40 ans</option>
                  <option value="41-60">41-60 ans</option>
                  <option value="60+">60+ ans</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de risque</label>
                <select
                  value={selectedFilters.riskLevel}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, riskLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="low">Faible</option>
                  <option value="medium">Modéré</option>
                  <option value="high">Élevé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dernière visite</label>
                <select
                  value={selectedFilters.lastVisit}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, lastVisit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes périodes</option>
                  <option value="7days">Derniers 7 jours</option>
                  <option value="30days">Dernier mois</option>
                  <option value="90days">Derniers 3 mois</option>
                  <option value="180days+">Plus de 6 mois</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.hasAppointments}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, hasAppointments: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">A des RDV programmés</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.hasChronicConditions}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, hasChronicConditions: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Conditions chroniques</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setSelectedFilters({
                    status: 'all',
                    gender: 'all',
                    ageRange: 'all',
                    riskLevel: 'all',
                    hasAppointments: false,
                    hasChronicConditions: false,
                    lastVisit: 'all'
                  })}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {sortedPatients.length} patient{sortedPatients.length > 1 ? 's' : ''} trouvé{sortedPatients.length > 1 ? 's' : ''}
          </p>
        </div>

        {sortedPatients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun patient trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche ou filtres</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {sortedPatients.map((patient) => (
              <PatientListCard
                key={patient.id}
                patient={patient}
                onViewPatient={onViewPatient}
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPatients.map((patient) => (
              <PatientGridCard
                key={patient.id}
                patient={patient}
                onViewPatient={onViewPatient}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color }: any) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl p-4 text-white`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm opacity-90">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function PatientListCard({ patient, onViewPatient }: any) {
  const [expanded, setExpanded] = useState(false);

  const riskColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  };

  const riskLabels = {
    low: 'Faible',
    medium: 'Modéré',
    high: 'Élevé'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={patient.photo}
          alt={patient.name}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{patient.name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{patient.age} ans • {patient.gender === 'F' ? 'Femme' : 'Homme'}</span>
                <span>•</span>
                <span>Groupe {patient.bloodType}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${riskColors[patient.riskLevel as keyof typeof riskColors]}`}>
                Risque: {riskLabels[patient.riskLevel as keyof typeof riskLabels]}
              </span>
              {patient.status === 'inactive' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                  Inactif
                </span>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 truncate">{patient.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          {patient.nextAppointment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <Calendar className="w-4 h-4" />
                <span>
                  <strong>Prochain RDV:</strong> {new Date(patient.nextAppointment).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}

          {expanded && (
            <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Conditions chroniques:</p>
                {patient.chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicConditions.map((condition: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Aucune</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Allergies:</p>
                {patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Aucune</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Notes:</p>
                <p className="text-sm text-gray-700">{patient.notes}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{patient.totalVisits}</div>
                  <div className="text-xs text-gray-600">Consultations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{patient.documentsCount}</div>
                  <div className="text-xs text-gray-600">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{patient.pendingResults}</div>
                  <div className="text-xs text-gray-600">En attente</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onViewPatient && onViewPatient(patient.id)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Voir dossier</span>
            </button>

            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Contacter</span>
            </button>

            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Planifier RDV</span>
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

function PatientGridCard({ patient, onViewPatient }: any) {
  const riskColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="text-center mb-4">
        <img
          src={patient.photo}
          alt={patient.name}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
        />
        <h3 className="font-semibold text-gray-900 mb-1">{patient.name}</h3>
        <p className="text-sm text-gray-600">{patient.age} ans • {patient.gender === 'F' ? 'Femme' : 'Homme'}</p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Groupe sanguin:</span>
          <span className="font-medium text-gray-900">{patient.bloodType}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Niveau risque:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${riskColors[patient.riskLevel as keyof typeof riskColors]}`}>
            {patient.riskLevel === 'low' && 'Faible'}
            {patient.riskLevel === 'medium' && 'Modéré'}
            {patient.riskLevel === 'high' && 'Élevé'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Dernière visite:</span>
          <span className="font-medium text-gray-900">{new Date(patient.lastVisit).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
        </div>
      </div>

      {patient.nextAppointment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-blue-900">
            <Calendar className="w-3 h-3" />
            <span>RDV: {new Date(patient.nextAppointment).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => onViewPatient && onViewPatient(patient.id)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        <span>Voir dossier</span>
      </button>
    </div>
  );
}
