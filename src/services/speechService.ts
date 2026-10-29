/**
 * Speech Service for Arabic (ar-SA) Speech Recognition and Text-To-Speech (TTS)
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private arabicVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize Saudi Arabia, UAE, Egypt, or any Arabic voice
    const arVoice = voices.find(
      (v) =>
        v.lang === 'ar-SA' ||
        v.lang.startsWith('ar') ||
        v.name.toLowerCase().includes('arabic')
    );
    if (arVoice) {
      this.arabicVoice = arVoice;
    }
  }

  /**
   * Speak Arabic text with natural rate and pitch
   */
  public speak(text: string, onEnd?: () => void, rate = 0.85): void {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    // Cancel current speech if any
    this.synth.cancel();

    // Clean text of non-Arabic decorative elements if any
    const cleanText = text.trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = rate; // Slightly slower for language learners
    utterance.pitch = 1.0;

    if (this.arabicVoice) {
      utterance.voice = this.arabicVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }

  /**
   * Check if Speech Recognition is supported
   */
  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Create an Arabic speech recognition instance
   */
  public createRecognizer(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.isRecognitionSupported()) {
      onError('Browser tidak mendukung Speech Recognition lisan. Anda dapat menggunakan opsi ketik manual.');
      return null;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      onResult(text.trim(), !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      let message = 'Terjadi kesalahan mikrofon.';
      if (event.error === 'not-allowed') {
        message = 'Izin mikrofon ditolak. Izinkan mikrofon di browser Anda.';
      } else if (event.error === 'no-speech') {
        message = 'Tidak ada suara terdeteksi. Silakan coba lagi.';
      } else if (event.error === 'network') {
        message = 'Koneksi jaringan terputus untuk pengenalan suara.';
      }
      onError(message);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }
}

export const speechService = new SpeechService();
