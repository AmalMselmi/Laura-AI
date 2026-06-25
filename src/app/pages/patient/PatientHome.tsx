import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { usePatientDocuments } from '../../context/PatientDocumentsContext';
import {
  Upload,
  FileText,
  Activity,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  Folder,
  Heart,
  FileCheck,
  MessageCircle,
  HardDrive,
  Plus,
  Settings,
} from 'lucide-react';

interface AiRecommendation {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  icon: string;
  category: string;
  title: string;
  description: string;
  deadline?: string;
  sourceDoc: string;
  action: string;
  actionPath?: string;
}

function useAiRecommendations(documents: ReturnType<typeof usePatientDocuments>['documents']): AiRecommendation[] {
  const recs: AiRecommendation[] = [];

  const bosniakDoc = documents.find(d => d.pathology?.toLowerCase().includes('bosniak'));
  if (bosniakDoc) {
    const scanDate = new Date(bosniakDoc.date);
    const followUpDate = new Date(scanDate);
    followUpDate.setMonth(followUpDate.getMonth() + 6);
    const isOverdue = followUpDate < new Date();
    recs.push({
      id: 'bosniak-followup',
      priority: isOverdue ? 'urgent' : 'high',
      icon: '🩻',
      category: 'Suivi imagerie',
      title: isOverdue ? 'Contrôle IRM en retard — Bosniak IIF' : 'Contrôle IRM recommandé — Bosniak IIF',
      description: `Suite à votre imagerie du ${new Date(bosniakDoc.date).toLocaleDateString('fr-FR')}, un contrôle IRM est recommandé pour surveiller la stabilité du kyste rénal (2,3 cm).`,
      deadline: followUpDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      sourceDoc: bosniakDoc.name,
      action: 'Prendre RDV',
    });
  }

  const hypertensionDoc = documents.find(d => d.pathology?.toLowerCase().includes('hypertension'));
  if (hypertensionDoc) {
    recs.push({
      id: 'hypertension-check',
      priority: 'medium',
      icon: '❤️',
      category: 'Cardiologie',
      title: 'Bilan tensionnel annuel recommandé',
      description: `Votre compte-rendu du ${new Date(hypertensionDoc.date).toLocaleDateString('fr-FR')} mentionne une hypertension légère. Un suivi annuel est conseillé.`,
      deadline: 'Avant novembre 2026',
      sourceDoc: hypertensionDoc.name,
      action: 'Consulter',
    });
  }

  const bilanDoc = documents.find(d => d.type === 'analyse' && d.pathology?.toLowerCase().includes('bilan'));
  if (bilanDoc) {
    const bilanDate = new Date(bilanDoc.date);
    const nextBilan = new Date(bilanDate);
    nextBilan.setFullYear(nextBilan.getFullYear() + 1);
    recs.push({
      id: 'bilan-annuel',
      priority: 'low',
      icon: '🔬',
      category: 'Bilan de santé',
      title: 'Bilan sanguin annuel à planifier',
      description: `Votre dernier bilan date du ${bilanDate.toLocaleDateString('fr-FR')}. Un bilan annuel est recommandé.`,
      deadline: nextBilan.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      sourceDoc: bilanDoc.name,
      action: 'Ordonnance',
    });
  }

  const scanDocs = documents.filter(d => d.fromScan);
  if (scanDocs.length > 0) {
    recs.push({
      id: 'scan-review',
      priority: 'medium',
      icon: '🧠',
      category: 'Analyse IA récente',
      title: `${scanDocs.length} rapport${scanDocs.length > 1 ? 's' : ''} IA à valider`,
      description: `${scanDocs.length > 1 ? 'Vos rapports IA doivent' : 'Votre rapport IA doit'} être validé${scanDocs.length > 1 ? 's' : ''} par un professionnel de santé.`,
      sourceDoc: scanDocs[0].name,
      action: 'Voir docs',
      actionPath: '/patient/documents',
    });
  }

  return recs;
}

