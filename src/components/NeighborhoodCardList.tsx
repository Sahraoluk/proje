import React, { useState } from 'react';
import { NeighborhoodData } from '../types';
import { 
  ArrowUpDown, 
  Sparkles, 
  ShieldAlert, 
  GraduationCap, 
  TrainFront, 
  PartyPopper, 
  Coins, 
  Scale, 
  ChevronRight,
  ThumbsUp,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface NeighborhoodCardListProps {
  neighborhoods: NeighborhoodData[];
  onSelectNeighborhood: (n: NeighborhoodData) => void;
  onAddToCompare: (n: NeighborhoodData) => void;
  comparedIds: string[];
}

export const NeighborhoodCardList: React.FC<NeighborhoodCardListProps> = ({
  neighborhoods,
  onSelectNeighborhood,
  onAddToCompare,
  comparedIds,
}) => {
  const [sortBy, setSortBy] = useState<keyof NeighborhoodData>('livabilityScore');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const handleSort = (field: keyof NeighborhoodData) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const sortedNeighborhoods = [...neighborhoods].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'desc' ? valB - valA : valA - valB;
    }
    return 0;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ArrowUpDown className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Sıralama Ölçütü:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleSort('livabilityScore')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'livabilityScore'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Yaşanabilirlik {sortBy === 'livabilityScore' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('safetyScore')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'safetyScore'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Güvenlik {sortBy === 'safetyScore' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('transportScore')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'transportScore'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Ulaşım {sortBy === 'transportScore' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('educationScore')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'educationScore'
                ? 'bg-indigo-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Eğitim {sortBy === 'educationScore' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('entertainmentScore')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'entertainmentScore'
                ? 'bg-pink-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Eğlence {sortBy === 'entertainmentScore' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('averageRent')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'averageRent'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Kira {sortBy === 'averageRent' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Grid of Neighborhood Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNeighborhoods.map((n, index) => {
          const isCompared = comparedIds.includes(n.id);
          const isTopTier = n.livabilityScore >= 90;
          const isHighCrime = n.safetyScore < 65;

          return (
            <div
              key={n.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:border-cyan-500/50 glass-panel shadow-md ${
                isTopTier ? 'ring-1 ring-emerald-500/30' : isHighCrime ? 'ring-1 ring-red-500/30' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-500">#{index + 1}</span>
                      <span className="text-xs font-mono text-slate-400">{n.district}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-base">
                      {n.name}
                    </h3>
                  </div>

                  {/* Main Badge */}
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-xl text-emerald-400">
                      {n.livabilityScore}
                      <span className="text-[10px] text-slate-500 font-sans font-normal ml-0.5">/100</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">Yaşam Skoru</span>
                  </div>
                </div>

                {/* Vibe Quote */}
                <p className="text-xs text-amber-300/90 italic mb-4 line-clamp-1">
                  "{n.vibe}"
                </p>

                {/* 5-Criteria Meters Bar */}
                <div className="space-y-2 text-xs font-mono mb-4 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      Güvenlik & Asayiş:
                    </span>
                    <span className={n.safetyScore >= 80 ? 'text-emerald-400 font-bold' : n.safetyScore >= 65 ? 'text-amber-400' : 'text-red-400 font-bold'}>
                      {n.safetyScore}/100 ({n.crimeRateCategory})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <TrainFront className="w-3.5 h-3.5 text-cyan-400" />
                      Ulaşım & EGO:
                    </span>
                    <span className="text-cyan-300 font-bold">{n.transportScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      Eğitim Kalitesi:
                    </span>
                    <span className="text-indigo-300 font-bold">{n.educationScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
                      Eğlence & Parklar:
                    </span>
                    <span className="text-pink-300 font-bold">{n.entertainmentScore}/100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      Ortalama Kira:
                    </span>
                    <span className="text-white font-bold">{n.averageRent.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>

                {/* Verdict Brief */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 line-clamp-2">
                  <span className="text-amber-400 font-bold mr-1">Karar:</span>
                  {n.verdictSummary}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${n.lat},${n.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-cyan-400 transition-colors flex items-center justify-center shrink-0"
                  title="Google Maps'te Aç"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => onAddToCompare(n)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                    isCompared
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared ? 'Seçildi' : 'Kıyasla'}</span>
                </button>

                <button
                  onClick={() => onSelectNeighborhood(n)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center justify-center gap-1"
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
