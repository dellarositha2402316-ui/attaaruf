import React, { useState } from 'react';
import { VOCABULARY_LIST } from '../../data/kemenagData';
import { VocabItem } from '../../types';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { SpeechRecorder } from '../SpeechRecorder';
import { evaluateSpeechAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Mic,
  Sparkles,
  CheckCircle2,
  Award,
  BookOpen,
  Volume2,
  X,
} from 'lucide-react';

export const VocabTab: React.FC = () => {
  const { updateUserStats, currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestWord, setActiveTestWord] = useState<VocabItem | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [masteredWords, setMasteredWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kalamuna_mastered_words');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = [
    { id: 'all', label: 'Semua Kosakata (الكل)' },
    { id: 'tahiyyat', label: 'التحيات (Salam & Sapaan)' },
    { id: 'mihnah', label: 'المهنة (Profesi & Identitas)' },
    { id: 'dhomir', label: 'الضمائر (Kata Ganti)' },
    { id: 'isyarah', label: 'أسماء الإشارة (Kata Tunjuk)' },
    { id: 'istifham', label: 'أدوات الاستفهام (Kata Tanya)' },
  ];

  const filteredVocab = VOCABULARY_LIST.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.arabic.includes(searchQuery) ||
      item.indonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phonetic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleTestEvaluation = async (spokenText: string) => {
    if (!activeTestWord) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateSpeechAPI(
        spokenText,
        activeTestWord.arabic,
        `Uji pelafalan mufrodat: ${activeTestWord.arabic} (${activeTestWord.indonesian})`
      );
      setTestResult(result);

      if (result.score >= 75) {
        if (!masteredWords.includes(activeTestWord.id)) {
          const updated = [...masteredWords, activeTestWord.id];
          setMasteredWords(updated);
          localStorage.setItem('kalamuna_mastered_words', JSON.stringify(updated));
          updateUserStats({ vocabMastered: updated.length });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Kemenag Learning Objectives */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/10">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-700/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            <span>Maharah Kalam • Pengucapan Mufrodat</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            المُفْرَدَاتُ وَالتَّحِيَّاتُ فِي التَّعَارُفِ
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-4">
            Dengarkan pelafalan fasih berharakat lengkap sesuai kaidah makharijul huruf buku Bahasa Arab MTs Kelas 7 Kemenag RI, lalu uji kemampuan bicaramu menggunakan AI!
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="bg-white/15 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-300" />
              <span>{VOCABULARY_LIST.length} Kosakata Pokok</span>
            </div>
            <div className="bg-white/15 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-300" />
              <span>{masteredWords.length} Telah Dikuasai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata atau arti..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocab.map((item) => {
          const isMastered = masteredWords.includes(item.id);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                isMastered ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header: Category Badge & Mastered Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                  {isMastered && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={12} />
                      <span>Fasih</span>
                    </span>
                  )}
                </div>

                {/* Arabic Text with Tasykil */}
                <div className="text-right my-2">
                  <p className="font-arabic text-3xl font-bold text-slate-900 leading-relaxed" dir="rtl">
                    {item.arabic}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium italic mt-1 font-mono">
                    {item.phonetic}
                  </p>
                </div>

                {/* Translation */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{item.indonesian}</p>
                </div>

                {/* Example in Context */}
                <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <p className="font-arabic text-base text-slate-800 text-right font-medium" dir="rtl">
                    {item.exampleSentence}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    "{item.exampleTranslation}"
                  </p>
                </div>
              </div>

              {/* Action Buttons: Listen & Practice Speaking */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <AudioPlayerButton text={item.arabic} size="sm" label="Dengar" />

                <button
                  type="button"
                  onClick={() => {
                    setActiveTestWord(item);
                    setTestResult(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 text-xs font-semibold rounded-xl transition cursor-pointer border border-amber-200"
                >
                  <Mic size={14} className="text-amber-700" />
                  <span>Uji Pelafalan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Speech Pronunciation Test Modal */}
      {activeTestWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 sm:p-7 overflow-hidden my-6">
            <button
              onClick={() => {
                setActiveTestWord(null);
                setTestResult(null);
              }}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase">
                Uji Pelafalan Lisan Maharah Kalam
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Lafalkan Kata Berikut:
              </h3>

              <div className="my-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 inline-block w-full">
                <p className="font-arabic text-4xl sm:text-5xl font-bold text-emerald-950" dir="rtl">
                  {activeTestWord.arabic}
                </p>
                <p className="text-emerald-700 text-sm font-medium italic mt-2 font-mono">
                  {activeTestWord.phonetic}
                </p>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">
                  Artinya: <strong>{activeTestWord.indonesian}</strong>
                </p>

                <div className="mt-3 flex justify-center">
                  <AudioPlayerButton text={activeTestWord.arabic} size="sm" label="Contoh Suara Fasih" />
                </div>
              </div>
            </div>

            {/* Microphone Recorder */}
            <SpeechRecorder
              targetText={activeTestWord.arabic}
              isEvaluating={isEvaluating}
              onRecorded={handleTestEvaluation}
              placeholder={`Tekan mic dan ucapkan "${activeTestWord.arabic}"`}
            />

            {/* AI Evaluation Feedback Card */}
            {testResult && (
              <div className="mt-5 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Award size={16} className="text-amber-500" />
                    <span>Hasil Penilaian AI</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-700">
                      {testResult.score}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {testResult.grade}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-slate-500">Fashahah</div>
                    <div className="font-bold text-emerald-700 text-sm">
                      {testResult.fashahahScore}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-slate-500">Makhraj</div>
                    <div className="font-bold text-emerald-700 text-sm">
                      {testResult.makhrajScore}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-slate-500">Nahwu</div>
                    <div className="font-bold text-emerald-700 text-sm">
                      {testResult.nahwuScore}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  {testResult.indonesianFeedback}
                </p>

                {testResult.pronunciationTips && (
                  <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    💡 <strong>Tips Makhraj:</strong> {testResult.pronunciationTips}
                  </div>
                )}

                <div className="text-center font-arabic text-lg text-emerald-800 font-bold" dir="rtl">
                  {testResult.praises}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
