import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, RefreshCw, Send, AlertCircle, Sparkles } from 'lucide-react';
import { speechService } from '../services/speechService';

interface SpeechRecorderProps {
  onRecorded: (text: string) => void;
  targetText?: string;
  placeholder?: string;
  isEvaluating?: boolean;
}

export const SpeechRecorder: React.FC<SpeechRecorderProps> = ({
  onRecorded,
  targetText,
  placeholder = 'Klik tombol mic dan ucapkan kalimat dalam bahasa Arab...',
  isEvaluating = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsSupported(speechService.isRecognitionSupported());
  }, []);

  const startRecording = () => {
    setErrorMsg(null);
    setTranscript('');

    const recognizer = speechService.createRecognizer(
      (text, _isFinal) => {
        setTranscript(text);
      },
      (error) => {
        setErrorMsg(error);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognitionRef.current = recognizer;
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recognizer:', err);
        setErrorMsg('Gagal mengaktifkan mikrofon. Pastikan Anda telah memberikan izin mikrofon.');
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleReset = () => {
    stopRecording();
    setTranscript('');
    setErrorMsg(null);
  };

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    onRecorded(transcript.trim());
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isRecording ? <Mic size={24} className="animate-bounce" /> : <Mic size={24} />}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
              {isRecording ? 'Mendengarkan ucapanmu (ar-SA)...' : 'Latihan Bicara (Maharah Kalam)'}
            </h4>
            <p className="text-xs text-slate-500">
              {isRecording
                ? 'Bicaralah dengan fasih dan intonasi yang jelas'
                : 'Ucapkan kalimat Arab dengan suara lantang'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <Mic size={18} />
              <span>Mulai Bicara</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition hover:shadow-md cursor-pointer animate-pulse"
            >
              <Square size={16} />
              <span>Selesai Bicara</span>
            </button>
          )}

          {transcript && !isRecording && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Ulangi Rekaman"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Recording Waveform Visualization */}
      {isRecording && (
        <div className="py-4 px-6 bg-slate-900 rounded-xl flex items-center justify-center gap-1.5 mb-4 overflow-hidden">
          <span className="text-xs text-emerald-400 font-mono mr-3 uppercase tracking-wider">
            Audio Input
          </span>
          {[40, 70, 30, 90, 60, 20, 80, 50, 95, 45, 65, 35, 85].map((height, i) => (
            <span
              key={i}
              className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
              style={{
                height: `${height}%`,
                animationDelay: `${i * 0.08}s`,
                minHeight: '8px',
                maxHeight: '36px',
              }}
            />
          ))}
          <span className="text-xs text-rose-400 font-mono ml-3 animate-ping">● REC</span>
        </div>
      )}

      {/* Recognition Result Display / Fallback Manual Editor */}
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
          Teks Ucapan yang Terdeteksi:
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={placeholder}
          rows={2}
          dir="rtl"
          className="w-full text-right font-arabic text-xl sm:text-2xl leading-relaxed p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-slate-800"
        />

        {!isSupported && (
          <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              Pengenal suara browser tidak aktif di perangkat ini. Jangan khawatir, Anda dapat mengetik atau mengoreksi teks bahasa Arab di atas secara manual!
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Target Comparison Hint */}
      {targetText && (
        <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Target Kalimat:
            </span>
            <p className="font-arabic text-lg text-emerald-950 mt-0.5" dir="rtl">
              {targetText}
            </p>
          </div>
        </div>
      )}

      {/* Submit button for AI Evaluation */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!transcript.trim() || isRecording || isEvaluating}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
        >
          {isEvaluating ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>AI Sedang Menilai Kalam...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-amber-300" />
              <span>Nilai Ucapan dengan AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
