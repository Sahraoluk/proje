import React from 'react';
import { NeighborhoodData } from '../types';
import { X, Printer, FileText, ShieldAlert, Sparkles } from 'lucide-react';

interface CustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodData[];
  selectedDistrict: string;
}

export const CustomReportModal: React.FC<CustomReportModalProps> = ({
  isOpen,
  onClose,
  neighborhoods,
  selectedDistrict,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const sortedByLivability = [...neighborhoods].sort(
    (a, b) => b.livabilityScore - a.livabilityScore
  );
  const highestCrimeAlerts = [...neighborhoods]
    .sort((a, b) => a.safetyScore - b.safetyScore)
    .slice(0, 3);

  const avgLivability = Math.round(
    neighborhoods.reduce((acc, curr) => acc + curr.livabilityScore, 0) /
      (neighborhoods.length || 1)
  );
  const avgSafety = Math.round(
    neighborhoods.reduce((acc, curr) => acc + curr.safetyScore, 0) /
      (neighborhoods.length || 1)
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#061317]/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-teal-50 print:bg-white print:text-black print:max-h-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Not printed */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-5 bg-[#0b1f26]/95 border-b border-[#e8a0b2]/25 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Özelleştirilmiş Ankara Yaşam ve Güvenlik Raporu
              </h3>
              <p className="text-xs text-teal-200/70">
                Resmi Statbase ve EGO verileriyle doğrulanmış mahalle karnesi çıktısı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 hover:brightness-105 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF İndir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-teal-200/70 hover:text-white hover:bg-teal-500/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0 print:space-y-4">
          {/* Report Title & Metadata */}
          <div className="border-b border-teal-900/70 pb-5 print:border-black">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#f3c1cd] print:text-gray-600 font-bold block mb-1">
                  Resmi Kent İçi Analiz Bülteni · 2024-2026
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white print:text-black">
                  Ankara Yaşam Kalitesi, Suç Oranları ve Yaşanabilirlik Raporu
                </h1>
              </div>
              <div className="text-right font-mono text-xs text-teal-200/70 print:text-gray-600 shrink-0">
                <div>
                  Kapsam: {selectedDistrict === 'all' ? 'Tüm Ankara Metropolü' : selectedDistrict}
                </div>
                <div>Mahalle Sayısı: {neighborhoods.length}</div>
              </div>
            </div>
          </div>

          {/* Executive Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-4 rounded-xl bg-[#061317]/80 border border-teal-900/70 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-teal-200/70 print:text-gray-600 block">
                Ortalama Yaşanabilirlik
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 print:text-black">
                {avgLivability}{' '}
                <span className="text-xs font-normal text-teal-200/60">/ 100</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#061317]/80 border border-teal-900/70 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-teal-200/70 print:text-gray-600 block">
                Ortalama Güvenlik Skoru
              </span>
              <span className="text-2xl font-bold font-mono text-teal-300 print:text-black">
                {avgSafety} <span className="text-xs font-normal text-teal-200/60">/ 100</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#061317]/80 border border-teal-900/70 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-teal-200/70 print:text-gray-600 block">
                EGO Aylık Raylı/Otobüs
              </span>
              <span className="text-2xl font-bold font-mono text-[#f3c1cd] print:text-black">
                53.3M <span className="text-xs font-normal text-teal-200/60">yolcu</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#061317]/80 border border-teal-900/70 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-teal-200/70 print:text-gray-600 block">
                Statbase Asayiş Endeksi
              </span>
              <span className="text-2xl font-bold font-mono text-[#e8a0b2] print:text-black">
                39.3 <span className="text-xs font-normal text-teal-200/60">puan</span>
              </span>
            </div>
          </div>

          {/* Section: Top Livable Neighborhoods */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-50 print:text-black mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 print:text-black" />
              <span>1. En Yüksek Yaşam Kalitesine Sahip Bölgeler (Önerilenler)</span>
            </h3>

            <div className="space-y-3">
              {sortedByLivability.slice(0, 4).map((n, idx) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-[#061317]/75 border border-teal-900/70 print:bg-white print:border-gray-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#f3c1cd] print:text-black text-sm">
                        #{idx + 1}
                      </span>
                      <strong className="text-white print:text-black text-base">{n.name}</strong>
                      <span className="text-xs text-teal-200/70 print:text-gray-600 font-mono">
                        ({n.district})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-emerald-400 font-bold">
                        Yaşam: {n.livabilityScore}/100
                      </span>
                      <span className="text-teal-200/50">·</span>
                      <span className="text-[#f3c1cd]">Güvenlik: {n.safetyScore}</span>
                      <span className="text-teal-200/50">·</span>
                      <span className="text-teal-300">Ulaşım: {n.transportScore}</span>
                    </div>
                  </div>

                  <p className="text-xs text-teal-50/90 print:text-gray-800 leading-relaxed font-sans">
                    <strong>Nihai Karar:</strong> {n.verdictSummary}
                  </p>

                  <div className="text-[11px] text-teal-200/70 print:text-gray-600 flex flex-wrap gap-3 pt-1">
                    <span>
                      Eğitim: <strong>{n.educationScore}/100</strong>
                    </span>
                    <span>
                      Eğlence: <strong>{n.entertainmentScore}/100</strong>
                    </span>
                    <span>
                      Ortalama Kira: <strong>{n.averageRent.toLocaleString('tr-TR')} ₺</strong>
                    </span>
                    <span>
                      Metro: <strong>{n.nearestMetroStation}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Riskli / Dikkat Gerektiren Bölgeler */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 print:text-black mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 print:text-black" />
              <span>2. Suç Oranı Yüksek veya Yaşanabilirlik Riski Taşıyan Bölgeler</span>
            </h3>

            <div className="space-y-3">
              {highestCrimeAlerts.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 print:bg-white print:border-gray-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-white print:text-black text-base">{n.name}</strong>
                      <span className="text-xs text-teal-200/70 print:text-gray-600 font-mono">
                        ({n.district})
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 print:text-red-700 font-mono font-bold">
                        Suç Riski: {n.crimeRateCategory}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-red-400 font-bold">
                      Güvenlik Skoru: {n.safetyScore}/100 ({n.crimeIncidentsPer1k} olay / 1k kişi)
                    </span>
                  </div>

                  <p className="text-xs text-teal-50/90 print:text-gray-800 leading-relaxed">
                    <strong>Değerlendirme:</strong> {n.verdictSummary}
                  </p>

                  <div className="text-[11px] text-red-300/80 print:text-gray-600 flex items-center gap-2 pt-1">
                    <span>Güvenlik Uyarısı:</span>
                    <span>{n.safetyDetail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: EGO ve Ulaşım Raporu Dipnotu */}
          <div className="p-4 rounded-xl bg-[#061317] border border-teal-900/70 print:bg-gray-50 print:border-gray-300 text-xs text-teal-200/70 print:text-gray-700 space-y-1.5">
            <h4 className="font-bold text-white print:text-black">
              EGO 2024 & Statbase Doğrulama Metodolojisi
            </h4>
            <p>
              Bu rapor, 2024 Ekim ayı EGO toplu taşıma yolcu verileri (Aylık toplam 53.324.387
              yolcu) ile 2012-2026 Statbase asayiş göstergesi tepe ve taban katsayıları kullanılarak
              modellenmiştir. Nihai yaşanabilirlik puanı; güvenlik (%30), ulaşım (%25), eğitim
              (%20), sosyal/eğlence (%15) ve kira/refah (%10) ağırlıklarının toplamından oluşur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
