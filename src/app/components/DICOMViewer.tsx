import Navigation from './Navigation';
import { FileImage, ZoomIn, ZoomOut, RotateCw, Download, Maximize, Info, Layers, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type Page = 'dashboard' | 'records' | 'appointments' | 'carnet' | 'dicom';

interface DICOMViewerProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function DICOMViewer({ onNavigate, onLogout }: DICOMViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentSlice, setCurrentSlice] = useState(45);
  const totalSlices = 120;

  const studyInfo = {
    patientName: 'Sarah Ben Ahmed',
    patientID: '123456789',
    studyDate: '2026-01-15',
    modality: 'MRI',
    bodyPart: 'Abdomen',
    studyDescription: 'IRM Abdominale - Suivi Bosniak IIF',
    institution: 'Centre d\'Imagerie Médicale - Tunis',
    physician: 'Dr. Mohamed Trabelsi',
  };

  const measurements = [
    { label: 'Kyste rénal droit', value: '3.2 cm', location: 'Slice 45' },
    { label: 'Densité', value: '25 HU', location: 'ROI 1' },
  ];

  return (
    <div className="min-h-screen flex">
      <Navigation currentPage="dicom" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 lg:ml-64 bg-gray-900">
        <div className="pt-16 lg:pt-0 h-screen flex flex-col">
          {/* Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FileImage className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-white font-semibold">{studyInfo.studyDescription}</h2>
                  <p className="text-sm text-gray-400">{studyInfo.patientName} • {new Date(studyInfo.studyDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm min-w-[80px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn size={20} />
                </button>

                <div className="w-px h-8 bg-gray-700 mx-2"></div>

                <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors" title="Rotation">
                  <RotateCw size={20} />
                </button>
                <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors" title="Plein écran">
                  <Maximize size={20} />
                </button>
                <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors" title="Paramètres">
                  <Settings size={20} />
                </button>

                <div className="w-px h-8 bg-gray-700 mx-2"></div>

                <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
                  <Download size={18} />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Main Viewer */}
            <div className="flex-1 flex flex-col bg-black">
              {/* Image Display Area */}
              <div className="flex-1 relative flex items-center justify-center p-4">
                {/* Mock DICOM Image */}
                <div 
                  className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
                  style={{ 
                    width: `${zoom}%`,
                    maxWidth: '100%',
                    aspectRatio: '1',
                  }}
                >
                  {/* Simulated medical image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <FileImage size={64} className="text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">Visualisation DICOM</p>
                      <p className="text-gray-600 text-xs mt-2">Slice {currentSlice} / {totalSlices}</p>
                    </div>
                  </div>

                  {/* Image overlay info */}
                  <div className="absolute top-4 left-4 text-white text-xs space-y-1 font-mono bg-black/50 p-2 rounded">
                    <div>{studyInfo.patientName}</div>
                    <div>{studyInfo.modality} • {studyInfo.bodyPart}</div>
                    <div>{new Date(studyInfo.studyDate).toLocaleDateString('fr-FR')}</div>
                  </div>

                  <div className="absolute top-4 right-4 text-white text-xs font-mono bg-black/50 p-2 rounded">
                    <div>Zoom: {zoom}%</div>
                    <div>WL: 40 / WW: 350</div>
                  </div>

                  <div className="absolute bottom-4 left-4 text-white text-xs font-mono bg-black/50 p-2 rounded">
                    <div>Slice: {currentSlice}/{totalSlices}</div>
                    <div>Thickness: 5mm</div>
                  </div>
                </div>

                {/* Measurement tools */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-full p-2">
                  <button className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
                    Mesurer
                  </button>
                  <button className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
                    Annoter
                  </button>
                  <button className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
                    ROI
                  </button>
                </div>
              </div>

              {/* Slice Navigator */}
              <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentSlice(Math.max(1, currentSlice - 1))}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max={totalSlices}
                      value={currentSlice}
                      onChange={(e) => setCurrentSlice(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>{currentSlice}</span>
                      <span>{totalSlices}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentSlice(Math.min(totalSlices, currentSlice + 1))}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Info Panel */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
              {/* Study Information */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-blue-400" size={20} />
                  <h3 className="text-white font-semibold">Informations de l'étude</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Patient', value: studyInfo.patientName },
                    { label: 'ID Patient', value: studyInfo.patientID },
                    { label: 'Date', value: new Date(studyInfo.studyDate).toLocaleDateString('fr-FR') },
                    { label: 'Modalité', value: studyInfo.modality },
                    { label: 'Région', value: studyInfo.bodyPart },
                    { label: 'Médecin', value: studyInfo.physician },
                    { label: 'Institution', value: studyInfo.institution },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-400">{item.label}:</span>
                      <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measurements */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="text-green-400" size={20} />
                  <h3 className="text-white font-semibold">Mesures</h3>
                </div>
                <div className="space-y-3">
                  {measurements.map((measurement, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-gray-700">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white text-sm font-medium">{measurement.label}</span>
                        <span className="text-green-400 font-bold">{measurement.value}</span>
                      </div>
                      <span className="text-xs text-gray-400">{measurement.location}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
                  Ajouter une mesure
                </button>
              </div>

              {/* Series Thumbnails */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileImage className="text-purple-400" size={20} />
                  <h3 className="text-white font-semibold">Séries</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((series) => (
                    <div
                      key={series}
                      className="aspect-square rounded-lg bg-gray-700 hover:bg-gray-600 border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <div className="text-center">
                        <FileImage size={24} className="text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">Série {series}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
