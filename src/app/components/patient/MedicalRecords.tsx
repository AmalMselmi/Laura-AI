import { useState } from 'react';
import { 
  FileText, Image as ImageIcon, FileSpreadsheet, FileCheck,
  Upload, Filter, Calendar as CalendarIcon, Search, Download,
  Eye, Share2, Trash2, MoreVertical, FolderOpen, Plus
} from 'lucide-react';

export function MedicalRecords() {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const documents = [
    {
      id: '1',
      title: 'IRM abdominale - Contrôle Bosniak',
      type: 'Imagerie',
      date: '2026-01-10',
      doctor: 'Dr. Leila Gharbi',
      size: '12.4 MB',
      tags: ['IRM', 'Bosniak IIF', 'Abdomen']
    },
    {
      id: '2',
      title: 'Bilan sanguin complet',
      type: 'Analyses',
      date: '2026-01-05',
      doctor: 'Dr. Sami Ben Ahmed',
      size: '2.1 MB',
      tags: ['Biologie', 'Sang']
    },
    {
      id: '3',
      title: 'Compte-rendu consultation néphrologie',
      type: 'Rapport',
      date: '2025-12-28',
      doctor: 'Dr. Mohamed Trabelsi',
      size: '856 KB',
      tags: ['Néphrologie', 'Suivi']
    },
    {
      id: '4',
      title: 'Scanner abdominal avec injection',
      type: 'Imagerie',
      date: '2025-12-15',
      doctor: 'Dr. Leila Gharbi',
      size: '18.2 MB',
      tags: ['Scanner', 'Bosniak IIF']
    },
    {
      id: '5',
      title: 'Ordonnance - Traitement de fond',
      type: 'Ordonnance',
      date: '2025-12-10',
      doctor: 'Dr. Mohamed Trabelsi',
      size: '124 KB',
      tags: ['Médicaments']
    },
    {
      id: '6',
      title: 'Échographie rénale',
      type: 'Imagerie',
      date: '2025-11-20',
      doctor: 'Dr. Amira Kacem',
      size: '4.8 MB',
      tags: ['Échographie', 'Reins']
    }
  ];

  const filteredDocs = documents.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dossier médical</h1>
        <p className="text-gray-600">Tous vos documents médicaux centralisés et sécurisés</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard icon={<FileText className="w-5 h-5" />} label="Total documents" value="24" color="blue" />
        <StatsCard icon={<ImageIcon className="w-5 h-5" />} label="Imageries" value="12" color="purple" />
        <StatsCard icon={<FileSpreadsheet className="w-5 h-5" />} label="Analyses" value="8" color="green" />
        <StatsCard icon={<FileCheck className="w-5 h-5" />} label="Rapports" value="4" color="orange" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="Imagerie">Imagerie</option>
              <option value="Analyses">Analyses</option>
              <option value="Rapport">Rapports</option>
              <option value="Ordonnance">Ordonnances</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {filteredDocs.length} document{filteredDocs.length > 1 ? 's' : ''}
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredDocs.map((doc) => (
            <DocumentRow key={doc.id} document={doc} />
          ))}
        </div>
      </div>

      {/* Timeline View Option */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Vue chronologique</h3>
            <p className="text-sm text-blue-700">Visualisez votre parcours médical sur une ligne du temps</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Voir la timeline
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-10 h-10 ${colors[color as keyof typeof colors]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DocumentRow({ document }: { document: any }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Imagerie':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      case 'Analyses':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'Rapport':
        return <FileCheck className="w-5 h-5 text-orange-600" />;
      case 'Ordonnance':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {getTypeIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{document.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{document.doctor}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {formatDate(document.date)}
            </span>
            <span>•</span>
            <span>{document.size}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {document.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Voir">
            <Eye className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Télécharger">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Partager">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
