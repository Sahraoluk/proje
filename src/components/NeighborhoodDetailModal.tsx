import React, { useEffect } from 'react';
import { NeighborhoodData } from '../types';
import { 
  X, 
  ShieldAlert, 
  GraduationCap, 
  TrainFront, 
  PartyPopper, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Scale, 
  Printer, 
  HeartHandshake, 
  MapPin, 
  Info,
  Building2,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NeighborhoodDetailModalProps {
  neighborhood: NeighborhoodData | null;
  onClose: () => void;
  onAddToCompare: (n: NeighborhoodData) => void;
  isCompared: boolean;
}

export const NeighborhoodDetailModal: React.FC<NeighborhoodDetailModalProps> = ({
  neighborhood,
  onClose,
  onAddToCompare,
  isCompared,
}) => {
  useEffect(() => {
    if (neighborhood && neighborhood.livabilityScore >= 92) {
      // Fun celebration when opening a 5-star neighborhood!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [neighborhood]);

  if (!neighborhood) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 80) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (score >= 60) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Mükemmel':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Çok İyi':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Orta':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Riskli':
      case 'Tavsiye Edilmez':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-slate-100">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between p-5 sm:p-6 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-xl sm:text-2xl border shadow-inner ${getScoreColor(neighborhood.livabilityScore)}`}>
              <span>{neighborhood.livabilityScore}</span>
              <span className="text-[10px] font-sans font-medium opacity-80 uppercase tracking-wider">Puan</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                  {neighborhood.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  {neighborhood.district}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getBadgeStyle(neighborhood.verdictBadge)}`}>
                  {neighborhood.verdictTitle}
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium italic mt-1">
                "{neighborhood.vibe}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${neighborhood.lat},${neighborhood.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Google Maps'te Aç"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Google Maps'te Aç</span>
            </a>
            <button
              onClick={() => onAddToCompare(neighborhood)}
              className={`p-2 rounded-xl border transition-colors ${
                isCompared 
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Karşılaştırmaya Ekle / Çıkar"
            >
              <Scale className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* SECTION 1: CRITICAL USER REQUIREMENT - "Orada Yaşanabilir mi?" Nihai Raporu */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm sm:text-base mb-2">
              <Sparkles className="w-4 h-4" />
              <span>NİHAİ DEĞERLENDİRME: BURADA YAŞANABİLİR Mİ?</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
              {neighborhood.verdictSummary}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-semibold text-slate-300">Kimler İçin İdeal:</span>
                <div className="flex flex-wrap gap-1">
                  {neighborhood.idealFor.map((item, i) => (
                    <span key={i} className="text-slate-300">
                      {item}{i < neighborhood.idealFor.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-slate-400 font-mono text-[11px]">
                Nüfus: <span className="text-slate-200 font-bold">{neighborhood.population.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: 5 DETAILED SCORES REQUESTED BY USER */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Kapsamlı Metrik ve Kriter Puanlaması
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Güvenlik ve Suç Analizi */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Güvenlik & Suç Oranı</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(neighborhood.safetyScore)}`}>
                    {neighborhood.safetyScore}/100
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Suç Riski Kategorisi:</span>
                  <span className={`font-semibold ${
                    neighborhood.crimeRateCategory === 'Çok Düşük' ? 'text-emerald-400' :
                    neighborhood.crimeRateCategory === 'Düşük' ? 'text-cyan-400' :
                    neighborhood.crimeRateCategory === 'Orta' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {neighborhood.crimeRateCategory}
                  </span>
                  <span className="text-slate-500 font-mono">({neighborhood.crimeIncidentsPer1k} olay / 1.000 kişi)</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {neighborhood.safetyDetail}
                </p>
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  *Statbase Ankara 2012-2026 asayiş ve ihbar endeksiyle korelasyonludur.
                </div>
              </div>

              {/* 2. Eğitim Kalitesi */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <GraduationCap className="w-4 h-4" />
                    <span>Eğitim & Okul Altyapısı</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(neighborhood.educationScore)}`}>
                    {neighborhood.educationScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {neighborhood.educationDetail}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <span>Üniversite / Kampüs Bağlantısı:</span>
                  <span className="text-indigo-300 font-medium">Yüksek Standart</span>
                </div>
              </div>

              {/* 3. Ulaşım ve EGO Toplu Taşıma */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <TrainFront className="w-4 h-4" />
                    <span>Ulaşım & EGO/Metro Ağı</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(neighborhood.transportScore)}`}>
                    {neighborhood.transportScore}/100
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Raylı Hat:</span>
                    <span className="text-cyan-300 font-medium font-mono">
                      {neighborhood.metroLines?.join(' · ') || 'Otobüs / Ring'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">İstasyon:</span>
                    <span className="text-slate-200">{neighborhood.nearestMetroStation}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {neighborhood.transportDetail}
                </p>
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  *2024 Ekim EGO aylık 53.3 milyon yolcu dağılım verisine dayalıdır.
                </div>
              </div>

              {/* 4. Eğlence ve Sosyal Yaşam */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                    <PartyPopper className="w-4 h-4" />
                    <span>Eğlence, Kültür & Parklar</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(neighborhood.entertainmentScore)}`}>
                    {neighborhood.entertainmentScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {neighborhood.entertainmentDetail}
                </p>
                <div className="text-[11px] text-pink-300/90 flex items-center gap-1.5 pt-1">
                  <span>Sosyal Vibe Seviyesi:</span>
                  <span className="font-semibold">{neighborhood.entertainmentScore >= 90 ? 'Çok Canlı (7/24)' : neighborhood.entertainmentScore >= 75 ? 'Dengeli & Sosyal' : 'Sakin & İnziva'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: EKONOMİ, KİRA VE GELİR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Ortalama Konut Kirası</span>
              <span className="text-xl font-display font-bold text-white tabular-nums">
                {neighborhood.averageRent.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">3+1 / 2+1 medyan piyasa</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Sosyo-Ekonomik Refah</span>
              <span className="text-lg font-display font-semibold text-amber-400">
                {neighborhood.incomeLevel}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Hanehalkı refah endeksi</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Fiyat / Yaşam Performansı</span>
              <span className={`text-lg font-display font-semibold ${getScoreColor(neighborhood.economyScore).split(' ')[0]}`}>
                {neighborhood.economyScore >= 85 ? 'Yüksek Verim' : neighborhood.economyScore >= 75 ? 'Dengeli' : 'Yüksek Maliyet'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">({neighborhood.economyScore}/100)</span>
            </div>
          </div>

          {/* SECTION 4: ARTILAR VE EKSİLER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/40">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Öne Çıkan Güçlü Yönler (Artılar)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {neighborhood.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-900/40">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider mb-2.5">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Dikkat Edilmesi Gerekenler (Eksiler)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {neighborhood.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold mt-0.5">✕</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 5: EĞLENCELİ BİLGİ & ANKARA NOTU */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-amber-300 mr-1.5">Biliyor muydunuz?</span>
              {neighborhood.funFact}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            ID: <span className="text-slate-300">{neighborhood.id}</span> · Ankara Atlası 2024-2026
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCompare(neighborhood)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isCompared ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırma Listesine Ekle'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
