import React, { useState } from 'react';
import { NeighborhoodData } from '../types';
import { Wallet, TrainFront, GraduationCap, UserCheck, Coins } from 'lucide-react';

export type TransitPassType = 'student' | 'full';

export const EGO_PASS_COSTS: Record<TransitPassType, { label: string; monthlyCost: number }> = {
  student: { label: 'Öğrenci EGO Abonman', monthlyCost: 350 },
  full: { label: 'Tam EGO Abonman', monthlyCost: 1500 },
};

export interface BudgetFitResult {
  rent: number;
  aidat: number;
  transitCost: number;
  totalCost: number;
  budgetRatio: number;
  remaining: number;
  statusLabel: string;
  badgeClass: string;
  barClass: string;
  textClass: string;
}

export function estimateNeighborhoodAidat(n: NeighborhoodData): number {
  const rent = n.averageRent || 20000;
  if (n.incomeLevel === 'Çok Yüksek' || rent >= 38000) return 3200;
  if (n.incomeLevel === 'Yüksek' || rent >= 28000) return 2100;
  if (n.incomeLevel === 'Orta-Üst' || rent >= 22000) return 1500;
  return 1000;
}

export function calculateMonthlyBudgetFit(
  n: NeighborhoodData,
  monthlyIncome: number,
  transitType: TransitPassType
): BudgetFitResult {
  const safeIncome = Math.max(5000, monthlyIncome);
  const rent = n.averageRent || 0;
  const aidat = estimateNeighborhoodAidat(n);
  const transitCost = EGO_PASS_COSTS[transitType].monthlyCost;
  const totalCost = rent + aidat + transitCost;
  const budgetRatio = Math.round((totalCost / safeIncome) * 100);
  const remaining = safeIncome - totalCost;

  if (budgetRatio <= 35) {
    return {
      rent,
      aidat,
      transitCost,
      totalCost,
      budgetRatio,
      remaining,
      statusLabel: 'Çok Rahat · Bütçe Dostu',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      barClass: 'bg-emerald-400',
      textClass: 'text-emerald-400',
    };
  }
  if (budgetRatio <= 50) {
    return {
      rent,
      aidat,
      transitCost,
      totalCost,
      budgetRatio,
      remaining,
      statusLabel: 'Dengeli · Sürdürülebilir',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
      barClass: 'bg-teal-400',
      textClass: 'text-teal-300',
    };
  }
  if (budgetRatio <= 70) {
    return {
      rent,
      aidat,
      transitCost,
      totalCost,
      budgetRatio,
      remaining,
      statusLabel: 'Bütçeyi Zorlar',
      badgeClass: 'bg-[#e8a0b2]/20 text-[#f3c1cd] border-[#e8a0b2]/45',
      barClass: 'bg-[#e8a0b2]',
      textClass: 'text-[#f3c1cd]',
    };
  }
  return {
    rent,
    aidat,
    transitCost,
    totalCost,
    budgetRatio,
    remaining,
    statusLabel: 'Yüksek Finansal Yük',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/45',
    barClass: 'bg-red-500',
    textClass: 'text-red-400',
  };
}

interface BudgetSimulatorProps {
  neighborhood: NeighborhoodData;
  initialIncome?: number;
}

