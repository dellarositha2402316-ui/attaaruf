import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new GoogleGenAI();
  }
  return new GoogleGenAI({ apiKey });
};

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Kalamuna API Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Evaluate Student Spoken Arabic
app.post('/api/gemini/evaluate-speech', async (req: Request, res: Response) => {
  try {
    const { spokenText, targetText, context } = req.body;

    if (!spokenText || typeof spokenText !== 'string') {
      return res.status(400).json({ error: 'Teks ucapan (spokenText) tidak boleh kosong' });
    }

    const ai = getGeminiClient();
    const systemPrompt = `Anda adalah seorang Guru Bahasa Arab Madrasah Tsanawiyah (MTs) Kelas 7 yang sangat berpengalaman, ramah, dan memotivasi santri/siswa. 
Topik materi saat ini: At-Ta'aruf (التعارف - Perkenalan) sesuai Buku Pelajaran Bahasa Arab MTs Kelas 7 Kemenag RI (KMA 183).

Tugas Anda adalah mengevaluasi hasil rekaman suara/ucapan lisan siswa yang telah diubah menjadi teks (STT).
Target teks yang seharusnya diucapkan: "${targetText || 'Perkenalan diri bebas dalam bahasa Arab'}"
Konteks latihan: "${context || 'Latihan Maharah Kalam'}"
Teks ucapan siswa: "${spokenText}"

Berikan penilaian edukatif dan format respon HANYA dalam JSON valid tanpa markdown penutup dengan struktur:
{
  "score": <angka integer 50-100>,
  "fashahahScore": <angka integer 50-100>,
  "nahwuScore": <angka integer 50-100>,
  "makhrajScore": <angka integer 50-100>,
  "grade": "<Mumtaz / Jayyid Jiddan / Jayyid / Maqbul>",
  "arabicCorrection": "<teks koreksi berharakat lengkap yang benar dan fasih>",
  "indonesianFeedback": "<analisis ramah, jelas, dan memotivasi siswa kelas 7 SMP/MTs>",
  "pronunciationTips": "<tips pelafalan makhraj huruf spesifik jika ada yang keliru, misal beda ha dan hha>",
  "praises": "<kalimat pujian bahasa Arab singkat, contoh: مُمْتَازٌ جِدًّا يَا بُنَيَّ! / أَحْسَنْتَ!>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Fallback parser if markdown blocks exist
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: parsedResult
    });

  } catch (error: any) {
    console.error('Error evaluating speech with Gemini:', error);
    
    // Fallback heuristic scoring if offline or API limit
    const spoken = (req.body?.spokenText || '').toLowerCase().trim();
    const target = (req.body?.targetText || '').toLowerCase().trim();
    const isClose = target ? spoken.includes(target.slice(0, 4)) || target.includes(spoken.slice(0, 4)) : true;
    
    const fallbackData = {
      score: isClose ? 88 : 75,
      fashahahScore: isClose ? 90 : 78,
      nahwuScore: isClose ? 86 : 74,
      makhrajScore: isClose ? 88 : 75,
      grade: isClose ? "Jayyid Jiddan" : "Jayyid",
      arabicCorrection: req.body?.targetText || req.body?.spokenText || "السَّلَامُ عَلَيْكُمْ، اسْمِي طَالِبٌ فِي الْمَدْرَسَةِ",
      indonesianFeedback: "Bagus sekali latihan bicaranya! Terus latih kelancaran dan perhatikan kejelasan vokal huruf Arab.",
      pronunciationTips: "Perhatikan panjang pendek (mad) dan kejelasan makhraj huruf halq (ح، ع).",
      praises: "مُمْتَازٌ! وَاصِلِ التَّدْرِيْبَ"
    };

    return res.json({
      success: true,
      fallback: true,
      data: fallbackData
    });
  }
});

// Interactive Kalam Chat with Virtual Arabic Partner (Azzam / Aisyah)
app.post('/api/gemini/chat-kalam', async (req: Request, res: Response) => {
  try {
    const { message, history = [], partnerName = 'عَزَّام (Azzam)' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    const ai = getGeminiClient();
    const prompt = `Anda adalah lawan bicara percakapan interaktif (Muhadatsah / Hiwar) bernama ${partnerName}, seorang siswa/siswi MTs Kelas 7 yang ramah dan fasih berbahasa Arab sesuai Buku Kemenag RI Materi At-Ta'aruf (التعارف).

Karakter Anda:
- Gunakan bahasa Arab fusha tingkat dasar Kelas 7 MTs yang berharakat lengkap (tasykil).
- Percakapan berkisar pada: ucapan salam (التحيات), menanyakan nama (ما اسمك), menanyakan kabar (كيف حالك), asal daerah (من أين أنت), status siswa/siswi (أنا طالب/طالبة), dan perkenalan teman (هذا صديقي / هذه صديقتي).
- Berikan respon yang mengajak siswa terus berbicara (mengajukan pertanyaan balik sederhana).

Riwayat percakapan:
${history.map((h: { role: string; text: string }) => `${h.role}: ${h.text}`).join('\n')}
Siswa: ${message}

Respon HANYA dalam format JSON valid:
{
  "arabic": "<jawaban bahasa Arab berharakat lengkap yang ramah dan singkat>",
  "indonesian": "<terjemahan bahasa Indonesia>",
  "phonetic": "<transliterasi latin untuk membantu siswa membaca>",
  "suggestedResponses": [
    "<pilihan jawaban Arab 1 untuk siswa>",
    "<pilihan jawaban Arab 2 untuk siswa>",
    "<pilihan jawaban Arab 3 untuk siswa>"
  ],
  "praise": "<pujian pendek jika ucapan siswa tepat, misal: أَحْسَنْتَ!>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: parsedResult
    });

  } catch (error: any) {
    console.error('Error in chat-kalam with Gemini:', error);
    
    // Pedagogical fallback response
    const fallbackResponse = {
      arabic: "أَهْلًا وَسَهْلًا بِكَ يَا صَدِيْقِي! أَنَا عَزَّام، طَالِبٌ فِي الْمَدْرَسَةِ الْمُتَوَسِّطَةِ الْإِسْلَامِيَّةِ. وَمَا اسْمُكَ أَنْتَ؟",
      indonesian: "Selamat datang temanku! Saya Azzam, siswa Madrasah Tsanawiyah. Dan siapa namamu?",
      phonetic: "Ahlan wa sahlan bika ya shadiqi! Ana Azzam, thalibun fil madrasatil mutawassithatil islamiyyah. Wa masmuka anta?",
      suggestedResponses: [
        "اِسْمِيْ فَوزَان، أَنَا طَالِبٌ هُنَا أَيْضًا",
        "كَيْفَ حَالُكَ يَا عَزَّام؟",
        "أَنَا مِنْ مَدِيْنَةِ سُوْرَابَايَا"
      ],
      praise: "مُمْتَازٌ! كَلَامُكَ وَاضِحٌ"
    };

    return res.json({
      success: true,
      fallback: true,
      data: fallbackResponse
    });
  }
});

