import { useState } from 'react';
import { Upload, Clock, Eye, Maximize2, ZoomIn, ZoomOut, RotateCw, Move, Ruler, Type, Download, Share2 } from 'lucide-react';
import exampleImage from 'figma:asset/1cbbefb1adca15cc924f1d370a625ec0e14835e6.png';

interface DicomStudy {
  id: string;
  patientName: string;
  studyDate: string;
  modality: string;
  description: string;
  series: number;
  images: number;
}

interface DicomViewerProps {
  file?: File | null;
}

export function DicomViewer({ file }: DicomViewerProps) {
  const [currentView, setCurrentView] = useState<'upload' | 'history' | 'viewer'>(file ? 'viewer' : 'history');
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);

  // Simulation d'études DICOM
  const studies: DicomStudy[] = [
    {
      id: '1',
      patientName: 'PATIENT, John',
      studyDate: '2026-01-15',
      modality: 'CT',
      description: 'Abdo-pelv coronal portal',
      series: 3,
      images: 307
    },
    {
      id: '2',
      patientName: 'PATIENT, Sarah',
      studyDate: '2026-01-14',
      modality: 'MRI',
      description: 'Brain MRI with contrast',
      series: 4,
      images: 156
    },
    {
      id: '3',
      patientName: 'PATIENT, Ahmed',
      studyDate: '2026-01-13',
      modality: 'CT',
      description: 'Chest CT scan',
      series: 2,
      images: 89
    }
  ];

  const handleOpenStudy = (study: DicomStudy) => {
    setSelectedStudy(study);
    setCurrentView('viewer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Visualiseur DICOM</h1>
        <p className="text-gray-600">
          Visualisez et analysez vos images médicales avec des outils professionnels
        </p>
      </div>

      {/* Toggle Buttons */}
      {currentView !== 'viewer' && (
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            Historique
          </button>
          <button
            onClick={() => setCurrentView('upload')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'upload'
                ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-5 h-5" />
            Nouvel import
          </button>
        </div>
      )}

      {/* Upload View */}
      {currentView === 'upload' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="max-w-2xl mx-auto">
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Importer des fichiers DICOM
              </h3>
              <p className="text-gray-600 mb-4">
                Glissez vos fichiers DICOM ici ou cliquez pour parcourir
              </p>
              <input
                type="file"
                accept=".dcm,.dicom"
                multiple
                className="hidden"
                id="dicom-upload"
              />
              <label
                htmlFor="dicom-upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-rose-600 transition-all"
              >
                Sélectionner des fichiers
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Formats supportés : .dcm, .dicom • Taille max : 500 MB par fichier
              </p>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-3">📁 Import depuis PACS</h4>
              <p className="text-sm text-blue-800 mb-4">
                Vous pouvez également importer directement depuis votre système PACS
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Adresse PACS (IP:Port)"
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="AE Title"
                  className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Se connecter au PACS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {currentView === 'history' && (
        <div className="space-y-4">
          {studies.map((study) => (
            <div
              key={study.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleOpenStudy(study)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {study.modality}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{study.patientName}</h3>
                      <p className="text-sm text-gray-600">{study.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>📅 {new Date(study.studyDate).toLocaleDateString('fr-FR')}</span>
                    <span>📊 {study.series} séries</span>
                    <span>🖼️ {study.images} images</span>
                  </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors">
                  <Eye className="w-4 h-4" />
                  Visualiser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viewer */}
      {currentView === 'viewer' && selectedStudy && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('history')}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Retour
                </button>
                <div className="text-white">
                  <p className="font-semibold">{selectedStudy.patientName}</p>
                  <p className="text-sm text-gray-400">{selectedStudy.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Zoom +">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Zoom -">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Rotation">
                  <RotateCw className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Déplacer">
                  <Move className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Mesure">
                  <Ruler className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Annotation">
                  <Type className="w-5 h-5" />
                </button>
                <div className="w-px h-8 bg-gray-700 mx-2"></div>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Plein écran">
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Télécharger">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors" title="Partager">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Viewer Area - 3 views like the reference */}
          <div className="grid grid-cols-3 gap-1 p-1" style={{ height: '600px' }}>
            {/* Coronal View */}
            <div className="bg-black rounded-lg overflow-hidden relative border-2 border-blue-500">
              <img 
                src={exampleImage} 
                alt="Coronal view" 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                Abdo-pelv coronal portal
              </div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
                WW: 400<br/>
                WL: 40<br/>
                SE: 2<br/>
                IM: 13/25
              </div>
            </div>

            {/* Sagittal View */}
            <div className="bg-black rounded-lg overflow-hidden relative border-2 border-gray-600">
              <img 
                src={exampleImage} 
                alt="Sagittal view" 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                Abdo-pelv sag portal
              </div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
                WW: 400<br/>
                WL: 40<br/>
                SE: 3<br/>
                IM: 1/24
              </div>
            </div>

            {/* Axial View */}
            <div className="bg-black rounded-lg overflow-hidden relative border-2 border-green-500">
              <img 
                src={exampleImage} 
                alt="Axial view" 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                PORTAL TAP 2.0 CE PORTAL PORTAL
              </div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
                WW: 400<br/>
                WL: 40<br/>
                SE: 1<br/>
                IM: 54/307
              </div>
              <div className="absolute top-3 right-3 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                MPR
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="bg-gray-800 border-t border-gray-700 p-3">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-400">Patient: </span>
                  <span className="font-semibold">{selectedStudy.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Date: </span>
                  <span>{new Date(selectedStudy.studyDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Modalité: </span>
                  <span>{selectedStudy.modality}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                  1x1
                </button>
                <button className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                  2x2
                </button>
                <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                  3x3
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {currentView !== 'viewer' && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-3 text-lg">✨ Fonctionnalités du visualiseur DICOM</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-purple-800">
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Visualisation multi-plans (axial, coronal, sagittal)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Outils de mesure avancés (distance, angle, ROI)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Réglage fenêtrage (Window/Level)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Annotations et rapports</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Export DICOM et PDF</span>
            </div>
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>Partage sécurisé avec confrères</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}