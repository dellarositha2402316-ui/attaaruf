import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShieldCheck, UserCheck, Sparkles, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginAdmin, loginGoogle, loginStudent } = useAuth();
  const [tab, setTab] = useState<'student' | 'admin'>('student');

  // Student quick form
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('Kelas 7A');
  const [schoolName, setSchoolName] = useState('MTs Negeri 1');

  // Admin form
  const [adminUsername, setAdminUsername] = useState('laladmin');
  const [adminPassword, setAdminPassword] = useState('11lala04');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setIsLoading(true);
    try {
      await loginStudent(studentName.trim(), className, schoolName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsLoading(true);
    try {
      const res = await loginAdmin(adminUsername, adminPassword);
      if (!res.success) {
        setAdminError(res.error || 'Login gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-8">
        {/* Islamic Geometric & Gradient Header Banner */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl"></div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-emerald-200 text-xs font-semibold tracking-wide uppercase mb-3 border border-white/15">
            <Sparkles size={14} className="text-amber-300" />
            <span>Kemenag RI • Kurikulum Madrasah</span>
          </div>

          <h2 className="font-arabic text-4xl font-bold mb-1 tracking-wide" dir="rtl">
            كَلَامُنَا • التَّعَارُفُ
          </h2>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Kalamuna: Maharah Kalam Kelas 7
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-sm mx-auto leading-relaxed">
            Media Pembelajaran Interaktif Keterampilan Berbicara Bahasa Arab Materi At-Ta'aruf (Perkenalan)
          </p>
        </div>

        {/* Auth Role Selector Tabs */}
        <div className="p-6 sm:p-8">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('student');
                setAdminError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'student'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={18} />
              <span>Login Siswa / Santri</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('admin');
                setAdminError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'admin'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Login Guru / Admin</span>
            </button>
          </div>

          {/* STUDENT TAB */}
          {tab === 'student' && (
            <div className="space-y-4">
              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk Cepat dengan Akun Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                  atau masuk manual siswa
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              {/* Student Manual Quick Form */}
              <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa / Siswi
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Muhammad Azzam Fathoni"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kelas
                    </label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                    >
                      <option value="Kelas 7A">Kelas 7A</option>
                      <option value="Kelas 7B">Kelas 7B</option>
                      <option value="Kelas 7C">Kelas 7C</option>
                      <option value="Kelas 7D">Kelas 7D</option>
                      <option value="Kelas 7 Unggulan">Kelas 7 Unggulan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Madrasah / Sekolah
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="MTs Negeri 1"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !studentName.trim()}
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Mulai Belajar Maharah Kalam</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* ADMIN TAB */}
          {tab === 'admin' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <KeyRound size={14} className="text-amber-700" />
                  <span>Kredensial Akun Admin Guru:</span>
                </div>
                <div className="font-mono text-[13px] bg-white/80 p-2 rounded-lg border border-amber-200 mt-1">
                  <div>Username: <strong className="text-emerald-700 font-bold">laladmin</strong></div>
                  <div>Password: <strong className="text-emerald-700 font-bold">11lala04</strong></div>
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Admin
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="laladmin"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Admin
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck size={18} />
                  <span>Masuk Sebagai Admin / Guru</span>
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Kementerian Agama Republik Indonesia • Madrasah Tsanawiyah
          </div>
        </div>
      </div>
    </div>
  );
};
