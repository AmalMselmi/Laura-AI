import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Home, Shield } from 'lucide-react';
import { LauraLogoMark } from '../brand/LauraLogoMark';

interface LoginProps {
  onLogin: (email: string, password: string, role: 'patient' | 'radiologist') => Promise<void>;
  onSignUp: () => void;
  onBackToHome?: () => void;
}

type ApiHealth = {
  status: string;
  database?: string;
  users?: number;
  seedPatientPresent?: boolean;
  detail?: string;
};

function joinBasePath(base: string, path: string): string {
  const b = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** Relative paths to probe (order). Vite proxies `/api` and `/health` to the API in dev. */
function healthPathsForBase(base: string): string[] {
  if (base === '') return ['/api/health', '/health'];
  return ['/api/health', '/health'];
}

/** Bases to try (explicit API origin first in dev — avoids a noisy 404 on :5173 when the proxy is unused). */
function apiHealthBases(): string[] {
  const fromEnv =
    typeof import.meta.env.VITE_API_URL === 'string'
      ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '')
      : '';
  const out: string[] = [];
  const push = (b: string) => {
    if (!out.includes(b)) out.push(b);
  };
  if (fromEnv) {
    try {
      const envOrigin = new URL(fromEnv).origin;
      const here = typeof window !== 'undefined' ? window.location.origin : '';
      // Ignore VITE_API_URL if it points at the Vite UI itself (common mis-copy → endless 404 on :5173).
      if (!here || envOrigin !== here) push(fromEnv);
    } catch {
      push(fromEnv);
    }
  }
  if (import.meta.env.DEV) {
    // Same-origin ``/api`` last: refresh cookies for login still work best via the Vite proxy,
    // but the health probe does not need that; direct :8000 avoids DevTools 404 on localhost:5173.
    push('http://127.0.0.1:8000');
    push('http://localhost:8000');
    push('');
  } else if (!fromEnv) {
    push('http://127.0.0.1:8000');
    push('http://localhost:8000');
  }
  return out;
}

async function fetchApiHealth(): Promise<ApiHealth> {
  for (const base of apiHealthBases()) {
    for (const path of healthPathsForBase(base)) {
      const url = joinBasePath(base, path);
      try {
        const r = await fetch(url, { credentials: 'include' });
        if (!r.ok) continue;
        const body = (await r.json().catch(() => ({}))) as ApiHealth;
        if (typeof body.status === 'string') return body;
      } catch {
        /* try next path / base */
      }
    }
  }
  return { status: 'error', database: 'unreachable' };
}

export function Login({ onLogin, onSignUp, onBackToHome }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'radiologist'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);

  useEffect(() => {
    void fetchApiHealth().then(setApiHealth);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password, userType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </button>
        )}

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <LauraLogoMark size="lg" tone="brand" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Connexion à Laura</h1>
          <p className="text-sm sm:text-base text-gray-600">Accédez à votre dossier médical</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
          {apiHealth?.database === 'error' && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              Base de données inaccessible pour l’API. Vérifiez que Postgres tourne et que{' '}
              <code className="rounded bg-red-100 px-1">DATABASE_URL</code> pointe vers la bonne instance, puis relancez le backend.
              {apiHealth.detail ? ` (${apiHealth.detail})` : ''}
            </div>
          )}
          {apiHealth?.database === 'connected' && apiHealth.seedPatientPresent === false && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Aucun compte démo patient dans cette base (la connexion échouera). Depuis{' '}
              <code className="rounded bg-amber-100 px-1">backend/</code>, exécutez :{' '}
              <code className="rounded bg-amber-100 px-1">alembic upgrade head</code> sur la même base que l’API. Vérifiez aussi que Prisma utilise la même URL (
              <code className="rounded bg-amber-100 px-1">PRISMA_DATABASE_URL</code>).
            </div>
          )}
          {apiHealth?.database === 'unreachable' && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              Impossible de joindre l’API Laura sur le port 8000 (ou ce n’est pas le bon processus : 404 sur
              /api/health). Depuis le dossier <code className="rounded bg-red-100 px-1">backend/</code>, lancez :{' '}
              <code className="rounded bg-red-100 px-1">
                uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
              </code>
              , ou reconstruisez l’image Docker. Vérifiez aussi{' '}
              <code className="rounded bg-red-100 px-1">lsof -i :8000</code> qu’un autre service n’occupe pas le port.
            </div>
          )}

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                userType === 'patient'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setUserType('radiologist')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base ${
                userType === 'radiologist'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Radiologue
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.tn"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="login-remember" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="login-remember"
                  name="remember"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors font-medium"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Pas encore de compte ?{' '}
              <button onClick={onSignUp} className="text-blue-600 hover:text-blue-700 font-medium">
                S'inscrire
              </button>
            </p>
          </div>
        </div>

        {/* Admin access link */}
        <div className="mt-4 text-center">
          <a
            href="/admin-login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            Accès espace administrateur
          </a>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Connexion sécurisée SSL · Données cryptées · Conformité RGPD
          </p>
        </div>
      </div>
    </div>
  );
}