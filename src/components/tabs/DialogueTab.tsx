import React, { useState } from 'react';
import { DIALOGUES } from '../../data/kemenagData';
import { Dialogue, DialogueLine } from '../../types';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { SpeechRecorder } from '../SpeechRecorder';
import { evaluateSpeechAPI } from '../../services/apiService';
import { speechService } from '../../services/speechService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Mic,
} from 'lucide-react';

export const DialogueTab: React.FC = () => {
  const { updateUserStats, currentUser } = useAuth();
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue>(DIALOGUES[0]);
  const [userRole, setUserRole] = useState<'none' | 'charA' | 'charB'>('none');
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [practicingLine, setPracticingLine] = useState<DialogueLine | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [lineEvaluation, setLineEvaluation] = useState<any | null>(null);

  // Play dialogue sequentially line-by-line
  const playFullDialogue = () => {
    if (isPlayingAll) {
      speechService.stopSpeaking();
      setIsPlayingAll(false);
      setActiveLineIdx(-1);
      return;
    }

    setIsPlayingAll(true);
    let currentIdx = 0;

    const playNext = () => {
      if (currentIdx >= selectedDialogue.lines.length) {
        setIsPlayingAll(false);
        setActiveLineIdx(-1);
        return;
      }

      setActiveLineIdx(currentIdx);
      const line = selectedDialogue.lines[currentIdx];
      speechService.speak(
        line.arabic,
        () => {
          currentIdx++;
          setTimeout(playNext, 600);
        },
        0.85
      );
    };

    playNext();
  };

  const handlePracticeLine = async (spokenText: string) => {
    if (!practicingLine) return;
    setEvaluating(true);
    try {
      const res = await evaluateSpeechAPI(
        spokenText,
        practicingLine.arabic,
        `Percakapan ${selectedDialogue.title} peran ${practicingLine.speaker}`
      );
      setLineEvaluation(res);
      if (res.score >= 75) {
        updateUserStats({ dialoguesCompleted: (currentUser?.stats.dialoguesCompleted || 0) + 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dialogue Selection Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            الحِوَارَاتُ النَّمُوذَجِيَّةُ • Percakapan Teladan
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">
            Praktik Percakapan Maharah Kalam
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pilihlah model percakapan buku Kemenag RI, dengarkan pelafalan aslinya, atau coba mode bermain peran (Roleplay)!
          </p>
        </div>

        {/* Dialogue Switcher */}
        <div className="flex gap-2 w-full md:w-auto">
          {DIALOGUES.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDialogue(d);
                setUserRole('none');
                setActiveLineIdx(-1);
                setPracticingLine(null);
                setLineEvaluation(null);
              }}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                selectedDialogue.id === d.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={16} />
              <span>{d.title.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Roleplay Mode & Controls Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-arabic text-2xl sm:text-3xl font-bold mb-1" dir="rtl">
              {selectedDialogue.arabicTitle}
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm">
              {selectedDialogue.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={playFullDialogue}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                isPlayingAll
                  ? 'bg-amber-500 text-slate-900 animate-pulse'
                  : 'bg-white text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <Play size={16} />
              <span>{isPlayingAll ? 'Jeda Percakapan' : 'Putar Seluruh Dialog'}</span>
            </button>
          </div>
        </div>

        {/* Role Selector */}
        <div className="mt-5 pt-5 border-t border-white/15 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-emerald-200">
            Pilih Peranmu (Mode Latihan Lisan):
          </span>
          <button
            onClick={() => setUserRole('charA')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              userRole === 'charA'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>{selectedDialogue.characters.charA.avatar}</span>
            <span>Saya sebagai {selectedDialogue.characters.charA.name}</span>
          </button>
          <button
            onClick={() => setUserRole('charB')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              userRole === 'charB'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>{selectedDialogue.characters.charB.avatar}</span>
            <span>Saya sebagai {selectedDialogue.characters.charB.name}</span>
          </button>
          {userRole !== 'none' && (
            <button
              onClick={() => setUserRole('none')}
              className="text-xs text-emerald-300 hover:underline ml-2 cursor-pointer"
            >
              Reset Peran
            </button>
          )}
        </div>
      </div>

      {/* Dialogue Lines Chat Flow */}
      <div className="bg-slate-50/80 rounded-3xl p-4 sm:p-6 border border-slate-200 space-y-4">
        {selectedDialogue.lines.map((line, idx) => {
          const isCharA = idx % 2 === 0;
          const char = isCharA ? selectedDialogue.characters.charA : selectedDialogue.characters.charB;
          const isMyTurn =
            (userRole === 'charA' && isCharA) || (userRole === 'charB' && !isCharA);
          const isCurrentlySpeaking = activeLineIdx === idx;

          return (
            <div
              key={line.id}
              className={`flex flex-col sm:flex-row gap-3 items-start p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                isCurrentlySpeaking
                  ? 'bg-amber-50 ring-2 ring-amber-400 shadow-md scale-[1.01]'
                  : 'bg-white border border-slate-200/80'
              } ${isMyTurn ? 'border-l-4 border-l-emerald-600' : ''}`}
            >
              {/* Speaker Avatar & Name */}
              <div className="flex items-center gap-2.5 sm:w-44 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-xs">
                  {char.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">
                    {char.name}
                  </div>
                  {isMyTurn && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                      Giliranmu Bicara
                    </span>
                  )}
                </div>
              </div>

              {/* Speech Content */}
              <div className="flex-1 space-y-1.5 w-full">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-arabic text-2xl sm:text-3xl text-slate-900 leading-relaxed font-bold text-right w-full" dir="rtl">
                    {line.arabic}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-700 font-mono italic">
                    {line.phonetic}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 pt-1 border-t border-slate-100">
                  {line.indonesian}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                <AudioPlayerButton text={line.arabic} size="sm" label="Lafalkan" />

                <button
                  type="button"
                  onClick={() => {
                    setPracticingLine(line);
                    setLineEvaluation(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition cursor-pointer"
                >
                  <Mic size={14} className="text-emerald-700" />
                  <span>Uji Bicara</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Line Practice Modal */}
      {practicingLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 sm:p-7 overflow-hidden my-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Praktik Kalam Baris Percakapan
              </span>
              <button
                onClick={() => {
                  setPracticingLine(null);
                  setLineEvaluation(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 text-center">
              <span className="text-xs text-slate-500">Peran: {practicingLine.speaker}</span>
              <p className="font-arabic text-3xl font-bold text-slate-900 mt-2 mb-1" dir="rtl">
                {practicingLine.arabic}
              </p>
              <p className="text-xs text-emerald-700 font-mono italic">
                {practicingLine.phonetic}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                "{practicingLine.indonesian}"
              </p>
              <div className="mt-3 flex justify-center">
                <AudioPlayerButton text={practicingLine.arabic} size="sm" label="Contoh Suara" />
              </div>
            </div>

            <SpeechRecorder
              targetText={practicingLine.arabic}
              isEvaluating={evaluating}
              onRecorded={handlePracticeLine}
              placeholder={`Ucapkan: "${practicingLine.arabic}"`}
            />

            {lineEvaluation && (
              <div className="mt-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Award size={16} className="text-amber-500" />
                    <span>Evaluasi Maharah Kalam</span>
                  </span>
                  <span className="text-xl font-black text-emerald-800">
                    Skor: {lineEvaluation.score}/100
                  </span>
                </div>
                <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-100">
                  {lineEvaluation.indonesianFeedback}
                </p>
                <div className="text-center font-arabic text-base text-emerald-800 font-bold" dir="rtl">
                  {lineEvaluation.praises}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
