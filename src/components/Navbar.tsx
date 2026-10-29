import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  MessageSquare,
  Bot,
  Mic,
  Award,
  HelpCircle,
  ShieldAlert,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isAdmin, logout } = useAuth();

  const navItems = [
    {
      id: 'vocab',
      label: 'المفردات والتحيات',
      sublabel: 'Kosakata & Lafal',
      icon: BookOpen,
    },
    {
      id: 'dialogue',
      label: 'الحوارات النموذجية',
      sublabel: 'Roleplay Percakapan',
      icon: MessageSquare,
    },
    {
      id: 'speaking-lab',
      label: 'مختبر المحادثة الذكي',
      sublabel: 'AI Speaking Partner',
      icon: Bot,
      badge: 'AI',
    },
    {
      id: 'missions',
      label: 'تدريبات الكلام',
      sublabel: 'Misi Berbicara',
      icon: Mic,
    },
    {
      id: 'tarkib',
      label: 'التراكيب والقواعد',
      sublabel: 'Dhomir & Isyarah',
      icon: Layers,
    },
    {
      id: 'quiz',
      label: 'اختبار مهارة الكلام',
      sublabel: 'Kuis & Evaluasi',
      icon: HelpCircle,
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'لوحة التحكم',
      sublabel: 'Admin Dashboard',
      icon: ShieldAlert,
      badge: 'Guru',
    });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar: Brand, User Info & Logout Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Curriculum Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <span className="font-arabic text-2xl font-bold leading-none">ك</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arabic text-xl sm:text-2xl font-bold text-emerald-900 leading-tight">
                  كَلَامُنَا
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Kalamuna
                </span>
                <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  Kelas 7 MTs • Kemenag
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Maharah Kalam Interaktif Bab 1: At-Ta'aruf (التعارف)
              </p>
            </div>
          </div>

          {/* User Profile & Logout Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {currentUser && (
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 sm:px-3 sm:py-2">
                <img
                  src={
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/30"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.displayName}</span>
                    {isAdmin ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        ADMIN
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        {currentUser.className || 'Kelas 7'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{currentUser.school || 'MTs'}</div>
                </div>
              </div>
            )}

            {/* Prominent Mandatory Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              title="Keluar dari akun (Logout)"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                <div className="text-left">
                  <div className="font-arabic font-bold text-xs" dir="rtl">
                    {item.label}
                  </div>
                  <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.sublabel}
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      isActive
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
