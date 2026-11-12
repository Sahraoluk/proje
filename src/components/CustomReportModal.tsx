import React from 'react';
import { NeighborhoodData } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  TrainFront,
  GraduationCap
} from 'lucide-react';

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

  const sortedByLivability = [...neighborhoods].sort((a, b) => b.livabilityScore - a.livabilityScore);
  const safestAreas = [...neighborhoods].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 5);
  const bestTransit = [...neighborhoods].sort((a, b) => b.transportScore - a.transportScore).slice(0, 5);
  const highestCrimeAlerts = [...neighborhoods].sort((a, b) => a.safetyScore - b.safetyScore).slice(0, 3);

  const avgLivability = Math.round(
    neighborhoods.reduce((acc, curr) => acc + curr.livabilityScore, 0) / (neighborhoods.length || 1)
  );
  const avgSafety = Math.round(
    neighborhoods.reduce((acc, curr) => acc + curr.safetyScore, 0) / (neighborhoods.length || 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-slate-100 print:bg-white print:text-black print:max-h-none print:shadow-none print:border-none">
        
        {/* Header - Not printed */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-5 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Özelleştirilmiş Ankara Yaşam ve Güvenlik Raporu
              </h3>
              <p className="text-xs text-slate-400">
                Resmi Statbase ve EGO verileriyle doğrulanmış mahalle karnesi çıktısı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF İndir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-0 print:space-y-4">
          
          {/* Report Title & Metadata */}
          <div className="border-b border-slate-800 pb-5 print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 print:text-gray-600 font-bold block mb-1">
                  Resmi Kent İçi Analiz Bülteni · 2024-2026
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white print:text-black">
                  Ankara Yaşam Kalitesi, Suç Oranları ve Yaşanabilirlik Raporu
                </h1>
              </div>
              <div className="text-right font-mono text-xs text-slate-400 print:text-gray-600">
                <div>Kapsam: {selectedDistrict === 'all' ? 'Tüm Ankara Metropolü' : selectedDistrict}</div>
                <div>Mahalle Sayısı: {neighborhoods.length}</div>
              </div>
            </div>
          </div>

          {/* Executive Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">Ortalama Yaşanabilirlik</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 print:text-black">
                {avgLivability} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">Ortalama Güvenlik Skoru</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 print:text-black">
                {avgSafety} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">EGO Aylık Raylı/Otobüs</span>
              <span className="text-2xl font-bold font-mono text-amber-400 print:text-black">
                53.3M <span className="text-xs font-normal text-slate-500">yolcu</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block">Statbase Asayiş Endeksi</span>
              <span className="text-2xl font-bold font-mono text-rose-400 print:text-black">
                39.3 <span className="text-xs font-normal text-slate-500">puan</span>
              </span>
            </div>
          </div>

          {/* Section: Top Livable Neighborhoods with Full Verdicts */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 print:text-black" />
              <span>1. En Yüksek Yaşam Kalitesine Sahip Bölgeler (Önerilenler)</span>
            </h3>

            <div className="space-y-3">
              {sortedByLivability.slice(0, 4).map((n, idx) => (
                <div 
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 print:bg-white print:border-gray-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 print:text-black text-sm">
                        #{idx + 1}
                      </span>
                      <strong className="text-white print:text-black text-base">{n.name}</strong>
                      <span className="text-xs text-slate-400 print:text-gray-600 font-mono">({n.district})</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-emerald-400 font-bold">Yaşam: {n.livabilityScore}/100</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-rose-400">Güvenlik: {n.safetyScore}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-cyan-400">Ulaşım: {n.transportScore}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed font-sans">
                    <strong>Nihai Karar:</strong> {n.verdictSummary}
                  </p>

                  <div className="text-[11px] text-slate-400 print:text-gray-600 flex flex-wrap gap-3 pt-1">
                    <span>Eğitim: <strong>{n.educationScore}/100</strong></span>
                    <span>Eğlence: <strong>{n.entertainmentScore}/100</strong></span>
                    <span>Ortalama Kira: <strong>{n.averageRent.toLocaleString('tr-TR')} ₺</strong></span>
                    <span>Metro: <strong>{n.nearestMetroStation}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Riskli / Dikkat Gerektiren Bölgeler */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 print:text-black mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 print:text-black" />
              <span>2. Suç Oranı Yüksek veya Yaşanabilirlik Riski Taşıyan Bölgeler</span>
            </h3>

            <div className="space-y-3">
              {highestCrimeAlerts.map((n) => (
                <div 
                  key={n.id}
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 print:bg-white print:border-gray-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-white print:text-black text-base">{n.name}</strong>
                      <span className="text-xs text-slate-400 print:text-gray-600 font-mono">({n.district})</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 print:text-red-700 font-mono font-bold">
                        Suç Riski: {n.crimeRateCategory}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-rose-400 font-bold">
                      Güvenlik Skoru: {n.safetyScore}/100 ({n.crimeIncidentsPer1k} olay / 1k kişi)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed">
                    <strong>Değerlendirme:</strong> {n.verdictSummary}
                  </p>

                  <div className="text-[11px] text-rose-300/80 print:text-gray-600 flex items-center gap-2 pt-1">
                    <span>Güvenlik Uyarısı:</span>
                    <span>{n.safetyDetail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: EGO ve Ulaşım Raporu Dipnotu */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs text-slate-400 print:text-gray-700 space-y-1.5">
            <h4 className="font-bold text-slate-200 print:text-black">
              EGO 2024 & Statbase Doğrulama Metodolojisi
            </h4>
            <p>
              Bu rapor, kullanıcının yüklediği 2024 Ekim ayı EGO toplu taşıma yolcu verileri (Aylık toplam 53.324.387 yolcu) ile 2012-2026 Statbase asayiş göstergesi tepe ve taban katsayıları kullanılarak modellenmiştir. Nihai yaşanabilirlik puanı, güvenlik (%30), ulaşım (%25), eğitim (%20), sosyal/eğlence (%15) ve kira/refah (%10) ağırlıklarının toplamından oluşur.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
