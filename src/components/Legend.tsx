import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-[500] bg-[#0b1f26]/90 backdrop-blur-md border border-[#e8a0b2]/30 p-3 rounded-xl shadow-xl text-xs text-teal-50 max-w-[235px] pointer-events-auto">
      <h4 className="font-display font-bold text-[11px] uppercase tracking-wider text-[#f3c1cd] mb-2">
        Harita Skala & Risk Rehberi
      </h4>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444] border border-white" />
          </span>
          <span className="text-red-300 font-semibold leading-tight">
            Tehlikeli / Yüksek Riskli Mahalle
          </span>
        </div>

        <div className="h-px bg-teal-900/70 my-1" />

        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#10b981] border border-white/80 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
          <span>75 - 100: Güvenli / Çok İyi</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-white/80 shadow-[0_0_8px_rgba(245,158,11,0.45)] shrink-0" />
          <span>55 - 74: Orta Seviye</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white/80 shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
          <span>0 - 54: Düşük Skor / Riskli</span>
        </div>
      </div>
    </div>
  );
};
