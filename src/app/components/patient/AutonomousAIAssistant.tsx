import { useState, useEffect } from 'react';
import {
  Brain, FileText, Upload, Zap, CheckCircle, AlertCircle,
  Clock, TrendingUp, Calendar, MessageSquare, Send, Loader,
  ChevronRight, Download, Eye, Activity, Info
} from 'lucide-react';

export function AutonomousAIAssistant() {
  const [activeView, setActiveView] = useState<'overview' | 'chat' | 'reports' | 'tasks'>('overview');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Données de démonstration
  const autonomousActivities = [
    {
      id: '1',
      type: 'document_analysis',
      timestamp: '2026-02-01T10:05:00Z',
      status: 'completed',
      confidence: 0.92,
      title: 'Analyse automatique - Bilan rénal',
      description: 'Document analysé avec succès. Fonction rénale normale détectée.',
      duration: '45 secondes',
      actions_taken: [
        'OCR extraction (confiance: 94%)',
        'Extraction 12 entités médicales',
        'Analyse LLM complète',
        'Aucune anomalie détectée',
        'Rapport généré automatiquement'
      ]
    },
    {
      id: '2',
      type: 'gap_detection',
      timestamp: '2026-02-01T00:00:00Z',
      status: 'action_required',
      confidence: 1.0,
      title: 'Données manquantes détectées',
      description: 'Bilan sanguin annuel recommandé (dernier: 10/01/2025)',
      duration: '8 secondes',
      actions_taken: [
        'Vérification profil médical',
        'Analyse historique bilans',
        'Détection: Bilan > 12 mois',
        'Recommandation générée'
      ]
    },
    {
      id: '3',
      type: 'followup_scheduled',
      timestamp: '2026-01-20T10:00:00Z',
      status: 'scheduled',
      confidence: 0.95,
      title: 'Suivi programmé - Kyste rénal',
      description: 'IRM de contrôle programmée pour juillet 2026 (6 mois)',
      duration: '2 secondes',
      actions_taken: [
        'Analyse condition chronique',
        'Calcul date suivi optimal',
        'Création tâche automatique',
        'Rappel configuré'
      ]
    }
  ];

  const aiReports = [
    {
      id: 'rpt_001',
      title: 'Rapport médical complet - Janvier 2026',
      generated_at: '2026-01-20T10:00:00Z',
      type: 'comprehensive',
      confidence: 0.94,
      summary: 'État de santé stable. Kyste rénal sous surveillance, fonction rénale normale.',
      key_findings: 5,
      risk_score: 35,
      pages: 4
    },
    {
      id: 'rpt_002',
      title: 'Analyse document - Bilan rénal 10/01/2026',
      generated_at: '2026-02-01T10:05:00Z',
      type: 'document_analysis',
      confidence: 0.92,
      summary: 'Créatinine 0.9 mg/dL, Urée 32 mg/dL - Résultats normaux.',
      key_findings: 3,
      risk_score: 0,
      pages: 2
    }
  ];

  const scheduledTasks = [
    {
      id: 'task_001',
      type: 'followup_imaging',
      scheduled_date: '2026-07-20',
      priority: 'medium',
      title: 'IRM abdominale - Contrôle kyste rénal',
      description: 'Suivi semestriel kyste Bosniak IIF',
      auto_created: true,
      reminder_days: 7
    },
    {
      id: 'task_002',
      type: 'data_gap_check',
      scheduled_date: '2026-02-08',
      priority: 'low',
      title: 'Vérification automatique données',
      description: 'Analyse hebdomadaire lacunes dossier',
      auto_created: true,
      reminder_days: 1
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Ajouter le message utilisateur
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsAnalyzing(true);

    // Simuler réponse IA (en production: appel API)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        sources: [
          {
            document_id: 'doc_xyz789',
            title: 'Bilan rénal complet',
            date: '2026-01-10'
          }
        ],
        suggested_questions: [
          'Dois-je modifier mon traitement?',
          'Quand dois-je faire mon prochain bilan?',
          'Y a-t-il des précautions à prendre?'
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateAIResponse = (question: string) => {
    // Réponse intelligente simulée
    if (question.toLowerCase().includes('résultat') || question.toLowerCase().includes('bilan')) {
      return "D'après votre bilan rénal du 10 janvier 2026, votre fonction rénale est normale. Voici les détails :\n\n- **Créatinine**: 0.9 mg/dL (normale, entre 0.6 et 1.2)\n- **Urée**: 32 mg/dL (normale, entre 10 et 50)\n\nCes résultats sont rassurants et montrent que vos reins fonctionnent bien. C'est important de continuer votre surveillance semestrielle comme recommandé par votre médecin.";
    }
    
    return "Je suis votre assistant IA médical autonome. J'analyse automatiquement vos documents, détecte les anomalies, et génère des rapports sans que vous ayez besoin de me le demander. Comment puis-je vous aider aujourd'hui?";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Assistant IA Autonome</h1>
            <p className="text-purple-100 mb-4">
              Agent intelligent qui analyse automatiquement vos documents médicaux, détecte les anomalies,
              et génère des rapports sans intervention nécessaire.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatusCard label="Confiance moyenne" value="94%" icon={<CheckCircle />} />
              <StatusCard label="Documents analysés" value="12" icon={<FileText />} />
              <StatusCard label="Rapports générés" value="8" icon={<TrendingUp />} />
              <StatusCard label="Tâches programmées" value="2" icon={<Calendar />} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        <TabButton
          icon={<Activity />}
          label="Activités Autonomes"
          active={activeView === 'overview'}
          onClick={() => setActiveView('overview')}
        />
        <TabButton
          icon={<MessageSquare />}
          label="Chat IA"
          active={activeView === 'chat'}
          onClick={() => setActiveView('chat')}
        />
        <TabButton
          icon={<FileText />}
          label="Rapports"
          active={activeView === 'reports'}
          onClick={() => setActiveView('reports')}
          badge={aiReports.length}
        />
        <TabButton
          icon={<Calendar />}
          label="Tâches Planifiées"
          active={activeView === 'tasks'}
          onClick={() => setActiveView('tasks')}
          badge={scheduledTasks.length}
        />
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activités Autonomes Récentes</h2>
            <div className="space-y-4">
              {autonomousActivities.map((activity) => (
                <AutonomousActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Capacités de l'Agent IA</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CapabilityCard
                icon={<Brain className="w-6 h-6" />}
                title="Analyse Automatique"
                description="Analyse chaque document uploadé sans intervention"
                color="purple"
              />
              <CapabilityCard
                icon={<AlertCircle className="w-6 h-6" />}
                title="Détection d'Anomalies"
                description="Identifie valeurs hors norme et interactions médicamenteuses"
                color="red"
              />
              <CapabilityCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Analyse de Tendances"
                description="Suit l'évolution de vos résultats dans le temps"
                color="green"
              />
              <CapabilityCard
                icon={<Calendar className="w-6 h-6" />}
                title="Planification Intelligente"
                description="Programme automatiquement les suivis nécessaires"
                color="blue"
              />
              <CapabilityCard
                icon={<Eye className="w-6 h-6" />}
                title="Détection Lacunes"
                description="Identifie les données manquantes importantes"
                color="orange"
              />
              <CapabilityCard
                icon={<CheckCircle className="w-6 h-6" />}
                title="Rapports Automatiques"
                description="Génère des synthèses médicales complètes"
                color="indigo"
              />
            </div>
          </div>
        </div>
      )}

      {activeView === 'chat' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assistant IA Prêt</h3>
                <p className="text-gray-600 mb-4">
                  Posez-moi des questions sur vos résultats médicaux, vos traitements, ou votre santé.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {[
                    "Explique-moi mes derniers résultats",
                    "Y a-t-il des anomalies dans mon dossier?",
                    "Quand dois-je faire mon prochain bilan?",
                    "Comment évolue mon état de santé?"
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-left transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))
            )}
            
            {isAnalyzing && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">L'IA analyse votre question...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isAnalyzing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Rapports IA Générés</h2>
            <span className="text-sm text-gray-600">{aiReports.length} rapports disponibles</span>
          </div>

          {aiReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      {activeView === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Tâches Planifiées Automatiquement</h2>
            <span className="text-sm text-gray-600">{scheduledTasks.length} tâches actives</span>
          </div>

          {scheduledTasks.map((task) => (
            <ScheduledTaskCard key={task.id} task={task} />
          ))}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Planification Automatique</p>
                <p>
                  L'agent IA planifie automatiquement les suivis nécessaires en fonction de vos conditions
                  médicales et des recommandations de vos médecins. Vous recevrez des rappels avant chaque tâche.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <strong>⚠️ Information importante :</strong> Cet assistant IA est un outil d'information et ne remplace en aucun cas l'avis d'un professionnel de santé. 
            En cas d'urgence médicale, contactez immédiatement le 190 (SAMU Tunisie) ou votre médecin.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, icon }: any) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-4 h-4">{icon}</div>
        <span className="text-xs opacity-90">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm relative ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="w-4 h-4">{icon}</div>
      <span className="hidden sm:inline">{label}</span>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function AutonomousActivityCard({ activity }: any) {
  const [expanded, setExpanded] = useState(false);
  
  const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-200',
    action_required: 'bg-orange-100 text-orange-700 border-orange-200',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  const typeIcons = {
    document_analysis: <FileText className="w-5 h-5" />,
    gap_detection: <AlertCircle className="w-5 h-5" />,
    followup_scheduled: <Calendar className="w-5 h-5" />,
    anomaly_detected: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {typeIcons[activity.type as keyof typeof typeIcons]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[activity.status as keyof typeof statusColors]}`}>
              {activity.status === 'completed' && 'Terminé'}
              {activity.status === 'action_required' && 'Action requise'}
              {activity.status === 'scheduled' && 'Planifié'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{activity.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Confiance: {Math.round(activity.confidence * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(activity.timestamp).toLocaleString('fr-FR')}</span>
            </div>
          </div>
          
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Actions effectuées:</h4>
              <ul className="space-y-1">
                {activity.actions_taken.map((action: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
    </div>
  );
}

function CapabilityCard({ icon, title, description, color }: any) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function ChatMessage({ message }: any) {
  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="flex-1 bg-blue-600 text-white rounded-lg p-4 max-w-2xl">
          <p className="text-sm">{message.content}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-semibold">Vous</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Brain className="w-6 h-6 text-purple-600" />
      </div>
      <div className="flex-1 max-w-2xl">
        <div className="bg-gray-50 rounded-lg p-4 mb-2">
          <p className="text-sm text-gray-900 whitespace-pre-line">{message.content}</p>
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="text-xs text-gray-600 mb-2">
            <strong>Sources:</strong> {message.sources.map((s: any) => s.title).join(', ')}
          </div>
        )}
        
        {message.suggested_questions && message.suggested_questions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Questions suggérées:</p>
            {message.suggested_questions.map((q: string, index: number) => (
              <button
                key={index}
                className="block text-xs text-purple-600 hover:text-purple-700 hover:underline"
              >
                • {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{report.title}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {Math.round(report.confidence * 100)}% confiance
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{report.summary}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span>{report.key_findings} éléments clés</span>
            <span>•</span>
            <span>Risque: {report.risk_score}/100</span>
            <span>•</span>
            <span>{report.pages} pages</span>
            <span>•</span>
            <span>{new Date(report.generated_at).toLocaleDateString('fr-FR')}</span>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4" />
              Voir le rapport
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduledTaskCard({ task }: any) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <div className="flex items-center gap-2">
              {task.auto_created && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  Auto-créé
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                {task.priority === 'high' && 'Haute'}
                {task.priority === 'medium' && 'Moyenne'}
                {task.priority === 'low' && 'Basse'}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Programmée: {new Date(task.scheduled_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Rappel: {task.reminder_days} jour(s) avant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