/** Figma 1:6518 — pastilles priorité + bordures cartes recommandations */
const PRIORITY_CONFIG = {
  urgent: {
    label: 'URGENT',
    pill: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    bar: 'border-l-red-500',
  },
  high: {
    label: 'IMPORTANT',
    pill: 'bg-[#ffedd4] text-[#ca3500]',
    dot: 'bg-[#ff6900]',
    bar: 'border-l-[#ff6900]',
  },
  medium: {
    label: 'À PLANIFIER',
    pill: 'bg-[#dbeafe] text-[#1447e6]',
    dot: 'bg-[#2b7fff]',
    bar: 'border-l-[#2b7fff]',
  },
  low: {
    label: 'INFO',
    pill: 'bg-[#f3f4f6] text-[#4a5565]',
    dot: 'bg-[#99a1af]',
    bar: 'border-l-[#d1d5dc]',
  },
} as const;

const FALLBACK_AI_RECS: AiRecommendation[] = [
  {
    id: 'demo-bosniak',
    priority: 'high',
    icon: '',
    category: 'Suivi imagerie',
    title: 'Contrôle IRM recommandé — Bosniak IIF',
    description:
      'Suite à votre imagerie du 05/01/2026, un contrôle IRM est recommandé pour surveiller la stabilité du kyste rénal (2,3 cm).',
    deadline: 'juillet 2026',
    sourceDoc: '',
    action: 'Prendre RDV',
    actionPath: '/patient/documents',
  },
  {
    id: 'demo-tension',
    priority: 'medium',
    icon: '',
    category: 'Cardiologie',
    title: 'Bilan tensionnel annuel recommandé',
    description:
      'Votre compte-rendu du 28/11/2025 mentionne une hypertension légère. Un suivi annuel est conseillé.',
    deadline: 'Avant novembre 2026',
    sourceDoc: '',
    action: 'Consulter',
    actionPath: '/patient/documents',
  },
  {
    id: 'demo-bilan',
    priority: 'low',
    icon: '',
    category: 'Bilan de santé',
    title: 'Bilan sanguin annuel à planifier',
    description: 'Votre dernier bilan date du 10/01/2026. Un bilan annuel est recommandé.',
    deadline: 'janvier 2027',
    sourceDoc: '',
    action: 'Ordonnance',
    actionPath: '/patient/documents',
  },
];

