import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Send, Sparkles, AlertTriangle, X,
  Bot, User, Loader2, FileText, Image, Heart
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function MedicalAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour ! Je suis votre assistant médical IA Laura. Je peux vous aider à comprendre vos résultats médicaux, répondre à vos questions sur votre santé, et vous orienter vers les bonnes ressources. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
      suggestions: [
        "Expliquer mes résultats d'IRM",
        "Symptômes Bosniak IIF",
        "Préparer ma consultation",
        "Questions sur mon traitement"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(messageText),
        timestamp: new Date(),
        suggestions: getFollowUpSuggestions(messageText)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('irm') || lowerQuestion.includes('imagerie')) {
      return "D'après votre dossier médical, votre dernière IRM abdominale du 10/01/2026 montre une lésion rénale droite classée Bosniak IIF. Cette lésion mesure 2,8 cm et reste stable par rapport à l'examen précédent.\n\nLe Bosniak IIF est une catégorie qui nécessite un suivi régulier par imagerie tous les 6 mois pour s'assurer de la stabilité de la lésion. Votre prochain contrôle IRM est recommandé en juillet 2026.\n\n⚠️ Ces informations sont basées sur vos documents médicaux. Consultez toujours votre médecin pour une interprétation complète.";
    }
    
    if (lowerQuestion.includes('bosniak') || lowerQuestion.includes('symptôme')) {
      return "Le Bosniak IIF est une classification pour les kystes rénaux complexes qui nécessitent une surveillance. La plupart des patients avec Bosniak IIF n'ont pas de symptômes spécifiques.\n\nCependant, consultez rapidement votre médecin si vous ressentez :\n• Douleur dans le flanc ou l'abdomen\n• Sang dans les urines\n• Fièvre inexpliquée\n• Hypertension artérielle nouvelle\n\nVotre suivi régulier avec Dr. Trabelsi (néphrologie) est important pour surveiller l'évolution.";
    }
    
    if (lowerQuestion.includes('consultation') || lowerQuestion.includes('préparer')) {
      return "Pour bien préparer votre prochaine consultation avec Dr. Trabelsi le 12/02/2026 :\n\n📋 Documents à apporter :\n• Votre dernière IRM (10/01/2026)\n• Vos bilans sanguins récents\n• Liste de vos médicaments actuels\n• Carnet de santé CNAM\n\n❓ Questions à poser :\n• Évolution de la lésion depuis le dernier contrôle\n• Fréquence optimale des suivis\n• Signes d'alerte à surveiller\n• Impact sur votre vie quotidienne\n\nVoulez-vous que je génère une liste de questions personnalisée ?";
    }
    
    if (lowerQuestion.includes('traitement') || lowerQuestion.includes('médicament')) {
      return "D'après votre dossier, vous êtes actuellement sous :\n\n💊 Ramipril 5mg - 1 comprimé/jour\n💊 Aspirine 100mg - 1 comprimé/jour\n\nCes traitements sont prescrits par Dr. Trabelsi depuis juin 2024. Votre ordonnance expire dans 15 jours, pensez à prévoir un renouvellement.\n\n⚠️ Important :\n• Ne jamais arrêter ou modifier votre traitement sans avis médical\n• Prenez vos médicaments à heure régulière\n• Signalez tout effet secondaire à votre médecin";
    }
    
    return "Je comprends votre question. Pour vous donner une réponse précise et personnalisée basée sur votre dossier médical, pourriez-vous préciser votre demande ? Je peux vous aider avec :\n\n• Explications sur vos résultats médicaux\n• Informations sur votre condition (Bosniak IIF)\n• Préparation de vos consultations\n• Questions sur vos traitements\n• Conseils de prévention\n\nN'hésitez pas à me poser des questions spécifiques !";
  };

  const getFollowUpSuggestions = (question: string): string[] => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('irm') || lowerQuestion.includes('imagerie')) {
      return [
        "Quand planifier ma prochaine IRM ?",
        "Comment se préparer à une IRM ?",
        "Différence entre IRM et scanner ?"
      ];
    }
    
    if (lowerQuestion.includes('bosniak')) {
      return [
        "Évolution possible de Bosniak IIF",
        "Régime alimentaire adapté",
        "Activité physique recommandée"
      ];
    }
    
    return [
      "Voir mes prochains rendez-vous",
      "Recommandations de prévention",
      "Parler à un médecin"
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          Assistant Médical IA
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Posez vos questions sur votre santé et obtenez des réponses basées sur votre dossier médical
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Intelligence Artificielle Médicale</h3>
            <p className="text-xs sm:text-sm text-blue-100 mb-3">
              Notre IA analyse votre dossier médical complet pour vous fournir des réponses personnalisées et pertinentes.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-white/20 rounded-full">Basé sur vos documents</span>
              <span className="px-2 py-1 bg-white/20 rounded-full">Disponible 24/7</span>
              <span className="px-2 py-1 bg-white/20 rounded-full">Confidentiel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-rose-500' 
                    : 'bg-gradient-to-br from-purple-100 to-purple-200'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {message.role === 'assistant' && message.suggestions && (
                <div className="ml-12 sm:ml-14 mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question médicale..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900">
            <strong>⚠️ Information importante :</strong> Cet assistant IA est un outil d'information et ne remplace en aucun cas l'avis d'un professionnel de santé. 
            En cas d'urgence médicale, contactez immédiatement le 190 (SAMU Tunisie) ou votre médecin.
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAccessCard
          icon={<FileText />}
          title="Mes documents"
          description="Voir tous mes résultats"
        />
        <QuickAccessCard
          icon={<Heart />}
          title="Mon suivi"
          description="Suivi Bosniak IIF"
        />
        <QuickAccessCard
          icon={<MessageCircle />}
          title="Téléconsultation"
          description="Parler à un médecin"
        />
      </div>
    </div>
  );
}

function QuickAccessCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{title}</h4>
          <p className="text-xs sm:text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}
