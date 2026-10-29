import React, { useState } from 'react';
import { TARKIB_SUMMARY } from '../../data/kemenagData';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { askTutorAPI, AskTutorResponse } from '../../services/apiService';
import {
  Layers,
  HelpCircle,
  Sparkles,
  BookOpen,
  Send,
  Volume2,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

export const TarkibTab: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [tutorAnswer, setTutorAnswer] = useState<AskTutorResponse | null>(null);

  const handleAskTutor = async (qText?: string) => {
    const q = (qText || question).trim();
    if (!q || isAsking) return;

    setIsAsking(true);
    try {
      const res = await askTutorAPI(q);
      setTutorAnswer(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = [
    'Kapan menggunakan هٰذَا dan kapan هٰذِهِ dalam perkenalan?',
    'Apa perbedaan pengucapan أَنْتَ dan أَنْتِ?',
    'Bagaimana memperkenalkan teman perempuan dalam bahasa Arab?',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/15">
          التَّرَاكِيْبُ وَالْقَوَاعِدُ • Kaidah Tata Bahasa Lisan
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-2">
          Pola Kalimat At-Ta'aruf (Dhomir & Isim Isyarah)
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Kuasai kaidah penggunaan Kata Ganti (الضمائر) dan Kata Tunjuk (أسماء الإشارة) agar kalimat perkenalan lisanmu fasih dan tepat kaidah Nahwu sesuai buku Kemenag Kelas 7.
        </p>
      </div>

      {/* Grammar Cards */}
      <div className="space-y-6">
        {TARKIB_SUMMARY.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs"
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
              <p className="text-xs text-slate-500">{section.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {section.rules.map((rule, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-4 border border-slate-200 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-arabic text-3xl font-bold text-emerald-900" dir="rtl">
                        {rule.arabic}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        ({rule.latin})
                      </span>
                    </div>

                    <AudioPlayerButton text={rule.example} size="sm" label="Lafalkan" />
                  </div>

                  <div className="text-xs text-slate-600 mb-2">
                    <strong>Fungsi:</strong> {rule.usage}
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      Contoh Kalimat Kalam:
                    </div>
                    <div className="font-arabic text-xl font-bold text-slate-900 text-right" dir="rtl">
                      {rule.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ask Virtual Arabic Teacher (Ustadz AI) */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sparkles size={20} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Tanya Guru Virtual: Konsultasi Kaidah Bahasa
            </h3>
            <p className="text-xs text-slate-500">
              Punya kesulitan tentang Dhomir, Isim Isyarah, atau kaidah berbicara lainnya? Tanyakan langsung di sini!
            </p>
          </div>
        </div>

        {/* Quick questions chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuestion(sq);
                handleAskTutor(sq);
              }}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              💬 {sq}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskTutor();
            }}
            placeholder="Ketik pertanyaan seputar materi At-Ta'aruf..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => handleAskTutor()}
            disabled={!question.trim() || isAsking}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isAsking ? 'Menjawab...' : 'Tanyakan'}
            <Send size={14} />
          </button>
        </div>

        {/* Answer Display */}
        {tutorAnswer && (
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-3 mt-4 text-xs sm:text-sm">
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              <span>Penjelasan Guru Bahasa Arab:</span>
            </div>
            <p className="text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-emerald-100">
              {tutorAnswer.explanation}
            </p>

            {tutorAnswer.arabicExamples && tutorAnswer.arabicExamples.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-semibold text-emerald-900 text-xs">
                  Contoh Kalimat Penggunaan:
                </span>
                <div className="space-y-1">
                  {tutorAnswer.arabicExamples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center justify-between"
                    >
                      <AudioPlayerButton text={ex} size="sm" />
                      <span className="font-arabic text-xl font-bold text-slate-900" dir="rtl">
                        {ex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tutorAnswer.kalamTip && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                💡 <strong>Tips Maharah Kalam:</strong> {tutorAnswer.kalamTip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
