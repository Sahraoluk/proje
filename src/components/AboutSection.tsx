import React from 'react';
import {
  ShieldAlert,
  TrainFront,
  Sparkles,
  BookOpen,
  Calculator,
  Database,
  Code2,
  ArrowRight,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface AboutSectionProps {
  variant?: 'editorial' | 'full';
  onOpenFullAbout?: () => void;
  onBackToMap?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  variant = 'full',
  onOpenFullAbout,
  onBackToMap,
}) => {
  if (variant === 'editorial') {
    return (
      <section
        id="about-story"
        className="space-y-5 pt-2 animate-in fade-in duration-300"
      >
        {/* Editorial Main Narrative Card (moved below map) */}
        <div className="rounded-3xl glass-panel neon-border p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#e8a0b2]/10 blur-3xl" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative">
            <div className="max-w-3xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] font-mono text-[11px] font-bold uppercase tracking-wider">
                  Ankara Kentsel Yaşam & Güvenlik Karşılaştırma Portalı
                </span>
                <span className="text-teal-200/50 hidden sm:inline">·</span>
                <span className="text-xs text-teal-200/75 font-mono hidden sm:inline">
                  Ekim 2024 EGO (53.3M Yolcu) & 2012-2026 Statbase Güvenlik Verileriyle Doğrulanmıştır
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Ankara'da Nerede Yaşanır?{' '}
                <span className="bg-gradient-to-r from-[#f3c1cd] via-[#e8a0b2] to-teal-300 bg-clip-text text-transparent">
                  Güvenlik, Ulaşım, Eğitim & Sosyal Yaşam
                </span>{' '}
                Karnesi
              </h1>

              <p className="text-xs sm:text-sm text-teal-200/80 leading-relaxed font-sans">
                Ankara'nın Çankaya, Yenimahalle, Keçiören, Altındağ, Etimesgut, Mamak ve Gölbaşı gibi
                tüm ilçelerindeki mahalleleri seçin; güvenlik seviyesini, EGO metro hatlarına
                erişimini, okul olanaklarını ve eğlence imkanlarını puanlayarak{' '}
                <strong className="text-white">burada yaşanıp yaşanılamayacağını</strong> detaylı
                analizlerle öğrenin.
              </p>
            </div>

            {onOpenFullAbout && (
              <button
                type="button"
                onClick={onOpenFullAbout}
                className="self-start lg:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#061317] hover:bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/40 text-xs font-bold transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Metodoloji & Hakkında</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Map Guide & Methodology Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl glass-panel border border-[#e8a0b2]/25 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/35 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Renk Kodlu Güvenlik Katmanı</h4>
              <p className="text-xs text-teal-200/70 mt-0.5 leading-relaxed">
                Kırmızı halkalı noktalar yüksek suç / asayiş riski taşıyan mahalleleri, zümrüt
                yeşili ise Ankara'nın en huzurlu bölgelerini gösterir.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-teal-900/70 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/40 shrink-0">
              <TrainFront className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                EGO & Raylı Sistem Entegrasyonu
              </h4>
              <p className="text-xs text-teal-200/70 mt-0.5 leading-relaxed">
                Haritadaki raylı sistem düğmesi M1-M4 metroları, Ankaray ve Başkentray'ı
                gösterir. Ekim 2024 53.3 milyon yolcu dağılımına göredir.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-[#e8a0b2]/25 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#e8a0b2]/15 text-[#f3c1cd] border border-[#e8a0b2]/35 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Orada Yaşanabilir mi? Puanı</h4>
              <p className="text-xs text-teal-200/70 mt-0.5 leading-relaxed">
                Herhangi bir mahalleye tıklayarak; eğitim kalitesi, ulaşım, sosyal yaşam ve
                kiranın harmanlandığı nihai yaşanabilirlik raporunu inceleyin.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Overview Banner */}
      <div className="rounded-3xl glass-panel neon-border p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#e8a0b2]/10 blur-3xl" />
        <div className="relative space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8a0b2]/15 border border-[#e8a0b2]/40 text-[#f3c1cd] font-mono text-[11px] font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#e8a0b2]" />
            <span>Proje Metodolojisi & Hakkında</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Ankara Yaşam & Güvenlik Atlası Nedir?
          </h2>

          <p className="text-sm text-teal-100/85 leading-relaxed">
            Ankara Yaşam & Güvenlik Atlası; başkente yeni taşınacaklar, öğrenciler, aileler ve
            kentsel veri araştırmacıları için geliştirilmiş etkileşimli bir karar destek
            portalıdır. Tek bir harita ve karşılaştırma arayüzü üzerinden mahallelerin güvenlik
            düzeyini, toplu taşıma bağlantısını, kira ortalamalarını ve sosyal yaşam kalitesini
            şeffaf ölçütlerle bir araya getirir.
          </p>

          {onBackToMap && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToMap}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 font-bold text-xs shadow-md shadow-[#e8a0b2]/25 hover:brightness-105 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Etkileşimli Haritaya Dön</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scoring Algorithm & Risk Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-3xl glass-panel border border-[#e8a0b2]/25 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#e8a0b2]/15 border border-[#e8a0b2]/35 text-[#f3c1cd]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Skorlama Algoritması Nasıl Çalışır?
              </h3>
              <p className="text-xs text-teal-200/70">
                Çok kriterli ağırlıklı ortalama & dinamik normalizasyon
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-teal-100/85 leading-relaxed">
            Her mahallenin temel <strong className="text-white">Yaşanabilirlik Puanı (0–100)</strong>,
            dört ana eksenin ağırlıklı ortalamasından hesaplanır. Kullanıcılar harita üzerindeki{' '}
            <strong className="text-[#f3c1cd]">Skor Ağırlıkları</strong> panelinden kendi
            önceliklerine göre bu ağırlıkları %0 ile %100 arasında değiştirdiğinde tüm puanlar
            otomatik olarak %100'e normalize edilerek anlık yeniden hesaplanır:
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#061317]/85 border border-teal-900/70">
              <span className="text-teal-200/70 block text-[11px]">Varsayılan Güvenlik</span>
              <strong className="text-[#f3c1cd] text-base">%35 Ağırlık</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#061317]/85 border border-teal-900/70">
              <span className="text-teal-200/70 block text-[11px]">Varsayılan Ulaşım (EGO)</span>
              <strong className="text-teal-300 text-base">%25 Ağırlık</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#061317]/85 border border-teal-900/70">
              <span className="text-teal-200/70 block text-[11px]">Varsayılan Kira / Ekonomi</span>
              <strong className="text-[#f3c1cd] text-base">%20 Ağırlık</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#061317]/85 border border-teal-900/70">
              <span className="text-teal-200/70 block text-[11px]">Yeşil Alan & Sosyal</span>
              <strong className="text-emerald-400 text-base">%20 Ağırlık</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#061317]/85 border border-teal-900/70 text-xs space-y-1.5">
            <span className="font-bold text-white block">Renk ve Risk Sınıflandırma Kuralı:</span>
            <ul className="space-y-1 text-teal-100/80">
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong className="text-emerald-400">75 – 100 (Risk Düşük):</strong> Yüksek güvenlik ve güçlü kentsel altyapı.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
                <span><strong className="text-yellow-400">55 – 74 (Risk Orta):</strong> Dengeli profil, belirli kriterlerde gelişime açık.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span><strong className="text-red-400">0 – 54 veya Yüksek Suç Kategorisi (Risk Yüksek):</strong> Haritada belirgin kırmızı halka ile uyarılır.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Open Data Sources & Developer Notes */}
        <div className="space-y-5">
          <div className="rounded-3xl glass-panel border border-teal-900/70 p-6 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Kullanılan Açık Veri Kaynakları
                </h3>
                <p className="text-xs text-teal-200/70">
                  Kamuya açık istatistikler & gerçek zamanlı harita servisleri
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-teal-100/85">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">EGO Genel Müdürlüğü (Ekim 2024):</strong> Aylık
                  53.3 milyon yolcu dağılımı; M1-M4 metro hatları, Ankaray, Başkentray ve ring
                  otobüs erişim verileri.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#f3c1cd] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Statbase Güvenlik Endeksi (2012–2026):</strong>{' '}
                  Tarihsel asayiş trendleri ve 1.000 kişi başına olay yoğunluğu karşılaştırmaları.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">OpenStreetMap, Nominatim, Overpass & OSRM:</strong>{' '}
                  Harita altlığı, Ankara il sınırı doğrulaması, çevre POI katmanları (hastane,
                  park, polis, kütüphane, veteriner) ve araç/yürüyüş süre tahminleri.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl glass-panel border border-[#e8a0b2]/25 p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#e8a0b2]/15 border border-[#e8a0b2]/35 text-[#f3c1cd]">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Geliştirici Notları</h3>
                <p className="text-xs text-teal-200/70">
                  Statik sunucusuz mimari & yönetim kontrolü
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Uygulama React, TypeScript, Tailwind CSS ve Leaflet altyapısı üzerinde tamamen
              istemci taraflı çalışacak şekilde tasarlanmıştır. Dış harita ve rota sorguları
              tarayıcı belleğinde önbelleklenir; AI Mahalle Danışmanı API kotası dolduğunda veya
              anahtar tanımlı olmadığında yerel çok-kriterli eşleştirme motoruna kesintisiz geçiş
              yapar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
