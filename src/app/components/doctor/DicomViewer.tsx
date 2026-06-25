import { useState } from 'react';
import { Upload, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, Info, Layers } from 'lucide-react';

export function DicomViewer() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En production, on traiterait le fichier DICOM ici
      // Pour la démo, on simule juste l'upload
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Exemples de fichiers DICOM pour la démo
  const sampleImages = [
    { id: 1, name: 'Scanner Rénal - Patient A', date: '2025-01-15', type: 'CT' },
    { id: 2, name: 'IRM Abdominale - Patient B', date: '2025-01-20', type: 'MRI' },
    { id: 3, name: 'Échographie - Patient C', date: '2025-01-25', type: 'US' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Lecteur DICOM
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Visualisez et analysez vos images médicales DICOM
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium text-gray-900 mb-2">
            Télécharger une image DICOM
          </span>
          <span className="text-sm text-gray-600">
            Formats supportés: DCM, DICOM (Max 100MB)
          </span>
          <input
            type="file"
            accept=".dcm,.dicom"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Viewer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedFile ? (
            <div className="relative">
              {/* Toolbar */}
              <div className="bg-gray-900 text-white p-3 flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Rotation"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-700 mx-2"></div>
                <button
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Plein écran"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="ml-auto text-sm">
                  Zoom: {zoom}%
                </div>
              </div>

              {/* Image Display */}
              <div className="bg-black aspect-video flex items-center justify-center p-8">
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <img
                    src={selectedFile}
                    alt="DICOM"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium text-gray-900">CT Scan</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium text-gray-900">2025-01-30</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Résolution:</span>
                    <span className="ml-2 font-medium text-gray-900">512x512</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Épaisseur:</span>
                    <span className="ml-2 font-medium text-gray-900">5mm</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center text-gray-400 p-8">
              <ImageIcon className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Aucune image sélectionnée</p>
              <p className="text-sm mt-2">Téléchargez un fichier DICOM pour commencer</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Images Récentes
            </h3>
            <div className="space-y-3">
              {sampleImages.map((image) => (
                <button
                  key={image.id}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {image.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{image.date}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {image.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  À propos du format DICOM
                </h4>
                <p className="text-sm text-blue-800">
                  DICOM (Digital Imaging and Communications in Medicine) est le standard international 
                  pour les images médicales et les informations associées.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Fonctionnalités</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Zoom et rotation d'image</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Lecture des métadonnées</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Support multi-formats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Mesures et annotations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Export et partage</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
