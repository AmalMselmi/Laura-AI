import { useState } from 'react';
import {
  Calendar, FileText, Image, TestTube, Pill, Activity,
  Download, Eye, Share2, Filter, Search, ChevronDown,
  X, Mail, Check, AlertCircle, Stethoscope, Heart,
  Syringe, Brain, Microscope, Scan, ClipboardList
} from 'lucide-react';

type TimelineEventType = 
  | 'consultation' 
  | 'analysis' 
  | 'prescription' 
  | 'imaging' 
  | 'vaccination'
  | 'surgery'
  | 'hospital'
  | 'emergency';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  doctor: string;
  specialty: string;
  location: string;
  description: string;
  files: {
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'dicom';
    size: string;
    url?: string;
  }[];
  tags: string[];
  important: boolean;
}

export function MedicalTimeline() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Données de démonstration
  const events: TimelineEvent[] = [
    {
      id: 'evt1',
      type: 'consultation',
      date: '2026-01-28',
      title: 'Consultation de suivi - Néphrologie',
      doctor: 'Dr. Karim Mansour',
      specialty: 'Néphrologie',
      location: 'Cabinet Dr. Mansour, Sousse',
      description: 'Suivi post-traitement du kyste rénal. Résultats très encourageants, pas de récidive détectée.',
      files: [
        { id: 'f1', name: 'Compte-rendu consultation.pdf', type: 'pdf', size: '245 KB' },
        { id: 'f2', name: 'Ordonnance.pdf', type: 'pdf', size: '128 KB' }
      ],
      tags: ['Néphrologie', 'Suivi', 'Kyste rénal'],
      important: true
    },
    {
      id: 'evt2',
      type: 'imaging',
      date: '2026-01-20',
      title: 'Échographie rénale de contrôle',
      doctor: 'Dr. Leila Gharbi',
      specialty: 'Radiologie',
      location: 'Centre d\'Imagerie Médicale, Tunis',
      description: 'Échographie de contrôle suite au traitement. Résultats normaux, kyste en régression.',
      files: [
        { id: 'f3', name: 'Rapport échographie.pdf', type: 'pdf', size: '512 KB' },
        { id: 'f4', name: 'Images échographie.jpg', type: 'image', size: '1.2 MB' },
        { id: 'f5', name: 'Échographie.dcm', type: 'dicom', size: '8.5 MB' }
      ],
      tags: ['Radiologie', 'Échographie', 'Rein'],
      important: false
    },
    {
      id: 'evt3',
      type: 'analysis',
      date: '2026-01-15',
      title: 'Analyses sanguines complètes',
      doctor: 'Laboratoire Bio-Santé',
      specialty: 'Biologie médicale',
      location: 'Laboratoire Bio-Santé, Sousse',
      description: 'Bilan sanguin complet incluant fonction rénale, ionogramme et numération formule sanguine.',
      files: [
        { id: 'f6', name: 'Résultats analyses.pdf', type: 'pdf', size: '186 KB' }
      ],
      tags: ['Analyses', 'Biologie', 'Sang'],
      important: false
    },
    {
      id: 'evt4',
      type: 'prescription',
      date: '2025-12-10',
      title: 'Renouvellement ordonnance',
      doctor: 'Dr. Samia Trabelsi',
      specialty: 'Médecine Générale',
      location: 'Cabinet Médical, Sousse',
      description: 'Renouvellement de l\'ordonnance pour le traitement préventif.',
      files: [
        { id: 'f7', name: 'Ordonnance décembre.pdf', type: 'pdf', size: '95 KB' }
      ],
      tags: ['Ordonnance', 'Traitement'],
      important: false
    },
    {
      id: 'evt5',
      type: 'vaccination',
      date: '2025-11-05',
      title: 'Vaccination grippe saisonnière',
      doctor: 'Dr. Samia Trabelsi',
      specialty: 'Médecine Générale',
      location: 'Cabinet Médical, Sousse',
      description: 'Vaccin antigrippal 2025-2026. Aucun effet secondaire signalé.',
      files: [
        { id: 'f8', name: 'Certificat vaccination.pdf', type: 'pdf', size: '78 KB' }
      ],
      tags: ['Vaccination', 'Prévention'],
      important: false
    },
    {
      id: 'evt6',
      type: 'consultation',
      date: '2025-10-22',
      title: 'Consultation initiale - Kyste rénal',
      doctor: 'Dr. Karim Mansour',
      specialty: 'Néphrologie',
      location: 'Cabinet Dr. Mansour, Sousse',
      description: 'Première consultation pour kyste rénal découvert lors d\'un examen de routine. Plan de traitement établi.',
      files: [
        { id: 'f9', name: 'Compte-rendu initial.pdf', type: 'pdf', size: '312 KB' },
        { id: 'f10', name: 'Plan de traitement.pdf', type: 'pdf', size: '156 KB' }
      ],
      tags: ['Néphrologie', 'Diagnostic', 'Kyste rénal'],
      important: true
    },
    {
      id: 'evt7',
      type: 'imaging',
      date: '2025-10-15',
      title: 'Scanner abdominal',
      doctor: 'Dr. Leila Gharbi',
      specialty: 'Radiologie',
      location: 'Centre d\'Imagerie Médicale, Tunis',
      description: 'Scanner abdominal suite à échographie de routine. Découverte d\'un kyste rénal simple.',
      files: [
        { id: 'f11', name: 'Rapport scanner.pdf', type: 'pdf', size: '680 KB' },
        { id: 'f12', name: 'Scanner abdominal.dcm', type: 'dicom', size: '45.2 MB' }
      ],
      tags: ['Radiologie', 'Scanner', 'Abdomen'],
      important: true
    },
    {
      id: 'evt8',
      type: 'analysis',
      date: '2025-09-01',
      title: 'Bilan de santé annuel',
      doctor: 'Dr. Samia Trabelsi',
      specialty: 'Médecine Générale',
      location: 'Cabinet Médical, Sousse',
      description: 'Bilan de santé complet annuel. Tous les paramètres dans la norme.',
      files: [
        { id: 'f13', name: 'Bilan complet.pdf', type: 'pdf', size: '425 KB' }
      ],
      tags: ['Bilan', 'Prévention'],
      important: false
    }
  ];

  // Filtrage
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || event.type === selectedType;

    const matchesYear = selectedYear === 'all' || 
      new Date(event.date).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesType && matchesYear;
  });

  // Grouper par mois
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const handleDownload = (file: any) => {
    // En production: télécharger le fichier réel
    alert(`Téléchargement de ${file.name}...`);
  };

  const handleView = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  const handleShare = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setShareModalOpen(true);
    setShareSuccess(false);
    setShareEmail('');
  };

  const handleSendShare = () => {
    // En production: envoyer l'email réel
    setTimeout(() => {
      setShareSuccess(true);
      setTimeout(() => {
        setShareModalOpen(false);
        setSelectedEvent(null);
      }, 2000);
    }, 1000);
  };

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="w-5 h-5" />;
      case 'analysis': return <TestTube className="w-5 h-5" />;
      case 'prescription': return <Pill className="w-5 h-5" />;
      case 'imaging': return <Scan className="w-5 h-5" />;
      case 'vaccination': return <Syringe className="w-5 h-5" />;
      case 'surgery': return <Activity className="w-5 h-5" />;
      case 'hospital': return <Heart className="w-5 h-5" />;
      case 'emergency': return <AlertCircle className="w-5 h-5" />;
      default: return <ClipboardList className="w-5 h-5" />;
    }
  };

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'consultation': return 'blue';
      case 'analysis': return 'purple';
      case 'prescription': return 'green';
      case 'imaging': return 'orange';
      case 'vaccination': return 'teal';
      case 'surgery': return 'red';
      case 'hospital': return 'pink';
      case 'emergency': return 'red';
      default: return 'gray';
    }
  };

  const years = ['2026', '2025', '2024', '2023'];
  const eventTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'consultation', label: 'Consultations' },
    { value: 'analysis', label: 'Analyses' },
    { value: 'prescription', label: 'Ordonnances' },
    { value: 'imaging', label: 'Imagerie' },
    { value: 'vaccination', label: 'Vaccinations' },
    { value: 'surgery', label: 'Chirurgies' },
    { value: 'hospital', label: 'Hospitalisations' },
    { value: 'emergency', label: 'Urgences' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Chronologie Médicale
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Historique complet de vos événements médicaux
        </p>
      </div>

      {/* Filters */}
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
                placeholder="Rechercher dans l'historique..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">Toutes les années</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Stethoscope className="w-5 h-5" />}
          label="Consultations"
          value={events.filter(e => e.type === 'consultation').length}
          color="blue"
        />
        <StatCard
          icon={<TestTube className="w-5 h-5" />}
          label="Analyses"
          value={events.filter(e => e.type === 'analysis').length}
          color="purple"
        />
        <StatCard
          icon={<Scan className="w-5 h-5" />}
          label="Imageries"
          value={events.filter(e => e.type === 'imaging').length}
          color="orange"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Documents"
          value={events.reduce((acc, e) => acc + e.files.length, 0)}
          color="green"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
            <div key={monthYear}>
              {/* Month Header */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {monthYear}
                </h2>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-600">
                  {monthEvents.length} événement{monthEvents.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-4">
                {monthEvents.map((event) => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                    onView={() => handleView(event)}
                    onShare={() => handleShare(event)}
                    onDownload={handleDownload}
                    getEventIcon={getEventIcon}
                    getEventColor={getEventColor}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && !shareModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-${getEventColor(selectedEvent.type)}-100 rounded-lg flex items-center justify-center text-${getEventColor(selectedEvent.type)}-600`}>
                  {getEventIcon(selectedEvent.type)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedEvent.title}</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Professionnel de santé</h3>
                <p className="text-gray-900">{selectedEvent.doctor}</p>
                <p className="text-sm text-gray-600">{selectedEvent.specialty}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Lieu</h3>
                <p className="text-gray-900">{selectedEvent.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900">{selectedEvent.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedEvent.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Documents ({selectedEvent.files.length})</h3>
                  <div className="space-y-2">
                    {selectedEvent.files.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileTypeIcon type={file.type} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(file)}
                          className="ml-2 p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => handleShare(selectedEvent)}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShareModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">Partager par email</h2>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Envoyez cet événement médical à un professionnel de santé
              </p>
            </div>

            <div className="p-6 space-y-4">
              {!shareSuccess ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Événement à partager:</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedEvent.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedEvent.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email du destinataire
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="medecin@exemple.tn"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      Le destinataire recevra un lien sécurisé pour consulter les documents médicaux.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé !</h3>
                  <p className="text-sm text-gray-600">
                    Le partage a été envoyé à {shareEmail}
                  </p>
                </div>
              )}
            </div>

            {!shareSuccess && (
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendShare}
                  disabled={!shareEmail}
                  className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineEventCard({ 
  event, 
  onView, 
  onShare, 
  onDownload,
  getEventIcon,
  getEventColor
}: {
  event: TimelineEvent;
  onView: () => void;
  onShare: () => void;
  onDownload: (file: any) => void;
  getEventIcon: (type: TimelineEventType) => React.ReactNode;
  getEventColor: (type: TimelineEventType) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = getEventColor(event.type);

  return (
    <div className={`bg-white rounded-xl border-2 ${event.important ? 'border-rose-200 bg-rose-50/30' : 'border-gray-200'} hover:shadow-lg transition-shadow`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 flex-shrink-0`}>
            {getEventIcon(event.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                  {event.important && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-medium">
                      Important
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <span>•</span>
                  <span>{event.doctor}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onView}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir les détails"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={onShare}
                  className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Partager"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{event.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {event.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>

            {/* Files */}
            {event.files.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-rose-600 mb-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{event.files.length} document{event.files.length > 1 ? 's' : ''}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>

                {expanded && (
                  <div className="space-y-2 mt-3">
                    {event.files.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileTypeIcon type={file.type} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                            <p className="text-xs text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDownload(file)}
                          className="ml-2 p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-xl p-4 border border-${color}-200`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`text-${color}-600`}>
          {icon}
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
    </div>
  );
}

function FileTypeIcon({ type }: { type: 'pdf' | 'image' | 'dicom' }) {
  switch (type) {
    case 'pdf':
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-red-600" />
        </div>
      );
    case 'image':
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Image className="w-5 h-5 text-blue-600" />
        </div>
      );
    case 'dicom':
      return (
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Activity className="w-5 h-5 text-purple-600" />
        </div>
      );
  }
}