export const BudgetSimulator: React.FC<BudgetSimulatorProps> = ({
  neighborhood,
  initialIncome = 45000,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialIncome);
  const [transitType, setTransitType] = useState<TransitPassType>('full');

  const fit = calculateMonthlyBudgetFit(neighborhood, monthlyIncome, transitType);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#061317]/85 border border-[#e8a0b2]/30 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#f3c1cd] font-display font-bold text-sm">
          <Wallet className="w-4 h-4 text-[#e8a0b2]" />
          <span>Yaşam Maliyeti & Bütçe Uygunluk Simülatörü</span>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${fit.badgeClass}`}>
          Bütçenin %{fit.budgetRatio}'i · {fit.statusLabel}
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-teal-200/75 font-medium flex items-center justify-between mb-1.5">
            <span>Aylık Gelir / Burs (₺):</span>
            <span className="font-mono font-bold text-white">
              {monthlyIncome.toLocaleString('tr-TR')} ₺
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5000}
              max={500000}
              step={1000}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Math.max(5000, Number(e.target.value) || 5000))}
              className="w-full px-3 py-2 rounded-xl bg-[#0b1f26] border border-[#e8a0b2]/30 text-teal-50 font-mono focus:outline-none focus:border-[#e8a0b2]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {[20000, 35000, 50000, 75000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMonthlyIncome(preset)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors cursor-pointer ${
                  monthlyIncome === preset
                    ? 'bg-[#e8a0b2]/25 text-[#f3c1cd] border-[#e8a0b2]/60'
                    : 'bg-[#0b1f26] text-teal-200/70 border-teal-900/70 hover:text-white'
                }`}
              >
                {(preset / 1000).toFixed(0)}k ₺
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-teal-200/75 font-medium flex items-center gap-1.5 mb-1.5">
            <TrainFront className="w-3.5 h-3.5 text-teal-300" />
            <span>Ulaşım Abonman Tipi (EGO):</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTransitType('student')}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                transitType === 'student'
                  ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 border-transparent font-bold'
                  : 'bg-[#0b1f26] text-teal-50 border-teal-900/70 hover:border-[#e8a0b2]/40'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px]">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Öğrenci EGO</span>
              </div>
              <div className="text-[10px] font-mono opacity-80 mt-0.5">350 ₺ / ay</div>
            </button>

            <button
              type="button"
              onClick={() => setTransitType('full')}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                transitType === 'full'
                  ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 border-transparent font-bold'
                  : 'bg-[#0b1f26] text-teal-50 border-teal-900/70 hover:border-[#e8a0b2]/40'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px]">
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Tam EGO</span>
              </div>
              <div className="text-[10px] font-mono opacity-80 mt-0.5">1.500 ₺ / ay</div>
            </button>
          </div>
        </div>
      </div>

      {/* Cost Breakdown & Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-[#0b1f26]/80 border border-teal-900/70">
            <span className="text-teal-200/70 block">Ortalama Kira</span>
            <strong className="text-white">{fit.rent.toLocaleString('tr-TR')} ₺</strong>
          </div>
          <div className="p-2 rounded-lg bg-[#0b1f26]/80 border border-teal-900/70">
            <span className="text-teal-200/70 block">Tahmini Aidat</span>
            <strong className="text-teal-200">{fit.aidat.toLocaleString('tr-TR')} ₺</strong>
          </div>
          <div className="p-2 rounded-lg bg-[#0b1f26]/80 border border-teal-900/70">
            <span className="text-teal-200/70 block">EGO Ulaşım</span>
            <strong className="text-teal-300">{fit.transitCost.toLocaleString('tr-TR')} ₺</strong>
          </div>
          <div className="p-2 rounded-lg bg-[#0b1f26]/80 border border-[#e8a0b2]/30">
            <span className="text-teal-200/70 block flex items-center gap-1">
              <Coins className="w-3 h-3 text-[#e8a0b2]" />
              Toplam Gider
            </span>
            <strong className={fit.textClass}>{fit.totalCost.toLocaleString('tr-TR')} ₺</strong>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full h-2.5 rounded-full bg-[#0b1f26] overflow-hidden border border-teal-900/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${fit.barClass}`}
              style={{ width: `${Math.min(100, fit.budgetRatio)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-teal-200/75">
            <span>
              Kira + Aidat + EGO payı: <strong className={fit.textClass}>%{fit.budgetRatio}</strong>
            </span>
            <span>
              {fit.remaining >= 0 ? (
                <>
                  Kalan Bütçe:{' '}
                  <strong className="text-emerald-400">
                    {fit.remaining.toLocaleString('tr-TR')} ₺
                  </strong>
                </>
              ) : (
                <>
                  Bütçe Açığı:{' '}
                  <strong className="text-red-400">
                    {Math.abs(fit.remaining).toLocaleString('tr-TR')} ₺
                  </strong>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
