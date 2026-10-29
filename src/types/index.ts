export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: 'admin' | 'student';
  school?: string;
  className?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  stats: {
    totalSpeakingPractices: number;
    averageScore: number;
    vocabMastered: number;
    dialoguesCompleted: number;
    quizScore: number;
  };
}

export interface VocabItem {
  id: string;
  arabic: string;
  indonesian: string;
  phonetic: string;
  category: 'tahiyyat' | 'mihnah' | 'dhomir' | 'isyarah' | 'istifham' | 'makan';
  exampleSentence: string;
  exampleTranslation: string;
  audioPrompt?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  arabic: string;
  phonetic: string;
  indonesian: string;
  gender: 'male' | 'female';
}

export interface Dialogue {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  characters: {
    charA: { name: string; avatar: string; gender: 'male' | 'female' };
    charB: { name: string; avatar: string; gender: 'male' | 'female' };
  };
  lines: DialogueLine[];
}

export interface SpeakingMission {
  id: string;
  title: string;
  arabicTitle: string;
  level: 'Dasar' | 'Menengah' | 'Lanjutan';
  instruction: string;
  targetKeywords: string[];
  sampleSentence: string;
  sampleTranslation: string;
  promptQuestion?: string;
}

export interface SpeechEvaluationResult {
  score: number;
  fashahahScore: number;
  nahwuScore: number;
  makhrajScore: number;
  grade: string;
  arabicCorrection: string;
  indonesianFeedback: string;
  pronunciationTips: string;
  praises?: string;
  recordedText: string;
  timestamp: string;
}

export interface StudentSubmission {
  id: string;
  userId: string;
  studentName: string;
  missionId: string;
  missionTitle: string;
  spokenText: string;
  evaluation: SpeechEvaluationResult;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'speaking-test' | 'match';
  question: string;
  arabicQuestion?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  audioPrompt?: string;
}
