import { useState, useEffect } from 'react';
import {
  User, Calendar, FileText, Activity, Pill, AlertCircle,
  Download, ChevronLeft, Plus, Brain, TrendingUp, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listRadiologistDicomFolders } from '../../lib/api/radiologist';

interface PatientRecordProps {
  patientId: string;
  onBack: () => void;
}

export function PatientMedicalRecord({ patientId, onBack }: PatientRecordProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history' | 'ai-insights'>('overview');
  const { user, token } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);

  const [patient, setPatient] = useState({
    id: patientId,
    name: '…',
    dateOfBirth: '—',
    age: 0,
    gender: '—',
    bloodType: '—',
    phone: '—',
    email: '—',
    address: '—',
    insurance: { provider: '—', number: '—', coverage: 0 },
    emergencyContact: { name: '—', relation: '—', phone: '—' },
    allergies: [] as string[],
    chronicConditions: [] as { name: string; diagnosedDate: string; status: string; severity: string }[],
    currentMedications: [] as { name: string; dosage: string; frequency: string; since: string }[],
    vitalSigns: {
      lastUpdate: '—',
      bloodPressure: '—',
      heartRate: 0,
      temperature: 0,
      weight: 0,
      height: 0,
    },
  });

  const [documents, setDocuments] = useState<
    { id: string; type: string; name: string; date: string; uploadedBy: string; aiAnalyzed: boolean; aiSummary?: string }[]
  >([]);

  const [consultationHistory, setConsultationHistory] = useState<
    { id: string; date: string; type: string; doctor: string; diagnosis: string; notes: string; prescriptions: string[] }[]
  >([]);

  useEffect(() => {
    if (user?.role !== 'radiologist' || !token) {
      setLoadError('Connectez-vous comme radiologue pour charger ce dossier.');
      return;
    }
    let cancelled = false;
    void listRadiologistDicomFolders()
      .then(folders => {
        if (cancelled) return;
        const f = folders.find(x => x.id === patientId);
        if (!f) {
          setLoadError('Dossier introuvable pour ce compte.');
          return;
        }
        setLoadError(null);
        setPatient({
          id: patientId,
          name: f.patientName?.trim() || 'Patient',
          dateOfBirth: '—',
          age: 0,
          gender: '—',
          bloodType: '—',
          phone: '—',
          email: f.patientId?.trim() || '—',
          address: '—',
          insurance: { provider: '—', number: '—', coverage: 0 },
          emergencyContact: { name: '—', relation: '—', phone: '—' },
          allergies: [],
          chronicConditions: f.pathology
            ? [{ name: f.pathology, diagnosedDate: '—', status: 'Dossier DICOM', severity: '—' }]
            : [],
          currentMedications: [],
          vitalSigns: {
            lastUpdate: f.updatedAt || f.createdAt,
            bloodPressure: '—',
            heartRate: 0,
            temperature: 0,
            weight: 0,
            height: 0,
          },
        });
        setDocuments(
          (f.files ?? []).map(file => ({
            id: file.id,
            type: file.modality || f.modality || 'DICOM',
            name: file.name || 'Fichier',
            date: file.uploadDate.slice(0, 10),
            uploadedBy: 'DICOM',
            aiAnalyzed: Boolean(f.reportContent),
            aiSummary: f.reportContent?.slice(0, 400) || undefined,
          }))
        );
        setConsultationHistory([
          {
            id: 'h1',
            date: f.updatedAt.slice(0, 10),
            type: 'Imagerie',
            doctor: 'Cabinet',
            diagnosis: f.pathology || '—',
            notes: `Statut rapport : ${f.reportStatus}. Modalité : ${f.modality || '—'}.`,
            prescriptions: [],
          },
        ]);
      })
      .catch(e => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Chargement impossible');
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, user?.role, token]);

  const aiInsights = {
    riskScore: 35, // Low-Medium
    riskLevel: 'Faible-Modéré',
    riskFactors: [
      {
        factor: 'Kyste rénal Bosniak IIF',
        severity: 'Modéré',
        description: 'Nécessite surveillance régulière. Risque de malignité: 5-10%',
        recommendation: 'IRM de contrôle tous les 6 mois'
      },
      {
        factor: 'Hypertension artérielle',
        severity: 'Contrôlé',
        description: 'Bien contrôlée sous traitement',
        recommendation: 'Continuer Losartan, surveillance mensuelle'
      }
    ],
    timeline: [
      { date: '2023-06-15', event: 'Diagnostic initial kyste rénal', type: 'diagnosis' },
      { date: '2023-06-20', event: 'Début traitement Losartan', type: 'treatment' },
      { date: '2023-12-10', event: 'IRM de contrôle - Stable', type: 'imaging' },
      { date: '2024-06-15', event: 'IRM de contrôle - Stable', type: 'imaging' },
      { date: '2025-01-20', event: 'Bilan rénal - Normal', type: 'lab' },
      { date: '2025-06-10', event: 'IRM de contrôle - Stable', type: 'imaging' },
      { date: '2025-12-15', event: 'Consultation HTA - Contrôlée', type: 'consultation' },
      { date: '2026-01-15', event: 'IRM de contrôle - Stable', type: 'imaging' }
    ],
    recommendations: [
      'Poursuivre surveillance semestrielle par IRM',
      'Maintenir contrôle tensionnel strict',
      'Encourager activité physique régulière',
      'Surveillance créatinine tous les 3 mois'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Retour aux rendez-vous</span>
        </button>

        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{patient.name}</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="opacity-80">Âge</div>
                  <div className="font-semibold">{patient.age > 0 ? `${patient.age} ans` : '—'}</div>
                </div>
                <div>
                  <div className="opacity-80">Sexe</div>
                  <div className="font-semibold">{patient.gender}</div>
                </div>
                <div>
                  <div className="opacity-80">Groupe sanguin</div>
                  <div className="font-semibold">{patient.bloodType}</div>
                </div>
                <div>
                  <div className="opacity-80">Assurance</div>
                  <div className="font-semibold">{patient.insurance.provider}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        <TabButton
          label="Vue d'ensemble"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          label="Documents"
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
          count={documents.length}
        />
        <TabButton
          label="Historique"
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          count={consultationHistory.length}
        />
        <TabButton
          label="Analyse IA"
          active={activeTab === 'ai-insights'}
          onClick={() => setActiveTab('ai-insights')}
          icon={<Brain className="w-4 h-4" />}
        />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Vital Signs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Signes vitaux</h2>
              <span className="text-sm text-gray-500">
                Dernière mise à jour: {new Date(patient.vitalSigns.lastUpdate).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <VitalSignCard label="Tension" value={patient.vitalSigns.bloodPressure} unit="mmHg" />
              <VitalSignCard label="Fréquence" value={patient.vitalSigns.heartRate} unit="bpm" />
              <VitalSignCard label="Température" value={patient.vitalSigns.temperature} unit="°C" />
              <VitalSignCard label="Poids" value={patient.vitalSigns.weight} unit="kg" />
              <VitalSignCard label="Taille" value={patient.vitalSigns.height} unit="cm" />
            </div>
          </div>

          {/* Allergies & Chronic Conditions */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-red-900">Allergies</h2>
              </div>
              {patient.allergies.length > 0 ? (
                <ul className="space-y-2">
                  {patient.allergies.map((allergy, index) => (
                    <li key={index} className="flex items-center gap-2 text-red-900">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      <span className="font-medium">{allergy}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-700">Aucune allergie connue</p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-orange-900">Conditions chroniques</h2>
              </div>
              {patient.chronicConditions.length > 0 ? (
                <div className="space-y-3">
                  {patient.chronicConditions.map((condition, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-orange-900">{condition.name}</div>
                      <div className="text-sm text-orange-700 mt-1">
                        Diagnostiqué le {new Date(condition.diagnosedDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          condition.severity === 'Modéré' ? 'bg-orange-200 text-orange-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {condition.severity}
                        </span>
                        <span className="text-xs text-gray-600">{condition.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-700">Aucune condition chronique</p>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Médicaments actuels</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {patient.currentMedications.map((med, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Pill className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{med.name}</div>
                    <div className="text-sm text-gray-600">
                      {med.dosage} - {med.frequency}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Depuis {new Date(med.since).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Documents médicaux ({documents.length})
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Ajouter un document
            </button>
          </div>

          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-600">Type: {doc.type}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(doc.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {doc.aiAnalyzed && doc.aiSummary && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Analyse IA</span>
                      </div>
                      <p className="text-sm text-purple-800">{doc.aiSummary}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Historique des consultations ({consultationHistory.length})
          </h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {consultationHistory.map((consultation, index) => (
              <div key={consultation.id} className="relative pl-16 pb-8">
                {/* Timeline Dot */}
                <div className="absolute left-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{consultation.type}</h3>
                      <p className="text-sm text-gray-600">{consultation.doctor}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {new Date(consultation.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Diagnostic:</span>
                      <p className="text-gray-900 mt-1">{consultation.diagnosis}</p>
                    </div>

                    {consultation.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-900 mt-1">{consultation.notes}</p>
                      </div>
                    )}

                    {consultation.prescriptions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Prescriptions:</span>
                        <ul className="mt-1 space-y-1">
                          {consultation.prescriptions.map((rx, i) => (
                            <li key={i} className="text-gray-900 flex items-center gap-2">
                              <Pill className="w-4 h-4 text-blue-600" />
                              {rx}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Analyse IA Complète</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="text-sm opacity-90 mb-2">Score de risque global</div>
                <div className="text-4xl font-bold">{aiInsights.riskScore}/100</div>
                <div className="text-sm mt-1">{aiInsights.riskLevel}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Facteurs identifiés</div>
                <div className="text-4xl font-bold">{aiInsights.riskFactors.length}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Événements suivis</div>
                <div className="text-4xl font-bold">{aiInsights.timeline.length}</div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Facteurs de risque</h3>
            <div className="space-y-4">
              {aiInsights.riskFactors.map((risk, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{risk.factor}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      risk.severity === 'Modéré' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Recommandation:</strong> {risk.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Chronologie médicale</h3>
            </div>
            <div className="space-y-2">
              {aiInsights.timeline.map((event, index) => (
                <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="text-sm font-medium text-gray-600 w-28">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'diagnosis' ? 'bg-red-500' :
                    event.type === 'treatment' ? 'bg-green-500' :
                    event.type === 'imaging' ? 'bg-blue-500' :
                    event.type === 'lab' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 text-sm text-gray-900">{event.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Recommandations IA</h3>
            <ul className="space-y-2">
              {aiInsights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-900">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick, count, icon }: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function VitalSignCard({ label, value, unit }: {
  label: string;
  value: number | string;
  unit: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  );
}