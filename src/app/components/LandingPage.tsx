import { useId, useState } from 'react';
import { Link } from 'react-router';
import { LauraLogoMark } from './brand/LauraLogoMark';
import {
  Upload,
  Brain,
  Share2,
  Shield,
  FileText,
  Activity,
  ChevronRight,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Folder,
  Link2,
  Users,
  CheckCircle2,
  Download,
  Building2,
  Server,
  Search,
  ArrowDownToLine,
  Calendar,
  Menu,
  X,
  Lock,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { analyzeScan } from '../lib/api/scan';
import { ApiError } from '../lib/api/client';
import { ScanFindingApi } from '../types/api';

interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
  onAbout?: () => void;
  onPricing?: () => void;
  /** Contact commercial — défaut : ouverture du client mail */
  onContact?: () => void;
}

/** Figma `1:5231` — marque officielle + mot « Laura » + « AI » en dégradé. */
function LandingHeaderLogo() {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <LauraLogoMark size="xs" tone="brand" aria-hidden />
      <span className="text-[1.125rem] font-bold leading-5 tracking-tight">
        <span className="text-[#101828]">Laura </span>
        <span className="bg-gradient-to-r from-[#155dfc] via-[#8b5cf6] to-[#ff2056] bg-clip-text text-transparent">
          AI
        </span>
      </span>
    </div>
  );
}

const DEFAULT_LANDING_CONTACT = () => {
  window.location.assign('/contact');
};

type RadiologistCardIcon =
  | LucideIcon
  | 'dicom-folder'
  | 'ia-brain'
  | 'export-download'
  | 'share-nodes'
  | 'pacs-server'
  | 'cabinet-buildings';

type RadiologistFeatureCardDef = {
  icon: RadiologistCardIcon;
  iconWrapClass: string;
  title: string;
  body: string;
};

/** Figma `1:4601` — icône dossier DICOM (trait cyan + halo). */
function RadiologistDicomFolderIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  const filterId = `radiologist-folder-glow-${gid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.25" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M4.25 8.75c0-1.1.9-2 2-2h3.45l1.35 1.65h7.45c1.1 0 2 .9 2 2v8.35c0 1.1-.9 2-2 2h-11.25c-1.1 0-2-.9-2-2V8.75Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${filterId})`}
      />
      <path
        d="M4.25 10.25h15.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        opacity={0.95}
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}

/** Figma `1:4609` — icône cerveau / IA (trait rose néon + halo). Paths alignés sur Lucide `Brain`. */
function RadiologistIaBrainIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  const filterId = `radiologist-brain-glow-${gid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.15" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${filterId})`}
      >
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
        <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
        <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
        <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
        <path d="M6 18a4 4 0 0 1-1.967-.516" />
        <path d="M19.967 17.484A4 4 0 0 1 18 18" />
      </g>
    </svg>
  );
}

/** Figma `1:4625` — téléchargement / export (vert néon + halo). Paths alignés sur Lucide `Download`. */
function RadiologistExportDownloadIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  const filterId = `radiologist-download-glow-${gid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${filterId})`}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </g>
    </svg>
  );
}

/** Figma `1:4635` — partage (violet néon + halo). Paths alignés sur Lucide `Share2`. */
function RadiologistShareNodesIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  const filterId = `radiologist-share-glow-${gid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${filterId})`}
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </g>
    </svg>
  );
}

/** Figma `1:4647` — serveur PACS (cyan néon + halo). Paths alignés sur Lucide `Server`. */
function RadiologistPacsServerIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  const filterId = `radiologist-server-glow-${gid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${filterId})`}
      >
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <rect x="5" y="5" width="2.5" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
        <rect x="5" y="17" width="2.5" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Figma `1:4658` — bâtiments / cabinet (orange néon + halo). Paths alignés sur Lucide `Building2`. */
function RadiologistCabinetBuildingsIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '');
  const filterId = `radiologist-building-glow-${gid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${filterId})`}
      >
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </g>
    </svg>
  );
}

