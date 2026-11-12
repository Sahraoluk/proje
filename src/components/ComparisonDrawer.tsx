import React from 'react';
import { NeighborhoodData } from '../types';
import { 
  X, 
  Scale, 
  Trophy, 
  Sparkles, 
  ShieldAlert, 
  GraduationCap, 
  TrainFront, 
  PartyPopper, 
  Coins, 
  Check, 
  ArrowRight,
  Plus
} from 'lucide-react';

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
  if (!isOpen) return null;

  // Determine top scorer among compared
  const topScorer = [...comparedNeighborhoods].sort((a, b) => b.livabilityScore - a.livabilityScore)[0];

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
  const rentWinnerId = getMetricWinner('averageRent', true); // lower rent is better for economy

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl glass-panel neon-border shadow-2xl flex flex-col text-slate-100 max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Bölgesel Karşılaştırma Analizi
              </h3>
              <p className="text-xs text-slate-400">
                Seçtiğiniz Ankara mahallelerini yaşam, güvenlik, eğitim, ulaşım ve eğlence yönünden kıyaslayın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {comparedNeighborhoods.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">
                Karşılaştırma listeniz boş
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Haritadan veya mahalle listesinden 2 veya 3 mahalle seçerek yan yana kriter bazında karşılaştırabilirsiniz.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {allNeighborhoods.slice(0, 3).map(n => (
                  <button
                    key={n.id}
                    onClick={() => onAddNeighborhood(n)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{n.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Winner Banner if >= 2 compared */}
              {comparedNeighborhoods.length >= 2 && topScorer && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-emerald-500/15 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                        Genel Yaşanabilirlik Lideri
                      </span>
                      <h4 className="font-display font-bold text-base text-white">
                        {topScorer.name} ({topScorer.district}) — {topScorer.livabilityScore}/100 Puan
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs text-slate-300 hidden md:inline">
                    {topScorer.verdictTitle}
                  </span>
                </div>
              )}

              {/* Side-by-Side Comparison Columns Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-${Math.min(comparedNeighborhoods.length, 3)} gap-4`}>
                {comparedNeighborhoods.map((n) => {
                  const isTop = topScorer?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                        isTop 
                          ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5' 
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      {/* Top Bar of Card */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[11px] font-mono text-slate-400 block">{n.district}</span>
                            <h4 className="font-display font-extrabold text-white text-base">
                              {n.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => onRemove(n.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Listeden Kaldır"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Overall Score Dial */}
                        <div className="flex items-center gap-3 my-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold text-xl flex items-center justify-center shrink-0">
                            {n.livabilityScore}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{n.verdictTitle}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Genel Yaşanabilirlik</span>
                          </div>
                        </div>

                        {/* Comparative Breakdown Table */}
                        <div className="space-y-2.5 text-xs pt-1">
                          
                          {/* Güvenlik */}
                          <div className={`p-2 rounded-lg flex items-center justify-between border ${safetyWinnerId === n.id ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/40 border-slate-800/80'}`}>
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              Güvenlik & Asayiş:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className={n.safetyScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{n.safetyScore}</strong>
                              <span className="text-[10px] text-slate-500">({n.crimeRateCategory})</span>
                              {safetyWinnerId === n.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                          </div>

                          {/* Ulaşım & EGO */}
                          <div className={`p-2 rounded-lg flex items-center justify-between border ${transportWinnerId === n.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-950/40 border-slate-800/80'}`}>
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <TrainFront className="w-3.5 h-3.5 text-cyan-400" />
                              Ulaşım & Raylı Sistem:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-cyan-300">{n.transportScore}</strong>
                              {transportWinnerId === n.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                          </div>

                          {/* Eğitim */}
                          <div className={`p-2 rounded-lg flex items-center justify-between border ${educationWinnerId === n.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-950/40 border-slate-800/80'}`}>
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                              Eğitim & Okul:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-indigo-300">{n.educationScore}</strong>
                              {educationWinnerId === n.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                          </div>

                          {/* Eğlence & Kültür */}
                          <div className={`p-2 rounded-lg flex items-center justify-between border ${entertainmentWinnerId === n.id ? 'bg-pink-500/10 border-pink-500/30' : 'bg-slate-950/40 border-slate-800/80'}`}>
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
                              Eğlence & Parklar:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-pink-300">{n.entertainmentScore}</strong>
                              {entertainmentWinnerId === n.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                          </div>

                          {/* Ortalama Kira */}
                          <div className={`p-2 rounded-lg flex items-center justify-between border ${rentWinnerId === n.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800/80'}`}>
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Coins className="w-3.5 h-3.5 text-amber-400" />
                              Ortalama Kira:
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <strong className="text-white">{n.averageRent.toLocaleString('tr-TR')} ₺</strong>
                              {rentWinnerId === n.id && <span className="text-[10px] text-emerald-400 font-bold">(Ekonomik)</span>}
                            </div>
                          </div>

                        </div>

                        {/* Text Verdict Summary */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Özet Yaşanabilirlik Kararı:
                          </span>
                          <p className="text-xs text-slate-300 line-clamp-3">
                            {n.verdictSummary}
                          </p>
                        </div>
                      </div>

                      {/* Detail CTA */}
                      <button
                        onClick={() => {
                          onSelectForDetails(n);
                        }}
                        className="mt-4 w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>En fazla 3 mahalleyi eşzamanlı kıyaslayabilirsiniz</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
