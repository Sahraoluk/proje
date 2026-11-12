import React, { useState, useMemo } from 'react';
import { 
  ANKARA_NEIGHBORHOODS, 
  INITIAL_FILTER_STATE, 
  FilterState 
} from './data/ankaraData';
import { NeighborhoodData, LayerType } from './types';
import { Header } from './components/Header';
import { AnkaraMap } from './components/AnkaraMap';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { NeighborhoodCardList } from './components/NeighborhoodCardList';
import { FilterControls } from './components/FilterControls';
import { NeighborhoodDetailModal } from './components/NeighborhoodDetailModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { DataUploaderModal } from './components/DataUploaderModal';
import { CustomReportModal } from './components/CustomReportModal';
import { 
  ShieldAlert, 
  Sparkles, 
  Info, 
  MapPin, 
  TrainFront, 
  Layers, 
  Heart, 
  Compass 
} from 'lucide-react';

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
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);

  // Google Maps Platform Quota Defense listener
  React.useEffect(() => {
    const quotaHandler = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', quotaHandler);
    return () => window.removeEventListener('gmp-quota-exceeded', quotaHandler);
  }, []);

  // Filtered Neighborhoods computation
  const filteredNeighborhoods = useMemo(() => {
    return neighborhoods.filter((n) => {
      // 1. Search query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesName = n.name.toLowerCase().includes(query);
        const matchesDistrict = n.district.toLowerCase().includes(query);
        const matchesVibe = n.vibe.toLowerCase().includes(query);
        if (!matchesName && !matchesDistrict && !matchesVibe) return false;
      }

      // 2. District filter
      if (filter.selectedDistrict !== 'all' && n.district.toLowerCase() !== filter.selectedDistrict.toLowerCase()) {
        return false;
      }

      // 3. Minimum scores
      if (n.livabilityScore < filter.minLivability) return false;
      if (n.safetyScore < filter.minSafety) return false;
      if (n.transportScore < filter.minTransport) return false;
      if (n.educationScore < filter.minEducation) return false;

      // 4. Max rent
      if (n.averageRent > filter.maxRent) return false;

      // 5. Crime category
      if (filter.crimeFilter !== 'all' && n.crimeRateCategory !== filter.crimeFilter) {
        return false;
      }

      return true;
    });
  }, [neighborhoods, filter]);

  // Comparison Handlers
  const handleToggleCompare = (target: NeighborhoodData) => {
    setComparedNeighborhoods((prev) => {
      const exists = prev.some(n => n.id === target.id);
      if (exists) {
        return prev.filter(n => n.id !== target.id);
      } else {
        if (prev.length >= 3) {
          // Replace the oldest
          return [...prev.slice(1), target];
        }
        return [...prev, target];
      }
    });
  };

  const handleResetFilters = () => {
    setFilter(INITIAL_FILTER_STATE);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Google Maps Quota Exceeded Sticky Notice Banner */}
      {isQuotaExceeded && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 backdrop-blur-md shadow-lg flex items-center justify-center gap-2">
          <span>
            Google Maps Platform günlük istek kotasına ulaşıldı. Uygulama sahibi iseniz lütfen{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-amber-400 hover:text-amber-300"
            >
              Google Maps geliştirici sitesini
            </a>{' '}
            ziyaret edin.
          </span>
        </div>
      )}

      {/* 1. Header Navigation */}
      <Header
        activeLayer={filter.selectedLayer}
        onLayerChange={(layer: LayerType) => setFilter(prev => ({ ...prev, selectedLayer: layer }))}
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
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                Ankara Kentsel Yaşam & Güvenlik Karşılaştırma Portalı
              </span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Ekim 2024 EGO (53.3M Yolcu) & 2012-2026 Statbase Güvenlik Verileriyle Doğrulanmıştır
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Ankara'da Nerede Yaşanır? <span className="text-amber-400">Güvenlik, Ulaşım, Eğitim & Sosyal Yaşam</span> Karnesi
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Ankara'nın Çankaya, Yenimahalle, Keçiören, Altındağ, Etimesgut, Mamak ve Gölbaşı gibi tüm ilçelerindeki mahalleleri seçin; güvenlik seviyesini, EGO metro hatlarına erişimini, okul olanaklarını ve eğlence imkanlarını puanlayarak <strong>burada yaşanıp yaşanılamayacağını</strong> detaylı analizlerle öğrenin.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <FilterControls
          filter={filter}
          onFilterChange={setFilter}
          onReset={handleResetFilters}
          totalCount={neighborhoods.length}
          filteredCount={filteredNeighborhoods.length}
        />

        {/* Tab 1: Interactive Vector Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <AnkaraMap
              neighborhoods={filteredNeighborhoods}
              selectedNeighborhood={selectedNeighborhood}
              onSelectNeighborhood={(n) => setSelectedNeighborhood(n)}
              activeLayer={filter.selectedLayer}
              onLayerChange={(layer: LayerType) => setFilter(prev => ({ ...prev, selectedLayer: layer }))}
              selectedDistrict={filter.selectedDistrict}
              onSelectDistrict={(d) => setFilter(prev => ({ ...prev, selectedDistrict: d }))}
              onAddToCompare={handleToggleCompare}
            />

            {/* Quick Map Guide & Insights Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Renk Kodlu Güvenlik Katmanı</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kırmızı yanıp sönen noktalar yüksek suç / asayiş riski taşıyan mahalleleri, zümrüt yeşili ise Ankara'nın en huzurlu bölgelerini gösterir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <TrainFront className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">EGO & Raylı Sistem Entegrasyonu</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Haritadaki raylı sistem çizgileri M1-M4 metroları, Ankaray ve Başkentray'ı gösterir. Ekim 2024 53.3 milyon yolcu dağılımına göredir.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Orada Yaşanabilir mi? Puanı</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Herhangi bir mahalleye tıklayarak; eğitim kalitesi, ulaşım, sosyal yaşam ve kiranın harmanlandığı nihai yaşanabilirlik raporunu inceleyin.
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
            comparedIds={comparedNeighborhoods.map(n => n.id)}
          />
        )}

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white">Ankara Yaşam ve Güvenlik Atlası</span>
            <span>·</span>
            <span>Statbase Primary Data & Ankara EGO Ulaşım Raporu</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
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
      
      {/* 1. Neighborhood Detail Modal ("Orda Yaşanabilir mi? Karnesi") */}
      <NeighborhoodDetailModal
        neighborhood={selectedNeighborhood}
        onClose={() => setSelectedNeighborhood(null)}
        onAddToCompare={handleToggleCompare}
        isCompared={comparedNeighborhoods.some(n => n.id === selectedNeighborhood?.id)}
      />

      {/* 2. Side-by-Side Comparison Drawer */}
      <ComparisonDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparedNeighborhoods={comparedNeighborhoods}
        onRemove={(id) => setComparedNeighborhoods(prev => prev.filter(n => n.id !== id))}
        onSelectForDetails={(n) => {
          setSelectedNeighborhood(n);
          setIsCompareOpen(false);
        }}
        allNeighborhoods={neighborhoods}
        onAddNeighborhood={handleToggleCompare}
      />

      {/* 3. Custom Dataset Uploader Modal */}
      <DataUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={(updated) => setNeighborhoods(updated)}
        currentNeighborhoods={neighborhoods}
      />

      {/* 4. Printable Custom Report Modal */}
      <CustomReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        neighborhoods={filteredNeighborhoods}
        selectedDistrict={filter.selectedDistrict}
      />

    </div>
  );
}
