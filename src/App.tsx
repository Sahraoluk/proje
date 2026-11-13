import React, { useState, useMemo } from 'react';
import {
  ANKARA_NEIGHBORHOODS,
  ANKARA_DISTRICTS,
  INITIAL_FILTER_STATE,
  REFERENCE_POINTS,
  FilterState,
} from './data/ankaraData';
import { NeighborhoodData, LayerType } from './types';
import { Header } from './components/Header';
import { AnkaraMap } from './components/AnkaraMap';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { NeighborhoodCardList } from './components/NeighborhoodCardList';
import { FilterControls } from './components/FilterControls';
import { AiAdvisorBar } from './components/AiAdvisorBar';
import { DistrictSummaryCard } from './components/DistrictSummaryCard';
import { NeighborhoodDetailModal } from './components/NeighborhoodDetailModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { DataUploaderModal } from './components/DataUploaderModal';
import { CustomReportModal } from './components/CustomReportModal';
import { ShieldAlert, Sparkles, TrainFront } from 'lucide-react';

export default function App() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>(ANKARA_NEIGHBORHOODS);
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'rankings'>('map');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodData | null>(null);
  const [comparedNeighborhoods, setComparedNeighborhoods] = useState<NeighborhoodData[]>([]);

  // Modals state
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

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
    setComparedNeighborhoods((prev) => {
      const exists = prev.some((n) => n.id === target.id);
      if (exists) {
        return prev.filter((n) => n.id !== target.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), target];
      }
      return [...prev, target];
    });
  };

  const handleResetFilters = () => {
    setFilter(INITIAL_FILTER_STATE);
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
          onSelectNeighborhood={(n) => setSelectedNeighborhood(n)}
        />

        {/* Filter Controls Bar */}
        <FilterControls
          filter={filter}
          onFilterChange={setFilter}
          onReset={handleResetFilters}
          totalCount={neighborhoods.length}
          filteredCount={filteredNeighborhoods.length}
        />

        {/* Tab 1: Interactive Leaflet Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <AnkaraMap
              neighborhoods={filteredNeighborhoods}
              selectedNeighborhood={selectedNeighborhood}
              onSelectNeighborhood={(n) => setSelectedNeighborhood(n)}
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
            onSelectNeighborhood={(n) => setSelectedNeighborhood(n)}
          />
        )}

        {/* Tab 3: Rankings & Neighborhood Cards View */}
        {activeTab === 'rankings' && (
          <NeighborhoodCardList
            neighborhoods={filteredNeighborhoods}
            onSelectNeighborhood={(n) => setSelectedNeighborhood(n)}
            onAddToCompare={handleToggleCompare}
            comparedIds={comparedNeighborhoods.map((n) => n.id)}
            referencePoint={activeReferencePoint}
            selectedDistrictSummary={selectedDistrictSummary}
            onResetDistrict={handleResetDistrict}
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
        onClose={() => setSelectedNeighborhood(null)}
        onAddToCompare={handleToggleCompare}
        isCompared={comparedNeighborhoods.some((n) => n.id === selectedNeighborhood?.id)}
        referencePoint={activeReferencePoint}
      />

      <ComparisonDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparedNeighborhoods={comparedNeighborhoods}
        onRemove={(id) => setComparedNeighborhoods((prev) => prev.filter((n) => n.id !== id))}
        onSelectForDetails={(n) => {
          setSelectedNeighborhood(n);
          setIsCompareOpen(false);
        }}
        allNeighborhoods={neighborhoods}
        onAddNeighborhood={handleToggleCompare}
      />

      <DataUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={(updated) => setNeighborhoods(updated)}
        currentNeighborhoods={neighborhoods}
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
