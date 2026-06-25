import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Loader2,
  Lock,
  Server,
  Settings,
  Share2,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import {
  buildSectionsFromOpenApi,
  type ApiDocEndpoint,
  type ApiDocSection,
  type GroupId,
  GROUP_ORDER,
} from '../lib/apiDocs/openapiToSections';
import { LauraLogoMark } from '../components/brand/LauraLogoMark';

// ── API base (same default as src/app/lib/api/client.ts) ─────────────────────

function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  return String(raw).replace(/\/$/, '');
}

async function fetchOpenApiJson(base: string): Promise<{ spec: Record<string, unknown>; url: string }> {
  const candidates = [`${base}/openapi.json`, `${base}/api/openapi.json`];
  let lastErr: Error | null = null;
  for (const url of candidates) {
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) {
        lastErr = new Error(`${res.status} ${res.statusText}`);
        continue;
      }
      const spec = (await res.json()) as Record<string, unknown>;
      return { spec, url };
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error('OpenAPI introuvable');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 p-1 rounded hover:bg-gray-700 transition-colors"
      title="Copier"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
}

function CodeBlock({ code, lang = 'json' }: { code: string; lang?: string }) {
  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden mt-2 mb-3">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-xs text-gray-100 overflow-x-auto leading-relaxed font-mono whitespace-pre">{code}</pre>
    </div>
  );
}

function Badge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800 border-green-200',
    POST: 'bg-blue-100 text-blue-800 border-blue-200',
    PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PATCH: 'bg-orange-100 text-orange-800 border-orange-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border font-mono ${colors[method] || 'bg-gray-100 text-gray-700'}`}
    >
      {method}
    </span>
  );
}

