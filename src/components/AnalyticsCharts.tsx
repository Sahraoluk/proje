import React, { useState } from 'react';
import {
  HISTORICAL_SAFETY_DATA,
  EGO_TRANSPORT_DATA,
  TOTAL_MONTHLY_EGO_PASSENGERS,
  getScoreColor,
  isDangerousNeighborhood,
} from '../data/ankaraData';
import { NeighborhoodData } from '../types';
import { TrainFront, ShieldAlert, Sparkles } from 'lucide-react';

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

  const filteredTransport =
    transportCategory === 'all'
      ? EGO_TRANSPORT_DATA
      : EGO_TRANSPORT_DATA.filter((t) => t.category === transportCategory);

  const selectedYearData = HISTORICAL_SAFETY_DATA.find((d) => d.year === selectedYear);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SECTION 1: STATBASE 2012-2026 HISTORICAL SAFETY / INCIDENT INDEX CHART */}
      <div className="rounded-3xl glass-panel neon-border p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/40">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Ankara Suç ve Güvenlik Endeksi (2012 - 2026 Statbase Birincil Veri)
              </h3>
            </div>
            <p className="text-xs text-teal-200/70 mt-1">
              Yüklenen görsel veri setine dayalı: 2012'de 20.6 ile başlayan, 2016'da 46.2 ile zirve
              yapan ve son yıllarda 39.3-39.5 bandında dengelenen resmi güvenlik endeksi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-teal-200/70 font-mono">
              Seçili Yıl: <strong className="text-[#f3c1cd]">{selectedYear || 'Tümü'}</strong>
            </span>
          </div>
        </div>

        {/* SVG Bar Chart matching the Statbase chart */}
        <div className="relative w-full h-[240px] sm:h-[280px] bg-[#061317]/75 rounded-xl p-4 border border-teal-900/70 flex flex-col justify-end">
          {/* Background Grid Lines */}
          <div className="absolute inset-x-4 inset-y-4 flex flex-col justify-between pointer-events-none opacity-25">
            {[50, 45, 40, 35, 30, 25, 20].map((val) => (
              <div
                key={val}
                className="w-full border-b border-teal-700 flex items-center justify-between"
              >
                <span className="text-[10px] text-teal-200 font-mono -translate-y-2">{val}</span>
              </div>
            ))}
          </div>

          {/* Bars Container */}
          <div className="relative z-10 w-full h-[200px] flex items-end justify-between gap-1 sm:gap-2 px-6">
            {HISTORICAL_SAFETY_DATA.map((item) => {
              const isSelected = selectedYear === item.year;
              const heightPercent = Math.max(0, ((item.index - 18) / (50 - 18)) * 100);
              const isPeak = item.year === 2016;

              return (
                <div
                  key={item.year}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  onClick={() => setSelectedYear(item.year)}
                >
                  <div className="mb-1 text-center opacity-90 transition-transform group-hover:scale-110">
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        isPeak
                          ? 'text-red-400'
                          : isSelected
                          ? 'text-[#f3c1cd]'
                          : 'text-teal-100'
                      }`}
                    >
                      {item.index}
                    </span>
                  </div>

                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      isPeak
                        ? 'bg-gradient-to-t from-red-700 to-red-400 shadow-md shadow-red-500/20'
                        : isSelected
                        ? 'bg-gradient-to-t from-[#d8839a] to-[#f3c1cd] shadow-md shadow-[#e8a0b2]/25'
                        : 'bg-teal-500/70 group-hover:bg-teal-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  <span
                    className={`text-[10px] sm:text-[11px] font-mono mt-2 transition-colors ${
                      isSelected
                        ? 'text-white font-bold'
                        : 'text-teal-200/70 group-hover:text-white'
                    }`}
                  >
                    {item.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Year Insight Card */}
        {selectedYearData && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#061317]/90 border border-teal-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#f3c1cd] text-sm">
                {selectedYearData.year}:
              </span>
              <span className="text-teal-50">
                Endeks Değeri:{' '}
                <strong className="text-white font-mono">{selectedYearData.index}</strong> puan
              </span>
              <span className="text-teal-200/50 hidden sm:inline">·</span>
              <span className="text-teal-200/70 italic">{selectedYearData.description}</span>
            </div>

            <span className="text-[11px] text-teal-200/60 font-mono">
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
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/40">
                <TrainFront className="w-4 h-4" />
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Ankara EGO Toplu Taşıma Yolcu Verileri (Ekim 2024 - 53.3 Milyon Yolcu)
              </h3>
            </div>
            <p className="text-xs text-teal-200/70 mt-1">
              Yüklenen Excel tablosuna dayalı resmi yolcu sayıları. Mahallelerin ulaşım
              erişilebilirliği bu ağ yoğunluğuna göre ağırlıklandırılmıştır.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#061317] p-1 rounded-xl border border-teal-900/70 overflow-x-auto">
            {[
              'all',
              'Şehir İçi Raylı',
              'EGO Otobüs',
              'Özel Toplu Taşıma',
              'Çevre İlçe Hatları',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTransportCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  transportCategory === cat
                    ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold'
                    : 'text-teal-200/70 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Tüm Taşıma Türleri' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Big Key Figures Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-[#061317]/80 border border-teal-900/70">
            <span className="text-[11px] text-teal-200/70 block mb-0.5">Toplam Aylık Yolcu</span>
            <span className="text-lg sm:text-xl font-display font-extrabold text-white tabular-nums">
              {TOTAL_MONTHLY_EGO_PASSENGERS.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-teal-300 block font-mono">%100 Kent İçi Hareket</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#061317]/80 border border-teal-900/70">
            <span className="text-[11px] text-teal-200/70 block mb-0.5">EGO Otobüs Seferleri</span>
            <span className="text-lg sm:text-xl font-display font-bold text-teal-300 tabular-nums">
              25.319.996
            </span>
            <span className="text-[10px] text-teal-200/60 block font-mono">%47.5 Pay (Lider)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#061317]/80 border border-teal-900/70">
            <span className="text-[11px] text-teal-200/70 block mb-0.5">Metro & Raylı Hatlar</span>
            <span className="text-lg sm:text-xl font-display font-bold text-emerald-400 tabular-nums">
              19.168.284
            </span>
            <span className="text-[10px] text-teal-200/60 block font-mono">
              Metro + Ankaray + TCDD
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#061317]/80 border border-teal-900/70">
            <span className="text-[11px] text-teal-200/70 block mb-0.5">ÖHO & ÖTA Şehir İçi</span>
            <span className="text-lg sm:text-xl font-display font-bold text-[#f3c1cd] tabular-nums">
              8.196.418
            </span>
            <span className="text-[10px] text-teal-200/60 block font-mono">
              %15.4 Özel Taşıma Payı
            </span>
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
                className="p-3 rounded-xl bg-[#061317]/75 border border-teal-900/70 hover:border-teal-400/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teal-50">{item.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 border border-teal-400/30 text-teal-300 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-teal-50 font-bold">
                      {item.passengers.toLocaleString('tr-TR')} yolcu
                    </span>
                    <span className="text-[#f3c1cd] font-bold min-w-[45px] text-right">
                      %{item.percentage.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#0b1f26] overflow-hidden border border-teal-900/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBus ? 'bg-teal-400' : isRail ? 'bg-emerald-400' : 'bg-[#e8a0b2]'
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
      <div className="rounded-3xl glass-panel neon-border p-5 sm:p-6 shadow-xl">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/40">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Ankara Mahalleleri: Güvenlik vs Yaşanabilirlik Karşılaştırma Matrisi
            </h3>
          </div>
          <p className="text-xs text-teal-200/70 mt-1">
            Her kart mahallenin güvenlik, ulaşım ve kira dengesini gösterir. Tıklayarak detaylı
            karnesini inceleyebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {neighborhoods.map((n) => {
            const dangerous = isDangerousNeighborhood(n);
            return (
              <div
                key={n.id}
                onClick={() => onSelectNeighborhood(n)}
                className="p-3.5 rounded-xl bg-[#061317]/80 border border-teal-900/70 hover:border-[#e8a0b2]/65 cursor-pointer transition-all hover:bg-[#0b1f26] group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-[#f3c1cd] transition-colors">
                      {n.name}
                    </h4>
                    <span className="text-[11px] text-teal-200/70 font-mono">{n.district}</span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      n.livabilityScore >= 90
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : n.livabilityScore >= 75
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {n.livabilityScore} / 100
                  </div>
                </div>

                {/* Progress meters */}
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-teal-200/70">
                    <span>Güvenlik:</span>
                    <span
                      className="font-bold"
                      style={{ color: getScoreColor(n.safetyScore, dangerous) }}
                    >
                      {n.safetyScore} ({n.crimeRateCategory})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-teal-200/70">
                    <span>Ulaşım & EGO:</span>
                    <span className="text-teal-300">{n.transportScore}</span>
                  </div>
                  <div className="flex items-center justify-between text-teal-200/70">
                    <span>Ortalama Kira:</span>
                    <span className="text-white">{(n.averageRent / 1000).toFixed(0)}k ₺</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-teal-900/70 text-[11px] text-teal-200/70 line-clamp-1 italic">
                  "{n.vibe}"
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
