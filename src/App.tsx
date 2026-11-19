import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  ANKARA_NEIGHBORHOODS,
  ANKARA_DISTRICTS,
  INITIAL_FILTER_STATE,
  REFERENCE_POINTS,
  DEFAULT_SCORE_WEIGHTS,
  computeWeightedLivability,
  isCustomWeightsActive,
  calculateDistanceKm,
  estimateFallbackTravelMinutes,
  FilterState,
} from './data/ankaraData';
import {
  NeighborhoodData,
  LayerType,
  ScoreWeights,
  TravelEstimate,
} from './types';
import { Header, AppTab } from './components/Header';
import { AnkaraMap } from './components/AnkaraMap';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { NeighborhoodCardList } from './components/NeighborhoodCardList';
import { CommunityReviewsPage } from './components/CommunityReviewsPage';
import { FilterControls } from './components/FilterControls';
import { AiAdvisorBar } from './components/AiAdvisorBar';
import { DistrictSummaryCard } from './components/DistrictSummaryCard';
import { NeighborhoodDetailModal } from './components/NeighborhoodDetailModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { DataUploaderModal } from './components/DataUploaderModal';
import { CustomReportModal } from './components/CustomReportModal';
import { ShieldAlert, Sparkles, TrainFront } from 'lucide-react';

const VALID_LAYERS: LayerType[] = [
  'livability',
  'safety',
  'education',
  'transport',
  'entertainment',
  'economy',
];

const travelTimesClientCache = new Map<string, Record<string, TravelEstimate>>();

function getInitialUrlState(): {
  layer: LayerType;
  compareIds: string[];
} {
  if (typeof window === 'undefined') {
    return { layer: 'livability', compareIds: [] };
  }
  const params = new URLSearchParams(window.location.search);
  const rawLayer = params.get('layer') as LayerType | null;
  const layer = rawLayer && VALID_LAYERS.includes(rawLayer) ? rawLayer : 'livability';

  const rawCompare = params.get('compare');
  const validIds = new Set(ANKARA_NEIGHBORHOODS.map((n) => n.id));
  const compareIds = rawCompare
    ? rawCompare
        .split(',')
        .map((id) => id.trim())
        .filter((id) => validIds.has(id))
        .slice(0, 3)
    : [];

  return { layer, compareIds };
}

