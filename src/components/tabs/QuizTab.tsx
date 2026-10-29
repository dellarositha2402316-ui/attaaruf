import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../../data/kemenagData';
import { QuizQuestion } from '../../types';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck,
  Printer,
} from 'lucide-react';

export const QuizTab: React.FC = () => {
  const { currentUser, updateUserStats } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: opt,
    }));
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);
    updateUserStats({ quizScore: finalScore });
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(null);
    setCurrentIdx(0);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            اخْتِبَارُ التَّعَارُفِ • Kuis Evaluasi Kalam & Fahmul Masmu'
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
            Uji Pemahaman Materi At-Ta'aruf
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kerjakan 5 butir soal interaktif untuk menguji penguasaan sapaan, dhomir, dan ungkapan perkenalan lisan. KKM: 75.
          </p>
        </div>

        {score !== null && (
          <div className="text-center px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-xs text-slate-500 font-semibold">Skor Akhir</span>
            <div className="text-3xl font-black text-emerald-800">{score}</div>
          </div>
        )}
      </div>

      {!isSubmitted ? (
        /* Question Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Pertanyaan {currentIdx + 1} dari {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round(((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
              {currentQ.question}
            </h3>

            {currentQ.arabicQuestion && (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between gap-3">
                <AudioPlayerButton text={currentQ.arabicQuestion} size="sm" label="Lafalkan" />
                <span className="font-arabic text-2xl font-bold text-emerald-950 text-right" dir="rtl">
                  {currentQ.arabicQuestion}
                </span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options?.map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt;
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="text-sm text-slate-800 font-arabic font-bold text-lg" dir="rtl">
                      {opt}
                    </span>
                  </div>

                  <AudioPlayerButton text={opt} size="sm" />
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              ← Sebelumnya
            </button>

            {currentIdx < QUIZ_QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedAnswers[currentQ.id]}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40"
              >
                Selanjutnya →
              </button>
            ) : (
              <button
                type="button"
                onClick={calculateScore}
                disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-40"
              >
                Selesaikan Kuis & Lihat Nilai
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results & Certificate Screen */
        <div className="space-y-6">
          {/* Result Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl shadow-xs">
              {score! >= 75 ? '🏆' : '📖'}
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {score! >= 75
                ? 'Mumtaz! Kamu Lulus Ujian Maharah Kalam'
                : 'Terus Semangat Berlatih! Tingkatkan Latihan Lisan'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {score! >= 75
                ? `Selamat ${currentUser?.displayName}, kamu berhasil menguasai materi At-Ta'aruf dengan nilai ${score}/100 di atas KKM!`
                : `Nilai kamu adalah ${score}/100. Pelajari kembali materi Dhomir dan ungkapan sapaan lalu ulangi kuis.`}
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs"
              >
                <RotateCcw size={16} />
                <span>Ulangi Kuis</span>
              </button>
            </div>
          </div>

          {/* Certificate of Achievement if Passed */}
          {score! >= 75 && (
            <div className="bg-gradient-to-br from-amber-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border-4 border-double border-amber-300 text-center relative shadow-md">
              <div className="text-amber-800 text-xs font-bold uppercase tracking-widest mb-1">
                KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </div>
              <div className="font-arabic text-3xl font-bold text-emerald-900 mb-2" dir="rtl">
                شَهَادَةُ كَفَاءَةِ مَهَارَةِ الْكَلَامِ
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-4">
                Sertifikat Kemahiran Berbicara Bahasa Arab (At-Ta'aruf)
              </h4>

              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Diberikan kepada siswa:
              </p>
              <div className="text-2xl font-black text-emerald-900 my-2">
                {currentUser?.displayName || 'Siswa MTs'}
              </div>
              <div className="text-xs font-semibold text-slate-600 mb-4">
                {currentUser?.className || 'Kelas 7'} • {currentUser?.school || 'Madrasah Tsanawiyah'}
              </div>

              <div className="inline-block bg-white/80 backdrop-blur-xs px-6 py-2 rounded-2xl border border-amber-300 shadow-xs mb-4">
                <span className="text-xs text-slate-500 block">Predikat Kelulusan:</span>
                <span className="font-arabic text-xl font-bold text-emerald-800">
                  {score! >= 90 ? 'مُمْتَازٌ (Sangat Memuaskan)' : 'جَيِّدٌ جِدًّا (Baik Sekali)'}
                </span>
                <span className="text-xs font-bold text-slate-700 ml-2">({score}/100)</span>
              </div>

              <div className="text-[11px] text-slate-400 mt-4">
                Kalamuna Edu-Platform • Tanggal: {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          )}

          {/* Question Review Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Pembahasan Kunci Jawaban:</h4>
            <div className="space-y-3">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                      isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                          <CheckCircle2 size={16} /> Benar
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1 text-xs">
                          <XCircle size={16} /> Salah
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600">
                      Jawabanmu: <strong className="font-arabic text-base">{userAns || '-'}</strong>
                    </div>
                    {!isCorrect && (
                      <div className="text-xs text-emerald-800">
                        Jawaban benar: <strong className="font-arabic text-base">{q.correctAnswer}</strong>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                      💡 {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
