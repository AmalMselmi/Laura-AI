import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router';
import { getDashboardPath, useAuth } from '../context/AuthContext';
import { Shield, BarChart2, Users, Package, HardDrive, LogOut, Menu } from 'lucide-react';
import { LauraLogoMark } from '../components/brand/LauraLogoMark';

const navItems = [
  { to: '/admin/overview', label: "Vue d'ensemble", icon: BarChart2 },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/plans', label: 'Offres & Quotas', icon: Package },
  { to: '/admin/storage', label: 'Stockage', icon: HardDrive },
  { to: '/admin/gdpr', label: 'RGPD', icon: Shield },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/admin-login" replace />;
  if (user.role !== 'admin') return <Navigate to={getDashboardPath(user.role)} replace />;

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex min-w-0">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
        flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="px-5 py-6 border-b border-gray-100">
          <NavLink to="/admin/overview" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
            <LauraLogoMark size="md" tone="admin" className="rounded-xl" aria-hidden />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900">Laura AI</p>
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded font-medium">ADMIN</span>
              </div>
              <p className="text-xs text-gray-400">Super Administration</p>
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-400 px-2 pb-1">🔒 Session non persistante · Accès journalisé</p>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">SA</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">Super Administrateur</p>
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

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <LauraLogoMark size="xs" tone="admin" aria-hidden />
            <span className="font-bold text-gray-900 text-sm">Laura AI</span>
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded font-medium">ADMIN</span>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">SA</div>
        </header>

        <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
