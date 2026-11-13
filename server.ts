import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CompactNeighborhood {
  id: string;
  name: string;
  district: string;
  livabilityScore: number;
  safetyScore: number;
  transportScore: number;
  educationScore: number;
  entertainmentScore: number;
  economyScore: number;
  averageRent: number;
  crimeRateCategory: string;
  nearestMetroStation?: string;
  metroLines?: string[];
  vibe?: string;
  idealFor?: string[];
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/advisor', async (req, res) => {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const neighborhoods: CompactNeighborhood[] = Array.isArray(req.body?.neighborhoods)
      ? req.body.neighborhoods
      : [];

    if (!query) {
      res.status(400).json({ error: 'EMPTY_QUERY', message: 'Lütfen bir arama sorgusu girin.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY_MISSING',
        message: 'Gemini API anahtarı tanımlı değil. Yerel akıllı eşleştirme kullanılıyor.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const condensedList = neighborhoods.map((n) => ({
        id: n.id,
        name: n.name,
        district: n.district,
        livabilityScore: n.livabilityScore,
        safetyScore: n.safetyScore,
        transportScore: n.transportScore,
        educationScore: n.educationScore,
        entertainmentScore: n.entertainmentScore,
        averageRentTL: n.averageRent,
        crimeRisk: n.crimeRateCategory,
        metro: n.nearestMetroStation || 'Otobüs',
        lines: n.metroLines || [],
        idealFor: n.idealFor || [],
        vibe: n.vibe || '',
      }));

      const prompt = `Sen Ankara kent yaşamı ve mahalle güvenliği uzmanısın.
Kullanıcının talebi: "${query}"

Aşağıdaki Ankara mahalle veri setini analiz et ve kullanıcının bütçe, güvenlik, ulaşım/metro, eğitim, sosyal yaşam veya semt tercihine en uygun tam olarak 3 mahalleyi seç.
Sadece veri setinde var olan "id" değerlerini döndür. Her mahalle için kullanıcının kriterlerine doğrudan değinen kısa, net ve Türkçe bir gerekçe (en fazla 1-2 cümle) yaz.

Mahalle Veri Seti:
${JSON.stringify(condensedList)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Yanıtı yalnızca geçerli JSON olarak ver. Türkçe karakterleri (ç, ğ, ı, İ, ö, ş, ü) doğru kullan.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'Kullanıcının sorgusuna yönelik 1 cümlelik genel değerlendirme.',
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: {
                      type: Type.STRING,
                      description: 'Veri setindeki mahalle id değeri.',
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'Bu mahallenin neden önerildiğini açıklayan kısa Türkçe gerekçe.',
                    },
                  },
                  required: ['id', 'reason'],
                },
              },
            },
            required: ['summary', 'recommendations'],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      if (!Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
        res.status(502).json({
          error: 'GEMINI_EMPTY_RESULT',
          message: 'AI danışmandan geçerli öneri alınamadı; yerel eşleştirme kullanılıyor.',
        });
        return;
      }

      res.json({
        summary: parsed.summary || 'Kriterlerinize en uygun Ankara mahalleleri aşağıdadır.',
        recommendations: parsed.recommendations.slice(0, 3),
        source: 'gemini',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası';
      console.error('Gemini advisor error:', msg);
      res.status(500).json({
        error: 'GEMINI_REQUEST_FAILED',
        message: 'AI servisine bağlanılamadı; yerel akıllı eşleştirme sonuçları gösteriliyor.',
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
