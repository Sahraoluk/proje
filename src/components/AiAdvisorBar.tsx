import React, { useState } from 'react';
import { NeighborhoodData } from '../types';
import {
  Sparkles,
  Send,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Coins,
  TrainFront,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import { getScoreColor, isDangerousNeighborhood } from '../data/ankaraData';

interface AiAdvisorBarProps {
  neighborhoods: NeighborhoodData[];
  onSelectNeighborhood: (n: NeighborhoodData) => void;
}

interface RecommendationItem {
  neighborhood: NeighborhoodData;
  reason: string;
}

function buildLocalFallbackRecommendations(
  query: string,
  neighborhoods: NeighborhoodData[]
): { summary: string; items: RecommendationItem[] } {
  const q = query.toLocaleLowerCase('tr-TR');

  // Parse budget if mentioned (e.g. "25 bin", "25.000", "25000", "30k")
  let maxBudget: number | null = null;
  const budgetMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(bin|k|tl|₺)?/);
  if (budgetMatch) {
    const rawNum = Number(budgetMatch[1].replace(',', '.'));
    if (!Number.isNaN(rawNum) && rawNum > 0) {
      if (budgetMatch[2] === 'bin' || budgetMatch[2] === 'k' || rawNum < 100) {
        maxBudget = rawNum * 1000;
      } else if (rawNum >= 5000) {
        maxBudget = rawNum;
      }
    }
  }

  const wantsSafe =
    q.includes('güven') || q.includes('gece') || q.includes('huzur') || q.includes('suç');
  const wantsMetro =
    q.includes('metro') || q.includes('raylı') || q.includes('ulaşım') || q.includes('ego') || q.includes('tramvay');
  const wantsStudent =
    q.includes('öğrenci') || q.includes('üniversite') || q.includes('kampüs') || q.includes('genç');
  const wantsFamily =
    q.includes('aile') || q.includes('çocuk') || q.includes('sakin') || q.includes('park');
  const wantsCheap =
    q.includes('ucuz') || q.includes('ekonomik') || q.includes('uygun') || maxBudget !== null;
  const wantsSocial =
    q.includes('sosyal') || q.includes('kafe') || q.includes('eğlence') || q.includes('canlı');

  const scored = neighborhoods.map((n) => {
    let score = n.livabilityScore * 0.4;
    const reasons: string[] = [];

    if (n.district.toLocaleLowerCase('tr-TR').split(' ').some((w) => w.length > 2 && q.includes(w))) {
      score += 35;
      reasons.push(`${n.district} ilçesi tercihinizle doğrudan eşleşiyor`);
    }
    if (n.name.toLocaleLowerCase('tr-TR').split(/[\s&/]+/).some((w) => w.length > 3 && q.includes(w))) {
      score += 40;
    }

    if (maxBudget !== null) {
      if (n.averageRent <= maxBudget) {
        score += 35;
        reasons.push(`${n.averageRent.toLocaleString('tr-TR')} ₺ ortalama kirası bütçenize uygun`);
      } else {
        score -= Math.min(40, (n.averageRent - maxBudget) / 500);
      }
    } else if (wantsCheap) {
      score += n.economyScore * 0.35;
      if (n.averageRent <= 25000) {
        reasons.push(`${n.averageRent.toLocaleString('tr-TR')} ₺ kirasıyla ekonomik seçenek sunuyor`);
      }
    }

    if (wantsSafe) {
      score += n.safetyScore * 0.55;
      if (n.safetyScore >= 85) {
        reasons.push(`${n.safetyScore}/100 güvenlik skoru ile gece ve gündüz yüksek asayiş sunuyor`);
      }
    }

    if (wantsMetro) {
      score += n.transportScore * 0.5;
      if (n.metroLines && n.metroLines.length > 0 && n.transportScore >= 80) {
        reasons.push(`${n.nearestMetroStation || n.metroLines.join(', ')} bağlantısı ile raylı erişimi güçlü`);
      }
    }

    if (wantsStudent) {
      score += n.educationScore * 0.45 + n.entertainmentScore * 0.25;
      if (n.educationScore >= 85) {
        reasons.push(`${n.educationScore}/100 eğitim ve kampüs erişimiyle öğrenci yaşamına elverişli`);
      }
    }

    if (wantsFamily) {
      score += n.safetyScore * 0.35 + n.livabilityScore * 0.35;
      if (n.idealFor?.some((item) => item.toLowerCase().includes('aile'))) {
        reasons.push('aile yaşamı ve sakin çevre düzeniyle öne çıkıyor');
      }
    }

    if (wantsSocial) {
      score += n.entertainmentScore * 0.45;
      if (n.entertainmentScore >= 85) {
        reasons.push(`${n.entertainmentScore}/100 sosyal yaşam ve kafe/kültür puanına sahip`);
      }
    }

    if (reasons.length === 0) {
      reasons.push(
        `${n.livabilityScore}/100 yaşanabilirlik ve ${n.safetyScore}/100 güvenlik puanıyla dengeli bir seçenek`
      );
    }

    const formattedReason =
      reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1) + (reasons[1] ? `; ayrıca ${reasons[1]}.` : '.');

    return { neighborhood: n, score, reason: formattedReason };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    summary: 'Yerel akıllı eşleştirme motoru ile kriterlerinize en yakın 3 mahalle seçildi.',
    items: scored.slice(0, 3).map((s) => ({
      neighborhood: s.neighborhood,
      reason: s.reason,
    })),
  };
}

