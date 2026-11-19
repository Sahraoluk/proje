import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FeedbackItem, NeighborhoodData } from '../types';
import {
  MessageSquare,
  Send,
  User,
  Search,
  MapPin,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrainFront,
  Sparkles,
  FileJson,
  ChevronRight,
} from 'lucide-react';
import {
  FEEDBACK_UPDATED_EVENT,
  loadAllFeedback,
  saveFeedbackItem,
} from '../utils/feedbackStorage';

interface CommunityReviewsPageProps {
  neighborhoods: NeighborhoodData[];
  onSelectNeighborhood: (n: NeighborhoodData) => void;
}

export const CommunityReviewsPage: React.FC<CommunityReviewsPageProps> = ({
  neighborhoods,
  onSelectNeighborhood,
}) => {
  const [reviews, setReviews] = useState<FeedbackItem[]>(() => loadAllFeedback());

  // Form state
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(
    neighborhoods[0]?.id || ''
  );
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [safety, setSafety] = useState<number>(80);
  const [transport, setTransport] = useState<number>(80);
  const [livability, setLivability] = useState<number>(80);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter state
  const [filterNeighborhoodId, setFilterNeighborhoodId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const neighborhoodMap = useMemo(() => {
    const map = new Map<string, NeighborhoodData>();
    neighborhoods.forEach((n) => map.set(n.id, n));
    return map;
  }, [neighborhoods]);

  const refreshReviews = useCallback(() => {
    setReviews(loadAllFeedback());
  }, []);

  useEffect(() => {
    refreshReviews();
    const handleSync = () => refreshReviews();
    window.addEventListener(FEEDBACK_UPDATED_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(FEEDBACK_UPDATED_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshReviews]);

  useEffect(() => {
    if (!selectedNeighborhoodId && neighborhoods.length > 0) {
      setSelectedNeighborhoodId(neighborhoods[0].id);
    }
  }, [neighborhoods, selectedNeighborhoodId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedNeighborhoodId) {
      setErrorMsg('Lütfen yorum yapmak istediğiniz mahalleyi seçin.');
      return;
    }
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setErrorMsg('Lütfen mahalle hakkındaki yorumunuzu yazın.');
      return;
    }

    const saved = saveFeedbackItem({
      neighborhoodId: selectedNeighborhoodId,
      name,
      comment: trimmedComment,
      safety,
      transport,
      livability,
    });

    setReviews((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    setName('');
    setComment('');
    setSafety(80);
    setTransport(80);
    setLivability(80);
    setSuccessMsg('Yorumunuz tarayıcınıza kalıcı olarak kaydedildi!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(reviews, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ankara-kullanici-yorumlari.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      if (filterNeighborhoodId !== 'all' && item.neighborhoodId !== filterNeighborhoodId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLocaleLowerCase('tr-TR');
        const n = neighborhoodMap.get(item.neighborhoodId);
        const matchesAuthor = item.name.toLocaleLowerCase('tr-TR').includes(q);
        const matchesComment = item.comment.toLocaleLowerCase('tr-TR').includes(q);
        const matchesNeighborhood = n
          ? `${n.name} ${n.district}`.toLocaleLowerCase('tr-TR').includes(q)
          : false;
        if (!matchesAuthor && !matchesComment && !matchesNeighborhood) return false;
      }
      return true;
    });
  }, [reviews, filterNeighborhoodId, searchQuery, neighborhoodMap]);

  const averages = useMemo(() => {
    if (filteredReviews.length === 0) {
      return { safety: 0, transport: 0, livability: 0 };
    }
    const totals = filteredReviews.reduce(
      (acc, r) => ({
        safety: acc.safety + r.safety,
        transport: acc.transport + r.transport,
        livability: acc.livability + r.livability,
      }),
      { safety: 0, transport: 0, livability: 0 }
    );
    return {
      safety: Math.round(totals.safety / filteredReviews.length),
      transport: Math.round(totals.transport / filteredReviews.length),
      livability: Math.round(totals.livability / filteredReviews.length),
    };
  }, [filteredReviews]);

  const getSliderColor = (val: number) => {
    if (val < 55) return 'accent-red-500';
    if (val < 75) return 'accent-yellow-400';
    return 'accent-emerald-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner + Stats */}
      <div className="rounded-3xl glass-panel neon-border p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] font-mono text-[11px] font-bold uppercase tracking-wider">
            <FileJson className="w-3.5 h-3.5 text-[#e8a0b2]" />
            <span>Yerel Kalıcı Topluluk Arşivi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Ankara Mahalleleri Kullanıcı Yorumları
          </h2>
          <p className="text-xs sm:text-sm text-teal-200/75 max-w-2xl">
            Mahalle sakinlerinin deneyimlerini okuyun, yaşadığınız veya incelediğiniz mahalle
            hakkında yorum bırakın. Tüm değerlendirmeler tarayıcınızda kalıcı olarak saklanır ve
            dilediğinizde JSON olarak dışa aktarılabilir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-[#061317]/85 border border-teal-900/70 text-center">
            <span className="block text-[10px] font-mono text-teal-200/70 uppercase">
              Kayıtlı Yorum
            </span>
            <strong className="text-lg font-mono text-white">{reviews.length}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#061317]/85 border border-teal-900/70 text-center">
            <span className="block text-[10px] font-mono text-teal-200/70 uppercase">
              Ort. Yaşam
            </span>
            <strong className="text-lg font-mono text-emerald-400">
              {filteredReviews.length > 0 ? `${averages.livability}/100` : '-'}
            </strong>
          </div>
          <button
            type="button"
            onClick={handleDownloadJson}
            disabled={reviews.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#061317] hover:bg-[#e8a0b2]/15 disabled:opacity-50 border border-[#e8a0b2]/35 text-xs font-semibold text-[#f3c1cd] transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Kayıtlı tüm yorumları JSON dosyası olarak indir"
          >
            <Download className="w-4 h-4" />
            <span>JSON İndir</span>
          </button>
        </div>
      </div>

      {/* Two-Column Layout: Form + Reviews Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Add Review Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-3xl glass-panel neon-border p-5 sm:p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-teal-900/70 pb-3">
            <div className="p-2 rounded-xl bg-[#e8a0b2]/15 border border-[#e8a0b2]/35 text-[#f3c1cd]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Yeni Yorum Ekle</h3>
              <p className="text-[11px] text-teal-200/70">
                Görüşünüz anında yerel arşive kaydedilir
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-teal-100 block">
              Mahalle Seçin <span className="text-[#f3c1cd]">*</span>
            </label>
            <select
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
              className="w-full rounded-xl bg-[#061317] border border-[#e8a0b2]/30 px-3 py-2.5 text-xs text-teal-50 focus:outline-none focus:border-[#e8a0b2]"
            >
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.district})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-teal-100 block">
              Adınız / Rumuzunuz (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Çankaya Sakini, ODTÜ Öğrencisi..."
              maxLength={60}
              className="w-full rounded-xl bg-[#061317] border border-teal-900/70 px-3 py-2 text-xs text-teal-50 placeholder-teal-200/45 focus:outline-none focus:border-[#e8a0b2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-teal-100 block">
              Mahalle Deneyiminiz & Yorumunuz <span className="text-[#f3c1cd]">*</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Güvenlik, toplu taşıma, komşuluk, kira veya gürültü hakkındaki gözlemlerinizi paylaşın..."
              maxLength={800}
              className="w-full rounded-xl bg-[#061317] border border-teal-900/70 p-3 text-xs text-teal-50 placeholder-teal-200/45 focus:outline-none focus:border-[#e8a0b2]"
            />
          </div>

          {/* Rating Sliders */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-[#061317]/80 border border-teal-900/70">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-teal-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#e8a0b2]" />
                  Güvenlik Puanınız
                </span>
                <span className="font-mono font-bold text-white">{safety}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={safety}
                onChange={(e) => setSafety(Number(e.target.value))}
                className={`w-full ${getSliderColor(safety)}`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-teal-100 flex items-center gap-1.5">
                  <TrainFront className="w-3.5 h-3.5 text-teal-300" />
                  Ulaşım Puanınız
                </span>
                <span className="font-mono font-bold text-white">{transport}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={transport}
                onChange={(e) => setTransport(Number(e.target.value))}
                className={`w-full ${getSliderColor(transport)}`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-teal-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Genel Yaşam Kalitesi
                </span>
                <span className="font-mono font-bold text-white">{livability}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={livability}
                onChange={(e) => setLivability(Number(e.target.value))}
                className={`w-full ${getSliderColor(livability)}`}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-700/70 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/70 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f3c1cd] via-[#e8a0b2] to-[#d8839a] hover:brightness-105 text-slate-950 text-xs font-extrabold shadow-md shadow-[#e8a0b2]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Yorumu Gönder & Kaydet</span>
          </button>
        </form>

        {/* Right: Persisted Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="rounded-2xl glass-panel border border-[#e8a0b2]/25 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-teal-300/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Yorum, kullanıcı veya mahalle ara..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#061317] border border-teal-900/70 text-xs text-teal-50 placeholder-teal-200/45 focus:outline-none focus:border-[#e8a0b2]"
              />
            </div>

            <select
              value={filterNeighborhoodId}
              onChange={(e) => setFilterNeighborhoodId(e.target.value)}
              className="sm:w-60 rounded-xl bg-[#061317] border border-teal-900/70 px-3 py-2 text-xs text-teal-50 focus:outline-none focus:border-[#e8a0b2]"
            >
              <option value="all">Tüm Mahalleler ({reviews.length})</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reviews Feed */}
          {filteredReviews.length === 0 ? (
            <div className="rounded-3xl glass-panel border border-teal-900/70 p-10 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-[#e8a0b2]/50 mx-auto" />
              <h4 className="font-display font-bold text-sm text-white">
                {reviews.length === 0
                  ? 'Henüz kayıtlı kullanıcı yorumu yok'
                  : 'Aramanızla eşleşen yorum bulunamadı'}
              </h4>
              <p className="text-xs text-teal-200/70 max-w-md mx-auto">
                {reviews.length === 0
                  ? 'Sol taraftaki formu kullanarak ilk mahalle yorumunu ekleyin; yorumunuz tarayıcı arşivine kaydedilecektir.'
                  : 'Farklı bir mahalle seçebilir veya arama metnini temizleyebilirsiniz.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((item) => {
                const targetNeighborhood = neighborhoodMap.get(item.neighborhoodId);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl glass-panel border border-[#e8a0b2]/20 hover:border-[#e8a0b2]/45 p-4 sm:p-5 space-y-3 transition-colors shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-white">
                            <User className="w-3.5 h-3.5 text-[#f3c1cd]" />
                            {item.name}
                          </span>
                          <span className="text-teal-200/40">·</span>
                          <span className="font-mono text-[11px] text-teal-200/65">
                            {new Date(item.createdAt).toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {targetNeighborhood ? (
                          <button
                            type="button"
                            onClick={() => onSelectNeighborhood(targetNeighborhood)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-300 hover:text-[#f3c1cd] transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>
                              {targetNeighborhood.name} ({targetNeighborhood.district})
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-200/70">
                            <MapPin className="w-3 h-3" />
                            <span>{item.neighborhoodId}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-lg bg-[#061317] text-[#f3c1cd] border border-[#e8a0b2]/30">
                          Güvenlik: {item.safety}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#061317] text-teal-300 border border-teal-800/70">
                          Ulaşım: {item.transport}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#061317] text-emerald-400 border border-emerald-800/70">
                          Yaşam: {item.livability}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-teal-50/95 leading-relaxed bg-[#061317]/65 border border-teal-900/60 rounded-xl p-3">
                      {item.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
