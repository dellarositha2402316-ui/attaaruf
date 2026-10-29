import React, { useState } from 'react';
import { SPEAKING_MISSIONS } from '../../data/kemenagData';
import { SpeakingMission, SpeechEvaluationResult } from '../../types';
import { SpeechRecorder } from '../SpeechRecorder';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { evaluateSpeechAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  Award,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  BookOpen,
  Volume2,
  ArrowRight,
  Check,
  Clock,
} from 'lucide-react';

export const MissionsTab: React.FC = () => {
  const { currentUser, saveSubmission, getAllSubmissions } = useAuth();
  const [selectedMission, setSelectedMission] = useState<SpeakingMission>(SPEAKING_MISSIONS[0]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeechEvaluationResult | null>(null);

  const allSubmissions = getAllSubmissions();
  const mySubmissions = allSubmissions.filter((s) => s.userId === currentUser?.id);

  const handleEvaluate = async (spokenText: string) => {
    setIsEvaluating(true);
    try {
      const result = await evaluateSpeechAPI(
        spokenText,
        selectedMission.sampleSentence,
        `Tugas Maharah Kalam: ${selectedMission.title}`
      );
      setEvaluation(result);

      // Save submission for teacher gradebook
      saveSubmission({
        missionId: selectedMission.id,
        missionTitle: selectedMission.title,
        spokenText,
        evaluation: result,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              تَدْرِيْبَاتُ مَهَارَةِ الْكَلَامِ • Latihan Berbicara Mandiri
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              Misi Berbicara Bahasa Arab (At-Ta'aruf)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Selesaikan misi berbicara berikut dengan merekam suaramu. AI akan mengevaluasi kefasihan (fashahah), ketepatan tata bahasa (nahwu), dan makhraj huruf secara otomatis!
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {mySubmissions.length}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Tugas Terkirim</div>
              <div className="text-sm font-bold text-emerald-900">
                {mySubmissions.length} dari {SPEAKING_MISSIONS.length} Selesai
              </div>
            </div>
          </div>
        </div>

        {/* Mission Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          {SPEAKING_MISSIONS.map((m, idx) => {
            const isCompleted = mySubmissions.some((s) => s.missionId === m.id);
            const isCurrent = selectedMission.id === m.id;

            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMission(m);
                  setEvaluation(null);
                }}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-900/10'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isCurrent
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Level {m.level}
                  </span>
                  {isCompleted && (
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold ${
                        isCurrent ? 'text-amber-300' : 'text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      <span>Selesai</span>
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm mb-1">{m.title}</div>
                <div
                  className={`font-arabic text-lg font-bold text-right ${
                    isCurrent ? 'text-emerald-200' : 'text-emerald-800'
                  }`}
                  dir="rtl"
                >
                  {m.arabicTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Mission Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Instruction & Guidance */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Petunjuk Misi Berbicara
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {selectedMission.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {selectedMission.instruction}
              </p>
            </div>

            {/* Prompt Question */}
            {selectedMission.promptQuestion && (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Pertanyaan Lisan yang Harus Dijawab:
                </span>
                <p className="font-arabic text-2xl font-bold text-emerald-950 mt-1 mb-2" dir="rtl">
                  {selectedMission.promptQuestion}
                </p>
                <AudioPlayerButton
                  text={selectedMission.promptQuestion}
                  size="sm"
                  label="Dengarkan Pertanyaan"
                />
              </div>
            )}

            {/* Target Keywords */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Kosakata / Unsur yang Diharapkan Muncul:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedMission.targetKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="font-arabic font-bold text-sm px-3 py-1 bg-slate-100 text-slate-800 rounded-xl border border-slate-200"
                    dir="rtl"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Sample Reference Sentence */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Contoh Model Kalimat Fasih:</span>
                <AudioPlayerButton text={selectedMission.sampleSentence} size="sm" label="Dengar" />
              </div>
              <p className="font-arabic text-xl font-bold text-slate-900 text-right leading-relaxed" dir="rtl">
                {selectedMission.sampleSentence}
              </p>
              <p className="text-slate-500 italic">"{selectedMission.sampleTranslation}"</p>
            </div>
          </div>
        </div>

        {/* Right: Audio Recorder & AI Evaluation Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          <SpeechRecorder
            targetText={selectedMission.sampleSentence}
            isEvaluating={isEvaluating}
            onRecorded={handleEvaluate}
            placeholder="Tekan tombol mic, lalu rekam perkenalan lisanmu dalam bahasa Arab..."
          />

          {/* Evaluation Results Card */}
          {evaluation && (
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase">
                    Hasil Analisis AI Guru Bahasa Arab
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">
                    Nilai Keterampilan Bicara
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-700">
                    {evaluation.score}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold block">/ 100</span>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Fashahah</div>
                  <div className="text-lg font-bold text-emerald-800">
                    {evaluation.fashahahScore}
                  </div>
                  <div className="text-[10px] text-slate-400">Kefasihan</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Nahwu & Dhomir</div>
                  <div className="text-lg font-bold text-emerald-800">
                    {evaluation.nahwuScore}
                  </div>
                  <div className="text-[10px] text-slate-400">Tata Bahasa</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Makharijul Huruf</div>
                  <div className="text-lg font-bold text-emerald-800">
                    {evaluation.makhrajScore}
                  </div>
                  <div className="text-[10px] text-slate-400">Pelafalan Huruf</div>
                </div>
              </div>

              {/* Feedback text */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Catatan Evaluasi Guru:</strong> {evaluation.indonesianFeedback}
              </div>

              {/* Correction Tashih */}
              {evaluation.arabicCorrection && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Kalimat Koreksi / Penyempurna:</span>
                    <AudioPlayerButton text={evaluation.arabicCorrection} size="sm" label="Lafalkan" />
                  </div>
                  <p className="font-arabic text-2xl font-bold text-slate-900 text-right leading-relaxed" dir="rtl">
                    {evaluation.arabicCorrection}
                  </p>
                </div>
              )}

              {/* Praise */}
              {evaluation.praises && (
                <div className="text-center p-3 bg-amber-50 rounded-2xl border border-amber-200 font-arabic text-xl font-bold text-amber-900" dir="rtl">
                  ✨ {evaluation.praises} ✨
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
