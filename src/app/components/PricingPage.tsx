import { useState } from 'react';
import {
  CheckCircle,
  X,
  ArrowLeft,
  Brain,
  Shield,
  Star,
  FileText,
  Calendar,
  Users,
  Headphones,
  Zap,
  Activity,
  BarChart3,
  Bell,
  RefreshCw,
  Lock,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { LauraLogoMark } from './brand/LauraLogoMark';

interface PricingPageProps {
  onBack: () => void;
  onGetStarted: () => void;
  /** Démo / contact commercial — défaut : ouverture du client mail */
  onContact?: () => void;
}

const PRO_FEATURES = [
  { icon: <Shield className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Accès web sécurisé' },
  { icon: <FileText className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Accès illimité aux dossiers patients' },
  { icon: <Activity className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Centralisation des données médicales' },
  { icon: <BarChart3 className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Historique patient structuré & chronologique' },
  { icon: <Users className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Gestion multi-praticiens' },
  { icon: <Calendar className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Agenda médical intelligent' },
  { icon: <Bell className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Prise de rendez-vous en ligne' },
  { icon: <Bell className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Rappels automatiques aux patients' },
  { icon: <BarChart3 className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: "Statistiques & rapports d'activité" },
  { icon: <Brain className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Suivi des usages IA' },
  { icon: <Zap className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: "API d'intégration (phase avancée)" },
  { icon: <RefreshCw className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Sauvegarde automatique quotidienne' },
  { icon: <Lock className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Hébergement sécurisé HDS' },
  { icon: <Shield className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Conformité RGPD' },
  { icon: <GraduationCap className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Formation initiale incluse' },
  { icon: <Headphones className="h-5 w-5 text-teal-600" strokeWidth={2} />, label: 'Support professionnel dédié' },
];

const FAQ_ITEMS = [
  {
    q: "L'essai gratuit nécessite-t-il une carte bancaire ?",
    a: "Non. Vous pouvez démarrer votre essai (15 jours pour Free, 14 jours pour Essentiel et Premium) sans renseigner de moyen de paiement. Vous ne serez facturé qu'à la fin de la période d'essai si vous choisissez de continuer.",
  },
  {
    q: 'Puis-je changer de forfait à tout moment ?',
    a: 'Oui, sans frais ni pénalité. Les montées en gamme sont effectives immédiatement, les downgrades au prochain cycle de facturation.',
  },
  {
    q: 'Les prix sont-ils en TND ou en euros ?',
    a: "Les tarifs Patient sont affichés en TND (Dinar Tunisien). Pour les clients en France et à l'international, un équivalent en EUR sera calculé au taux en vigueur lors de la souscription.",
  },
  {
    q: 'Mes données médicales sont-elles sécurisées ?',
    a: "Absolument. Chiffrement AES-256, hébergement certifié HDS (France), conformité RGPD Art. 9 (données de santé catégorie spéciale). Vous êtes propriétaire de vos données et pouvez les exporter ou les supprimer à tout moment.",
  },
  {
    q: "L'offre Professionnel est-elle adaptée à un cabinet de groupe ?",
    a: 'Oui. Le tarif de 99 TND est par praticien. Pour un cabinet multi-praticiens, contactez-nous pour un devis consolidé avec remise de volume.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className="pr-4 text-sm font-semibold text-gray-800">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-500" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" strokeWidth={2} />
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 pb-5 text-sm leading-relaxed text-gray-500">
          {a}
        </div>
      )}
    </div>
  );
}

const DEFAULT_CONTACT = () => {
  window.location.href =
    'mailto:contact@laura-ai.fr?subject=' + encodeURIComponent('Démonstration Laura AI');
};

export function PricingPage({ onBack, onGetStarted, onContact }: PricingPageProps) {
  const handleContact = onContact ?? DEFAULT_CONTACT;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Retour
            </button>
            <div className="flex items-center gap-2">
              <LauraLogoMark size="xs" tone="brand" aria-hidden />
              <span className="bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text font-bold text-transparent">
                Laura AI
              </span>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <section className="px-4 pb-8 pt-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <Star className="h-3.5 w-3.5" strokeWidth={2} /> Offres & Tarifs
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Choisissez l&apos;offre{' '}
            <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-blue-700 bg-clip-text text-transparent">
              adaptée à vos besoins
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Patients ou professionnels de santé — des tarifs clairs, sans surprise, avec période d&apos;essai sans
            engagement.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid items-start gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-3xl border-2 border-gray-200 bg-white p-7 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
              <div className="mb-6">
                <span className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-600">
                  Free – Découverte
                </span>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">Gratuit</span>
                </div>
                <p className="text-sm text-gray-400">Essai 15 jours — sans carte bancaire</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {[
                  { ok: true, label: 'Accès plateforme sécurisée' },
                  { ok: '100 MB', label: 'Stockage' },
                  { ok: '20 docs', label: 'Limite de documents' },
                  { ok: 'Basique', label: 'Carnet de santé' },
                  { ok: true, label: 'Centralisation documents' },
                  { ok: 'Simple', label: 'Historique & suivi' },
                  { ok: false, label: 'Scanner de documents IA' },
                  { ok: false, label: 'Analyses IA' },
                  { ok: false, label: 'Gestion rendez-vous' },
                  { ok: false, label: 'Gestion famille' },
                  { ok: false, label: 'Export PDF' },
                  { ok: false, label: 'Partage sécurisé' },
                  { ok: null, label: 'Support' },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {f.ok === true ? (
                        <CheckCircle className="h-4 w-4 text-teal-500" strokeWidth={2} />
                      ) : f.ok === false ? (
                        <X className="h-4 w-4 text-gray-300" strokeWidth={2} />
                      ) : f.ok === null ? (
                        <span className="block h-4 w-4 text-center text-xs leading-4 text-gray-300">—</span>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-blue-400" strokeWidth={2} />
                      )}
                    </div>
                    <span
                      className={`text-sm leading-snug ${
                        f.ok === false ? 'text-gray-300' : f.ok === null ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {typeof f.ok === 'string' ? (
                        <>
                          <span className="font-semibold text-gray-800">{f.ok}</span> {f.label.toLowerCase()}
                        </>
                      ) : (
                        f.label
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onGetStarted}
                className="w-full rounded-2xl border-2 border-gray-900 py-3.5 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
              >
                Commencer gratuitement
              </button>
            </div>

            <div className="flex flex-col rounded-3xl border-2 border-blue-200 bg-white p-7 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
              <div className="mb-6">
                <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                  Essentiel
                </span>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">15</span>
                  <span className="mb-1.5 text-gray-500">TND</span>
                  <span className="mb-1.5 text-sm text-gray-400">/mois</span>
                </div>
                <p className="text-sm text-gray-400">Essai gratuit 14 jours — sans engagement</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {[
                  { ok: true, label: 'Accès plateforme sécurisée' },
                  { ok: '5 GB', label: 'Stockage' },
                  { ok: true, label: 'Documents illimités' },
                  { ok: 'Complet', label: 'Carnet de santé' },
                  { ok: true, label: 'Centralisation documents' },
                  { ok: 'Avancé', label: 'Historique & suivi' },
                  { ok: true, label: 'Scanner de documents IA' },
                  { ok: '5 / mois', label: 'Analyses IA' },
                  { ok: false, label: 'Gestion rendez-vous' },
                  { ok: false, label: 'Gestion famille' },
                  { ok: false, label: 'Export PDF' },
                  { ok: false, label: 'Partage sécurisé' },
                  { ok: 'Email', label: 'Support' },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {f.ok === true ? (
                        <CheckCircle className="h-4 w-4 text-teal-500" strokeWidth={2} />
                      ) : f.ok === false ? (
                        <X className="h-4 w-4 text-gray-300" strokeWidth={2} />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-blue-400" strokeWidth={2} />
                      )}
                    </div>
                    <span className={`text-sm leading-snug ${f.ok === false ? 'text-gray-300' : 'text-gray-700'}`}>
                      {typeof f.ok === 'string' ? (
                        <>
                          <span className="font-semibold text-gray-800">{f.ok}</span> {f.label.toLowerCase()}
                        </>
                      ) : (
                        f.label
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onGetStarted}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                Essayer 14 jours
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">Sans carte bancaire</p>
            </div>

            <div className="relative flex flex-col rounded-3xl bg-gradient-to-b from-blue-600 to-blue-800 p-7 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-lg">
                  <Star className="h-3.5 w-3.5 fill-amber-900" strokeWidth={2} /> Meilleur choix
                </div>
              </div>

              <div className="mb-6 pt-2">
                <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Premium
                </span>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">35</span>
                  <span className="mb-1.5 text-blue-200">TND</span>
                  <span className="mb-1.5 text-sm text-blue-300">/mois</span>
                </div>
                <p className="text-sm text-blue-200">Essai gratuit 14 jours — sans engagement</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {[
                  { ok: true, label: 'Accès plateforme sécurisée' },
                  { ok: '20 GB', label: 'Stockage' },
                  { ok: true, label: 'Documents illimités' },
                  { ok: 'Premium', label: 'Carnet de santé' },
                  { ok: true, label: 'Centralisation documents' },
                  { ok: 'Avancé + comparatif', label: 'Historique & suivi' },
                  { ok: true, label: 'Scanner de documents IA' },
                  { ok: 'Illimitées', label: 'Analyses IA' },
                  { ok: 'Avancée', label: 'Gestion des rendez-vous' },
                  { ok: 'Multi-profils illimitée', label: 'Gestion famille' },
                  { ok: 'Illimité', label: 'Export PDF' },
                  { ok: 'Avancé', label: 'Partage sécurisé médecins' },
                  { ok: 'Prioritaire 24/7', label: 'Support' },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {f.ok === true ? (
                        <CheckCircle className="h-4 w-4 text-teal-300" strokeWidth={2} />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-blue-300" strokeWidth={2} />
                      )}
                    </div>
                    <span className="text-sm leading-snug text-blue-100">
                      {typeof f.ok === 'string' ? (
                        <>
                          <span className="font-semibold text-white">{f.ok}</span> {f.label.toLowerCase()}
                        </>
                      ) : (
                        <span className="text-white">{f.label}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onGetStarted}
                className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl"
              >
                Passer au Premium
              </button>
              <p className="mt-2 text-center text-xs text-blue-300">14 jours offerts · Annulation à tout moment</p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            ✓ Tous les plans incluent le chiffrement AES-256 et l&apos;hébergement HDS certifié France
          </p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 shadow-2xl">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="p-10 lg:p-12">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
                  <Activity className="h-3.5 w-3.5" strokeWidth={2} /> Offre Professionnel Santé
                </div>

                <h2 className="mb-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Tout ce dont votre pratique a besoin
                </h2>
                <p className="mb-8 text-base leading-relaxed text-slate-300">
                  Une plateforme pensée pour les médecins, radiologues et professionnels de santé. Dossiers patients,
                  agenda intelligent, IA médicale et conformité RGPD dans un seul outil.
                </p>

                <div className="mb-8 rounded-2xl border border-white/15 bg-white/10 p-6">
                  <div className="mb-1 flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">99</span>
                    <div className="mb-1.5">
                      <span className="text-lg font-semibold text-teal-300">TND</span>
                      <span className="text-sm text-slate-400"> / mois / praticien</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">Essai gratuit 14 jours · Sans engagement · Formation incluse</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Multi-praticiens', 'Agenda IA', 'PACS intégré', 'API', 'HDS'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-teal-500/20 bg-teal-500/20 px-2.5 py-1 text-xs text-teal-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleContact}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/30"
                  >
                    <Calendar className="h-4 w-4" strokeWidth={2} />
                    Demander une démonstration
                  </button>
                  <button
                    type="button"
                    onClick={handleContact}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    Contacter l&apos;équipe commerciale
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Remise de volume disponible pour les cabinets de groupe et établissements.
                </p>
              </div>

              <div className="border-l border-white/10 bg-white/5 p-10 lg:p-12">
                <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-white">
                  <CheckCircle className="h-5 w-5 text-teal-400" strokeWidth={2} />
                  Toutes les fonctionnalités incluses
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {PRO_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/15">
                        {f.icon}
                      </div>
                      <span className="pt-1 text-sm leading-snug text-slate-300">{f.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Certifications & conformité
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { emoji: '🛡️', label: 'HDS France' },
                      { emoji: '🔒', label: 'RGPD Art.9' },
                      { emoji: '🔐', label: 'AES-256' },
                      { emoji: '📋', label: 'SLA 99,9%' },
                    ].map((b) => (
                      <div
                        key={b.label}
                        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        <span>{b.emoji}</span> {b.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                emoji: '🏥',
                name: 'CHU de Tunis',
                info: '150+ praticiens',
                text: "L'intégration PACS et la gestion centralisée des dossiers ont transformé notre flux de travail.",
              },
              {
                emoji: '🏢',
                name: 'Clinique Méditerranée',
                info: '25+ radiologues',
                text: "La conformité RGPD native et l'hébergement HDS nous ont convaincu immédiatement.",
              },
              {
                emoji: '⚕️',
                name: 'Centre Radiologie Paris',
                info: '40+ praticiens',
                text: 'Les rapports IA réduisent significativement notre temps de rédaction.',
              },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 text-xl">
                    {t.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.info}</p>
                  </div>
                </div>
                <p className="text-sm italic leading-relaxed text-gray-500">&quot;{t.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Questions fréquentes</h2>
            <p className="text-sm text-gray-500">Une question ? Notre équipe est disponible sous 24h.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-rose-500 p-10 text-center shadow-2xl sm:p-14">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Prêt à commencer ?</h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-blue-100">
              Rejoignez des milliers d&apos;utilisateurs qui gèrent leur santé avec Laura AI. Essai gratuit, sans
              engagement.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onGetStarted}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={handleContact}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Calendar className="h-5 w-5" strokeWidth={2} />
                Demander une démo
              </button>
            </div>
            <p className="mt-5 text-xs text-blue-200">
              Aucune carte bancaire · Annulation à tout moment · HDS certifié France
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
