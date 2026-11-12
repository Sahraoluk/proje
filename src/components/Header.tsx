import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  BarChart3, 
  Scale, 
  Upload, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { LayerType } from '../types';

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
  activeLayer,
  onLayerChange,
  activeTab,
  onTabChange,
  compareCount,
  onOpenCompare,
  onOpenUpload,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Ankara Yaşam & Güvenlik Atlası
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Statbase & EGO 2024 Doğrulanmış Verileri
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Primary Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('map')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Etkileşimli Harita
            </span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              EGO & Suç Analizleri
            </span>
          </button>

          <button
            onClick={() => onTabChange('rankings')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'rankings'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
            title="Kendi veri setinizi yükleyin (CSV / JSON / EGO)"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Veri Seti Yükle</span>
          </button>

          {/* Comparison Drawer Trigger */}
          <button
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              compareCount > 0
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>Karşılaştır</span>
            {compareCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-500 text-white rounded text-[10px] font-mono font-bold">
                {compareCount}
              </span>
            )}
          </button>

          {/* Export Report Trigger */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm shadow-amber-500/30 transition-all whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Rapor Al</span>
          </button>
        </div>

      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onTabChange('map')}
          className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium transition-all ${
            activeTab === 'map' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Harita
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium transition-all ${
            activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          EGO & İstatistikler
        </button>
        <button
          onClick={() => onTabChange('rankings')}
          className={`flex-1 py-1.5 text-xs text-center rounded-lg font-medium transition-all ${
            activeTab === 'rankings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Mahalleler
        </button>
      </div>
    </header>
  );
};
