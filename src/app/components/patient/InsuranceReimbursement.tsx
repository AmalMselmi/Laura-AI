import { useState } from 'react';
import { CreditCard, Upload, CheckCircle, Clock, AlertCircle, Download, Plus, FileText, Euro } from 'lucide-react';

interface InsuranceProvider {
  id: string;
  name: string;
  type: 'securite_sociale' | 'mutuelle';
  number: string;
  status: 'active' | 'pending' | 'expired';
  coverage: number;
}

interface Reimbursement {
  id: string;
  date: string;
  description: string;
  amount: number;
  reimbursed: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  provider: string;
  documents: string[];
}

export function InsuranceReimbursement() {
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);

  const [insurances] = useState<InsuranceProvider[]>([
    {
      id: '1',
      name: 'Sécurité Sociale Française',
      type: 'securite_sociale',
      number: '1 75 03 75 123 456 78',
      status: 'active',
      coverage: 70
    },
    {
      id: '2',
      name: 'Mutuelle Générale',
      type: 'mutuelle',
      number: 'MUT-2024-789456',
      status: 'active',
      coverage: 100
    }
  ]);

  const [reimbursements] = useState<Reimbursement[]>([
    {
      id: '1',
      date: '12/01/2026',
      description: 'Consultation spécialiste - Dr. Ben Salah',
      amount: 60,
      reimbursed: 42,
      status: 'completed',
      provider: 'Sécurité Sociale',
      documents: ['Feuille de soins', 'Ordonnance']
    },
    {
      id: '2',
      date: '08/01/2026',
      description: 'Scanner abdominal',
      amount: 150,
      reimbursed: 105,
      status: 'processing',
      provider: 'Sécurité Sociale + Mutuelle',
      documents: ['Prescription', 'Compte-rendu']
    },
    {
      id: '3',
      date: '05/01/2026',
      description: 'Médicaments - Pharmacie Centrale',
      amount: 35.50,
      reimbursed: 24.85,
      status: 'completed',
      provider: 'Sécurité Sociale',
      documents: ['Ordonnance']
    }
  ]);

  const totalPending = reimbursements
    .filter(r => r.status === 'pending' || r.status === 'processing')
    .reduce((sum, r) => sum + (r.amount - r.reimbursed), 0);

  const totalReimbursed = reimbursements
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.reimbursed, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assurance & Remboursements</h1>
        <p className="text-gray-600">
          Gérez vos cartes d'assurance et suivez vos remboursements en temps réel
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total remboursé</span>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{totalReimbursed.toFixed(2)}€</p>
          <p className="text-xs text-blue-600 mt-1">Ce mois-ci</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">En attente</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">{totalPending.toFixed(2)}€</p>
          <p className="text-xs text-orange-600 mt-1">En traitement</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Taux couverture</span>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">85%</p>
          <p className="text-xs text-green-600 mt-1">Moyenne</p>
        </div>
      </div>

      {/* Insurance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Mes cartes d'assurance</h2>
          <button
            onClick={() => setShowAddInsurance(!showAddInsurance)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une carte
          </button>
        </div>

        {showAddInsurance && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ajouter une carte d'assurance</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'assurance
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sécurité Sociale</option>
                  <option>Mutuelle</option>
                  <option>Assurance Privée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'organisme
                </label>
                <input
                  type="text"
                  placeholder="Ex: CPAM Paris"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1 75 03 75 123 456 78"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scanner la carte (recto/verso)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Glissez votre carte ou cliquez pour parcourir</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddInsurance(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {insurances.map((insurance) => (
            <div
              key={insurance.id}
              className={`rounded-2xl p-6 text-white relative overflow-hidden ${
                insurance.type === 'securite_sociale'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                  : 'bg-gradient-to-br from-purple-600 to-purple-800'
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-sm text-white/80 mb-1">
                      {insurance.type === 'securite_sociale' ? 'Sécurité Sociale' : 'Mutuelle'}
                    </p>
                    <h3 className="font-bold text-lg">{insurance.name}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    insurance.status === 'active' ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {insurance.status === 'active' ? 'Active' : 'En attente'}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-white/80 mb-1">Numéro de carte</p>
                  <p className="font-mono text-lg tracking-wider">{insurance.number}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Couverture</p>
                    <p className="font-bold text-xl">{insurance.coverage}%</p>
                  </div>
                  <CreditCard className="w-12 h-12 text-white/30" />
                </div>
              </div>

              {/* Card decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* New Claim Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Demandes de remboursement</h2>
        <button
          onClick={() => setShowNewClaim(!showNewClaim)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </button>
      </div>

      {/* New Claim Form */}
      {showNewClaim && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Nouvelle demande de remboursement</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de soins
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Consultation</option>
                <option>Examen médical</option>
                <option>Médicaments</option>
                <option>Hospitalisation</option>
                <option>Autres</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date des soins
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez les soins reçus..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents justificatifs
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Glissez vos documents ici</p>
                <p className="text-xs text-gray-500">Feuille de soins, ordonnance, facture...</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewClaim(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors"
              >
                Soumettre la demande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reimbursement History */}
      <div className="space-y-4">
        {reimbursements.map((reimb) => (
          <div
            key={reimb.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    reimb.status === 'completed' ? 'bg-green-100' :
                    reimb.status === 'processing' ? 'bg-orange-100' :
                    reimb.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {reimb.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : reimb.status === 'processing' ? (
                      <Clock className="w-6 h-6 text-orange-600" />
                    ) : reimb.status === 'rejected' ? (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{reimb.description}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{reimb.date}</span>
                      <span>•</span>
                      <span>{reimb.provider}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Montant : </span>
                    <span className="font-semibold text-gray-900">{reimb.amount}€</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Remboursé : </span>
                    <span className="font-semibold text-green-600">{reimb.reimbursed}€</span>
                  </div>
                  {reimb.status === 'processing' && (
                    <div>
                      <span className="text-gray-600">Reste : </span>
                      <span className="font-semibold text-orange-600">
                        {(reimb.amount - reimb.reimbursed).toFixed(2)}€
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {reimb.documents.map((doc, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                  reimb.status === 'completed' ? 'bg-green-100 text-green-800' :
                  reimb.status === 'processing' ? 'bg-orange-100 text-orange-800' :
                  reimb.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reimb.status === 'completed' ? 'Remboursé' :
                   reimb.status === 'processing' ? 'En cours' :
                   reimb.status === 'rejected' ? 'Rejeté' : 'En attente'}
                </span>
                
                {reimb.status === 'completed' && (
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Euro className="w-5 h-5" />
          Comment ça marche ?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>Ajoutez vos cartes d'assurance (Sécurité Sociale, Mutuelle)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>Uploadez vos documents de soins (feuille de soins, ordonnance, facture)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>Laura AI soumet automatiquement votre demande à vos organismes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            <span>Suivez l'avancement en temps réel et recevez vos remboursements</span>
          </li>
        </ul>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Premium :</strong> Avec le forfait Premium, les demandes sont entièrement automatisées 
            et vous recevez vos remboursements 2x plus rapidement.
          </p>
        </div>
      </div>
    </div>
  );
}
