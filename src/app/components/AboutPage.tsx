import { Activity, Heart, Shield, Globe, Users, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import { LauraLogoMark } from './brand/LauraLogoMark';

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            
            <div className="flex items-center gap-2">
              <LauraLogoMark size="hero" tone="brand" aria-hidden />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent">
                Laura AI
              </span>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            À propos de
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent">
              Laura AI
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Votre carnet de santé numérique intelligent, accessible partout dans le monde
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-3xl p-12 text-white mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <Heart className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
              <p className="text-xl text-blue-50 leading-relaxed">
                Démocratiser l'accès aux soins de santé en centralisant et sécurisant vos données médicales. 
                Grâce à l'intelligence artificielle, nous rendons la gestion de votre santé simple, accessible 
                et efficace, où que vous soyez dans le monde.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité</h3>
              <p className="text-gray-600">
                Vos données de santé sont cryptées end-to-end et hébergées sur des serveurs certifiés. 
                Conformité RGPD garantie.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                Intelligence artificielle de pointe pour analyser vos documents et vous proposer 
                des recommandations personnalisées.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accessibilité</h3>
              <p className="text-gray-600">
                Vos données vous suivent partout dans le monde, accessibles à tout moment sur tous vos appareils.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Notre Histoire</h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Laura AI est née d'un constat simple : la gestion des données médicales est trop complexe, 
              fragmentée et inaccessible pour la majorité des patients. Entre les ordonnances papier perdues, 
              les examens radiologiques dispersés et le manque de communication entre professionnels de santé, 
              nous avons identifié un besoin urgent de simplification.
            </p>
            
            <p className="text-lg">
              En 2025, notre équipe d'ingénieurs, de médecins et de designers a décidé de créer une solution 
              innovante : un carnet de santé numérique intelligent, accessible à tous, qui utilise l'intelligence 
              artificielle pour vous aider à mieux comprendre et gérer votre santé.
            </p>
            
            <p className="text-lg">
              Aujourd'hui, Laura AI est utilisée par des milliers de patients en France, en Tunisie et dans 
              le monde entier. Notre plateforme permet de centraliser tous vos documents médicaux, de bénéficier 
              d'analyses IA instantanées, et d'accéder à un assistant médical disponible 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-gray-600">Utilisateurs actifs</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent mb-2">
                500K+
              </div>
              <div className="text-gray-600">Documents analysés</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent mb-2">
                96%
              </div>
              <div className="text-gray-600">Précision IA</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent mb-2">
                3
              </div>
              <div className="text-gray-600">Pays disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-rose-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Contactez-nous</h2>
          <p className="text-xl text-blue-50 mb-8">
            Une question ? Notre équipe est là pour vous aider
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="font-semibold mb-2">Email</p>
              <p className="text-blue-50">contact@laura-ai.health</p>
            </div>
            <div>
              <p className="font-semibold mb-2">France</p>
              <p className="text-blue-50">+33 (0)1 XX XX XX XX</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Tunisie</p>
              <p className="text-blue-50">+216 XX XXX XXX</p>
            </div>
          </div>

          <button className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-xl">
            Nous contacter
          </button>
        </div>
      </section>
    </div>
  );
}