function RadiologistCardTileIcon({ icon }: { icon: RadiologistCardIcon }) {
  if (icon === 'dicom-folder') {
    return (
      <RadiologistDicomFolderIcon className="size-6 text-[#4eb0ff] drop-shadow-[0_0_5px_rgba(43,127,255,0.65)]" />
    );
  }
  if (icon === 'ia-brain') {
    return (
      <RadiologistIaBrainIcon className="size-6 text-[#ff6b8a] drop-shadow-[0_0_6px_rgba(255,32,86,0.55)]" />
    );
  }
  if (icon === 'export-download') {
    return (
      <RadiologistExportDownloadIcon className="size-6 text-[#3ae084] drop-shadow-[0_0_6px_rgba(0,201,80,0.55)]" />
    );
  }
  if (icon === 'share-nodes') {
    return (
      <RadiologistShareNodesIcon className="size-6 text-[#c9a3ff] drop-shadow-[0_0_6px_rgba(142,81,255,0.55)]" />
    );
  }
  if (icon === 'pacs-server') {
    return (
      <RadiologistPacsServerIcon className="size-6 text-[#3ee7ff] drop-shadow-[0_0_6px_rgba(0,184,219,0.55)]" />
    );
  }
  if (icon === 'cabinet-buildings') {
    return (
      <RadiologistCabinetBuildingsIcon className="size-6 text-[#ffa64d] drop-shadow-[0_0_6px_rgba(255,105,0,0.5)]" />
    );
  }
  const Icon = icon;
  return <Icon className="size-6 text-white" strokeWidth={2} aria-hidden />;
}

/** Figma `1:4598` — grille 3×2 cartes verre (Espace Radiologue). */
const RADIOLOGIST_FEATURE_CARDS: ReadonlyArray<RadiologistFeatureCardDef> = [
  {
    icon: 'dicom-folder',
    iconWrapClass: 'bg-[rgba(43,127,255,0.1)]',
    title: 'Dossiers DICOM complets',
    body: 'Créez des dossiers par patient avec upload de fichiers DICOM (IRM, TDM, Radio, Écho, PET…). Gestion des séries et statuts.',
  },
  {
    icon: 'ia-brain',
    iconWrapClass: 'bg-[rgba(255,32,86,0.1)]',
    title: 'Rapports IA + validation',
    body: "L'IA génère un rapport préliminaire en 5 sections. Vous révisez, complétez et finalisez avec votre signature.",
  },
  {
    icon: 'export-download',
    iconWrapClass: 'bg-[rgba(0,201,80,0.1)]',
    title: 'Export PDF & Impression',
    body: 'Export PDF avec en-tête cabinet, logo, RPPS et SIRET. Format A4 professionnel, impression directe depuis le navigateur.',
  },
  {
    icon: 'share-nodes',
    iconWrapClass: 'bg-[rgba(142,81,255,0.1)]',
    title: 'Partage 30 jours',
    body: 'Partagez le rapport finalisé via un lien privé valable 30 jours. Affichage complet avec en-tête cabinet.',
  },
  {
    icon: 'pacs-server',
    iconWrapClass: 'bg-[rgba(0,184,219,0.1)]',
    title: 'Intégration PACS multi-sites',
    body: 'Connectez vos PACS existants (DICOM ou DICOMweb). Test C-ECHO, C-FIND et import C-MOVE en 3 étapes.',
  },
  {
    icon: 'cabinet-buildings',
    iconWrapClass: 'bg-[rgba(255,105,0,0.1)]',
    title: 'Gestion du cabinet',
    body: 'Profil, RPPS, SIRET et logo. Informations intégrées dans les en-têtes de rapports PDF.',
  },
];

