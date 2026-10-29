import { SpeechEvaluationResult } from '../types';

export async function evaluateSpeechAPI(
  spokenText: string,
  targetText?: string,
  context?: string
): Promise<SpeechEvaluationResult> {
  const response = await fetch('/api/gemini/evaluate-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spokenText, targetText, context }),
  });

  if (!response.ok) {
    throw new Error('Gagal menghubungi server evaluasi bicara.');
  }

  const result = await response.json();
  const data = result.data || {};

  return {
    score: data.score ?? 85,
    fashahahScore: data.fashahahScore ?? 85,
    nahwuScore: data.nahwuScore ?? 85,
    makhrajScore: data.makhrajScore ?? 85,
    grade: data.grade || 'Jayyid Jiddan',
    arabicCorrection: data.arabicCorrection || targetText || spokenText,
    indonesianFeedback:
      data.indonesianFeedback ||
      'Pengucapan sudah cukup baik, teruslah berlatih melafalkan makhraj huruf dengan intonasi jelas.',
    pronunciationTips:
      data.pronunciationTips ||
      'Perhatikan perbedaan huruf halq dan mad (panjang-pendek).',
    praises: data.praises || 'مُمْتَازٌ! أَحْسَنْتَ',
    recordedText: spokenText,
    timestamp: new Date().toISOString(),
  };
}

export interface ChatKalamResponse {
  arabic: string;
  indonesian: string;
  phonetic: string;
  suggestedResponses: string[];
  praise?: string;
}

export async function chatKalamAPI(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  partnerName = 'عَزَّام (Azzam)'
): Promise<ChatKalamResponse> {
  const response = await fetch('/api/gemini/chat-kalam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, partnerName }),
  });

  if (!response.ok) {
    throw new Error('Gagal menghubungi asisten percakapan.');
  }

  const result = await response.json();
  return result.data;
}

export interface AskTutorResponse {
  explanation: string;
  arabicExamples: string[];
  kalamTip: string;
}

export async function askTutorAPI(question: string): Promise<AskTutorResponse> {
  const response = await fetch('/api/gemini/ask-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error('Gagal menghubungi Ustadz AI.');
  }

  const result = await response.json();
  return result.data;
}
