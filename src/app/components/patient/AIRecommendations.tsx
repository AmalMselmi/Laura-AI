import { 
  Sparkles, TrendingUp, Heart, Activity, AlertTriangle, 
  Calendar, FileText, CheckCircle, Info, ChevronRight,
  Brain, Pill, Apple, Dumbbell
} from 'lucide-react';

export function AIRecommendations() {
  const recommendations = [
    {
      id: 1,
      category: 'Suivi médical',
      priority: 'high',
      icon: Heart,
      color: 'red',
      title: 'Contrôle Bosniak IIF à planifier',
      description: 'Votre dernier examen IRM remonte à 4 mois. Un contrôle est recommandé dans les 2 prochains mois selon le protocole de suivi Bosniak IIF.',
      actions: [
        { label: 'Prendre RDV IRM', type: 'primary' },
        { label: 'Voir le protocole', type: 'secondary' }
      ],
      aiConfidence: 95,
      basedOn: ['IRM du 10/01/2026', 'Protocole Bosniak IIF']
    },
    {
      id: 2,
      category: 'Prévention',
      priority: 'medium',
      icon: Activity,
      color: 'blue',
      title: 'Bilan sanguin annuel',
      description: 'Vos derniers bilans montrent de bons résultats. Un contrôle annuel est recommandé pour suivre l\'évolution de votre créatinine et fonction rénale.',
      actions: [
        { label: 'Prendre RDV analyses', type: 'primary' }
      ],
      aiConfidence: 88,
      basedOn: ['Bilan sanguin 05/01/2026', 'Historique médical']
    },
    {
      id: 3,
      category: 'Hygiène de vie',
      priority: 'low',
      icon: Apple,
      color: 'green',
      title: 'Hydratation et alimentation',
      description: 'Pour optimiser votre fonction rénale, maintenez une hydratation de 1.5-2L par jour et limitez votre consommation de sel à 5g/jour.',
      actions: [
        { label: 'Voir les conseils', type: 'secondary' }
      ],
      aiConfidence: 92,
      basedOn: ['Dossier néphrologique', 'Recommandations HAS']
    },
    {
      id: 4,
      category: 'Médicaments',
      priority: 'medium',
      icon: Pill,
      color: 'purple',
      title: 'Renouvellement ordonnance',
      description: 'Votre ordonnance pour Ramipril 5mg expire dans 15 jours. Pensez à consulter votre médecin pour un renouvellement.',
      actions: [
        { label: 'Contacter Dr. Trabelsi', type: 'primary' },
        { label: 'Voir l\'ordonnance', type: 'secondary' }
      ],
      aiConfidence: 100,
      basedOn: ['Ordonnance du 10/12/2025']
    },
    {
      id: 5,
      category: 'Activité physique',
      priority: 'low',
      icon: Dumbbell,
      color: 'orange',
      title: 'Programme d\'exercice adapté',
      description: 'Une activité physique modérée (30min/jour) est bénéfique pour votre santé cardiovasculaire et rénale. Privilégiez la marche, natation ou vélo.',
      actions: [
        { label: 'Programme personnalisé', type: 'secondary' }
      ],
      aiConfidence: 85,
      basedOn: ['Profil patient', 'Recommandations OMS']
    }
  ];

  const healthScore = {
    overall: 78,
    categories: [
      { name: 'Suivi médical', score: 85, icon: Heart },
      { name: 'Médicaments', score: 90, icon: Pill },
      { name: 'Prévention', score: 70, icon: Activity },
      { name: 'Hygiène de vie', score: 65, icon: Apple }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Recommandations IA
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Analyses personnalisées basées sur votre dossier médical
          </p>
        </div>
        <div className="hidden sm:block">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Paramètres IA
          </button>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Score de santé global</h2>
            <p className="text-blue-100 text-sm sm:text-base">Basé sur l'analyse de votre dossier médical</p>
          </div>
          <div className="text-right">
            <div className="text-4xl sm:text-5xl font-bold">{healthScore.overall}</div>
            <div className="text-blue-100 text-sm">/100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {healthScore.categories.map((category) => (
            <div key={category.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <category.icon className="w-6 h-6 mb-2" />
              <div className="text-2xl font-bold mb-1">{category.score}</div>
              <div className="text-xs sm:text-sm text-blue-100">{category.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterTab label="Toutes" count={5} active />
        <FilterTab label="Prioritaires" count={2} />
        <FilterTab label="Prévention" count={2} />
        <FilterTab label="Suivi" count={1} />
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Comment fonctionne l'IA médicale ?</h3>
            <p className="text-sm text-blue-800 mb-3">
              Notre intelligence artificielle analyse en continu votre dossier médical, vos examens et votre historique pour générer des recommandations personnalisées.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Analyse basée sur les recommandations médicales officielles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Mise à jour automatique à chaque nouveau document</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Toujours validée par votre médecin traitant</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          <strong>⚠️ Important :</strong> Ces recommandations sont générées automatiquement et ne remplacent pas l'avis d'un professionnel de santé. Consultez toujours votre médecin pour toute décision médicale.
        </p>
      </div>
    </div>
  );
}

function FilterTab({ label, count, active }: { label: string; count: number; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label} ({count})
    </button>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const Icon = recommendation.icon;
  
  const priorityColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-blue-50 border-blue-200'
  };

  const priorityBadges = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const priorityLabels = {
    high: 'Prioritaire',
    medium: 'Important',
    low: 'Conseil'
  };

  const iconColors = {
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className={`border-2 rounded-xl p-4 sm:p-6 ${priorityColors[recommendation.priority as keyof typeof priorityColors]} hover:shadow-lg transition-all`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[recommendation.color as keyof typeof iconColors]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-xs text-gray-600 mb-1 block">{recommendation.category}</span>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{recommendation.title}</h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs border whitespace-nowrap ${priorityBadges[recommendation.priority as keyof typeof priorityBadges]}`}>
              {priorityLabels[recommendation.priority as keyof typeof priorityLabels]}
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-700 mb-4">{recommendation.description}</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recommendation.actions.map((action: any, index: number) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.type === 'primary'
                    ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white hover:from-blue-700 hover:to-rose-600'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* AI Info */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>Confiance IA: {recommendation.aiConfidence}%</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Basé sur: {recommendation.basedOn.length} documents</span>
              <span className="sm:hidden">{recommendation.basedOn.length} docs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
