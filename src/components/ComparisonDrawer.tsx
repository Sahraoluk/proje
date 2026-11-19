import React, { useState } from 'react';
import { NeighborhoodData } from '../types';
import {
  X,
  Scale,
  Trophy,
  ShieldAlert,
  GraduationCap,
  TrainFront,
  PartyPopper,
  Coins,
  Check,
  ArrowRight,
  Plus,
  Wallet,
  Share2,
} from 'lucide-react';
import {
  calculateMonthlyBudgetFit,
  TransitPassType,
} from './BudgetSimulator';

interface ComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comparedNeighborhoods: NeighborhoodData[];
  onRemove: (id: string) => void;
  onSelectForDetails: (n: NeighborhoodData) => void;
  allNeighborhoods: NeighborhoodData[];
  onAddNeighborhood: (n: NeighborhoodData) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  isOpen,
  onClose,
  comparedNeighborhoods,
  onRemove,
  onSelectForDetails,
  allNeighborhoods,
  onAddNeighborhood,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(45000);
  const [transitType, setTransitType] = useState<TransitPassType>('full');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const topScorer = [...comparedNeighborhoods].sort(
    (a, b) => b.livabilityScore - a.livabilityScore
  )[0];

  const getMetricWinner = (metricKey: keyof NeighborhoodData, isLowerBetter: boolean = false) => {
    if (comparedNeighborhoods.length < 2) return null;
    const sorted = [...comparedNeighborhoods].sort((a, b) => {
      const valA = Number(a[metricKey]);
      const valB = Number(b[metricKey]);
      return isLowerBetter ? valA - valB : valB - valA;
    });
    return sorted[0].id;
  };

  const safetyWinnerId = getMetricWinner('safetyScore');
  const transportWinnerId = getMetricWinner('transportScore');
  const educationWinnerId = getMetricWinner('educationScore');
  const entertainmentWinnerId = getMetricWinner('entertainmentScore');
  const rentWinnerId = getMetricWinner('averageRent', true);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#061317]/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-teal-50 max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#0b1f26]/95 border-b border-[#e8a0b2]/25 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Bölgesel Karşılaştırma Analizi
              </h3>
              <p className="text-xs text-teal-200/70">
                Seçtiğiniz Ankara mahallelerini yaşam, güvenlik, ulaşım ve aylık bütçe uygunluğu yönünden kıyaslayın
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {comparedNeighborhoods.length > 0 && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#061317] hover:bg-[#e8a0b2]/15 text-xs font-semibold text-teal-100 border border-[#e8a0b2]/35 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Bağlantı Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#f3c1cd]" />
                    <span className="hidden sm:inline">Paylaşım Linkini Kopyala</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-teal-200/70 hover:text-white hover:bg-teal-500/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {comparedNeighborhoods.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Scale className="w-12 h-12 text-teal-300/50 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">Karşılaştırma listeniz boş</h4>
              <p className="text-xs text-teal-200/70 max-w-sm mx-auto mt-1 mb-4">
                Haritadan veya mahalle listesinden 2 veya 3 mahalle seçerek yan yana kriter bazında
                karşılaştırabilirsiniz.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {allNeighborhoods.slice(0, 3).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onAddNeighborhood(n)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#061317] hover:bg-teal-500/20 text-xs text-teal-50 border border-teal-900/70 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#e8a0b2]" />
                    <span>{n.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Winner Banner */}
              {comparedNeighborhoods.length >= 2 && topScorer && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#e8a0b2]/20 via-teal-500/15 to-emerald-500/15 border border-[#e8a0b2]/45 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#f3c1cd] font-bold block">
                        Genel Yaşanabilirlik Lideri
                      </span>
                      <h4 className="font-display font-bold text-base text-white">
                        {topScorer.name} ({topScorer.district}) — {topScorer.livabilityScore}/100
                        Puan
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs text-teal-100 hidden md:inline">
                    {topScorer.verdictTitle}
                  </span>
                </div>
              )}

              {/* Shared Budget Fit Controls */}
              <div className="p-4 rounded-2xl bg-[#061317]/85 border border-[#e8a0b2]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f3c1cd]">
                  <Wallet className="w-4 h-4 text-[#e8a0b2]" />
                  <span>Karşılaştırmalı Bütçe Uygunluk Ayarları:</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-200/75">Aylık Gelir / Burs:</span>
                    <input
                      type="number"
                      min={5000}
                      max={500000}
                      step={1000}
                      value={monthlyIncome}
                      onChange={(e) =>
                        setMonthlyIncome(Math.max(5000, Number(e.target.value) || 5000))
                      }
                      className="w-28 px-2.5 py-1 rounded-lg bg-[#0b1f26] border border-[#e8a0b2]/35 text-teal-50 font-mono focus:outline-none focus:border-[#e8a0b2]"
                    />
                    <div className="hidden sm:flex items-center gap-1">
                      {[25000, 45000, 70000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setMonthlyIncome(preset)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                            monthlyIncome === preset
                              ? 'bg-[#e8a0b2]/25 text-[#f3c1cd] border-[#e8a0b2]/60'
                              : 'bg-[#0b1f26] text-teal-200/70 border-teal-900/70'
                          }`}
                        >
                          {preset / 1000}k ₺
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0b1f26] p-1 rounded-xl border border-teal-900/70">
                    <button
                      type="button"
                      onClick={() => setTransitType('student')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        transitType === 'student'
                          ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950'
                          : 'text-teal-200/75 hover:text-white'
                      }`}
                    >
                      Öğrenci EGO (350 ₺)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransitType('full')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        transitType === 'full'
                          ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950'
                          : 'text-teal-200/75 hover:text-white'
                      }`}
                    >
                      Tam EGO (1.500 ₺)
                    </button>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Columns Grid */}
              <div
                className={`grid grid-cols-1 ${
                  comparedNeighborhoods.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-4`}
              >
                {comparedNeighborhoods.map((n) => {
                  const isTop = topScorer?.id === n.id;
                  const budgetFit = calculateMonthlyBudgetFit(n, monthlyIncome, transitType);
                  return (
                    <div
                      key={n.id}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                        isTop
                          ? 'bg-[#0b1f26] border-[#e8a0b2]/60 shadow-lg shadow-[#e8a0b2]/15'
                          : 'bg-[#061317]/80 border-teal-900/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[11px] font-mono text-teal-200/70 block">
                              {n.district}
                            </span>
                            <h4 className="font-display font-extrabold text-white text-base">
                              {n.name}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(n.id)}
                            className="text-teal-200/60 hover:text-[#f3c1cd] p-1 cursor-pointer"
                            title="Listeden Kaldır"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Overall Score Dial */}
                        <div className="flex items-center gap-3 my-3 p-3 rounded-xl bg-[#061317]/90 border border-teal-900/70">
                          <div className="w-12 h-12 rounded-xl bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/40 font-mono font-bold text-xl flex items-center justify-center shrink-0">
                            {n.livabilityScore}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {n.verdictTitle}
                            </span>
                            <span className="text-[10px] text-teal-200/70 font-mono">
                              Genel Yaşanabilirlik
                            </span>
                          </div>
                        </div>

                        {/* Comparative Breakdown */}
                        <div className="space-y-2.5 text-xs pt-1">
                          <div
                            className={`p-2 rounded-lg flex items-center justify-between border ${
                              safetyWinnerId === n.id
                                ? 'bg-teal-500/20 border-teal-400/40'
                                : 'bg-[#061317]/60 border-teal-900/70'
                            }`}
                          >
                            <span className="text-teal-200/70 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-[#e8a0b2]" />
                              Güvenlik & Asayiş:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong
                                className={
                                  n.safetyScore >= 80 ? 'text-emerald-400' : 'text-[#f3c1cd]'
                                }
                              >
                                {n.safetyScore}
                              </strong>
                              <span className="text-[10px] text-teal-200/60">
                                ({n.crimeRateCategory})
                              </span>
                              {safetyWinnerId === n.id && (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                          </div>

                          <div
                            className={`p-2 rounded-lg flex items-center justify-between border ${
                              transportWinnerId === n.id
                                ? 'bg-teal-500/20 border-teal-400/40'
                                : 'bg-[#061317]/60 border-teal-900/70'
                            }`}
                          >
                            <span className="text-teal-200/70 flex items-center gap-1.5">
                              <TrainFront className="w-3.5 h-3.5 text-teal-300" />
                              Ulaşım & Raylı Sistem:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-teal-300">{n.transportScore}</strong>
                              {transportWinnerId === n.id && (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                          </div>

                          <div
                            className={`p-2 rounded-lg flex items-center justify-between border ${
                              educationWinnerId === n.id
                                ? 'bg-teal-500/20 border-teal-400/40'
                                : 'bg-[#061317]/60 border-teal-900/70'
                            }`}
                          >
                            <span className="text-teal-200/70 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-teal-300" />
                              Eğitim & Okul:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-teal-50">{n.educationScore}</strong>
                              {educationWinnerId === n.id && (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                          </div>

                          <div
                            className={`p-2 rounded-lg flex items-center justify-between border ${
                              entertainmentWinnerId === n.id
                                ? 'bg-teal-500/20 border-teal-400/40'
                                : 'bg-[#061317]/60 border-teal-900/70'
                            }`}
                          >
                            <span className="text-teal-200/70 flex items-center gap-1.5">
                              <PartyPopper className="w-3.5 h-3.5 text-[#e8a0b2]" />
                              Eğlence & Parklar:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-[#f3c1cd]">{n.entertainmentScore}</strong>
                              {entertainmentWinnerId === n.id && (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                          </div>

                          <div
                            className={`p-2 rounded-lg flex items-center justify-between border ${
                              rentWinnerId === n.id
                                ? 'bg-emerald-500/15 border-emerald-500/35'
                                : 'bg-[#061317]/60 border-teal-900/70'
                            }`}
                          >
                            <span className="text-teal-200/70 flex items-center gap-1.5">
                              <Coins className="w-3.5 h-3.5 text-[#e8a0b2]" />
                              Ortalama Kira:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-white">
                                {n.averageRent.toLocaleString('tr-TR')} ₺
                              </strong>
                              {rentWinnerId === n.id && (
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  (Ekonomik)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Budget Fit Summary Block */}
                        <div className="mt-3 p-3 rounded-xl bg-[#061317]/90 border border-[#e8a0b2]/25 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-teal-200/80 flex items-center gap-1">
                              <Wallet className="w-3 h-3 text-[#e8a0b2]" />
                              Aylık Gider (Kira+Aidat+EGO)
                            </span>
                            <strong className={`font-mono ${budgetFit.textClass}`}>
                              {budgetFit.totalCost.toLocaleString('tr-TR')} ₺
                            </strong>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#0b1f26] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${budgetFit.barClass}`}
                              style={{ width: `${Math.min(100, budgetFit.budgetRatio)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className={budgetFit.textClass}>
                              Bütçenin %{budgetFit.budgetRatio}'i
                            </span>
                            <span className="text-teal-200/70">{budgetFit.statusLabel}</span>
                          </div>
                        </div>

                        <div className="mt-3 p-3 rounded-xl bg-[#061317] border border-teal-900/70">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#f3c1cd] block mb-1">
                            Özet Yaşanabilirlik Kararı:
                          </span>
                          <p className="text-xs text-teal-50/90 line-clamp-3">{n.verdictSummary}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectForDetails(n)}
                        className="mt-4 w-full py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 text-slate-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Mahalle Karnesini Aç</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#061317] border-t border-[#e8a0b2]/25 flex items-center justify-between text-xs text-teal-200/70">
          <span>En fazla 3 mahalleyi eşzamanlı kıyaslayabilirsiniz</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold hover:brightness-105 transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
