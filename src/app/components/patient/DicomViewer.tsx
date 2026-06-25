import { useState } from 'react';
import { 
  Upload, ZoomIn, ZoomOut, RotateCw, Maximize2, Download,
  Grid3x3, Eye, Ruler, Contrast, Sun, FileImage,
  Play, Pause, SkipBack, SkipForward, Layers, Info
} from 'lucide-react';

export function DicomViewer() {
  const [hasFile, setHasFile] = useState(false);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [currentSlice, setCurrentSlice] = useState(12);

  const handleUploadDemo = () => {
    setHasFile(true);
  };

  const demoFiles = [
    { name: 'IRM Abdominale - 25/01/2026', slices: 24, modality: 'MRI' },
    { name: 'Scanner Thorax - 10/01/2026', slices: 120, modality: 'CT' },
    { name: 'Radio Poumons - 05/01/2026', slices: 1, modality: 'CR' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Lecteur DICOM IMAIOS</h1>
        <p className="text-sm sm:text-base text-gray-600">Visualisez vos images médicales (IRM, Scanner, Radiologie) gratuitement</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileImage className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Lecteur DICOM professionnel gratuit</h3>
            <p className="text-xs sm:text-sm text-purple-800 mb-3">
              Visualisez vos images médicales au format DICOM sans frais. Compatible avec IRM, scanners, radiographies et échographies.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-purple-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                Support multi-séries et multi-coupes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                Outils de mesure et annotation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                Contrôle luminosité/contraste
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                Export et partage sécurisé
              </li>
            </ul>
          </div>
        </div>
      </div>

      {!hasFile ? (
        <>
          {/* Upload Zone */}
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 sm:p-16 text-center hover:border-purple-400 transition-colors">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Charger une image DICOM
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Glissez-déposez vos fichiers DICOM ou cliquez pour parcourir
              </p>
              <button 
                onClick={handleUploadDemo}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors text-base sm:text-lg font-medium"
              >
                Sélectionner des fichiers
              </button>
              <p className="text-xs sm:text-sm text-gray-500 mt-4">
                Formats acceptés : .dcm, .dicom • Fichiers ZIP acceptés
              </p>
            </div>
          </div>

          {/* Demo Files */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ou essayez avec nos fichiers de démonstration</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {demoFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={handleUploadDemo}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <FileImage className="w-8 h-8 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{file.name}</h4>
                      <div className="flex gap-2 text-xs text-gray-600">
                        <span>{file.modality}</span>
                        <span>•</span>
                        <span>{file.slices} coupes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Cliquer pour ouvrir →</div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Viewer Interface */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-gray-200 p-3 sm:p-4 bg-gray-50">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Zoom avant">
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Zoom arrière">
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <div className="px-2 sm:px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm">
                  {zoom}%
                </div>
              </div>

              <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Rotation">
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Plein écran">
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Grille">
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Mesure">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 hidden lg:block"></div>

              <div className="hidden lg:flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 w-8">{brightness}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Contrast className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 w-8">{contrast}</span>
                </div>
              </div>

              <button className="ml-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-xs sm:text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            </div>
          </div>

          {/* Main Viewer Area */}
          <div className="flex flex-col lg:flex-row">
            {/* Side Panel - Series List */}
            <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 p-4 max-h-48 lg:max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Séries (3)
              </h3>
              <div className="space-y-2">
                <SeriesItem name="IRM T1 Axial" slices={24} active={true} />
                <SeriesItem name="IRM T2 Sagittal" slices={18} active={false} />
                <SeriesItem name="IRM FLAIR Coronal" slices={20} active={false} />
              </div>
            </div>

            {/* Image Display Area */}
            <div className="flex-1 bg-black p-4 sm:p-8">
              <div className="relative aspect-square max-w-2xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
                {/* Demo DICOM Image */}
                <img 
                  src="https://images.unsplash.com/photo-1620423855978-e5d74a7bef30?w=800" 
                  alt="DICOM Scan"
                  className="w-full h-full object-contain"
                  style={{
                    filter: `brightness(${brightness / 50}) contrast(${contrast / 50})`
                  }}
                />
                
                {/* Image Info Overlay */}
                <div className="absolute top-4 left-4 text-white text-xs sm:text-sm space-y-1 bg-black/50 backdrop-blur-sm p-3 rounded-lg">
                  <div>Patient: ANONYME</div>
                  <div>Étude: IRM Abdominale</div>
                  <div>Date: 10/01/2026</div>
                  <div>Séries: 1/3</div>
                  <div>Coupe: {currentSlice}/24</div>
                </div>

                {/* Measurement Overlay */}
                <div className="absolute bottom-4 left-4 text-white text-xs sm:text-sm bg-black/50 backdrop-blur-sm p-3 rounded-lg">
                  <div>FOV: 350mm x 350mm</div>
                  <div>Épaisseur: 5.0mm</div>
                  <div>TE: 90ms | TR: 3000ms</div>
                </div>
              </div>

              {/* Slice Navigator */}
              <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
                <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={currentSlice}
                  onChange={(e) => setCurrentSlice(Number(e.target.value))}
                  className="w-32 sm:w-64"
                />
                <span className="text-white text-xs sm:text-sm whitespace-nowrap">{currentSlice} / 24</span>
                <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Right Panel - Info */}
            <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informations patient
              </h3>
              <div className="bg-white rounded-lg p-3 mb-4 text-xs sm:text-sm space-y-2">
                <div>
                  <span className="text-gray-500">Nom:</span>
                  <p className="font-medium">Ben Salah Amira</p>
                </div>
                <div>
                  <span className="text-gray-500">ID Patient:</span>
                  <p className="font-medium">TN-2026-001</p>
                </div>
                <div>
                  <span className="text-gray-500">Date étude:</span>
                  <p className="font-medium">10/01/2026</p>
                </div>
                <div>
                  <span className="text-gray-500">Modalité:</span>
                  <p className="font-medium">IRM</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Outils</h3>
              <div className="space-y-2">
                <ToolButton icon={<Ruler />} label="Mesure distance" />
                <ToolButton icon={<Eye />} label="Annotation" />
                <ToolButton icon={<Contrast />} label="Fenêtrage" />
                <ToolButton icon={<Grid3x3 />} label="Grille de référence" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      {!hasFile && (
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            title="Multi-format"
            description="Support de tous les formats DICOM standards utilisés en imagerie médicale"
          />
          <FeatureCard
            title="Sécurisé & Privé"
            description="Vos images restent privées et sont stockées de manière sécurisée et chiffrée"
          />
          <FeatureCard
            title="100% Gratuit"
            description="Accès illimité au lecteur DICOM sans frais ni abonnement requis"
          />
        </div>
      )}
    </div>
  );
}

function SeriesItem({ name, slices, active }: { name: string; slices: number; active: boolean }) {
  return (
    <button 
      className={`w-full p-3 rounded-lg text-left transition-colors text-xs sm:text-sm ${
        active ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border-2 border-gray-200 hover:border-blue-300'
      }`}
    >
      <p className={`font-medium mb-1 ${active ? 'text-blue-900' : 'text-gray-900'}`}>{name}</p>
      <p className={`text-xs ${active ? 'text-blue-700' : 'text-gray-600'}`}>{slices} coupes</p>
    </button>
  );
}

function ToolButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left">
      <div className="text-gray-600">{icon}</div>
      <span className="text-xs sm:text-sm text-gray-700">{label}</span>
    </button>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-600">{description}</p>
    </div>
  );
}
