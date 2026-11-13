import React, { useEffect } from 'react';
import { NeighborhoodData } from '../types';
import {
  X,
  ShieldAlert,
  GraduationCap,
  TrainFront,
  PartyPopper,
  Sparkles,
  Scale,
  Info,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserFeedback } from './UserFeedback';
import {
  ReferencePoint,
  calculateDistanceKm,
  isDangerousNeighborhood,
} from '../data/ankaraData';

interface NeighborhoodDetailModalProps {
  neighborhood: NeighborhoodData | null;
  onClose: () => void;
  onAddToCompare: (n: NeighborhoodData) => void;
  isCompared: boolean;
  referencePoint?: ReferencePoint | null;
}

export const NeighborhoodDetailModal: React.FC<NeighborhoodDetailModalProps> = ({
  neighborhood,
  onClose,
  onAddToCompare,
  isCompared,
  referencePoint,
}) => {
  useEffect(() => {
    if (neighborhood && (neighborhood?.livabilityScore ?? 0) >= 92) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#e8a0b2', '#f3c1cd', '#2dd4bf'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [neighborhood]);

  if (!neighborhood) return null;

  const livabilityScore = neighborhood?.livabilityScore ?? 0;
  const safetyScore = neighborhood?.safetyScore ?? 0;
  const educationScore = neighborhood?.educationScore ?? 0;
  const transportScore = neighborhood?.transportScore ?? 0;
  const entertainmentScore = neighborhood?.entertainmentScore ?? 0;
  const economyScore = neighborhood?.economyScore ?? 0;
  const population = neighborhood?.population ?? 0;
  const averageRent = neighborhood?.averageRent ?? 0;
  const crimeIncidentsPer1k = neighborhood?.crimeIncidentsPer1k ?? 0;
  const crimeRateCategory = neighborhood?.crimeRateCategory ?? 'Orta';
  const idealFor = Array.isArray(neighborhood?.idealFor) ? neighborhood.idealFor : [];
  const metroLines = Array.isArray(neighborhood?.metroLines) ? neighborhood.metroLines : [];
  const pros = Array.isArray(neighborhood?.pros) ? neighborhood.pros : [];
  const cons = Array.isArray(neighborhood?.cons) ? neighborhood.cons : [];
  const lat = neighborhood?.lat ?? 39.9255;
  const lng = neighborhood?.lng ?? 32.8662;
  const isDangerous = isDangerousNeighborhood(neighborhood);

  const hasReferencePoint = Boolean(referencePoint && referencePoint.id !== 'none');
  const distanceKm =
    hasReferencePoint && referencePoint
      ? calculateDistanceKm(referencePoint.lat, referencePoint.lng, lat, lng)
      : null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35';
    if (score >= 75) return 'text-teal-300 bg-teal-500/20 border-teal-400/40';
    if (score >= 55) return 'text-[#f3c1cd] bg-[#e8a0b2]/15 border-[#e8a0b2]/35';
    return 'text-red-400 bg-red-500/15 border-red-500/35';
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Mükemmel':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Çok İyi':
        return 'bg-teal-500/20 text-teal-300 border-teal-400/40';
      case 'Orta':
        return 'bg-[#e8a0b2]/20 text-[#f3c1cd] border-[#e8a0b2]/40';
      case 'Riskli':
      case 'Tavsiye Edilmez':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-[#061317] text-teal-200 border-teal-900/70';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#061317]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-teal-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between p-5 sm:p-6 bg-[#0b1f26]/95 border-b border-[#e8a0b2]/25 backdrop-blur-md">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-xl sm:text-2xl border shadow-inner shrink-0 ${getScoreColor(
                livabilityScore
              )}`}
            >
              <span>{livabilityScore}</span>
              <span className="text-[10px] font-sans font-medium opacity-80 uppercase tracking-wider">
                Puan
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                  {neighborhood?.name ?? 'Bilinmeyen Mahalle'}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 font-mono">
                  {neighborhood?.district ?? 'Ankara'}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getBadgeStyle(
                    neighborhood?.verdictBadge ?? 'Orta'
                  )}`}
                >
                  {neighborhood?.verdictTitle ?? 'Mahalle Değerlendirmesi'}
                </span>
                {isDangerous && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Yüksek Risk</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#f3c1cd]/90 font-medium italic mt-1">
                "{neighborhood?.vibe ?? 'Ankara kent yaşamı profili'}"
              </p>
              {distanceKm !== null && referencePoint && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] text-xs font-mono font-semibold">
                  <Navigation className="w-3.5 h-3.5 text-[#e8a0b2]" />
                  <span>
                    {referencePoint.label}: Seçili noktaya {distanceKm.toFixed(1)} km
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#061317] hover:bg-teal-500/20 text-teal-300 border border-teal-900/70 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="OpenStreetMap'te Aç"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">OpenStreetMap'te Aç</span>
            </a>
            <button
              type="button"
              onClick={() => onAddToCompare(neighborhood)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isCompared
                  ? 'bg-teal-500/20 text-teal-300 border-teal-400/40'
                  : 'bg-[#061317] text-teal-100 border-teal-900/70 hover:bg-teal-500/15'
              }`}
              title="Karşılaştırmaya Ekle / Çıkar"
            >
              <Scale className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#061317] text-teal-200/70 hover:text-white hover:bg-teal-500/20 border border-teal-900/70 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* SECTION 1: "Orada Yaşanabilir mi?" Nihai Raporu */}
          <div className="p-5 rounded-2xl bg-[#061317]/80 border border-[#e8a0b2]/25 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#f3c1cd] font-display font-bold text-sm sm:text-base mb-2">
              <Sparkles className="w-4 h-4 text-[#e8a0b2]" />
              <span>NİHAİ DEĞERLENDİRME: BURADA YAŞANABİLİR Mİ?</span>
            </div>
            <p className="text-sm sm:text-base text-teal-50 leading-relaxed font-sans">
              {neighborhood?.verdictSummary ??
                'Bu mahalle için detaylı yaşanabilirlik özeti henüz eklenmemiştir.'}
            </p>

            <div className="mt-4 pt-3 border-t border-teal-900/70 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-teal-200/70">
                <span className="font-semibold text-white">Kimler İçin İdeal:</span>
                <div className="flex flex-wrap gap-1">
                  {idealFor.length > 0 ? (
                    idealFor.map((item, i) => (
                      <span key={i} className="text-teal-50">
                        {item}
                        {i < idealFor.length - 1 ? ' · ' : ''}
                      </span>
                    ))
                  ) : (
                    <span className="text-teal-200/70">Tüm Kent Sakinleri</span>
                  )}
                </div>
              </div>

              <div className="text-teal-200/70 font-mono text-[11px]">
                Nüfus:{' '}
                <span className="text-white font-bold">
                  {population > 0 ? population.toLocaleString('tr-TR') : 'Veri Yok'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: DETAILED SCORES */}
          <div>
            <h3 className="text-xs font-bold text-teal-200/70 uppercase tracking-wider mb-3">
              Kapsamlı Metrik ve Kriter Puanlaması
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Güvenlik ve Suç Analizi */}
              <div className="p-4 rounded-xl bg-[#061317]/75 border border-teal-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#f3c1cd] font-semibold text-sm">
                    <ShieldAlert className="w-4 h-4 text-[#e8a0b2]" />
                    <span>Güvenlik & Suç Oranı</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(
                      safetyScore
                    )}`}
                  >
                    {safetyScore}/100
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-teal-200/70">Suç Riski Kategorisi:</span>
                  <span
                    className={`font-semibold ${
                      crimeRateCategory === 'Çok Düşük'
                        ? 'text-emerald-400'
                        : crimeRateCategory === 'Düşük'
                        ? 'text-teal-300'
                        : crimeRateCategory === 'Orta'
                        ? 'text-[#f3c1cd]'
                        : 'text-red-400'
                    }`}
                  >
                    {crimeRateCategory}
                  </span>
                  <span className="text-teal-200/60 font-mono">
                    ({crimeIncidentsPer1k} olay / 1.000 kişi)
                  </span>
                </div>
                <p className="text-xs text-teal-50/90 leading-normal">
                  {neighborhood?.safetyDetail ?? 'Güvenlik analiz detayı bulunmuyor.'}
                </p>
                <div className="text-[11px] text-teal-200/60 font-mono pt-1">
                  *Statbase Ankara 2012-2026 asayiş ve ihbar endeksiyle korelasyonludur.
                </div>
              </div>

              {/* 2. Eğitim Kalitesi */}
              <div className="p-4 rounded-xl bg-[#061317]/75 border border-teal-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                    <GraduationCap className="w-4 h-4" />
                    <span>Eğitim & Okul Altyapısı</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(
                      educationScore
                    )}`}
                  >
                    {educationScore}/100
                  </span>
                </div>
                <p className="text-xs text-teal-50/90 leading-normal">
                  {neighborhood?.educationDetail ?? 'Eğitim altyapısı verisi bulunmuyor.'}
                </p>
                <div className="text-[11px] text-teal-200/70 flex items-center gap-1.5 pt-1">
                  <span>Üniversite / Kampüs Bağlantısı:</span>
                  <span className="text-teal-300 font-medium">
                    {educationScore >= 85 ? 'Yüksek Standart' : 'Standart Erişim'}
                  </span>
                </div>
              </div>

              {/* 3. Ulaşım ve EGO Toplu Taşıma */}
              <div className="p-4 rounded-xl bg-[#061317]/75 border border-teal-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                    <TrainFront className="w-4 h-4" />
                    <span>Ulaşım & EGO/Metro Ağı</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(
                      transportScore
                    )}`}
                  >
                    {transportScore}/100
                  </span>
                </div>
                <div className="text-xs text-teal-50 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-teal-200/70">Raylı Hat:</span>
                    <span className="text-teal-300 font-medium font-mono">
                      {metroLines.length > 0 ? metroLines.join(' · ') : 'Otobüs / Ring'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-teal-200/70">İstasyon:</span>
                    <span className="text-white">
                      {neighborhood?.nearestMetroStation ?? 'EGO Otobüs Durakları'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-teal-50/90 leading-normal">
                  {neighborhood?.transportDetail ?? 'Ulaşım analiz detayı bulunmuyor.'}
                </p>
                <div className="text-[11px] text-teal-200/60 font-mono pt-1">
                  *2024 Ekim EGO aylık 53.3 milyon yolcu dağılım verisine dayalıdır.
                </div>
              </div>

              {/* 4. Eğlence ve Sosyal Yaşam */}
              <div className="p-4 rounded-xl bg-[#061317]/75 border border-teal-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#f3c1cd] font-semibold text-sm">
                    <PartyPopper className="w-4 h-4 text-[#e8a0b2]" />
                    <span>Eğlence, Kültür & Parklar</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getScoreColor(
                      entertainmentScore
                    )}`}
                  >
                    {entertainmentScore}/100
                  </span>
                </div>
                <p className="text-xs text-teal-50/90 leading-normal">
                  {neighborhood?.entertainmentDetail ?? 'Sosyal yaşam verisi bulunmuyor.'}
                </p>
                <div className="text-[11px] text-[#f3c1cd]/90 flex items-center gap-1.5 pt-1">
                  <span>Sosyal Vibe Seviyesi:</span>
                  <span className="font-semibold">
                    {entertainmentScore >= 90
                      ? 'Çok Canlı (7/24)'
                      : entertainmentScore >= 75
                      ? 'Dengeli & Sosyal'
                      : 'Sakin & İnziva'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: EKONOMİ, KİRA VE GELİR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#061317]/85 border border-teal-900/70">
            <div>
              <span className="text-xs text-teal-200/70 block mb-1">Ortalama Konut Kirası</span>
              <span className="text-xl font-display font-bold text-white tabular-nums">
                {averageRent.toLocaleString('tr-TR')} ₺
              </span>
              <span className="text-[11px] text-teal-200/60 block mt-0.5">
                3+1 / 2+1 medyan piyasa
              </span>
            </div>

            <div>
              <span className="text-xs text-teal-200/70 block mb-1">Sosyo-Ekonomik Refah</span>
              <span className="text-lg font-display font-semibold text-[#f3c1cd]">
                {neighborhood?.incomeLevel ?? 'Orta'}
              </span>
              <span className="text-[11px] text-teal-200/60 block mt-0.5">
                Hanehalkı refah endeksi
              </span>
            </div>

            <div>
              <span className="text-xs text-teal-200/70 block mb-1">Fiyat / Yaşam Performansı</span>
              <span
                className={`text-lg font-display font-semibold ${
                  getScoreColor(economyScore).split(' ')[0]
                }`}
              >
                {economyScore >= 85
                  ? 'Yüksek Verim'
                  : economyScore >= 70
                  ? 'Dengeli'
                  : 'Yüksek Maliyet'}
              </span>
              <span className="text-[11px] text-teal-200/60 block mt-0.5">
                ({economyScore}/100)
              </span>
            </div>
          </div>

          {/* SECTION 4: ARTILAR VE EKSİLER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-teal-900/70">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Öne Çıkan Güçlü Yönler (Artılar)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-teal-50/90">
                {pros.length > 0 ? (
                  pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-teal-200/70">Öne çıkan veri bulunmuyor.</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#e8a0b2]/8 border border-[#e8a0b2]/25">
              <div className="flex items-center gap-2 text-[#f3c1cd] font-semibold text-xs uppercase tracking-wider mb-2.5">
                <ThumbsDown className="w-3.5 h-3.5 text-[#e8a0b2]" />
                <span>Dikkat Edilmesi Gerekenler (Eksiler)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-teal-50/90">
                {cons.length > 0 ? (
                  cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#e8a0b2] font-bold mt-0.5">✕</span>
                      <span>{con}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-teal-200/70">Belirtilen eksi yön bulunmuyor.</li>
                )}
              </ul>
            </div>
          </div>

          {/* SECTION 5: EĞLENCELİ BİLGİ & ANKARA NOTU */}
          <div className="p-3.5 rounded-xl bg-[#e8a0b2]/10 border border-[#e8a0b2]/35 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#e8a0b2] shrink-0 mt-0.5" />
            <div className="text-xs text-teal-50">
              <span className="font-bold text-[#f3c1cd] mr-1.5">Biliyor muydunuz?</span>
              {neighborhood?.funFact ??
                'Ankara mahalle verileri düzenli olarak güncellenmektedir.'}
            </div>
          </div>

          {/* SECTION 6: KULLANICI GERİ BİLDİRİMİ */}
          <UserFeedback neighborhood={neighborhood} onUpdate={() => {}} />
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#061317] border-t border-teal-900/70 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-teal-200/70 font-mono">
            ID: <span className="text-teal-50">{neighborhood?.id ?? '-'}</span> · Ankara Atlası
            2024-2026
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAddToCompare(neighborhood)}
              className="px-3.5 py-1.5 text-xs font-medium text-teal-50 bg-[#0b1f26] hover:bg-teal-500/20 border border-teal-900/70 rounded-lg transition-colors cursor-pointer"
            >
              {isCompared ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırma Listesine Ekle'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 rounded-lg transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