export function PatientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { documents } = usePatientDocuments();
  const aiRecs = useAiRecommendations(documents);

  if (!user) return null;

  const firstName = user.name.split(' ')[0];
  const displayRecs = aiRecs.length > 0 ? aiRecs : FALLBACK_AI_RECS;

  return (
    <div className="flex flex-col gap-6">
      {/* Figma 1:7308 — en-tête */}
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-[30px] font-bold leading-9 tracking-tight text-[#101828]">
          Bonjour, {firstName} 👋
        </h1>
        <p className="font-sans text-base font-normal leading-6 text-[#4a5565]">
          Voici un aperçu de votre santé aujourd&apos;hui
        </p>
      </div>

      {/* Figma 1:7314 — StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FileText className="h-6 w-6 text-[#155dfc]" strokeWidth={2} aria-hidden />}
          iconWrap="bg-[#eff6ff]"
          label="Documents"
          value={String(documents.length)}
          onClick={() => navigate('/patient/documents')}
        />
        <StatCard
          icon={<Folder className="h-6 w-6 text-[#00a63e]" strokeWidth={2} aria-hidden />}
          iconWrap="bg-[#f0fdf4]"
          label="Scanner & IRM"
          value={String(documents.filter(d => d.type === 'imagerie' || d.fromScan).length)}
          onClick={() => navigate('/patient/scan')}
        />
        <StatCard
          icon={<Heart className="h-6 w-6 text-[#e7000b]" strokeWidth={2} aria-hidden />}
          iconWrap="bg-[#fef2f2]"
          label="Suivi actif"
          value="Bosniak IIF"
          onClick={() => navigate('/patient/carnet')}
        />
        <StatCard
          icon={<Activity className="h-6 w-6 text-[#9810fa]" strokeWidth={2} aria-hidden />}
          iconWrap="bg-[#faf5ff]"
          label="Dernier examen"
          value="Il y a 14j"
          onClick={() => navigate('/patient/documents')}
        />
      </div>

      {/* Figma 1:7354 — rappel */}
      <div className="flex gap-3 rounded-[14px] border-[0.8px] border-solid border-[#fee685] bg-[#fffbeb] p-4">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-[#f59e0b]" strokeWidth={2} aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 font-sans text-base font-semibold leading-6 text-[#7b3306]">
            Rappel : Contrôle médical à planifier
          </h3>
          <p className="mb-3 font-sans text-sm font-normal leading-5 text-[#973c00]">
            Votre suivi Bosniak IIF nécessite un contrôle par imagerie dans les 2 prochaines semaines.
          </p>
          <button
            type="button"
            onClick={() => navigate('/patient/documents')}
            className="font-sans text-sm font-medium text-[#7b3306] underline decoration-solid hover:text-[#5c2807]"
          >
            Prendre rendez-vous maintenant
          </button>
        </div>
      </div>

      {/* Figma 1:7366 — Documents récents + Actions rapides */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_382px]">
        <div className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-5 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold leading-7 text-[#101828]">Documents récents</h2>
            <button
              type="button"
              onClick={() => navigate('/patient/documents')}
              className="inline-flex items-center gap-1 font-sans text-sm font-normal text-[#155dfc] hover:underline"
            >
              Voir tout
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <DocumentRow title="IRM abdominale" meta="Dr. Gharbi • 10 Jan 2026" tag="Imagerie" />
            <DocumentRow title="Bilan sanguin complet" meta="Dr. Ben Ahmed • 05 Jan 2026" tag="Analyses" />
            <DocumentRow title="Compte-rendu consultation" meta="Dr. Trabelsi • 28 Déc 2025" tag="Rapport" />
          </div>
        </div>

        <div className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-5 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
          <h2 className="mb-4 font-sans text-lg font-semibold leading-7 text-[#101828]">Actions rapides</h2>
          <div className="flex flex-col gap-2">
            <QuickRow icon={<Plus className="h-5 w-5 text-[#155dfc]" strokeWidth={2} />} label="Ajouter un document" onClick={() => navigate('/patient/documents')} />
            <QuickRow icon={<Upload className="h-5 w-5 text-[#155dfc]" strokeWidth={2} />} label="Scanner un document" onClick={() => navigate('/patient/scan')} />
            <QuickRow icon={<Heart className="h-5 w-5 text-[#155dfc]" strokeWidth={2} />} label="Voir mon carnet" onClick={() => navigate('/patient/carnet')} />
            <QuickRow icon={<Settings className="h-5 w-5 text-[#155dfc]" strokeWidth={2} />} label="Mon compte" onClick={() => navigate('/patient/account')} />
          </div>
        </div>
      </div>

      {/* Figma 1:7455 — Recommandations IA */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px]"
            style={{
              background: 'linear-gradient(135deg, rgb(21, 93, 252) 0%, rgb(255, 32, 86) 100%)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} aria-hidden />
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold leading-5 text-[#101828]">Recommandations IA</h2>
            <p className="font-sans text-xs font-normal leading-4 text-[#6a7282]">
              À partir de vos documents · Ne remplace pas un avis médical
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {displayRecs.map((rec) => {
            const config = PRIORITY_CONFIG[rec.priority];
            return (
              <div
                key={rec.id}
                className={`rounded-[14px] border border-gray-200 bg-white p-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] border-l-4 ${config.bar}`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-sans text-xs font-semibold leading-4 ${config.pill}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                  <span className="font-sans text-xs font-normal leading-4 text-[#99a1af]">{rec.category}</span>
                </div>
                <h3 className="mb-2 font-sans text-sm font-semibold leading-5 text-[#101828]">{rec.title}</h3>
                <p className="mb-3 pl-0 font-sans text-xs font-normal leading-[19.5px] text-[#4a5565] sm:pl-4">{rec.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:pl-4">
                  {rec.deadline ? (
                    <span className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#364153]">
                      <Clock className="h-3 w-3 shrink-0 text-[#6a7282]" strokeWidth={2} aria-hidden />
                      {rec.deadline}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(rec.actionPath || '/patient/documents')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-colors ${config.pill}`}
                  >
                    {rec.action}
                    <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex gap-2 rounded-[14px] border-[0.8px] border-solid border-[#fee685] bg-[#fffbeb] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#bb4d00]" strokeWidth={2} aria-hidden />
          <p className="font-sans text-xs font-normal leading-[19.5px] text-[#bb4d00]">
            Ces recommandations sont générées par IA et <strong>ne remplacent pas</strong> l&apos;avis d&apos;un professionnel de santé
            (RGPD Art. 22).
          </p>
        </div>
      </div>

      {/* Figma 1:7562 — Stockage */}
      <div className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-4 py-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-sans text-sm font-semibold leading-5 text-[#101828]">
            <HardDrive className="h-4 w-4 text-[#4a5565]" strokeWidth={2} aria-hidden />
            Stockage
          </h3>
          <button
            type="button"
            onClick={() => navigate('/patient/account')}
            className="font-sans text-xs font-normal text-[#155dfc] hover:underline"
          >
            Gérer →
          </button>
        </div>
        <div className="mb-1.5 flex justify-between font-sans text-xs font-normal leading-4 text-[#6a7282]">
          <span>1,2 GB utilisés</span>
          <span>5 GB total</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
          <div
            className="h-full w-[24%] rounded-full bg-gradient-to-r from-[#2b7fff] to-[#ff2056]"
            aria-hidden
          />
        </div>
        <p className="mt-2 font-sans text-xs font-normal leading-4 text-[#99a1af]">Plan Starter · 24% utilisé</p>
      </div>

      {/* Figma 1:7581 — Outils & Services */}
      <div>
        <h2 className="mb-4 font-sans text-xl font-semibold leading-7 text-[#101828]">Outils & Services</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/patient/account')}
            className="rounded-[14px] p-6 text-left text-white shadow-md transition-all hover:brightness-105"
            style={{
              background: 'linear-gradient(160.9deg, rgb(21, 93, 252) 0%, rgb(20, 71, 230) 100%)',
            }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/20">
              <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
            </div>
            <h3 className="mb-2 font-sans text-lg font-semibold leading-7">Assistant Technique</h3>
            <p className="mb-4 font-sans text-sm font-normal leading-5 text-white/80">Posez vos questions santé 24/7</p>
            <span className="inline-flex items-center gap-1 font-sans text-sm font-medium text-white">
              Contactez-nous
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/patient/account')}
            className="rounded-[14px] p-6 text-left text-white shadow-md transition-all hover:brightness-105"
            style={{
              background: 'linear-gradient(160.87deg, rgb(236, 0, 63) 0%, rgb(199, 0, 54) 100%)',
            }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/20">
              <HardDrive className="h-6 w-6" strokeWidth={2} aria-hidden />
            </div>
            <h3 className="mb-2 font-sans text-lg font-semibold leading-7">Augmenter stockage</h3>
            <p className="mb-4 font-sans text-sm font-normal leading-5 text-white/80">Plus d&apos;espace pour vos documents</p>
            <span className="inline-flex items-center gap-1 font-sans text-sm font-medium text-white">
              Découvrir
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconWrap,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  iconWrap: string;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white p-6 text-left shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-md"
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] ${iconWrap}`}>{icon}</div>
      <p className="mb-1 font-sans text-sm font-normal leading-5 text-[#4a5565]">{label}</p>
      <p className="font-sans text-2xl font-bold leading-8 text-[#101828]">{value}</p>
    </button>
  );
}

function DocumentRow({ title, meta, tag }: { title: string; meta: string; tag: string }) {
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded-[10px] p-3 transition-colors hover:bg-[#f9fafb]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f4f6]">
        <FileCheck className="h-5 w-5 text-[#6a7282]" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-sans text-base font-medium leading-6 text-[#101828]">{title}</h3>
        <p className="truncate font-sans text-sm font-normal leading-5 text-[#4a5565]">{meta}</p>
      </div>
      <span className="shrink-0 rounded px-2 py-1 font-sans text-xs font-normal leading-4 text-[#6a7282] bg-[#f3f4f6]">{tag}</span>
    </div>
  );
}

function QuickRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-16 w-full items-center gap-3 rounded-[10px] px-3 text-left transition-colors hover:bg-[#f9fafb]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eff6ff]">{icon}</div>
      <span className="flex-1 font-sans text-base font-normal leading-6 text-[#101828]">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#99a1af]" strokeWidth={2} aria-hidden />
    </button>
  );
}
