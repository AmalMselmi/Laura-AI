import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  Users,
  Clock,
  CheckCircle2,
  FolderOpen,
  Settings,
  ChevronRight,
  FolderPlus,
  Sparkles,
  Layers,
  Share2,
} from 'lucide-react';

/** Figma `1:8843` / `1:9818` — Accueil radiologue */
export function RadiologistHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const parts = user.name.trim().split(/\s+/);
  const surname = parts[parts.length - 1] || user.name;
  const greetingName = `Dr. ${surname}`;

  const stats = [
    {
      label: 'Rapports IA générés',
      value: '8',
      Icon: Brain,
      style: { background: 'linear-gradient(160.74deg, rgb(43, 127, 255) 0%, rgb(21, 93, 252) 100%)' },
    },
    {
      label: 'Dossiers actifs',
      value: '142',
      Icon: Users,
      style: { background: 'linear-gradient(160.74deg, rgb(0, 201, 80) 0%, rgb(0, 166, 62) 100%)' },
    },
    {
      label: 'En Attente',
      value: '3',
      Icon: Clock,
      style: { background: 'linear-gradient(160.74deg, rgb(255, 105, 0) 0%, rgb(245, 73, 0) 100%)' },
    },
    {
      label: 'Rapports finalisés',
      value: '5',
      Icon: CheckCircle2,
      style: { background: 'linear-gradient(160.74deg, rgb(173, 70, 255) 0%, rgb(152, 16, 250) 100%)' },
    },
  ];

  const activities = [
    {
      title: 'Nouveau dossier Patient ajouté',
      time: 'Il y a 3 heures',
      wrap: 'bg-emerald-100',
      Icon: FolderPlus,
      iconClass: 'text-emerald-600',
    },
    {
      title: 'Rapport médical généré pour Mohamed Trabelsi',
      time: 'Il y a 5 heures',
      wrap: 'bg-violet-100',
      Icon: Sparkles,
      iconClass: 'text-violet-600',
    },
    {
      title: '3 nouveaux dossiers ajoutés',
      time: 'Il y a 6 heures',
      wrap: 'bg-sky-100',
      Icon: Layers,
      iconClass: 'text-sky-600',
    },
    {
      title: 'Lien dossier médical partagé pour médecin',
      time: 'Il y a 9 heures',
      wrap: 'bg-rose-100',
      Icon: Share2,
      iconClass: 'text-rose-600',
    },
  ];

  const workflowSteps = [
    { n: '1', emoji: '📁', title: 'Créer dossier', desc: 'Patient + Pathologie' },
    { n: '2', emoji: '📤', title: 'Importer DICOM', desc: 'Drag & drop' },
    { n: '3', emoji: '🧠', title: 'Rapport IA', desc: 'Analyse Laura AI' },
    { n: '4', emoji: '✅', title: 'Valider', desc: 'Éditer & PDF' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-[30px] font-bold leading-9 tracking-tight text-[#101828]">
          Bonjour, {greetingName} 👋
        </h1>
        <p className="font-sans text-base font-normal leading-6 text-[#4a5565]">
          Voici un aperçu de votre journée
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, style }) => (
          <div
            key={label}
            className="flex flex-col gap-2 rounded-[14px] px-4 pb-4 pt-4 text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
            style={style}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 shrink-0 text-white opacity-95" strokeWidth={2} aria-hidden />
              <span className="font-sans text-sm font-normal leading-5 text-white/90">{label}</span>
            </div>
            <p className="font-sans text-[30px] font-bold leading-9 text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,438px)]">
        <div className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-5 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-lg font-semibold leading-7 text-[#101828]">Activité récente</h2>
            <button
              type="button"
              onClick={() => navigate('/radiologist/folders')}
              className="font-sans text-sm font-medium text-[#ec003f] hover:underline"
            >
              Voir tout
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {activities.map((a) => (
              <div key={a.title} className="flex gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${a.wrap}`}
                >
                  <a.Icon className={`h-5 w-5 ${a.iconClass}`} strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-normal leading-5 text-[#101828]">{a.title}</p>
                  <p className="mt-1 font-sans text-xs font-normal leading-4 text-[#6a7282]">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-5 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
          <h2 className="mb-4 font-sans text-lg font-semibold leading-7 text-[#101828]">Actions rapides</h2>
          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => navigate('/radiologist/folders')}
              className="relative flex w-full rounded-[10px] py-3 pl-[76px] pr-10 text-left transition-colors hover:bg-[#f9fafb]"
            >
              <div
                className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-[14px]"
                style={{
                  background: 'linear-gradient(135deg, rgb(43, 127, 255) 0%, rgb(152, 16, 250) 100%)',
                }}
              >
                <FolderOpen className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="font-sans text-base font-bold leading-6 text-[#101828]">Dossiers patients DICOM</h3>
                <p className="mt-1 max-w-[228px] font-sans text-sm font-normal leading-[19.25px] text-[#6a7282]">
                  Organisez vos examens, générez et éditez des rapports IA.
                </p>
              </div>
              <ChevronRight
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99a1af]"
                strokeWidth={2}
                aria-hidden
              />
            </button>
            <button
              type="button"
              onClick={() => navigate('/radiologist/account')}
              className="relative flex w-full rounded-[10px] py-3 pl-[76px] pr-10 text-left transition-colors hover:bg-[#f9fafb]"
            >
              <div
                className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-[14px]"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 32, 86) 0%, rgb(236, 0, 63) 100%)',
                }}
              >
                <Settings className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="font-sans text-base font-bold leading-6 text-[#101828]">Mon compte</h3>
                <p className="mt-1 max-w-[244px] font-sans text-sm font-normal leading-[19.25px] text-[#6a7282]">
                  Gérez votre profil, stockage DICOM et abonnement pro.
                </p>
              </div>
              <ChevronRight
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99a1af]"
                strokeWidth={2}
                aria-hidden
              />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-6 pt-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <h3 className="mb-6 text-center font-sans text-sm font-bold leading-5 text-[#101828]">
          Flux de travail Laura AI
        </h3>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {workflowSteps.map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center">
              <div
                className="mb-2 flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, rgb(21, 93, 252) 0%, rgb(173, 70, 255) 100%)',
                }}
              >
                {s.n}
              </div>
              <span className="mb-1 text-xl leading-7" aria-hidden>
                {s.emoji}
              </span>
              <p className="font-sans text-xs font-semibold leading-4 text-[#101828]">{s.title}</p>
              <p className="mt-1 font-sans text-xs font-normal leading-4 text-[#6a7282]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
