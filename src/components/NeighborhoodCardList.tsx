import React, { useState, useEffect } from 'react';
import { DistrictSummary, NeighborhoodData } from '../types';
import {
  ArrowUpDown,
  ShieldAlert,
  GraduationCap,
  TrainFront,
  PartyPopper,
  Coins,
  Scale,
  ChevronRight,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import {
  ReferencePoint,
  calculateDistanceKm,
  getScoreColor,
  isDangerousNeighborhood,
} from '../data/ankaraData';
import { DistrictSummaryCard } from './DistrictSummaryCard';

export type SortOption = 'livabilityDesc' | 'safetyDesc' | 'rentAsc' | 'distanceAsc';

interface NeighborhoodCardListProps {
  neighborhoods: NeighborhoodData[];
  onSelectNeighborhood: (n: NeighborhoodData) => void;
  onAddToCompare: (n: NeighborhoodData) => void;
  comparedIds: string[];
  referencePoint?: ReferencePoint | null;
  selectedDistrictSummary?: DistrictSummary | null;
  onResetDistrict?: () => void;
}

export const NeighborhoodCardList: React.FC<NeighborhoodCardListProps> = ({
  neighborhoods,
  onSelectNeighborhood,
  onAddToCompare,
  comparedIds,
  referencePoint,
  selectedDistrictSummary,
  onResetDistrict,
}) => {
  const hasReferencePoint = Boolean(referencePoint && referencePoint.id !== 'none');
  const [sortOption, setSortOption] = useState<SortOption>('livabilityDesc');

  useEffect(() => {
    if (!hasReferencePoint && sortOption === 'distanceAsc') {
      setSortOption('livabilityDesc');
    }
  }, [hasReferencePoint, sortOption]);

  const getDistance = (n: NeighborhoodData): number | null => {
    if (!hasReferencePoint || !referencePoint) return null;
    return calculateDistanceKm(referencePoint.lat, referencePoint.lng, n.lat, n.lng);
  };

  const sortedNeighborhoods = [...neighborhoods].sort((a, b) => {
    if (sortOption === 'safetyDesc') {
      return b.safetyScore - a.safetyScore;
    }
    if (sortOption === 'rentAsc') {
      return a.averageRent - b.averageRent;
    }
    if (sortOption === 'distanceAsc' && hasReferencePoint && referencePoint) {
      const distA = calculateDistanceKm(referencePoint.lat, referencePoint.lng, a.lat, a.lng);
      const distB = calculateDistanceKm(referencePoint.lat, referencePoint.lng, b.lat, b.lng);
      return distA - distB;
    }
    return b.livabilityScore - a.livabilityScore;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* District Summary Card if a district with 0 or few pins is selected */}
      {selectedDistrictSummary && sortedNeighborhoods.length <= 1 && onResetDistrict && (
        <DistrictSummaryCard
          district={selectedDistrictSummary}
          matchingPinsCount={sortedNeighborhoods.length}
          onResetDistrict={onResetDistrict}
        />
      )}

      {/* Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-[#e8a0b2]/25 text-xs">
        <div className="flex items-center gap-1.5 text-teal-200/70">
          <ArrowUpDown className="w-4 h-4 text-[#e8a0b2]" />
          <span className="font-semibold text-white">Sıralama Ölçütü:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSortOption('livabilityDesc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              sortOption === 'livabilityDesc'
                ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold shadow-sm shadow-[#e8a0b2]/25'
                : 'bg-[#061317] text-teal-100/80 border border-teal-900/70 hover:text-white hover:border-[#e8a0b2]/40'
            }`}
          >
            Yaşanabilirlik Puanı (Yüksekten Düşüğe)
          </button>

          <button
            type="button"
            onClick={() => setSortOption('safetyDesc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              sortOption === 'safetyDesc'
                ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold shadow-sm shadow-[#e8a0b2]/25'
                : 'bg-[#061317] text-teal-100/80 border border-teal-900/70 hover:text-white hover:border-[#e8a0b2]/40'
            }`}
          >
            Güvenlik Puanı (En Güvenli)
          </button>

          <button
            type="button"
            onClick={() => setSortOption('rentAsc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              sortOption === 'rentAsc'
                ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold shadow-sm shadow-[#e8a0b2]/25'
                : 'bg-[#061317] text-teal-100/80 border border-teal-900/70 hover:text-white hover:border-[#e8a0b2]/40'
            }`}
          >
            Ortalama Kira (Düşükten Yükseğe)
          </button>

          {hasReferencePoint && (
            <button
              type="button"
              onClick={() => setSortOption('distanceAsc')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                sortOption === 'distanceAsc'
                  ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold shadow-sm shadow-[#e8a0b2]/25'
                  : 'bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/40 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Referans Noktasına En Yakın</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State without a district selected */}
      {sortedNeighborhoods.length === 0 && !selectedDistrictSummary && (
        <div className="rounded-3xl glass-panel border border-teal-900/70 p-8 text-center text-sm text-teal-200/70">
          Seçili kriterlerle eşleşen mahalle bulunamadı. Filtreleri gevşeterek tekrar deneyebilirsiniz.
        </div>
      )}

      {/* Grid of Neighborhood Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNeighborhoods.map((n, index) => {
          const isCompared = comparedIds.includes(n.id);
          const isTopTier = n.livabilityScore >= 90;
          const isDangerous = isDangerousNeighborhood(n);
          const distanceKm = getDistance(n);

          return (
            <div
              key={n.id}
              className={`rounded-2xl border border-[#e8a0b2]/20 p-5 flex flex-col justify-between transition-all hover:border-[#e8a0b2]/55 glass-panel shadow-md ${
                isTopTier
                  ? 'ring-1 ring-emerald-500/30'
                  : isDangerous
                  ? 'ring-1 ring-red-500/40'
                  : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#f3c1cd]">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-mono text-teal-200/70">{n.district}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-base">{n.name}</h3>
                  </div>

                  {/* Main Badge */}
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-xl text-emerald-400">
                      {n.livabilityScore}
                      <span className="text-[10px] text-teal-200/60 font-sans font-normal ml-0.5">
                        /100
                      </span>
                    </div>
                    <span className="text-[10px] text-teal-200/70 font-mono block">
                      Yaşam Skoru
                    </span>
                  </div>
                </div>

                {/* Distance Badge when reference point is active */}
                {distanceKm !== null && referencePoint && (
                  <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] text-[11px] font-mono font-semibold">
                    <Navigation className="w-3 h-3 text-[#e8a0b2] shrink-0" />
                    <span>
                      {referencePoint.label}: Seçili noktaya {distanceKm.toFixed(1)} km
                    </span>
                  </div>
                )}

                {/* Vibe Quote */}
                <p className="text-xs text-[#f3c1cd]/90 italic mb-4 line-clamp-1">"{n.vibe}"</p>

                {/* 5-Criteria Meters Bar */}
                <div className="space-y-2 text-xs font-mono mb-4 pt-2 border-t border-teal-900/70">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-200/70 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#e8a0b2]" />
                      Güvenlik & Asayiş:
                    </span>
                    <span
                      style={{
                        color: getScoreColor(n.safetyScore, isDangerous),
                        fontWeight: 'bold',
                      }}
                    >
                      {n.safetyScore}/100 ({n.crimeRateCategory})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-teal-200/70 flex items-center gap-1.5">
                      <TrainFront className="w-3.5 h-3.5 text-teal-300" />
                      Ulaşım & EGO:
                    </span>
                    <span className="text-teal-300 font-bold">{n.transportScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-teal-200/70 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
                      Eğitim Kalitesi:
                    </span>
                    <span className="text-teal-50 font-bold">{n.educationScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-teal-200/70 flex items-center gap-1.5">
                      <PartyPopper className="w-3.5 h-3.5 text-[#e8a0b2]" />
                      Eğlence & Parklar:
                    </span>
                    <span className="text-[#f3c1cd] font-bold">{n.entertainmentScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-teal-200/70 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-[#e8a0b2]" />
                      Ortalama Kira:
                    </span>
                    <span className="text-white font-bold">
                      {n.averageRent.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>

                {/* Verdict Brief */}
                <div className="p-2.5 rounded-xl bg-[#061317]/80 border border-teal-900/70 text-[11px] text-teal-100/90 line-clamp-2">
                  <span className="text-[#f3c1cd] font-bold mr-1">Karar:</span>
                  {n.verdictSummary}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-teal-900/70">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${n.lat}&mlon=${n.lng}#map=15/${n.lat}/${n.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-xs font-medium rounded-lg border border-teal-900/70 bg-[#061317] hover:bg-teal-500/20 text-teal-300 transition-colors flex items-center justify-center shrink-0"
                  title="OpenStreetMap'te Aç"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => onAddToCompare(n)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    isCompared
                      ? 'bg-teal-500/20 text-teal-300 border-teal-400/40'
                      : 'bg-[#061317] text-teal-100 border-teal-900/70 hover:bg-teal-500/15'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared ? 'Seçildi' : 'Kıyasla'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectNeighborhood(n)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 text-slate-950 shadow-sm shadow-[#e8a0b2]/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Karnesini Gör</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
