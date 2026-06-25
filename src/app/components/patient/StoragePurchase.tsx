import { useState } from 'react';
import { 
  HardDrive, Check, Zap, Shield, CreditCard, Lock,
  AlertCircle, CheckCircle, Loader2, X
} from 'lucide-react';

interface StoragePurchaseProps {
  currentStorage: number; // GB
  usedStorage: number; // GB
  onClose?: () => void;
}

export function StoragePurchase({ currentStorage, usedStorage, onClose }: StoragePurchaseProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');

  const storagePlans = [
    {
      id: 'storage-10',
      name: '10 GB',
      storage: 10,
      price: 5,
      popular: false,
      features: [
        'Stockage supplémentaire 10 GB',
        'Upload illimité',
        'Accès à vie',
        'Sauvegarde automatique'
      ]
    },
    {
      id: 'storage-50',
      name: '50 GB',
      storage: 50,
      price: 20,
      popular: true,
      savings: 'Économisez 30%',
      features: [
        'Stockage supplémentaire 50 GB',
        'Upload illimité',
        'Accès à vie',
        'Sauvegarde automatique',
        'Partage avancé',
        'Support prioritaire'
      ]
    },
    {
      id: 'storage-100',
      name: '100 GB',
      storage: 100,
      price: 35,
      popular: false,
      savings: 'Économisez 45%',
      features: [
        'Stockage supplémentaire 100 GB',
        'Upload illimité',
        'Accès à vie',
        'Sauvegarde automatique',
        'Partage avancé',
        'Support prioritaire',
        'Archivage longue durée'
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setStep('payment');
  };

  const handlePayment = async () => {
    setStep('processing');
    
    // Simulation de paiement Konnect
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  const selectedPlanData = storagePlans.find(p => p.id === selectedPlan);
  const usagePercentage = (usedStorage / currentStorage) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <HardDrive className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Espace de stockage
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Augmentez votre capacité de stockage pour vos documents médicaux
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Current Storage Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Utilisation actuelle</h2>
          <span className="text-sm text-gray-600">
            {usedStorage} GB / {currentStorage} GB
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all ${
              usagePercentage > 90 ? 'bg-red-500' :
              usagePercentage > 70 ? 'bg-amber-500' :
              'bg-gradient-to-r from-blue-600 to-rose-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          {usagePercentage >= 90 ? (
            <span className="text-red-600 font-medium">⚠️ Espace presque plein - Ajoutez du stockage</span>
          ) : usagePercentage >= 70 ? (
            <span className="text-amber-600 font-medium">Vous utilisez {usagePercentage.toFixed(0)}% de votre espace</span>
          ) : (
            <span>Vous utilisez {usagePercentage.toFixed(0)}% de votre espace</span>
          )}
        </p>
      </div>

      {step === 'select' && (
        <>
          {/* Storage Plans */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {storagePlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border-2 p-6 transition-all ${
                  plan.popular 
                    ? 'border-blue-600 shadow-lg relative' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-rose-500 text-white px-4 py-1 rounded-full text-xs font-medium">
                      ⭐ Populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <HardDrive className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  {plan.savings && (
                    <p className="text-sm text-green-600 font-medium mb-2">{plan.savings}</p>
                  )}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">TND</span>
                  </div>
                  <p className="text-sm text-gray-600">Paiement unique</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white hover:from-blue-700 hover:to-rose-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Acheter maintenant
                </button>
              </div>
            ))}
          </div>

          {/* Security Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Paiement 100% sécurisé</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Tous les paiements sont traités de manière sécurisée via Konnect, la solution de paiement leader en Tunisie.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-blue-700">
                  <span className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Cryptage SSL
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Certifié PCI DSS
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Remboursement garanti
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'payment' && selectedPlanData && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Forfait</span>
                  <span className="font-medium">{selectedPlanData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stockage actuel</span>
                  <span>{currentStorage} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nouveau stockage</span>
                  <span className="font-medium text-green-600">
                    {currentStorage + selectedPlanData.storage} GB
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedPlanData.price} TND
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Méthode de paiement</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mb-2 mx-auto text-gray-700" />
                  <div className="font-medium text-gray-900">Carte bancaire</div>
                  <div className="text-xs text-gray-600">Visa, Mastercard</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <Zap className="w-6 h-6 mb-2 mx-auto text-gray-700" />
                  <div className="font-medium text-gray-900">E-Wallet</div>
                  <div className="text-xs text-gray-600">Konnect Wallet</div>
                </button>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Konnect Logo */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-center gap-3">
              <Lock className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Paiement sécurisé par</span>
              <span className="font-bold text-gray-900 text-lg">Konnect</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors"
              >
                Payer {selectedPlanData.price} TND
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Traitement du paiement...
          </h3>
          <p className="text-gray-600 mb-6">
            Veuillez patienter pendant que nous traitons votre paiement via Konnect
          </p>
          <div className="space-y-2 text-left">
            <ProcessStep text="Connexion à Konnect" completed={true} />
            <ProcessStep text="Vérification du paiement" completed={true} />
            <ProcessStep text="Activation du stockage" completed={false} current={true} />
          </div>
        </div>
      )}

      {step === 'success' && selectedPlanData && (
        <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h3>
          <p className="text-gray-600 mb-6">
            Votre espace de stockage a été augmenté avec succès
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">Nouveau stockage total</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {currentStorage + selectedPlanData.storage} GB
            </div>
            <div className="text-sm text-green-600 font-medium">
              +{selectedPlanData.storage} GB ajoutés
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors"
          >
            Continuer
          </button>
        </div>
      )}
    </div>
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
