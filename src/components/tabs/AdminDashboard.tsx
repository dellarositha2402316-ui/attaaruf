import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, StudentSubmission } from '../../types';
import {
  Users,
  Award,
  BookOpen,
  Mic,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { getAllStudents, getAllSubmissions, deleteStudent, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'students' | 'submissions'>('students');

  const students = getAllStudents();
  const submissions = getAllSubmissions();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const totalPractices = submissions.length;
  const avgClassScore =
    students.length > 0
      ? Math.round(
          students.reduce((acc, curr) => acc + (curr.stats.averageScore || 0), 0) /
            students.length
        )
      : 0;

  const passedCount = students.filter((s) => (s.stats.averageScore || 0) >= 75).length;
  const passRate = students.length > 0 ? Math.round((passedCount / students.length) * 100) : 0;

  // Export gradebook to CSV format
  const exportToCSV = () => {
    const headers = ['No', 'Nama Siswa', 'Kelas', 'Madrasah', 'Latihan Bicara', 'Rata-rata Nilai', 'Kuis', 'Status KKM'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.displayName}"`,
      `"${s.className || 'Kelas 7'}"`,
      `"${s.school || 'MTs'}"`,
      s.stats.totalSpeakingPractices,
      s.stats.averageScore,
      s.stats.quizScore,
      s.stats.averageScore >= 75 ? 'TUNTAS' : 'REMIDIAL',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Nilai_Kalam_Kelas7_Kemenag_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Admin Identification */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-400/30">
              <ShieldCheck size={14} />
              <span>Portal Guru Pengampu • Akun: laladmin</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              لوحة التحكم والمتابعة • Rekap Nilai Siswa Kelas 7
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Pantau perkembangan keterampilan berbicara (Maharah Kalam) santri/siswa, rekap rekaman suara tugas, dan ekspor laporan resmi penilaian.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
              title="Ekspor CSV"
            >
              <FileSpreadsheet size={16} />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer border border-white/20"
              title="Cetak Laporan"
            >
              <Printer size={16} />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* Analytics Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400">Total Siswa Terdaftar</div>
            <div className="text-2xl font-bold text-white mt-1">{students.length}</div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400">Rata-rata Nilai Kalam</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{avgClassScore}</div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400">Ketuntasan KKM (≥75)</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{passRate}%</div>
          </div>
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400">Total Sesi Rekaman</div>
            <div className="text-2xl font-bold text-teal-300 mt-1">{totalPractices}</div>
          </div>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setViewTab('students')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              viewTab === 'students'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={16} />
            <span>Buku Nilai Siswa ({students.length})</span>
          </button>
          <button
            onClick={() => setViewTab('submissions')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              viewTab === 'submissions'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic size={16} />
            <span>Log Rekaman Tugas ({submissions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Class filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kelas</option>
            <option value="Kelas 7A">Kelas 7A</option>
            <option value="Kelas 7B">Kelas 7B</option>
            <option value="Kelas 7C">Kelas 7C</option>
          </select>

          {/* Search input */}
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table: STUDENTS */}
      {viewTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Siswa / Santri</th>
                  <th className="py-3.5 px-4">Kelas & Madrasah</th>
                  <th className="py-3.5 px-4 text-center">Latihan Kalam</th>
                  <th className="py-3.5 px-4 text-center">Mufrodat</th>
                  <th className="py-3.5 px-4 text-center">Rata-rata Nilai</th>
                  <th className="py-3.5 px-4 text-center">Nilai Kuis</th>
                  <th className="py-3.5 px-4 text-center">Status KKM</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const isPassing = (s.stats.averageScore || 0) >= 75;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              s.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{s.displayName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              @{s.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class & School */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">
                          {s.className || 'Kelas 7'}
                        </div>
                        <div className="text-[11px] text-slate-400">{s.school || 'MTs'}</div>
                      </td>

                      {/* Practices count */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {s.stats.totalSpeakingPractices}x
                      </td>

                      {/* Mastered Vocab */}
                      <td className="py-3.5 px-4 text-center text-slate-600">
                        {s.stats.vocabMastered || 0} kata
                      </td>

                      {/* Average Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-base text-emerald-700">
                          {s.stats.averageScore}
                        </span>
                      </td>

                      {/* Quiz Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-700">
                          {s.stats.quizScore || 0}
                        </span>
                      </td>

                      {/* Status KKM */}
                      <td className="py-3.5 px-4 text-center">
                        {isPassing ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 size={12} />
                            <span>TUNTAS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                            <span>REMIDIAL</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {s.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => deleteStudent(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Data Siswa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Table: SUBMISSIONS LOG */}
      {viewTab === 'submissions' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Belum ada rekaman tugas bicara yang dikirimkan. Siswa dapat merekam suara di tab "Misi Berbicara".
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 sm:p-5 hover:bg-slate-50 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">
                        {sub.studentName}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        • {sub.missionTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {sub.evaluation.grade} ({sub.evaluation.score}/100)
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(sub.createdAt).toLocaleDateString('id-ID')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-400 block mb-1">Transkrip Ucapan Siswa:</span>
                    <p className="font-arabic text-xl font-bold text-slate-900 text-right leading-relaxed" dir="rtl">
                      {sub.spokenText}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    Catatan AI: "{sub.evaluation.indonesianFeedback}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
