import { useState } from 'react';
import { Heart, Check, X, Star, Sparkles, Crown } from 'lucide-react';

interface PricingProps {
  onBack: () => void;
}

export function Pricing({ onBack }: PricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'TND/mois',
      description: 'Pour découvrir Laura',
      icon: Heart,
      color: 'gray',
      features: [
        { text: 'Stockage : 500 MB', included: true },
        { text: "Jusqu'à 20 documents", included: true },
        { text: 'Carnet de santé basique', included: true },
        { text: 'Gestion des rendez-vous', included: true },
        { text: 'Application mobile', included: true },
        { text: 'Scanner de documents', included: false },
        { text: 'Analyse IA', included: false },
        { text: 'Lecteur DICOM', included: false },
        { text: 'Support prioritaire', included: false },
        { text: 'Gestion familiale illimitée', included: false }
      ],
      cta: 'Commencer gratuitement',
      popular: false
    },
    {
      name: 'Essentiel',
      price: '15',
      period: 'TND/mois',
      description: 'Pour les utilisateurs réguliers',
      icon: Star,
      color: 'blue',
      features: [
        { text: 'Stockage : 5 GB', included: true },
        { text: 'Documents illimités', included: true },
        { text: 'Carnet de santé complet', included: true },
        { text: 'Gestion des rendez-vous', included: true },
        { text: 'Application mobile', included: true },
        { text: 'Scanner de documents IA', included: true },
        { text: '20 analyses IA par mois', included: true },
        { text: 'Lecteur DICOM intégré', included: true },
        { text: 'Support email', included: true },
        { text: "Jusqu'à 5 membres famille", included: true }
      ],
      cta: 'Essayer 14 jours gratuits',
      popular: true
    },
    {
      name: 'Premium',
      price: '35',
      period: 'TND/mois',
      description: 'Pour une santé sans limite',
      icon: Crown,
      color: 'rose',
      features: [
        { text: 'Stockage : 50 GB', included: true },
        { text: 'Documents illimités', included: true },
        { text: 'Carnet de santé premium', included: true },
        { text: 'Gestion avancée des RDV', included: true },
        { text: 'Application mobile', included: true },
        { text: 'Scanner illimité IA', included: true },
        { text: 'Analyses IA illimitées', included: true },
        { text: 'Lecteur DICOM avancé', included: true },
        { text: 'Support prioritaire 24/7', included: true },
        { text: 'Famille illimitée', included: true }
      ],
      cta: 'Essayer 14 jours gratuits',
      popular: false,
      extras: [
        'Téléconsultation incluse',
        'Rappels SMS personnalisés',
        'Export PDF illimité',
        'Partage sécurisé avancé'
      ]
    }
  ];

  const professionalPlan = {
    name: 'Professionnel',
    price: '99',
    period: 'TND/mois',
    description: 'Pour les médecins et cliniques',
    features: [
      'Accès illimité aux dossiers patients',
      'Lecteur DICOM professionnel',
      'Gestion multi-praticiens',
      'Agenda médical intelligent',
      'Prise de RDV en ligne',
      'Statistiques et rapports',
      "API d'intégration",
      'Formation et support dédié',
      'Conformité RGPD garantie',
      'Sauvegarde automatique quotidienne'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-rose-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Laura</span>
          </div>
          <button
            onClick={onBack}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
          >
            Retour
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Choisissez le plan qui vous convient
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6">
            14 jours d'essai gratuit • Sans engagement • Annulation à tout moment
          </p>

          {/* Toggle Annual/Monthly */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-full p-1 border border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base transition-colors ${
                billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base transition-colors ${
                billingPeriod === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
            >
              Annuel
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Patient Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Professional Plan */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl p-6 sm:p-8 text-white mb-8 sm:mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm mb-3">
                  Pour professionnels de santé
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">{professionalPlan.name}</h3>
                <p className="text-rose-100 text-sm sm:text-base">{professionalPlan.description}</p>
              </div>
              <div className="text-left lg:text-right">
                <div className="text-3xl sm:text-4xl font-bold">{professionalPlan.price} TND</div>
                <div className="text-rose-100">par mois</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {professionalPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-rose-50 text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-medium text-base sm:text-lg">
              Demander une démo
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
            Questions fréquentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="Puis-je changer de plan à tout moment ?"
              answer="Oui, vous pouvez changer de plan à tout moment. Les changements sont effectifs immédiatement et vous ne payez que la différence au prorata."
            />
            <FAQItem
              question="Mes données sont-elles sécurisées ?"
              answer="Absolument. Toutes vos données sont chiffrées de bout en bout et stockées sur des serveurs sécurisés conformes aux normes médicales internationales."
            />
            <FAQItem
              question="Y a-t-il des frais d'activation ?"
              answer="Non, aucun frais d'activation. Vous ne payez que votre abonnement mensuel ou annuel."
            />
            <FAQItem
              question="Comment fonctionne l'essai gratuit ?"
              answer="L'essai de 14 jours vous donne accès complet au plan choisi. Aucune carte bancaire n'est requise pour commencer."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  const Icon = plan.icon;

  const colorClasses = {
    gray: {
      bg: 'from-gray-100 to-gray-200',
      text: 'text-gray-700',
      button: 'bg-gray-600 hover:bg-gray-700',
      border: 'border-gray-200'
    },
    blue: {
      bg: 'from-blue-100 to-blue-200',
      text: 'text-blue-700',
      button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      border: 'border-blue-300'
    },
    rose: {
      bg: 'from-rose-100 to-rose-200',
      text: 'text-rose-700',
      button: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800',
      border: 'border-rose-300'
    }
  };

  const colors = colorClasses[plan.color as keyof typeof colorClasses];

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
        plan.popular ? 'ring-2 ring-blue-600 relative' : 'border border-gray-200'
      }`}
    >
      {plan.popular && (
        <div className="bg-gradient-to-r from-blue-600 to-rose-500 text-white text-center py-2 text-sm font-medium">
          ⭐ Le plus populaire
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center ${colors.text} mb-4`}>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">{plan.description}</p>

        <div className="mb-6">
          <span className="text-4xl sm:text-5xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-gray-600 ml-2">{plan.period}</span>
        </div>

        <button className={`w-full py-2.5 sm:py-3 ${colors.button} text-white rounded-lg transition-all font-medium mb-6 text-sm sm:text-base`}>
          {plan.cta}
        </button>

        <div className="space-y-3">
          {plan.features.map((feature: any, index: number) => (
            <div key={index} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-xs sm:text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {plan.extras && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Bonus Premium :</p>
            {plan.extras.map((extra: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 mb-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600" />
                <span>{extra}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm sm:text-base">{question}</span>
        <span className="text-gray-400 text-xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 text-gray-600 text-sm sm:text-base">
          {answer}
        </div>
      )}
    </div>
  );
}
