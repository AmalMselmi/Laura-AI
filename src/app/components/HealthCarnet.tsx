/** @deprecated Legacy component not used by routed app (`routes.tsx`). */
import Navigation from './Navigation';
import { BookHeart, Syringe, Activity, Baby, Heart, TrendingUp, Plus, Calendar, Shield, CheckCircle } from 'lucide-react';

type Page = 'dashboard' | 'records' | 'appointments' | 'carnet' | 'dicom';

interface HealthCarnetProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function HealthCarnet({ onNavigate, onLogout }: HealthCarnetProps) {
  const vaccinations = [
    { name: 'COVID-19 (Rappel)', date: '2025-09-15', nextDue: '2026-09-15', status: 'à jour' },
    { name: 'Grippe saisonnière', date: '2025-10-20', nextDue: '2026-10-01', status: 'à jour' },
    { name: 'Tétanos', date: '2023-03-10', nextDue: '2033-03-10', status: 'à jour' },
    { name: 'Hépatite B', date: '2020-06-05', nextDue: null, status: 'complété' },
  ];

  const medicalHistory = [
    { year: '2024', condition: 'Kyste rénal Bosniak IIF', status: 'Suivi actif', category: 'Urologie' },
    { year: '2022', condition: 'Hypertension artérielle', status: 'Traité', category: 'Cardiologie' },
    { year: '2020', condition: 'Cholestérol élevé', status: 'Contrôlé', category: 'Cardiologie' },
  ];

  const allergies = [
    { name: 'Pénicilline', severity: 'Élevée', reaction: 'Éruption cutanée' },
    { name: 'Pollen', severity: 'Modérée', reaction: 'Rhinite allergique' },
  ];

  const chronicTreatments = [
    { medication: 'Lisinopril 10mg', frequency: '1x par jour', startDate: '2022-05-01', reason: 'Hypertension' },
    { medication: 'Atorvastatine 20mg', frequency: '1x par soir', startDate: '2020-08-15', reason: 'Cholestérol' },
  ];

  return (
    <div className="min-h-screen flex">
      <Navigation currentPage="carnet" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 lg:ml-64">
        <div className="pt-16 lg:pt-0 p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl mb-2">Mon carnet de santé</h1>
                <p className="text-[var(--color-text-light)]">Votre historique médical complet et sécurisé</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                <Shield className="text-green-600" size={20} />
                <span className="text-sm font-medium text-green-700">Lié au CNAM</span>
              </div>
            </div>
          </div>

          {/* CNAM Info Banner */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <BookHeart className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Carnet de santé numérique CNAM</h3>
                <p className="text-sm text-[var(--color-text-light)] mb-3">
                  Votre carnet est synchronisé avec la Caisse Nationale d'Assurance Maladie. 
                  Vos informations sont automatiquement mises à jour et sécurisées.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="text-sm text-green-700 font-medium">Dernière synchronisation : Il y a 2 heures</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Vaccinations */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <Syringe className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold">Vaccinations</h2>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm">
                    <Plus size={16} className="inline mr-1" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {vaccinations.map((vaccine, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-[var(--color-text)] mb-1">{vaccine.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-light)]">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Dernière dose : {new Date(vaccine.date).toLocaleDateString('fr-FR')}
                            </span>
                            {vaccine.nextDue && (
                              <>
                                <span>•</span>
                                <span>Prochain rappel : {new Date(vaccine.nextDue).toLocaleDateString('fr-FR')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          vaccine.status === 'à jour' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {vaccine.status === 'à jour' ? '✓ À jour' : 'Complété'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Activity className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold">Antécédents médicaux</h2>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm">
                    <Plus size={16} className="inline mr-1" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {medicalHistory.map((history, idx) => (
                    <div key={idx} className="p-4 rounded-xl border-l-4 border-l-[var(--color-primary)] bg-gradient-to-r from-blue-50 to-transparent">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[var(--color-text-light)] bg-gray-100 px-2 py-1 rounded">
                              {history.year}
                            </span>
                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                              {history.category}
                            </span>
                          </div>
                          <h4 className="font-medium text-[var(--color-text)]">{history.condition}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          history.status === 'Suivi actif' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {history.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Treatments */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Heart className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold">Traitements en cours</h2>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm">
                    <Plus size={16} className="inline mr-1" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {chronicTreatments.map((treatment, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-[var(--color-text)] mb-1">{treatment.medication}</h4>
                          <p className="text-sm text-[var(--color-text-light)] mb-2">
                            {treatment.frequency} • Depuis {new Date(treatment.startDate).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-[var(--color-text-light)]">
                            Raison : {treatment.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Allergies */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Allergies</h3>
                  <button className="text-[var(--color-primary)] hover:underline text-sm">
                    <Plus size={16} className="inline" />
                  </button>
                </div>

                <div className="space-y-3">
                  {allergies.map((allergy, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-red-50 border border-red-200">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-[var(--color-text)]">{allergy.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          allergy.severity === 'Élevée' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {allergy.severity}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-light)]">{allergy.reaction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blood Type */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-4 text-white">Groupe sanguin</h3>
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-4xl font-bold">O+</span>
                  </div>
                </div>
                <p className="text-sm text-red-100 text-center mt-4">
                  Rhésus positif
                </p>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
                <h3 className="font-semibold mb-4">Résumé</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-light)]">Vaccins à jour</span>
                    <span className="font-semibold text-green-600">4/4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-light)]">Allergies connues</span>
                    <span className="font-semibold text-red-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-light)]">Traitements actifs</span>
                    <span className="font-semibold text-purple-600">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-light)]">Conditions suivies</span>
                    <span className="font-semibold text-orange-600">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
