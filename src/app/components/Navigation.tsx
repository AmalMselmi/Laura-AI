import { Heart, LayoutDashboard, FileText, Calendar, BookHeart, FileImage, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

type Page = 'dashboard' | 'records' | 'appointments' | 'carnet' | 'dicom';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function Navigation({ currentPage, onNavigate, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { id: 'records' as Page, label: 'Dossier médical', icon: <FileText size={20} /> },
    { id: 'appointments' as Page, label: 'Rendez-vous', icon: <Calendar size={20} /> },
    { id: 'carnet' as Page, label: 'Carnet de santé', icon: <BookHeart size={20} /> },
    { id: 'dicom' as Page, label: 'Imagerie DICOM', icon: <FileImage size={20} /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-[var(--color-border)] fixed left-0 top-0 h-screen">
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Heart className="text-white" size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-primary)]">Laura</span>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--color-text-light)] hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--color-border)] space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-light)] hover:bg-gray-50 transition-colors">
            <User size={20} />
            <span>Mon profil</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-light)] hover:bg-gray-50 transition-colors">
            <Settings size={20} />
            <span>Paramètres</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-[var(--color-border)] z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
              <Heart className="text-white" size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-[var(--color-primary)]">Laura</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-[var(--color-border)] shadow-lg">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentPage === item.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-light)] hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="border-t border-[var(--color-border)] my-2 pt-2 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-light)] hover:bg-gray-50 transition-colors">
                  <User size={20} />
                  <span>Mon profil</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--color-text-light)] hover:bg-gray-50 transition-colors">
                  <Settings size={20} />
                  <span>Paramètres</span>
                </button>
                <button 
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
