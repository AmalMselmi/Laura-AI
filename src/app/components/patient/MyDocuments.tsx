import { useState } from 'react';
import { FileText, Download, Trash2, Eye, Calendar, Search } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  analysisResult?: any;
}

export function MyDocuments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Ordonnance Dr. Ben Salah',
      type: 'Ordonnance',
      date: '15/01/2026',
      size: '2.3 MB',
      analysisResult: {
        medications: ['Doliprane 1000mg', 'Amoxicilline 500mg']
      }
    },
    {
      id: '2',
      name: 'Analyse sanguine',
      type: 'Analyse',
      date: '10/01/2026',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'IRM abdominal',
      type: 'Imagerie',
      date: '05/01/2026',
      size: '15.7 MB'
    }
  ]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes documents</h1>
        <p className="text-gray-600">
          Tous vos documents médicaux analysés et sécurisés
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un document..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun document trouvé
            </h3>
            <p className="text-gray-600">
              Commencez par scanner votre premier document médical
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                        {doc.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {doc.date}
                      </span>
                      <span>{doc.size}</span>
                    </div>
                    
                    {doc.analysisResult && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                        <p className="text-green-900 font-medium mb-1">✓ Analysé par IA</p>
                        <p className="text-green-700">
                          {doc.analysisResult.medications.length} médicament(s) détecté(s)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total documents</p>
          <p className="text-3xl font-bold text-blue-900">{documents.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Analysés par IA</p>
          <p className="text-3xl font-bold text-green-900">
            {documents.filter(d => d.analysisResult).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Ce mois-ci</p>
          <p className="text-3xl font-bold text-purple-900">3</p>
        </div>
      </div>
    </div>
  );
}
