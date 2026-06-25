/** @deprecated Legacy component not used by routed app (`routes.tsx`). */
import Navigation from './Navigation';
import { FileText, Upload, Search, Filter, Download, Eye, Trash2, Calendar, Tag, FolderOpen } from 'lucide-react';
import { useState } from 'react';

type Page = 'dashboard' | 'records' | 'appointments' | 'carnet' | 'dicom';

interface MedicalRecordsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function MedicalRecords({ onNavigate, onLogout }: MedicalRecordsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Tous les documents', count: 24 },
    { id: 'imagerie', label: 'Imagerie', count: 8 },
    { id: 'biologie', label: 'Analyses biologiques', count: 6 },
    { id: 'ordonnances', label: 'Ordonnances', count: 5 },
    { id: 'comptes-rendus', label: 'Comptes rendus', count: 3 },
    { id: 'autres', label: 'Autres', count: 2 },
  ];

  const documents = [
    {
      id: 1,
      name: 'IRM Abdominale - Suivi Bosniak IIF',
      date: '2026-01-15',
      category: 'imagerie',
      doctor: 'Dr. Mohamed Trabelsi',
      size: '24.5 MB',
      tags: ['Bosniak', 'IRM', 'Suivi'],
      isNew: true,
    },
    {
      id: 2,
      name: 'Analyses sanguines complètes',
      date: '2026-01-15',
      category: 'biologie',
      doctor: 'Dr. Amira Ben Salem',
      size: '1.2 MB',
      tags: ['Biologie', 'Routine'],
      isNew: true,
    },
    {
      id: 3,
      name: 'Ordonnance - Traitement hypertension',
      date: '2026-01-10',
      category: 'ordonnances',
      doctor: 'Dr. Amira Ben Salem',
      size: '0.5 MB',
      tags: ['Cardio', 'Ordonnance'],
      isNew: false,
    },
    {
      id: 4,
      name: 'Scanner abdominal',
      date: '2025-12-20',
      category: 'imagerie',
      doctor: 'Dr. Mohamed Trabelsi',
      size: '32.1 MB',
      tags: ['Scanner', 'Suivi'],
      isNew: false,
    },
    {
      id: 5,
      name: 'Bilan lipidique',
      date: '2025-12-10',
      category: 'biologie',
      doctor: 'Dr. Amira Ben Salem',
      size: '0.8 MB',
      tags: ['Biologie', 'Cardio'],
      isNew: false,
    },
    {
      id: 6,
      name: 'Compte rendu consultation cardiologie',
      date: '2025-11-28',
      category: 'comptes-rendus',
      doctor: 'Dr. Amira Ben Salem',
      size: '1.1 MB',
      tags: ['Cardio', 'Consultation'],
      isNew: false,
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'imagerie': 'from-blue-500 to-blue-600',
      'biologie': 'from-green-500 to-green-600',
      'ordonnances': 'from-purple-500 to-purple-600',
      'comptes-rendus': 'from-orange-500 to-orange-600',
      'autres': 'from-gray-500 to-gray-600',
    };
    return colors[category] || colors['autres'];
  };

  return (
    <div className="min-h-screen flex">
      <Navigation currentPage="records" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0 p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl mb-2">Mon dossier médical</h1>
                <p className="text-[var(--color-text-light)]">Centralisez et gérez tous vos documents de santé</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors shadow-md">
                <Upload size={20} />
                <span>Ajouter un document</span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" size={20} />
              <input
                type="text"
                placeholder="Rechercher un document, médecin, ou tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span>Filtres</span>
            </button>
          </div>

          {/* Categories */}
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-primary)]'
                }`}
              >
                <FolderOpen size={16} />
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === cat.id
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCategoryColor(doc.category)} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <FileText className="text-white" size={32} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[var(--color-text)] truncate">{doc.name}</h3>
                          {doc.isNew && (
                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium whitespace-nowrap">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-light)]">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span>{doc.doctor}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-[var(--color-text-light)] text-xs"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors text-sm">
                        <Eye size={16} />
                        Consulter
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors text-sm">
                        <Download size={16} />
                        Télécharger
                      </button>
                      {doc.category === 'imagerie' && (
                        <button 
                          onClick={() => onNavigate('dicom')}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 transition-colors text-sm"
                        >
                          <FileText size={16} />
                          Visualiser DICOM
                        </button>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm ml-auto">
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-[var(--color-text-light)]" size={48} />
              </div>
              <h3 className="mb-2">Aucun document trouvé</h3>
              <p className="text-[var(--color-text-light)] mb-6">
                Essayez de modifier vos critères de recherche ou ajoutez un nouveau document
              </p>
              <button className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors">
                Ajouter un document
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
