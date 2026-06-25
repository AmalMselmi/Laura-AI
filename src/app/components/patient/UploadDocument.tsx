import { useState } from 'react';
import { 
  Upload, X, FileText, Image, File, CheckCircle, AlertCircle,
  Calendar, User, Tag, Loader2
} from 'lucide-react';

interface UploadDocumentProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadDocument({ onClose, onSuccess }: UploadDocumentProps) {
  const [step, setStep] = useState<'upload' | 'details' | 'processing' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'analyses',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    tags: ''
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setStep('details');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStep('details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulation de l'upload
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 2000);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-600" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ajouter un document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {step === 'upload' && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Glissez-déposez votre document
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  ou cliquez pour sélectionner un fichier
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                  />
                  <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors cursor-pointer inline-block">
                    Choisir un fichier
                  </span>
                </label>
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  PDF, JPG, PNG, DOC • Taille max : 10 MB
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickActionCard
                  icon={<FileText className="w-6 h-6" />}
                  title="Scanner un document"
                  description="Utilisez votre caméra pour numériser"
                />
                <QuickActionCard
                  icon={<Image className="w-6 h-6" />}
                  title="Prendre une photo"
                  description="Photographiez directement votre document"
                />
              </div>
            </div>
          )}

          {step === 'details' && selectedFile && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Preview */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getFileIcon(selectedFile)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setStep('upload');
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du document *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Bilan sanguin complet"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de document *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="analyses">Analyses médicales</option>
                    <option value="imagerie">Imagerie (IRM, Scanner, Radio)</option>
                    <option value="ordonnance">Ordonnance</option>
                    <option value="rapport">Compte-rendu médical</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du document *
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médecin prescripteur
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    placeholder="Dr. Nom du médecin"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Étiquettes (séparées par des virgules)
                </label>
                <div className="relative">
                  <Tag className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Ex: urgent, cardiologie, contrôle"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors"
                >
                  Ajouter le document
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Traitement en cours...
              </h3>
              <p className="text-gray-600">Votre document est en cours d'ajout au dossier médical</p>
              <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                <ProcessStep text="Upload du fichier" completed={true} />
                <ProcessStep text="Extraction des données" completed={true} />
                <ProcessStep text="Analyse IA du contenu" completed={false} current={true} />
                <ProcessStep text="Ajout au dossier" completed={false} />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Document ajouté avec succès !
              </h3>
              <p className="text-gray-600 mb-6">
                Votre document a été ajouté à votre dossier médical
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-900">
                  💡 Une analyse IA a été générée automatiquement. Consultez-la dans la section "Recommandations IA".
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}

function ProcessStep({ text, completed, current }: { text: string; completed: boolean; current?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : current ? (
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
      )}
      <span className={completed ? 'text-green-600' : current ? 'text-blue-600 font-medium' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}
