import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

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

interface StoredFeedback {
  id: string;
  neighborhoodId: string;
  name: string;
  comment: string;
  safety: number;
  transport: number;
  livability: number;
  createdAt: string;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const advisorCache = new Map<string, CacheEntry<unknown>>();
const geocodeCache = new Map<string, CacheEntry<unknown>>();
const travelCache = new Map<string, CacheEntry<unknown>>();
const poiCache = new Map<string, CacheEntry<unknown>>();
const advisorRateLimits = new Map<string, { count: number; resetAt: number }>();
let lastNominatimCall = 0;
let feedbackWriteQueue: Promise<void> = Promise.resolve();

function getCached<T>(map: Map<string, CacheEntry<unknown>>, key: string): T | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCached<T>(
  map: Map<string, CacheEntry<unknown>>,
  key: string,
  value: T,
  ttlMs: number
): void {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function readFeedbackStore(): Promise<StoredFeedback[]> {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(FEEDBACK_FILE, '[]', 'utf-8');
      return [];
    }
    return [];
  }
}

async function appendFeedbackStore(item: StoredFeedback): Promise<void> {
  feedbackWriteQueue = feedbackWriteQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const current = await readFeedbackStore();
    current.unshift(item);
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(current, null, 2), 'utf-8');
  });
  return feedbackWriteQueue;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  // 1. Persistent Community Feedback Endpoints
  app.get('/api/feedback', async (req, res) => {
    try {
      const neighborhoodId =
        typeof req.query.neighborhoodId === 'string' ? req.query.neighborhoodId.trim() : '';
      const all = await readFeedbackStore();
      const filtered = neighborhoodId
        ? all.filter((f) => f.neighborhoodId === neighborhoodId)
        : all;
      res.json({ items: filtered });
    } catch (error) {
      console.error('Feedback GET error:', error);
      res.status(500).json({ error: 'FEEDBACK_READ_FAILED', items: [] });
    }
  });

  app.post('/api/feedback', async (req, res) => {
    try {
      const neighborhoodId =
        typeof req.body?.neighborhoodId === 'string' ? req.body.neighborhoodId.trim() : '';
      const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 60) : '';
      const comment =
        typeof req.body?.comment === 'string' ? req.body.comment.trim().slice(0, 800) : '';
      const safety = Math.max(0, Math.min(100, Number(req.body?.safety ?? 50)));
      const transport = Math.max(0, Math.min(100, Number(req.body?.transport ?? 50)));
      const livability = Math.max(0, Math.min(100, Number(req.body?.livability ?? 50)));

      if (!neighborhoodId || !comment) {
        res.status(400).json({
          error: 'INVALID_FEEDBACK',
          message: 'Mahalle kimliği ve yorum alanı zorunludur.',
        });
        return;
      }

      const item: StoredFeedback = {
        id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        neighborhoodId,
        name: name || 'Anonim Ankara Sakini',
        comment,
        safety: Number.isFinite(safety) ? safety : 50,
        transport: Number.isFinite(transport) ? transport : 50,
        livability: Number.isFinite(livability) ? livability : 50,
        createdAt: new Date().toISOString(),
      };

      await appendFeedbackStore(item);
      res.status(201).json({ item });
    } catch (error) {
      console.error('Feedback POST error:', error);
      res.status(500).json({
        error: 'FEEDBACK_WRITE_FAILED',
        message: 'Yorum kaydedilirken bir hata oluştu.',
      });
    }
  });

  // 2. Nominatim Reverse Geocoding Proxy with Rate-Limit & Cache
  app.get('/api/geocode/reverse', async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ error: 'INVALID_COORDINATES' });
      return;
    }

    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = getCached<unknown>(geocodeCache, cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const now = Date.now();
      const elapsed = now - lastNominatimCall;
      if (elapsed < 1050) {
        await new Promise((r) => setTimeout(r, 1050 - elapsed));
      }
      lastNominatimCall = Date.now();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const upstream = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=tr`,
        {
          headers: {
            'User-Agent': 'AnkaraYasamGuvenlikAtlasi/1.0 (https://localhost:3000)',
            Accept: 'application/json',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (!upstream.ok) {
        res.status(502).json({ error: 'NOMINATIM_UPSTREAM_ERROR', address: null });
        return;
      }

      const data = await upstream.json();
      const payload = {
        address: data?.address ?? null,
        displayName: data?.display_name ?? null,
        cached: false,
      };
      setCached(geocodeCache, cacheKey, { ...payload, cached: true }, 60 * 60 * 1000);
      res.json(payload);
    } catch (error) {
      console.error('Reverse geocode proxy error:', error);
      res.status(502).json({ error: 'NOMINATIM_FAILED', address: null });
    }
  });

  // 3. OSRM Travel Time Matrix Proxy (with Haversine Fallback)
  app.post('/api/travel-times', async (req, res) => {
    const origin = req.body?.origin as { id?: string; lat?: number; lng?: number } | undefined;
    const destinations = Array.isArray(req.body?.destinations)
      ? (req.body.destinations as Array<{ id: string; lat: number; lng: number }>)
      : [];

    if (
      !origin ||
      !Number.isFinite(origin.lat) ||
      !Number.isFinite(origin.lng) ||
      destinations.length === 0
    ) {
      res.status(400).json({ error: 'INVALID_TRAVEL_REQUEST', estimates: {} });
      return;
    }

    const originLat = Number(origin.lat);
    const originLng = Number(origin.lng);
    const cacheKey = `${origin.id || `${originLat.toFixed(4)},${originLng.toFixed(4)}`}::${destinations
      .map((d) => `${d.id}:${d.lat.toFixed(3)},${d.lng.toFixed(3)}`)
      .join('|')}`;

    const cached = getCached<Record<string, unknown>>(travelCache, cacheKey);
    if (cached) {
      res.json({ estimates: cached, cached: true });
      return;
    }

    const buildFallbackMap = () => {
      const estimates: Record<
        string,
        { distanceKm: number; walkingMinutes: number; drivingMinutes: number; source: 'fallback' }
      > = {};
      for (const dest of destinations) {
        const km = haversineKm(originLat, originLng, dest.lat, dest.lng);
        const roadKm = km * 1.25;
        estimates[dest.id] = {
          distanceKm: Number(km.toFixed(2)),
          drivingMinutes: Math.max(3, Math.round((roadKm / 34) * 60)),
          walkingMinutes: Math.max(4, Math.round((roadKm / 4.8) * 60)),
          source: 'fallback',
        };
      }
      return estimates;
    };

    try {
      const cappedDest = destinations.slice(0, 60);
      const coords = [
        `${originLng},${originLat}`,
        ...cappedDest.map((d) => `${d.lng},${d.lat}`),
      ].join(';');
      const destIndices = cappedDest.map((_, idx) => idx + 1).join(';');
      const osrmUrl = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&destinations=${destIndices}&annotations=duration,distance`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3800);
      const upstream = await fetch(osrmUrl, {
        headers: { 'User-Agent': 'AnkaraYasamGuvenlikAtlasi/1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!upstream.ok) {
        const fallback = buildFallbackMap();
        setCached(travelCache, cacheKey, fallback, 5 * 60 * 1000);
        res.json({ estimates: fallback, source: 'fallback' });
        return;
      }

      const data = await upstream.json();
      const durations: Array<number | null> = data?.durations?.[0] || [];
      const distances: Array<number | null> = data?.distances?.[0] || [];

      const estimates: Record<
        string,
        {
          distanceKm: number;
          walkingMinutes: number;
          drivingMinutes: number;
          source: 'osrm' | 'fallback';
        }
      > = {};

      cappedDest.forEach((dest, i) => {
        const straightKm = haversineKm(originLat, originLng, dest.lat, dest.lng);
        const osrmDurationSec = durations[i];
        const osrmDistanceMeters = distances[i];

        if (
          typeof osrmDurationSec === 'number' &&
          Number.isFinite(osrmDurationSec) &&
          typeof osrmDistanceMeters === 'number' &&
          Number.isFinite(osrmDistanceMeters)
        ) {
          const roadKm = Math.max(straightKm, osrmDistanceMeters / 1000);
          const drivingMinutes = Math.max(2, Math.round(osrmDurationSec / 60));
          const walkingMinutes = Math.max(3, Math.round((roadKm / 4.8) * 60));
          estimates[dest.id] = {
            distanceKm: Number(straightKm.toFixed(2)),
            drivingMinutes,
            walkingMinutes,
            source: 'osrm',
          };
        } else {
          const roadKm = straightKm * 1.25;
          estimates[dest.id] = {
            distanceKm: Number(straightKm.toFixed(2)),
            drivingMinutes: Math.max(3, Math.round((roadKm / 34) * 60)),
            walkingMinutes: Math.max(4, Math.round((roadKm / 4.8) * 60)),
            source: 'fallback',
          };
        }
      });

      setCached(travelCache, cacheKey, estimates, 30 * 60 * 1000);
      res.json({ estimates, source: 'osrm' });
    } catch {
      const fallback = buildFallbackMap();
      setCached(travelCache, cacheKey, fallback, 5 * 60 * 1000);
      res.json({ estimates: fallback, source: 'fallback' });
    }
  });

  // 4. OpenStreetMap Overpass POI Proxy with 24h In-Memory Cache
  app.get('/api/pois', async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const validCategories = ['hospital', 'library', 'park', 'police', 'veterinary'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: 'INVALID_POI_CATEGORY', items: [] });
      return;
    }

    const cached = getCached<unknown[]>(poiCache, category);
    if (cached) {
      res.json({ items: cached, source: 'overpass-cache' });
      return;
    }

    const queryByCategory: Record<string, string> = {
      hospital: `node["amenity"="hospital"](39.75,32.55,40.08,33.05);way["amenity"="hospital"](39.75,32.55,40.08,33.05);`,
      library: `node["amenity"="library"](39.75,32.55,40.08,33.05);way["amenity"="library"](39.75,32.55,40.08,33.05);`,
      park: `way["leisure"="park"]["name"](39.77,32.57,40.06,33.02);`,
      police: `node["amenity"="police"](39.75,32.55,40.08,33.05);way["amenity"="police"](39.75,32.55,40.08,33.05);`,
      veterinary: `node["amenity"="veterinary"](39.75,32.55,40.08,33.05);node["amenity"="animal_shelter"](39.75,32.55,40.08,33.05);`,
    };

    const overpassQl = `[out:json][timeout:6];(${queryByCategory[category]});out center 25;`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const upstream = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'AnkaraYasamGuvenlikAtlasi/1.0',
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!upstream.ok) {
        res.json({ items: [], source: 'fallback' });
        return;
      }

      const data = await upstream.json();
      const elements = Array.isArray(data?.elements) ? data.elements : [];
      const items = elements
        .map((el: Record<string, unknown>) => {
          const center = el.center as { lat?: number; lon?: number } | undefined;
          const lat = typeof el.lat === 'number' ? el.lat : center?.lat;
          const lng = typeof el.lon === 'number' ? el.lon : center?.lon;
          const tags = (el.tags as Record<string, string>) || {};
          const name = tags.name || tags['name:tr'];
          if (!lat || !lng || !name) return null;
          return {
            id: `osm-${category}-${el.id}`,
            name,
            category,
            lat,
            lng,
            district: tags['addr:district'] || tags['addr:suburb'] || undefined,
          };
        })
        .filter(Boolean)
        .slice(0, 25);

      if (items.length > 0) {
        setCached(poiCache, category, items, 24 * 60 * 60 * 1000);
      }
      res.json({ items, source: items.length > 0 ? 'overpass' : 'fallback' });
    } catch {
      res.json({ items: [], source: 'fallback' });
    }
  });

  // 5. Gemini AI Advisor Proxy with In-Memory Cache & Rate Limiting
  app.post('/api/advisor', async (req, res) => {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const neighborhoods: CompactNeighborhood[] = Array.isArray(req.body?.neighborhoods)
      ? req.body.neighborhoods
      : [];

    if (!query) {
      res.status(400).json({ error: 'EMPTY_QUERY', message: 'Lütfen bir arama sorgusu girin.' });
      return;
    }

    const clientIp = req.ip || 'local';
    const now = Date.now();
    const rate = advisorRateLimits.get(clientIp);
    if (rate && now < rate.resetAt) {
      if (rate.count >= 20) {
        res.status(429).json({
          error: 'RATE_LIMIT',
          message: 'Çok sık AI sorgusu gönderildi; yerel akıllı eşleştirme kullanılıyor.',
        });
        return;
      }
      rate.count += 1;
    } else {
      advisorRateLimits.set(clientIp, { count: 1, resetAt: now + 60 * 1000 });
    }

    const normalizedCacheKey = `${query.toLocaleLowerCase('tr-TR')}::${neighborhoods
      .slice(0, 10)
      .map((n) => `${n.id}:${n.livabilityScore}`)
      .join(',')}`;
    const cachedAdvisor = getCached<Record<string, unknown>>(advisorCache, normalizedCacheKey);
    if (cachedAdvisor) {
      res.json({ ...cachedAdvisor, cached: true });
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

      const payload = {
        summary: parsed.summary || 'Kriterlerinize en uygun Ankara mahalleleri aşağıdadır.',
        recommendations: parsed.recommendations.slice(0, 3),
        source: 'gemini',
      };
      setCached(advisorCache, normalizedCacheKey, payload, 15 * 60 * 1000);
      res.json(payload);
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
