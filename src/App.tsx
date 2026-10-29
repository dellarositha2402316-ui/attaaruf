import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { VocabTab } from './components/tabs/VocabTab';
import { DialogueTab } from './components/tabs/DialogueTab';
import { SpeakingLabTab } from './components/tabs/SpeakingLabTab';
import { MissionsTab } from './components/tabs/MissionsTab';
import { TarkibTab } from './components/tabs/TarkibTab';
import { QuizTab } from './components/tabs/QuizTab';
import { AdminDashboard } from './components/tabs/AdminDashboard';
import { Sparkles, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('vocab');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-pulse">
          <span className="font-arabic text-3xl font-bold">ك</span>
        </div>
        <h2 className="mt-4 text-emerald-300 font-bold text-lg">Memuat Kalamuna...</h2>
        <p className="text-slate-400 text-xs">Media Pembelajaran Maharah Kalam Kelas 7 MTs</p>
      </div>
    );
  }

  // Mandatory Login Gate: If no user is logged in, show LoginModal
  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Sticky Navbar with Logout button */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'vocab' && <VocabTab />}
        {activeTab === 'dialogue' && <DialogueTab />}
        {activeTab === 'speaking-lab' && <SpeakingLabTab />}
        {activeTab === 'missions' && <MissionsTab />}
        {activeTab === 'tarkib' && <TarkibTab />}
        {activeTab === 'quiz' && <QuizTab />}
        {activeTab === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-arabic font-bold text-emerald-800 text-sm">كَلَامُنَا</span>
            <span>• Pembelajaran Maharah Kalam Bahasa Arab MTs Kelas 7 Kemenag RI</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Didesain untuk Pembelajaran Interaktif Siswa Madrasah</span>
            <Sparkles size={12} className="text-amber-500" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