// Virtual Teacher Q&A on At-Ta'aruf rules (Dhomir, Isim Isyarah)
app.post('/api/gemini/ask-tutor', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong' });
    }

    const ai = getGeminiClient();
    const prompt = `Anda adalah Guru Bahasa Arab Kelas 7 MTs Kemenag RI yang ramah. Jawab pertanyaan siswa seputar materi At-Ta'aruf (التعارف), Dhomir (أنا، أنتَ، أنتِ، هو، هي), Isim Isyarah (هذا، هذه), atau cara pengucapan lisan.
Pertanyaan siswa: "${question}"

Berikan penjelasan ringkas, mudah dipahami anak usia 12-13 tahun, disertai contoh kalimat berharakat lengkap dan tips Maharah Kalam (berbicara). Format jawaban dalam JSON:
{
  "explanation": "<penjelasan bahasa Indonesia yang jelas>",
  "arabicExamples": ["<contoh 1 berharakat>", "<contoh 2 berharakat>"],
  "kalamTip": "<tips praktis berbicara lisan>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    return res.json({
      success: true,
      data: {
        explanation: "Dalam At-Ta'aruf (Perkenalan), perhatikan pemakaian Dhomir dan Isim Isyarah. Gunakan هٰذَا / أَنْتَ / هُوَ untuk mudzakkar (laki-laki), dan هٰذِهِ / أَنْتِ / هِيَ untuk muannats (perempuan).",
        arabicExamples: [
          "هٰذَا أَخِيْ، هُوَ طَالِبٌ فِي الْمَدْرَسَةِ",
          "هٰذِهِ أُخْتِيْ، هِيَ طَالِبَةٌ مُجْتَهِدَةٌ"
        ],
        kalamTip: "Lafalkan dengan intonasi jelas dan bedakan vokal pendek serta vokal panjang (mad)."
      }
    });
  }
});

export default app;
