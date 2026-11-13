import React from 'react';
import { DistrictSummary } from '../types';
import { MapPin, ShieldCheck, TrainFront, GraduationCap, PartyPopper, Sparkles, RotateCcw } from 'lucide-react';

interface DistrictSummaryCardProps {
  district: DistrictSummary;
  matchingPinsCount: number;
  onResetDistrict: () => void;
}

export const DistrictSummaryCard: React.FC<DistrictSummaryCardProps> = ({
  district,
  matchingPinsCount,
  onResetDistrict,
}) => {
  return (
    <div className="rounded-3xl glass-panel neon-border p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#e8a0b2]/20 border border-[#e8a0b2]/40 text-[#f3c1cd] font-mono text-[11px] font-bold">
                {district.plate}
              </span>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                {district.name} İlçesi Özet Profili
              </h3>
            </div>
            <p className="text-xs text-teal-200/70 mt-1">
              {matchingPinsCount === 0
                ? 'Seçili filtrelere veya bu ilçeye ait harita pini bulunmadığı için ilçe geneli özet istatistikleri gösteriliyor.'
                : `Bu ilçede mevcut filtrelerle eşleşen ${matchingPinsCount} mahalle pini bulunuyor. İlçe geneli özet verileri aşağıdadır.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetDistrict}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 text-slate-950 font-bold text-xs shadow-sm shadow-[#e8a0b2]/20 transition-all shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Tüm İlçeleri Göster</span>
        </button>
      </div>

      <p className="text-sm text-teal-50 leading-relaxed bg-[#061317]/70 border border-teal-900/70 rounded-2xl p-4">
        {district.summary}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#061317]/80 border border-teal-900/70">
          <span className="text-teal-200/70 flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#e8a0b2]" />
            Yaşanabilirlik
          </span>
          <span className="font-mono font-extrabold text-lg text-white">
            {district.averageLivability}
            <span className="text-[11px] text-teal-200/60 font-normal">/100</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#061317]/80 border border-teal-900/70">
          <span className="text-teal-200/70 flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            Güvenlik
          </span>
          <span className="font-mono font-extrabold text-lg text-white">
            {district.averageSafety}
            <span className="text-[11px] text-teal-200/60 font-normal">/100</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#061317]/80 border border-teal-900/70">
          <span className="text-teal-200/70 flex items-center gap-1 mb-1">
            <TrainFront className="w-3.5 h-3.5 text-teal-300" />
            Ulaşım
          </span>
          <span className="font-mono font-extrabold text-lg text-white">
            {district.averageTransport}
            <span className="text-[11px] text-teal-200/60 font-normal">/100</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#061317]/80 border border-teal-900/70">
          <span className="text-teal-200/70 flex items-center gap-1 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
            Eğitim
          </span>
          <span className="font-mono font-extrabold text-lg text-white">
            {district.averageEducation}
            <span className="text-[11px] text-teal-200/60 font-normal">/100</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#061317]/80 border border-teal-900/70 col-span-2 sm:col-span-1">
          <span className="text-teal-200/70 flex items-center gap-1 mb-1">
            <PartyPopper className="w-3.5 h-3.5 text-[#e8a0b2]" />
            Sosyal Yaşam
          </span>
          <span className="font-mono font-extrabold text-lg text-white">
            {district.averageEntertainment}
            <span className="text-[11px] text-teal-200/60 font-normal">/100</span>
          </span>
        </div>
      </div>
    </div>
  );
};
