import React from 'react';
import {
  Layers,
  BarChart3,
  Scale,
  Upload,
  FileText,
  Sparkles,
} from 'lucide-react';
import { LayerType } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  activeTab: 'map' | 'analytics' | 'rankings';
  onTabChange: (tab: 'map' | 'analytics' | 'rankings') => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  compareCount,
  onOpenCompare,
  onOpenUpload,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#061317]/90 backdrop-blur-md border-b border-[#e8a0b2]/25 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Custom Atakule & Shield Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo className="w-10 h-10 sm:w-11 sm:h-11" />
          <div className="flex flex-col">
            <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap leading-tight">
              Ankara Yaşam & Güvenlik Atlası
            </span>
            <span className="mt-0.5 inline-flex items-center w-fit px-2 py-0.5 rounded-md bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[10px] text-[#f3c1cd] font-mono font-semibold tracking-wide">
              Kentsel Veri & Analiz Portalı
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Primary Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-[#0b1f26]/90 rounded-xl border border-[#e8a0b2]/25">
          <button
            type="button"
            onClick={() => onTabChange('map')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-semibold shadow-md shadow-[#e8a0b2]/25'
                : 'text-teal-100/80 hover:text-white hover:bg-[#e8a0b2]/15'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Etkileşimli Harita
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('analytics')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-semibold shadow-md shadow-[#e8a0b2]/25'
                : 'text-teal-100/80 hover:text-white hover:bg-[#e8a0b2]/15'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              EGO & Suç Analizleri
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('rankings')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rankings'
                ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-semibold shadow-md shadow-[#e8a0b2]/25'
                : 'text-teal-100/80 hover:text-white hover:bg-[#e8a0b2]/15'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Mahalle Karneleri
            </span>
          </button>
        </nav>

        {/* Zone 3: Functional Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dataset Upload Trigger */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-50 bg-[#0b1f26] hover:bg-[#e8a0b2]/15 border border-[#e8a0b2]/30 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Kendi veri setinizi yükleyin (CSV / JSON / EGO)"
          >
            <Upload className="w-3.5 h-3.5 text-[#f3c1cd]" />
            <span className="hidden sm:inline">Veri Seti Yükle</span>
          </button>

          {/* Comparison Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
              compareCount > 0
                ? 'bg-[#e8a0b2]/20 text-[#f3c1cd] border-[#e8a0b2]/50'
                : 'bg-[#0b1f26] text-teal-50 border-teal-900/70 hover:bg-[#e8a0b2]/15'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-teal-300" />
            <span>Karşılaştır</span>
            {compareCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#e8a0b2] text-slate-950 rounded text-[10px] font-mono font-bold">
                {compareCount}
              </span>
            )}
          </button>

          {/* Export Report Trigger */}
          <button
            type="button"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-[#f3c1cd] via-[#e8a0b2] to-[#d8839a] hover:brightness-105 rounded-lg shadow-sm shadow-[#e8a0b2]/30 transition-all whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Rapor Al</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-[#e8a0b2]/20">
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium transition-all ${
            activeTab === 'map'
              ? 'bg-[#e8a0b2] text-slate-950 font-bold'
              : 'text-teal-200/70'
          }`}
        >
          Harita
        </button>
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#e8a0b2] text-slate-950 font-bold'
              : 'text-teal-200/70'
          }`}
        >
          EGO & İstatistikler
        </button>
        <button
          type="button"
          onClick={() => onTabChange('rankings')}
          className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium transition-all ${
            activeTab === 'rankings'
              ? 'bg-[#e8a0b2] text-slate-950 font-bold'
              : 'text-teal-200/70'
          }`}
        >
          Mahalleler
        </button>
      </div>
    </header>
  );
};
