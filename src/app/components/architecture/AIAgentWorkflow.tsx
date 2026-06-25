import { useState } from 'react';
import {
  FileText, Brain, Zap, CheckCircle, AlertCircle, Clock,
  ArrowRight, Database, MessageSquare, Calendar, TrendingUp
} from 'lucide-react';

export function AIAgentWorkflow() {
  const [activeWorkflow, setActiveWorkflow] = useState('document-analysis');

  const workflows = {
    'document-analysis': {
      title: 'Analyse Automatique de Document',
      description: 'Workflow déclenché automatiquement lors de l\'upload d\'un document médical',
      trigger: 'Upload document (auto)',
      steps: [
        {
          id: 1,
          name: 'Upload & Storage',
          description: 'Patient upload document → Storage S3 + MongoDB metadata',
          icon: <FileText />,
          duration: '2s',
          color: 'blue',
          automated: true
        },
        {
          id: 2,
          name: 'OCR Processing',
          description: 'Extraction texte via Tesseract/Azure Vision + prétraitement image',
          icon: <Zap />,
          duration: '15-30s',
          color: 'purple',
          automated: true,
          details: [
            'Conversion PDF → Images (si applicable)',
            'Prétraitement: débruitage, binarisation, contraste',
            'OCR multilingue (français + arabe)',
            'Extraction tableaux structurés',
            'Score confiance: 0-100%'
          ]
        },
        {
          id: 3,
          name: 'NLP Entity Extraction',
          description: 'Extraction entités médicales (conditions, médicaments, résultats labo)',
          icon: <Brain />,
          duration: '5-10s',
          color: 'orange',
          automated: true,
          details: [
            'Named Entity Recognition (NER)',
            'Extraction: conditions, medications, lab_tests, dates',
            'Normalisation terminologie (UMLS/SNOMED)',
            'Détection relations inter-entités',
            'Classification type document'
          ]
        },
        {
          id: 4,
          name: 'Load Patient Context',
          description: 'Chargement historique médical + documents récents (3 mois)',
          icon: <Database />,
          duration: '2s',
          color: 'green',
          automated: true
        },
        {
          id: 5,
          name: 'LLM Analysis (GPT-4)',
          description: 'Analyse approfondie avec contexte patient complet',
          icon: <Brain />,
          duration: '10-20s',
          color: 'indigo',
          automated: true,
          details: [
            'Synthèse résultats + historique',
            'Identification key findings',
            'Détection préoccupations potentielles',
            'Génération recommandations',
            'Score confiance global'
          ]
        },
        {
          id: 6,
          name: 'Anomaly Detection',
          description: 'Détection valeurs hors norme + interactions médicamenteuses',
          icon: <AlertCircle />,
          duration: '2s',
          color: 'red',
          automated: true,
          details: [
            'Comparaison avec plages normales',
            'Vérification allergies ↔ médicaments',
            'Analyse tendances (si historique)',
            'Alerte anomalies critiques'
          ]
        },
        {
          id: 7,
          name: 'Confidence Check',
          description: 'Décision: clarification nécessaire ?',
          icon: <CheckCircle />,
          duration: '1s',
          color: 'yellow',
          automated: true,
          decision: true
        },
        {
          id: 8,
          name: 'Ask Clarification (si besoin)',
          description: 'Questions ciblées au patient via WebSocket',
          icon: <MessageSquare />,
          duration: 'variable',
          color: 'pink',
          automated: true,
          conditional: true
        },
        {
          id: 9,
          name: 'Generate Report',
          description: 'Génération rapport médical structuré (JSON + PDF)',
          icon: <FileText />,
          duration: '5-10s',
          color: 'green',
          automated: true,
          details: [
            'Rapport JSON structuré',
            'Génération PDF professionnel',
            'Graphiques visualisation',
            'Disclaimer médical',
            'Stockage base de données'
          ]
        },
        {
          id: 10,
          name: 'Schedule Follow-up',
          description: 'Planification analyses futures selon pathologies',
          icon: <Calendar />,
          duration: '1s',
          color: 'purple',
          automated: true
        },
        {
          id: 11,
          name: 'Notify Patient',
          description: 'Notification WebSocket + Email → Rapport disponible',
          icon: <CheckCircle />,
          duration: '1s',
          color: 'green',
          automated: true
        }
      ],
      totalDuration: '40-90 secondes',
      successRate: '94%'
    },
    
    'gap-detection': {
      title: 'Détection Automatique Lacunes de Données',
      description: 'Workflow périodique (quotidien) pour identifier données manquantes',
      trigger: 'Scheduled (daily 00:00)',
      steps: [
        {
          id: 1,
          name: 'Load Patient Profile',
          description: 'Chargement profil complet + documents',
          icon: <Database />,
          duration: '2s',
          color: 'blue',
          automated: true
        },
        {
          id: 2,
          name: 'Check Essential Data',
          description: 'Vérification données de base (groupe sanguin, allergies, etc.)',
          icon: <CheckCircle />,
          duration: '1s',
          color: 'orange',
          automated: true
        },
        {
          id: 3,
          name: 'Check Periodic Tests',
          description: 'Vérification bilans périodiques selon pathologies',
          icon: <TrendingUp />,
          duration: '2s',
          color: 'purple',
          automated: true
        },
        {
          id: 4,
          name: 'Generate Gap Report',
          description: 'Rapport lacunes avec recommandations',
          icon: <FileText />,
          duration: '2s',
          color: 'red',
          automated: true
        },
        {
          id: 5,
          name: 'Notify if Critical',
          description: 'Alerte patient si lacunes critiques détectées',
          icon: <AlertCircle />,
          duration: '1s',
          color: 'red',
          automated: true,
          conditional: true
        }
      ],
      totalDuration: '5-10 secondes',
      successRate: '99%'
    },
    
    'report-generation': {
      title: 'Génération Rapport Médical Complet',
      description: 'Synthèse complète dossier médical avec analyse IA',
      trigger: 'Manual / Scheduled / New Document',
      steps: [
        {
          id: 1,
          name: 'Collect All Data',
          description: 'Agrégation: profil + documents + consultations + analyses',
          icon: <Database />,
          duration: '3s',
          color: 'blue',
          automated: true
        },
        {
          id: 2,
          name: 'Build Timeline',
          description: 'Construction timeline médicale complète',
          icon: <TrendingUp />,
          duration: '2s',
          color: 'green',
          automated: true
        },
        {
          id: 3,
          name: 'Analyze Trends',
          description: 'Analyse évolution conditions + résultats labo',
          icon: <Brain />,
          duration: '5s',
          color: 'purple',
          automated: true
        },
        {
          id: 4,
          name: 'Calculate Risk Scores',
          description: 'Calcul scores risque par pathologie',
          icon: <AlertCircle />,
          duration: '3s',
          color: 'orange',
          automated: true
        },
        {
          id: 5,
          name: 'LLM Comprehensive Analysis',
          description: 'Génération rapport narratif complet par GPT-4',
          icon: <Brain />,
          duration: '20-30s',
          color: 'indigo',
          automated: true
        },
        {
          id: 6,
          name: 'Generate Visualizations',
          description: 'Graphiques timeline, tendances, scores',
          icon: <TrendingUp />,
          duration: '5s',
          color: 'pink',
          automated: true
        },
        {
          id: 7,
          name: 'Generate PDF',
          description: 'Création PDF professionnel multi-pages',
          icon: <FileText />,
          duration: '10s',
          color: 'green',
          automated: true
        },
        {
          id: 8,
          name: 'Store & Notify',
          description: 'Stockage + notification patient',
          icon: <CheckCircle />,
          duration: '2s',
          color: 'green',
          automated: true
        }
      ],
      totalDuration: '50-70 secondes',
      successRate: '96%'
    }
  };

  const currentWorkflow = workflows[activeWorkflow as keyof typeof workflows];

  const agentCapabilities = [
    {
      title: 'Autonomie Complète',
      description: 'L\'agent prend ses propres décisions sans intervention humaine pour 90% des cas',
      icon: <Brain className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Mémoire Contextuelle',
      description: 'Court-terme (Redis 24h) + Long-terme (Vector DB permanent)',
      icon: <Database className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Planification Intelligente',
      description: 'Décompose tâches complexes en sous-tâches et planifie l\'exécution',
      icon: <Calendar className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Détection Proactive',
      description: 'Identifie anomalies, lacunes, et risques avant que le patient ne les remarque',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Agent IA Autonome</h1>
            <p className="text-purple-100 mt-2">
              Orchestration intelligente avec LangGraph + GPT-4
            </p>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Capacités de l'Agent</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentCapabilities.map((capability, index) => (
            <CapabilityCard key={index} capability={capability} />
          ))}
        </div>
      </div>

      {/* Workflow Selector */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Workflows Autonomes</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(workflows).map(([key, workflow]) => (
            <button
              key={key}
              onClick={() => setActiveWorkflow(key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeWorkflow === key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {workflow.title}
            </button>
          ))}
        </div>

        {/* Workflow Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentWorkflow.title}
              </h3>
              <p className="text-gray-600 mb-4">{currentWorkflow.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span><strong>Trigger:</strong> {currentWorkflow.trigger}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span><strong>Durée:</strong> {currentWorkflow.totalDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Success:</strong> {currentWorkflow.successRate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            {currentWorkflow.steps.map((step, index) => (
              <WorkflowStep
                key={step.id}
                step={step}
                isLast={index === currentWorkflow.steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decision Logic */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
        <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-3">
          <AlertCircle className="w-7 h-7" />
          Logique de Décision
        </h2>
        <p className="text-orange-800 mb-6">
          L'agent décide de manière autonome quand demander des clarifications vs continuer automatiquement.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">🚫 Demande Clarification SI:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>Confiance OCR &lt; 70%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>Confiance analyse LLM &lt; 65%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>Entités médicales ambiguës (&gt;3)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>Données critiques manquantes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>Contradiction avec historique médical</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>Anomalie sévère détectée</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">✅ Continue Automatiquement SI:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Confiance OCR ≥ 70%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Confiance analyse LLM ≥ 65%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Toutes entités bien identifiées</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Données essentielles présentes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Cohérence avec historique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Aucune anomalie critique</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Memory System */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            Mémoire Court-terme (Redis)
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600">→</span>
              <div>
                <strong>Conversation session active</strong>
                <p className="text-sm text-gray-600">Messages + contexte dialogue</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600">→</span>
              <div>
                <strong>État tâche en cours</strong>
                <p className="text-sm text-gray-600">Progress tracking + résultats intermédiaires</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600">→</span>
              <div>
                <strong>Cache résultats</strong>
                <p className="text-sm text-gray-600">OCR, NLP, analyses récentes</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600">→</span>
              <div>
                <strong>TTL: 24 heures</strong>
                <p className="text-sm text-gray-600">Expiration automatique</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Database className="w-6 h-6 text-purple-600" />
            Mémoire Long-terme (Vector DB)
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-purple-600">→</span>
              <div>
                <strong>Historique médical complet</strong>
                <p className="text-sm text-gray-600">Tous événements médicaux</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600">→</span>
              <div>
                <strong>Analyses IA précédentes</strong>
                <p className="text-sm text-gray-600">Rapports + insights générés</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600">→</span>
              <div>
                <strong>Embeddings sémantiques</strong>
                <p className="text-sm text-gray-600">Recherche contextuelle intelligente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600">→</span>
              <div>
                <strong>Permanent</strong>
                <p className="text-sm text-gray-600">Pas d'expiration</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({ capability }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[capability.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center text-white mb-4`}>
        {capability.icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{capability.title}</h3>
      <p className="text-sm text-gray-600">{capability.description}</p>
    </div>
  );
}

function WorkflowStep({ step, isLast }: any) {
  const [showDetails, setShowDetails] = useState(false);
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-300',
    purple: 'bg-purple-100 text-purple-600 border-purple-300',
    orange: 'bg-orange-100 text-orange-600 border-orange-300',
    green: 'bg-green-100 text-green-600 border-green-300',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-300',
    red: 'bg-red-100 text-red-600 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    pink: 'bg-pink-100 text-pink-600 border-pink-300'
  };

  return (
    <div className="relative">
      <div
        onClick={() => step.details && setShowDetails(!showDetails)}
        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
          step.details ? 'cursor-pointer hover:shadow-md' : ''
        } ${colorClasses[step.color as keyof typeof colorClasses]}`}
      >
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold">
            {step.id}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="font-bold text-gray-900">
              {step.name}
              {step.conditional && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Conditionnel</span>}
              {step.decision && <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">Décision</span>}
            </h4>
            <div className="flex items-center gap-2">
              {step.automated && (
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Auto
                </span>
              )}
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {step.duration}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-700">{step.description}</p>
          
          {showDetails && step.details && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <ul className="space-y-1">
                {step.details.map((detail: string, index: number) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400">▪</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {step.icon}
        </div>
      </div>
      
      {!isLast && (
        <div className="flex justify-center my-2">
          <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
        </div>
      )}
    </div>
  );
}
