import React from 'react';
import { FilterState } from '../data/ankaraData';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  TrainFront, 
  Building2,
  Users,
  GraduationCap
} from 'lucide-react';

interface FilterControlsProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const applyPreset = (preset: 'safe' | 'student' | 'family' | 'metro') => {
    if (preset === 'safe') {
      onFilterChange({
        ...filter,
        minSafety: 90,
        minLivability: 85,
        crimeFilter: 'Çok Düşük',
      });
    } else if (preset === 'student') {
      onFilterChange({
        ...filter,
        minEducation: 85,
        minTransport: 85,
        maxRent: 35000,
      });
    } else if (preset === 'family') {
      onFilterChange({
        ...filter,
        minSafety: 85,
        minLivability: 85,
        selectedDistrict: 'all',
      });
    } else if (preset === 'metro') {
      onFilterChange({
        ...filter,
        minTransport: 90,
      });
    }
  };

  return (
    <div className="rounded-3xl glass-panel neon-border p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* Top Search & Presets Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Mahalle veya ilçe ara (örn: Tunalı, Batıkent, Eryaman, Çankaya)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
            Hızlı Profil:
          </span>
          <button
            onClick={() => applyPreset('safe')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maksimum Güvenlik</span>
          </button>
          <button
            onClick={() => applyPreset('family')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Aileler İçin</span>
          </button>
          <button
            onClick={() => applyPreset('student')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Öğrenci & Gençlik</span>
          </button>
          <button
            onClick={() => applyPreset('metro')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-colors"
          >
            <TrainFront className="w-3.5 h-3.5 text-cyan-400" />
            <span>Metrolu / Raylı Hat</span>
          </button>
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Filtreleri Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Sliders Grid: Yaşanabilirlik, Güvenlik, Ulaşım, Max Kira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-800/80 text-xs">
        
        {/* Min Yaşanabilirlik */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Min. Yaşanabilirlik:
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {filter.minLivability > 0 ? `${filter.minLivability}+` : 'Tümü'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filter.minLivability}
            onChange={(e) => onFilterChange({ ...filter, minLivability: Number(e.target.value) })}
            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Min Güvenlik */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              Min. Güvenlik Puanı:
            </span>
            <span className="font-mono font-bold text-rose-400">
              {filter.minSafety > 0 ? `${filter.minSafety}+` : 'Tümü'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filter.minSafety}
            onChange={(e) => onFilterChange({ ...filter, minSafety: Number(e.target.value) })}
            className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Min Ulaşım */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <TrainFront className="w-3.5 h-3.5 text-cyan-400" />
              Min. Ulaşım & EGO:
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {filter.minTransport > 0 ? `${filter.minTransport}+` : 'Tümü'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filter.minTransport}
            onChange={(e) => onFilterChange({ ...filter, minTransport: Number(e.target.value) })}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Maksimum Kira */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Maksimum Kira:
            </span>
            <span className="font-mono font-bold text-amber-400">
              {filter.maxRent >= 60000 ? 'Sınırsız' : `${(filter.maxRent / 1000).toFixed(0)}k ₺`}
            </span>
          </div>
          <input
            type="range"
            min="15000"
            max="60000"
            step="2500"
            value={filter.maxRent}
            onChange={(e) => onFilterChange({ ...filter, maxRent: Number(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

      </div>

      {/* Filter Summary Counter */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
        <span>
          Toplam <strong>{totalCount}</strong> mahalleden <strong>{filteredCount}</strong> tanesi filtrelendi
        </span>
        {filteredCount < totalCount && (
          <button
            onClick={onReset}
            className="text-amber-400 hover:underline"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

    </div>
  );
};