export const AiAdvisorBar: React.FC<AiAdvisorBarProps> = ({
  neighborhoods,
  onSelectNeighborhood,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setWarning(null);

    try {
      const compactNeighborhoods = neighborhoods.map((n) => ({
        id: n.id,
        name: n.name,
        district: n.district,
        livabilityScore: n.livabilityScore,
        safetyScore: n.safetyScore,
        transportScore: n.transportScore,
        educationScore: n.educationScore,
        entertainmentScore: n.entertainmentScore,
        economyScore: n.economyScore,
        averageRent: n.averageRent,
        crimeRateCategory: n.crimeRateCategory,
        nearestMetroStation: n.nearestMetroStation,
        metroLines: n.metroLines,
        vibe: n.vibe,
        idealFor: n.idealFor,
      }));

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          neighborhoods: compactNeighborhoods,
        }),
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data.recommendations)) {
        const fallback = buildLocalFallbackRecommendations(trimmed, neighborhoods);
        setWarning(
          data?.message ||
            'AI servisine ulaşılamadı. Yerel filtreleme ile en uygun öneriler listelendi.'
        );
        setSummary(fallback.summary);
        setRecommendations(fallback.items);
        return;
      }

      const mapped: RecommendationItem[] = [];
      for (const rec of data.recommendations) {
        const match = neighborhoods.find((n) => n.id === rec.id);
        if (match) {
          mapped.push({
            neighborhood: match,
            reason: rec.reason || match.verdictSummary,
          });
        }
      }

      if (mapped.length === 0) {
        const fallback = buildLocalFallbackRecommendations(trimmed, neighborhoods);
        setWarning('AI yanıtı yerel veri ile eşleştirilemedi; yerel öneriler gösteriliyor.');
        setSummary(fallback.summary);
        setRecommendations(fallback.items);
      } else {
        setSummary(data.summary || 'Kriterlerinize en uygun 3 mahalle önerisi:');
        setRecommendations(mapped.slice(0, 3));
      }
    } catch {
      const fallback = buildLocalFallbackRecommendations(trimmed, neighborhoods);
      setWarning(
        'AI servisi şu an yanıt vermiyor. Yerel akıllı eşleştirme ile öneriler oluşturuldu.'
      );
      setSummary(fallback.summary);
      setRecommendations(fallback.items);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setRecommendations([]);
    setSummary(null);
    setWarning(null);
  };

  return (
    <div className="rounded-3xl glass-panel neon-border p-4 sm:p-5 shadow-xl space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex items-center gap-2 shrink-0 px-1">
          <span className="p-1.5 rounded-xl bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd]">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="leading-tight">
            <span className="font-display font-bold text-xs sm:text-sm text-white block">
              AI Mahalle Danışmanı
            </span>
            <span className="text-[10px] font-mono text-[#f3c1cd]/80 hidden sm:block">
              Doğal Dil Öneri Motoru
            </span>
          </div>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: Bütçem 25 bin TL, metroya yakın ve gece güvenli bir mahalle öner..."
            className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl bg-[#061317] border border-[#e8a0b2]/30 text-teal-50 placeholder-teal-200/50 focus:outline-none focus:border-[#e8a0b2] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teal-200/60 hover:text-white p-1"
              title="Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-[#e8a0b2]/20 transition-all shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Öneri Al</span>
            </>
          )}
        </button>
      </form>

      {warning && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] text-xs">
          <AlertCircle className="w-4 h-4 text-[#e8a0b2] shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-2.5 pt-1">
          {summary && (
            <div className="flex items-center justify-between gap-2 text-xs text-teal-200/80 px-1">
              <span>{summary}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-mono text-[#f3c1cd] hover:underline shrink-0"
              >
                Sonuçları Gizle
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.map(({ neighborhood: n, reason }, idx) => {
              const dangerous = isDangerousNeighborhood(n);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onSelectNeighborhood(n)}
                  className="text-left p-3.5 rounded-2xl bg-[#061317]/90 hover:bg-[#0b1f26] border border-[#e8a0b2]/25 hover:border-[#e8a0b2]/70 transition-all group flex flex-col justify-between gap-2 cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-mono text-[#f3c1cd] font-bold uppercase tracking-wider">
                          #{idx + 1} Öneri · {n.district}
                        </span>
                        <h4 className="font-display font-bold text-sm text-white group-hover:text-[#f3c1cd] transition-colors">
                          {n.name}
                        </h4>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-lg font-mono text-xs font-extrabold text-slate-950 shrink-0"
                        style={{ backgroundColor: getScoreColor(n.livabilityScore, dangerous) }}
                      >
                        {n.livabilityScore}
                      </span>
                    </div>

                    <p className="text-xs text-teal-100/85 leading-relaxed">{reason}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-teal-900/60 text-[11px] font-mono text-teal-200/70">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-teal-300" />
                        {n.safetyScore}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TrainFront className="w-3 h-3 text-teal-300" />
                        {n.transportScore}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#f3c1cd]">
                        <Coins className="w-3 h-3" />
                        {(n.averageRent / 1000).toFixed(0)}k ₺
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[#f3c1cd] font-sans font-semibold">
                      Karne <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
