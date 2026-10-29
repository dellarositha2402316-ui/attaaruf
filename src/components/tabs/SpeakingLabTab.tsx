import React, { useState, useEffect, useRef } from 'react';
import { chatKalamAPI, ChatKalamResponse } from '../../services/apiService';
import { speechService } from '../../services/speechService';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  Mic,
  Send,
  Sparkles,
  RefreshCw,
  User,
  Volume2,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  arabic: string;
  indonesian?: string;
  phonetic?: string;
  timestamp: string;
}

export const SpeakingLabTab: React.FC = () => {
  const { currentUser, updateUserStats } = useAuth();
  const [partner, setPartner] = useState<'Azzam' | 'Hilyah' | 'Ustadzah'>('Azzam');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([
    'السَّلَامُ عَلَيْكُمْ يَا صَدِيْقِيْ',
    'صَبَاحَ الْخَيْرِ، كَيْفَ حَالُكَ؟',
    'اِسْمِيْ طَالِبٌ فِي الْمَدْرَسَةِ، وَمَا اسْمُكَ؟',
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ! أَهْلًا وَسَهْلًا بِكَ فِي مُخْتَبَرِ الْكَلَامِ. مَا اسْمُكَ؟',
      indonesian: 'Assalamu alaikum wa rahmatullah! Selamat datang di Lab Percakapan Kalam. Siapa namamu?',
      phonetic: 'Assalaamu \'alaikum wa rahmatullaah! Ahlan wa sahlan bika fii mukhtabaril kalaam. Masmuka?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const partnersInfo = {
    Azzam: {
      name: 'عَزَّام (Azzam)',
      role: 'Teman Sekelas Siswa MTs',
      avatar: '👦',
      color: 'from-emerald-600 to-teal-700',
    },
    Hilyah: {
      name: 'حِلْيَة (Hilyah)',
      role: 'Teman Sekelas Siswi MTs',
      avatar: '🧕',
      color: 'from-teal-600 to-cyan-700',
    },
    Ustadzah: {
      name: 'أُسْتَاذَة عَائِشَة (Ustadzah Aisyah)',
      role: 'Guru Bahasa Arab Pembimbing',
      avatar: '👩‍🏫',
      color: 'from-indigo-600 to-emerald-700',
    },
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      arabic: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.arabic,
      }));

      const botReply: ChatKalamResponse = await chatKalamAPI(
        text,
        history,
        partnersInfo[partner].name
      );

      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'bot',
        arabic: botReply.arabic,
        indonesian: botReply.indonesian,
        phonetic: botReply.phonetic,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (botReply.suggestedResponses && botReply.suggestedResponses.length > 0) {
        setSuggestedResponses(botReply.suggestedResponses);
      }

      // Automatically speak the bot reply in natural Arabic
      speechService.speak(botReply.arabic, undefined, 0.85);

      updateUserStats({
        totalSpeakingPractices: (currentUser?.stats.totalSpeakingPractices || 0) + 1,
      });
    } catch (e) {
      console.error(e);
      const fallbackMsg: ChatMessage = {
        id: 'b-err-' + Date.now(),
        sender: 'bot',
        arabic: 'مُمْتَازٌ! كَلَامُكَ جَمِيْلٌ جِدًّا يَا صَدِيْقِيْ، وَاصِلِ التَّحَدُّثَ!',
        indonesian: 'Bagus sekali! Bahasa Arabmu sangat indah wahai sahabatku, lanjutkan berbicara!',
        phonetic: 'Mumtaaz! Kalaamuka jamiilun jiddan yaa shadiiqii, waashilit tahadduts!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speechService.speak(fallbackMsg.arabic, undefined, 0.85);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const recognizer = speechService.createRecognizer(
      (transcript) => {
        setInputText(transcript);
      },
      (error) => {
        console.warn('Speech error:', error);
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
        console.error(err);
        setIsRecording(false);
      }
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'bot',
        arabic: `السَّلَامُ عَلَيْكُمْ! أَنَا ${partnersInfo[partner].name}، هَيَّا نَتَعَارَفْ بِاللُّغَةِ الْعَرَبِيَّةِ!`,
        indonesian: `Assalamu alaikum! Saya ${partnersInfo[partner].name}, mari kita saling berkenalan dalam bahasa Arab!`,
        phonetic: 'Assalaamu \'alaikum! Hayyaa nata\'aarof bil-lughotil \'arabiyyah!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSuggestedResponses([
      'السَّلَامُ عَلَيْكُمْ يَا صَدِيْقِيْ',
      'صَبَاحَ الْخَيْرِ، كَيْفَ حَالُكَ؟',
      'اِسْمِيْ طَالِبٌ فِي الْمَدْرَسَةِ، وَمَا اسْمُكَ؟',
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Partner Selector Top Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl shadow-xs">
            {partnersInfo[partner].avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {partnersInfo[partner].name}
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                AI Partner
              </span>
            </div>
            <p className="text-xs text-slate-500">{partnersInfo[partner].role}</p>
          </div>
        </div>

        {/* Change Partner Buttons */}
        <div className="flex items-center gap-2">
          {(['Azzam', 'Hilyah', 'Ustadzah'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPartner(p);
                resetChat();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                partner === p
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{partnersInfo[p].avatar}</span>
              <span>{p}</span>
            </button>
          ))}

          <button
            onClick={resetChat}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Mulai Percakapan Baru"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-50/80 rounded-3xl p-4 sm:p-6 border border-slate-200 min-h-[420px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? (
                currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="User"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User size={18} />
                )
              ) : (
                partnersInfo[partner].avatar
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-xs transition-all ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}
            >
              {/* Arabic Text */}
              <div className="flex items-start justify-between gap-3">
                <p
                  className={`font-arabic text-2xl sm:text-3xl font-bold leading-relaxed text-right w-full ${
                    msg.sender === 'user' ? 'text-white' : 'text-slate-900'
                  }`}
                  dir="rtl"
                >
                  {msg.arabic}
                </p>

                {msg.sender === 'bot' && (
                  <AudioPlayerButton
                    text={msg.arabic}
                    size="sm"
                    className="shrink-0 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  />
                )}
              </div>

              {/* Phonetics & Indonesian for bot message */}
              {msg.phonetic && (
                <p className="text-xs text-emerald-700 font-mono italic mt-1 text-right">
                  {msg.phonetic}
                </p>
              )}

              {msg.indonesian && (
                <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
                  {msg.indonesian}
                </p>
              )}

              <div
                className={`text-[10px] mt-1.5 flex justify-end ${
                  msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-xs">
              {partnersInfo[partner].avatar}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span className="text-xs text-slate-600 font-medium">
                {partnersInfo[partner].name} sedang merespon percakapan...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Spoken Phrases Pills */}
      {suggestedResponses.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <Lightbulb size={14} className="text-amber-500" />
            <span>Pilihan Kalimat Jawaban Lisan (Klik untuk Latihan / Kirim):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedResponses.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(res)}
                className="px-3 py-1.5 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-arabic font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
                dir="rtl"
              >
                <span>{res}</span>
                <ChevronRight size={14} className="text-emerald-600 rotate-180" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice & Text Input Box */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex items-center gap-2">
        {/* Microphone STT Trigger Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading}
          className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isRecording
              ? 'bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
          }`}
          title={isRecording ? 'Hentikan Rekaman Suara' : 'Bicara Bahasa Arab dengan Mic'}
        >
          <Mic size={20} className={isRecording ? 'animate-bounce' : ''} />
        </button>

        {/* Input Text in Arabic */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={
            isRecording
              ? 'Sedang mendengarkan suaramu... bicaralah!'
              : 'Ketik pesan bahasa Arab atau gunakan tombol mic...'
          }
          dir="rtl"
          className="flex-1 px-4 py-2.5 font-arabic text-lg sm:text-xl text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm transition cursor-pointer disabled:opacity-40 shrink-0"
          title="Kirim Pesan"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
