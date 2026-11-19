import React, { useState } from 'react';
import {
  ANKARA_DISTRICTS,
  FilterState,
  REFERENCE_POINTS,
  isCustomWeightsActive,
  normalizeScoreWeights,
} from '../data/ankaraData';
import { ScoreWeights } from '../types';
import {
  Search,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Building2,
  Users,
  GraduationCap,
  MapPin,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Trees,
  Coins,
} from 'lucide-react';

interface FilterControlsProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
  scoreWeights: ScoreWeights;
  onWeightsChange: (newWeights: ScoreWeights) => void;
  onResetWeights: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
  scoreWeights,
  onWeightsChange,
  onResetWeights,
}) => {
  const [weightsOpen, setWeightsOpen] = useState<boolean>(false);

  const normalized = normalizeScoreWeights(scoreWeights);
  const customWeightsActive = isCustomWeightsActive(scoreWeights);

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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300/70" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Mahalle veya ilçe ara (örn: Tunalı, Batıkent, Eryaman, Çankaya)..."
            className="w-full pl-10 pr-8 py-2 text-xs rounded-xl bg-[#061317] border border-[#e8a0b2]/30 text-teal-50 placeholder-teal-200/50 focus:outline-none focus:border-[#e8a0b2] transition-colors"
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teal-200/60 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Presets + Custom Weighting Toggle */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-teal-200/70 uppercase tracking-wider hidden sm:inline mr-1">
            Hızlı Profil:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('safe')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#061317]/90 hover:bg-[#e8a0b2]/15 text-teal-50 border border-teal-900/70 hover:border-[#e8a0b2]/40 whitespace-nowrap transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maksimum Güvenlik</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('family')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#061317]/90 hover:bg-[#e8a0b2]/15 text-teal-50 border border-teal-900/70 hover:border-[#e8a0b2]/40 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#f3c1cd]" />
            <span>Aileler İçin</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('student')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#061317]/90 hover:bg-teal-500/20 text-teal-50 border border-teal-900/70 hover:border-teal-400/40 whitespace-nowrap transition-colors cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
            <span>Öğrenci & Gençlik</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('metro')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#061317]/90 hover:bg-teal-500/20 text-teal-50 border border-teal-900/70 hover:border-teal-400/40 whitespace-nowrap transition-colors cursor-pointer"
          >
            <TrainFront className="w-3.5 h-3.5 text-teal-300" />
            <span>Metrolu / Raylı Hat</span>
          </button>

          <button
            type="button"
            onClick={() => setWeightsOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
              weightsOpen || customWeightsActive
                ? 'bg-[#e8a0b2]/20 text-[#f3c1cd] border-[#e8a0b2]/55 font-semibold'
                : 'bg-[#061317]/90 text-teal-50 border-teal-900/70 hover:border-[#e8a0b2]/40'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#f3c1cd]" />
            <span>Skor Ağırlıkları</span>
            {customWeightsActive && (
              <span className="px-1.5 py-0.2 rounded bg-[#e8a0b2] text-slate-950 text-[10px] font-mono font-bold">
                Özel
              </span>
            )}
            {weightsOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-lg text-teal-200/70 hover:text-white hover:bg-teal-500/20 transition-colors cursor-pointer"
            title="Filtreleri Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Custom Weighting Panel */}
      {weightsOpen && (
        <div className="p-4 rounded-2xl bg-[#061317]/85 border border-[#e8a0b2]/35 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-display font-bold text-[#f3c1cd] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#e8a0b2]" />
                <span>Kişiselleştirilmiş Yaşam Skoru Ağırlıkları (Otomatik %100 Normalize)</span>
              </h4>
              <p className="text-[11px] text-teal-200/70 mt-0.5">
                Her kriteri %0–%100 arası ayarlayın; harita pin renkleri, boyutları ve sıralama anlık güncellenir.
              </p>
            </div>
            {customWeightsActive && (
              <button
                type="button"
                onClick={onResetWeights}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0b1f26] hover:bg-[#e8a0b2]/20 text-[#f3c1cd] border border-[#e8a0b2]/35 text-[11px] font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Varsayılana Dön</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Güvenlik Weight */}
            <div className="p-2.5 rounded-xl bg-[#0b1f26]/80 border border-teal-900/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-teal-50 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f3c1cd]" />
                  Güvenlik
                </span>
                <span className="font-mono font-bold text-[#f3c1cd]">
                  %{Math.round(normalized.safety)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scoreWeights.safety}
                onChange={(e) =>
                  onWeightsChange({ ...scoreWeights, safety: Number(e.target.value) })
                }
                className="w-full accent-[#e8a0b2] bg-[#061317] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Ulaşım Weight */}
            <div className="p-2.5 rounded-xl bg-[#0b1f26]/80 border border-teal-900/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-teal-50 font-medium">
                  <TrainFront className="w-3.5 h-3.5 text-teal-300" />
                  Ulaşım
                </span>
                <span className="font-mono font-bold text-teal-300">
                  %{Math.round(normalized.transport)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scoreWeights.transport}
                onChange={(e) =>
                  onWeightsChange({ ...scoreWeights, transport: Number(e.target.value) })
                }
                className="w-full accent-teal-400 bg-[#061317] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Kira / Ekonomi Weight */}
            <div className="p-2.5 rounded-xl bg-[#0b1f26]/80 border border-teal-900/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-teal-50 font-medium">
                  <Coins className="w-3.5 h-3.5 text-[#f3c1cd]" />
                  Kira / Ekonomi
                </span>
                <span className="font-mono font-bold text-[#f3c1cd]">
                  %{Math.round(normalized.economy)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scoreWeights.economy}
                onChange={(e) =>
                  onWeightsChange({ ...scoreWeights, economy: Number(e.target.value) })
                }
                className="w-full accent-[#e8a0b2] bg-[#061317] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Yeşil Alan / Sosyal Yaşam Weight */}
            <div className="p-2.5 rounded-xl bg-[#0b1f26]/80 border border-teal-900/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-teal-50 font-medium">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  Yeşil Alan & Sosyal
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  %{Math.round(normalized.entertainment)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scoreWeights.entertainment}
                onChange={(e) =>
                  onWeightsChange({ ...scoreWeights, entertainment: Number(e.target.value) })
                }
                className="w-full accent-emerald-400 bg-[#061317] h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* District & Reference Point Selector Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-teal-900/70 text-xs">
        <div>
          <label
            htmlFor="district-select"
            className="flex items-center gap-1.5 text-teal-200/80 font-medium mb-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            <span>İlçe Seçimi (25 Ankara İlçesi):</span>
          </label>
          <select
            id="district-select"
            value={filter.selectedDistrict}
            onChange={(e) => onFilterChange({ ...filter, selectedDistrict: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[#061317] border border-[#e8a0b2]/30 text-teal-50 focus:outline-none focus:border-[#e8a0b2] transition-colors cursor-pointer"
          >
            <option value="all">Tüm Ankara İlçeleri (25 İlçe)</option>
            {ANKARA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.plate})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="reference-point-select"
            className="flex items-center gap-1.5 text-teal-200/80 font-medium mb-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-[#f3c1cd]" />
            <span>Referans Noktam (Okula / İşe Mesafe):</span>
          </label>
          <select
            id="reference-point-select"
            value={filter.selectedReferencePointId}
            onChange={(e) =>
              onFilterChange({ ...filter, selectedReferencePointId: e.target.value })
            }
            className="w-full px-3 py-2 rounded-xl bg-[#061317] border border-[#e8a0b2]/30 text-teal-50 focus:outline-none focus:border-[#e8a0b2] transition-colors cursor-pointer"
          >
            {REFERENCE_POINTS.map((refPt) => (
              <option key={refPt.id} value={refPt.id}>
                {refPt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sliders Grid: Yaşanabilirlik, Güvenlik, Ulaşım, Max Kira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-teal-900/70 text-xs">
        {/* Min Yaşanabilirlik */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-teal-50">
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
            className="w-full accent-emerald-400 bg-[#061317] h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Min Güvenlik */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-teal-50">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f3c1cd]" />
              Min. Güvenlik Puanı:
            </span>
            <span className="font-mono font-bold text-[#f3c1cd]">
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
            className="w-full accent-[#e8a0b2] bg-[#061317] h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Min Ulaşım */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-teal-50">
            <span className="flex items-center gap-1 font-medium">
              <TrainFront className="w-3.5 h-3.5 text-teal-300" />
              Min. Ulaşım & EGO:
            </span>
            <span className="font-mono font-bold text-teal-300">
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
            className="w-full accent-teal-400 bg-[#061317] h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Maksimum Kira */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-teal-50">
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#f3c1cd]" />
              Maksimum Kira:
            </span>
            <span className="font-mono font-bold text-[#f3c1cd]">
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
            className="w-full accent-[#e8a0b2] bg-[#061317] h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Filter Summary Counter */}
      <div className="flex items-center justify-between text-[11px] text-teal-200/70 pt-2 border-t border-teal-900/70 font-mono">
        <span>
          Toplam <strong className="text-white">{totalCount}</strong> mahalleden{' '}
          <strong className="text-[#f3c1cd]">{filteredCount}</strong> tanesi filtrelendi
          {customWeightsActive && (
            <span className="ml-2 text-[#e8a0b2]">(Özel skor ağırlıkları aktif)</span>
          )}
        </span>
        {(filteredCount < totalCount ||
          filter.selectedDistrict !== 'all' ||
          filter.selectedReferencePointId !== 'none') && (
          <button
            type="button"
            onClick={onReset}
            className="text-[#f3c1cd] hover:underline cursor-pointer"
          >
            Filtreleri temizle
          </button>
        )}
      </div>
    </div>
  );
};
