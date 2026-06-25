import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Calendar, CreditCard, FileText, Plus, Edit2 } from 'lucide-react';
import { User } from '../../App';

interface InsuranceInfoProps {
  user: User;
}

export function InsuranceInfo({ user }: InsuranceInfoProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const insuranceData = {
    provider: 'CNAM (Caisse Nationale d\'Assurance Maladie)',
    policyNumber: '123456789',
    memberSince: '2015-03-01',
    status: 'active',
    coverage: {
      consultations: 85,
      hospitalisation: 100,
      medications: 70,
      imaging: 90,
      laboratory: 85
    },
    familyMembers: [
      { name: 'Amira Ben Salah', relation: 'Assuré principal', coverage: 85 },
      { name: 'Youssef Ben Salah', relation: 'Conjoint', coverage: 85 },
      { name: 'Sara Ben Salah', relation: 'Enfant', coverage: 100 }
    ],
    recentClaims: [
      {
        id: '1',
        date: '2026-01-20',
        type: 'Consultation',
        provider: 'Dr. Karim Mansour',
        amount: 80,
        covered: 68,
        status: 'remboursé'
      },
      {
        id: '2',
        date: '2026-01-15',
        type: 'IRM',
        provider: 'Centre Radiologie Sousse',
        amount: 450,
        covered: 405,
        status: 'remboursé'
      },
      {
        id: '3',
        date: '2026-01-10',
        type: 'Médicaments',
        provider: 'Pharmacie Centrale',
        amount: 45,
        covered: 31.5,
        status: 'remboursé'
      },
      {
        id: '4',
        date: '2025-12-20',
        type: 'Bilan sanguin',
        provider: 'Laboratoire Pasteur',
        amount: 120,
        covered: 102,
        status: 'en cours'
      }
    ],
    yearlyStats: {
      totalClaimed: 2450,
      totalCovered: 2087.5,
      coverageRate: 85.2,
      remainingBudget: 7550
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200'
  };

  const claimStatusColors = {
    'remboursé': 'bg-green-100 text-green-700',
    'en cours': 'bg-orange-100 text-orange-700',
    'rejeté': 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          Assurance Médicale
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Gérez votre couverture santé et suivez vos remboursements
        </p>
      </div>

      {/* Main Insurance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{insuranceData.provider}</h2>
              <p className="text-blue-100 text-sm">Assuré depuis {new Date(insuranceData.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[insuranceData.status as keyof typeof statusColors]} bg-white`}>
            Actif
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-blue-100 text-sm mb-1">N° de police</div>
            <div className="text-2xl font-bold font-mono">{insuranceData.policyNumber}</div>
          </div>
          <div>
            <div className="text-blue-100 text-sm mb-1">Membres couverts</div>
            <div className="text-2xl font-bold">{insuranceData.familyMembers.length} personnes</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 px-4 py-3 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors font-medium">
            Télécharger l'attestation
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle demande</span>
          </button>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de couverture</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <CoverageCard label="Consultations" rate={insuranceData.coverage.consultations} />
          <CoverageCard label="Hospitalisation" rate={insuranceData.coverage.hospitalisation} />
          <CoverageCard label="Médicaments" rate={insuranceData.coverage.medications} />
          <CoverageCard label="Imagerie" rate={insuranceData.coverage.imaging} />
          <CoverageCard label="Laboratoire" rate={insuranceData.coverage.laboratory} />
        </div>
      </div>

      {/* Yearly Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-sm text-blue-600 mb-1">Total demandé</div>
          <div className="text-2xl font-bold text-blue-900">{insuranceData.yearlyStats.totalClaimed} TND</div>
          <div className="text-xs text-blue-600 mt-1">Cette année</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-sm text-green-600 mb-1">Total remboursé</div>
          <div className="text-2xl font-bold text-green-900">{insuranceData.yearlyStats.totalCovered} TND</div>
          <div className="text-xs text-green-600 mt-1">Confirmé</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="text-sm text-purple-600 mb-1">Taux moyen</div>
          <div className="text-2xl font-bold text-purple-900">{insuranceData.yearlyStats.coverageRate}%</div>
          <div className="text-xs text-purple-600 mt-1">Couverture</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="text-sm text-orange-600 mb-1">Budget restant</div>
          <div className="text-2xl font-bold text-orange-900">{insuranceData.yearlyStats.remainingBudget} TND</div>
          <div className="text-xs text-orange-600 mt-1">Plafond annuel</div>
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bénéficiaires</h3>
        <div className="space-y-3">
          {insuranceData.familyMembers.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.relation}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{member.coverage}%</div>
                <div className="text-xs text-gray-500">Couverture</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Demandes récentes</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir tout
          </button>
        </div>
        <div className="space-y-3">
          {insuranceData.recentClaims.map((claim) => (
            <div key={claim.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{claim.type}</h4>
                  <p className="text-sm text-gray-600">{claim.provider}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(claim.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Montant</div>
                  <div className="font-semibold text-gray-900">{claim.amount} TND</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Remboursé</div>
                  <div className="font-semibold text-green-600">{claim.covered} TND</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Taux</div>
                  <div className="font-semibold text-blue-600">
                    {Math.round((claim.covered / claim.amount) * 100)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${claimStatusColors[claim.status as keyof typeof claimStatusColors]}`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Claim Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nouvelle demande de remboursement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de prestation
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Consultation</option>
                  <option>Médicaments</option>
                  <option>Imagerie (IRM, Scanner, Radio)</option>
                  <option>Laboratoire</option>
                  <option>Hospitalisation</option>
                  <option>Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">TND</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de la prestation
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joindre les justificatifs
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Cliquez pour ajouter des fichiers</p>
                  <p className="text-xs text-gray-500 mt-1">Facture, ordonnance, compte-rendu...</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  alert('Demande envoyée avec succès !');
                  setShowAddForm(false);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Info :</strong> Les demandes de remboursement sont traitées sous 5-7 jours ouvrables. 
          Vous serez notifié par email dès que votre demande sera validée.
        </p>
      </div>
    </div>
  );
}

function CoverageCard({ label, rate }: { label: string; rate: number }) {
  const getColor = (rate: number) => {
    if (rate >= 90) return 'from-green-500 to-green-600';
    if (rate >= 70) return 'from-blue-500 to-blue-600';
    return 'from-orange-500 to-orange-600';
  };

  return (
    <div className="relative bg-gray-50 rounded-lg p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r opacity-10" style={{
        background: `linear-gradient(to right, ${rate >= 90 ? '#22c55e' : rate >= 70 ? '#3b82f6' : '#f97316'} ${rate}%, transparent ${rate}%)`
      }}></div>
      <div className="relative">
        <div className="text-sm text-gray-600 mb-2">{label}</div>
        <div className="text-3xl font-bold text-gray-900">{rate}%</div>
      </div>
    </div>
  );
}
