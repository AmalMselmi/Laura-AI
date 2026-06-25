import { Outlet, NavLink, useNavigate, Navigate } from 'react-router';
import { getDashboardPath, useAuth } from '../context/AuthContext';
import { FolderOpen, Home, Settings, LogOut } from 'lucide-react';
import { LauraLogoMark } from '../components/brand/LauraLogoMark';

const navItems = [
  { to: '/radiologist/home', label: 'Accueil', shortLabel: 'Accueil', icon: Home },
  { to: '/radiologist/folders', label: 'Dossiers DICOM', shortLabel: 'DICOM', icon: FolderOpen },
  { to: '/radiologist/account', label: 'Mon compte', shortLabel: 'Compte', icon: Settings },
];

export function RadiologistLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'radiologist') return <Navigate to={getDashboardPath(user.role)} replace />;

  const handleLogout = async () => { await logout(); navigate('/'); };
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen min-w-0 bg-[#f9fafb]">

      {/* ─── SIDEBAR desktop — Figma 1:8843 / 1:8966 ───────────────── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-[#e5e7eb] bg-white md:flex">
        <div className="border-b border-[#f3f4f6] px-5 py-6">
          <NavLink to="/radiologist/home" className="flex items-center gap-3">
            <LauraLogoMark size="md" tone="radiologist" aria-hidden />
            <div>
              <p className="bg-gradient-to-r from-[#155dfc] to-[#ad46ff] bg-clip-text font-bold text-transparent">
                Laura AI
              </p>
              <p className="text-xs text-[#99a1af]">Radiologue Pro</p>
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#155dfc] to-[#ad46ff] text-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]'
                      : 'text-[#4a5565] hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-[#f3f4f6] px-3 py-4">
          <p className="px-2 pb-1 text-xs text-[#99a1af]">🔒 HDS certifié · AES-256 · RGPD Art. 9</p>
          <div className="flex items-center gap-3 rounded-xl border border-[#ede9fe] bg-[#faf5ff] px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#9810fa] text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">Radiologue</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f9fafb] md:ml-64">

        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white shadow-sm md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <LauraLogoMark size="xs" tone="radiologist" aria-hidden />
              <div>
                <span className="bg-gradient-to-r from-[#155dfc] to-[#ad46ff] bg-clip-text text-base font-bold text-transparent">
                  Laura AI
                </span>
                <span className="ml-1.5 text-xs text-gray-400">Radiologue</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#9810fa] text-xs font-bold text-white">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ─── BOTTOM NAV mobile ──────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.shortLabel}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        <div className="h-safe-bottom bg-white" />
      </nav>

    </div>
  );
}