function StatusCode({ code }: { code: number }) {
  const color =
    code < 300 ? 'text-green-600 bg-green-50' : code < 400 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50';
  return <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-mono font-bold ${color}`}>{code}</span>;
}

const AUTH_COLORS: Record<string, string> = {
  public: 'bg-gray-100 text-gray-600',
  patient: 'bg-blue-100 text-blue-700',
  radiologist: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
  any: 'bg-teal-100 text-teal-700',
};

const GROUP_ICONS: Record<GroupId, LucideIcon> = {
  auth: Lock,
  scan: Brain,
  patient: FileText,
  shared: Share2,
  'radiologist-dicom': Layers,
  pacs: Server,
  cabinet: Settings,
  admin: Users,
  gdpr: Shield,
  jobs: Zap,
};

// ── Endpoint Card ─────────────────────────────────────────────────────────────

function EndpointCard({ ep }: { ep: ApiDocEndpoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden transition-shadow ${open ? 'shadow-md' : 'hover:shadow-sm'}`}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <Badge method={ep.method} />
        <code className="flex-1 font-mono text-sm text-gray-800 truncate">{ep.path}</code>
        <span
          className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${AUTH_COLORS[ep.auth]}`}
        >
          {ep.auth === 'public'
            ? '🌐 Public'
            : ep.auth === 'patient'
              ? '🔵 Patient'
              : ep.auth === 'radiologist'
                ? '🟣 Radiologue'
                : ep.auth === 'admin'
                  ? '🔴 Admin'
                  : '🟢 Auth'}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-white space-y-3">
          <p className="text-gray-700 text-sm">{ep.summary}</p>
          {ep.params && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Query Params</p>
              <CodeBlock code={ep.params} lang="params" />
            </div>
          )}
          {ep.body && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Request Body</p>
              <CodeBlock code={ep.body} lang="json" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Response <StatusCode code={200} />
            </p>
            <CodeBlock code={ep.response} lang="json" />
          </div>
          {ep.notes && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">{ep.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ section }: { section: ApiDocSection }) {
  const [open, setOpen] = useState(true);
  const Icon = GROUP_ICONS[section.id as GroupId] ?? Lock;
  return (
    <div id={section.id} className="scroll-mt-20">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 mb-4 group text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
          <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {section.endpoints.length} endpoint{section.endpoints.length > 1 ? 's' : ''}
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="space-y-4">
          <div className="space-y-2">
            {section.endpoints.length === 0 ? (
              <p className="text-sm text-gray-500 italic px-1">
                Aucun endpoint dans cette catégorie pour la spécification OpenAPI chargée.
              </p>
            ) : (
              section.endpoints.map((ep, i) => <EndpointCard key={`${ep.method}-${ep.path}-${i}`} ep={ep} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ApiDocumentation() {
  const base = useMemo(() => getApiBase(), []);
  const [activeSection, setActiveSection] = useState<GroupId>('auth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openapiUrl, setOpenapiUrl] = useState<string | null>(null);
  const [apiVersion, setApiVersion] = useState<string>('');
  const [sections, setSections] = useState<ApiDocSection[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { spec, url } = await fetchOpenApiJson(base);
      setOpenapiUrl(url);
      setApiVersion(typeof spec.info === 'object' && spec.info && 'version' in spec.info ? String(spec.info.version) : '');
      setSections(buildSectionsFromOpenApi(spec));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setOpenapiUrl(null);
      setSections(buildSectionsFromOpenApi({ openapi: '3.1.0', info: { title: '', version: '' }, paths: {} }));
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  const displaySections: ApiDocSection[] = useMemo(
    () =>
      GROUP_ORDER.map(id => {
        const s = sections.find(x => x.id === id);
        return (
          s ?? {
            id,
            title: id,
            color: 'from-gray-500 to-gray-700',
            endpoints: [],
          }
        );
      }),
    [sections]
  );

  const swaggerHref = `${base}/docs`;
  const openapiHref = openapiUrl ?? `${base}/openapi.json`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-rose-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <LauraLogoMark size="xs" tone="onDark" aria-hidden />
                <span className="text-sm font-semibold opacity-90">Laura AI Platform</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">Documentation API</h1>
              <p className="text-blue-100 text-sm">
                Générée depuis OpenAPI (FastAPI){apiVersion ? ` · v${apiVersion}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <a
                href={swaggerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-white/30"
              >
                Swagger UI <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={openapiHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-white/30"
              >
                OpenAPI JSON <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-white/30 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Actualiser
              </button>
            </div>
          </div>

          <div className="mt-6 bg-black/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-white/20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white/60 text-xs flex-shrink-0">Base API</span>
              <code className="text-white font-mono text-sm truncate">{base}</code>
            </div>
            <CopyButton text={base} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold mb-1">Impossible de charger OpenAPI</p>
            <p className="text-red-700">{error}</p>
            <p className="mt-2 text-xs text-red-600">
              Démarrez le backend ({base}) ou définissez <code className="bg-red-100 px-1 rounded">VITE_API_URL</code>{' '}
              pour pointer vers l’API. Les sections ci-dessous restent visibles (vides) pour la navigation.
            </p>
          </div>
        )}

        {loading && !error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement de la spécification OpenAPI…
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-4 space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">Navigation</p>
              {displaySections.map(s => {
                const NavIcon = GROUP_ICONS[s.id as GroupId] ?? Lock;
                return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id as GroupId)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeSection === s.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="w-4 h-4 flex-shrink-0 text-gray-400">
                    <NavIcon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{s.title}</span>
                  <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{s.endpoints.length}</span>
                </a>
              );
              })}

              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Rôles (indicatif)</p>
                <div className="space-y-1 px-2">
                  {[
                    { key: 'public', label: '🌐 Public' },
                    { key: 'patient', label: '🔵 Patient' },
                    { key: 'radiologist', label: '🟣 Radiologue' },
                    { key: 'admin', label: '🔴 Admin' },
                    { key: 'any', label: '🟢 Authentifié' },
                  ].map(r => (
                    <span key={r.key} className={`block px-2 py-1 rounded-md text-xs font-medium ${AUTH_COLORS[r.key]}`}>
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0 space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">🔐</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Authentification</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  JWT · en-tête{' '}
                  <code className="text-gray-700 bg-gray-100 px-1 rounded">Authorization: Bearer {'<token>'}</code> ·
                  schémas exacts dans Swagger UI.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Sécurité & HDS</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  TLS · hébergement conforme · données de santé — voir la documentation produit.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-2">📄</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Source de vérité</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cette page regroupe les routes par domaine ; corps et réponses détaillés viennent du schéma OpenAPI.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Codes d&apos;erreur (FastAPI)
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { code: 200, label: 'OK', desc: 'Succès' },
                  { code: 201, label: 'Created', desc: 'Ressource créée' },
                  { code: 400, label: 'Bad Request', desc: 'Requête invalide' },
                  { code: 401, label: 'Unauthorized', desc: 'Non authentifié' },
                  { code: 403, label: 'Forbidden', desc: 'Interdit' },
                  { code: 404, label: 'Not Found', desc: 'Introuvable' },
                  { code: 409, label: 'Conflict', desc: 'Conflit' },
                  { code: 422, label: 'Validation', desc: 'Erreur de validation (schéma)' },
                  { code: 429, label: 'Too Many Requests', desc: 'Limite / quota' },
                  { code: 500, label: 'Server Error', desc: 'Erreur serveur' },
                ].map(e => (
                  <div key={e.code} className="flex items-center gap-2.5 py-1.5">
                    <StatusCode code={e.code} />
                    <span className="font-mono text-xs text-gray-500">{e.label}</span>
                    <span className="text-xs text-gray-400">— {e.desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Format d&apos;erreur courant</p>
                <CodeBlock
                  code={`{
  "detail": "Message lisible ou objet d'erreur selon la route"
}`}
                  lang="json"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h2 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Notes
              </h2>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                  <span>
                    Les groupes <strong>AUTH</strong>, <strong>SCAN IA</strong>, <strong>PATIENT DOCUMENTS</strong>,{' '}
                    <strong>PARTAGE</strong>, <strong>RADIOLOGUE DICOM</strong>, <strong>PACS</strong>,{' '}
                    <strong>CABINET</strong>, <strong>ADMIN</strong>, <strong>RGPD</strong> et <strong>JOBS</strong> sont
                    dérivés des chemins OpenAPI (<code className="bg-blue-100 px-1 rounded">/api/…</code>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                  <span>
                    Pour une exploration interactive (essai des requêtes), ouvrir{' '}
                    <a href={swaggerHref} className="underline font-medium" target="_blank" rel="noopener noreferrer">
                      Swagger UI
                    </a>
                    .
                  </span>
                </li>
              </ul>
            </div>

            {displaySections.map(s => (
              <Section key={s.id} section={s} />
            ))}

            <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-600">Laura AI — Documentation API</p>
              <p>
                {openapiUrl ? (
                  <>
                    Spécification :{' '}
                    <a href={openapiHref} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {openapiUrl}
                    </a>
                  </>
                ) : (
                  'OpenAPI non chargée'
                )}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> HDS France
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-500" /> RGPD
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-500" /> REST / JSON
                </span>
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-gray-400" /> OpenAPI 3
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