export default function App() {
  const initialUrlState = useMemo(() => getInitialUrlState(), []);

  const [baseNeighborhoods, setBaseNeighborhoods] =
    useState<NeighborhoodData[]>(ANKARA_NEIGHBORHOODS);
  const [filter, setFilter] = useState<FilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    selectedLayer: initialUrlState.layer,
  }));
  const [scoreWeights, setScoreWeights] = useState<ScoreWeights>(DEFAULT_SCORE_WEIGHTS);
  const [activeTab, setActiveTab] = useState<AppTab>('map');
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>(initialUrlState.compareIds);
  const [travelTimes, setTravelTimes] = useState<Record<string, TravelEstimate>>({});

  // Modals state
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(
    initialUrlState.compareIds.length >= 2
  );
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  const customWeightsActive = useMemo(
    () => isCustomWeightsActive(scoreWeights),
    [scoreWeights]
  );

  // Dynamically recompute livabilityScore when custom weights change
  const neighborhoods = useMemo(() => {
    return baseNeighborhoods.map((n) => ({
      ...n,
      livabilityScore: computeWeightedLivability(n, scoreWeights),
    }));
  }, [baseNeighborhoods, scoreWeights]);

  const selectedNeighborhood = useMemo(() => {
    if (!selectedNeighborhoodId) return null;
    return neighborhoods.find((n) => n.id === selectedNeighborhoodId) || null;
  }, [neighborhoods, selectedNeighborhoodId]);

  const comparedNeighborhoods = useMemo(() => {
    return comparedIds
      .map((id) => neighborhoods.find((n) => n.id === id))
      .filter((n): n is NeighborhoodData => Boolean(n));
  }, [neighborhoods, comparedIds]);

  const activeReferencePoint = useMemo(() => {
    return (
      REFERENCE_POINTS.find((r) => r.id === filter.selectedReferencePointId) || REFERENCE_POINTS[0]
    );
  }, [filter.selectedReferencePointId]);

  const selectedDistrictSummary = useMemo(() => {
    if (filter.selectedDistrict === 'all') return null;
    return (
      ANKARA_DISTRICTS.find(
        (d) => d.name.toLowerCase() === filter.selectedDistrict.toLowerCase()
      ) || null
    );
  }, [filter.selectedDistrict]);

  // Sync URL query params (?compare=...&layer=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (comparedIds.length > 0) {
      params.set('compare', comparedIds.join(','));
    } else {
      params.delete('compare');
    }
    params.set('layer', filter.selectedLayer);
    params.delete('time');

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [comparedIds, filter.selectedLayer]);

  // Fetch OSRM travel times directly from browser (with in-memory Map cache & Haversine fallback)
  useEffect(() => {
    if (!activeReferencePoint || activeReferencePoint.id === 'none') {
      setTravelTimes({});
      return;
    }

    const cacheKey = `${activeReferencePoint.id}::${baseNeighborhoods.length}`;
    const cached = travelTimesClientCache.get(cacheKey);
    if (cached) {
      setTravelTimes(cached);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const buildFallbackTravelMap = (): Record<string, TravelEstimate> => {
      const fallbackMap: Record<string, TravelEstimate> = {};
      baseNeighborhoods.forEach((n) => {
        const km = calculateDistanceKm(
          activeReferencePoint.lat,
          activeReferencePoint.lng,
          n.lat,
          n.lng
        );
        fallbackMap[n.id] = estimateFallbackTravelMinutes(km);
      });
      return fallbackMap;
    };

    const fetchTravelTimes = async () => {
      try {
        const cappedDest = baseNeighborhoods.slice(0, 60);
        const coords = [
          `${activeReferencePoint.lng},${activeReferencePoint.lat}`,
          ...cappedDest.map((n) => `${n.lng},${n.lat}`),
        ].join(';');
        const destIndices = cappedDest.map((_, idx) => idx + 1).join(';');
        const osrmUrl = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&destinations=${destIndices}&annotations=duration,distance`;

        const res = await axios.get<{
          durations?: Array<Array<number | null>>;
          distances?: Array<Array<number | null>>;
        }>(osrmUrl, {
          signal: controller.signal,
          timeout: 4500,
        });

        const durations = res.data?.durations?.[0] || [];
        const distances = res.data?.distances?.[0] || [];
        const estimates: Record<string, TravelEstimate> = buildFallbackTravelMap();

        cappedDest.forEach((dest, i) => {
          const straightKm = calculateDistanceKm(
            activeReferencePoint.lat,
            activeReferencePoint.lng,
            dest.lat,
            dest.lng
          );
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
          }
        });

        if (!cancelled) {
          travelTimesClientCache.set(cacheKey, estimates);
          setTravelTimes(estimates);
        }
      } catch {
        if (!cancelled) {
          const fallbackMap = buildFallbackTravelMap();
          travelTimesClientCache.set(cacheKey, fallbackMap);
          setTravelTimes(fallbackMap);
        }
      }
    };

    fetchTravelTimes();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeReferencePoint, baseNeighborhoods]);

  // Filtered Neighborhoods computation
  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods.filter((n) => {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLocaleLowerCase('tr-TR');
        const matchesName = n.name.toLocaleLowerCase('tr-TR').includes(query);
        const matchesDistrict = n.district.toLocaleLowerCase('tr-TR').includes(query);
        const matchesVibe = n.vibe.toLocaleLowerCase('tr-TR').includes(query);
        if (!matchesName && !matchesDistrict && !matchesVibe) return false;
      }

      if (
        filter.selectedDistrict !== 'all' &&
        n.district.toLocaleLowerCase('tr-TR') !== filter.selectedDistrict.toLocaleLowerCase('tr-TR')
      ) {
        return false;
      }

      if (n.livabilityScore < filter.minLivability) return false;
      if (n.safetyScore < filter.minSafety) return false;
      if (n.transportScore < filter.minTransport) return false;
      if (n.educationScore < filter.minEducation) return false;
      if (n.averageRent > filter.maxRent) return false;

      if (filter.crimeFilter !== 'all' && n.crimeRateCategory !== filter.crimeFilter) {
        return false;
      }

      return true;
    });
  }, [neighborhoods, filter]);

  const handleToggleCompare = (target: NeighborhoodData) => {
    setComparedIds((prev) => {
      if (prev.includes(target.id)) {
        return prev.filter((id) => id !== target.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), target.id];
      }
      return [...prev, target.id];
    });
  };

  const handleResetFilters = () => {
    setFilter(INITIAL_FILTER_STATE);
    setScoreWeights(DEFAULT_SCORE_WEIGHTS);
  };

  const handleResetDistrict = () => {
    setFilter((prev) => ({ ...prev, selectedDistrict: 'all' }));
  };

  return (
    <div className="min-h-screen bg-transparent text-teal-50 flex flex-col font-sans selection:bg-[#e8a0b2] selection:text-slate-950">
      {/* 1. Header Navigation */}
      <Header
        activeLayer={filter.selectedLayer}
        onLayerChange={(layer: LayerType) =>
          setFilter((prev) => ({ ...prev, selectedLayer: layer }))
        }
        activeTab={activeTab}
        onTabChange={setActiveTab}
        compareCount={comparedNeighborhoods.length}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Sub-Header / Hero Introduction Banner */}
        <div className="rounded-3xl glass-panel neon-border p-6 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#e8a0b2]/10 blur-3xl" />
          <div className="max-w-3xl space-y-2 relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] font-mono text-[11px] font-bold uppercase tracking-wider">
                Ankara Kentsel Yaşam & Güvenlik Karşılaştırma Portalı
              </span>
              <span className="text-teal-200/50 hidden sm:inline">·</span>
              <span className="text-xs text-teal-200/75 font-mono hidden sm:inline">
                Ekim 2024 EGO (53.3M Yolcu) & 2012-2026 Statbase Güvenlik Verileriyle Doğrulanmıştır
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Ankara'da Nerede Yaşanır?{' '}
              <span className="bg-gradient-to-r from-[#f3c1cd] via-[#e8a0b2] to-teal-300 bg-clip-text text-transparent">
                Güvenlik, Ulaşım, Eğitim & Sosyal Yaşam
              </span>{' '}
              Karnesi
            </h1>

            <p className="text-xs sm:text-sm text-teal-200/75 leading-relaxed font-sans">
              Ankara'nın Çankaya, Yenimahalle, Keçiören, Altındağ, Etimesgut, Mamak ve Gölbaşı gibi
              tüm ilçelerindeki mahalleleri seçin; güvenlik seviyesini, EGO metro hatlarına
              erişimini, okul olanaklarını ve eğlence imkanlarını puanlayarak{' '}
              <strong className="text-white">burada yaşanıp yaşanılamayacağını</strong> detaylı
              analizlerle öğrenin.
            </p>
          </div>
        </div>

        {/* AI Neighborhood Advisor Bar */}
        <AiAdvisorBar
          neighborhoods={neighborhoods}
          onSelectNeighborhood={(n) => setSelectedNeighborhoodId(n.id)}
        />

        {/* Filter Controls Bar */}
        <FilterControls
          filter={filter}
          onFilterChange={setFilter}
          onReset={handleResetFilters}
          totalCount={neighborhoods.length}
          filteredCount={filteredNeighborhoods.length}
          scoreWeights={scoreWeights}
          onWeightsChange={setScoreWeights}
          onResetWeights={() => setScoreWeights(DEFAULT_SCORE_WEIGHTS)}
        />

        {/* Tab 1: Interactive Leaflet Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <AnkaraMap
              neighborhoods={filteredNeighborhoods}
              selectedNeighborhood={selectedNeighborhood}
              onSelectNeighborhood={(n) => setSelectedNeighborhoodId(n.id)}
              activeLayer={filter.selectedLayer}
              onLayerChange={(layer: LayerType) =>
                setFilter((prev) => ({ ...prev, selectedLayer: layer }))
              }
              selectedDistrict={filter.selectedDistrict}
              onSelectDistrict={(d: string) =>
                setFilter((prev) => ({ ...prev, selectedDistrict: d }))
              }
              onAddToCompare={handleToggleCompare}
              referencePoint={activeReferencePoint}
              travelTimes={travelTimes}
            />

            {/* District Summary Card if selected district has 0 or <= 1 matching pins */}
            {selectedDistrictSummary && filteredNeighborhoods.length <= 1 && (
              <DistrictSummaryCard
                district={selectedDistrictSummary}
                matchingPinsCount={filteredNeighborhoods.length}
                onResetDistrict={handleResetDistrict}
              />
            )}

            {/* Quick Map Guide & Insights Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl glass-panel border border-[#e8a0b2]/25 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/35 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Renk Kodlu Güvenlik Katmanı</h4>
                  <p className="text-xs text-teal-200/70 mt-0.5">
                    Kırmızı halkalı noktalar yüksek suç / asayiş riski taşıyan mahalleleri, zümrüt
                    yeşili ise Ankara'nın en huzurlu bölgelerini gösterir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-teal-900/70 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40 shrink-0">
                  <TrainFront className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    EGO & Raylı Sistem Entegrasyonu
                  </h4>
                  <p className="text-xs text-teal-200/70 mt-0.5">
                    Haritadaki raylı sistem düğmesi M1-M4 metroları, Ankaray ve Başkentray'ı
                    gösterir. Ekim 2024 53.3 milyon yolcu dağılımına göredir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-[#e8a0b2]/25 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/35 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Orada Yaşanabilir mi? Puanı</h4>
                  <p className="text-xs text-teal-200/70 mt-0.5">
                    Herhangi bir mahalleye tıklayarak; eğitim kalitesi, ulaşım, sosyal yaşam ve
                    kiranın harmanlandığı nihai yaşanabilirlik raporunu inceleyin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Analytics & Statbase / EGO Charts View */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts
            neighborhoods={filteredNeighborhoods}
            onSelectNeighborhood={(n) => setSelectedNeighborhoodId(n.id)}
          />
        )}

        {/* Tab 3: Rankings & Neighborhood Cards View */}
        {activeTab === 'rankings' && (
          <NeighborhoodCardList
            neighborhoods={filteredNeighborhoods}
            onSelectNeighborhood={(n) => setSelectedNeighborhoodId(n.id)}
            onAddToCompare={handleToggleCompare}
            comparedIds={comparedNeighborhoods.map((n) => n.id)}
            referencePoint={activeReferencePoint}
            selectedDistrictSummary={selectedDistrictSummary}
            onResetDistrict={handleResetDistrict}
            customWeightsActive={customWeightsActive}
            travelTimes={travelTimes}
          />
        )}

        {/* Tab 4: Dedicated Community Reviews Page (Client-Side localStorage + defaultFeedback.json) */}
        {activeTab === 'reviews' && (
          <CommunityReviewsPage
            neighborhoods={neighborhoods}
            onSelectNeighborhood={(n) => setSelectedNeighborhoodId(n.id)}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-teal-900/70 bg-[#061317] py-6 px-4 sm:px-6 mt-12 text-xs text-teal-200/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white">
              Ankara Yaşam ve Güvenlik Atlası
            </span>
            <span>·</span>
            <span>Statbase Birincil Veri & Ankara EGO Ulaşım Raporu</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-teal-200/70">
            <span>Çankaya</span>
            <span>·</span>
            <span>Yenimahalle</span>
            <span>·</span>
            <span>Keçiören</span>
            <span>·</span>
            <span>Etimesgut</span>
            <span>·</span>
            <span>Altındağ</span>
            <span>·</span>
            <span>Gölbaşı</span>
            <span>·</span>
            <span>Mamak</span>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <NeighborhoodDetailModal
        neighborhood={selectedNeighborhood}
        onClose={() => setSelectedNeighborhoodId(null)}
        onAddToCompare={handleToggleCompare}
        isCompared={comparedNeighborhoods.some((n) => n.id === selectedNeighborhood?.id)}
        referencePoint={activeReferencePoint}
        travelEstimate={
          selectedNeighborhood ? travelTimes[selectedNeighborhood.id] ?? null : null
        }
      />

      <ComparisonDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparedNeighborhoods={comparedNeighborhoods}
        onRemove={(id) => setComparedIds((prev) => prev.filter((item) => item !== id))}
        onSelectForDetails={(n) => {
          setSelectedNeighborhoodId(n.id);
          setIsCompareOpen(false);
        }}
        allNeighborhoods={neighborhoods}
        onAddNeighborhood={handleToggleCompare}
      />

      <DataUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={(updated) => setBaseNeighborhoods(updated)}
        currentNeighborhoods={baseNeighborhoods}
      />

      <CustomReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        neighborhoods={filteredNeighborhoods}
        selectedDistrict={filter.selectedDistrict}
      />
    </div>
  );
}
