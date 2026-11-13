import React, { useState } from 'react';
import { NeighborhoodData } from '../types';

interface Feedback {
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
  const [feedback, setFeedback] = useState<Feedback>({
    name: '',
    comment: '',
    safety: 50,
    transport: 50,
    livability: 50,
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = () => {
    const existing = JSON.parse(localStorage.getItem(`feedback-${neighborhood.id}`) || '[]');
    localStorage.setItem(`feedback-${neighborhood.id}`, JSON.stringify([...existing, feedback]));
    onUpdate();
    setFeedback({ name: '', comment: '', safety: 50, transport: 50, livability: 50 });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const getSliderColor = (val: number) => {
    if (val < 55) return 'accent-red-500';
    if (val < 75) return 'accent-[#e8a0b2]';
    return 'accent-emerald-400';
  };

  return (
    <div className="p-4 rounded-xl bg-[#061317]/80 border border-[#e8a0b2]/25 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Görüş Ekle</h4>
        {savedNotice && (
          <span className="text-[11px] text-emerald-400 font-semibold">
            Görüşünüz kaydedildi!
          </span>
        )}
      </div>
      <input
        type="text"
        placeholder="Rumuzunuz"
        className="w-full bg-[#0b1f26] border border-teal-900/70 p-2 text-xs text-teal-50 placeholder-teal-200/50 rounded-lg focus:outline-none focus:border-[#e8a0b2]"
        value={feedback.name}
        onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
      />
      <textarea
        placeholder="Mahalle hakkındaki deneyiminiz ve yorumunuz..."
        className="w-full bg-[#0b1f26] border border-teal-900/70 p-2 text-xs text-teal-50 placeholder-teal-200/50 rounded-lg focus:outline-none focus:border-[#e8a0b2]"
        value={feedback.comment}
        onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
      />

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
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-2 bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
      >
        Gönder
      </button>
    </div>
  );
};
