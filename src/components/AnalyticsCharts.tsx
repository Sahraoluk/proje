import React, { useState } from 'react';
import { 
  HISTORICAL_SAFETY_DATA, 
  EGO_TRANSPORT_DATA, 
  TOTAL_MONTHLY_EGO_PASSENGERS 
} from '../data/ankaraData';
import { NeighborhoodData } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  TrainFront, 
  ShieldAlert, 
  Info, 
  ArrowUpRight, 
  Bus, 
  Sparkles,
  Layers
} from 'lucide-react';

interface AnalyticsChartsProps {
  neighborhoods: NeighborhoodData[];
  onSelectNeighborhood: (n: NeighborhoodData) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  neighborhoods,
  onSelectNeighborhood,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(2024);
  const [transportCategory, setTransportCategory] = useState<string>('all');

  // Filter transport data
  const filteredTransport = transportCategory === 'all'
    ? EGO_TRANSPORT_DATA
    : EGO_TRANSPORT_DATA.filter(t => t.category === transportCategory);

  const selectedYearData = HISTORICAL_SAFETY_DATA.find(d => d.year === selectedYear);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: STATBASE 2012-2026 HISTORICAL SAFETY / INCIDENT INDEX CHART */}
      <div className="rounded-3xl glass-panel neon-border p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Ankara Suç ve Güvenlik Endeksi (2012 - 2026 Statbase Birincil Veri)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Yüklenen görsel veri setine dayalı: 2012'de 20.6 ile başlayan, 2016'da 46.2 ile zirve yapan ve son yıllarda 39.3-39.5 bandında dengelenen resmi güvenlik endeksi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Seçili Yıl: <strong className="text-amber-400">{selectedYear || 'Tümü'}</strong>
            </span>
          </div>
        </div>

        {/* SVG Bar Chart matching the Statbase chart from the user's attachment */}
        <div className="relative w-full h-[240px] sm:h-[280px] bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-end">
          
          {/* Background Grid Lines (20, 25, 30, 35, 40, 45, 50) */}
          <div className="absolute inset-x-4 inset-y-4 flex flex-col justify-between pointer-events-none opacity-20">
            {[50, 45, 40, 35, 30, 25, 20].map(val => (
              <div key={val} className="w-full border-b border-slate-500 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono -translate-y-2">{val}</span>
              </div>
            ))}
          </div>

          {/* Bar Bars Container */}
          <div className="relative z-10 w-full h-[200px] flex items-end justify-between gap-1 sm:gap-2 px-6">
            {HISTORICAL_SAFETY_DATA.map((item) => {
              const isSelected = selectedYear === item.year;
              // Map index 20 to 50 to percentage height (20 is baseline, 50 is max)
              const heightPercent = Math.max(0, ((item.index - 18) / (50 - 18)) * 100);
              const isPeak = item.year === 2016;

              return (
                <div
                  key={item.year}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  onClick={() => setSelectedYear(item.year)}
                >
                  {/* Tooltip on bar hover */}
                  <div className="mb-1 text-center opacity-90 transition-transform group-hover:scale-110">
                    <span className={`text-[10px] font-mono font-bold block ${
                      isPeak ? 'text-rose-400' : isSelected ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      {item.index}
                    </span>
                  </div>

                  {/* Bar shape */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      isPeak 
                        ? 'bg-gradient-to-t from-rose-700 to-rose-400 shadow-md shadow-rose-500/20' 
                        : isSelected
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-sky-500/70 group-hover:bg-sky-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Year Label */}
                  <span className={`text-[10px] sm:text-[11px] font-mono mt-2 transition-colors ${
                    isSelected ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {item.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Year Insight Card */}
        {selectedYearData && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm">
                {selectedYearData.year}:
              </span>
              <span className="text-slate-300">
                Endeks Değeri: <strong className="text-white font-mono">{selectedYearData.index}</strong> puan
              </span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-400 italic">
                {selectedYearData.description}
              </span>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Veri Kaynağı: Statbase / indicator_553323
            </span>
          </div>
        )}
      </div>

      {/* SECTION 2: EGO EKİM 2024 TOPLU TAŞIMA VE RAYLI SİSTEM DAĞILIMI */}
      <div className="rounded-3xl glass-panel neon-border p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrainFront className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Ankara EGO Toplu Taşıma Yolcu Verileri (Ekim 2024 - 53.3 Milyon Yolcu)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Yüklenen Excel tablosuna dayalı resmi yolcu sayıları. Mahallelerin ulaşım erişilebilirliği bu ağ yoğunluğuna göre ağırlıklandırılmıştır.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'Şehir İçi Raylı', 'EGO Otobüs', 'Özel Toplu Taşıma', 'Çevre İlçe Hatları'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTransportCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
                  transportCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Tüm Taşıma Türleri' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Big Key Figures Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Toplam Aylık Yolcu</span>
            <span className="text-lg sm:text-xl font-display font-extrabold text-white tabular-nums">
              {TOTAL_MONTHLY_EGO_PASSENGERS.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-cyan-400 block font-mono">100% Kent İçi Hareket</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">EGO Otobüs Seferleri</span>
            <span className="text-lg sm:text-xl font-display font-bold text-sky-400 tabular-nums">
              25.319.996
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">%47.5 Pay (Lider)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Metro & Raylı Hatlar</span>
            <span className="text-lg sm:text-xl font-display font-bold text-emerald-400 tabular-nums">
              19.168.284
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">Metro + Ankaray + TCDD</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">ÖHO & ÖTA Şehir İçi</span>
            <span className="text-lg sm:text-xl font-display font-bold text-amber-400 tabular-nums">
              8.196.418
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">%15.4 Özel Taşıma Payı</span>
          </div>
        </div>

        {/* Detailed Horizontal Passenger Volume Breakdown Table & Progress Bars */}
        <div className="space-y-2.5">
          {filteredTransport.slice(0, 10).map((item, index) => {
            const isRail = item.category === 'Şehir İçi Raylı';
            const isBus = item.category === 'EGO Otobüs';
            
            return (
              <div 
                key={index}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{item.type}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-300 font-bold">
                      {item.passengers.toLocaleString('tr-TR')} yolcu
                    </span>
                    <span className="text-cyan-400 font-bold min-w-[45px] text-right">
                      %{item.percentage.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBus ? 'bg-sky-500' : isRail ? 'bg-cyan-400' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(item.percentage * 2, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: YAŞANABİLİRLİK VS SUÇ/GÜVENLİK DAĞILIM MATRİSİ */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Ankara Mahalleleri: Güvenlik vs Yaşanabilirlik Karşılaştırma Matrisi
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Her noktanın boyutu mahallenin eğlence ve eğitim puanını temsil eder. Tıklayarak detaylı karnesini inceleyebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {neighborhoods.map((n) => (
            <div
              key={n.id}
              onClick={() => onSelectNeighborhood(n)}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-900 group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {n.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">{n.district}</span>
                </div>
                <div className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                  n.livabilityScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                  n.livabilityScore >= 75 ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {n.livabilityScore} / 100
                </div>
              </div>

              {/* Progress meters */}
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Güvenlik:</span>
                  <span className={n.safetyScore >= 80 ? 'text-emerald-400 font-bold' : n.safetyScore >= 65 ? 'text-amber-400' : 'text-red-400 font-bold'}>
                    {n.safetyScore} ({n.crimeRateCategory})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Ulaşım & EGO:</span>
                  <span className="text-cyan-400">{n.transportScore}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Ortalama Kira:</span>
                  <span className="text-slate-200">{(n.averageRent / 1000).toFixed(0)}k ₺</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 line-clamp-1 italic">
                "{n.vibe}"
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