function RadiologistFeatureCardsGrid() {
  return (
    <ul
      className="mb-10 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-3 md:gap-5"
      aria-label="Fonctionnalités pour radiologues"
    >
      {RADIOLOGIST_FEATURE_CARDS.map((card) => {
        const { icon, iconWrapClass, title, body } = card;
        return (
          <li key={title}>
            <article className="rounded-2xl border-[0.8px] border-solid border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-6">
              <div
                className={`mb-4 flex size-11 shrink-0 items-center justify-center rounded-[14px] ${iconWrapClass}`}
              >
                <RadiologistCardTileIcon icon={icon} />
              </div>
              <h3 className="mb-2 font-sans text-base font-bold leading-6 text-white">{title}</h3>
              <p className="font-sans text-sm font-normal leading-[22.75px] text-[#90a1b9]">{body}</p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export function LandingPage({ onLogin, onGetStarted, onAbout, onPricing, onContact }: LandingPageProps) {
  const handleContact = onContact ?? DEFAULT_LANDING_CONTACT;
  const [navOpen, setNavOpen] = useState(false);
  const [showFreeScan, setShowFreeScan] = useState(false);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const readFileDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result;
        if (typeof res !== 'string') {
          reject(new Error('Lecture fichier impossible'));
          return;
        }
        resolve(res);
      };
      reader.onerror = () => reject(new Error('Lecture fichier impossible'));
      reader.readAsDataURL(file);
    });

  const stripDataUrl = (dataUrl: string): string => {
    const comma = dataUrl.indexOf(',');
    return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes('image') || file.type.includes('pdf'))) {
      setScanFile(file);
      setScanError(null);
      analyzeDocument(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanFile(file);
      setScanError(null);
      analyzeDocument(file);
    }
  };

  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true);
    setScanError(null);
    try {
      const dataUrl = await readFileDataUrl(file);
      const b64 = stripDataUrl(dataUrl);
      const raw = await analyzeScan(
        {
          fileBase64: b64,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name,
        },
        { auth: false },
      );
      const mappedFindings = (raw.findings || []).map((f: ScanFindingApi) => {
        const m = f.measurements as { size?: string; dimension?: string; dimensions?: string } | undefined;
        if (!m) return f;
        return {
          ...f,
          measurements: {
            ...m,
            dimensions: m.dimensions ?? m.dimension,
          },
        };
      });
      setAnalysisResult({
        type: raw.examType || raw.type,
        confidence: raw.confidence,
        examType: raw.type,
        anatomicalRegion: raw.anatomicalRegion || undefined,
        findings: mappedFindings,
        normalFindings: raw.normalFindings || undefined,
        recommendations: raw.recommendations || [],
        disclaimer: raw.disclaimer,
        date: new Date().toLocaleDateString('fr-FR'),
        doctor: 'Analyse IA (Laura AI)',
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Analyse impossible';
      setScanError(msg);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {/* Header — Figma `1:5231` */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[56px] items-center justify-between gap-3 py-2">
            <Link
              to="/"
              className="rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#155dfc]"
            >
              <LandingHeaderLogo />
            </Link>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
              <a
                href="#features"
                className="whitespace-nowrap text-sm font-medium leading-5 text-[#4a5565] transition-colors hover:text-[#101828]"
              >
                Fonctionnalités
              </a>
              <button
                type="button"
                onClick={() => onPricing?.()}
                className="whitespace-nowrap text-sm font-medium leading-5 text-[#4a5565] transition-colors hover:text-[#101828]"
              >
                Forfait
              </button>
              <button
                type="button"
                onClick={() => onAbout?.()}
                className="whitespace-nowrap text-sm font-medium leading-5 text-[#4a5565] transition-colors hover:text-[#101828]"
              >
                A propos
              </button>
              <button
                type="button"
                onClick={handleContact}
                className="whitespace-nowrap text-sm font-medium leading-5 text-[#4a5565] transition-colors hover:text-[#101828]"
              >
                Contact
              </button>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onLogin}
                className="hidden whitespace-nowrap text-sm font-medium leading-5 text-[#4a5565] transition-colors hover:text-[#101828] sm:inline"
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="h-9 shrink-0 rounded-[14px] bg-gradient-to-r from-[#155dfc] to-[#ff2056] px-4 text-sm font-semibold leading-5 text-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)] transition-[filter] hover:brightness-[1.03] sm:px-5"
              >
                Commencer
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4a5565] hover:bg-gray-50 md:hidden"
                aria-expanded={navOpen}
                aria-controls="landing-nav-mobile"
                onClick={() => setNavOpen((o) => !o)}
              >
                {navOpen ? <X className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />}
                <span className="sr-only">{navOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
              </button>
            </div>
          </div>

          {navOpen && (
            <nav
              id="landing-nav-mobile"
              className="flex flex-col gap-1 border-t border-gray-100 py-3 md:hidden"
              aria-label="Navigation mobile"
            >
              <a
                href="#features"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#4a5565] hover:bg-gray-50 hover:text-[#101828]"
                onClick={() => setNavOpen(false)}
              >
                Fonctionnalités
              </a>
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#4a5565] hover:bg-gray-50 hover:text-[#101828]"
                onClick={() => {
                  setNavOpen(false);
                  onPricing?.();
                }}
              >
                Forfait
              </button>
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#4a5565] hover:bg-gray-50 hover:text-[#101828]"
                onClick={() => {
                  setNavOpen(false);
                  onAbout?.();
                }}
              >
                A propos
              </button>
              <button
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#4a5565] hover:bg-gray-50 hover:text-[#101828]"
                onClick={() => {
                  setNavOpen(false);
                  handleContact();
                }}
              >
                Contact
              </button>
              <button
                type="button"
                className="mt-1 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#4a5565] hover:bg-gray-50 hover:text-[#101828]"
                onClick={() => {
                  setNavOpen(false);
                  onLogin();
                }}
              >
                Connexion
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero — Figma « Section » 1:5195 (fond #eef2ff, pilule 1:5199, titres 1:5207–1:5213, texte 1:5214) */}
      <section className="relative overflow-hidden bg-[#eef2ff] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute left-1/2 top-[12%] h-[min(500px,70vh)] w-[min(700px,92vw)] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[64px]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto w-full max-w-[52rem] text-center">
            <div className="mx-auto mb-10 inline-flex h-[34px] max-w-full items-center gap-2 rounded-full border-[0.8px] border-solid border-[#dbeafe] bg-white px-4 py-1.5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] sm:px-5">
              <Sparkles className="h-[14px] w-[14px] shrink-0 text-[#155dfc]" aria-hidden />
              <span className="font-sans text-[14px] font-medium leading-5 text-[#155dfc]">
                Carnet de santé numérique intelligent
              </span>
            </div>

            {/* Figma `1:5207` — Heading 1 : 72px / 72 lh, Inter Bold, L1 #101828, L2 dégradé #155DFC → #FF2056 */}
            <h1 className="mb-8 text-center font-sans font-bold tracking-tight">
              <span className="block text-[#101828] text-[2rem] leading-[2.25rem] sm:text-[2.5rem] sm:leading-[2.75rem] md:text-[3rem] md:leading-[3.25rem] lg:text-[3.5rem] lg:leading-[3.75rem] xl:text-[72px] xl:leading-[72px]">
                AI-Powered Medical
              </span>
              <span className="mt-2 block bg-gradient-to-r from-[#155dfc] to-[#ff2056] bg-clip-text text-transparent text-[2rem] leading-[2.25rem] sm:mt-2.5 sm:text-[2.5rem] sm:leading-[2.75rem] md:text-[3rem] md:leading-[3.25rem] lg:text-[3.5rem] lg:leading-[3.75rem] xl:mt-3 xl:text-[72px] xl:leading-[72px]">
                Analyses instantanées
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-[42rem] font-sans text-lg font-normal leading-7 text-[#4a5565] sm:text-[20px] sm:leading-[28px]">
              Laura AI vous aide à analyser vos documents, suivre vos traitements et propose des recommandations personnalisées.
            </p>

            {/* Figma 1:5216 — CTA */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleContact}
                className="inline-flex h-[52px] w-full min-w-0 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#155dfc] to-[#ff2056] px-7 text-base font-semibold leading-6 text-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all hover:brightness-105 hover:shadow-[0px_12px_18px_0px_rgba(0,0,0,0.12),0px_6px_8px_0px_rgba(0,0,0,0.1)] sm:w-[242px]"
              >
                Demander une démo
                <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              </button>
              {/* Figma 1:5221 « Button » + texte 1:5222 « Voir les tarifs » */}
              <button
                type="button"
                onClick={() => onPricing?.()}
                className="inline-flex w-full min-w-0 shrink-0 items-center justify-center rounded-[16px] border-[1.6px] border-solid border-[#bedbff] bg-white px-[33.6px] py-[15.6px] transition-colors hover:bg-blue-50/80 sm:w-auto sm:min-w-[161px]"
              >
                <span className="shrink-0 text-center font-sans text-[16px] font-semibold leading-[24px] not-italic whitespace-nowrap text-[#1447e6]">
                  Voir les tarifs
                </span>
              </button>
            </div>
          </div>

          {/* Figma 1:5225 — même section #eef2ff */}
          <div className="relative z-10 mt-14 flex w-full justify-center py-2">
            <button
              type="button"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative flex h-[35.987px] w-[51px] shrink-0 flex-col items-center text-[#d1d5dc] transition-colors hover:text-gray-400"
              aria-label="Découvrir les fonctionnalités"
            >
              <span className="absolute left-0 top-0 w-full whitespace-nowrap text-center font-sans text-[12px] font-normal leading-[16px] not-italic text-inherit">
                Découvrir
              </span>
              <span className="absolute left-[17.5px] top-[17.8px] flex h-4 w-4 items-center justify-center">
                <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Free Scan Section */}
      {showFreeScan && (
        <section id="scan" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Essayez l'analyse IA gratuitement
              </h2>
              <p className="text-gray-600">
                Aucun compte nécessaire • Résultat en quelques secondes
              </p>
            </div>

            {!analysisResult ? (
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
              >
                {scanError && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                    <p className="text-sm text-red-800">{scanError}</p>
                  </div>
                )}
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">Analyse en cours...</p>
                      <p className="text-sm text-gray-600">L'IA analyse votre document médical</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Glissez votre document ici
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      ou cliquez pour parcourir
                    </p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      data-testid="landing-scan-file-input"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-rose-600 transition-all"
                    >
                      Sélectionner un fichier
                    </label>
                    <p className="text-xs text-gray-500 mt-4">
                      Formats supportés : JPG, PNG, PDF • Taille max : 50 MB
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-rose-50 rounded-2xl p-8 space-y-6" data-testid="landing-scan-result">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{analysisResult.type}</span>
                    </div>
                    
                    {analysisResult.anatomicalRegion && (
                      <div className="text-sm text-gray-600">
                        Région : {analysisResult.anatomicalRegion}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAnalysisResult(null);
                      setScanFile(null);
                      setScanError(null);
                    }}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-300"
                  >
                    Nouvelle analyse
                  </button>
                </div>

                {/* Findings */}
                {analysisResult.findings && analysisResult.findings.length > 0 && (
                  <div className="bg-white rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg">Résultats Détaillés</h3>
                    {analysisResult.findings.map((finding: any, index: number) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs font-semibold text-orange-700 mb-1">{finding.category}</div>
                            <p className="font-bold text-gray-900">{finding.title}</p>
                          </div>
                          {finding.classification && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                              {finding.classification}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{finding.description}</p>
                        
                        {finding.location && (
                          <p className="text-xs text-gray-600 mb-2">
                            <span className="font-semibold">Localisation :</span> {finding.location}
                          </p>
                        )}
                        
                        {finding.measurements && (
                          <p className="text-xs text-gray-600 mb-2">
                            <span className="font-semibold">Taille :</span> {finding.measurements.size} 
                            {finding.measurements.dimensions && ` (${finding.measurements.dimensions})`}
                          </p>
                        )}
                        
                        {finding.characteristics && finding.characteristics.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Caractéristiques :</p>
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              {finding.characteristics.map((char: string, i: number) => (
                                <li key={i}>• {char}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Normal Findings */}
                {analysisResult.normalFindings && analysisResult.normalFindings.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-900 mb-2 text-sm">✓ Résultats Normaux</h3>
                    <ul className="grid grid-cols-2 gap-1 text-xs text-green-800">
                      {analysisResult.normalFindings.map((finding: string, index: number) => (
                        <li key={index}>• {finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-600" />
                      Recommandations Médicales
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="text-sm">
                          <p className="font-semibold text-gray-900">{rec.title}</p>
                          <p className="text-gray-700 text-xs mb-1">{rec.description}</p>
                          {rec.timeframe && (
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold">Délai :</span> {rec.timeframe}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.disclaimer && (
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <p className="text-xs leading-relaxed text-amber-900">{analysisResult.disclaimer}</p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-rose-500 rounded-xl p-6 text-white">
                  <p className="text-center mb-4">
                    ✨ Créez un compte gratuit pour sauvegarder vos analyses et accéder au chat IA médical
                  </p>
                  <button
                    onClick={onGetStarted}
                    className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    Créer mon compte gratuit
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête Figma « Container » 1:4422 — badge 1:4423, titre 1:4430, paragraphe 1:4432 */}
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <div className="inline-flex h-8 items-center gap-2 rounded-full bg-[#dbeafe] px-4">
              <Users className="h-[14px] w-[14px] shrink-0 text-[#1447e6]" strokeWidth={2} aria-hidden />
              <span className="font-sans text-[14px] font-semibold leading-5 text-[#1447e6]">Espace Patient</span>
            </div>
            <h2 className="max-w-[42rem] text-balance font-sans text-3xl font-bold leading-tight tracking-tight text-[#101828] sm:text-4xl sm:leading-[40px] lg:text-[36px] lg:leading-[40px]">
              Votre carnet de santé, enfin intelligent
            </h2>
            <p className="max-w-[42rem] font-sans text-lg font-normal leading-7 text-[#6a7282] sm:text-[20px] sm:leading-[28px]">
              Centralisez vos documents médicaux, suivez vos rendez-vous et bénéficiez de recommandations IA personnalisées.
            </p>
          </div>

          {/* Grille Figma « Container » 1:4434 — 3 cartes + 1 centrée */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="rounded-2xl border-[0.8px] border-solid border-[#f3f4f6] bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#2b7fff] to-[#1447e6]">
                  <Brain className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mb-2 text-left text-base font-bold leading-6 text-[#101828]">Scan IA de documents</h3>
                <p className="mb-4 text-left text-sm font-normal leading-[22.75px] text-[#6a7282]">
                  Analysez ordonnances, bilans, IRM et scanners. Résultat structuré avec findings, mesures et recommandations priorisées. Rapport sauvegardé automatiquement.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['OCR', 'IA médicale', 'Rapport auto'].map(tag => (
                    <span key={tag} className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-normal leading-4 text-[#4a5565]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border-[0.8px] border-solid border-[#f3f4f6] bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#8e51ff] to-[#7008e7]">
                  <Folder className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mb-2 text-left text-base font-bold leading-6 text-[#101828]">Dossiers multi-fichiers</h3>
                <p className="mb-4 text-left text-sm font-normal leading-[22.75px] text-[#6a7282]">
                  Organisez vos documents en dossiers thématiques (suivi rénal, bilan annuel…). Ajoutez, déplacez et renommez facilement.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Dossiers', 'Multi-docs'].map(tag => (
                    <span key={tag} className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-normal leading-4 text-[#4a5565]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border-[0.8px] border-solid border-[#f3f4f6] bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#ff2056] to-[#c70036]">
                  <Link2 className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mb-2 text-left text-base font-bold leading-6 text-[#101828]">Partage sécurisé</h3>
                <p className="mb-4 text-left text-sm font-normal leading-[22.75px] text-[#6a7282]">
                  Générez un lien privé valable 7 jours pour partager un document ou un dossier complet avec votre médecin, sans compte requis.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['7 jours', 'Lien privé', 'Sans compte'].map(tag => (
                    <span key={tag} className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-normal leading-4 text-[#4a5565]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="hidden md:block" aria-hidden />
              <article className="rounded-2xl border-[0.8px] border-solid border-[#f3f4f6] bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#ff6900] to-[#ca3500]">
                  <Sparkles className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mb-2 text-left text-base font-bold leading-6 text-[#101828]">Recommandations IA</h3>
                <p className="mb-4 text-left text-sm font-normal leading-[22.75px] text-[#6a7282]">
                  Recommandations personnalisées basées sur votre dossier médical complet. Score de santé, alertes et conseils adaptés à votre profil.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Personnalisé', 'Score santé'].map(tag => (
                    <span key={tag} className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-normal leading-4 text-[#4a5565]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
              <div className="hidden md:block" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Bloc marketing Figma 1:4546 + visuel 1:4586 « Image (Patient health app) » */}
      <section className="bg-[#f9fafb] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-12">
          <div className="max-w-[608px] md:max-w-none">
            <div className="mb-4 inline-flex h-8 items-center gap-2 rounded-full bg-[#dbeafe] px-4">
              <FileText className="h-[14px] w-[14px] shrink-0 text-[#1447e6]" strokeWidth={2} aria-hidden />
              <span className="font-sans text-[14px] font-semibold leading-5 text-[#1447e6]">Gestion documentaire avancée</span>
            </div>
            <h2 className="mb-4 font-sans text-3xl font-bold leading-10 tracking-tight text-[#101828] sm:text-[36px] sm:leading-[40px]">
              Tous vos documents,
              <br />
              parfaitement organisés
            </h2>
            <p className="mb-6 font-sans text-base font-normal leading-[26px] text-[#6a7282]">
              De l&apos;ordonnance à l&apos;imagerie, chaque document est classé, annoté par l&apos;IA et accessible en un clic. Créez des dossiers pour regrouper vos suivis médicaux et partagez-les avec vos praticiens.
            </p>
            <ul className="mb-8 flex flex-col gap-3">
              {[
                'Ordonnances, analyses, IRM, scanners, certificats',
                'Dossiers multi-fichiers avec partage par lien',
                'Visionneuse avec rapport IA intégré',
                'Page publique sécurisée pour médecins externes',
              ].map(line => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" strokeWidth={2} aria-hidden />
                  <span className="font-sans text-[14px] font-normal leading-5 text-[#364153]">{line}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#155dfc] to-[#ff2056] px-6 text-base font-semibold leading-6 text-white shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all hover:brightness-105"
            >
              Essayer gratuitement
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <div className="relative aspect-[607/320] w-full min-h-[200px] overflow-hidden rounded-2xl border-[0.8px] border-solid border-[#f3f4f6] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
            <img
              src="/landing/patient-health-app.jpg"
              alt="Téléphone et stéthoscope, symbolisant la santé connectée"
              className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
              width={606}
              height={320}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Section Figma 1:4587 — Espace Radiologue */}
      <section
        className="px-4 pb-24 pt-24 sm:px-6 lg:px-8"
        style={{
          background:
            'linear-gradient(142.8deg, rgb(15, 23, 43) 0%, rgb(29, 41, 61) 50%, rgb(49, 44, 133) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-14 flex flex-col items-center gap-4 text-center">
            <div className="inline-flex h-[34px] items-center gap-2 rounded-full border-[0.8px] border-[rgba(124,134,255,0.3)] bg-[rgba(97,95,255,0.2)] px-4">
              <Activity className="h-[14px] w-[14px] shrink-0 text-[#a3b3ff]" strokeWidth={2} aria-hidden />
              <span className="font-sans text-[14px] font-semibold leading-5 text-[#a3b3ff]">Espace Radiologue</span>
            </div>
            <h2 className="max-w-4xl font-sans text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[36px] lg:leading-[40px]">
              La plateforme complète pour les radiologues
            </h2>
            <p className="max-w-[42rem] font-sans text-lg font-normal leading-7 text-[#90a1b9] sm:text-[20px] sm:leading-[28px]">
              Gérez vos dossiers DICOM, rédigez et validez vos rapports avec l&apos;IA, connectez vos serveurs PACS existants.
            </p>
          </header>

          <RadiologistFeatureCardsGrid />

          <div className="rounded-3xl border-[0.8px] border-solid border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-6 py-8 sm:px-8">
            <h3 className="mb-8 text-center font-sans text-xl font-bold leading-7 text-white">
              Workflow d&apos;import PACS en 3 étapes
            </h3>
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
              {(
                [
                  {
                    n: 1,
                    Icon: Server,
                    label: 'Sélection serveur',
                    desc: 'Choisissez parmi vos PACS configurés. Test de connexion C-ECHO en temps réel.',
                  },
                  {
                    n: 2,
                    Icon: Search,
                    label: 'Recherche C-FIND',
                    desc: 'Filtrez par patient, date, modalité. Visualisez les études avec métadonnées DICOM.',
                  },
                  {
                    n: 3,
                    Icon: ArrowDownToLine,
                    label: 'Import C-MOVE',
                    desc: 'Importez les fichiers. Le dossier apparaît avec le badge PACS indigo dans votre liste.',
                  },
                ] as const
              ).map(({ n, Icon, label, desc }) => (
                <div key={n} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#4f39f6] font-sans text-base font-bold text-white">
                    {n}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Icon className="h-4 w-4 shrink-0 text-[#a3b3ff]" strokeWidth={2} aria-hidden />
                      <span className="font-sans text-xs font-semibold uppercase tracking-[0.3px] text-[#a3b3ff]">{label}</span>
                    </div>
                    <p className="font-sans text-sm font-normal leading-5 text-[#90a1b9]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleContact}
                className="inline-flex h-12 max-w-full items-center justify-center gap-2 rounded-[14px] bg-[#4f39f6] px-6 text-base font-semibold leading-6 text-white transition-colors hover:bg-[#4532d8]"
              >
                Demander une démo radiologue
                <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Figma 1:4719 — Rapports IA assistés (image + extrait rapport + puces) */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
          <div className="w-full max-w-[608px] justify-self-center md:justify-self-start">
            <div className="overflow-hidden rounded-3xl border-[0.8px] border-solid border-[#f3f4f6] p-[1px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <div className="relative aspect-[608/320] w-full bg-[#f3f4f6]">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1216&h=640&q=80"
                  alt="Radiologue consultant des examens d'imagerie sur tablette"
                  className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
                  width={608}
                  height={320}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-[608px] flex-col justify-self-center md:justify-self-end">
            <div className="mb-5 inline-flex h-8 items-center gap-2 rounded-full bg-[#ffe4e6] pl-4 pr-4">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#c70036]" strokeWidth={2.5} aria-hidden />
              <span className="font-sans text-[14px] font-semibold leading-5 text-[#c70036]">
                Rapports IA assistés
              </span>
            </div>
            <h2 className="mb-4 font-sans text-3xl font-bold leading-10 tracking-tight text-[#101828] sm:text-[36px] sm:leading-10">
              L&apos;IA rédige, vous validez
            </h2>
            <p className="mb-6 font-sans text-base font-normal leading-[26px] text-[#6a7282]">
              Laura AI génère automatiquement un rapport préliminaire structuré avec niveau de confiance affiché. Vous
              révisez, corrigez et finalisez en quelques minutes.
            </p>

            <div className="mb-8 rounded-2xl bg-[#f9fafb] px-4 pb-4 pt-4">
              <p className="mb-1 font-mono text-xs font-semibold leading-4 text-[#155dfc]">Rapport IA — IRM Lombaire</p>
              <p className="mb-1 font-mono text-xs leading-4 text-[#99a1af]">
                <span className="text-[#99a1af]">I.</span>
                <span className="text-[#364153]"> Indication : Douleurs lombaires chroniques L4-L5</span>
              </p>
              <p className="mb-1 font-mono text-xs leading-4 text-[#99a1af]">
                <span className="text-[#99a1af]">III.</span>
                <span className="text-[#364153]"> Hernie discale L4-L5 avec conflit radiculaire droit</span>
              </p>
              <p className="mb-1 font-mono text-xs leading-4">
                <span className="text-[#99a1af]">IV.</span>
                <span className="text-[#364153]"> Confiance IA : </span>
                <span className="font-bold text-[#00a63e]">78%</span>
              </p>
              <p className="font-mono text-xs leading-4 text-[#f54900]">⚠️ À valider par le radiologue diplômé</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex h-[38px] items-center gap-2 rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <Download className="h-4 w-4 shrink-0 text-[#364153]" strokeWidth={2} aria-hidden />
                <span className="font-sans text-sm font-normal leading-5 text-[#364153]">Export PDF</span>
              </div>
              <div className="inline-flex h-[38px] items-center gap-2 rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <Share2 className="h-4 w-4 shrink-0 text-[#364153]" strokeWidth={2} aria-hidden />
                <span className="font-sans text-sm font-normal leading-5 text-[#364153]">Partage 30j</span>
              </div>
              <div className="inline-flex h-[38px] items-center gap-2 rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
                <Building2 className="h-4 w-4 shrink-0 text-[#364153]" strokeWidth={2} aria-hidden />
                <span className="font-sans text-sm font-normal leading-5 text-[#364153]">En-tête cabinet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Figma 1:5090 — CTA final gradient */}
      <section
        className="px-4 pb-24 pt-24 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(163.26deg, rgb(21, 93, 252) 0%, rgb(255, 32, 86) 100%)',
        }}
      >
        <div className="mx-auto max-w-[768px] text-center">
          <h2 className="mb-5 font-sans text-3xl font-bold leading-10 tracking-tight text-white sm:text-[36px] sm:leading-10">
            Prêt à digitaliser votre santé ?
          </h2>
          <p className="mx-auto mb-10 max-w-[768px] font-sans text-lg font-normal leading-7 text-[#dbeafe] sm:text-xl sm:leading-7">
            Rejoignez patients et radiologues qui font confiance à Laura AI pour centraliser et analyser leurs données médicales.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex h-[62px] min-h-[62px] w-full items-center justify-center gap-2 rounded-[14px] bg-white px-6 font-sans text-lg font-bold leading-7 text-[#1447e6] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-colors hover:bg-blue-50 sm:w-auto sm:min-w-[200px]"
            >
              Commencer gratuitement
              <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleContact}
              className="inline-flex h-[62px] min-h-[62px] w-full items-center justify-center gap-2 rounded-[14px] border-[0.8px] border-solid border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] px-8 font-sans text-lg font-semibold leading-7 text-white transition-colors hover:bg-[rgba(255,255,255,0.15)] sm:w-auto"
            >
              <Calendar className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              Demander une démo
            </button>
          </div>
        </div>
      </section>

      {/* Footer — Figma `1:5119` */}
      <footer className="bg-[#020617] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <LauraLogoMark size="xs" tone="brand" className="rounded-[14px]" aria-hidden />
                <span className="font-sans text-lg font-bold leading-7 text-white">Laura AI</span>
              </div>
              <p className="max-w-[17rem] font-sans text-sm font-normal leading-[22.75px] text-[#99a1af]">
                Votre carnet de santé numérique, sécurisé et intelligent.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-sans text-sm font-semibold leading-5 text-[#e5e7eb]">Navigation</h3>
              <ul className="flex flex-col gap-[10px] font-sans text-sm font-normal leading-5 text-[#99a1af]">
                <li>
                  <a href="#features" className="transition-colors hover:text-white">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <Link to="/pricing" className="transition-colors hover:text-white">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="transition-colors hover:text-white">
                    À propos de nous
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-white">
                    Demander une démo
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-sans text-sm font-semibold leading-5 text-[#e5e7eb]">Compte</h3>
              <ul className="flex flex-col gap-[10px] font-sans text-sm font-normal leading-5 text-[#99a1af]">
                <li>
                  <Link to="/signup" className="transition-colors hover:text-white">
                    Créer un compte
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="transition-colors hover:text-white">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link to="/contact#faq" className="transition-colors hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-sans text-sm font-semibold leading-5 text-[#e5e7eb]">Légal</h3>
              <ul className="flex flex-col gap-[10px] font-sans text-sm font-normal leading-5 text-[#99a1af]">
                <li>
                  <Link to="/about" className="transition-colors hover:text-white">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="transition-colors hover:text-white">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="transition-colors hover:text-white">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-[#1e2939] pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="font-sans text-xs font-normal leading-4 text-[#4a5565]">
              © 2026 Laura AI. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-4">
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-normal leading-4 text-[#4a5565]">
                <Shield className="h-3 w-3 shrink-0 text-emerald-500" strokeWidth={2} aria-hidden />
                HDS certifié France
              </span>
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-normal leading-4 text-[#4a5565]">
                <Lock className="h-3 w-3 shrink-0 text-blue-400" strokeWidth={2} aria-hidden />
                RGPD conforme
              </span>
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-normal leading-4 text-[#4a5565]">
                <Check className="h-3 w-3 shrink-0 text-violet-400" strokeWidth={2} aria-hidden />
                AES-256
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}