import React, { useState, useEffect, useCallback } from 'react';
import { FeedbackItem, NeighborhoodData } from '../types';
import { MessageSquare, Send, User } from 'lucide-react';
import {
  FEEDBACK_UPDATED_EVENT,
  loadAllFeedback,
  saveFeedbackItem,
} from '../utils/feedbackStorage';

interface FeedbackDraft {
  name: string;
  comment: string;
  safety: number;
  transport: number;
  livability: number;
}

export const UserFeedback: React.FC<{ neighborhood: NeighborhoodData; onUpdate: () => void }> = ({
  neighborhood,
  onUpdate,
}) => {
  const [feedback, setFeedback] = useState<FeedbackDraft>({
    name: '',
    comment: '',
    safety: 75,
    transport: 75,
    livability: 75,
  });
  const [reviews, setReviews] = useState<FeedbackItem[]>(() =>
    loadAllFeedback(neighborhood.id)
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const refreshReviews = useCallback(() => {
    setReviews(loadAllFeedback(neighborhood.id));
  }, [neighborhood.id]);

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

  const handleSubmit = () => {
    const trimmedComment = feedback.comment.trim();
    if (!trimmedComment) {
      setErrorNotice('Lütfen mahalle hakkında kısa bir yorum yazın.');
      setTimeout(() => setErrorNotice(null), 2500);
      return;
    }

    setErrorNotice(null);
    const saved = saveFeedbackItem({
      neighborhoodId: neighborhood.id,
      name: feedback.name,
      comment: trimmedComment,
      safety: feedback.safety,
      transport: feedback.transport,
      livability: feedback.livability,
    });

    setReviews((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    setFeedback({ name: '', comment: '', safety: 75, transport: 75, livability: 75 });
    setSavedNotice('Görüşünüz tarayıcınıza kalıcı olarak kaydedildi!');
    onUpdate();
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const getSliderColor = (val: number) => {
    if (val < 55) return 'accent-red-500';
    if (val < 75) return 'accent-[#e8a0b2]';
    return 'accent-emerald-400';
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#061317]/80 border border-[#e8a0b2]/25 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#e8a0b2]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Mahalle Sakinleri Görüşleri & Puanlama ({reviews.length})
          </h4>
        </div>
        {savedNotice && (
          <span className="text-[11px] text-emerald-400 font-semibold">{savedNotice}</span>
        )}
        {errorNotice && (
          <span className="text-[11px] text-red-400 font-semibold">{errorNotice}</span>
        )}
      </div>

      {/* Existing Persisted Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {reviews.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#0b1f26]/85 border border-teal-900/70 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <User className="w-3 h-3 text-[#f3c1cd]" />
                  {item.name}
                </span>
                <span className="font-mono text-[10px] text-teal-200/60">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-xs text-teal-50/90 leading-relaxed">{item.comment}</p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-[#061317] text-[#f3c1cd] border border-teal-900/60">
                  Güvenlik: {item.safety}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#061317] text-teal-300 border border-teal-900/60">
                  Ulaşım: {item.transport}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#061317] text-emerald-400 border border-teal-900/60">
                  Yaşam: {item.livability}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-teal-200/65 italic">
          Bu mahalle için henüz topluluk yorumu eklenmemiş. İlk değerlendirmeyi siz yazın!
        </p>
      )}

      {/* Submit New Review Form */}
      <div className="pt-3 border-t border-teal-900/70 space-y-3">
        <input
          type="text"
          placeholder="Rumuzunuz (isteğe bağlı)"
          className="w-full bg-[#0b1f26] border border-teal-900/70 p-2 text-xs text-teal-50 placeholder-teal-200/50 rounded-lg focus:outline-none focus:border-[#e8a0b2]"
          value={feedback.name}
          onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
        />
        <textarea
          placeholder="Mahalle hakkındaki deneyiminiz, sokak aydınlatması veya komşuluk yorumunuz..."
          rows={2}
          className="w-full bg-[#0b1f26] border border-teal-900/70 p-2 text-xs text-teal-50 placeholder-teal-200/50 rounded-lg focus:outline-none focus:border-[#e8a0b2]"
          value={feedback.comment}
          onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['safety', 'transport', 'livability'] as const).map((key) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-[11px] text-teal-200/70">
                <span>
                  {key === 'safety' ? 'Güvenlik' : key === 'transport' ? 'Ulaşım' : 'Yaşam Kalitesi'}
                </span>
                <span className="font-mono font-bold text-white">{feedback[key]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className={`w-full ${getSliderColor(feedback[key])}`}
                value={feedback[key]}
                onChange={(e) => setFeedback({ ...feedback, [key]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2 bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Yorumu Gönder & Kaydet</span>
        </button>
      </div>
    </div>
  );
};
